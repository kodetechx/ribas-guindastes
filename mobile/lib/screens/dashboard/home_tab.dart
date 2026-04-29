import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Painel do Operador'),
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Olá, ${user?.name ?? 'Operador'}!',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('O que você deseja fazer hoje?'),
            const SizedBox(height: 24),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              children: [
                _buildQuickAction(
                  context,
                  'Realizar Checklist',
                  Icons.checklist,
                  Colors.blue.shade100,
                  Colors.blue,
                  () {
                    // Navigate to checklist
                  },
                ),
                _buildQuickAction(
                  context,
                  'Meus Documentos',
                  Icons.description,
                  Colors.orange.shade100,
                  Colors.orange,
                  () {
                    // Navigate to documents
                  },
                ),
                _buildQuickAction(
                  context,
                  'Iniciar Trabalho',
                  Icons.play_circle_outline,
                  Colors.green.shade100,
                  Colors.green,
                  () {
                    // Navigate to work
                  },
                ),
                _buildQuickAction(
                  context,
                  'Ver Veículos',
                  Icons.local_shipping,
                  Colors.purple.shade100,
                  Colors.purple,
                  () {
                    // Navigate to vehicles
                  },
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              'Status Atual',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.green,
                  child: Icon(Icons.check, color: Colors.white),
                ),
                title: const Text('Checklist do Dia'),
                subtitle: const Text('Realizado hoje às 07:30'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.orange,
                  child: Icon(Icons.warning_amber, color: Colors.white),
                ),
                title: const Text('Documentos Vencendo'),
                subtitle: const Text('NR-11 vence em 15 dias'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickAction(BuildContext context, String title, IconData icon, Color bgColor, Color iconColor, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: iconColor),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
