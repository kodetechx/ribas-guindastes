// mobile/lib/repositories/service_repository.dart
import '../models/service.dart'; // WorkService model
import '../models/customer.dart';
import '../models/service_template.dart';

class ServiceRepository {
  // In a real app this would be injected with a data source (API, DB, etc.)
  // For now we provide a simple factory method.

  /// Creates a new [WorkService] based on a [ServiceTemplate] and the [customer] requirements.
  ///
  /// The service will automatically inherit the predefined document IDs and equipment IDs
  /// defined in the template. Additional linkage (e.g., saving to a backend) should be
  /// performed by the caller after the object is created.
  WorkService createService({
    required Customer customer,
    required ServiceTemplate template,
    required String title,
    required String location,
    required DateTime startDate,
    DateTime? endDate,
  }) {
    // For simplicity we reuse the template's equipmentId (could be a list in future)
    final equipmentId = template.requiredEquipmentIds.isNotEmpty
        ? template.requiredEquipmentIds.first
        : '';

    // Operator list empty initially; frontend can assign later.
    final operatorIds = <String>[];

    // Build the service instance.
    return WorkService(
      id: DateTime.now().millisecondsSinceEpoch.toString(), // naive ID generation
      title: title,
      client: customer.id,
      location: location,
      equipmentId: equipmentId,
      operatorIds: operatorIds,
      status: 'pending',
      startDate: startDate,
      endDate: endDate,
    );
  }
}
