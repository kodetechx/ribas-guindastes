// mobile/lib/validators/operator_allocation_validator.dart
import '../models/operator.dart';
import '../models/customer.dart';

class OperatorAllocationValidator {
  /// Returns true if the [operator] satisfies all requirements of the [customer].
  static bool validate(Operator operator, Customer customer) {
    return operator.isValidForCustomer(customer);
  }
}
