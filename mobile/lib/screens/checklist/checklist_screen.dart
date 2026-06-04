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

  final List<Map<String, dynamic>> _checkItems = [];
  bool _isLoadingTemplate = false;

  @override
  void initState() {
    super.initState();
    _currentEquipment = widget.selectedEquipment;
    if (_currentEquipment != null) {
      _loadTemplate();
    }
    Provider.of<EquipmentProvider>(context, listen: false).fetchEquipments();
  }

  Future<void> _loadTemplate() async {
    if (_currentEquipment?.checklistTemplateId == null) {
      setState(() {
        _checkItems.clear();
        // Add a default item if no template is found to avoid empty list
        _checkItems.add({
          'label': 'Inspeção Geral',
          'status': 'ok',
          'controller': TextEditingController(),
          'photo': null,
          'hasPhoto': true
        });
      });
      return;
    }

    setState(() => _isLoadingTemplate = true);

    try {
      final template = await Provider.of<ChecklistProvider>(context, listen: false)
          .fetchTemplate(_currentEquipment!.checklistTemplateId!);

      if (template != null) {
        setState(() {
          _checkItems.clear();
          for (var item in template.items) {
            _checkItems.add({
              'label': item.label,
              'status': 'ok',
              'controller': TextEditingController(),
              'photo': null,
              'hasPhoto': true, // All dynamic items can have photo for now
              'required': item.required,
            });
          }
        });
      }
    } catch (e) {
      debugPrint('Error loading checklist template: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoadingTemplate = false);
      }
    }
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
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Checklist Diário'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: const Color(0xFFE0E0E0)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('EQUIPAMENTO', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFF666666))),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<Equipment>(
                    value: _currentEquipment,
                    isExpanded: true,
                    items: equipments.map((e) {
                      return DropdownMenuItem(
                        value: e,
                        child: Text(e.name, style: const TextStyle(fontSize: 15)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setState(() => _currentEquipment = val);
                      if (val != null) {
                        _loadTemplate();
                      }
                    },
                    decoration: const InputDecoration(
                      labelText: 'Selecione o Equipamento',
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Data e Hora:', style: TextStyle(fontWeight: FontWeight.w500, fontSize: 14, color: Color(0xFF666666))),
                      Text(
                        DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now()),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF1A1A1A)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'ITENS DE INSPEÇÃO',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
            ),
            const SizedBox(height: 10),
            if (_isLoadingTemplate)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_checkItems.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20.0),
                  child: Text('Selecione um equipamento para carregar o checklist.'),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _checkItems.length,
                itemBuilder: (ctx, index) {
                final item = _checkItems[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
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
                          children: [
                            Expanded(
                              child: Text(
                                item['label'],
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF1A1A1A)),
                              ),
                            ),
                            if (item['hasPhoto'])
                              IconButton(
                                icon: Icon(
                                  item['photo'] != null ? Icons.check_circle_outline : Icons.photo_camera_outlined,
                                  color: item['photo'] != null ? Colors.green : const Color(0xFF666666),
                                  size: 22,
                                ),
                                onPressed: () => _pickImage(index),
                              ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            _buildStatusOption(index, 'ok', Icons.check_circle_outlined, Colors.green),
                            const SizedBox(width: 8),
                            _buildStatusOption(index, 'not_ok', Icons.cancel_outlined, Colors.red),
                            const SizedBox(width: 8),
                            _buildStatusOption(index, 'na', null, Colors.grey, label: 'N/A'),
                          ],
                        ),
                        if (item['status'] == 'not_ok') ...[
                          const SizedBox(height: 12),
                          TextField(
                            controller: item['controller'],
                            style: const TextStyle(fontSize: 14),
                            decoration: const InputDecoration(
                              hintText: 'Descreva o problema...',
                              hintStyle: TextStyle(fontSize: 13, color: Color(0xFF999999)),
                              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            ),
                          ),
                        ],
                        if (item['photo'] != null) ...[
                          const SizedBox(height: 12),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: Image.file(
                              item['photo'] as File,
                              height: 120,
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
            const SizedBox(height: 20),
            const Text(
              'OBSERVAÇÕES GERAIS',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _notesController,
              maxLines: 3,
              style: const TextStyle(fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Alguma observação adicional?',
                hintStyle: TextStyle(fontSize: 13, color: Color(0xFF999999)),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'ASSINATURA DO OPERADOR',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF666666), letterSpacing: 1.0),
            ),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFCCCCCC)),
                borderRadius: BorderRadius.circular(4),
                color: Colors.white,
              ),
              child: Signature(
                controller: _signatureController,
                height: 120,
                backgroundColor: Colors.white,
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => _signatureController.clear(),
                  style: TextButton.styleFrom(foregroundColor: Colors.red),
                  child: const Text('Limpar Assinatura', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                ),
              ],
            ),
            const SizedBox(height: 20),
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
                    const Icon(Icons.warning_amber_outlined, color: Colors.red),
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
            ElevatedButton(
              onPressed: _submit,
              child: const Text('FINALIZAR E ENVIAR CHECKLIST'),
            ),
            const SizedBox(height: 32),
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
          height: 40,
          decoration: BoxDecoration(
            color: isSelected ? color : Colors.white,
            border: Border.all(color: isSelected ? color : const Color(0xFFCCCCCC)),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) Icon(icon, color: isSelected ? Colors.white : color, size: 16),
              if (label != null)
                Text(
                  label,
                  style: TextStyle(
                    color: isSelected ? Colors.white : color,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
