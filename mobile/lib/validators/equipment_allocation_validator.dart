// mobile/lib/validators/equipment_allocation_validator.dart
import '../models/equipment.dart';
import '../models/customer.dart';

class EquipmentAllocationValidator {
  /// Returns true if the [equipment] satisfies all requirements of the [customer].
  static bool validate(Equipment equipment, Customer customer) {
    return equipment.isValidForCustomer(customer);
  }
}
