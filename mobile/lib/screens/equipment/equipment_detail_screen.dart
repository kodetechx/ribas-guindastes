import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:open_file/open_file.dart';
import '../../models/equipment.dart';
import '../../models/document.dart';
import '../../providers/document_provider.dart';
import '../../services/api_service.dart';
import '../checklist/checklist_screen.dart';

class EquipmentDetailScreen extends StatefulWidget {
  final Equipment equipment;

  const EquipmentDetailScreen({super.key, required this.equipment});

  @override
  State<EquipmentDetailScreen> createState() => _EquipmentDetailScreenState();
}

class _EquipmentDetailScreenState extends State<EquipmentDetailScreen> {
  final ApiService _apiService = ApiService();
  bool _isOpeningDocument = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DocumentProvider>(context, listen: false)
          .fetchDocuments(widget.equipment.id, 'equipment');
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
    final equipment = widget.equipment;

    return Scaffold(
      appBar: AppBar(
        title: Text(equipment.name),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (equipment.imageUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      _apiService.getFullUrl(equipment.imageUrl!),
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => Container(
                        height: 200,
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.image_not_supported, size: 64, color: Colors.grey),
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                const Text(
                  'Especificações Técnicas',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _buildInfoCard([
                  _buildDetailRow('Marca', equipment.brand),
                  _buildDetailRow('Modelo', equipment.equipmentModel),
                  _buildDetailRow('Ano', equipment.year.toString()),
                  _buildDetailRow('Nº de Série', equipment.serialNumber),
                  if (equipment.capacity != null)
                    _buildDetailRow('Capacidade', '${equipment.capacity} t'),
                ]),
                const SizedBox(height: 24),
                const Text(
                  'Status de Manutenção',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _buildInfoCard([
                  _buildDetailRow(
                    'Última Manutenção',
                    equipment.lastMaintenance != null
                        ? DateFormat('dd/MM/yyyy').format(equipment.lastMaintenance!)
                        : 'Não registrada',
                  ),
                  _buildDetailRow(
                    'Próxima Manutenção',
                    equipment.nextMaintenance != null
                        ? DateFormat('dd/MM/yyyy').format(equipment.nextMaintenance!)
                        : 'Não definida',
                    color: _isMaintenanceExpired(equipment.nextMaintenance) ? Colors.red : null,
                  ),
                ]),
                const SizedBox(height: 24),
                const Text(
                  'Documentos do Equipamento',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                if (documentProvider.isLoading)
                  const Center(child: Padding(padding: EdgeInsets.all(24.0), child: CircularProgressIndicator()))
                else if (documentProvider.equipmentDocuments.isEmpty)
                  const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('Nenhum documento encontrado para este equipamento.'),
                    ),
                  )
                else
                  ...documentProvider.equipmentDocuments.map((doc) => _buildDocumentCard(doc)),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (context) => ChecklistScreen(selectedEquipment: equipment),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: const Color(0xFF1E3A8A),
                    ),
                    child: const Text(
                      'REALIZAR CHECKLIST',
                      style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
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

  bool _isMaintenanceExpired(DateTime? next) {
    if (next == null) return false;
    return next.isBefore(DateTime.now());
  }

  Widget _buildInfoCard(List<Widget> children) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(children: children),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: color ?? const Color(0xFF1A1A1A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentCard(DocumentModel doc) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: const Icon(Icons.description, color: Color(0xFF1E3A8A), size: 30),
        title: Text(doc.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(doc.type, style: const TextStyle(fontSize: 12)),
        trailing: IconButton(
          icon: const Icon(Icons.remove_red_eye_outlined),
          onPressed: () => _viewDocument(doc),
        ),
      ),
    );
  }
}
