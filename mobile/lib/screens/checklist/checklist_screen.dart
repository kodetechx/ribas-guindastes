import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:signature/signature.dart';
import '../../providers/equipment_provider.dart';
import '../../providers/checklist_provider.dart';
import '../../models/equipment.dart';

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
    {'label': 'Cabos de aço em bom estado', 'status': 'ok'},
    {'label': 'Sistema hidráulico sem vazamentos', 'status': 'ok'},
    {'label': 'Pneus/esteiras em condições', 'status': 'ok'},
    {'label': 'Sinalização sonora e visual funcionando', 'status': 'ok'},
    {'label': 'Extintor de incêndio carregado', 'status': 'ok'},
    {'label': 'Kit de primeiros socorros completo', 'status': 'ok'},
    {'label': 'Freios funcionando corretamente', 'status': 'ok'},
    {'label': 'Iluminação (faróis, lanternas) OK', 'status': 'ok'},
    {'label': 'Cinto de segurança em bom estado', 'status': 'ok'},
    {'label': 'Documentação e manuais a bordo', 'status': 'ok'},
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
    super.dispose();
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

    final success = await Provider.of<ChecklistProvider>(context, listen: false).submitChecklist({
      'equipment': _currentEquipment!.id,
      'items': _checkItems.map((i) => {'label': i['label'], 'status': i['status']}).toList(),
      'notes': _notesController.text,
      'isApproved': _checkItems.every((i) => i['status'] == 'ok'),
      // Signature would be uploaded as image in a real app
    });

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Checklist enviado com sucesso!')));
      Navigator.of(context).pop(); // If opened from vehicle detail
    }
  }

  @override
  Widget build(BuildContext context) {
    final equipments = Provider.of<EquipmentProvider>(context).equipments;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checklist de Segurança'),
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Selecione o Veículo', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            DropdownButtonFormField<Equipment>(
              value: _currentEquipment,
              isExpanded: true,
              items: equipments.map((e) {
                return DropdownMenuItem(
                  value: e,
                  child: Text('${e.model} - ${e.serialNumber}'),
                );
              }).toList(),
              onChanged: (val) => setState(() => _currentEquipment = val),
              decoration: const InputDecoration(border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Data e Hora:', style: TextStyle(fontWeight: FontWeight.bold)),
                Text(DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now())),
              ],
            ),
            const Divider(height: 32),
            const Text('Itens de Verificação', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _checkItems.length,
              itemBuilder: (ctx, index) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_checkItems[index]['label']),
                        Row(
                          children: [
                            _buildStatusOption(index, 'ok', 'OK', Colors.green),
                            _buildStatusOption(index, 'not_ok', 'Não OK', Colors.red),
                            _buildStatusOption(index, 'na', 'N/A', Colors.grey),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),
            const Text('Observações', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Caso haja algum problema, descreva aqui...'),
            ),
            const SizedBox(height: 24),
            const Text('Assinatura Digital', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(border: Border.all(color: Colors.grey)),
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
                  child: const Text('Limpar Assinatura'),
                ),
              ],
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: const Color(0xFFFFD700),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('FINALIZAR CHECKLIST', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusOption(int index, String status, String label, Color color) {
    final isSelected = _checkItems[index]['status'] == status;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _checkItems[index]['status'] = status),
        child: Container(
          margin: const EdgeInsets.all(4),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? color : Colors.transparent,
            border: Border.all(color: color),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: isSelected ? Colors.white : color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }
}
