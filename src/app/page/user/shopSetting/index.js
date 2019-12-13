import React ,{ Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import { Link } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";
import Toast from "appSrcs/component/toast/index";
import pre_img from "appSrcs/static/images/p.png";
import './index.css';


//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader">
            <div className="mobileHeaderBox clearfix">
                <span className="backBox" onClick={props.goBack}><span className="iconfont icon-left"></span></span>
                <div className="mobileHeaderTitle" style={{'textAlign':'center'}}>
                    <div className="name">{props.title}</div>
                </div>
                {/*<span className="shopSettingSaveBtn">Save</span>*/}
                <input className="shopSettingSaveBtn" type="submit" value="Save" />
            </div>
        </div>
    );
}

function ShopName(props){
    return (
        <div className="accountShopNameBox">
            <label className="accountShopName">Store Name</label>
            <div>
                <input className="settingIpt" name="storeName" value={props.storeName} onChange={props.onChangeHandle}/>
                <span className="iconfont icon-edit"></span>
            </div>
        </div>
    )
}

function ShopPrice(props){
    return (
        <div className="accountShopPriceBox">
            <label className="accountShopName">Price</label>
            <div className="flexSPBox">
                Show product prices on my store
                <label><input name="isShowPrice" checked={props.isShowPrice} className="mui-switch mui-switch-anim switch" type="checkbox" onChange={props.onChangeHandle}/></label>
            </div>
            <div className="flexSPBox">
                <span>
                Show <span className="abp">
                <span className="iconfont icon-whatsapp"></span> Ask Best Price</span> button
                </span>
                <label><input name="isShowAskPrice" checked={props.isShowAskPrice} className="mui-switch mui-switch-anim switch" type="checkbox" onChange={props.onChangeHandle}/></label>
            </div>
            <div className="askPriceBox flexSPBox">
                <img src={pre_img} alt='' />
                    Customers can ask you for the best price on the WhatsApp number given below
            </div>
            <div  className="flexSPBox whatsappBox">
                <div>
                    <span className="iconfont icon-whatsapp"></span> WhatsApp Number: 
                    <input value={props.whatsappNum} className="settingIpt" name="whatsappNum" onChange={props.onChangeHandle} placeholder="9112345678900" />
                </div>
                <span className="iconfont icon-edit"></span>
            </div>
        </div>
    )
}

function CustomerPriceSetting(props){
    return (
        <div className="accountCusPriceSetBox">
            <label className="accountShopName">Customer Price Settings</label>
            <div className="radioBox">
                <div>
                    <input type="radio" value="0" checked={~~props.settingPriceType == 0} name="settingPriceType" id="Percentage" onChange={props.onChangeHandle}/>
                    <label htmlFor="Percentage">Percentage</label>
                </div>
                <div>
                    <input type="radio" value="1" checked={~~props.settingPriceType == 1} name="settingPriceType" id="Amount" onChange={props.onChangeHandle}/>
                    <label htmlFor="Amount">Amount</label>
                </div>
                {/*<label><input type="radio"/>Percentage</label>
                <label><input type="radio"/>Amount</label>*/}
            </div>
            <div className="iptPirceBOx">
                <label>
                    <input type="text" name="settingPriceVal" value={props.settingPriceVal} onChange={props.onChangeHandle}/>
                    {
                        ~~props.settingPriceType == 0 ? '%':null
                    }
                </label>
            </div>
            <p>It's the default adding price in your store if you don't set price.If the percentage is 10%,shogee price is 100,then the first shared price is 110.If amount is 20,then the first shared price is 120.</p>
            <p className="cpsLinkBox">
                <Link to="/user/cateSetPrice" className="cpsLink">Category Price Setting</Link>
            </p>
        </div>
    )
}

function SenderDetails(props){
    return (
        <div className="accountSenderDetailsBox">
            <label className="accountShopName">Sender Details</label>
            <div>
                <input className="settingIpt" name="send_detail_name" placeholder="Sender Name" value={props.name} onChange={props.onChangeHandle}/>
                <input className="settingIpt" name="send_detail_tel" placeholder="Sender Telephone" value={props.tel} onChange={props.onChangeHandle}/>
                <span className="iconfont icon-edit"></span>
            </div>
            <p>When your customers place an order in your store , this will be the sender in the package.</p>
        </div>
    )
}

export default class ShopSetting extends Component{
    constructor(props) {
        super(props);
        this.state = {
            storeName:'',
            isShowPrice : 1,
            isShowAskPrice : 1,
            whatsappNum : '',
            settingPriceType : 0,//0 百分比 1：数字
            settingPriceVal: 0,
            send_detail_name : '',
            send_detail_tel : ''
        };
        this.title = document.title = 'Store Settings';
    };

    //页面加载完成调用
    componentDidMount() {
        this.loadData();
        this.eventInit();
    }
    eventInit(){
        const ipts = document.getElementsByClassName('settingIpt');
        [...ipts].forEach((item,index)=>{
            item.onfocus = function(){
                this.classList.add('focus');
            }

            item.onblur = function(){
                this.classList.remove('focus');
            }

        });

        const editBtn = document.getElementsByClassName('icon-edit');
        [...editBtn].forEach((item,index)=>{
            item.onclick = function(){
                this.parentNode.getElementsByClassName('settingIpt')[0].focus();
            }
        });
        
    }
    //加载产品组列表
    loadData(){
        Toast.showLoading();
        let url = '/api.php?route=store/getStoreInfo';
        HttpUtils.get(url, {})
        .then((responseData) => {
            Toast.hideLoading();
            if(typeof responseData.data != 'undefined'){
                const data = responseData.data;
                this.setState({
                    storeName:data.store_name,
                    isShowPrice : ~~data.is_show_price,
                    isShowAskPrice : ~~data.is_show_askprice,
                    whatsappNum : data.whats_app_number || '',
                    settingPriceType : data.setting_price_type,//1 百分比 0：数字
                    settingPriceVal: data.setting_price_val,
                    send_detail_name : data.send_detail_name || '',
                    send_detail_tel : data.send_detail_tel || '',
                });
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }

    goBack(){
        window.history.back();
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox'? (target.checked=== true ? 1 : 0) : target.value;
        const name = target.name;
        this.setState({
          [name]: value
        });
    }
    handleSubmit(event) {
        event.preventDefault();
        Toast.showLoading();
        let url = '/api.php?route=store/setStoreInfo';
        HttpUtils.post(url, this.state)
        .then((responseData) => {
            Toast.hideLoading();
            if(responseData.code === '0000'){
                Toast.success();
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    render() {
        return(
            <form onSubmit={(e)=>this.handleSubmit(e)}>
                <Layout header={<HeaderComponent goBack={()=>this.goBack()} title={this.title}/>}>
                    <ShopName storeName={this.state.storeName} onChangeHandle={(e)=>this.handleInputChange(e)}/>
                    <ShopPrice isShowPrice={!!this.state.isShowPrice} isShowAskPrice={!!this.state.isShowAskPrice} whatsappNum={this.state.whatsappNum}  onChangeHandle={(e)=>this.handleInputChange(e)}/>
                    <CustomerPriceSetting settingPriceType={this.state.settingPriceType} settingPriceVal={this.state.settingPriceVal} onChangeHandle={(e)=>this.handleInputChange(e)}/>
                    <SenderDetails name={this.state.send_detail_name} tel={this.state.send_detail_tel} onChangeHandle={(e)=>this.handleInputChange(e)}/>
                </Layout>
            </form>
        )
    }
}