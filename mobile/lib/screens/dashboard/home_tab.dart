import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/equipment_provider.dart';
import '../scanner/qr_scanner_screen.dart';
import '../checklist/checklist_screen.dart';
import '../documents/documents_list_screen.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key});

  Future<void> _scanQrCode(BuildContext context) async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const QrScannerScreen()),
    );

    if (result != null && result is String && context.mounted) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final equipmentProvider = Provider.of<EquipmentProvider>(context, listen: false);
      
      // 1. Validate Operator NRs
      final user = authProvider.user;
      if (user != null && user.nrs != null) {
        final hasExpiredNr = user.nrs!.any((nr) => nr.expiresAt.isBefore(DateTime.now()));
        if (hasExpiredNr) {
          _showBlockingError(context, 'Bloqueio de Segurança', 'Você possui certificações NR vencidas. Procure o RH para regularização antes de operar.');
          return;
        }
      }

      // 2. Validate Equipment
      final equipment = equipmentProvider.equipments.cast<dynamic>().firstWhere(
        (e) => e.id == result,
        orElse: () => null,
      );

      if (equipment != null) {
        // Check Maintenance
        if (equipment.nextMaintenance != null && equipment.nextMaintenance!.isBefore(DateTime.now())) {
          _showBlockingError(context, 'Equipamento Bloqueado', 'Este equipamento está com manutenção vencida e não pode ser operado.');
          return;
        }

        if (equipment.status == 'blocked') {
          _showBlockingError(context, 'Equipamento Bloqueado', 'Este equipamento está bloqueado para uso no sistema.');
          return;
        }

        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => ChecklistScreen(selectedEquipment: equipment),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Equipamento não encontrado ou QR Code inválido')),
        );
      }
    }
  }

  void _showBlockingError(BuildContext context, String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.red),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(color: Colors.red)),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('ENTENDIDO'),
          ),
        ],
      ),
    );
  }

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
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => _scanQrCode(context),
          ),
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
                  'Escanear QR Code',
                  Icons.qr_code_scanner,
                  const Color(0xFFFFD700).withOpacity(0.2),
                  const Color(0xFFB8860B),
                  () => _scanQrCode(context),
                ),
                _buildQuickAction(
                  context,
                  'Realizar Checklist',
                  Icons.checklist,
                  Colors.blue.shade100,
                  Colors.blue,
                  () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const ChecklistScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  context,
                  'Consultar Documentos',
                  Icons.description,
                  Colors.orange.shade100,
                  Colors.orange.shade800,
                  () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                    );
                  },
                ),
                _buildQuickAction(
                  context,
                  'Meu Perfil',
                  Icons.person,
                  Colors.grey.shade200,
                  Colors.grey.shade700,
                  () {
                    // Profile is in the bottom bar, but we can also navigate here
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
