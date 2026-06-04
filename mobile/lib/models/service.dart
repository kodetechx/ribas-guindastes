class WorkService {
  final String id;
  final String title;
  final String client;
  final String? clientId;
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
    this.clientId,
    required this.location,
    required this.equipmentId,
    required this.operatorIds,
    required this.status,
    required this.startDate,
    this.endDate,
  });

  factory WorkService.fromJson(Map<String, dynamic> json) {
    // Handle populated or ID-only client
    String clientName = '';
    String? clientId;
    if (json['client'] is Map) {
      clientName = json['client']['fantasyName'] ?? json['client']['name'] ?? '';
      clientId = json['client']['_id'];
    } else if (json['clientId'] is Map) {
      clientName = json['clientId']['fantasyName'] ?? json['clientId']['name'] ?? '';
      clientId = json['clientId']['_id'];
    } else {
      clientName = json['client'] ?? '';
      clientId = json['clientId'];
    }

    // Handle equipments (array)
    String equipmentId = '';
    if (json['equipments'] != null && (json['equipments'] as List).isNotEmpty) {
      final firstEq = json['equipments'][0];
      equipmentId = firstEq is Map ? firstEq['_id'] : firstEq;
    } else if (json['equipment'] != null) {
      equipmentId = json['equipment'] is Map ? json['equipment']['_id'] : json['equipment'];
    }

    return WorkService(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      client: clientName,
      clientId: clientId,
      location: json['location'] ?? '',
      equipmentId: equipmentId,
      operatorIds: json['operators'] != null 
          ? (json['operators'] as List).map((op) => op is Map ? op['_id'].toString() : op.toString()).toList() 
          : [],
      status: json['status'] ?? 'pending',
      startDate: DateTime.parse(json['startDate']),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
    );
  }
}
