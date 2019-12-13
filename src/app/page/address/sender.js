import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import Toast from "appSrcs/component/toast/index";
import SimpleReactValidator from 'simple-react-validator';

import './index.css';

class SenderForm extends Component{
    constructor(props) {
        super(props);
        let saveType = props.saveType;
        let sender = props.sender;
        if(!sender || saveType === 'add'){
            sender = {
                sender_name: '',
                sender_phone: ''
            };
        }
        this.state = {
            sender: sender,
            saveType: saveType
        };
        this.validator = new SimpleReactValidator({
            element: (message, className) => <div className='errormsg'>{message}</div>
        });
    };
    setSender(name, value){
        let sender = this.state.sender;
        sender[name] = value;
        this.setState({
            sender: sender
        });
    }

    onSave(){
        if (!this.validator.allValid()) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        if(this.state.saveType === 'add'){
            this.addSender();
        } else {
            this.updateSender();
        }
    }

    addSender(){
        let sender = this.state.sender;
        this.props.addSender(sender);
    }

    updateSender(){
        let sender = this.state.sender;
        let sender_data = {
            sid: sender['sender_id'],
            sender_name: sender['sender_name'],
            sender_phone: sender['sender_phone']
        }
        this.props.updateSender(sender_data);
    }

    onBack(){
        this.props.onBack();
    }

    render(){
        let sender = this.state.sender;
        return (
            <div className="addressFormContent">
                <div className="formGroupList clearfix">
                    <div className="formGroup">
                        <div className="formGroupLabel"><span className="text-red">*</span>User Name</div>
                        <input type="text" className="formControl" name="sender_name" value={sender.sender_name || ''} placeholder="User Name"
                            onChange={(event) => this.setSender('sender_name', event.target.value)}
                        />
                        {this.validator.message('User Name', sender.sender_name, 'required')}
                    </div>
                    <div className="formGroup">
                        <div className="formGroupLabel"><span className="text-red">*</span>Phone Number</div>
                        <input type="text" className="formControl" name="telephone" value={sender.sender_phone || ''} placeholder="Phone Number"
                            onChange={(event) => this.setSender('sender_phone', event.target.value)}
                        />
                        {this.validator.message('Phone Number', sender.sender_phone, 'required')}
                    </div>
                </div>
                <div className="formGroup formGroup-btn">
                    <button className="btn btnBlock btnPrimary" value="Save" onClick={() => this.onSave()}>Save</button>
                </div>
            </div>
        )
    }
}

//底部组件
function FooterComponent(props) {
    return (
        <div className="mobileFooter">
            <ul className="footNavInfo clearfix">
                <li className="ripple" style={{width: '50%', backgroundColor: '#ff5a61', 'color': '#ffffff'}}>
                    <a href="javascript:void(0)" onClick={() => props.addSender()}>
                        <span className="text" style={{'color': '#ffffff'}}>Add New</span>
                    </a>
                </li>
                <li className="ripple" style={{width: '50%', backgroundColor: '#ff5a61', 'color': '#ffffff', backgroundImage: 'linear-gradient(45deg, #24d144 0%, #42e75c 100%)'}}>
                    <a href="javascript:void(0)" onClick={() => props.confirmSelect()}>
                       <span className="text" style={{'color': '#ffffff'}}>Confirm</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}

class Sender extends Component {

    constructor(props) {
        super(props);
        this.footer = <FooterComponent addSender={() => this.addForm()}  confirmSelect ={() => this.confirmSelect()}/>
        let sender_id = this.props.sender_id;
        this.state = {
            sender_list: [],
            footer: this.footer,
            header_title: "Sender Details",
            sender_id: sender_id
        };
        document.title = 'Sender Details';
        this.validator = new SimpleReactValidator({
            element: (message, className) => <div className='errormsg'>{message}</div>
        });
    };

    //页面加载完成调用
    componentDidMount() {
        this.getSenderList();
    }

    //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
    }

    //获取列表
    getSenderList(callback){
        HttpUtils.get('/api.php?route=shopping/sender')
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let sender_list = responseData.data;
                let is_checked = false;
                if(sender_list != null && this.state.sender_id){
                    for(var i in sender_list){
                        if(sender_list[i]['sender_id'] == this.state.sender_id){
                            sender_list[i]['checked'] = '1';
                            is_checked = true;
                        } else {
                            sender_list[i]['checked'] = '0';
                        }
                    }
                }
                if(!is_checked && sender_list && sender_list.length > 0){
                    sender_list[0]['checked'] = '1';
                }
                this.setState({
                    sender_list: sender_list
                })
            } else {
                
            }
            callback && callback();
        }).catch(error=>{
            
        });
    }

    //显示添加表单
    addForm(){
        let self = this;
        self.setState({
            showForm: true,
            saveType: 'add',
            footer: null,
            header_title: 'Add Sender'
        });
    }

    //编辑表单
    editForm(sender){
        let self = this;
        self.setState({
            showForm: true,
            saveType: 'edit',
            footer: null,
            editSender: sender,
            header_title: 'Edit Sender'
        });
    }

    //隐藏编辑表单
    hideEditForm(){
        this.setState({
            showForm: false,
            footer: this.footer,
            header_title: 'Sender'
        }); 
    }

    //返回
    onBack(){
        if(this.state.showForm){
            this.hideEditForm();
        } else if(this.props.onBack && typeof this.props.onBack === 'function'){
            this.props.onBack();
        } else {
            window.history.go(-1);
        }
    }

    //添加
    addSender(sender){
        let self = this;
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/sender/add', sender)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                if(responseData.data.sid){
                    this.setState({
                        sender_id: responseData.data.sid
                    })
                }
                self.getSenderList(function(){
                    Toast.hideLoading();
                    self.hideEditForm();
                });
            } else if(responseData.message !== '') {
                Toast.hideLoading();
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }

    //更新
    updateSender(sender){
        let self = this;
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/sender/update', sender)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                self.getSenderList(function(){
                    Toast.hideLoading();
                    self.hideEditForm();
                });
            } else {
                Toast.hideLoading();
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }

    //选择
    handleSelect(key){
        let sender_id = 0;
        let sender_list = this.state.sender_list;
        for(var i in sender_list){
            if(i == key){
                sender_list[i]['checked'] = '1';
                sender_id = sender_list[i]['sender_id'];
            } else {
                sender_list[i]['checked'] = '0';
            }
        }
        this.setState({
            sender_list: sender_list,
            sender_id: sender_id
        }); 
    }

    //确认选择
    confirmSelect(){
        let sender_id = 0;
        let sender_list = this.state.sender_list;
        for(var i in sender_list){
            if(sender_list[i]['checked'] == '1'){
                sender_id = sender_list[i]['sender_id']
            }
        }
        if(!sender_id){
            Toast.danger('Added or selected sender!');
            return false;
        }
        this.props.confirmSelect(sender_id);
    }

    senderList(){
        let sender_list = this.state.sender_list;
        if(!sender_list || sender_list.length === 0){
            return null;
        }
        return (
             <ul className="addressListBox">
                {
                    sender_list.map((item, index) => {
                        return (
                            <li className="addressItem" index={index} key={index.toString()}>
                                <div className="check checkBlock">
                                    <div className="checkbox">
                                        <input type="checkbox" checked={item['checked'] && item['checked'] == '1' ? true : false}  onChange={()=>{this.handleSelect(index)}}  />
                                        <label htmlFor="checkbox" className="checkbox-label"></label>
                                    </div>
                                </div>
                                <div className="info">
                                    <div>
                                        <span className="username">{item['sender_name']}</span>
                                    </div>
                                    <div>
                                        <span className="phone">{item['sender_phone']}</span>
                                    </div>
                                </div>
                                <a className="editBtn" href="javascript:void(0)" onClick={()=>{this.editForm(item)}}>Edit</a>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }

    render(){
        return (
            <Layout isBack={true} onBack={() => this.onBack()} header_title={this.state.header_title} footer={this.state.footer}>
                <div className="addressContent" style={{'display': this.state.showForm ? 'none' : 'block'  }}>
                    {this.senderList()}
                    <div className="senderTip">
                        <span className="iconfont icon-tips"></span>
                        <span>we will send the shipment to the customer on behalf of the chosen sender.</span>
                    </div>
                </div>
                {
                    this.state.showForm &&  <SenderForm onBack={() => this.hideForm()} saveType={this.state.saveType} zones={this.state.zones}
                     sender={this.state.editSender} addSender={(sender) => this.addSender(sender)} updateSender={(sender) => this.updateSender(sender)}  />
                }
            </Layout>
        )
    }
}

export default Sender;