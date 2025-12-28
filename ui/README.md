# 项目说明
Learning languages's UI

# 技术架构
vite + react
NodeJS 20.16.0

# 启动方法
1. 安装 npm install
2. 调试 npm run dev
3. 获得产物 npm run build 得到 /dist

# 转化视频格式
rmvb -> mp4: ffmpeg -i input.rmvb -c:v libx264 -c:a aac -strict -2 output.mp4
mkv -> mp4: ffmpeg -i "input.mkv" -c:v libx264 -c:a aac -b:a 192k -movflags +faststart "output.mp4"