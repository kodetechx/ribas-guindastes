import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path_provider/path_provider.dart';

class ApiService {
  static final ApiService instance = ApiService._internal();
  factory ApiService() => instance;
  ApiService._internal();

  static String get defaultBaseUrl {
    return 'https://ribas-guindastes.onrender.com/api';
  }

  final String baseUrl = defaultBaseUrl;
  final _storage = const FlutterSecureStorage();

  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return await http
        .post(url, headers: headers, body: jsonEncode(data))
        .timeout(const Duration(seconds: 10));
  }

  Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return await http.get(url, headers: headers).timeout(const Duration(seconds: 10));
  }

  Future<http.Response> put(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return await http
        .put(url, headers: headers, body: jsonEncode(data))
        .timeout(const Duration(seconds: 10));
  }

  Future<String?> uploadImage(File file) async {
    try {
      final url = Uri.parse('$baseUrl/uploads');
      final token = await getToken();
      
      var request = http.MultipartRequest('POST', url);
      request.headers.addAll({
        if (token != null) 'Authorization': 'Bearer $token',
      });
      
      request.files.add(await http.MultipartFile.fromPath('file', file.path));
      
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['url']; // Assuming server returns { "url": "..." }
      }
    } catch (e) {
      debugPrint('Upload image error: $e');
    }
    return null;
  }

  Future<File> downloadFile(String url, String fileName) async {
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/$fileName');

    try {
      debugPrint('Iniciando download: $url');
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse(url), headers: headers);
      
      if (response.statusCode != 200) {
        throw Exception('Erro no servidor: ${response.statusCode}');
      }

      final bytes = response.bodyBytes;
      
      // Verificação básica de cabeçalho PDF (%PDF-)
      if (fileName.toLowerCase().endsWith('.pdf')) {
        if (bytes.length < 4 || 
            bytes[0] != 0x25 || bytes[1] != 0x50 || bytes[2] != 0x44 || bytes[3] != 0x46) {
          throw Exception('O arquivo baixado não é um PDF válido');
        }
      }

      await file.writeAsBytes(bytes);
      debugPrint('Download concluído: ${bytes.length} bytes');
      return file;
    } catch (e) {
      debugPrint('Erro no download: $e');
      rethrow;
    }
  }

  String getFullUrl(String path) {
    if (path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    
    // Remove /api if it's there to get the root URL
    final rootUrl = baseUrl.endsWith('/api') 
        ? baseUrl.substring(0, baseUrl.length - 4) 
        : baseUrl;
        
    return '$rootUrl${path.startsWith('/') ? '' : '/'}$path';
  }
}
