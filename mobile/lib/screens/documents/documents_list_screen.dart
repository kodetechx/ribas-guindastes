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
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Meus Documentos'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          documentProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () => documentProvider.fetchDocuments(user.id, 'operator'),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'CERTIFICAÇÕES NRS',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
                        ),
                        const SizedBox(height: 10),
                        if (nrs.isEmpty)
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16.0),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: const Color(0xFFE0E0E0)),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Nenhuma certificação NR registrada.',
                              style: TextStyle(color: Color(0xFF666666), fontSize: 14),
                            ),
                          )
                        else
                          ...nrs.map((doc) => _buildDocumentCard(
                                context,
                                doc,
                                Icons.security_outlined,
                              )),
                        const SizedBox(height: 24),
                        const Text(
                          'HABILITAÇÃO',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
                        ),
                        const SizedBox(height: 10),
                        if (cnh != null)
                          _buildDocumentCard(
                            context,
                            cnh,
                            Icons.badge_outlined,
                          )
                        else
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16.0),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: const Color(0xFFE0E0E0)),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Informação de CNH não encontrada.',
                              style: TextStyle(color: Color(0xFF666666), fontSize: 14),
                            ),
                          ),
                        if (others.isNotEmpty) ...[
                          const SizedBox(height: 24),
                          const Text(
                            'OUTROS DOCUMENTOS',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
                          ),
                          const SizedBox(height: 10),
                          ...others.map((doc) => _buildDocumentCard(
                                context,
                                doc,
                                Icons.description_outlined,
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

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE0E0E0)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Icon(icon, color: statusColor, size: 24),
        ),
        title: Text(
          doc.name,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF1A1A1A)),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (expiresAt != null)
                Text(
                  'Vencimento: ${DateFormat('dd/MM/yyyy').format(expiresAt)}',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF666666)),
                ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(2),
                ),
                child: Text(
                  statusText.toUpperCase(),
                  style: TextStyle(color: statusColor, fontWeight: FontWeight.w700, fontSize: 10, letterSpacing: 0.5),
                ),
              ),
            ],
          ),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.visibility_outlined, color: Color(0xFF1E3A8A)),
          onPressed: () => _viewDocument(doc),
        ),
      ),
    );
  }
}

