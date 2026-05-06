import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../models/operator.dart';

class DocumentsListScreen extends StatelessWidget {
  const DocumentsListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Documentos'),
      ),
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Certificações NRs',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (user.nrs == null || user.nrs!.isEmpty)
                    const Text('Nenhuma certificação registrada.')
                  else
                    ...user.nrs!.map((nr) => _buildDocumentCard(
                          context,
                          'NR-${nr.type}',
                          nr.expiresAt,
                          Icons.security,
                        )),
                  const SizedBox(height: 24),
                  const Text(
                    'Habilitação',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (user.cnh != null)
                    _buildDocumentCard(
                      context,
                      'CNH - Categoria ${user.cnh!.category}',
                      user.cnh!.expiresAt,
                      Icons.drive_eta,
                    )
                  else
                    const Text('Informação de CNH não encontrada.'),
                ],
              ),
            ),
    );
  }

  Widget _buildDocumentCard(BuildContext context, String title, DateTime expiresAt, IconData icon) {
    final bool isExpired = expiresAt.isBefore(DateTime.now());
    final bool isExpiringSoon = expiresAt.isBefore(DateTime.now().add(const Duration(days: 30))) && !isExpired;

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
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Vencimento: ${DateFormat('dd/MM/yyyy').format(expiresAt)}'),
            Text(
              statusText,
              style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.remove_red_eye_outlined),
          onPressed: () {
            // Logic to view PDF or image
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Visualização de documento em desenvolvimento')),
            );
          },
        ),
      ),
    );
  }
}
