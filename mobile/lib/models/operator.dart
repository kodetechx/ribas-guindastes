
import 'customer.dart';
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

  /// Validates if operator satisfies customer's required documentation and NR requirements
  bool isValidForCustomer(Customer customer) {
    // Check required documents (same logic as equipment)
    for (final _ in customer.specificDocumentation) {
      // Assume operator may have a list of document IDs similar to equipment; for now, no direct docs, so just return true.
      // If later operator gains a docs list, replace this with actual check.
    }
    // Verify NR compliance if client defines required NR types in specifications (example key: 'requiredNRs')
    final requiredNRs = customer.specifications['requiredNRs'] as List<dynamic>? ?? [];
    if (requiredNRs.isNotEmpty && nrs != null) {
      final operatorNRTypes = nrs!.map((nr) => nr.type).toSet();
      for (final nr in requiredNRs) {
        if (!operatorNRTypes.contains(nr)) return false;
      }
    }
    return true;
  }

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
