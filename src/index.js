import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter } from 'react-keeper';
import App from './App';
import * as serviceWorker from './serviceWorker';

//是否是分销商app
function isDistributorApp(){
	let hostname = window.location.hostname;
	let app_host = process.env.MAIN_DOMAIN;
    if(app_host && (app_host === hostname || hostname.indexOf(app_host) > 0 || app_host.indexOf(hostname) > 0)){
	    return true;
	} else {
	    return false;
	}
}

//是否分销商h5
function IsFxH5WEB(){
    let hostname = window.location.hostname;
    let web_host = process.env.H5_DOMAIN;
    if(web_host === hostname || hostname.indexOf(web_host) > 0 || (web_host && web_host.indexOf(hostname) > 0)){
        return true;
    } else {
        return false;
    }
}

window.IsDApp = isDistributorApp();
window.IsFxH5 = IsFxH5WEB();
window.H5_PLNAME = process.env.H5_PLNAME;
window.H5_PLFX_NAME = process.env.H5_PLFX_NAME;

//h5域名去掉favicon ico图标
if(window.IsFxH5){
    if(document.getElementById('site_favicon_link')){
        document.getElementById('site_favicon_link').setAttribute('href', 'data:;base64,=');
    }
}

ReactDOM.render(
	<HashRouter>
    	<App />
    </HashRouter>,
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
