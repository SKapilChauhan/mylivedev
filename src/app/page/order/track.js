import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import LoadingComponent from "appSrcs/component/loading";
import { Link, Control } from 'react-keeper';
import empty_image from 'appSrcs/static/images/no_result.png';
import Share from 'appSrcs/utils/share';
import './index.css';

//首页
class Order extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header_title: "Order Track", 
            loading: true
        };
        let params = this.props.params;
        this.order_id = params.id ? params.id : '';
        document.title = 'Order Track';
    };

    //页面加载完成调用
    componentDidMount() {
        this.getTrackData();
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
            this.getTrackData();
        }
    }

    //返回
    onBack(){
        if(window.history.length > 0){
            window.history.go(-1);
        } else {
            Control.go('/')
        }
    }

    //分享
    onShare(){
        let track_data = this.state.track_data;
        let des = '';
        for(var track_number in track_data){
            let track_link = track_data[track_number]['track_info']['tracking_url'];
            des += "Tracking Number 1: " + track_number +" \n";
            des += "Tracking Link: " + track_link +" \n";
            let products = track_data[track_number]['product'];
            for(var p in products){
                des += products[p]['name'] +" \n";
                if(products[p]['option_data']){
                    des += products[p]['option_data'] +" \n";
                }
                des += "quantity: " + products[p]['quantity'] + " \n";
            }
            des += "\n\n";
        }
        Share.showMenu(window.plus, {
            type : '',
            description : des,
            url : ''
        },(ret)=>{
            
        });
    }

    getTrackData(callback){
        let req = {'order_id': this.order_id};
        HttpUtils.get('/api.php?route=order/orderTrack', req)
        .then((responseData)=>{
            if(responseData.code == '0000'){
                let track_data = responseData.data.track;
                this.track_number = '';
                for(let track_number in track_data){
                    if(!this.track_number){
                        this.track_number = track_number;
                        break;
                    }
                }
                let current_track_data = track_data[this.track_number];
                this.setState({
                    track_data: track_data,
                    current_track_data: current_track_data,
                    loading: false,
                });
                typeof callback == 'function' && callback();
            } else {
                this.setState({
                    track_data: [],
                    current_track_data: null,
                    loading: false,
                });
            }
        }).catch(error=>{
            
        });
    }

    //选择跟踪号
    trackSelect(track_number){
        let track_data = this.state.track_data;
        this.track_number = track_number;
        let current_track_data = track_data[this.track_number];
        this.setState({
            current_track_data: current_track_data,
        });
    }

    openLink(url){
        if(!url){
            return false;
        }
        if(window.plus){
            window.plus.runtime.openURL(url);
        } else {
            window.open(url,'_blank');
        }
    }

    //订单产品列表
    orderProductList(current_track_data){
        let order_product_list = current_track_data['product'];
        return (
            <div className="orderViewPanel">
                <div className="headering">Product</div>
                <div className="content">
                    <ul className="orderProductList">
                        {
                            order_product_list ? order_product_list.map((productItem, pindex) => {
                                return (
                                    <li className="orderProductItem" key={pindex}>
                                        <div className="imginfo">
                                            <Link to={'/product/' + productItem['product_id']}><img src={productItem.image} alt='' /></Link>
                                        </div>
                                        <div className="infobox">
                                            <div className="productname">
                                                {productItem['name']}
                                            </div>
                                            {
                                                productItem['option_data']  &&
                                                <div className="attr">
                                                    <span>{productItem['option_data']}</span>
                                                </div>
                                            }
                                            <div className="productprice">
                                                <span className="text"><span className="price">{productItem['price']}</span> x {productItem['quantity']}</span>
                                            </div>
                                        </div>
                                    </li>
                                )
                            }) : null
                        }
                    </ul>
                </div>
            </div>
        )
    }

    //头部组件
    headerComponent(){
        return (
            <div className="mobileHeader">
                <div className="mobileHeaderBox clearfix">
                    <span className="backBox" onClick={() => this.onBack()}><span className="iconfont icon-back"></span></span>
                    <div className="mobileHeaderTitle" style={{'textAlign' : 'left','fontWeight':'bold'}}>
                        <div className="name">Order Track</div>
                    </div>
                    <a href="javascript:void(0)" className="headerShare" onClick={() => this.onShare()}><span className="iconfont icon-share"></span></a>
                </div>
            </div>
        );
    }

    //跟踪物流列表
    trackingInfoView(tracking_info){
        if(!tracking_info || tracking_info.length == 0){
            return null;
        }
        return (
             <div className="orderViewPanel">
                <div className="headering">TimeLine</div>
                <div className="content">
                    <ul className="orderTrackingList">
                        {
                            tracking_info .map((trackItem, tindex) => {
                                return (
                                    <li className="trackNodeItem" key={tindex}>
                                        <div className="nodeicon"></div>
                                        <div className="tinfo">
                                            <div className="time">{trackItem.date}</div>
                                            <div>{trackItem.location}</div>
                                            <div>{trackItem.instructions}</div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }


    render() {
        if(this.state.loading){
            return (
                <Layout header_title={this.state.header_title} current_route="order">
                    <LoadingComponent />
                </Layout>
            )
        }
        let track_data = this.state.track_data;
        if(track_data && track_data.length == 0){
            return (
                <Layout header_title={this.state.header_title} isBack={true} current_route="order">
                    <div className="noResults">
                        <div className="resultImg">
                            <img src={empty_image} width="120" alt='' />
                        </div>
                        <div className="resultContent">
                            <p>
                                This order have not  any tracking information at this time, please view it later.
                            </p>
                        </div>
                    </div>
                </Layout>
            )
        }
        let current_track_data = this.state.current_track_data;
        return(
            <Layout header={this.headerComponent()} current_route="order" footer={null}>
                <div className="orderDetailBox">
                    <div className="orderTrackMenu">
                        <ul className="menuBoxList">
                            {
                                track_data ? Object.keys(track_data).map((track_number, oindex) => {
                                    return (
                                        <li className={'menuBoxItem ' + (this.track_number == track_number ? 'current' : '')} key={oindex}> 
                                            <a onClick={() => this.trackSelect(track_number)}>
                                                {track_number || ''}
                                            </a>
                                        </li>
                                    )
                                }) : null
                            }
                        </ul>
                    </div>
                    <div className="orderBlockBox">
                        <div className="orderBlockBoxItem">
                            <span className="text">Shipping Method </span>
                            <span className="value">{current_track_data.track_info.shipping_name}</span>
                        </div>
                    </div>
                    <div className="orderBlockBox">
                        <div className="orderBlockBoxItem trackNumberBox">
                            <span className="text">Track Number</span>
                            <span className="value"><a href="javascript:void(0)" onClick={() => this.openLink(current_track_data.track_info.tracking_url)} >{current_track_data.track_info.tracking_number}</a></span>
                            {
                                current_track_data.track_info.tracking_url ? 
                                <a className="ulink" href="javascript:void(0)" onClick={() => this.openLink(current_track_data.track_info.tracking_url)}>Tracking</a>
                                : null
                            }
                            
                        </div>
                    </div>
                    <div className="orderProductList">
                        { current_track_data ? this.orderProductList(current_track_data) : null }
                    </div>
                    {
                        current_track_data.tracking_info ?  this.trackingInfoView(current_track_data.tracking_info) : null
                    }
                </div>
            </Layout>
        )
    }
}

export default Order;