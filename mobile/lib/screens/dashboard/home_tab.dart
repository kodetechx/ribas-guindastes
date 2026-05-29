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
      backgroundColor: const Color(0xFFF5F5F5), // Light background for grid/cards
      appBar: AppBar(
        title: const Text('Painel do Operador'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner_outlined, color: Colors.white),
            onPressed: () => _scanQrCode(context),
          ),
          if (!_isOnline)
            const Padding(
              padding: EdgeInsets.only(right: 16.0),
              child: Icon(Icons.wifi_off_outlined, color: Colors.orangeAccent),
            ),
        ],
      ),
      body: Column(
        children: [
          if (!_isOnline)
            Container(
              width: double.infinity,
              color: Colors.orange.shade50,
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Colors.orangeAccent, width: 1),
                ),
              ),
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.wifi_off_outlined, color: Colors.orange, size: 16),
                  SizedBox(width: 8),
                  Text(
                    'Modo Offline. Algumas funções estão limitadas.',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.orange),
                    textAlign: TextAlign.center,
                  ),
                ],
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
                    // Profile section in a clean container
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: const Color(0xFFE0E0E0), width: 1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundColor: const Color(0xFFE0E0E0),
                            backgroundImage: user?.photoUrl != null 
                                ? NetworkImage(_apiService.getFullUrl(user!.photoUrl!)) 
                                : null,
                            child: user?.photoUrl == null ? const Icon(Icons.person_outline, color: Color(0xFF666666), size: 28) : null,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Olá, ${user?.name ?? 'Operador'}',
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1A1A1A)),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  user?.email ?? '',
                                  style: const TextStyle(fontSize: 13, color: Color(0xFF666666)),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    // Grid of actions
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.25,
                      children: [
                        _buildQuickAction(
                          context,
                          'Escanear QR',
                          Icons.qr_code_scanner_outlined,
                          () => _scanQrCode(context),
                        ),
                        _buildQuickAction(
                          context,
                          'Checklist',
                          Icons.assignment_outlined,
                          () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const ChecklistScreen()),
                            );
                          },
                        ),
                        _buildQuickAction(
                          context,
                          'Documentos',
                          Icons.description_outlined,
                          () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                            );
                          },
                        ),
                        _buildQuickAction(
                          context,
                          'Serviços',
                          Icons.build_outlined,
                          () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (context) => const ServicesScreen()),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'STATUS DA OPERAÇÃO',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
                    ),
                    const SizedBox(height: 10),
                    
                    // Active service
                    if (workProvider.activeService != null) ...[
                      _buildStatusCard(
                        context,
                        title: 'Serviço em Andamento',
                        subtitle: workProvider.activeService!.title,
                        icon: Icons.play_circle_outline,
                        iconColor: const Color(0xFF1E3A8A),
                        borderColor: const Color(0xFF1E3A8A),
                        bgColor: const Color(0xFFEFF6FF),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const ServicesScreen()),
                          );
                        },
                      ),
                      const SizedBox(height: 10),
                    ],
                    
                    // Checklist Status
                    if (_todayChecklist != null)
                      _buildStatusCard(
                        context,
                        title: _todayChecklist!['isLocal'] == true ? 'Checklist Salvo (Local)' : 'Checklist Realizado',
                        subtitle: _todayChecklist!['isLocal'] == true 
                            ? 'Aguardando conexão para sincronização...' 
                            : 'Realizado hoje às ${DateFormat('HH:mm').format(DateTime.parse(_todayChecklist!['createdAt']))}',
                        icon: _todayChecklist!['isLocal'] == true ? Icons.cloud_upload_outlined : Icons.check_circle_outline,
                        iconColor: _todayChecklist!['isLocal'] == true ? Colors.orange : Colors.green,
                        borderColor: _todayChecklist!['isLocal'] == true ? Colors.orange.shade300 : Colors.green.shade300,
                        bgColor: _todayChecklist!['isLocal'] == true ? Colors.orange.shade50 : Colors.green.shade50,
                      )
                    else
                      _buildStatusCard(
                        context,
                        title: 'Checklist não realizado',
                        subtitle: 'Obrigatório para iniciar a operação',
                        icon: Icons.error_outline,
                        iconColor: Colors.red,
                        borderColor: Colors.red.shade300,
                        bgColor: Colors.red.shade50,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const ChecklistScreen()),
                          );
                        },
                      ),
                    const SizedBox(height: 10),

                    // Document Status
                    if (expiredCount > 0)
                      _buildStatusCard(
                        context,
                        title: '$expiredCount Documento(s) Vencido(s)',
                        subtitle: 'Regularize sua situação imediatamente',
                        icon: Icons.cancel_outlined,
                        iconColor: Colors.red,
                        borderColor: Colors.red.shade300,
                        bgColor: Colors.red.shade50,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                          );
                        },
                      )
                    else if (expiringCount > 0)
                      _buildStatusCard(
                        context,
                        title: '$expiringCount Documento(s) Vencendo',
                        subtitle: 'Fique atento aos prazos de renovação',
                        icon: Icons.warning_amber_outlined,
                        iconColor: Colors.orange,
                        borderColor: Colors.orange.shade300,
                        bgColor: Colors.orange.shade50,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                          );
                        },
                      )
                    else
                      _buildStatusCard(
                        context,
                        title: 'Documentação Regular',
                        subtitle: 'Todos os seus certificados estão válidos',
                        icon: Icons.verified_outlined,
                        iconColor: Colors.green,
                        borderColor: Colors.green.shade300,
                        bgColor: Colors.green.shade50,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (context) => const DocumentsListScreen()),
                          );
                        },
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

  Widget _buildQuickAction(BuildContext context, String title, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE0E0E0), width: 1),
          borderRadius: BorderRadius.circular(4),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: const Color(0xFF1E3A8A)),
            const SizedBox(height: 10),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF1A1A1A)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required Color borderColor,
    required Color bgColor,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgColor,
          border: Border.all(color: borderColor, width: 1),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Row(
          children: [
            Icon(icon, color: iconColor, size: 24),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: iconColor),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 12, color: iconColor.withValues(alpha: 0.8)),
                  ),
                ],
              ),
            ),
            if (onTap != null)
              Icon(Icons.chevron_right, color: iconColor, size: 20),
          ],
        ),
      ),
    );
  }
}

