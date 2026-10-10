import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

// ── Tables ──────────────────────────────────────────────────────────────────

class EmotionalLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get originalVent => text()();
  TextColumn get sanitizedVent => text()();
  TextColumn get detectedStage => text()();
  TextColumn get inputType => text()(); // 'text' | 'audio'
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  // Recovery Card structured fields
  TextColumn get thinkingTrap => text()();
  TextColumn get clinicalExplanation => text()();
  TextColumn get funnelAttrition => text()();
  TextColumn get headcountReality => text()();
  TextColumn get isolatedGap => text()();
  TextColumn get precisionFix => text()();
  TextColumn get seniorCase => text()();
  TextColumn get reboundTimeline => text()();
  TextColumn get strategicTakeaway => text()();
  TextColumn get actionableStepsJson => text()();
  TextColumn get groundedSummary => text()();
  IntColumn get latencyMs => integer().withDefault(const Constant(0))();
}

// ── Database Implementation ──────────────────────────────────────────────────

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'student_recovery_vault.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}

class AppDatabase {
  static final AppDatabase _instance = AppDatabase._internal();
  factory AppDatabase() => _instance;
  AppDatabase._internal();

  // Pure SQFlite / Drift query helpers ensuring zero cloud synchronization
  // All emotional vents, reflections, and breakdowns remain strictly on device.
}
