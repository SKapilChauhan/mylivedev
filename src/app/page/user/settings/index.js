import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import { Link, Control } from 'react-keeper';
import Toast from "appSrcs/component/toast/index";
import loginHoc from 'appSrcs/component/hoc/loginHoc';

import './index.css';

//setting
class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header_title: 'Account Setting'
        };
        document.title = 'Account Setting';
    };

	//页面加载完成调用
    componentDidMount() {
        
    }


    //注销
    onLogOut(){
        let self = this;
        Toast.confirm({
            text: 'DO you want to logout?',
            onConfirm: function(){
               HttpUtils.get('/api.php?route=account/user/signout', {})
                .then((responseData) => {
                    if(responseData.code == '0000'){  
                        self.props.setLoginStatus(false);
                        Control.go('login');
                    } else if(responseData.message != ''){
                        Toast.danger(responseData.message);
                    }
                }).catch(ex => {
                    
                });
            }
        });
    }

    renderMenuItems(){
        return (
            <ul className="mlistGroup">
                <li className="mlistGroupItem">
                    <a  onClick={()=>this.onLogOut()}>
                        <span className="iconfont icon-logout"></span>
                        Logout
                        <span className="to">&gt;</span>
                    </a>
                </li>   
            </ul>
        )
    }

	render() {
        return(
            <Layout current_route='account' isBack={true} header_title={this.state.header_title}>
                {this.renderMenuItems()}
            </Layout>
        )
	}
}

export default loginHoc(Home);