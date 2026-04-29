
class Operator {
  final String id;
  final String name;
  final String email;
  final String registrationNumber;
  final String role;
  final String? photoUrl;
  final String? avatarUrl;
  final DateTime? createdAt;
  final CNH? cnh;
  final List<NR>? nrs;

  Operator({
    required this.id,
    required this.name,
    required this.email,
    required this.registrationNumber,
    required this.role,
    this.photoUrl,
    this.avatarUrl,
    this.createdAt,
    this.cnh,
    this.nrs,
  });

  factory Operator.fromJson(Map<String, dynamic> json) {
    return Operator(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      registrationNumber: json['registrationNumber'] ?? '',
      role: json['role'] ?? 'operator',
      photoUrl: json['photoUrl'],
      avatarUrl: json['avatarUrl'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      cnh: json['cnh'] != null ? CNH.fromJson(json['cnh']) : null,
      nrs: json['nrs'] != null ? (json['nrs'] as List).map((i) => NR.fromJson(i)).toList() : null,
    );
  }
}

class CNH {
  final String number;
  final String category;
  final DateTime expiresAt;

  CNH({
    required this.number,
    required this.category,
    required this.expiresAt,
  });

  factory CNH.fromJson(Map<String, dynamic> json) {
    return CNH(
      number: json['number'] ?? '',
      category: json['category'] ?? '',
      expiresAt: DateTime.parse(json['expiresAt']),
    );
  }
}

class NR {
  final String type;
  final DateTime expiresAt;

  NR({
    required this.type,
    required this.expiresAt,
  });

  factory NR.fromJson(Map<String, dynamic> json) {
    return NR(
      type: json['type'] ?? '',
      expiresAt: DateTime.parse(json['expiresAt']),
    );
  }
}
