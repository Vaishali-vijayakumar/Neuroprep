import 'dart:io';
import 'package:flutter/material.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import '../models/recovery_card_model.dart';
import '../services/vent_rag_api_service.dart';
import '../widgets/recovery_card_widget.dart';

class VentRecoveryScreen extends StatefulWidget {
  const VentRecoveryScreen({Key? key}) : super(key: key);

  @override
  State<VentRecoveryScreen> createState() => _VentRecoveryScreenState();
}

class _VentRecoveryScreenState extends State<VentRecoveryScreen> {
  final TextEditingController _textController = TextEditingController();
  final VentRagApiService _apiService = VentRagApiService();
  final AudioRecorder _audioRecorder = AudioRecorder();

  bool _isRecording = false;
  bool _isLoading = false;
  String? _recordedFilePath;
  VentResponseModel? _currentResponse;
  String? _errorMessage;

  final List<String> _quickPrompts = [
    "Dropped in Round 2 Technical today. Froze on DP.",
    "Failed 4 Online Assessments this week. Tired and lost.",
    "Interviewer seemed uninterested. Blanked out on Tree BFS.",
    "Friends all got placed today. Feeling left behind."
  ];

  @override
  void dispose() {
    _textController.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final tempDir = await getTemporaryDirectory();
        final path = '${tempDir.path}/vent_${DateTime.now().millisecondsSinceEpoch}.m4a';

        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000, sampleRate: 16000),
          path: path,
        );

        setState(() {
          _isRecording = true;
          _recordedFilePath = path;
          _errorMessage = null;
        });
      }
    } catch (e) {
      setState(() => _errorMessage = 'Microphone error: $e');
    }
  }

  Future<void> _stopAndSubmitRecording() async {
    try {
      final path = await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
        _isLoading = true;
      });

      if (path != null && File(path).existsSync()) {
        final response = await _apiService.submitAudioVent(
          audioFile: File(path),
        );
        setState(() {
          _currentResponse = response;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Voice vent transcription failed: $e';
      });
    }
  }

  Future<void> _submitTextVent([String? customText]) async {
    final text = (customText ?? _textController.text).trim();
    if (text.isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.submitTextVent(text: text);
      setState(() {
        _currentResponse = response;
        _isLoading = false;
        _textController.clear();
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Recovery analysis error: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111622),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.psychology, color: Color(0xFF818CF8), size: 20),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Placement Recovery RAG',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
                ),
                Text(
                  'Clinical CBT + Hiring Math + Alumni Data',
                  style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // ── Privacy & PII Scrubbing Banner ──
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: const Color(0xFF131927),
              child: const Row(
                children: [
                  Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Regex PII Scrubber Active: Names, CGPA & Recruiters stripped. Stored strictly in local SQLite.',
                      style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                    ),
                  ),
                ],
              ),
            ),

            // ── Main Content Area ──
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Quick Prompt Pills
                  const Text(
                    'COMMON PLACEMENT VENT SCENARIOS',
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _quickPrompts.map((prompt) {
                      return ActionChip(
                        backgroundColor: const Color(0xFF1A2234),
                        side: const BorderSide(color: Color(0xFF2C394F)),
                        label: Text(
                          prompt,
                          style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 11.5),
                        ),
                        onPressed: () => _submitTextVent(prompt),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Loading State
                  if (_isLoading)
                    Container(
                      padding: const EdgeInsets.all(28),
                      margin: const EdgeInsets.symmetric(vertical: 20),
                      decoration: BoxDecoration(
                        color: const Color(0xFF161B26),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF263044)),
                      ),
                      child: const Column(
                        children: [
                          CircularProgressIndicator(color: Color(0xFF818CF8)),
                          SizedBox(height: 16),
                          Text(
                            'Vectorizing with BGE Embeddings & Reranking Chunks...',
                            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Retrieving CBT Thought Rule + Funnel Attrition Metric + Senior Precedent',
                            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),

                  // Error Message
                  if (_errorMessage != null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.red.withOpacity(0.3)),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                      ),
                    ),

                  // Render Actionable Recovery Card
                  if (_currentResponse != null && !_isLoading)
                    RecoveryCardWidget(
                      card: _currentResponse!.recoveryCard,
                      sanitizedVent: _currentResponse!.sanitizedQuery,
                      latencyMs: _currentResponse!.latencyMs,
                    ),
                ],
              ),
            ),

            // ── Input & Voice Vent Bar ──
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Color(0xFF111622),
                border: Border(top: BorderSide(color: Color(0xFF1E293B))),
              ),
              child: Row(
                children: [
                  // Voice Recording Mic Button (30s Vent)
                  GestureDetector(
                    onTap: _isRecording ? _stopAndSubmitRecording : _startRecording,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _isRecording ? Colors.redAccent : const Color(0xFF1E293B),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _isRecording ? Colors.red : const Color(0xFF334155),
                          width: 1.5,
                        ),
                      ),
                      child: Icon(
                        _isRecording ? Icons.stop : Icons.mic,
                        color: _isRecording ? Colors.white : const Color(0xFF818CF8),
                        size: 22,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Text Vent Input
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: Colors.white, fontSize: 13.5),
                      maxLines: null,
                      decoration: InputDecoration(
                        hintText: _isRecording
                            ? 'Listening... Recording 30s vent...'
                            : 'Type your interview vent...',
                        hintStyle: TextStyle(
                          color: _isRecording ? Colors.redAccent : const Color(0xFF64748B),
                          fontSize: 13,
                        ),
                        filled: true,
                        fillColor: const Color(0xFF161B26),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(color: Color(0xFF2E384D)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(color: Color(0xFF2E384D)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(color: Color(0xFF6366F1)),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onSubmitted: (_) => _submitTextVent(),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Send Button
                  IconButton(
                    icon: const Icon(Icons.send_rounded, color: Color(0xFF6366F1)),
                    onPressed: _isLoading || _isRecording ? null : () => _submitTextVent(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
