import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/document.dart';
import '../services/api_service.dart';

class DocumentProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<DocumentModel> _operatorDocuments = [];
  List<DocumentModel> _equipmentDocuments = [];
  bool _isLoading = false;

  List<DocumentModel> get operatorDocuments => [..._operatorDocuments];
  List<DocumentModel> get equipmentDocuments => [..._equipmentDocuments];
  bool get isLoading => _isLoading;

  Future<void> fetchDocuments(String ownerId, String category) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.get('/documents/$category/$ownerId');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final docs = data.map((json) => DocumentModel.fromJson(json)).toList();
        
        if (category == 'operator') {
          _operatorDocuments = docs;
        } else {
          _equipmentDocuments = docs;
        }
      } else {
        if (category == 'operator') _operatorDocuments = [];
        else _equipmentDocuments = [];
        debugPrint('Failed to load documents: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error fetching documents: $e');
      if (category == 'operator') _operatorDocuments = [];
      else _equipmentDocuments = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
