# lang
Learning Language


#
1. 启动 api server: 
	进入项目目录：cd server/api
	编译：tsc 
	启动：node dist/app.js
	
2. 启动 ui server:
	进入项目目录：cd server/ui
	编译：tsc 
	启动：node dist/app.js
	
3. 编译前端产物并部署
	进入项目目录：cd ui/frontend
	编译：npm run build
	将前端编译产物复制到 server/ui/dist/views 下