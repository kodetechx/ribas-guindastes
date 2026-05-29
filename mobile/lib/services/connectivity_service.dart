import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _connectivityStreamController = StreamController<bool>.broadcast();

  ConnectivityService() {
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      // connectivity_plus 6.x returns a list of results
      _connectivityStreamController.add(_hasConnection(results));
    });
  }

  Stream<bool> get connectivityStream => _connectivityStreamController.stream;

  Future<bool> get isConnected async {
    final List<ConnectivityResult> results = await _connectivity.checkConnectivity();
    return _hasConnection(results);
  }

  bool _hasConnection(List<ConnectivityResult> results) {
    if (results.isEmpty) return false;
    return results.any((result) => result != ConnectivityResult.none);
  }

  void dispose() {
    _connectivityStreamController.close();
  }
}
