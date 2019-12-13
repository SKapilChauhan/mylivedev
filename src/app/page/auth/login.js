// component/hearder
import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import SimpleReactValidator from 'simple-react-validator';
import {Control} from 'react-keeper';
import loginHoc from 'appSrcs/component/hoc/loginHoc';
import ReactPhoneInput from 'react-phone-input-2';
import './index.css';
import login_image from "appSrcs/static/images/login.png";
import nlogin_image from "appSrcs/static/images/nlogin.png";
import Toast from "appSrcs/component/toast/index";
import Appsflyer from "appSrcs/utils/appsflyer";


//首页
class Login extends Component {

    constructor(props) {
        super(props);
        this.redirect_link = (Control.state && Control.state.redirect_link) || '';

        //处理当前已未登录，更改状态为未登录
        let is_no_login_cache = window.sessionStorage.getItem('is_no_login_cache', '');
        this.is_no_login = is_no_login_cache == '1' ? true : false;
        window.sessionStorage.removeItem('is_no_login_cache');
        if(this.is_no_login){
            props.setLoginStatus(false);
        }

        if(this.redirect_link == '/checkout'){
            this.redirect_link = '/cart';
        }
        this.redirect_state = (Control.state && Control.state.redirect_state) || '';
        this.isDApp = window.IsDApp;
        this.state = {
            header: '',
            reg_phone: '',
            reg_scode: '',
            reg_referral_code: '',
            regError: '',
            reg_verificate_code_enable: 1,
            login_first: 'block',
            login_display: 'none',
            login_ref_display: 'none',
            login_image: login_image,
            nlogin_image: nlogin_image
        };
        document.title = 'Login';
        if(window.IsFxH5) {
            this.state.login_image = this.state.nlogin_image;
        }

        //登录验证
        this.login_validator = new SimpleReactValidator({
            element: (message, className) => <div className='errormsg'>{message}</div>
        });

        //注册验证
        this.reg_validator = new SimpleReactValidator({
            element: (message, className) => <div className='errormsg'>{message}</div>
        });

        //处理回退到已登录的 登录页面
        if(!this.is_no_login && props.isLogin){
            if(window.history.length > 0){
                window.history.back();
            }else {
                Control.go('/');
            }

        }
    };

    //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
    }


    //显示登录注册
    showLogin(){
    	this.setState({
    		login_first: 'none',
            login_display: 'block',
    	})
    }

    //注册提交
    onReg(){
        this.setState({
            regError: ''
        })
        if (!this.reg_validator.allValid()) {
            this.reg_validator.showMessages();
            this.forceUpdate();
            return false;
        }
        Toast.showLoading();
        let phone = this.state.reg_phone;
        phone = phone.replace('+', '');
        HttpUtils.post('/api.php?route=account/user/signup',{
            'telephone' : phone,
            'scode': this.state.reg_scode
        })
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code === '0000'){
                this.props.setLoginStatus(true);
                let is_reg = responseData.data && typeof responseData.data.nouser != 'undefined' && responseData.data.nouser ? true : false;
                if(this.isDApp && responseData.data && is_reg){
                    let referralHeader = <div className="mobileHeader">
                        <div className="mobileHeaderBox clearfix">
                           <div className="mobileHeaderTitle">Referral Code</div>
                        </div>
                    </div>
                    this.setState({
                        login_display: 'none',
                        login_ref_display: 'block',
                        header: referralHeader,
                        reg_referral_code: responseData.data.code
                    });
                } else {
                    this.loginRedirect();
                }
                if(is_reg){
					//注册跟踪事件
                    Appsflyer.signup('phone');
                } else {
					//登录跟踪事件
                    Appsflyer.login('phone');
                }
            } else {
                let message = responseData.message !== '' ? responseData.message : '';
                this.setState({
                    regError: message
                });
            }
        }).catch(error=>{
            Toast.hideLoading();
            Toast.danger('OH, an error has occurred, or check your network and try it again');
        });
    }

    //确认推荐码
    onConfirmRefer(){
        let reg_referral_code = this.state.reg_referral_code;
        if(reg_referral_code == ''){
            this.loginRedirect();
            return false;
        }
        Toast.showLoading();
        HttpUtils.post('/api.php?route=account/user/icode',{
            'icode' : reg_referral_code
        })
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code === '0000'){
                this.loginRedirect();
            } else {
                let message = responseData.message !== '' ? responseData.message : '';
                Toast.danger(message);
            }
        }).catch(error=>{
            Toast.hideLoading();
            Toast.danger('OH, an error has occurred, or check your network and try it again');
        });
    }

    //登录成功跳转
    loginRedirect(){
        if(this.redirect_link){
            Control.replace(this.redirect_link, this.redirect_state);
        } else {
            Control.replace('/user/index');
        }
    }

    //发送验证码
    onSendCode(){

        //是否可发送
        if(!this.state.reg_verificate_code_enable){
            return false;
        }
        let phone = this.state.reg_phone;
        phone = phone.replace('+', '');
        if(!phone){
            Toast.danger({
                text: 'Please input the phone!',
                autoHide: true,
                duration: 3000,
            })
            return false;
        }
        Toast.showLoading();
        //发送
        HttpUtils.post('/api.php?route=sms/code/fetch',{
            'telephone' : phone
        })
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code === '0000'){
               this.codeCallback();
            } else {
                let message = responseData.message !== '' ? responseData.message : '';
                Toast.danger({
                    text: message,
                    autoHide: true,
                    duration: 3000,
                });
            }
        }).catch(error=>{
            Toast.hideLoading();
            Toast.danger('OH, an error has occurred, or check your network and try it again');
        });
    }

    //验证码定时
    codeCallback(){
        var self = this;
        //倒计时功能
        var time = 60;
        var interval = setInterval(function(){
            if(time > 0){
                time = time -1;
                self.setState({
                    reg_verificate_code_time: time,
                    reg_verificate_code_enable: false
                });
            }
            if(time <= 0){
                clearInterval(interval);
                self.setState({
                    reg_verificate_code_time: 0,
                    reg_verificate_code_enable: true
                });
            }
        }, 1000);
    }

    renderTitle(){
        if(window.IsFxH5) {
        } else {
            return (
                <div className="loginTip">
                    <p className="loginTipH">Helping 10000000+ Women</p>
                    <p>Earn ₹30000 At HOME Every Month</p>
                    <p>With ZERO Investment</p>
                </div>
            )
        }
    }

    render() {
        let codeClass = !this.state.reg_verificate_code_enable ? 'disabled' : '';
        return(
            <Layout header={this.state.header} current_route="account" footer=''  pageClass="loginPageWrap">
                <div className="loginImageBox" style={{'display': this.state.login_first}}>
                    <div className="loginBackground">
                        <img src={this.state.login_image} alt='' />
                    </div>
                    <div className="loginButton">
                        <input type="button" className="button" onClick={() => this.showLogin()} value="Login/Sign Up With Mobile Number" />
                    </div>
                </div>
                <div className="loginBox" style={{'display': this.state.login_display}}>
                    <div className="loginBox">
                        {this.renderTitle()}
                        <div className="signPanelContent">
                            <div className="formGroup phoneInput">
                                <ReactPhoneInput defaultCountry='in' autoFormat={false} name="phone" value={this.state.reg_phone }  onChange={ value => this.setState({ reg_phone: value }) }  />
                                <button className={'codeBtn ' + codeClass} onClick={() => this.onSendCode()} >Send</button>
                            </div>
                            <div className="formGroup">
                                <div>
                                    <div className="regcodeBox">
                                        <input type="number" className="formControl" name="scode"  value={this.state.reg_scode} placeholder="verification code"
                                            onChange={(event) => this.setState({reg_scode: event.target.value})}
                                        />
                                        <div className="formGroup formGroup-btn">
                                            <button className="loginBtn" value="CONTINUE" onClick={() => this.onReg()}>Log In</button>
                                        </div>
                                    </div>
                                    {
                                        this.state.reg_verificate_code_time > 0 &&
                                        <div className="regcodeTip">
                                            <span>
                                                Verification code will be sent to your phone :
                                                <span className="stext">{this.state.reg_phone}</span>
                                            </span>
                                            <div>
                                                After <span className="stext">{this.state.reg_verificate_code_time}</span> second you can be regenerated again
                                            </div>
                                        </div>
                                    }
                                    {this.reg_validator.message('scode', this.state.reg_scode, 'required')}
                                </div>
                            </div>
                            <div className="formGroup">
                                <span className="errormsg">{this.state.regError}</span>
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div style={{'display': this.state.login_ref_display}}>
                    <div className="loginBox">
                        <div className="signPanelContent" style={{'paddingTop': '30px'}}>
                            <div className="formGroup">
                                <div className="formGroup">
                                    <input type="text" className="formControl" name="referral_code" value={this.state.reg_referral_code} placeholder="Referral Code"
                                        onChange={(event) => this.setState({reg_referral_code: event.target.value})}
                                    />
                                    <div className="reftipinfo">You can skip this if you don't have one</div>
                                </div>
                                <div className="formGroup formGroup-btn">
                                    <button className="loginBtn" value="Confirm" onClick={() => this.onConfirmRefer()}>Next</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }
}

export default loginHoc(Login);