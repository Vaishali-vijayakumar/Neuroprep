import 'dart:convert';

/// Actionable Recovery Card Model
/// Conforms strictly to the backend LLM RAG JSON schema.
class RecoveryCardModel {
  final CognitiveDiagnosis cognitiveDiagnosis;
  final MathMarketCheck mathMarketCheck;
  final SkillVariable skillVariable;
  final AlumniPrecedent alumniPrecedent;
  final List<String> actionableRecoverySteps;
  final String groundedSummary;

  RecoveryCardModel({
    required this.cognitiveDiagnosis,
    required this.mathMarketCheck,
    required this.skillVariable,
    required this.alumniPrecedent,
    required this.actionableRecoverySteps,
    required this.groundedSummary,
  });

  factory RecoveryCardModel.fromJson(Map<String, dynamic> json) {
    return RecoveryCardModel(
      cognitiveDiagnosis: CognitiveDiagnosis.fromJson(
        json['cognitive_diagnosis'] as Map<String, dynamic>? ?? {},
      ),
      mathMarketCheck: MathMarketCheck.fromJson(
        json['math_market_check'] as Map<String, dynamic>? ?? {},
      ),
      skillVariable: SkillVariable.fromJson(
        json['skill_variable'] as Map<String, dynamic>? ?? {},
      ),
      alumniPrecedent: AlumniPrecedent.fromJson(
        json['alumni_precedent'] as Map<String, dynamic>? ?? {},
      ),
      actionableRecoverySteps: (json['actionable_recovery_steps'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      groundedSummary: json['grounded_summary'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'cognitive_diagnosis': cognitiveDiagnosis.toJson(),
      'math_market_check': mathMarketCheck.toJson(),
      'skill_variable': skillVariable.toJson(),
      'alumni_precedent': alumniPrecedent.toJson(),
      'actionable_recovery_steps': actionableRecoverySteps,
      'grounded_summary': groundedSummary,
    };
  }
}

class CognitiveDiagnosis {
  final String thinkingTrap;
  final String clinicalExplanation;

  CognitiveDiagnosis({
    required this.thinkingTrap,
    required this.clinicalExplanation,
  });

  factory CognitiveDiagnosis.fromJson(Map<String, dynamic> json) {
    return CognitiveDiagnosis(
      thinkingTrap: json['thinking_trap'] as String? ?? 'Cognitive Distortion',
      clinicalExplanation: json['clinical_explanation'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'thinking_trap': thinkingTrap,
        'clinical_explanation': clinicalExplanation,
      };
}

class MathMarketCheck {
  final String stage;
  final String funnelAttrition;
  final String headcountReality;

  MathMarketCheck({
    required this.stage,
    required this.funnelAttrition,
    required this.headcountReality,
  });

  factory MathMarketCheck.fromJson(Map<String, dynamic> json) {
    return MathMarketCheck(
      stage: json['stage'] as String? ?? 'General Placement Drive',
      funnelAttrition: json['funnel_attrition'] as String? ?? '',
      headcountReality: json['headcount_reality'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'stage': stage,
        'funnel_attrition': funnelAttrition,
        'headcount_reality': headcountReality,
      };
}

class SkillVariable {
  final String isolatedGap;
  final String precisionFix;

  SkillVariable({
    required this.isolatedGap,
    required this.precisionFix,
  });

  factory SkillVariable.fromJson(Map<String, dynamic> json) {
    return SkillVariable(
      isolatedGap: json['isolated_gap'] as String? ?? '',
      precisionFix: json['precision_fix'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'isolated_gap': isolatedGap,
        'precision_fix': precisionFix,
      };
}

class AlumniPrecedent {
  final String seniorCase;
  final String reboundTimeline;
  final String strategicTakeaway;

  AlumniPrecedent({
    required this.seniorCase,
    required this.reboundTimeline,
    required this.strategicTakeaway,
  });

  factory AlumniPrecedent.fromJson(Map<String, dynamic> json) {
    return AlumniPrecedent(
      seniorCase: json['senior_case'] as String? ?? '',
      reboundTimeline: json['rebound_timeline'] as String? ?? '',
      strategicTakeaway: json['strategic_takeaway'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'senior_case': seniorCase,
        'rebound_timeline': reboundTimeline,
        'strategic_takeaway': strategicTakeaway,
      };
}

class VentResponseModel {
  final bool success;
  final String inputType;
  final String rawTranscript;
  final String sanitizedQuery;
  final String detectedStage;
  final int latencyMs;
  final RecoveryCardModel recoveryCard;

  VentResponseModel({
    required this.success,
    required this.inputType,
    required this.rawTranscript,
    required this.sanitizedQuery,
    required this.detectedStage,
    required this.latencyMs,
    required this.recoveryCard,
  });

  factory VentResponseModel.fromJson(Map<String, dynamic> json) {
    return VentResponseModel(
      success: json['success'] as bool? ?? false,
      inputType: json['input_type'] as String? ?? 'text',
      rawTranscript: json['raw_transcript'] as String? ?? '',
      sanitizedQuery: json['sanitized_query'] as String? ?? '',
      detectedStage: json['detected_stage'] as String? ?? '',
      latencyMs: json['latency_ms'] as int? ?? 0,
      recoveryCard: RecoveryCardModel.fromJson(
        json['recovery_card'] as Map<String, dynamic>? ?? {},
      ),
    );
  }
}
