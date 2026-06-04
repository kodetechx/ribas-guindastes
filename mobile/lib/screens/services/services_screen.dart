import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/work_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/service.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = Provider.of<AuthProvider>(context, listen: false).user;
      if (user != null) {
        Provider.of<WorkProvider>(context, listen: false).fetchHistory(user.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final workProvider = Provider.of<WorkProvider>(context);
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Ordens de Serviço'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: workProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                if (user != null) {
                  await workProvider.fetchHistory(user.id);
                }
              },
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
                itemCount: workProvider.history.length,
                itemBuilder: (ctx, index) {
                  final service = workProvider.history[index];
                  return _buildServiceCard(context, service);
                },
              ),
            ),
    );
  }

  Widget _buildServiceCard(BuildContext context, WorkService service) {
    Color statusColor = Colors.grey;
    String statusText = 'Pendente';

    if (service.status == 'in_progress') {
      statusColor = const Color(0xFF1E3A8A);
      statusText = 'Em Andamento';
    } else if (service.status == 'finished') {
      statusColor = Colors.green;
      statusText = 'Finalizado';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE0E0E0)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    service.title,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1A1A1A)),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: Text(
                    statusText.toUpperCase(),
                    style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _buildInfoRow(Icons.business_outlined, 'Cliente', service.client),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.location_on_outlined, 'Local', service.location),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.calendar_today_outlined, 'Início', DateFormat('dd/MM/yyyy HH:mm').format(service.startDate)),
            if (service.endDate != null) ...[
              const SizedBox(height: 8),
              _buildInfoRow(Icons.check_circle_outline, 'Fim', DateFormat('dd/MM/yyyy HH:mm').format(service.endDate!)),
            ],
            const Divider(height: 24, color: Color(0xFFE0E0E0)),
            if (service.status == 'in_progress')
              ElevatedButton(
                onPressed: () => _showFinishDialog(context, service),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                child: const Text('FINALIZAR SERVIÇO'),
              )
            else if (service.status == 'pending')
              ElevatedButton(
                onPressed: () => _startService(context, service),
                child: const Text('INICIAR SERVIÇO'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF666666)),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(0xFF666666))),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 13, color: Color(0xFF1A1A1A)),
          ),
        ),
      ],
    );
  }

  void _startService(BuildContext context, WorkService service) async {
    final success = await Provider.of<WorkProvider>(context, listen: false).startWork(
      {
        'title': service.title,
        'clientId': service.clientId,
        'location': service.location,
        'equipment': service.equipmentId,
        'operators': service.operatorIds,
      },
      serviceId: service.id,
    );

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Serviço iniciado!')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Não foi possível iniciar o serviço. Verifique sua conexão.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }

  void _showFinishDialog(BuildContext context, WorkService service) {
    final notesController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        title: const Text('Finalizar Serviço', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Deseja finalizar esta ordem de serviço?'),
            const SizedBox(height: 16),
            TextField(
              controller: notesController,
              decoration: const InputDecoration(
                hintText: 'Observações finais...',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            style: TextButton.styleFrom(foregroundColor: const Color(0xFF666666)),
            child: const Text('CANCELAR'),
          ),
          ElevatedButton(
            onPressed: () async {
              final authProvider = Provider.of<AuthProvider>(context, listen: false);
              final userId = authProvider.user?.id;
              
              if (userId == null) return;

              final success = await Provider.of<WorkProvider>(context, listen: false).finishWork(
                service.id,
                {'notes': notesController.text},
                userId,
              );
              
              if (mounted) {
                if (success) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Serviço finalizado!')));
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Não foi possível finalizar o serviço. Verifique sua conexão.'),
                      backgroundColor: Colors.orange,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              minimumSize: const Size(100, 44),
            ),
            child: const Text('CONFIRMAR'),
          ),
        ],
      ),
    );
  }
}
