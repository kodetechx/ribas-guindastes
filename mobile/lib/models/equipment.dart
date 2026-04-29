class Equipment {
  final String id;
  final String name;
  final String brand;
  final String model;
  final int year;
  final String serialNumber;
  final String status; // 'active', 'maintenance', 'blocked'
  final String? qrCode;
  final List<String> documents;
  final DateTime? lastMaintenance;
  final DateTime? nextMaintenance;
  final String? imageUrl;
  final double? capacity; // Added as per requirements

  Equipment({
    required this.id,
    required this.name,
    required this.brand,
    required this.model,
    required this.year,
    required this.serialNumber,
    required this.status,
    this.qrCode,
    required this.documents,
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
      model: json['model'] ?? '',
      year: json['year'] ?? 0,
      serialNumber: json['serialNumber'] ?? '',
      status: json['status'] ?? 'active',
      qrCode: json['qrCode'],
      documents: List<String>.from(json['documents'] ?? []),
      lastMaintenance: json['lastMaintenance'] != null ? DateTime.parse(json['lastMaintenance']) : null,
      nextMaintenance: json['nextMaintenance'] != null ? DateTime.parse(json['nextMaintenance']) : null,
      imageUrl: json['imageUrl'],
      capacity: json['capacity']?.toDouble(),
    );
  }
}
