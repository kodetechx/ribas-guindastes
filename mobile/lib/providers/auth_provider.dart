import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/operator.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  Operator? _user;
  bool _isLoading = false;
  final ApiService _apiService = ApiService();
  final _storage = const FlutterSecureStorage();

  Operator? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    print('Tentando login para: $email');

    try {
      final response = await _apiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      print('Resposta do login: ${response.statusCode}');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Login bem-sucedido, salvando token...');
        await _storage.write(key: 'jwt_token', value: data['token']);
        _user = Operator.fromJson(data['user']);
        print('Usuário carregado: ${_user?.name}');
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        print('Erro no login: ${response.body}');
      }
    } catch (e) {
      print('Erro de exceção no login: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    _user = null;
    notifyListeners();
  }

  Future<bool> tryAutoLogin() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token == null) return false;

    try {
      final response = await _apiService.get('/auth/me');
      if (response.statusCode == 200) {
        _user = Operator.fromJson(jsonDecode(response.body));
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('Auto login error: $e');
    }

    return false;
  }
}
