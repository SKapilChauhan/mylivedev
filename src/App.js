import React, { Component } from 'react';
import RouteConfig from './app/route';
import {LoginContext} from 'appSrcs/store/context';
import HttpUtils from 'appSrcs/utils/http';
import cache from 'appSrcs/utils/cache';
import './static/iconfont/iconfont.css';
import './static/css/app.css';
import Appsflyer from 'appSrcs/utils/appsflyer';
import { Control, Link  } from 'react-keeper';

class App extends Component {
	constructor(props) {
        super(props);
        this.state = {
        	isLogin : true,
            setLogin : this.setLogin.bind(this),
            sendFCMToken : this.sendFCMToken.bind(this),
            getMobileData : this.getMobileData.bind(this)
        };
        console.log(window.IsFxH5);
        if(window.IsFxH5 && window.H5_PLFX_NAME) {
            document.title = window.H5_PLFX_NAME.charAt(0).toUpperCase() + window.H5_PLFX_NAME.slice(1);
        } else if(window.H5_PLNAME){
            document.title = window.H5_PLNAME.charAt(0).toUpperCase() + window.H5_PLNAME.slice(1);
        }
	}

	//页面加载完成调用
    componentDidMount() {
        this.loginCheck();
        this.plusEvent();
        document.addEventListener('plusready',()=> {
            //Appsflyer跟踪安装初始化
            Appsflyer.init(window.plus);
        });
    }

    componentWillMount(){
        this.openAppUrl();
        //this.plusEvent();
    }

    //回退处理
    plusEvent(){
        var self = this;
        //处理Android回退事件
        document.addEventListener('plusready',()=> {
            const plus = window.plus || '';
            var firstBack = 0;
            plus && plus.key.addEventListener('backbutton', (e)=> {
                const mui = window.mui || '' ;
                var currentWebview = plus.webview.currentWebview();
                var now = Date.now || function () {
                    return new Date().getTime();
                };
                currentWebview.canBack(function (evt) {
                    if (evt.canBack) {
                        //有回退 返回上一个页面
                        window.history.go(-1);
                    } else {
                        if (!firstBack) {
                            //第一次回退
                            firstBack = now();
                            plus.nativeUI.toast('Press again to exit the app!');

                            setTimeout(function () {
                                firstBack = 0;
                            }, 2000);
                        } else if (now() - firstBack < 2000) {
                            //2秒内连续两次退出
                            plus.runtime.quit();
                        }
                    }
                })
             //停止  不弹出再按一次退出应用
            }, false);
            //this.openAppUrl();
            //监听点击推送事件  
            /* plus.push.addEventListener('click', function(msg) {  
                try {  
                    if(plus.os.name == "iOS") {  
                        var payload = msg.payload.payload;  
                    } else {  
                        var payload = msg.payload;  
                    }  
                    self.pushCallback(payload);  
                } catch(e) {  
                   
                }  
            }); */  
        });
    }

    //启动app内地址
    openAppUrl(){ 
        //console.log(Control.go());
        document.addEventListener('plusready',()=> {
            let plus = window.plus || '';
            var args = plus.runtime.arguments;
            if(args.indexOf("://#")){
                var tmp_data = plus.runtime.arguments.split("://#");
                if(tmp_data.length > 1){
                    Control.go(tmp_data[1], {
                        app_push: '1'
                    });
                }
            }
        });
    }

    //消息推送回调
    pushCallback(payload){  
        try { 
            if(payload.indexOf("/") != -1){
                payload = payload;
                Control.go(payload, {
                    app_push: '1'
                });  
            }
        } catch(e) {  
            
        }  
    }

    //登录校验
    loginCheck(){
    	//登录校验
        HttpUtils.get('/api.php?route=account/check',{})
        .then((responseData)=>{
            let isLogin = responseData && responseData.data.isLogged ? true : false;
            this.getMobileData();
            this.setState({
                isLogin : isLogin
            });
            if(window.IsDApp){
                let APP_ForcedLogin = process && process.env && process.env.APP_ForcedLogin ? process.env.APP_ForcedLogin : false;
                //强制登录
                if(APP_ForcedLogin == '1' && !isLogin){
                    Control.replace('/login', {
                        redirect_link: Control.path, redirect_state: Control.state
                    });
                }
            }
        }).catch(error=>{

        });
    }

    getMobileData(){
        let url = '/api.php?route=store/getStoreInfo';
        HttpUtils.get(url, {})
        .then((result) => {
            if(typeof result.data != 'undefined'){
                const data = result.data;
                console.log(JSON.stringify(data) + "dddddddddddddddddddddddddddddddd");
                cache.setLocalStorage("contact_no", data.send_detail_tel);
                this.sendFCMToken();
            }
        }).catch(ex => {
            console.error('ERROR');
        });
    }

    sendFCMToken(){
        var plus = window.plus;
        //var data = {"device_id": "kapil99990000", "contact_no": "kapil9650138386"};
        var contactNo = cache.getLocalStorage("contact_no");
        console.log(contactNo + "dnnnnnnnnnnnnnnnn");
        HttpUtils.post('/api.php?route=fcm/sendfcmtoken', {"device_id": plus.device.imei, "contact_no": contactNo})
        .then((res)=>{
            console.log(JSON.stringify(res) + "localsetvalue");
            //console.log(localStorage.getItem("contact_no") + "send after not login");
        });
    }

    //设置登录状态
	setLogin(isLogin){
		this.setState({
			isLogin : isLogin
		});
	}
    render() {
        return (
        	<LoginContext.Provider value={this.state}>
            <div className="App">
                <RouteConfig />
            </div>
            </LoginContext.Provider>
        );
    }
}

export default App;
