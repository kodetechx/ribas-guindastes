import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:open_file/open_file.dart';
import '../../providers/auth_provider.dart';
import '../../providers/document_provider.dart';
import '../../models/document.dart';
import '../../services/api_service.dart';

class DocumentsListScreen extends StatefulWidget {
  const DocumentsListScreen({super.key});

  @override
  State<DocumentsListScreen> createState() => _DocumentsListScreenState();
}

class _DocumentsListScreenState extends State<DocumentsListScreen> {
  final ApiService _apiService = ApiService();
  bool _isOpeningDocument = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = Provider.of<AuthProvider>(context, listen: false).user;
      if (user != null) {
        Provider.of<DocumentProvider>(context, listen: false).fetchDocuments(user.id, 'operator');
      }
    });
  }

  Future<void> _viewDocument(DocumentModel doc) async {
    if (_isOpeningDocument) return;

    setState(() {
      _isOpeningDocument = true;
    });

    try {
      final String fullUrl = _apiService.getFullUrl(doc.fileUrl);
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Baixando ${doc.name}...'), duration: const Duration(seconds: 1)),
      );

      final file = await _apiService.downloadFile(fullUrl, doc.fileName);
      await OpenFile.open(file.path);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao abrir documento: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isOpeningDocument = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final documentProvider = Provider.of<DocumentProvider>(context);
    final user = Provider.of<AuthProvider>(context).user;

    if (user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final nrs = documentProvider.operatorDocuments.where((doc) => 
      doc.type.startsWith('NR') || doc.type.contains('NR-')
    ).toList();
    final cnh = documentProvider.operatorDocuments.where((doc) => doc.type == 'CNH').firstOrNull;
    final others = documentProvider.operatorDocuments.where((doc) => 
      !doc.type.startsWith('NR') && !doc.type.contains('NR-') && doc.type != 'CNH'
    ).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Documentos'),
      ),
      body: Stack(
        children: [
          documentProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () => documentProvider.fetchDocuments(user.id, 'operator'),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16.0),
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Certificações NRs',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        if (nrs.isEmpty)
                          const Card(
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text('Nenhuma certificação NR registrada.'),
                            ),
                          )
                        else
                          ...nrs.map((doc) => _buildDocumentCard(
                                context,
                                doc,
                                Icons.security,
                              )),
                        const SizedBox(height: 24),
                        const Text(
                          'Habilitação',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 12),
                        if (cnh != null)
                          _buildDocumentCard(
                            context,
                            cnh,
                            Icons.drive_eta,
                          )
                        else
                          const Card(
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text('Informação de CNH não encontrada.'),
                            ),
                          ),
                        if (others.isNotEmpty) ...[
                          const SizedBox(height: 24),
                          const Text(
                            'Outros Documentos',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          ...others.map((doc) => _buildDocumentCard(
                                context,
                                doc,
                                Icons.description,
                              )),
                        ],
                      ],
                    ),
                  ),
                ),
          if (_isOpeningDocument)
            Container(
              color: Colors.black26,
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }

  Widget _buildDocumentCard(BuildContext context, DocumentModel doc, IconData icon) {
    final DateTime? expiresAt = doc.expiresAt;
    final bool isExpired = expiresAt != null && expiresAt.isBefore(DateTime.now());
    final bool isExpiringSoon = expiresAt != null &&
        expiresAt.isBefore(DateTime.now().add(const Duration(days: 30))) &&
        !isExpired;

    Color statusColor = Colors.green;
    String statusText = 'Válido';

    if (isExpired) {
      statusColor = Colors.red;
      statusText = 'Vencido';
    } else if (isExpiringSoon) {
      statusColor = Colors.orange;
      statusText = 'Vencendo em breve';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: statusColor, size: 30),
        title: Text(doc.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (expiresAt != null)
              Text('Vencimento: ${DateFormat('dd/MM/yyyy').format(expiresAt)}'),
            Text(
              statusText,
              style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.remove_red_eye_outlined),
          onPressed: () => _viewDocument(doc),
        ),
      ),
    );
  }
}

