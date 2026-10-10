import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/recovery_card_model.dart';

class VentRagApiService {
  final String baseUrl;

  VentRagApiService({
    this.baseUrl = 'http://10.0.2.2:8000/api/vent', // Android emulator default; use http://localhost:8000 for iOS/Web
  });

  /// Submits text vent to the backend RAG pipeline
  Future<VentResponseModel> submitTextVent({
    required String text,
    String? stage,
  }) async {
    final uri = Uri.parse('$baseUrl/text');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'text': text,
        if (stage != null) 'stage': stage,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return VentResponseModel.fromJson(data);
    } else {
      throw Exception('RAG text analysis failed: ${response.statusCode} - ${response.body}');
    }
  }

  /// Submits 30-second audio voice vent to faster-whisper STT + RAG pipeline
  Future<VentResponseModel> submitAudioVent({
    required File audioFile,
    String? stage,
  }) async {
    final uri = Uri.parse('$baseUrl/audio');
    final request = http.MultipartRequest('POST', uri);

    request.files.add(await http.MultipartFile.fromPath('audio', audioFile.path));
    if (stage != null) {
      request.fields['stage'] = stage;
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return VentResponseModel.fromJson(data);
    } else {
      throw Exception('Audio vent analysis failed: ${response.statusCode} - ${response.body}');
    }
  }
}
