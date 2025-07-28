import 'package:flutter/material.dart';
import 'package:stream_vault/pages/video_player.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: VideoPlayerPage(
        videoUrl:
            "http://192.168.1.107:8081/api/video?objectName=The%20Conjuring%20(2013)%2FThe.Conjuring.2013.720p.BluRay.x264.YIFY.mp4",
        subtitleUrl:
            "http://192.168.1.107:8081/api/subtitles?objectName=How%20To%20Train%20Your%20Dragon%20%282025%29%20%5B720p%5D%20%5BWEBRip%5D%20%5BYTS.MX%5D%2FHow.To.Train.Your.Dragon.2025.720p.WEBRip.x264.AAC-%5BYTS.MX%5D.srt",
        title: "The Conjuring (2013)",
      ),
    );
  }
}
