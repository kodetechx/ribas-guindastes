import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/service.dart';
import '../services/api_service.dart';

class WorkProvider with ChangeNotifier {
  List<WorkService> _history = [];
  WorkService? _activeService;
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  List<WorkService> get history => _history;
  WorkService? get activeService => _activeService;
  bool get isLoading => _isLoading;
  bool get isWorking => _activeService != null;

  Future<void> fetchHistory() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/services');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _history = data.map((item) => WorkService.fromJson(item)).toList();
        _activeService = _history.firstWhere((s) => s.status == 'in_progress', orElse: () => throw Exception('Not found'));
      }
    } catch (e) {
      _activeService = null;
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> startWork(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/services', {
        ...data,
        'status': 'in_progress',
        'startDate': DateTime.now().toIso8601String(),
      });

      if (response.statusCode == 201 || response.statusCode == 200) {
        _activeService = WorkService.fromJson(jsonDecode(response.body));
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Start work error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> finishWork(String id, Map<String, dynamic> data) async {
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
        await fetchHistory();
        return true;
      }
    } catch (e) {
      print('Finish work error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
