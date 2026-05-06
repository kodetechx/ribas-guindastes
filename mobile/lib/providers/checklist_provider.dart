import "package:flutter/foundation.dart";
import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ChecklistProvider with ChangeNotifier {
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  bool get isLoading => _isLoading;

  Future<Map<String, dynamic>> submitChecklist(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.post('/checklists', data);
      _isLoading = false;
      notifyListeners();
      
      final responseData = jsonDecode(response.body);
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        return {'success': true, 'message': 'Checklist enviado com sucesso!'};
      } else {
        return {
          'success': false, 
          'message': responseData['message'] ?? 'Erro desconhecido ao enviar checklist'
        };
      }
    } catch (e) {
      debugPrint('Submit checklist error: $e');
      _isLoading = false;
      notifyListeners();
      return {'success': false, 'message': 'Falha na comunicação com o servidor: $e'};
    }
  }

  Future<bool> checkToday(String equipmentId) async {
    try {
      final response = await _apiService.get('/checklists/equipment/$equipmentId/today');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Server returns { hasChecklist: boolean }
        return data['hasChecklist'] ?? false;
      }
    } catch (e) {
      debugPrint('Check today error: $e');
    }
    return false;
  }
}
