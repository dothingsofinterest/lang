# 项目说明
Learning any language's web api

# 使用方法
1. 编译：tsc
2. 启动 WEB 服务：npm run start （node dist/app.js）
3. 部署生产时，只需将 dist, node_modules 放到任何位置，然后启动 WEB 服务 node dist/app.js

# 账号
admin 123456

# 技术架构
NodeJS 20.16.0
Express

# 降低视频篇幅、码率。该命令生成的视频，以最小化浏览器播放后，再回来会出现画面与声音不同步的问题。
ffmpeg -i a.mp4 -y -vf scale=600:-2 -c:v libx264 -b:v 600k -profile:v baseline -level 3.0 -g 24 -c:a copy -r 24 -video_track_timescale 24 -vsync 1 -shortest -movflags faststart output.mp4

【参数说明】
-y 如果文件已存在则覆盖
-vf scale=800:-2：宽度 800，高度自适应。
-b:v 600k：比特率 600 kb/s。每秒输出的数据。
-c:v libx264 H.264 压缩方式。
-profile:v baseline -level 3.0：使用 Baseline 配置文件，提升浏览器兼容性。
-g 24：关键帧间隔设为 24 帧（1 秒，假设 24 fps），便于浏览器恢复播放。
-c:a copy：复制原始音频，避免重新编码误差。
-r 24：强制帧率 24 fps（可根据输入调整）。
-video_track_timescale 24：时间基 1/24，与输入对齐。
-vsync 1：恒定帧率模式，确保视频帧与音频同步。
-shortest：以最短流时长为准，裁剪多余部分（避免时长差异）。
-movflags faststart：优化 MP4 容器。

【可修改参数】
[帧率]
-g 30
-r 30
-video_track_timescale 30
[篇幅]
-vf scale=500:-2
[码率]
-b:v 500k
