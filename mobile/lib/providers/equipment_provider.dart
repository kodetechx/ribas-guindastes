import "package:flutter/foundation.dart";
import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/equipment.dart';
import '../services/api_service.dart';
import '../services/local_database_service.dart';
import '../services/connectivity_service.dart';

class EquipmentProvider with ChangeNotifier {
  List<Equipment> _equipments = [];
  bool _isLoading = false;
  final ApiService _apiService = ApiService();
  final LocalDatabaseService _localDb = LocalDatabaseService();
  final ConnectivityService _connectivity = ConnectivityService();

  List<Equipment> get equipments => _equipments;
  bool get isLoading => _isLoading;

  Future<void> fetchEquipments() async {
    _isLoading = true;
    notifyListeners();

    final bool isOnline = await _connectivity.isConnected;

    if (isOnline) {
      try {
        final response = await _apiService.get('/equipments');
        if (response.statusCode == 200) {
          final List<dynamic> data = jsonDecode(response.body);
          _equipments = data.map((item) => Equipment.fromJson(item)).toList();
          
          // Save to local database for offline use
          await _localDb.saveList(LocalDatabaseService.equipmentsBox, 'list', data);
        }
      } catch (e) {
        debugPrint('Fetch equipments error (online): $e');
        // Fallback to local data if online fetch fails
        await _loadFromLocal();
      }
    } else {
      debugPrint('Device is offline, loading equipments from local storage');
      await _loadFromLocal();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> _loadFromLocal() async {
    final List<dynamic>? localData = _localDb.getList(LocalDatabaseService.equipmentsBox, 'list');
    if (localData != null) {
      _equipments = localData.map((item) => Equipment.fromJson(Map<String, dynamic>.from(item))).toList();
    }
  }
}
