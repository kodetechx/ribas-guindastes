import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/document.dart';
import '../services/api_service.dart';

class DocumentProvider with ChangeNotifier {
  List<OperatorDocument> _documents = [];
  bool _isLoading = false;
  final ApiService _apiService = ApiService();

  List<OperatorDocument> get documents => _documents;
  bool get isLoading => _isLoading;

  Future<void> fetchDocuments(String ownerId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/documents/operator/$ownerId');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        _documents = data.map((item) => OperatorDocument.fromJson(item)).toList();
      }
    } catch (e) {
      print('Fetch documents error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }
}
