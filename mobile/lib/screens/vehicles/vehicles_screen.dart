import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../providers/equipment_provider.dart';
import '../../models/equipment.dart';
import '../checklist/checklist_screen.dart';

class VehiclesScreen extends StatefulWidget {
  const VehiclesScreen({super.key});

  @override
  State<VehiclesScreen> createState() => _VehiclesScreenState();
}

class _VehiclesScreenState extends State<VehiclesScreen> {
  String _searchQuery = '';
  String _filterStatus = 'Todos';

  @override
  void initState() {
    super.initState();
    Provider.of<EquipmentProvider>(context, listen: false).fetchEquipments();
  }

  @override
  Widget build(BuildContext context) {
    final equipments = Provider.of<EquipmentProvider>(context).equipments;
    final isLoading = Provider.of<EquipmentProvider>(context).isLoading;

    final filteredList = equipments.where((e) {
      final matchesSearch = e.model.toLowerCase().contains(_searchQuery.toLowerCase()) || e.serialNumber.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesFilter = _filterStatus == 'Todos' ||
          (_filterStatus == 'Disponíveis' && e.status == 'active') ||
          (_filterStatus == 'Em Manutenção' && e.status == 'maintenance');
      return matchesSearch && matchesFilter;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gestão de Veículos'),
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Buscar por modelo ou placa',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: ['Todos', 'Disponíveis', 'Em Manutenção'].map((filter) {
                final isSelected = _filterStatus == filter;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (val) => setState(() => _filterStatus = filter),
                    selectedColor: const Color(0xFFFFD700),
                    checkmarkColor: Colors.black,
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredList.length,
                    itemBuilder: (ctx, index) {
                      final eq = filteredList[index];
                      return _buildVehicleCard(eq);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleCard(Equipment eq) {
    Color statusColor;
    String statusText;

    switch (eq.status) {
      case 'active':
        statusColor = Colors.green;
        statusText = 'Disponível';
        break;
      case 'maintenance':
        statusColor = Colors.orange;
        statusText = 'Em Manutenção';
        break;
      case 'blocked':
        statusColor = Colors.red;
        statusText = 'Bloqueado';
        break;
      default:
        statusColor = Colors.grey;
        statusText = 'Indefinido';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => VehicleDetailScreen(equipment: eq))),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: eq.imageUrl != null ? Image.network(eq.imageUrl!, fit: BoxFit.cover) : const Icon(Icons.local_shipping, size: 40, color: Colors.grey),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(eq.model, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('Placa/Série: ${eq.serialNumber}', style: const TextStyle(color: Colors.grey)),
                    Text('Capacidade: ${eq.capacity ?? "N/A"} t', style: const TextStyle(color: Colors.grey)),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4), border: Border.all(color: statusColor)),
                      child: Text(statusText, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}

class VehicleDetailScreen extends StatelessWidget {
  final Equipment equipment;
  const VehicleDetailScreen({super.key, required this.equipment});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(equipment.model),
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: equipment.imageUrl != null ? Image.network(equipment.imageUrl!, fit: BoxFit.cover) : const Icon(Icons.local_shipping, size: 80, color: Colors.grey),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Informações do Veículo', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Fabricante: ${equipment.brand}'),
                    Text('Ano: ${equipment.year}'),
                    Text('Série: ${equipment.serialNumber}'),
                    Text('Capacidade: ${equipment.capacity ?? "N/A"} t'),
                  ],
                ),
                QrImageView(
                  data: equipment.id,
                  version: QrVersions.auto,
                  size: 100.0,
                ),
              ],
            ),
            const Divider(height: 32),
            const Text('Manutenção', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('Última manutenção: ${equipment.lastMaintenance != null ? equipment.lastMaintenance!.toLocal().toString().split(' ')[0] : "Não registrada"}'),
            Text('Próxima manutenção: ${equipment.nextMaintenance != null ? equipment.nextMaintenance!.toLocal().toString().split(' ')[0] : "Não prevista"}'),
            const Divider(height: 32),
            const Text('Ações', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => ChecklistScreen(selectedEquipment: equipment)));
                },
                icon: const Icon(Icons.checklist),
                label: const Text('INICIAR CHECKLIST'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: const Color(0xFFFFD700),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
