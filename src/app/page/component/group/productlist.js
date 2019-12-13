import React, {Component} from 'react';

import './list.css';
import {CacheLink  } from 'react-keeper';
import ReactSwiper from 'reactjs-swiper';
import Share from 'appSrcs/utils/share';
import copy from 'copy-to-clipboard';
import loginHoc from 'appSrcs/component/hoc/loginHoc';
import buyTips from "appSrcs/static/images/buyTips.gif";

function SwiperComponent(props) {
    let images = props.images;
    const options = {
        preloadImages: false,
        lazyLoading: true,
        autoplay: 0,
        autoplayDisableOnInteraction: false
    };
    return (
         <ReactSwiper options={options} showPagination  lazy={true} className="imageW" items={images} />
    );
}

//产品列表组件
class ProductListComponent extends Component {

    async shareWhatsApp(item){
        let description = item.description_share ? item.description_share : '';
        description = item.name + description;
        copy(description);
        let images = [];
        for(var i in item['image']){
            images.push(item['image'][i]['image']);
        }
        let share_data = {
            product_group_id : item.product_group_id,
            product_id : item.product_id,
            description : description,
            images : images
        }
        Share.productShareWhatsapp(share_data, function(rst){
            if(rst.data.share_count){
                let share_count_elem = document.getElementById('product_share_count_'+item.product_id);
                if(share_count_elem){
                    share_count_elem.innerHTML = rst.data.share_count;
                }
            }
        });
    }

    shareOhters(item){
        let description = item.description_share ? item.description_share : '';
        description = item.name + description;
        copy(description);
        let images = [];
        for(var i in item['image']){
            images.push(item['image'][i]['image']);
        }
        let share_data = {
            product_group_id : item.product_group_id,
            product_id : item.product_id,
            description : description,
            images : images,
            url : '',
            type : ''//whatsapp fackbook
        }
        if(this.props.login()){
            Share.showMenu(window.plus, share_data, (rst)=>{
                if(rst.data.share_count){
                    let share_count_elem = document.getElementById('product_share_count_'+item.product_id);
                    if(share_count_elem){
                        share_count_elem.innerHTML = rst.data.share_count;
                    }
                }
            });
        }
    }

    render() {
        let products = this.props.products;
        let vendor_store = this.props.vendor_store ? this.props.vendor_store : {};
        let isDApp = window.IsDApp;
        let vendor_store_id = this.props.vendor_store_id;
        //是否显示价格
        let is_show_price = true;
        //是否现在询价
        let is_show_askprice = false;
        let whatsapp_number =  '';
        //h5店铺设置不展示价格
        if(!isDApp && vendor_store){
            if(typeof vendor_store['is_show_price'] != 'undefined' && vendor_store['is_show_price']  != '1'){
                is_show_price = false;
            }
            whatsapp_number = vendor_store['whats_app_number'] ? vendor_store['whats_app_number'] : ''
            if(!is_show_price && whatsapp_number){
                if(typeof vendor_store['is_show_askprice'] != 'undefined' && vendor_store['is_show_askprice']  == '1'){
                    is_show_askprice = true;
                }
            }
        }
        return (
            <ul className='groupProductList'>
            {
                products && products.length > 0 ? products.map((item, index) => {
                    return (
                        <li className="groupListItem groupProductItem" key={index}>
                            <CacheLink to={'/product/' + item['product_id']} state={{vendor_store_id: vendor_store_id}}>
                                <div className="ProductSewipe">
                                    <SwiperComponent images={item['image'] || ''} />
                                    {
                                        item['out_of_stock'] && 
                                        <div className="out_of_stock_box">
                                            <div className="out_of_stock">
                                                Out Of Stock
                                            </div>
                                            {
                                                isDApp ?  
                                                    <div className="noticeAvailable">
                                                        <span className="iconfont icon-notices"></span>Notify me when available
                                                    </div>
                                                : null
                                            }
                                        </div>
                                    }
                                </div>
                            </CacheLink>
                            <div className="infoblock">
                                <CacheLink to={'/product/' + item['product_id']} state={{vendor_store_id: vendor_store_id}}>
                                    <div className="name">{item['name']}</div>
                                </CacheLink>
                                <div className="boxInfo">
                                    {
                                        is_show_price ? 
                                        <span className="priceBlock">
                                            <span className="pricetext">Starting from</span>
                                            <span className="price">{item['price'] || ''}</span>
                                             {
                                                isDApp && item.price_extra_display &&
                                                (
                                                    <span>
                                                        {
                                                            item.price_extra && <span className="sprice">{item.price_extra}</span>
                                                        }
                                                        { 
                                                            item.discount_off && 
                                                            <span className="soff">（{item.discount_off} off）</span>
                                                        }
                                                    </span>
                                                )
                                            }
                                        </span> : null
                                    }
                                    {
                                        is_show_askprice ? 
                                        <a href={"https://api.whatsapp.com/send?phone=" + whatsapp_number} target="_blank">
                                        <span className="askprice">
                                            <span className="iconfont icon-whatsapp"></span> <span>Ask Best Price</span>
                                        </span></a> : null
                                    }
                                    <span className="sshare">
                                        <span className="product_share_count" id={"product_share_count_" + item['product_id']}>{item['share_count']}</span>
                                        <span className="iconfont icon-share"></span>
                                    </span>
                                </div>
                                <div className="shipbox clearfix">
                                    <span className="shipblock">
                                        {
                                            item['freight_original'] > 0 ? 
                                            <span>
                                                <span className="iconfont icon-ship"></span>
                                                <span>Discounted Shipping</span>
                                                <span className="price">{item.freight}</span> 
                                                {
                                                    item['delineation_freight'] ? <span className="sprice">{item.delineation_freight}</span> : ''
                                                }
                                            </span> :
                                            <span>
                                                <span className="iconfont icon-ship"></span><span>Free Shipping</span>
                                            </span>
                                        }
                                    </span>
                                </div>
                                <div className="sship">
                                    <img src={buyTips} className="buyTips"/>
                                    <CacheLink to={'/product/' + item['product_id']} className="detailLink" state={{vendor_store_id: vendor_store_id}}>{'Details>>'}</CacheLink>
                                </div>
                                {
                                    isDApp ? 
                                    <div className="btnfnfo">
                                        <span className="btn btnShare" onClick={() => this.shareOhters(item)}>
                                            <span className="iconfont icon-share"></span>
                                            <span className="text">Share</span>
                                        </span>
                                        <span className="btn btnWhatsapp" onClick={(text) => this.shareWhatsApp(item, index)}>
                                            <span className="iconfont icon-whatsapp"></span>
                                            <span className="text">Share on whatsapp</span>
                                        </span>
                                    </div> : null
                                }
                            </div>
                        </li>
                    )
                }) : null
            }
            </ul>
        );
    }
}

export default loginHoc(ProductListComponent);