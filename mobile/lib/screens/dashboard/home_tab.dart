import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/equipment_provider.dart';
import '../../providers/document_provider.dart';
import '../../providers/work_provider.dart';
import '../../providers/checklist_provider.dart';
import '../../models/equipment.dart';
import '../../services/connectivity_service.dart';
import '../../services/api_service.dart';
import '../scanner/qr_scanner_screen.dart';
import '../checklist/checklist_screen.dart';
import '../documents/documents_list_screen.dart';
import '../services/services_screen.dart';
import '../equipment/equipment_detail_screen.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  Map<String, dynamic>? _todayChecklist;
  final ConnectivityService _connectivity = ConnectivityService();
  final ApiService _apiService = ApiService();
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _connectivity.isConnected.then((val) {
      if (mounted) setState(() => _isOnline = val);
    });
    _connectivity.connectivityStream.listen((val) {
      if (mounted) setState(() => _isOnline = val);
    });
  }

  Future<void> _loadData() async {
    final user = Provider.of<AuthProvider>(context, listen: false).user;
    if (user != null) {
      final docProvider = Provider.of<DocumentProvider>(context, listen: false);
      final workProvider = Provider.of<WorkProvider>(context, listen: false);
      final checklistProvider = Provider.of<ChecklistProvider>(context, listen: false);
      final equipmentProvider = Provider.of<EquipmentProvider>(context, listen: false);

      await Future.wait([
        docProvider.fetchDocuments(user.id, 'operator'),
        workProvider.fetchHistory(user.id),
        equipmentProvider.fetchEquipments(),
        checklistProvider.fetchTodayChecklist(user.id).then((val) {
          if (mounted) setState(() => _todayChecklist = val);
        }),
      ]);
    }
  }

  Future<void> _scanQrCode(BuildContext context) async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const QrScannerScreen()),
    );

    if (result != null && result is String && context.mounted) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final equipmentProvider = Provider.of<EquipmentProvider>(context, listen: false);
      
      // 1. Validate Operator NRs (Offline: use cached data)
      final user = authProvider.user;
      if (user != null && user.nrs != null) {
        final hasExpiredNr = user.nrs!.any((nr) => nr.expiresAt.isBefore(DateTime.now()));
        if (hasExpiredNr) {
          _showBlockingError(context, 'Bloqueio de Segurança', 'Você possui certificações NR vencidas. Procure o RH para regularização antes de operar.');
          return;
        }
      }

      // 2. Validate Equipment
      // Show loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => const Center(child: CircularProgressIndicator()),
      );

      final equipment = await equipmentProvider.fetchEquipmentById(result);
      
      if (context.mounted) Navigator.pop(context); // Close loading

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

        _showEquipmentActionDialog(context, equipment);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Equipamento não encontrado. Verifique se o QR Code está correto ou se há conexão com a internet.')),
        );
      }
    }
  }

  void _showEquipmentActionDialog(BuildContext context, Equipment equipment) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(equipment.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.info_outline, color: Color(0xFF1E3A8A)),
              title: const Text('Ver Detalhes e Documentos'),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => EquipmentDetailScreen(equipment: equipment),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.checklist, color: Colors.green),
              title: const Text('Realizar Checklist Diário'),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => ChecklistScreen(selectedEquipment: equipment),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
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
    final documentProvider = Provider.of<DocumentProvider>(context);
    final workProvider = Provider.of<WorkProvider>(context);

    final expiringCount = documentProvider.operatorDocuments.where((doc) => doc.status == 'warning').length;
    final expiredCount = documentProvider.operatorDocuments.where((doc) => doc.status == 'expired').length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Painel do Operador'),
        backgroundColor: const Color(0xFF1E3A8A),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => _scanQrCode(context),
          ),
          if (!_isOnline)
            const Padding(
              padding: EdgeInsets.only(right: 16.0),
              child: Icon(Icons.cloud_off, color: Colors.orangeAccent),
            ),
        ],
      ),
      body: Column(
        children: [
          if (!_isOnline)
            Container(
              width: double.infinity,
              color: Colors.orange.shade100,
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
              child: const Text(
                'Você está em modo offline. Algumas funções podem estar limitadas.',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.grey.shade200,
                          backgroundImage: user?.photoUrl != null 
                              ? NetworkImage(_apiService.getFullUrl(user!.photoUrl!)) 
                              : null,
                          child: user?.photoUrl == null ? const Icon(Icons.person, color: Colors.grey, size: 30) : null,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Text(
                            'Olá, ${user?.name ?? 'Operador'}!',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
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
                          Colors.blue.shade100,
                          const Color.fromARGB(255, 0, 0, 0),
                          () => _scanQrCode(context),
                        ),
                        _buildQuickAction(
                          context,
                          'Realizar Checklist',
                          Icons.checklist,
                          Colors.blue.shade100,
                          Colors.black,
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
                          Colors.blue.shade100,
                          Colors.black,
                          () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                            );
                          },
                        ),
                        _buildQuickAction(
                          context,
                          'Ordens de Serviço',
                          Icons.assignment,
                          Colors.blue.shade100,
                          Colors.black,
                          () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const ServicesScreen()),
                            );
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
                    if (workProvider.activeService != null)
                      Card(
                        color: Colors.blue.shade50,
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.blue,
                            child: Icon(Icons.play_arrow, color: Colors.white),
                          ),
                          title: const Text('Serviço em Andamento'),
                          subtitle: Text(workProvider.activeService!.title),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const ServicesScreen()),
                            );
                          },
                        ),
                      ),
                    if (_todayChecklist != null)
                      Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: _todayChecklist!['isLocal'] == true ? Colors.orange : Colors.green,
                            child: Icon(_todayChecklist!['isLocal'] == true ? Icons.cloud_upload : Icons.check, color: Colors.white),
                          ),
                          title: Text(_todayChecklist!['isLocal'] == true ? 'Checklist Salvo (Local)' : 'Checklist do Dia'),
                          subtitle: Text(_todayChecklist!['isLocal'] == true 
                            ? 'Aguardando sincronização...' 
                            : 'Realizado hoje às ${DateFormat('HH:mm').format(DateTime.parse(_todayChecklist!['createdAt']))}'),
                          trailing: const Icon(Icons.chevron_right),
                        ),
                      )
                    else
                      Card(
                        color: Colors.red.shade50,
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.red,
                            child: Icon(Icons.warning, color: Colors.white),
                          ),
                          title: const Text('Checklist não realizado'),
                          subtitle: const Text('Obrigatório para iniciar operação'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const ChecklistScreen()),
                            );
                          },
                        ),
                      ),
                    const SizedBox(height: 8),
                    if (expiredCount > 0)
                      Card(
                        color: Colors.red.shade50,
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.red,
                            child: Icon(Icons.error_outline, color: Colors.white),
                          ),
                          title: Text('$expiredCount Documento(s) Vencido(s)'),
                          subtitle: const Text('Regularize sua situação imediatamente'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                            );
                          },
                        ),
                      )
                    else if (expiringCount > 0)
                      Card(
                        color: Colors.orange.shade50,
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.orange,
                            child: Icon(Icons.warning_amber, color: Colors.white),
                          ),
                          title: Text('$expiringCount Documento(s) Vencendo'),
                          subtitle: const Text('Fique atento aos prazos de renovação'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                            );
                          },
                        ),
                      )
                    else
                      Card(
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.green,
                            child: Icon(Icons.verified, color: Colors.white),
                          ),
                          title: const Text('Documentação Regular'),
                          subtitle: const Text('Todos os seus documentos estão válidos'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
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

