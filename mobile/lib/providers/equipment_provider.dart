import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/equipment.dart';
import '../services/api_service.dart';

class EquipmentProvider with ChangeNotifier {
  List<Equipment> _equipments = [];
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  List<Equipment> get equipments => _equipments;
  bool get isLoading => _isLoading;

  Future<void> fetchEquipments() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/equipments');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _equipments = data.map((item) => Equipment.fromJson(item)).toList();
      }
    } catch (e) {
      print('Fetch equipments error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }
}
