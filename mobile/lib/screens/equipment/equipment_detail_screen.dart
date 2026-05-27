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
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(equipment.name),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (equipment.imageUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: Image.network(
                      _apiService.getFullUrl(equipment.imageUrl!),
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => Container(
                        height: 200,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: const Color(0xFFE0E0E0)),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Icon(Icons.image_not_supported_outlined, size: 64, color: Colors.grey),
                      ),
                    ),
                  ),
                const SizedBox(height: 24),
                const Text(
                  'ESPECIFICAÇÕES TÉCNICAS',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
                ),
                const SizedBox(height: 10),
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
                  'STATUS DE MANUTENÇÃO',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
                ),
                const SizedBox(height: 10),
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
                  'DOCUMENTOS DO EQUIPAMENTO',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
                ),
                const SizedBox(height: 10),
                if (documentProvider.isLoading)
                  const Center(child: Padding(padding: EdgeInsets.all(24.0), child: CircularProgressIndicator()))
                else if (documentProvider.equipmentDocuments.isEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16.0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: const Color(0xFFE0E0E0)),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Nenhum documento encontrado para este equipamento.',
                      style: TextStyle(color: Color(0xFF666666), fontSize: 14),
                    ),
                  )
                else
                  ...documentProvider.equipmentDocuments.map((doc) => _buildDocumentCard(doc)),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => ChecklistScreen(selectedEquipment: equipment),
                      ),
                    );
                  },
                  child: const Text('REALIZAR CHECKLIST'),
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
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE0E0E0)),
        borderRadius: BorderRadius.circular(4),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF666666), fontSize: 14, fontWeight: FontWeight.w500)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: color ?? const Color(0xFF1A1A1A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocumentCard(DocumentModel doc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE0E0E0)),
        borderRadius: BorderRadius.circular(4),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(4),
          ),
          child: const Icon(Icons.description_outlined, color: Color(0xFF1E3A8A), size: 24),
        ),
        title: Text(
          doc.name,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF1A1A1A)),
        ),
        subtitle: Text(
          doc.type.toUpperCase(),
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF666666)),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.visibility_outlined, color: Color(0xFF1E3A8A)),
          onPressed: () => _viewDocument(doc),
        ),
      ),
    );
  }
}
