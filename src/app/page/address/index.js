import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import Toast from "appSrcs/component/toast/index";
import SimpleReactValidator from 'simple-react-validator';
import empty_image from 'appSrcs/static/images/no_result.png';
import cache from "appSrcs/utils/cache";
import LoadingComponent from "appSrcs/component/loading";

import './index.css';

//地址表单
class AddressForm extends Component{

    constructor(props) {
        super(props);
        let saveType = props.saveType;
        let address = props.address;
        if(!address || saveType == 'add'){
            address = {
                firstname: '',
                lastname: '',
                telephone: '',
                address_1: '',
                address_2: '',
                country_id: this.props.default_country_id,
                city: '',
                zone_id: '',
                landmark: '',
                postcode: '',
                default: true
            };
        }
        this.state = {
            address: address,
            saveType: saveType,
            zones: this.props.zones
        };
        this.validator = new SimpleReactValidator({
            element: (message, className) => <div className='errormsg'>{message}</div>
        });
    };

    //地址编辑框改变
    setAddress(name, value){
        let address = this.state.address;
        address[name] = value;
        this.setState({
            address: address
        });
    }

    //地址保存
    onSave(){
        if (!this.validator.allValid()) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        if(this.state.saveType == 'add'){
            this.addAddress();
        } else {
            this.updateAddress();
        }
    }

    ondDefaultChange(event){
        const target = event.target;
        const value = target.checked === true ? true : false;
        this.setAddress('default', value);
    }

    //添加地址
    addAddress(){
        let address = this.state.address;
        this.props.addAddress(address);
    }

    //更新地址
    updateAddress(){
        let address = this.state.address;
        let address_data = {
            aid: address['address_id'],
            firstname: address['firstname'],
            lastname: address['lastname'],
            telephone: address['telephone'],
            address_1: address['address_1'],
            address_2: address['address_2'],
            country_id: address['country_id'],
            city: address['city'],
            zone_id: address['zone_id'],
            landmark: address['landmark'],
            postcode: address['postcode'],
            default: address['default']
        }
        this.props.updateAddress(address_data);
    }

    //返回
    onBack(){
        this.props.onBack();
    }

    render(){
        let address = this.state.address;
        let zones = this.state.zones;
        return (
            <div className="addressFormContent">
                <div className="formGroupList clearfix">
                    <div className="formGroup">
                        <div className="formGroupLabel"><span className="text-red">*</span>First Name</div>
                        <input type="text" className="formControl" name="firstname" value={address.firstname || ''} placeholder="first name"
                            onChange={(event) => this.setAddress('firstname', event.target.value)}
                        />
                        {this.validator.message('first_name', address.firstname, 'required')}
                    </div>
                    <div className="formGroup">
                        <div className="formGroupLabel"><span className="text-red">*</span>Last Name</div>
                        <input type="text" className="formControl" name="lastname" value={address.lastname || ''} placeholder="Last Name"
                            onChange={(event) => this.setAddress('lastname', event.target.value)}
                        />
                        {this.validator.message('lastname', address.lastname, 'required')}
                    </div>
                </div>
                <div className="formGroup">
                    <div>
                        <div className="formGroupLabel"><span className="text-red">*</span>Phone Number</div>
                        <input type="text" className="formControl" name="telephone" value={address.telephone || ''} placeholder="Phone Number"
                            onChange={(event) => this.setAddress('telephone', event.target.value)} maxLength="32"
                        />
                        {this.validator.message('Phone Number', address.telephone, 'required')}
                    </div>
                </div>
                <div className="formGroup">
                    <div>
                        <div className="formGroupLabel"><span className="text-red">*</span>Flat/House No./Building</div>
                        <input type="text" className="formControl" name="address_2" value={address.address_2 || ''} placeholder="Flat/House No./Building"
                            onChange={(event) => this.setAddress('address_2', event.target.value)}
                        />
                        {this.validator.message('Flat/House No./Building', address.address_2, 'required')}
                    </div>
                </div>
                <div className="formGroup">
                    <div>
                        <div className="formGroupLabel"><span className="text-red">*</span>Street/Colony</div>
                        <input type="text" className="formControl" name="address_1" value={address.address_1 || ''} placeholder="Street/Colony"
                            onChange={(event) => this.setAddress('address_1', event.target.value)}
                        />
                        {this.validator.message('Street/Colony', address.address_1, 'required')}
                    </div>
                </div>
                <div className="formGroupList clearfix">
                    <div className="formGroup">
                        <div className="formGroupLabel"><span className="text-red">*</span>City</div>
                        <input type="text" className="formControl" name="city" value={address.city || ''} placeholder="City"
                            onChange={(event) => this.setAddress('city', event.target.value)}
                        />
                        {this.validator.message('City', address.city, 'required')}
                    </div>
                    <div className="formGroup">
                        <div className="formGroupLabel">Landmark</div>
                        <input type="text" className="formControl" name="landmark" value={address.landmark || ''} placeholder="Landmark"
                            onChange={(event) => this.setAddress('landmark', event.target.value)}
                        />
                    </div>
                </div>
                <div className="formGroupList clearfix">
                    <div className="formGroup">
                        <div className="formGroupLabel"><span className="text-red">*</span>Select State</div>
                        <select className="formControl" name="zone_id" value={address.zone_id || ''} onChange={(event) => this.setAddress('zone_id',  event.target.value)}>
                            <option value="">Select State</option>
                            {
                                zones ? zones.map((item, index) => {
                                    return (
                                        <option value={item['zone_id']} key={index}>{item['zone_name']}</option>
                                    )
                                }) : null
                            }
                        </select>
                        {this.validator.message('State', address.zone_id, 'required')}
                    </div>
                    <div className="formGroup">
                        <div className="formGroupLabel"><span className="text-red">*</span>Zip Code</div>
                        <input type="text" className="formControl" name="postcode" value={address.postcode || ''} placeholder="Zip Code"
                            onChange={(event) => this.setAddress('postcode', event.target.value)}
                        />
                        {this.validator.message('Pin Code', address.postcode, 'required')}
                    </div>
                </div>
                <div className="formGroup setDefaultBox">
                    <span>Set as Default </span>
                    <label className="switchBox">
                        <input name="default" checked={address.default ? true : false} className="mui-switch mui-switch-anim switch" type="checkbox" 
                        onChange={(event) => this.ondDefaultChange(event)} />
                    </label>
                </div>
                <div className="formGroup formGroup-btn">
                    <button className="btn btnBlock btnPrimary" value="Save" onClick={() => this.onSave()}>Save</button>
                </div>
            </div>
        )
    }
}

class AddressBook extends Component {

    constructor(props) {
        super(props);
        //选择的address_id
        let address_id = this.props.address_id;
        this.is_select = this.props.is_select ? true : false;
        this.footer = this.footerComponent();
        this.state = {
            loading: true,
            //头部标题
            header_title: "Shipping Address",
            //底部
            footer: this.footer,
            //地址列表
            address_list: null,
            //选择的id
            address_id: address_id,
            //州数据
            zones: [],
            is_select:  this.is_select
        };
        document.title = 'Shipping Address';
    };

    //页面加载完成调用
    componentDidMount() {
        this.getAddressList();
    }

     //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
    }

    //获取地址列表
    getAddressList(callback){
        HttpUtils.get('/api.php?route=shopping/address')
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let address_list = responseData.data['address_list'];
                let default_country_id = responseData.data['default_country_id'];
                let is_checked = false;
                if(address_list != null && this.state.address_id){
                    for(var i in address_list){
                        if(address_list[i]['address_id'] == this.state.address_id){
                            address_list[i]['checked'] = '1';
                            is_checked = true;
                        } else {
                            address_list[i]['checked'] = '0';
                        }
                    }
                } 
                if(!is_checked){
                    for(var j in address_list){
                        if(!is_checked && address_list[j]['default'] == '1'){
                            address_list[j]['checked'] = '1';
                            is_checked = true;
                        } else {
                            address_list[j]['checked'] = '0';
                        }
                    }
                }
                if(!is_checked && address_list && address_list.length > 0){
                    address_list[0]['checked'] = '1';
                }
                this.setState({
                    address_list: address_list,
                    default_country_id: default_country_id,
                    loading: false
                })
            }
            typeof callback == 'function' && callback();
        }).catch(error=>{
            
        });
    }

    //加载省份
    loadZone(callback){
        let default_country_id = this.state.default_country_id;
        HttpUtils.post('/api.php?route=shopping/address/zone', {'cid': default_country_id})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let zones = responseData.data ? responseData.data : [];
                this.setState({
                    zones: zones
                });
            }
            callback && callback();
        }).catch(error=>{
            
        });
    }

    //显示添加地址表单
    showAddAddressForm(){
        let self = this;
        this.loadZone(function(){
            self.setState({
                showForm: true,
                saveType: 'add',
                footer: null,
                header_title: 'Add Address'
            });
        });
    }

    //加载地址编辑表单
    showEditAddressForm(address){
        let self = this;
        this.loadZone(function(){
            self.setState({
                showForm: true,
                footer: null,
                saveType: 'edit',
                editAddress: address,
                header_title: 'Edit Address'
            });
        });
    }

    //隐藏地址编辑表单
    hideAddressForm(){
        this.setState({
            showForm: false,
            footer: this.footer,
            header_title: 'Address Book'
        }); 
    }

    //返回
    onBack(){
        if(this.state.showForm){
            this.hideAddressForm();
        } else {
            if(this.props.onBack){
                this.props.onBack && this.props.onBack()
            } else {
                window.history.go(-1);
            }
        }
    }

    //添加地址
    addAddress(address){
        let self = this;
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/address/add', address)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                if(responseData.data.aid){
                    this.setState({
                        address_id: responseData.data.aid
                    })
                    cache.cachePut('checkout_address_id', responseData.data.aid);
                }
                self.getAddressList(function(){
                    Toast.hideLoading();
                    self.hideAddressForm();
                });
            } else if(responseData.message != '') {
                Toast.hideLoading();
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }

    //更新地址
    updateAddress(address){
        let self = this;
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/address/update', address)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                self.getAddressList(function(){
                    Toast.hideLoading();
                    self.hideAddressForm();
                });
            } else {
                Toast.hideLoading();
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }

    //选择地址
    handleSelect(key){
        let address_id = 0;
        let address_list = this.state.address_list;
        for(var i in address_list){
            if(i == key){
                address_list[i]['checked'] = '1';
                address_id = address_list[i]['address_id'];
            } else {
                address_list[i]['checked'] = '0';
            }
        }
        this.setState({
            address_list: address_list,
            address_id: address_id
        }); 
    }

    //底部组件
    footerComponent() {
        let width =  this.is_select ? '50%' : '100%';
        return (
            <div className="mobileFooter">
                <ul className="footNavInfo clearfix">
                    <li className="ripple" style={{width: width, backgroundColor: '#ff5a61', 'color': '#ffffff'}}>
                        <a href="javascript:void(0)" onClick={() => this.showAddAddressForm()}>
                            <span className="text" style={{'color': '#ffffff'}}>Add New</span>
                        </a>
                    </li>
                    {
                        this.is_select ? 
                        <li className="ripple" style={{width: width, backgroundColor: '#ff5a61', 'color': '#ffffff', backgroundImage: 'linear-gradient(45deg, #24d144 0%, #42e75c 100%)'}}>
                            <a href="javascript:void(0)" onClick={() => this.confirmSelect()}>
                               <span className="text" style={{'color': '#ffffff'}}>Confirm</span>
                            </a>
                        </li> : null
                    }
                </ul>
            </div>
        );
    }

    //地址列表
    addressList(){
        let address_list = this.state.address_list;
        if(!address_list || address_list.length == 0){
            return (
                <div className="noResults">
                    <div className="resultImg">
                        <img src={empty_image} width="120" alt='' />
                    </div>
                    <div className="resultContent">
                        <p>
                            Your Shipping Address is empty
                        </p>
                    </div>
                </div>
            )
        }
        return (
             <ul className="addressListBox">
                {
                    address_list.map((item, index) => {
                        return (
                            <li className="addressItem" index={index} key={index.toString()}>
                                {
                                    this.state.is_select ?
                                    <div className="check checkBlock">
                                        <div className="checkbox">
                                            <input type="checkbox" checked={item['checked'] && item['checked'] == '1' ? true : false}  onChange={()=>{this.handleSelect(index)}}  />
                                            <label htmlFor="checkbox" className="checkbox-label"></label>
                                        </div>
                                    </div> : null
                                }
                                <div className="info">
                                    <div>
                                        <span className="username">{item['firstname']} {item['lastname']}</span>
                                        <span className="phone">{item['telephone']}</span>
                                    </div>
                                    <div className="address">
                                        <p>{item['city']} {item['zone']} {item['country']}</p>
                                        <p className="address1">
                                            {item['address_1']} {item['address_2']}  

                                        </p>
                                        <div>
                                            {item['postcode']}
                                        </div>
                                        {
                                            item['landmark'] ?  
                                            <p>
                                                Landmark: {item['landmark']}
                                            </p> : null
                                        }
                                    </div>
                                </div>
                                <a className="editBtn" href="javascript:void(0)" onClick={()=>{this.showEditAddressForm(item)}}>Edit</a>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }

    confirmSelect(){
        let address_id = 0;
        let address_list = this.state.address_list;
        for(var i in address_list){
            if(address_list[i]['checked'] == '1'){
                address_id = address_list[i]['address_id']
            }
        }
        if(!address_id){
            Toast.danger('Add or select shipping address');
            return false;
        }
        this.props.confirmSelect(address_id);
    }

    render(){
        if(this.state.loading){
            return (
                <Layout isBack={true} onBack={() => this.onBack()} header_title={this.state.header_title} footer={null}>
                    <LoadingComponent />
                </Layout>
            )
        }
        return (
            <Layout isBack={true} onBack={() => this.onBack()} header_title={this.state.header_title} footer={this.state.footer}>
                <div className="addressContent" style={{'display': this.state.showForm ? 'none' : 'block'  }}>
                    {this.addressList()}
                </div>
                {
                    this.state.showForm &&  
                    <AddressForm onBack={() => this.hideAddressForm()} 
                    saveType={this.state.saveType} zones={this.state.zones}
                    address={this.state.editAddress} 
                    addAddress={(address) => this.addAddress(address)}
                    default_country_id={this.state.default_country_id} 
                    updateAddress={(address) => this.updateAddress(address)}  />
                }
            </Layout>
        )
    }
}

export default AddressBook;