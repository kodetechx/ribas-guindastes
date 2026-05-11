
class DocumentModel {
  final String id;
  final String name;
  final String type;
  final String category;
  final String ownerId;
  final String fileUrl;
  final String fileName;
  final String mimeType;
  final int size;
  final DateTime? expiresAt;
  final String status;
  final DateTime createdAt;

  DocumentModel({
    required this.id,
    required this.name,
    required this.type,
    required this.category,
    required this.ownerId,
    required this.fileUrl,
    required this.fileName,
    required this.mimeType,
    required this.size,
    this.expiresAt,
    required this.status,
    required this.createdAt,
  });

  factory DocumentModel.fromJson(Map<String, dynamic> json) {
    return DocumentModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      category: json['category'] ?? '',
      ownerId: json['ownerId'] ?? '',
      fileUrl: json['fileUrl'] ?? '',
      fileName: json['fileName'] ?? '',
      mimeType: json['mimeType'] ?? '',
      size: json['size'] ?? 0,
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
      status: json['status'] ?? 'valid',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}
