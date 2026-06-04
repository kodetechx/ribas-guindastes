import "package:flutter/foundation.dart";
import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/service.dart';
import '../services/api_service.dart';
import '../services/local_database_service.dart';
import '../services/connectivity_service.dart';

class WorkProvider with ChangeNotifier {
  List<WorkService> _history = [];
  WorkService? _activeService;
  bool _isLoading = false;
  final ApiService _apiService = ApiService();
  final LocalDatabaseService _localDb = LocalDatabaseService();
  final ConnectivityService _connectivity = ConnectivityService();

  List<WorkService> get history => _history;
  WorkService? get activeService => _activeService;
  bool get isLoading => _isLoading;
  bool get isWorking => _activeService != null;

  Future<void> fetchHistory(String operatorId) async {
    _isLoading = true;
    notifyListeners();

    final bool isOnline = await _connectivity.isConnected;

    if (isOnline) {
      try {
        final response = await _apiService.get('/services/operator/$operatorId');
        if (response.statusCode == 200) {
          final List<dynamic> data = jsonDecode(response.body);
          _history = data.map((item) => WorkService.fromJson(item)).toList();
          
          try {
            _activeService = _history.firstWhere((s) => s.status == 'in_progress');
          } catch (_) {
            _activeService = null;
          }

          // Cache locally
          await _localDb.saveList(LocalDatabaseService.servicesBox, 'history_$operatorId', data);
        }
      } catch (e) {
        debugPrint('Fetch history error (online): $e');
        await _loadFromLocal(operatorId);
      }
    } else {
      await _loadFromLocal(operatorId);
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> _loadFromLocal(String operatorId) async {
    final List<dynamic>? localData = _localDb.getList(LocalDatabaseService.servicesBox, 'history_$operatorId');
    if (localData != null) {
      _history = localData.map((item) => WorkService.fromJson(Map<String, dynamic>.from(item))).toList();
      try {
        _activeService = _history.firstWhere((s) => s.status == 'in_progress');
      } catch (_) {
        _activeService = null;
      }
    }
  }

  Future<bool> startWork(Map<String, dynamic> data, {String? serviceId}) async {
    final bool isOnline = await _connectivity.isConnected;
    if (!isOnline) return false;

    _isLoading = true;
    notifyListeners();

    try {
      final body = {
        ...data,
        'status': 'in_progress',
        'startDate': DateTime.now().toIso8601String(),
      };

      // Ensure equipment is sent as equipments array if present
      if (body.containsKey('equipment')) {
        body['equipments'] = [body['equipment']];
        body.remove('equipment');
      }

      final response = serviceId != null
          ? await _apiService.put('/services/$serviceId', body)
          : await _apiService.post('/services', body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        _activeService = WorkService.fromJson(jsonDecode(response.body));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Start work error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> finishWork(String id, Map<String, dynamic> data, String operatorId) async {
    final bool isOnline = await _connectivity.isConnected;
    if (!isOnline) {
      debugPrint('Cannot finish work while offline');
      return false;
    }

    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.put('/services/$id', {
        ...data,
        'status': 'finished',
        'endDate': DateTime.now().toIso8601String(),
      });

      if (response.statusCode == 200) {
        _activeService = null;
        await fetchHistory(operatorId);
        return true;
      }
    } catch (e) {
      debugPrint('Finish work error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
