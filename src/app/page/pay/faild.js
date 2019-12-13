import React, { Component } from 'react';
import Layout from "../layout/layout";
import { Link  } from 'react-keeper';
import HttpUtils from 'appSrcs/utils/http';
import './index.css';

class Success  extends Component {

    constructor(props) {
        super(props);
        let params = this.props.params;
        this.order_id = params.id ? params.id : '';
        this.state = {
            header: '',
            header_title: 'Pay Faild'
        };
        
        if(document.title == ''){
            document.title = 'Pay Faild'; 
        }
    };

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
            if(responseData.code == '0000'){
                let order_detail = responseData.data;
                this.setState({
                    loading: false,
                    order_detail: order_detail
                });
                typeof callback == 'function' && callback();
            }
        }).catch(error=>{
            
        });
    }

	render() {
        let order_detail = this.state.order_detail ? this.state.order_detail : null;
        if(order_detail == null){
            return null;
        }
        let order_id = this.order_id;
        return(
            <div className="checkoutPage">
                 <Layout header_title={this.state.header_title} footer={null}>
                    <div className="checkoutBox">
                        <p className="icon-box">
                           <span className="iconfont icon-tips"></span>
                        </p>
                        <p>An error has occurred, payment failed, please check your network or try it again!</p>
                        {
                            order_detail && 
                            <p className="orderNo">
                                <span className="ordertext">OrderNo : </span>
                                <Link className="text-success" to={'/user/order/detail/' + order_detail['order_id']}>{order_detail['order_no']}</Link>
                            </p>
                        }
                        <div className="controlGroup">
                            <Link className="btn btnPrimary" to={'/user/order/detail/' + order_id}>Try Again</Link>
                        </div>
                    </div>
                </Layout>
            </div>
        )
	}
}

export default Success;