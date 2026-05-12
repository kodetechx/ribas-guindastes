import 'package:hive_flutter/hive_flutter.dart';

class LocalDatabaseService {
  static final LocalDatabaseService _instance = LocalDatabaseService._internal();
  factory LocalDatabaseService() => _instance;
  LocalDatabaseService._internal();

  // Box names
  static const String equipmentsBox = 'equipments';
  static const String servicesBox = 'services';
  static const String settingsBox = 'settings';
  static const String checklistQueueBox = 'checklists_sync_queue';

  // Generic methods to save and get data
  Future<void> saveData(String boxName, String key, dynamic data) async {
    final box = Hive.box(boxName);
    await box.put(key, data);
  }

  dynamic getData(String boxName, String key) {
    final box = Hive.box(boxName);
    return box.get(key);
  }

  Future<void> saveList(String boxName, String key, List<dynamic> data) async {
    final box = Hive.box(boxName);
    await box.put(key, data);
  }

  List<dynamic>? getList(String boxName, String key) {
    final box = Hive.box(boxName);
    return box.get(key) as List<dynamic>?;
  }

  // Queue management for offline sync
  Future<void> addToQueue(String boxName, dynamic item) async {
    final box = Hive.box(boxName);
    await box.add(item);
  }

  List<dynamic> getQueue(String boxName) {
    final box = Hive.box(boxName);
    return box.values.toList();
  }

  Future<void> removeFromQueue(String boxName, int index) async {
    final box = Hive.box(boxName);
    await box.deleteAt(index);
  }

  Future<void> clearBox(String boxName) async {
    final box = Hive.box(boxName);
    await box.clear();
  }
}
