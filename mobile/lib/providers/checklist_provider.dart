import "package:flutter/foundation.dart";
import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/local_database_service.dart';
import '../services/connectivity_service.dart';
import '../models/checklist_template.dart';

class ChecklistProvider with ChangeNotifier {
  bool _isLoading = false;
  final ApiService _apiService = ApiService();
  final LocalDatabaseService _localDb = LocalDatabaseService();
  final ConnectivityService _connectivity = ConnectivityService();

  bool get isLoading => _isLoading;

  ChecklistProvider() {
    // Start listening to connectivity changes to trigger sync
    _connectivity.connectivityStream.listen((isOnline) {
      if (isOnline) {
        syncPendingChecklists();
      }
    });
  }

  Future<ChecklistTemplate?> fetchTemplate(String templateId) async {
    final bool isOnline = await _connectivity.isConnected;
    
    if (isOnline) {
      try {
        final response = await _apiService.get('/checklist-templates/$templateId');
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          return ChecklistTemplate.fromJson(data);
        }
      } catch (e) {
        debugPrint('Fetch template error: $e');
      }
    }
    return null;
  }

  Future<Map<String, dynamic>> submitChecklist(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    final bool isOnline = await _connectivity.isConnected;

    if (isOnline) {
      try {
        final response = await _apiService.post('/checklists', data);
        _isLoading = false;
        notifyListeners();
        
        if (response.statusCode == 201 || response.statusCode == 200) {
          return {'success': true, 'message': 'Checklist enviado com sucesso!'};
        } else {
          final responseData = jsonDecode(response.body);
          // If server returns an error but it's not a validation error, we might want to queue it
          // but for Ribas rules (blocking), we should show the error.
          return {
            'success': false, 
            'message': responseData['message'] ?? 'Erro ao enviar checklist'
          };
        }
      } catch (e) {
        debugPrint('Submit checklist error (online): $e');
        // If it's a network timeout/error even though we thought we were online
        await _queueChecklist(data);
        _isLoading = false;
        notifyListeners();
        return {'success': true, 'message': 'Checklist salvo localmente (sem sinal). Será enviado automaticamente.'};
      }
    } else {
      debugPrint('Device is offline, queuing checklist');
      await _queueChecklist(data);
      _isLoading = false;
      notifyListeners();
      return {'success': true, 'message': 'Checklist salvo localmente (offline). Será enviado quando houver sinal.'};
    }
  }

  Future<void> _queueChecklist(Map<String, dynamic> data) async {
    await _localDb.addToQueue(LocalDatabaseService.checklistQueueBox, {
      ...data,
      'queuedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> syncPendingChecklists() async {
    final List<dynamic> queue = _localDb.getQueue(LocalDatabaseService.checklistQueueBox);
    if (queue.isEmpty) return;

    debugPrint('Syncing ${queue.length} pending checklists...');

    // We process the queue. If one fails with a blocking rule, we might need to handle it.
    // For now, simple retry.
    for (int i = 0; i < queue.length; i++) {
      final item = Map<String, dynamic>.from(queue[i]);
      try {
        final response = await _apiService.post('/checklists', item);
        if (response.statusCode == 201 || response.statusCode == 200) {
          await _localDb.removeFromQueue(LocalDatabaseService.checklistQueueBox, i);
          debugPrint('Checklist synced successfully');
        } else {
          debugPrint('Failed to sync checklist: ${response.body}');
          // If it's a 400 error (business rule), we might want to remove it or alert the user
          // For now, we'll keep it in queue to avoid data loss.
        }
      } catch (e) {
        debugPrint('Error syncing checklist: $e');
        break; // Stop syncing if network fails again
      }
    }
  }

  Future<bool> checkToday(String equipmentId) async {
    final bool isOnline = await _connectivity.isConnected;
    if (isOnline) {
      try {
        final response = await _apiService.get('/checklists/equipment/$equipmentId/today');
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          return data['hasChecklist'] ?? false;
        }
      } catch (e) {
        debugPrint('Check today error: $e');
      }
    }
    
    // Fallback: Check local queue
    final List<dynamic> queue = _localDb.getQueue(LocalDatabaseService.checklistQueueBox);
    return queue.any((item) => item['equipment'] == equipmentId);
  }

  Future<Map<String, dynamic>?> fetchTodayChecklist(String operatorId) async {
    final bool isOnline = await _connectivity.isConnected;
    if (isOnline) {
      try {
        final response = await _apiService.get('/checklists/operator/$operatorId/today');
        if (response.statusCode == 200) {
          return jsonDecode(response.body);
        }
      } catch (e) {
        debugPrint('Fetch today checklist error: $e');
      }
    }
    
    // Fallback: Check local queue
    final List<dynamic> queue = _localDb.getQueue(LocalDatabaseService.checklistQueueBox);
    final localItem = queue.firstWhere(
      (item) => item['operator'] == operatorId, 
      orElse: () => null
    );
    
    if (localItem != null) {
      return {
        ...localItem,
        'createdAt': localItem['queuedAt'],
        'isLocal': true,
      };
    }
    
    return null;
  }
}
