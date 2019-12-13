import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import LoadingComponent from "appSrcs/component/loading";
import { Control, Link  } from 'react-keeper';
import Toast from "appSrcs/component/toast/index";
import copy from 'copy-to-clipboard';
import './index.css';

//首页
class Order extends Component {

    constructor(props) {
        super(props);
        let title = 'Order Detail';
        this.state = {
            loading: true,
            header_title: title
        };
        let params = this.props.params;
        this.order_id = params.id ? params.id : '';
        document.title = title;
    };

    //页面加载完成调用
    componentDidMount() {
        this.getOrderDetail();
    }

    //页面参数更新
    componentDidUpdate(){
        //处理分类参数id变化
        let params = this.props.params;
        //更新分类，重新查询
        if(params.id && params.id != this.order_id){
            let params = this.props.params;
            this.order_id = params.id;
            this.setState({
                loading: true
            });
            this.getOrderDetail();
        }
    }

     //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
    }

    //返回
    onBack(){
        Control.go('/user/order/index');
    }

    //付款
    onPay(){
        let order_id = this.order_id;
        let data = {'oid': order_id};
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/checkout/pay', data)
        .then((responseData)=>{
            if(responseData.code == '0000'){
                let result_data = responseData.data;
                //提交支付
                if(result_data['handle_type'] && result_data['handle_type'] == 'submit'){
                    let submit_params = result_data['submit_params'];
                    this.setState({
                        submit_params: submit_params,
                        submit_action: result_data['submit_action'],
                        is_pay: true,
                        order_id: result_data['order_id']
                    }, function(){
                        let pay_form = document.getElementById('pay_form');
                        pay_form.submit();
                    });
                } else if(result_data.redirect_url){
                    //跳转支付
                    window.location.href = result_data.redirect_url;
                }
               Toast.hideLoading();
            } else if(responseData.message){
                Toast.hideLoading();
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }

    //获取订单详情
    getOrderDetail(callback){
        let order_id = this.order_id;
        HttpUtils.get('/api.php?route=order/orderDetail&order_id=' + order_id, {})
        .then((responseData)=>{
            if(responseData.code == '0000'){
                let order_detail = responseData.data;
                this.setState({
                    loading: false,
                    order_detail: order_detail
                });
                typeof callback == 'function' && callback();
            } else {
                this.setState({
                    loading: false,
                    order_detail: null
                });
            }
        }).catch(error=>{
            
        });
    }

    //取消订单
    onCancelOrder(order_id){
        let self = this;
        Toast.confirm({
            text: 'Are you sure to cancel the order!',
            onConfirm: function(){
                HttpUtils.post('/api.php?route=order/orderCancel', {'order_id': order_id})
                .then((responseData)=>{
                    if(responseData.code == '0000'){
                        self.getOrderDetail(function(){
                            Toast.hideLoading();
                        });
                    } else {
                        Toast.hideLoading();
                        Toast.danger(responseData.message)
                    }
                }).catch(error=>{
                    Toast.hideLoading();
                }); 
            }
        });
    }

    //删除订单
    onDeleteOrder(order_id){
        let self = this;
        Toast.confirm({
            text: 'Are you sure to delete it from your orders!',
            onConfirm: function(){
                HttpUtils.post('/api.php?route=order/orderDelete', {'order_id': order_id})
                .then((responseData)=>{
                    Toast.hideLoading();
                    if(responseData.code == '0000'){
                       Control.go('/user/order/index');
                    } else {
                        Toast.danger(responseData.message)
                    }
                }).catch(error=>{
                    Toast.hideLoading();
                }); 
            }
        });
    }

    //判断是否在数组里
    inArray(value, arr){
        let flag = false;
        for(var i in arr){
            if(arr[i] == value){
                flag = true;
                break;
            }
        }
        return flag;
    }

    //复制
    onCopy = (text) => {
        copy(text);
        Toast.success({
            text: 'Successful Copy',
            duration: 3000
        })
    };

    //删除订单
    onDeleteOrder(order_id){
        let self = this;
        Toast.confirm({
            text: 'Are you sure to delete it from your orders!',
            onConfirm: function(){
                HttpUtils.post('/api.php?route=order/orderDelete', {'order_id': order_id})
                .then((responseData)=>{
                    Toast.hideLoading();
                    if(responseData.code == '0000'){
                        self.getOrderDetail(function(){
                            Toast.hideLoading();
                        });
                    } else {
                        Toast.danger(responseData.message)
                    }
                }).catch(error=>{
                    Toast.hideLoading();
                }); 
            }
        });
    }

    //确认收货
    onConfirmOrder(order_id){
        let self = this;
        Toast.confirm({
            text: 'Do you confirm receive the order goods?',
            onConfirm: function(){
                HttpUtils.post('/api.php?route=order/orderConfirm', {'order_id': order_id})
                .then((responseData)=>{
                    Toast.hideLoading();
                    if(responseData.code == '0000'){
                        self.getOrderDetail(function(){
                            Toast.hideLoading();
                        });
                    } else {
                        Toast.danger(responseData.message)
                    }
                }).catch(error=>{
                    Toast.hideLoading();
                }); 
            }
        });
    }

    orderProductList(order_product_list){
        return (
            <ul className="orderProductList">
                {
                    order_product_list ? order_product_list.map((productItem, pindex) => {
                        return (
                            <li className="orderProductItem" key={productItem['order_product_id']}>
                                <div className="imginfo">
                                    <Link to={'/product/' + productItem['product_id']}><img src={productItem.image} alt='' /></Link>
                                </div>
                                <div className="infobox">
                                    <div className="productname">
                                        {productItem['name']}
                                    </div>
                                    <div className="productprice">
                                        <span className="text"><span className="price">{productItem['price']}</span> x {productItem['quantity']}</span>
                                    </div>
                                    {
                                        productItem['option']  &&
                                        <div className="attr">
                                            <span>{productItem['option']}</span>
                                        </div>
                                    }
                                </div>
                            </li>
                        )
                    }) : null
                }
            </ul>
        )
    }

     //底部
    footer() {
        let order_detail = this.state.order_detail;
        if(!order_detail){
            return null;
        }
        return (
            <div className="mobileFooter">
                <div className="mobile-footer-operate">
                    <div className="operateBtnBox">
                        {
                            order_detail['is_self'] == '1' && order_detail['order_status_code'] == 'UNPAID' && 
                            <span className="btnGroup">
                                <a className="operatebtn paybtn" href="javascript:void(0)" onClick={() => this.onPay()}>Pay</a>
                                <a className="operatebtn" href="javascript:void(0)" onClick={() => this.onCancelOrder(order_detail['order_id'])}>Cancel</a>
                            </span>
                        }
                        {
                            order_detail['is_self'] == '1' && this.inArray(order_detail['order_status_code'], ['CANCELED', 'COMPLETE']) && order_detail['is_delete'] != '1' ?
                            <span className="btnGroup">
                                <a className="operatebtn" href="javascript:void(0)" onClick={() => this.onDeleteOrder(order_detail['order_id'])}>Delete</a>
                            </span> : ''
                        }
                        {
                            order_detail['is_self'] == '1'  && order_detail['order_status_code'] == 'SHIPPED' && 
                            <span>
                                <a className="operatebtn" href="javascript:void(0)" onClick={() => this.onConfirmOrder(order_detail['order_id'])}>Comfirm</a>
                            </span>
                        }
                        {
                            order_detail['can_track'] ?
                            <span>
                                <Link className="operatebtn" to={'/user/order/track/' + order_detail['order_id']}>Track</Link>
                            </span> : null
                        }
                        {
                            order_detail['is_self'] == '1' && order_detail['can_review'] == '1' && 
                            <span>
                                <Link className="operatebtn" to={"/user/order/review/" + order_detail['order_id']}>Review</Link>
                            </span>
                        }
                        {
                            order_detail['is_review'] == '1' && 
                            <span>
                                <Link className="operatebtn" to={"/user/order/review_detail/" + order_detail['order_id']}>View Review</Link>
                            </span>
                        }
                        {
                            (order_detail['is_self'] != '1' || (!this.inArray(order_detail['order_status_code'], ['UNPAID']))) && 
                            <Link to="/user/order/index/" className="operatebtn" href="javascript:void(0)">Return Orders</Link>
                        }

                    </div>
                </div>
            </div>
        );
    }

    render() {
        if(this.state.loading){
            return (
                <Layout header_title={this.state.header_title} isBack={true} current_route="order" footer={null}>
                    <LoadingComponent />
                </Layout>
            )
        }
        let order_detail = this.state.order_detail;
        if(!order_detail){
            return (
                <Layout header_title={this.state.header_title} isBack={true} current_route="order" footer={null}>
                    
                </Layout>
            )
        }
        return(
            <Layout header_title={this.state.header_title} onBack={() => this.onBack()} isBack={true} current_route="order" footer={this.footer()}>
                <div className="orderDetailBox">
                    <div className="orderDetailHeader">
                        <span className="orderText">Order</span>
                        <span className="orderNo">{order_detail['order_no'] || ''} <a href="javascript:void(0)" onClick={() => this.onCopy(order_detail['order_no'])}><span className="iconfont icon-copy"></span></a></span>
                        <span className="orderStatus">{order_detail['order_status_name'] || ''}</span>
                    </div>
                    <div>
                        <ul className="amountListBox">
                            {
                                order_detail['order_total_detail'].map((ot, oindex) => {
                                    if(ot['code'] == 'total'){
                                        return null;
                                    }
                                    return (
                                        <li key={oindex}>
                                            <span className="text">{ot['title']}</span>
                                            <span className="value">{ot['value']}</span>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                   </div>
                   <div className="orderTotalBox">
                        {
                            order_detail['vendor_store_id'] == 0 &&  
                            <div className="customersPayBox">
                                <span className="text">Price For Customer</span>
                                <span className="value">{order_detail['customers_pay']}</span>
                            </div>
                        }
                        <div className="orderTotalPriceBox">
                            <span className="text">Total Price</span>
                            <span className="value">{order_detail['total']}</span>
                        </div>
                    </div>
                    <div className="orderProductList">
                        {this.orderProductList(order_detail['products_data'])}
                    </div>
                    <div className="orderBlockBox">
                        <div className="orderBlockBoxItem">
                            <span className="text">Payment Method  </span>
                            <span className="value">{order_detail['payment_method']}</span>
                        </div>
                        <div className="orderBlockBoxItem">
                            <span className="text">Placed on</span>
                            <span className="value">{order_detail['date_added']}</span>
                        </div>
                    </div>
                    <div className="orderViewPanel">
                        <div className="headering">Customer Details</div>
                        <div className="content">
                            <div className="addressItem">
                                <div className="ico"><span className="iconfont icon-address"></span></div>
                                <div className="value">
                                     <p className="weight"><span>{order_detail['shipping_firstname']} {order_detail['shipping_lastname']}</span><span> {order_detail['shipping_telephone']}</span></p>
                                    <p><span>{order_detail['shipping_city']}, </span><span>{order_detail['shipping_zone']}, </span><span>{order_detail['shipping_country']}</span></p>
                                    <p>{order_detail['shipping_address_1']}</p>
                                    <p>{order_detail['shipping_address_2']}</p>
                                    <p>{order_detail['shipping_postcode']}</p>
                                    {
                                        order_detail['shipping_landmark'] ? 
                                            <p>Landmark: {order_detail['shipping_landmark']}</p>
                                        : null
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        order_detail['sender_name'] ? 
                            <div className="orderViewPanel">
                            <div className="headering">Sender Details</div>
                            <div className="content">
                                <div className="addressItem">
                                    <div className="ico"><span className="iconfont icon-phone"></span></div>
                                    <div className="value">
                                        <p className="weight"><span>{order_detail['sender_name'] || ''}</span></p>
                                        <p>{order_detail['sender_phone'] || ''}</p>
                                    </div>
                                </div>
                            </div>
                        </div> : null
                    }
                    
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
                                <input type="hidden" key={aindex} name={input_key} value={submit_params[input_key]} />
                            )
                        }) : null
                    }
                </form>
            </div>
        )
    }
}

export default Order;