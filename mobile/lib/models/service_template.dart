class ServiceTemplate {
  final String id;
  final String name;
  final List<String> requiredDocumentIds; // IDs dos documentos padrão para o serviço
  final List<String> requiredEquipmentIds; // IDs dos equipamentos modelo

  ServiceTemplate({
    required this.id,
    required this.name,
    required this.requiredDocumentIds,
    required this.requiredEquipmentIds,
  });

  factory ServiceTemplate.fromJson(Map<String, dynamic> json) => ServiceTemplate(
        id: json['_id'] ?? '',
        name: json['name'] ?? '',
        requiredDocumentIds: List<String>.from(json['requiredDocumentIds'] ?? []),
        requiredEquipmentIds: List<String>.from(json['requiredEquipmentIds'] ?? []),
      );
}
