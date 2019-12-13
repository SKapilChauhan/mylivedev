import React, { Component } from 'react';
import {LoginContext} from 'appSrcs/store/context';
import {Control} from 'react-keeper';

function getDisplayName(component) {
  return component.displayName || component.name || 'Component';
}
const loginHoc = WrappedComponent => class extends Component {
	static displayName = `HOC(${getDisplayName(WrappedComponent)})`;
	
	componentDidMount(){
	}
	login(isLogin){
		if(!isLogin){
			Control.replace("/login", { redirect_link: Control.path, redirect_state: Control.state });
		}
		return isLogin;
	}
	render() {
		return (
			<LoginContext.Consumer>
                {
                	(value) => {
	                	const isLogin = value.isLogin
	                		,setLogin = value.setLogin;
	                	return <WrappedComponent {...this.props}
	                	setLoginStatus={setLogin}
	                	login = {()=>this.login(isLogin)}
			  			isLogin = {isLogin}
	                />}
            	}
            </LoginContext.Consumer>
		)
	}
};
export default loginHoc;