import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:open_file/open_file.dart';
import '../../providers/auth_provider.dart';
import '../../providers/document_provider.dart';
import '../../models/document.dart';
import '../../services/api_service.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  @override
  void initState() {
    super.initState();
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    if (user != null) {
      Provider.of<DocumentProvider>(context, listen: false).fetchDocuments(user.id);
    }
  }

  void _viewPdf(OperatorDocument doc) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final file = await ApiService().downloadFile(doc.fileUrl, doc.fileName);
      if (mounted) Navigator.pop(context);
      await OpenFile.open(file.path);
    } catch (e) {
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Erro ao abrir documento')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final docs = Provider.of<DocumentProvider>(context).documents;
    final isLoading = Provider.of<DocumentProvider>(context).isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Documentos'),
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                final user = Provider.of<AuthProvider>(context, listen: false).user;
                if (user != null) {
                  await Provider.of<DocumentProvider>(context, listen: false).fetchDocuments(user.id);
                }
              },
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: docs.length,
                itemBuilder: (ctx, index) {
                  final doc = docs[index];
                  return _buildDocCard(doc);
                },
              ),
            ),
    );
  }

  Widget _buildDocCard(OperatorDocument doc) {
    Color statusColor;
    String statusText;

    switch (doc.status) {
      case 'valid':
        statusColor = Colors.green;
        statusText = 'Válido';
        break;
      case 'warning':
        statusColor = Colors.orange;
        statusText = 'Próximo ao Vencimento';
        break;
      case 'expired':
        statusColor = Colors.red;
        statusText = 'Vencido';
        break;
      default:
        statusColor = Colors.grey;
        statusText = 'Indefinido';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: const Icon(Icons.picture_as_pdf, color: Colors.red, size: 40),
        title: Text(doc.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tipo: ${doc.type}'),
            if (doc.expiresAt != null) Text('Validade: ${DateFormat('dd/MM/yyyy').format(doc.expiresAt!)}'),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                border: Border.all(color: statusColor),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(statusText, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.visibility),
          onPressed: () => _viewPdf(doc),
        ),
      ),
    );
  }
}
