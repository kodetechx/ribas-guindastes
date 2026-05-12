import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/document.dart';
import '../services/api_service.dart';
import '../services/local_database_service.dart';
import '../services/connectivity_service.dart';

class DocumentProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final LocalDatabaseService _localDb = LocalDatabaseService();
  final ConnectivityService _connectivity = ConnectivityService();
  
  List<DocumentModel> _operatorDocuments = [];
  List<DocumentModel> _equipmentDocuments = [];
  bool _isLoading = false;

  List<DocumentModel> get operatorDocuments => [..._operatorDocuments];
  List<DocumentModel> get equipmentDocuments => [..._equipmentDocuments];
  bool get isLoading => _isLoading;

  Future<void> fetchDocuments(String ownerId, String category) async {
    _isLoading = true;
    notifyListeners();

    final bool isOnline = await _connectivity.isConnected;

    if (isOnline) {
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

          // Cache locally
          await _localDb.saveList(LocalDatabaseService.settingsBox, 'docs_${category}_$ownerId', data);
        }
      } catch (e) {
        debugPrint('Error fetching documents (online): $e');
        await _loadFromLocal(ownerId, category);
      }
    } else {
      await _loadFromLocal(ownerId, category);
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> _loadFromLocal(String ownerId, String category) async {
    final List<dynamic>? localData = _localDb.getList(LocalDatabaseService.settingsBox, 'docs_${category}_$ownerId');
    if (localData != null) {
      final docs = localData.map((item) => DocumentModel.fromJson(Map<String, dynamic>.from(item))).toList();
      if (category == 'operator') {
        _operatorDocuments = docs;
      } else {
        _equipmentDocuments = docs;
      }
    }
  }
}
