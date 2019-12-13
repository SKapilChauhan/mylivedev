import appConfig from '../config/app';
import { Control  } from 'react-keeper';
//请求地址
const host = appConfig.server_url;
//是否跨域
const request_mode = appConfig.mode;
//是否带cookie
let credentials = appConfig.credentials;
export default class HttpUtils{

	//cache get请求
	static getShareUrl(url, data){
		if(window.IsDApp){
			url = (process.env.Share_Base_URL ? process.env.Share_Base_URL : '') + url;
		} else {
			url = host + url;
		}
		let headers = this.getHeader(data);
		if(data){
			url = this.queryUrl(url, data);
		}
		return new Promise((resolve,reject)=>{
			fetch(url, {
				headers: headers,
				mode: request_mode,
				credentials: credentials
			})
			.then(response=>response.json())
			.then(result=>{
				resolve(result)
				//全局处理
				this.globalHander(result);
			})
			.catch(error=>reject(error));
		});
	}

	//get请求
	static get(url, data){
		url = host + url;
		let headers = this.getHeader(data);
		if(data){
			url = this.queryUrl(url, data);
		}
		return new Promise((resolve,reject)=>{
			fetch(url, {
				headers: headers,
				mode: request_mode,
				credentials: credentials
			})
			.then(response=>response.json())
			.then(result=>{
				resolve(result)
				//全局处理
				this.globalHander(result);
			})
			.catch(error=>reject(error));
		});
	}

	//post请求
	static post(url, data,isFormData){
		url = host + url;
		let headers = {};
		if(!isFormData){
			headers['Content-Type'] = "application/x-www-form-urlencoded";
		}
		headers = this.getHeader(data, headers);
		let body = [];
		if(isFormData){
			body= data;
		}else {
			for(var key in data){
				body.push(key + "=" + data[key]);
			}
			body = body.join('&');
		}
		return new Promise((resolve,reject)=>{
			fetch(url,  {
				headers: headers,
				mode: request_mode,
				credentials: credentials,
				method : 'POST',
				body: body
			})
			.then(response=>response.json())
			.then(result=>{
				resolve(result)
				//全局处理
				this.globalHander(result);
			})
			.catch(error=>reject(error));
		});
	} 

	///全局处理
	static globalHander(result){
		//未登录,跳转登录
		if(result && result.code == '4003'){
			Control.replace("/login", { redirect_link: Control.path, redirect_state: Control.state, is_no_login: true });
			window.sessionStorage.setItem('is_no_login_cache', '1');
			return;
		}
	}

	//header处理
	static getHeader(data, new_header){
		let headers =  {
			"Accept": "application/json"
		}
		if(new_header){
			headers = Object.assign(headers, new_header);
		}
		return headers;
	}

	//参数url处理
	static queryUrl(url, params) {  
        let paramsArray = [];  
        //拼接参数  
        Object.keys(params).forEach(key => paramsArray.push(key + '=' + params[key]))  
        if(!paramsArray || paramsArray.length == 0){
			return url;
		}
        if (url.search(/\?/) === -1) {  
            url += '?' + paramsArray.join('&')  
        } else {  
            url += '&' + paramsArray.join('&')  
        }  
        return url;
    }  
}