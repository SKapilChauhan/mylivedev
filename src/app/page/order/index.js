import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import LoadingComponent from "appSrcs/component/loading";
import { Link, Control } from 'react-keeper';
import LoadMore from 'appSrcs/component/scroll/loadMore';
import Toast from "appSrcs/component/toast/index";
import empty_image from 'appSrcs/static/images/no_result.png';
import './index.css';

//订单页
class Order extends Component {

    constructor(props) {
        super(props);
        this.isDApp = window.IsDApp;
        let order_status_id = (Control.state && Control.state.order_status_id) || 0;
        this.order_status_id = order_status_id;
        this.state = {
            header_title: 'Orders',
            isDApp: this.isDApp,
            order_status_id: order_status_id,
            orderType: 'MyOrder',
            show_search: false,
            search_key: '',
            loading: true,
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
        };
        this.page = 1;
        this.search_key = '';
        this.orderType = 'MyOrder';
        document.title = 'MyOrder';
    };

    //页面加载完成调用
    componentDidMount() {
        this.getOrderListData();
        this.getOrderCatalog();
    }

     //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
    }

    //获取订单列表
    getOrderListData(callback){
        let page = this.page;
        let data = {
            page: this.page,
        };
        if(this.orderType !== ''){
            data['type'] = this.orderType;
        }
        if(this.order_status_id){
            data['order_status_id'] = this.order_status_id;
        }
        if(this.search_key){
            data['search_key'] = this.search_key;
        }
        HttpUtils.get('/api.php?route=order/index', data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let hasMore = true;
                let data = responseData.data;
                let page_order_list = data.orderList.rows;
                if(!page_order_list || page_order_list.length === 0){
                    hasMore = false;
                }
                let order_list = this.state.order_list || [];
                if(page === 1){
                    order_list = page_order_list;
                }
                else if(page_order_list && page_order_list.length > 0){
                    order_list = order_list.concat(page_order_list);
                }
                let orderSatus = data.orderSatus;
                this.setState({
                    hasMore: hasMore,
                    orderSatus: orderSatus,
                    isLoadingMore: false,
                    loading : false,
                    order_list: order_list,
                    order_status_id: this.order_status_id,
                    orderType: this.orderType
                });
                this.page +=1;
            }
            typeof callback === 'function' && callback();
        }).catch(error=>{
            
        });
    }

    //显示搜索框
    onShowSearch(){
        if(this.state.show_search){
            this.setState({
                show_search: false
            })
        } else {
            this.setState({
                show_search: true
            }) 
        }
    }

    //搜索订单
    onSearchOrder(search_key){
        this.order_status_id = 0;
        this.page = 1;
        this.search_key = search_key;
        this.getOrderListData();
    }

    //获取订单目录
    getOrderCatalog(){
        HttpUtils.get('/api.php?route=order/orderCatalog', {})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let hasMore = true;
                let orderStatus = responseData.data;
                this.setState({
                    hasMore: hasMore,
                    orderStatus: orderStatus
                });
            }
        }).catch(error=>{
            
        });
    }

    // 加载更多数据
    loadMoreData() {
        if(this.state.isLoadingMore){
            return false;
        }
        if(!this.state.hasMore){
            return false;
        }
        this.getOrderListData();
    }

    //根据订单类型查询
    orderTypeList(type){
        this.orderType = type;
        this.order_status_id = 0;
        this.page = 1;
        this.setState({
            orderType: type,
            order_status_id: 0
        })
        this.reloadOrderListData();
    }

    //根据状态查询订单
    orderSatusList(id){
        this.page = 1;
        this.order_status_id = id;
        this.reloadOrderListData();
    }

    //重新加载订单列表
    reloadOrderListData(){
        this.setState({
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            order_list: null
        });
        this.getOrderListData();
    }

    //获取状态
    findOrderSatus(code){
        let order_status = {};
        let orderSatus = this.state.orderSatus;
        if(orderSatus){
            for (var i in orderSatus) {
                if(orderSatus[i]['code'] == code){
                    order_status['id'] = i;
                    order_status = orderSatus[i];
                    break;
                }
            }
        }
        return order_status;
    }

    //取消订单
    onCancelOrder(order_id, index){
        let self = this;
        Toast.confirm({
            text: 'Are you sure to cancel the order?',
            onConfirm: function(){
                Toast.showLoading();
                HttpUtils.post('/api.php?route=order/orderCancel', {'order_id': order_id})
                .then((responseData)=>{
                    Toast.hideLoading();
                    if(responseData.code === '0000'){
                        let order_list = self.state.order_list;
                        let new_code = 'CANCELED';
                        order_list[index]['order_status_code'] = new_code;
                        let new_order_status = self.findOrderSatus(new_code);
                        if(new_order_status){
                            order_list[index]['order_status_name'] = new_order_status['name'];
                            order_list[index]['order_status_id'] = new_order_status['id'];
                        }
                        self.setState({
                            order_list: order_list
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

    //删除订单
    onDeleteOrder(order_id, index){
        let self = this;
        Toast.confirm({
            text: 'Are you sure to delete it from your orders!',
            onConfirm: function(){
                HttpUtils.post('/api.php?route=order/orderDelete', {'order_id': order_id})
                .then((responseData)=>{
                    Toast.hideLoading();
                    if(responseData.code === '0000'){
                        let order_list = self.state.order_list;
                        order_list.splice(index, 1);
                        self.setState({
                            order_list: order_list
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
    onConfirmOrder(order_id, index){
        let self = this;
        Toast.confirm({
            text: 'Do you confirm receive the order goods?',
            onConfirm: function(){
                HttpUtils.post('/api.php?route=order/orderConfirm', {'order_id': order_id})
                .then((responseData)=>{
                    Toast.hideLoading();
                    if(responseData.code === '0000'){
                        let order_list = self.state.order_list;
                        let new_code = 'RECEIVED';
                        order_list[index]['order_status_code'] = new_code;
                        let new_order_status = self.findOrderSatus(new_code);
                        if(new_order_status){
                             order_list[index]['order_status_name'] = new_order_status['name'];
                            order_list[index]['order_status_id'] = new_order_status['id'];
                        }
                        self.setState({
                            order_list: order_list
                        });
                    } else {
                        Toast.danger(responseData.message);
                    }
                }).catch(error=>{
                    Toast.hideLoading();
                }); 
            }
        });
    }

    //付款
    onPayorder(order_id){
        let data = {'oid': order_id};
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/checkout/pay', data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
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

    headerComponent(){
        return (
            <div className="mobileHeader orderSearchHeader">
                <div className="mobileHeaderBox clearfix">
                    <div className="mobileHeaderTitle orderHeaderTitle" style={{'textAlign' : 'left','fontWeight':'bold'}}>
                        <div className="name">{this.state.header_title}</div>
                    </div>
                    {
                        this.state.show_search ?  <div className="headerSearch">
                            <form onSubmit={(e)=>{
                                e.preventDefault();
                                this.onSearchOrder(e.target.search_key.value);
                            }}>
                            <div className="headerSearchBox">
                                <input className="orderSearchInput" name="search_key" value={this.state.search_key} onChange={(event) => this.setState({search_key: event.target.value})}/>
                            </div>
                            </form>
                        </div> : null
                    }
                   
                    <a href="javascript:void(0)" className="headerRight" onClick={() => this.onShowSearch()}><span className="iconfont icon-search"></span></a>
                </div>
            </div>
        )
    }
    

    //订单列表
    orderList(order_list){
        if(!order_list){
            return null;
        }
        if(order_list && order_list.length === 0){
            return (
                <div className="noResults">
                    <div className="resultImg">
                        <img src={empty_image} width="120" alt='' />
                    </div>
                    <div className="resultContent">
                        <p>
                            The Order is empty
                        </p>
                    </div>
                </div>
            )
        }
        return (
            <ul className="orderList">
                {
                    order_list && order_list.map((order_item, index) => {
                        let products_data = order_item['products_data'];
                        return (
                            <li className="orderListItem" key={index}>
                                <div className="header">
                                    <span className="orderNo">Order No: {order_item['order_no'] || ''}</span>
                                    <span className="orderStatus">{order_item['order_status_name'] || ''}</span>
                                </div>
                                <div className="orderItemBox">
                                    <ul className="orderProductList">
                                        {
                                            products_data ? products_data.map((productItem, pindex) => {
                                                return (
                                                    <li className="orderProductItem" key={pindex}>
                                                        <Link to={'/user/order/detail/' + order_item['order_id']}>
                                                            <div className="orderProductItemBox">
                                                                <div className="imginfo">
                                                                    <img src={productItem.image || ''} alt='' />
                                                                </div>
                                                                <div className="infobox">
                                                                    <div className="productname">
                                                                        {productItem['name'] || ''}
                                                                    </div>
                                                                    <div className="productprice">
                                                                        <span className="text"><span className="price">{productItem['price']}</span> x {productItem['quantity']}</span>
                                                                    </div>
                                                                    {
                                                                        productItem['option']  &&
                                                                        <div className="attr">
                                                                            <span>{productItem['option'] || ''}</span>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </li>
                                                )
                                            }) : null
                                        }
                                    </ul>
                                    <div className="totalInfo">
                                        {order_item['products_quantity_total']} items  Total Price: <span className="value">{order_item['total']}</span>
                                    </div>
                                </div>
                                <div className="operateBox">
                                    {
                                        order_item['is_self'] == '1' && order_item['order_status_code'] == 'UNPAID' ?
                                        <span>
                                            <a className="operatebtn" href="javascript:void(0)" onClick={() => this.onCancelOrder(order_item['order_id'], index)}>Cancel</a>
                                            <a href="javascript:void(0)" onClick={() => this.onPayorder(order_item['order_id'])} className="operatebtn">Pay</a>
                                        </span> : null
                                    }
                                    {
                                        order_item['is_self'] == '1' && (order_item['order_status_code'] == 'CANCELED' || order_item['order_status_code'] == 'COMPLETE')
                                        && order_item['is_delete'] != '1' ?
                                        <span>
                                            <a className="operatebtn" href="javascript:void(0)" onClick={() => this.onDeleteOrder(order_item['order_id'], index)}>Delete</a>
                                        </span> : null
                                    }
                                    {
                                        order_item['is_self'] == '1' && order_item['order_status_code'] == 'SHIPPED' ?
                                        <span>
                                            <a className="operatebtn" href="javascript:void(0)" onClick={() => this.onConfirmOrder(order_item['order_id'], index)}>Comfirm</a>
                                        </span> : null
                                        
                                    }
                                    {
                                        order_item['can_track'] ?
                                        <span>
                                            <Link className="operatebtn" to={'/user/order/track/' + order_item['order_id']}>Track</Link>
                                        </span> : null
                                    }
                                    {
                                        order_item['is_self'] == '1' && order_item['can_review'] == '1' ?
                                        <span>
                                            <Link className="operatebtn" to={"/user/order/review/" + order_item['order_id']}>Review</Link>
                                        </span> : null
                                    }
                                    {
                                        order_item['is_review'] == '1' ?
                                        <span>
                                            <Link className="operatebtn" to={"/user/order/review_detail/" + order_item['order_id']}>View Review</Link>
                                        </span> : null
                                    }
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
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

    render() {
        let order_list = this.state.order_list;
        let order_status = this.state.orderStatus;
        return(
            <Layout header_title={this.state.header_title} header={this.headerComponent()} current_route="order">
                {
                    this.isDApp ?
                    <div className="orderTypeMenu">
                        <ul className="orderTypList">
                            <li className={'orderTypItem ' + (this.state.orderType == 'MyOrder' ? 'current' : '')}> 
                                <a onClick={() => this.orderTypeList('MyOrder')}>
                                     My Orders
                                </a>
                            </li>
                            <li className={'orderTypItem ' + (this.state.orderType == 'Distribution' ? 'current' : '')}> 
                                <a onClick={() => this.orderTypeList('Distribution')}>
                                    Distribution Order
                                </a>
                            </li>
                        </ul>
                    </div> : null
                }
                <div className="orderstatusMenu">
                    <ul className="menuBoxList">
                        {
                            order_status ? Object.keys(order_status).map((id, oindex) => {
                                return (
                                    <li className={'menuBoxItem ' + (this.order_status_id == id ? 'current' : '')} key={oindex}> 
                                        <a onClick={() => this.orderSatusList(id)}>
                                            {order_status[id] || ''}
                                        </a>
                                    </li>
                                )
                            }) : null
                        }
                    </ul>
                </div>
               {order_list ? this.orderList(order_list) : null}
               {
                    //滚动加载
                    this.state.hasMore
                    ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)}/>
                    : ''
                }
                {this.payForm()}
            </Layout>
        )
    }
}

export default Order;