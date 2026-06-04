class ChecklistTemplate {
  final String id;
  final String name;
  final String? description;
  final List<ChecklistTemplateItem> items;

  ChecklistTemplate({
    required this.id,
    required this.name,
    this.description,
    required this.items,
  });

  factory ChecklistTemplate.fromJson(Map<String, dynamic> json) {
    return ChecklistTemplate(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => ChecklistTemplateItem.fromJson(item))
              .toList() ??
          [],
    );
  }
}

class ChecklistTemplateItem {
  final String label;
  final String? description;
  final bool required;
  final int order;

  ChecklistTemplateItem({
    required this.label,
    this.description,
    required this.required,
    required this.order,
  });

  factory ChecklistTemplateItem.fromJson(Map<String, dynamic> json) {
    return ChecklistTemplateItem(
      label: json['label'] ?? '',
      description: json['description'],
      required: json['required'] ?? true,
      order: json['order'] ?? 0,
    );
  }
}
