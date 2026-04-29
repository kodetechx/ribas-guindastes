class OperatorDocument {
  final String id;
  final String name;
  final String type;
  final String category; // 'operator', 'equipment'
  final String ownerId;
  final String fileUrl;
  final String fileName;
  final DateTime? expiresAt;
  final String status; // 'valid', 'warning', 'expired'

  OperatorDocument({
    required this.id,
    required this.name,
    required this.type,
    required this.category,
    required this.ownerId,
    required this.fileUrl,
    required this.fileName,
    this.expiresAt,
    required this.status,
  });

  factory OperatorDocument.fromJson(Map<String, dynamic> json) {
    return OperatorDocument(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      category: json['category'] ?? '',
      ownerId: json['ownerId'] ?? '',
      fileUrl: json['fileUrl'] ?? '',
      fileName: json['fileName'] ?? '',
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      status: json['status'] ?? 'valid',
    );
  }
}
