import 'dart:io';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_pdfviewer/pdfviewer.dart';
import 'package:photo_view/photo_view.dart';
import 'package:path_provider/path_provider.dart';
import '../../services/api_service.dart';

class DocumentViewerScreen extends StatefulWidget {
  final String url;
  final String title;
  final bool isPdf;

  const DocumentViewerScreen({
    super.key,
    required this.url,
    required this.title,
    this.isPdf = true,
  });

  @override
  State<DocumentViewerScreen> createState() => _DocumentViewerScreenState();
}

class _DocumentViewerScreenState extends State<DocumentViewerScreen> {
  final ApiService _apiService = ApiService();
  File? _localFile;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _prepareDocument();
  }

  Future<void> _prepareDocument() async {
    try {
      final String fullUrl = _apiService.getFullUrl(widget.url);
      // Create a unique filename based on the URL to avoid cache collisions
      final String fileName = widget.url.split('/').last;
      
      // Download to temporary directory
      final file = await _apiService.downloadFile(fullUrl, fileName);
      
      if (!await file.exists() || await file.length() == 0) {
        throw Exception('O arquivo baixado está vazio ou não existe.');
      }

      if (mounted) {
        setState(() {
          _localFile = file;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Erro no _prepareDocument: $e');
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceFirst('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Carregando documento...', style: TextStyle(color: Color(0xFF666666))),
          ],
        ),
      );
    }

    if (_errorMessage != null || _localFile == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                _errorMessage ?? 'Erro desconhecido ao carregar arquivo',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _errorMessage = null;
                  });
                  _prepareDocument();
                },
                child: const Text('TENTAR NOVAMENTE'),
              ),
            ],
          ),
        ),
      );
    }

    if (widget.isPdf) {
      return SfPdfViewer.file(
        _localFile!,
        onDocumentLoadFailed: (details) {
          setState(() {
            _errorMessage = 'Erro ao renderizar PDF: ${details.description}';
          });
        },
      );
    } else {
      return PhotoView(
        imageProvider: FileImage(_localFile!),
        backgroundDecoration: const BoxDecoration(color: Colors.white),
        loadingBuilder: (context, event) => const Center(child: CircularProgressIndicator()),
      );
    }
  }
}
