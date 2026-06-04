class Customer {
  final String id;
  final String name;
  final List<String> specificDocumentation; // IDs dos documentos exigidos
  final Map<String, dynamic> specifications; // requisitos flexíveis (ex.: peso máximo, tipo de operação)

  Customer({
    required this.id,
    required this.name,
    required this.specificDocumentation,
    required this.specifications,
  });

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['_id'] ?? '',
        name: json['name'] ?? '',
        specificDocumentation: List<String>.from(json['specificDocumentation'] ?? []),
        specifications: json['specifications'] ?? {},
      );
}
