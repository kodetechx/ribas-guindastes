import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/work_provider.dart';
import '../../providers/equipment_provider.dart';
import '../../models/equipment.dart';
import '../../models/service.dart';

class WorkScreen extends StatefulWidget {
  const WorkScreen({super.key});

  @override
  State<WorkScreen> createState() => _WorkScreenState();
}

class _WorkScreenState extends State<WorkScreen> {
  final _formKey = GlobalKey<FormState>();
  final _locationController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _horimeterController = TextEditingController();
  Equipment? _selectedEquipment;
  String _selectedServiceType = 'Içamento de cargas';
  XFile? _image;

  @override
  void initState() {
    super.initState();
    Provider.of<WorkProvider>(context, listen: false).fetchHistory();
    Provider.of<EquipmentProvider>(context, listen: false).fetchEquipments();
  }

  void _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    setState(() => _image = image);
  }

  void _toggleWork() async {
    final workProvider = Provider.of<WorkProvider>(context, listen: false);

    if (workProvider.isWorking) {
      // Finish
      if (_horimeterController.text.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Informe o horímetro final')));
        return;
      }
      final success = await workProvider.finishWork(workProvider.activeService!.id, {
        'horimeterEnd': double.tryParse(_horimeterController.text),
      });
      if (success && mounted) {
        _horimeterController.clear();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trabalho finalizado!')));
      }
    } else {
      // Start
      if (!_formKey.currentState!.validate() || _selectedEquipment == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Preencha todos os campos obrigatórios')));
        return;
      }
      final success = await workProvider.startWork({
        'title': _selectedServiceType,
        'client': 'Cliente Genérico', // In real app would be a field
        'location': _locationController.text,
        'equipment': _selectedEquipment!.id,
        'description': _descriptionController.text,
        'type': _selectedServiceType,
        'horimeterStart': 0, // In real app would fetch from equipment
      });
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trabalho iniciado!')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final workProvider = Provider.of<WorkProvider>(context);
    final equipments = Provider.of<EquipmentProvider>(context).equipments;
    final isWorking = workProvider.isWorking;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Registro de Trabalho'),
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isWorking) _buildActiveWorkCard(workProvider.activeService!) else _buildStartWorkForm(equipments),
            const SizedBox(height: 32),
            const Text('Histórico de Trabalhos', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: workProvider.history.length,
              itemBuilder: (ctx, index) {
                final work = workProvider.history[index];
                return Card(
                  child: ListTile(
                    title: Text(work.title),
                    subtitle: Text('${work.client} - ${DateFormat('dd/MM HH:mm').format(work.startDate)}'),
                    trailing: Text(work.status == 'finished' ? 'Finalizado' : 'Em curso', style: TextStyle(color: work.status == 'finished' ? Colors.green : Colors.orange)),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActiveWorkCard(WorkService work) {
    return Card(
      color: Colors.green.shade50,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.timer, color: Colors.green),
                SizedBox(width: 8),
                Text('TRABALHO EM ANDAMENTO', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
              ],
            ),
            const SizedBox(height: 16),
            Text('Início: ${DateFormat('dd/MM/yyyy HH:mm').format(work.startDate)}'),
            Text('Local: ${work.location}'),
            const SizedBox(height: 16),
            TextField(
              controller: _horimeterController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Horímetro Final', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _toggleWork,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('FINALIZAR JORNADA', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStartWorkForm(List<Equipment> equipments) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Iniciar Novo Trabalho', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          DropdownButtonFormField<Equipment>(
            decoration: const InputDecoration(labelText: 'Veículo', border: OutlineInputBorder()),
            items: equipments.map((e) => DropdownMenuItem(value: e, child: Text(e.model))).toList(),
            onChanged: (val) => setState(() => _selectedEquipment = val),
            validator: (val) => val == null ? 'Obrigatório' : null,
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _selectedServiceType,
            decoration: const InputDecoration(labelText: 'Tipo de Serviço', border: OutlineInputBorder()),
            items: ['Içamento de cargas', 'Movimentação de materiais', 'Manutenção/inspeção', 'Transporte', 'Outros'].map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
            onChanged: (val) => setState(() => _selectedServiceType = val!),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _locationController,
            decoration: const InputDecoration(labelText: 'Local da Operação', border: OutlineInputBorder()),
            validator: (val) => val!.isEmpty ? 'Obrigatório' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _descriptionController,
            maxLines: 2,
            decoration: const InputDecoration(labelText: 'Descrição do Serviço', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: _pickImage,
            icon: const Icon(Icons.camera_alt),
            label: Text(_image == null ? 'Tirar Foto do Serviço (Opcional)' : 'Foto Capturada'),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _toggleWork,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.black, foregroundColor: const Color(0xFFFFD700), padding: const EdgeInsets.symmetric(vertical: 16)),
              child: const Text('INICIAR JORNADA', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
