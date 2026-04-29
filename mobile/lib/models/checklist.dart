class Checklist {
  final String id;
  final String equipmentId;
  final String operatorId;
  final DateTime date;
  final List<ChecklistItem> items;
  final bool isApproved;
  final String? notes;
  final String? signatureUrl;

  Checklist({
    required this.id,
    required this.equipmentId,
    required this.operatorId,
    required this.date,
    required this.items,
    required this.isApproved,
    this.notes,
    this.signatureUrl,
  });

  factory Checklist.fromJson(Map<String, dynamic> json) {
    return Checklist(
      id: json['_id'] ?? '',
      equipmentId: json['equipment'] is Map ? json['equipment']['_id'] : json['equipment'],
      operatorId: json['operator'] is Map ? json['operator']['_id'] : json['operator'],
      date: DateTime.parse(json['date']),
      items: (json['items'] as List).map((i) => ChecklistItem.fromJson(i)).toList(),
      isApproved: json['isApproved'] ?? false,
      notes: json['notes'],
      signatureUrl: json['signatureUrl'],
    );
  }
}

class ChecklistItem {
  final String label;
  final String status; // 'ok', 'not_ok', 'na'
  final String? observation;

  ChecklistItem({
    required this.label,
    required this.status,
    this.observation,
  });

  factory ChecklistItem.fromJson(Map<String, dynamic> json) {
    return ChecklistItem(
      label: json['label'] ?? '',
      status: json['status'] ?? 'na',
      observation: json['observation'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'status': status,
      'observation': observation,
    };
  }
}
