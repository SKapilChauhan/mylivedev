PS:本机有装hadoop环境的用户，注意yarn命令可能并非指向正确的路径，此时应使用绝对路径 C:\Users\用户名\AppData\Roaming\npm\node_modules\yarn\bin\yarn [Win，其它系统同]来运行，或者也可以删除hadoop的环境变量[如果hadoop环境变量并非必须的话]

(1)、项目搭建

	1、安装node https://nodejs.org/zh-cn/ 已安装node忽略

	2、npm包源设置

	npm config set registry https://registry.npm.taobao.org --global
	npm config set disturl https://npm.taobao.org/dist --global

    3、使用npm安装yarn

       npm install yarn -g

    4、安装包[进入项目wap目录下运行]

    	yarn install

	5、本地运行[运行后自动打开浏览器的http://localhost:3000]

		yarn start

		本地运行，需要解决跨域问题

		Header set Access-Control-Allow-Origin "*"

		wap/src/config/app.js server_url 是服务器的api请求地址，开发测试用，发布使用相对域名

		运行地址：http://dev.shogee.com:3000

	3、编译发布

		yarn build

		运行地址：http://dev.shogee.com/wap/app
		
    
（2）包管理

	1、自动更新包 yarn install


    根据package.json自动安装更新包

    2、添加包

       yarn add 包名

    3、删除包

       yarn remove 包名



     