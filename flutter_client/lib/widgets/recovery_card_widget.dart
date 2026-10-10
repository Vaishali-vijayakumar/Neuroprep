import 'package:flutter/material.dart';
import '../models/recovery_card_model.dart';

class RecoveryCardWidget extends StatelessWidget {
  final RecoveryCardModel card;
  final String? sanitizedVent;
  final int? latencyMs;

  const RecoveryCardWidget({
    Key? key,
    required this.card,
    this.sanitizedVent,
    this.latencyMs,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12.0),
      decoration: BoxDecoration(
        color: const Color(0xFF131722),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF2E384D), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.35),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Header Bar ──
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: const BoxDecoration(
              color: Color(0xFF1A2234),
              borderRadius: BorderRadius.vertical(top: Radius.circular(19)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.psychology, color: Color(0xFF818CF8), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'GROUNDED RECOVERY BREAKDOWN',
                        style: TextStyle(
                          color: Color(0xFF818CF8),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.1,
                        ),
                      ),
                      Text(
                        card.mathMarketCheck.stage,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (latencyMs != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${latencyMs}ms',
                      style: const TextStyle(
                        color: Color(0xFF34D399),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(18.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── 1. Cognitive Diagnosis ──
                _buildSectionCard(
                  icon: Icons.lightbulb_outline,
                  iconColor: const Color(0xFFF59E0B),
                  title: '1. COGNITIVE DIAGNOSIS',
                  subtitle: card.cognitiveDiagnosis.thinkingTrap,
                  subtitleColor: const Color(0xFFFBBF24),
                  body: card.cognitiveDiagnosis.clinicalExplanation,
                ),
                const SizedBox(height: 14),

                // ── 2. Math & Market Check ──
                _buildSectionCard(
                  icon: Icons.analytics_outlined,
                  iconColor: const Color(0xFF3B82F6),
                  title: '2. HIRING MATH & MARKET REALITY',
                  subtitle: card.mathMarketCheck.funnelAttrition,
                  subtitleColor: const Color(0xFF60A5FA),
                  body: card.mathMarketCheck.headcountReality,
                ),
                const SizedBox(height: 14),

                // ── 3. Isolated Skill Variable ──
                _buildSectionCard(
                  icon: Icons.tune,
                  iconColor: const Color(0xFF10B981),
                  title: '3. ISOLATED SKILL VARIABLE',
                  subtitle: card.skillVariable.isolatedGap,
                  subtitleColor: const Color(0xFF34D399),
                  body: card.skillVariable.precisionFix,
                ),
                const SizedBox(height: 14),

                // ── 4. Alumni Recovery Precedent ──
                _buildSectionCard(
                  icon: Icons.history_edu,
                  iconColor: const Color(0xFFA855F7),
                  title: '4. ALUMNI PRECEDENT',
                  subtitle: card.alumniPrecedent.reboundTimeline,
                  subtitleColor: const Color(0xFFC084FC),
                  body: '${card.alumniPrecedent.seniorCase}\n\nStrategic Takeaway: ${card.alumniPrecedent.strategicTakeaway}',
                ),
                const SizedBox(height: 16),

                // ── Actionable Next Steps ──
                if (card.actionableRecoverySteps.isNotEmpty) ...[
                  const Text(
                    'TACTICAL NEXT MOVES (24H - 72H)',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...card.actionableRecoverySteps.map((step) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.check_circle_outline,
                                color: Color(0xFF10B981), size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                step,
                                style: const TextStyle(
                                  color: Color(0xFFE2E8F0),
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                  const SizedBox(height: 16),
                ],

                // ── Grounded Summary ──
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.shield_outlined,
                          color: Color(0xFF60A5FA), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          card.groundedSummary,
                          style: const TextStyle(
                            color: Color(0xFFF1F5F9),
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            fontStyle: FontStyle.italic,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required Color subtitleColor,
    required String body,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF161B26),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF263044)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: iconColor, size: 17),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.9,
                ),
              ),
            ],
          ),
          if (subtitle.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: TextStyle(
                color: subtitleColor,
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          const SizedBox(height: 6),
          Text(
            body,
            style: const TextStyle(
              color: Color(0xFFCBD5E1),
              fontSize: 12.5,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}
