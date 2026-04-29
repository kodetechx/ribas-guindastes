import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ChecklistProvider with ChangeNotifier {
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  bool get isLoading => _isLoading;

  Future<bool> submitChecklist(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/checklists', data);
      _isLoading = false;
      notifyListeners();
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print('Submit checklist error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> checkToday(String equipmentId) async {
    try {
      final response = await _apiService.get('/checklists/equipment/$equipmentId/today');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['exists'] ?? false;
      }
    } catch (e) {
      print('Check today error: $e');
    }
    return false;
  }
}
