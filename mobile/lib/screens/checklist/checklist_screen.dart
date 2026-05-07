import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:signature/signature.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/equipment_provider.dart';
import '../../providers/checklist_provider.dart';
import '../../models/equipment.dart';
import '../../services/api_service.dart';
import '../dashboard/dashboard_screen.dart';

class ChecklistScreen extends StatefulWidget {
  final Equipment? selectedEquipment;
  const ChecklistScreen({super.key, this.selectedEquipment});

  @override
  State<ChecklistScreen> createState() => _ChecklistScreenState();
}

class _ChecklistScreenState extends State<ChecklistScreen> {
  Equipment? _currentEquipment;
  final TextEditingController _notesController = TextEditingController();
  final SignatureController _signatureController = SignatureController(
    penStrokeWidth: 3,
    penColor: Colors.black,
    exportBackgroundColor: Colors.white,
  );

  final List<Map<String, dynamic>> _checkItems = [
    {
      'label': 'Nível de óleo do motor',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': false
    },
    {
      'label': 'Nível de líquido de arrefecimento',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': false
    },
    {
      'label': 'Estado dos pneus / lagartas',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': true
    },
    {
      'label': 'Funcionamento dos freios',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': false
    },
    {
      'label': 'Iluminação e sinalização',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': true
    },
    {
      'label': 'Dispositivos de segurança (botão de emergência, etc.)',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': true
    },
    {
      'label': 'Integridade estrutural (trincas, vazamentos)',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': true
    },
    {
      'label': 'Painel de instrumentos',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': true
    },
    {
      'label': 'Sinal sonoro de ré',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': false
    },
    {
      'label': 'Extintor de incêndio',
      'status': 'ok',
      'controller': TextEditingController(),
      'photo': null,
      'hasPhoto': true
    },
  ];

  @override
  void initState() {
    super.initState();
    _currentEquipment = widget.selectedEquipment;
    Provider.of<EquipmentProvider>(context, listen: false).fetchEquipments();
  }

  @override
  void dispose() {
    _signatureController.dispose();
    _notesController.dispose();
    for (var item in _checkItems) {
      item['controller'].dispose();
    }
    super.dispose();
  }

  Future<void> _pickImage(int index) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera, imageQuality: 50);

    if (image != null) {
      setState(() {
        _checkItems[index]['photo'] = File(image.path);
      });
    }
  }

  void _submit() async {
    if (_currentEquipment == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Selecione um veículo')));
      return;
    }

    if (_signatureController.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor, assine o checklist')));
      return;
    }

    final apiService = ApiService();
    
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(child: CircularProgressIndicator()),
    );

    try {
      // 1. Upload item photos and build items list
      final List<Map<String, dynamic>> itemsToSubmit = [];
      
      for (var item in _checkItems) {
        String? photoUrl;
        if (item['photo'] != null) {
          photoUrl = await apiService.uploadImage(item['photo']);
        }
        
        itemsToSubmit.add({
          'label': item['label'],
          'status': item['status'],
          'observation': item['controller'].text,
          'photoUrl': photoUrl,
        });
      }

      // 2. Submit checklist (signature is just a flag, no URL needed)
      final result = await Provider.of<ChecklistProvider>(context, listen: false).submitChecklist({
        'equipment': _currentEquipment!.id,
        'items': itemsToSubmit,
        'notes': _notesController.text,
        'isApproved': _checkItems.every((i) => i['status'] != 'not_ok'),
        // 'signatureUrl': signatureUrl, // Removed as requested
      });

      if (mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        
        if (result['success']) {
          _showSuccessDialog();
        } else {
          // Show specific error from server
          _showErrorDialog(result['message']);
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        _showErrorDialog(e.toString());
      }
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Column(
          children: [
            Icon(Icons.check_circle_outline, color: Colors.green, size: 64),
            SizedBox(height: 16),
            Text('Checklist Enviado!', style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'O checklist foi registrado com sucesso. Você já pode operar o equipamento.',
          textAlign: TextAlign.center,
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop(); // Close dialog
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (context) => const DashboardScreen()),
                  (route) => false,
                );
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              child: const Text('VOLTAR PARA O INÍCIO', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red),
            SizedBox(width: 8),
            Text('Bloqueio de Segurança'),
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
    final equipments = Provider.of<EquipmentProvider>(context).equipments;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checklist Diário'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Equipamento', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
            const SizedBox(height: 8),
            DropdownButtonFormField<Equipment>(
              value: _currentEquipment,
              isExpanded: true,
              items: equipments.map((e) {
                return DropdownMenuItem(
                  value: e,
                  child: Text(e.name),
                );
              }).toList(),
              onChanged: (val) => setState(() => _currentEquipment = val),
              decoration: InputDecoration(
                border: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFE0E0E0))),
                enabledBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFE0E0E0))),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                fillColor: Colors.white,
                filled: true,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Data e Hora:', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
                Text(DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now()), style: TextStyle(color: Colors.grey.shade700)),
              ],
            ),
            const Divider(height: 32, color: Color(0xFFE0E0E0)),
            const Text('Itens de Inspeção', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _checkItems.length,
              itemBuilder: (ctx, index) {
                final item = _checkItems[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(item['label'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                            ),
                            if (item['hasPhoto'])
                              IconButton(
                                icon: Icon(
                                  item['photo'] != null ? Icons.check_circle : Icons.camera_alt,
                                  color: item['photo'] != null ? Colors.green : Colors.grey,
                                  size: 20,
                                ),
                                onPressed: () => _pickImage(index),
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            _buildStatusOption(index, 'ok', Icons.check, Colors.green),
                            const SizedBox(width: 8),
                            _buildStatusOption(index, 'not_ok', Icons.close, Colors.red),
                            const SizedBox(width: 8),
                            _buildStatusOption(index, 'na', null, Colors.blue, label: 'N/A'),
                          ],
                        ),
                        if (item['status'] == 'not_ok') ...[
                          const SizedBox(height: 12),
                          TextField(
                            controller: item['controller'],
                            decoration: const InputDecoration(
                              hintText: 'Descreva o problema...',
                              hintStyle: TextStyle(fontSize: 12),
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                          ),
                        ],
                        if (item['photo'] != null) ...[
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: Image.file(
                              item['photo'] as File,
                              height: 100,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ]
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
            const Text('Observações Gerais', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                border: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFE0E0E0))),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFFE0E0E0))),
                hintText: 'Alguma observação adicional?',
                fillColor: Colors.white,
                filled: true,
              ),
            ),
            const SizedBox(height: 24),
            const Text('Assinatura do Operador', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFE0E0E0)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Signature(
                controller: _signatureController,
                height: 150,
                backgroundColor: Colors.white,
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => _signatureController.clear(),
                  child: const Text('Limpar Assinatura', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 24),
            if (_checkItems.any((i) => i['status'] == 'not_ok')) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red.shade200),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Colors.red),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Atenção!', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                          Text(
                            'Existem itens não conformes. O equipamento poderá ser bloqueado para uso.',
                            style: TextStyle(color: Colors.red.shade700, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: const Color(0xFF1E3A8A),
                ),
                child: const Text('FINALIZAR E ENVIAR CHECKLIST', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusOption(int index, String status, IconData? icon, Color color, {String? label}) {
    final isSelected = _checkItems[index]['status'] == status;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _checkItems[index]['status'] = status),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? color : Colors.grey.shade100,
            border: Border.all(color: isSelected ? color : Colors.grey.shade300),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) Icon(icon, color: isSelected ? Colors.white : color, size: 16),
              if (label != null) Text(label, style: TextStyle(color: isSelected ? Colors.white : color, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
        ),
      ),
    );
  }
}
