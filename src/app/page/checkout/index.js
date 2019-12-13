import React, { Component } from 'react';
import Layout from "../layout/layout";
import Sender from "../address/sender";
import Address from "../address/index";
import HttpUtils from 'appSrcs/utils/http';
import Toast from "appSrcs/component/toast/index";
import LoadingComponent from "appSrcs/component/loading";
import {Control} from 'react-keeper';
import cache from "appSrcs/utils/cache";
import Appsflyer from "appSrcs/utils/appsflyer";
import './index.css';

//首页
class Checkout extends Component {

    //构造函数
    constructor(props) {
        super(props);
        let sender_id = cache.cacheGet('checkouut_sender_id');
        let address_id = cache.cacheGet('checkout_address_id');
        this.isDApp = window.IsDApp;
        this.select_sender = false;
        this.select_address = true;
        if(this.isDApp){
            this.select_sender = true;
        }
        this.state = {
            checkout_data: null,
            select_sender: this.select_sender,
            select_address: this.select_address,
            sender_id: sender_id ? sender_id : 0,
            address_id: address_id ? address_id : 0,
            isDApp: this.isDApp,
            header_title: 'Checkout'
        };
        this.cart_ids = (Control.state && Control.state.cart_ids) || '';
        document.title = 'Checkout';
    };

    //页面加载完成调用
    componentDidMount() {
       
    }

    //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
    }

    //返回
    onBack(){
        if(this.select_sender){
            this.setState({
                select_address: true,
                select_sender: false
            });
        } else {
            if(!this.isDApp ){
                this.setState({
                    select_address: true,
                });
            } else {
                this.onBackCart();
            }
        }
    }

    //返回购物车
    onBackCart(){
        window.history.go(-1);
    }

    //获取支付数据
    getCheckoutData(callback){
        let cis = (this.cart_ids && this.cart_ids.join(',')) || '';
        let data = {
            cis: cis
        }
        if(this.payment_method_code){
            data['payment_method_code'] = this.payment_method_code;
        }
        HttpUtils.post('/api.php?route=shopping/checkout', data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let checkout_data = responseData.data;
                let cart_content = checkout_data.cart_content;
                let cart_totals = cart_content.totals;
                let totals_data = {};
                for(var i in cart_totals){
                    let code = cart_totals[i]['code'];
                    totals_data[code] = cart_totals[i];
                }
                let payment_methods = checkout_data.payment_methods;
                if(this.payment_method_code){
                    for(var i in payment_methods){
                        if(payment_methods[i]['code'] == this.payment_method_code){
                            payment_methods[i]['checked'] = '1';
                        } else {
                            payment_methods[i]['checked'] = '0';
                        }
                    }
                }
                else if(payment_methods.length > 0){
                    payment_methods[0]['checked'] = '1';
                }
                this.setState({
                    checkout_data: checkout_data,
                    totals_data: totals_data,
                    payment_methods: payment_methods
                });
                typeof callback === 'function' && callback();
                try{
                    this.initiatedCheckoutTrack(cart_content);
                } catch(e){

                }
            } else {
                if(responseData.message !== ''){
                    Toast.danger(responseData.message);
                }
                this.onBackCart();
            }
        }).catch(error=>{
        });
    }

    //跟踪数据
    getCheckoutTrackData(cart_content){
        let product_ids = [];
        let products = cart_content['products'];
        let quantity = 0;
        for(var i in products){
            product_ids.push(products[i]['product_id']);
            quantity += parseInt(products[i]['quantity']);
        }
        product_ids = product_ids.join(',');
        let currency_code = cart_content['currency']['currency_code'];
        let total_price;
        let cart_totals = cart_content.totals;
        for(var i in cart_totals){
            let code = cart_totals[i]['code'];
            if(code == 'total'){
                total_price = cart_totals[i]['value'];
                break;
            }
        }
        let cart = {
            total_price: total_price,
            product_ids: product_ids,
            currency: currency_code,
            quantity: quantity
        }
        return cart;
    }

    //发起的结账跟踪
    initiatedCheckoutTrack(cart_content){
        let cart = this.getCheckoutTrackData(cart_content);
        Appsflyer.initiatedCheckout(cart);
    }

    //购买事件跟踪
    purchaseOrderTrack(order){
        let cart_content = this.state.checkout_data.cart_content;
        let cart = this.getCheckoutTrackData(cart_content);
        cart['order_id'] = order['order_id'];
        Appsflyer.purchaseCheckout(cart);
    }

    

    //确认选择发件人
    confirmSelectSender(sender_id){
        if(!sender_id){
            Toast.danger('Added or selected sender');
            return false;
        }
        HttpUtils.post('/api.php?route=shopping/sender/switch', {'sid': sender_id})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                this.setState({
                    sender_id: sender_id,
                    select_address: true,
                    select_sender: false
                });
                cache.cachePut('checkouut_sender_id', sender_id);
            }
        }).catch(error=>{
        });
    }

    //确认选择地址
    confirmSelectAddress(address_id){
        if(!address_id){
            Toast.danger('Add or select shipping address');
            return false;
        }
        HttpUtils.post('/api.php?route=shopping/address/switch', {'aid': address_id})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                this.setState({
                    address_id: address_id,
                    select_address: false
                });
                this.getCheckoutData();
                cache.cachePut('checkout_address_id', address_id);
            }
        }).catch(error=>{
            
        });
        
    }

    //收件人回退
    senderBack(){
        this.onBackCart();
    }

    //地址选择回退
    addressBack(){
        if(this.isDApp){
            this.setState({
                select_address: false,
                select_sender: true
            });
        } else {
           this.onBackCart();
        }
    }

    //选择支付方式
    handleCheckPayment(index){
        let payment_methods = this.state.payment_methods;
        for(var i in payment_methods){
            if(i == index){
                payment_methods[i]['checked'] = '1';
                let code  = payment_methods[i]['code'];
                this.payment_method_code = code;
            } else {
                payment_methods[i]['checked'] = '0';
            }
        }
        this.setState({
            payment_methods: payment_methods
        }, function(){
            //更新下单数据
            this.getCheckoutData();
        })
    }

    //获取选择的支付方式
    getPaymentCode(){
        let payment_method_code = '';
        let payment_methods = this.state.payment_methods;
        for(var i in payment_methods){
            if(payment_methods[i]['checked'] && payment_methods[i]['checked'] == '1'){
                payment_method_code = payment_methods[i]['code'];
            }
        }
        return payment_method_code;
    }

    //下单
    onPacedOrder(){
        let payment_method_code = this.getPaymentCode();
        let cis = (this.cart_ids && this.cart_ids.join(',')) || '';
        let shipping_method = 'free';
        let data = {
            'pc': payment_method_code,
            'sc': shipping_method,
            'cis': cis
        }
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/checkout/place', data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let result_data = responseData.data;
                let order_id = result_data.order_id;
                try{
                    this.purchaseOrderTrack({
                        order_id: order_id
                    });
                } catch(e){

                }
                //表单提交
                if(result_data['handle_type'] && result_data['handle_type'] == 'submit'){
                    let submit_params = result_data['submit_params'];
                    this.setState({
                        submit_params: submit_params,
                        submit_action: result_data['submit_action'],
                        is_pay: true
                    }, function(){
                        let pay_form = document.getElementById('pay_form');
                        pay_form.submit();
                        //Control.go('/user/order/detail/' + order_id);
                    });
                } else if(result_data.redirect_url){
                    //跳转支付
                    window.location.href = result_data.redirect_url;
                }
            } else if(responseData.message){
                Toast.hideLoading();
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
        
    }

    showSelectAddress(){
        this.setState({
            select_address: true
        });
    }

    //底部
    footer() {
        let totals_data = this.state.totals_data;
        return (
            <div className="mobileFooter checkoutFooter">
                <ul className="footNavInfo clearfix">
                    <li className="footerTotal">
                        <div className="totalBox">
                            <div className="totalInfo">
                                Total Price: {totals_data['total'] && totals_data['total']['text']}
                                {
                                    this.state.cart_items && <div className="cartItems">{this.state.cart_items} items</div>
                                }
                            </div>
                        </div>
                    </li>
                    <li className="ripple" style={{width: '50%'}}>
                        <input type="button" className="payBtn"  onClick={() => this.onPacedOrder()} value="Pay Now " />
                    </li>
                </ul>
            </div>
        );
    }

    //购物车产品
    cartProductList(products){
        if(!products || products.length === 0){
            return null;
        }
        return (
            <div className="checkout-sitem-box">
                {
                    products.map((sitem, sindex) => {
                        let supplier_products = sitem['products'];
                        return (
                            <div className="checkout-sitem" key={sindex}>
                                <ul className="cartProductList">
                                {
                                    supplier_products.map((item, index) =>{
                                        return (
                                            <li className="cartProductItem" key={index}>
                                                <div className="imginfo">
                                                    <img src={item['variant'] && item['variant']['image']} alt='' />
                                                </div>
                                                <div className="infobox">
                                                    <div className="productname">
                                                        {item['name']}
                                                    </div>
                                                    <div className="productprice">
                                                        <span className="text">Price</span>
                                                        <span className="value">{item['price_text']}</span>
                                                    </div>
                                                    {
                                                        item['variant'] && item['variant']['option'] ?
                                                        <div className="attr">
                                                        {
                                                            item['variant']['option'].map((op, index) => {
                                                                return (
                                                                    <span key={index}>{op['option_name_text']}: {op['option_value_text']}</span>
                                                                )
                                                            })
                                                        }
                                                        </div> : null
                                                    }
                                                    <div className="qtybox clearfix">
                                                        <span className="text">Quantity</span>
                                                        <span className="input">{item['quantity']}</span>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })
                                }
                                </ul>
                                <div className="price-b">
                                    <div className="price-item">
                                        <span className="text">Shipping</span>
                                        <span className="value">{sitem.sub_shipping_text}</span>
                                    </div>
                                    <div className="price-item">
                                        <span className="text">Total</span>
                                        <span className="value">{sitem.sub_total_shipping_text}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    render() {
        if(this.state.loading){
            return(
                <Layout header_title={this.state.header_title} isBack={true} footer={null}>
                    <LoadingComponent />
                </Layout>
            )
        }
        if(this.isDApp && this.state.select_sender){
            return (
                <Sender confirmSelect={(sender_id) => this.confirmSelectSender(sender_id)} onBack={() => this.senderBack()} sender_id={this.state.sender_id} />
            )
        }
        if(this.state.select_address){
            return (
                <Address is_select={true} confirmSelect={(address_id) => this.confirmSelectAddress(address_id)} onBack={() => this.addressBack()} address_id={this.state.address_id} />
            )
        }
        if(!this.state.checkout_data){
            return (
                <Layout header_title={this.state.header_title} isBack={true} footer={null} >
                    <LoadingComponent />
                </Layout>
            )
        }
        let checkout_data = this.state.checkout_data;
        let totals_data = this.state.totals_data;
        let cart_content = checkout_data.cart_content;
        let products = cart_content && cart_content.products ? cart_content.products : [];
        let payment_methods = this.state.payment_methods;
        let address = checkout_data['address'] || null;
        return (
            <Layout header_title={this.state.header_title} isBack={true} footer={this.footer()} onBack={() => this.onBack()}>
                <div>
                    { !this.isDApp ? 
                        <div className="checkoutPanel">
                            <div className="checkoutPanelHeader">Shipping Address</div>
                            <div className="content">
                                <div className="caddressItem">
                                    <div className="ico"><span className="iconfont icon-address"></span></div>
                                    <div className="value">
                                        {
                                            address ? 
                                            <div>
                                                <p>
                                                    <span className="username">{address['firstname']} {address['lastname']}</span><span> {address['telephone']}</span>
                                                </p>                                         
                                                <p><span>{address['city']}, </span><span>{address['zone']}, </span><span>{address['country']}</span></p>
                                                <p>{address['address_1']} {address['address_2']}</p>
                                                <p>{address['postcode']}</p> 
                                            </div> : null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div> : null
                    }
                    <div className="checkoutPanel">
                        <div className="checkoutPanelHeader">Payment Method</div>
                        <div className="checkoutPanelBox">
                            {
                                payment_methods ? payment_methods.map((payment, pindex) => {
                                    return (
                                        <span className="paymentListItem" key={pindex}>
                                            <span className="checkbox">
                                                <input type="checkbox" checked={payment['checked'] && payment['checked'] == '1' ? true : false}  onChange={()=>{this.handleCheckPayment(pindex)}}  />
                                                <label htmlFor="checkbox" className="checkbox-label">{payment['title']}</label>
                                            </span>
                                        </span>
                                    )
                                }) : null
                            }
                        </div>
                    </div>
                    <div>
                        <ul className="amountListBox">
                            {
                                totals_data ? Object.keys(totals_data).map((total_code, total_item) => {
                                    if(total_code == 'total'){
                                        return false;
                                    }
                                    return (
                                        <li key={total_code}>
                                            <span className="text">{totals_data[total_code]['title']}</span>
                                            <span className="value">{totals_data[total_code]['text']}</span>
                                        </li>
                                    )
                                }) : null
                            }
                        </ul>
                   </div>
                   {
                        totals_data['total'] &&   
                        <div className="totalAmountBox">
                            <span className="text">Total Price</span>
                            <span className="value">{totals_data['total']['text']}</span>
                        </div>
                   }
                   {
                        this.isDApp ?  <div className="checkoutPanel">
                            <ul className="amountListBox">
                                <li>
                                    <span className="text">Customers Pay </span>
                                    <span className="value">{checkout_data.customer_pay}</span>
                                </li>
                                <li>
                                    <span className="text">Your Margin</span>
                                    <span className="value">{checkout_data.margin_profit}</span>
                                </li>
                            </ul>
                        </div> : null
                   }
                   
                    <div className="cartProduct">
                        {this.cartProductList(products)}
                   </div>
               </div>
               {this.payForm()}
            </Layout>
        )
    }

    payForm(){
        let submit_action = this.state.submit_action ? this.state.submit_action : '';
        let submit_params = this.state.submit_params ? this.state.submit_params : {};
        return (
            <div>
                <form action={submit_action} method="post" id="pay_form" name="pay_form">
                    {
                        submit_params ? Object.keys(submit_params).map((input_key, aindex) => {
                            return (
                                <input type="hidden" name={input_key} value={submit_params[input_key]} />
                            )
                        }) : null
                    }
                </form>
            </div>
        )
    }
}

export default Checkout;