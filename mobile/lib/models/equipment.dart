import 'customer.dart';
class Equipment {
  final String id;
  final String name;
  final String brand;
  final String equipmentModel;
  final int year;
  final String serialNumber;
  final String status; // 'active', 'maintenance', 'blocked'
  final String? qrCode;
  final List<String> documents;
  final String? checklistTemplateId;
  final DateTime? lastMaintenance;
  final DateTime? nextMaintenance;
  final String? imageUrl;
  final double? capacity; // Added as per requirements

  Equipment({
    required this.id,
    required this.name,
    required this.brand,
    required this.equipmentModel,
    required this.year,
    required this.serialNumber,
    required this.status,
    this.qrCode,
    required this.documents,
    this.checklistTemplateId,
    this.lastMaintenance,
    this.nextMaintenance,
    this.imageUrl,
    this.capacity,
  });

  factory Equipment.fromJson(Map<String, dynamic> json) {
    return Equipment(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      brand: json['brand'] ?? '',
      equipmentModel: json['equipmentModel'] ?? '',
      year: json['year'] ?? 0,
      serialNumber: json['serialNumber'] ?? '',
      status: json['status'] ?? 'active',
      qrCode: json['qrCode'],
      documents: List<String>.from(json['documents'] ?? []),
      checklistTemplateId: json['checklistTemplateId'],
      lastMaintenance: json['lastMaintenance'] != null ? DateTime.parse(json['lastMaintenance']) : null,
      nextMaintenance: json['nextMaintenance'] != null ? DateTime.parse(json['nextMaintenance']) : null,
      imageUrl: json['imageUrl'],
      capacity: json['capacity']?.toDouble(),
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Equipment && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  /// Validates if equipment satisfies customer's required documentation and status
  bool isValidForCustomer(Customer customer) {
    // 1. Check status
    if (status != 'active') return false;

    // 2. Check maintenance
    if (nextMaintenance != null && nextMaintenance!.isBefore(DateTime.now())) {
      return false;
    }

    // 3. Check specific documentation required by customer
    for (final docId in customer.specificDocumentation) {
      if (!documents.contains(docId)) return false;
    }

    return true;
  }
}
