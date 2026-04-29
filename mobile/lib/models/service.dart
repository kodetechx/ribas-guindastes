class WorkService {
  final String id;
  final String title;
  final String client;
  final String location;
  final String equipmentId;
  final List<String> operatorIds;
  final String status; // 'pending', 'in_progress', 'finished'
  final DateTime startDate;
  final DateTime? endDate;

  WorkService({
    required this.id,
    required this.title,
    required this.client,
    required this.location,
    required this.equipmentId,
    required this.operatorIds,
    required this.status,
    required this.startDate,
    this.endDate,
  });

  factory WorkService.fromJson(Map<String, dynamic> json) {
    return WorkService(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      client: json['client'] ?? '',
      location: json['location'] ?? '',
      equipmentId: json['equipment'] is Map ? json['equipment']['_id'] : json['equipment'],
      operatorIds: List<String>.from(json['operators'] ?? []),
      status: json['status'] ?? 'pending',
      startDate: DateTime.parse(json['startDate']),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
    );
  }
}
