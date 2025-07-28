import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:http/http.dart' as http;

class SubtitleEntry {
  final Duration start;
  final Duration end;
  final String text;
  SubtitleEntry(this.start, this.end, this.text);
}

class VideoPlayerPage extends StatefulWidget {
  final String title;
  final String videoUrl;
  final String subtitleUrl;
  const VideoPlayerPage({
    super.key,
    required this.title,
    required this.videoUrl,
    required this.subtitleUrl,
  });

  @override
  State<VideoPlayerPage> createState() => _VideoPlayerPageState();
}

class _VideoPlayerPageState extends State<VideoPlayerPage> {
  late VideoPlayerController _controller;
  List<SubtitleEntry> _subtitles = [];
  String _currentSubtitle = '';
  bool _showSubtitles = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.network(widget.videoUrl)
      ..initialize().then((_) => setState(() {}));
    _controller.addListener(_updateSubtitles);
    _loadSubtitles();
  }

  Future<void> _loadSubtitles() async {
    final response = await http.get(Uri.parse(widget.subtitleUrl));
    if (response.statusCode == 200) {
      final lines = const LineSplitter().convert(
        utf8.decode(response.bodyBytes),
      );
      List<SubtitleEntry> entries = [];
      for (int i = 0; i < lines.length - 2; i++) {
        if (lines[i].contains('-->')) {
          final times = lines[i].split(' --> ');
          final text = lines[i + 1];
          entries.add(
            SubtitleEntry(
              _parseDuration(times[0]),
              _parseDuration(times[1]),
              text,
            ),
          );
        }
      }
      setState(() => _subtitles = entries);
    }
  }

  Duration _parseDuration(String time) {
    final parts = time.split(':');
    final secondsParts = parts[2].split(',');
    return Duration(
      hours: int.parse(parts[0]),
      minutes: int.parse(parts[1]),
      seconds: int.parse(secondsParts[0]),
      milliseconds: int.parse(secondsParts[1]),
    );
  }

  void _updateSubtitles() {
    final pos = _controller.value.position;
    final match = _subtitles.firstWhere(
      (e) => pos >= e.start && pos <= e.end,
      orElse: () => SubtitleEntry(Duration.zero, Duration.zero, ''),
    );
    if (match.text != _currentSubtitle) {
      setState(() => _currentSubtitle = match.text);
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_updateSubtitles);
    _controller.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _togglePlay() => setState(() {
    _controller.value.isPlaying ? _controller.pause() : _controller.play();
  });

  void _seekBy(Duration offset) => setState(() {
    _controller.seekTo(_controller.value.position + offset);
  });

  void _toggleFullscreen() => setState(() {
    // if (_controller.value.isFullScreen) {
    //   _controller.setFullScreen(false);
    // } else {
    //   _controller.setFullScreen(true);
    // }
  });

  void _toggleSubtitles() => setState(() => _showSubtitles = !_showSubtitles);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.transparent,
        actions: [
          IconButton(
            icon: Icon(
              Icons.closed_caption,
              color: _showSubtitles ? Colors.white : Colors.grey,
            ),
            onPressed: _toggleSubtitles,
          ),
        ],
      ),
      body: _controller.value.isInitialized
          ? Stack(
              children: [
                Center(
                  child: AspectRatio(
                    aspectRatio: _controller.value.aspectRatio,
                    child: VideoPlayer(_controller),
                  ),
                ),
                if (_showSubtitles && _currentSubtitle.isNotEmpty)
                  Positioned(
                    bottom: 50,
                    left: 20,
                    right: 20,
                    child: Text(
                      _currentSubtitle,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        backgroundColor: Colors.black54,
                      ),
                    ),
                  ),
                _buildControls(),
              ],
            )
          : Center(child: CircularProgressIndicator()),
    );
  }

  Widget _buildControls() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        color: Colors.black45,
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            IconButton(
              icon: Icon(Icons.replay_10),
              onPressed: () => _seekBy(const Duration(seconds: -10)),
            ),
            IconButton(
              icon: Icon(
                _controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
              ),
              onPressed: _togglePlay,
            ),
            IconButton(
              icon: Icon(Icons.forward_10),
              onPressed: () => _seekBy(const Duration(seconds: 10)),
            ),
            IconButton(
              icon: Icon(Icons.fullscreen),
              onPressed: _toggleFullscreen,
            ),
          ],
        ),
      ),
    );
  }
}
