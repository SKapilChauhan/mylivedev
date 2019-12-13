import React, { Component } from 'react';
import Layout from "../layout/layout";
import { Link  } from 'react-keeper';
import HttpUtils from 'appSrcs/utils/http';
import Appsflyer from "appSrcs/utils/appsflyer";
import './index.css';

class Success  extends Component {

    constructor(props) {
        super(props);
        let params = this.props.params;
        this.order_id = params.id ? params.id : '';
        let is_split = this.getQueryPram('is_split');
        let order_link = '/user/order/detail/' + this.order_id;
        if(is_split == '1'){
            order_link = '/user/order/index';
        } 
        this.state = {
            header: '',
            header_title: 'Pay Success',
            order_link: order_link
        };
        if(document.title === ''){
            document.title = 'Pay Success'; 
        }
    };

      //获取参数
    getQueryPram(parm){
        let hash = window.location.hash;
        var vars = hash.split("?");
        let promotion_code  = '';
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == parm){
                promotion_code = pair[1];
                break;
            }
        }
        return promotion_code;
    }

    onBack(){
        window.history.go(-1);
    }

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
            this.getOrderDetail();
        }
    }

     //获取订单详情
    getOrderDetail(callback){
        let order_id = this.order_id;
        HttpUtils.get('/api.php?route=order/orderDetail&order_id=' + order_id, {})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let order_detail = responseData.data;
                this.setState({
                    loading: false,
                    order_detail: order_detail
                });
                typeof callback == 'function' && callback();
                try{
                    let total_price = order_detail['total'];
                    total_price = parseFloat(total_price.replace(/[^\d.]/g,''));
                    this.completedPurchaseTrack({
                        order_id: order_id,
                        total_price: total_price,
                        currency: order_detail['currency_code']
                    });
                    this.firstPurchaseTrack(order_detail);
                } catch(e){

                }
            }
        }).catch(error=>{
            
        });
    }

    //支付成功事件
    completedPurchaseTrack(order){
        let order_id = order['order_id'];
        if(!order_id){
            return false;
        }
        let is_track = window.localStorage.getItem('completedPurchase_' + order_id);
        if(is_track != '1'){
            window.localStorage.setItem('completedPurchase_' + order_id, '1');
        }
        Appsflyer.completedPurchase(order);
    }

    //首次购买检查事件
    firstPurchaseTrack(order){
        if(!window.plus){
            return false;
        }
        if(!order){
            return false;
        }
        let is_track = window.localStorage.getItem('firstPurchaseTrack');
        if(is_track == '1'){
            return false;
        }
        let order_id = order['order_id'];
        HttpUtils.get('/api.php?route=order/checkFirstOrder', {})
        .then((responseData)=>{
            if(responseData.code === '0000' && responseData.data.status == '1'){
                let total_price = order['total'];
                total_price = parseFloat(total_price.replace(/[^\d.]/g,''));
                let products_data = order.products_data;
                let product_ids = [];
                let quantity = 0;
                for(var p in products_data){
                    let product = products_data[p];
                    product_ids.push(product['product_id']);
                    quantity += parseInt(product['quantity']);
                }
                product_ids = product_ids.join(',');
                Appsflyer.firstPurchase({
                    order_id: order_id,
                    total_price: total_price,
                    product_ids: product_ids,
                    quantity: quantity,
                    currency: order['currency_code']
                });
                window.localStorage.setItem('firstPurchaseTrack', '1');
            }
        }).catch(error=>{
            
        });
        
    }

	render() {
        let order_detail = this.state.order_detail ? this.state.order_detail : null;
        let order_id = this.order_id;
        return(
            <div className="checkoutPage">
                 <Layout header_title={this.state.header_title} footer={null}>
                    <div className="checkoutBox">
                        <p className="icon-box">
                           <span className="iconfont icon-success"></span>
                        </p>
                        {
                            order_detail &&  
                            <div>
                                <p className="orderNo">
                                    <span className="ordertext">OrderNo : </span>
                                    <Link className="text-success" to={this.state.order_link}>{order_detail['order_no']}</Link>
                                </p>
                            </div>
                        }
                        <div className="controlGroup">
                            <Link className="btn btnPrimary" to={this.state.order_link}>View Order</Link>
                        </div>
                    </div>
                </Layout>
            </div>
        )
	}
}

export default Success;