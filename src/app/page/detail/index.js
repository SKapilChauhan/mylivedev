import React, {Component} from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import './index.css';
import './review.css';
import { Link, Control  } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../error/notFound";
import ReactSwiper from 'reactjs-swiper';
import Toast from "appSrcs/component/toast/index";
import Progress from "appSrcs/component/progress/index";
import copy from 'copy-to-clipboard';
import ReviewListComponent from "./review_list";
import Share from 'appSrcs/utils/share';
import loginHoc from 'appSrcs/component/hoc/loginHoc';
import Appsflyer from "appSrcs/utils/appsflyer";

//轮播图片
function SwiperComponent(props) {
    if(!props.images){
        return null;
    }
    let images = props.images;
    const swiperOptions = {
        preloadImages: true,
        autoplay: 0,
        autoplayDisableOnInteraction: false
    };
    let items = [];
    for(var i in images){
        items.push({
            image: images[i]
        })
    }
    return (
        <ReactSwiper swiperOptions={swiperOptions} showPagination items={items} className="imageW" />
    );
}

//购买框
class BuyLayer extends Component {
    constructor(props) {
        super(props);
        this.isDApp = window.IsDApp;
        let product_datail = this.props.product_datail;
        let current_variant = {};
        let length = product_datail['variants'] ? product_datail['variants'].length : 0;
        if(length > 0){
            current_variant = product_datail['variants'][0];
        }
        let select_attributes = {};
        if(length === 1){
            let attribute = current_variant['attribute'];
            for(var i in attribute){
                let option_id = attribute[i]['option_id'];
                select_attributes[option_id] = attribute[i]['option_value_id'];
            }
        }
        
        this.state = {
            //当前选择的变体sku
            current_variant: current_variant,
            //当前选择的属性值
            select_attributes: select_attributes,
            qty: 1
        }
    }

    //选择属性值
    selectAttribute(option_id, attribute_id){
        let select_attributes = this.state.select_attributes || {};
        select_attributes[option_id] = attribute_id;
        let current_variant = this.getCurrentVariants(select_attributes);
        let update_data = {
            select_attributes: select_attributes,
        }
        if(current_variant != null){
            update_data.current_variant = current_variant;
        }
        this.setState(update_data);
    }

    //添加购物车
    onConfirm(type){
        let select_attributes = this.state.select_attributes;
        let sku = this.getCurrentVariants(select_attributes);
        if(!sku || sku == null){
            Toast.danger('Please Select The Attributes');
            return false;
        }
        let quantity = parseInt(this.state.qty);
        if(typeof sku['stock'] != 'undefined'){
            if(sku['stock'] <= 0){
                Toast.danger('Sorry, the current product is out of stock.');
                return false;
            }
            if(quantity > sku['stock']){
                Toast.danger('The current maximum stock is ' + sku['stock']);
                return false;
            }
        }
        let sku_data = {
            product_sku: sku['product_sku'],
            quantity: quantity,
            price: sku['product_sale_price_original']
        }
        this.props.onConfirm(sku_data, type);
    }

    //获取当前选择的变体
    getCurrentVariants(select_attributes){
        let current_variant = {};
        let product_datail = this.props.product_datail;
        let variants = product_datail['variants'];
        let option_size = 0;
        let option_c_size = 0;
        if(!product_datail['attributes'] || product_datail['attributes'].length == 0){
            current_variant = (variants && variants.length > 0) ? variants[0] : {};
            return current_variant;
        }
        for(let i in product_datail['attributes']){
            option_size++;
        }
        for(let i in select_attributes){
            option_c_size++;
        }
        if(option_c_size != option_size){
            return null;
        }
        for(let i in variants){
            let attribute = variants[i]['attribute'];
            let p = 0;
            for(let s in select_attributes){
                for(let a in attribute){
                    if(attribute[a]['option_id'] == s && attribute[a]['option_value_id'] == select_attributes[s]){
                        p++;
                    }
                }
            }
            if(p > 0 && p == option_size){
               current_variant =  variants[i];
            }
        }
        return current_variant;
    }

    //更新数量
    updateQty(type){
        let qty = parseInt(this.state.qty);
        if(type == 'increase'){
            qty = qty + 1;
        } else if(type == 'decrease'){
            if(qty > 1){
                qty = qty - 1;
            }
        }
        this.setState({
            qty: qty
        });
    }

    //视图
    render(){

        if(!this.props.product_datail){
            return null;
        }

        let product_datail = this.props.product_datail;

        //产品属性列表
        let attributes = product_datail['attributes'] ? product_datail['attributes'] : [];

        //当前选择的属性值
        let select_attributes = this.state.select_attributes;

        let buyType = this.props.buyType;

        return (
            <div className="goodsBuyLayer">
                <form className="goodsBuyForm">
                    <div className="buyBoxContent">
                        <div className="box skuImgInfo">
                            <div className="img">
                                <img src={this.state.current_variant && this.state.current_variant['product_image']} className="sku-image" alt='' />
                            </div>
                            <div className="info">
                                <span className="priceInfo">
                                    <span className="price">{this.state.current_variant && this.state.current_variant['product_sale_price']}</span>
                                </span>
                            </div>
                        </div>
                        <div className="skuBox">
                            <div className="skuAttributesList">
                                <div className="attributes">
                                    {
                                        Object.keys(attributes).map((okey, oindex) => {
                                            return (
                                                <div className="attributesItem" key={oindex}>
                                                    <div className="title">{attributes[okey]['option_name']}</div>
                                                    <ul className="value">
                                                        {
                                                            Object.keys(attributes[okey]['attribute']).map((attribute_id, aindex) => {
                                                                return (
                                                                    <li className={'attributesValueItem ' +  
                                                                        (select_attributes && select_attributes[attributes[okey]['option_id']] 
                                                                        && select_attributes[attributes[okey]['option_id']] == attribute_id ? 'current' : '')
                                                                    }
                                                                    key={aindex} data-option-id={attributes[okey]['option_id']} data-attribute-id={attribute_id} onClick={() => this.selectAttribute(attributes[okey]['option_id'], attribute_id)}>
                                                                        <span>{attributes[okey]['attribute'][attribute_id]}</span>
                                                                    </li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="qtybox clearfix">
                            <span className="text">Quantity</span>
                            <div className="input">
                                <span className="numberReduce" data-type="decrease" onClick={(type) => this.updateQty('decrease')}>-</span>
                                <input className="formControl" type="number" name="qty" value={this.state.qty} min="1" onChange={(event) => this.setState({qty: event.target.value})} />
                                <span className="numberReduce" data-type="increase" onClick={(type) => this.updateQty('increase')} >+</span>
                            </div>
                        </div>
                        {
                            this.isDApp ?  
                                <div className="btnBox">
                                    <a href="javascript:void(0)" className="addToCart" onClick={() => this.onConfirm('addToCart')}>Next</a>
                                </div>
                            :
                            <div className="btnBox">
                                <a href="javascript:void(0)" className="checkOut" onClick={() => this.onConfirm(buyType)}>Confirm</a>
                            </div>
                        }
                       
                    </div>
                </form>
            </div>
        )
    }
}

//评论组件
class ReviewComponent extends Component {
   
    render(){
        let review_data = this.props.review_data;
        if(!this.props.review_data){
            return null;
        }
        let rating_count = review_data['review_rating'] || [];
        let rating_count_obj = {};
        for(let i in rating_count){
            let total = rating_count[i]['total'];
            let scale = total / review_data['reviews'];
            rating_count_obj[rating_count[i]['rating']] = {
                'total': total,
                'scale': scale
            };
            rating_count_obj[rating_count[i]['scale']] = rating_count[i]['total'];
        }
        let count_item = [
            {
                text: 'Excellent',
                value: rating_count_obj[5] ? rating_count_obj[5]['total'] : 0,
                scale:  rating_count_obj[5] ? rating_count_obj[5]['scale'] : 0,
                backgroundColor: '#24d144'
            },{
                text: 'Very Good',
                value: rating_count_obj[4] ? rating_count_obj[4]['total']  : 0,
                scale:  rating_count_obj[4] ? rating_count_obj[4]['scale'] : 0,
                backgroundColor: '#f6ac71'
            },{
                text: 'Good',
                value: rating_count_obj[3] ? rating_count_obj[3]['total']  : 0,
                scale:  rating_count_obj[3] ? rating_count_obj[3]['scale'] : 0,
                backgroundColor: '#d6e742'
            },{
                text: 'Average',
                value: rating_count_obj[2] ? rating_count_obj[2]['total']  : 0,
                scale:  rating_count_obj[2] ? rating_count_obj[2]['scale'] : 0,
                backgroundColor: '#4cb5ec'
            },{
                text: 'Poor',
                value: rating_count_obj[1] ? rating_count_obj[1]['total']  : 0,
                scale:  rating_count_obj[1] ? rating_count_obj[1]['scale'] : 0,
                backgroundColor: '#ed6141'
            }
        ];
        return (
            <div>
                <div className="ratingBox">
                    <div className="ratingStarBox">
                        <div>
                            <span className="ratingStar"><span className="text">{review_data['rating']}</span><span className="iconfont icon-star"></span></span>
                        </div>
                        <div className="ptext">
                            <div>Based on</div>
                            <div> {review_data['rating']} Ratings,</div>
                            <div>{review_data['reviews']}  Reviews</div>
                        </div>
                    </div>
                    <div className="ratingCountBox">
                        <ul>
                            {
                                count_item.map((item, index) => {
                                    return (
                                        <li key={index}>
                                            <span className="text">{item['text']}</span>
                                            <span className="progress">
                                                <span className="progressBar" style={{'backgroundColor': item['backgroundColor'], 'width': (item['scale'] * 100 +'%') }}></span>
                                            </span>
                                            <span className="count">({item['value']})</span>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

//详情页
class Detail extends Component{

	constructor(props) {
		super(props);
        let promotion_code = this.getQueryPram('code')
        this.promotion_code = promotion_code;
        if(this.props.product_id){
            this.product_id = this.props.product_id;
        } else {
            let params = this.props.params;
            this.product_id = params.id;
        }
        let vendor_store_id = (Control.state && Control.state.vendor_store_id) || 0;
        this.vendor_store_id = vendor_store_id;
        this.isDApp = window.IsDApp;
        this.buySkuData = {};
        this.state = {
            //加载中
            loading : true,
            header_title: '',
            //产品详情数据
            product_detail : null,
            //评论统计数据
            review_data : {},
            //评论列表
            review_list: [],
            //加载评论中
            loading_review: true,
            //显示加价设置框
            showSetPriceLayer: false,
            //当前的分享码
            promotion_code: promotion_code,
            //已经添加购物车
            is_add_cart: false,
            isDApp: this.isDApp,
            vendor_store: null,
            //是否展示价格
            is_show_price: true,
            //是否允许询价
            is_show_askprice: false,
            //sku加价
            skuSetPriceData: {},
            //当前弹框加价
            currentsetPriceData: {}
        };
        this.onPopstate = this.popstate.bind(this)
	}

	componentDidMount(){
        let self = this;
		this.loadProductData(this.product_id);
        window.addEventListener('popstate', this.onPopstate, false);
	}

    popstate(evt){
        this.setState({
            showSetPriceLayer: false,
            showBuyLayer: false
        });
    }

    //设置弹框历史，可回退关闭弹框
    pushLayerState(){
        if(window.history && window.history.state && window.history.state.layer == '1'){
            return false;
        }
        window.history.pushState({
             layer: 1
        }, document.title, window.location.href);
    }

    //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
        window.removeEventListener('popstate', this.onPopstate, false);
    }

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

    //返回
    back(){
        window.history.go(-1);
    }

    //产品改变
    componentDidUpdate(){
        let params = this.props.params;
        if(params.id != this.product_id){
            this.product_id = params.id;
            this.setState({
                loading : true
            });
            this.loadProductData(this.product_id);
        }
    }
	
    //加载产品数据
	loadProductData(product_id){
        if(!product_id){
            return;
        }
        //加载产品详情
        this.loadDetail(product_id);
        //加载产品评论统计
        this.loadReview(product_id);
        //加载评论列表
        this.loadReviewList(product_id);
	}

    //加载产品详情
    loadDetail(product_id){
        let data = {};
        if(this.promotion_code){
            data['promotion_code'] = this.promotion_code;
        }
        else if(this.vendor_store_id){
            data['vendor_store_id'] = this.vendor_store_id;
        }
        HttpUtils.get('/api.php?route=product&product_id='+product_id, data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let product_datail = responseData.data;
                if(!product_datail instanceof Object || Object.keys(product_datail).length === 0){
                    product_datail = null;
                    this.setState({
                        product_datail: null,
                        loading: false
                    });
                    return false;
                }
                let header_title = product_datail && product_datail.name ? product_datail.name : '';
            
                 //当前货币
                let currency_current = product_datail['currency_current'];
                let symbol_left = currency_current.symbol_left ? currency_current.symbol_left : '';
                let symbol_right = currency_current.symbol_right ? currency_current.symbol_right : '';

                let set_price = product_datail['set_price'];

                //产品价格
                let price_original = parseFloat(set_price['price_original']);
                let price_original_text = symbol_left + price_original + symbol_right;
                //运费
                let shipping_charges_original = set_price['shipping_charges_original'];
                shipping_charges_original = parseFloat(shipping_charges_original);
                shipping_charges_original = shipping_charges_original > 0 ? shipping_charges_original : 0;
                //产品总价格
                let price_original_total = price_original + shipping_charges_original;

                //价格设置的最小值
                let min_price_text = symbol_left + price_original_total + symbol_right;

                //价格最大值
                let price_original_max = price_original_total * 2;
                if(price_original_max <=500){
                    price_original_max = 500;
                }
                let max_price_text = symbol_left + price_original_max + symbol_right;

                //当前的加价后价格
                let customer_pay_original = set_price && set_price['customer_pay_original'] ? set_price['customer_pay_original'] : price_original;

                let customer_pay = set_price && set_price['customer_pay'] ? set_price['customer_pay'] : min_price_text;

                let raise_price = set_price && set_price['raise_price'] ? parseFloat(set_price['raise_price']) : 0;

                let my_margin = set_price && set_price['my_margin'] ? set_price['my_margin'] : '0';

                let progress_length = price_original_max - price_original_total;
                let progress_cvalue = Math.floor((raise_price / progress_length) * 100) / 100;

                let vendor_store = product_datail['vendor_store'] ? product_datail['vendor_store'] : null;

                //是否显示价格
                let is_show_price =  true;

                //是否显示询价
                let is_show_askprice = false;

                //店铺联系whatsapp号码
                let ask_whatsapp_number = '';

                //h5店铺设置是否显示价格
                if(!this.isDApp && vendor_store){
                    if(typeof vendor_store['is_show_price'] != 'undefined' && vendor_store['is_show_price']  != '1'){
                        is_show_price = false;
                    }
                    ask_whatsapp_number = vendor_store['whats_app_number'] ? vendor_store['whats_app_number'] : ''
                    if(!is_show_price && ask_whatsapp_number){
                        if(typeof vendor_store['is_show_askprice'] != 'undefined' && vendor_store['is_show_askprice']  == '1'){
                            is_show_askprice = true;
                        }
                    }
                }

                this.setState({
                    buyType: 'addToCart',
                    product_datail: product_datail,
                    header_title: header_title,
                    loading : false,
                    vendor_store: vendor_store,
                    is_show_price: is_show_price,
                    is_show_askprice: is_show_askprice,
                    ask_whatsapp_number: ask_whatsapp_number,
                    //set price
                    setPriceData: {
                        price_original: price_original,
                        price_original_text: price_original_text,
                        shipping_charges_original: shipping_charges_original,
                        shipping_charges_text: set_price['shipping_charges'],
                        price_original_total: price_original_total,
                        //价格最小值
                        min_price: price_original_total,
                        min_price_text: min_price_text,
                        //价格最大值
                        max_price: price_original_max,
                        max_price_text: max_price_text,
                        //加价后价格
                        customer_pay_original: customer_pay_original,
                        customer_pay: customer_pay,
                        my_margin: my_margin,
                        //当前的加价
                        raise_price: raise_price,
                        //拖动的比例
                        cvalue: progress_cvalue,
                        india_gst: parseFloat(set_price['india_gst'])
                    }
                });
                try{
                    this.appTrackView(product_datail);
                } catch(e){

                }
            } else if(responseData.code === '4001'){
                //店铺不存在
                
            }
        }).catch(error=>{
            
        });
    }

    //获取sku的默认加价
    getSkuPriceData(sku, raise_price){
        let product_datail = this.state.product_datail;
        let set_price = product_datail['set_price'];
        //当前货币
        let currency_current = product_datail['currency_current'];
        let symbol_left = currency_current.symbol_left ? currency_current.symbol_left : '';
        let symbol_right = currency_current.symbol_right ? currency_current.symbol_right : '';

        //运费
        let shipping_charges_original = set_price['shipping_charges_original'];
        shipping_charges_original = parseFloat(shipping_charges_original);
        shipping_charges_original = shipping_charges_original > 0 ? shipping_charges_original : 0;

        //sku产品价格
        let price_original = parseFloat(sku['price']);
        let price_original_text = symbol_left + price_original + symbol_right;

        //价格最小值
        let price_original_total = price_original + shipping_charges_original;
        let min_price_text = symbol_left + price_original_total + symbol_right;

        //价格最大值
        let price_original_max = price_original_total * 2;
        if(price_original_max <=500){
            price_original_max = 500;
        }
        let max_price_text = symbol_left + price_original_max + symbol_right;

        if(raise_price <=0){
            raise_price = 0;
        }
        raise_price = Math.round(raise_price);
        let customer_pay_original = price_original_total + raise_price;
        let india_gst = set_price['india_gst'];
        let gst = Math.round(raise_price * india_gst);
        let margin_price = Math.round(raise_price - gst);

        let progress_length = price_original_max - price_original_total;
        let progress_cvalue = Math.floor((raise_price / progress_length) * 100) / 100;

        let my_margin = symbol_left + margin_price + '(' + raise_price + '-' + gst + 'GST)' + symbol_right;
        let customer_pay = symbol_left + customer_pay_original +  symbol_right;

        let setPriceData = {
            price_original: price_original,
            price_original_text: price_original_text,
            shipping_charges_original: shipping_charges_original,
            shipping_charges_text: set_price['shipping_charges'],
            price_original_total: price_original_total,
            //价格最小值
            min_price: price_original_total,
            min_price_text: min_price_text,
            //价格最大值
            max_price: price_original_max,
            max_price_text: max_price_text,
            //价格后价格
            customer_pay_original: customer_pay_original,
            customer_pay: customer_pay,
            my_margin: my_margin,
            //当前的加价
            raise_price: raise_price,
            //拖动的比例
            cvalue: progress_cvalue,
            india_gst: parseFloat(set_price['india_gst'])
        }

        return setPriceData;
    }
    
    //内容视图跟踪
    appTrackView(product_datail){
        let currency = product_datail['currency_current']['currency'];
        let product = {
            price: product_datail['price_original'],
            name: product_datail['name'],
            product_id: product_datail['product_id'],
            category_name: product_datail['category_name'] ? product_datail['category_name'] : '',
            currency: currency
        }
        Appsflyer.contentView(product);
    }

    //加载评论统计信息
    loadReview(product_id){
        HttpUtils.get('/api.php?route=product/rating&product_id='+product_id,{})
        .then((responseData)=>{
            let review_data = responseData.data;
            this.setState({
                review_data: review_data,
                loading_review: false
            });
        }).catch(error=>{
            
        });
    }

    //加载评论列表
    loadReviewList(product_id){
        let limit = 2;
        HttpUtils.get('/api.php?route=product/review&product_id='+product_id,{'limit': limit})
        .then((responseData)=>{
            let data = responseData.data;
            let review_list = data.reviews;
            this.setState({
                review_list: review_list
            });
        }).catch(error=>{
            
        });
    }

    //添加产品到店铺
    addToStore(){
        let self = this;
        let product_datail = this.state.product_datail;
        if(!product_datail){
            return;
        }
        let product_group_id = this.state.product_datail['product_group_id'];
        let product_id = this.state.product_datail['product_id'];
        Toast.showLoading();
        HttpUtils.post('/api.php?route=store/addProductGroup',{'product_group_id': product_group_id, 'product_id': product_id, 'raise_price': null})
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code == '0000'){
                product_datail['in_vendor_store'] = true;
                self.setState({
                    product_datail: product_datail
                });
                Toast.success(responseData.message);
            } else if(responseData.message != ''){
                Toast.danger(responseData.message)
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }

    //复制产品描述
    onCopyProductInfo(){
        let text = '';
        let product_datail = this.state.product_datail;
        if(product_datail){
            let description = product_datail.description ? product_datail.description : '';
            description = description.replace(/<[^>]*>|/g,"");
            text = product_datail.name + description;
        }
        copy(text);
        Toast.success({
            text: 'Successful Copy',
            duration: 3000
        })
    }

    //显示加价、购买
    onShowBuy(type){
        let product_datail = this.state.product_datail;
        if(!product_datail){
            return false;
        }
        if(this.isDApp){
            //显示购买框
            this.setState({
                showBuyLayer: true,
                showSetPriceLayer: false
            });
        } else {
            //显示购买框
            this.setState({
                showBuyLayer: true,
                showSetPriceLayer: false,
                buyType: type
            });
        }
        this.pushLayerState();
    }

    //分享
    async shareWhatsApp(raise_price){
        let product_datail = this.state.product_datail;
        if(!product_datail){
            return false;
        }
        let description = product_datail.name + (product_datail.description_share ? product_datail.description_share : '');
        copy(description);
        const share_data = {
            description : description,
            product_group_id : product_datail.product_group_id,
            product_id : product_datail.product_id,
            sns : 'whatsapp'
        };
        if(raise_price){
            share_data['raise_price'] = raise_price;
        }
        Share.shareWhatsapp(share_data, function(rst){

        });
    }

    //分享全部
    shareAll(raise_price){
        let product_datail = this.state.product_datail;
        if(!product_datail){
            return false;
        }
        let description = product_datail.name + (product_datail.description_share ? product_datail.description_share : '');
        copy(description);
        let images = product_datail['images'];
        let share_data = {
            type : '',//whatsapp fackbook
            images : images,
            description : description,
            url : '',
            product_group_id : product_datail.product_group_id,
            product_id : product_datail.product_id,
        }
        if(raise_price){
            share_data['raise_price'] = raise_price;
        }
        if(this.props.login()){
            Share.showMenu(window.plus, share_data, (ret)=>{
                
            });
        }
    }

    //分享加价
    onSharePrice(){
        let raise_price = '';
        let setPriceData = this.state.setPriceData;
        if(setPriceData['raise_price']){
            raise_price = setPriceData['raise_price'];
        }
        this.shareAll(raise_price);
    }

    //隐藏购买框
    hideBuy(){
        this.setState({
            showBuyLayer: false
        });
        if(window.history && window.history.state && window.history.state.layer == '1'){
            window.history.back();
        }
    }

    //显示价格设置
    showSetPrice(setPriceType){
        let currentSetPriceData = {};
        if(setPriceType == 'buy'){
            let raise_price = this.state.setPriceData['raise_price'];
            let sku_data = this.buySkuData.sku_data; 
            let sku = sku_data['product_sku'];
            if(!this.state.skuSetPriceData[sku]){
                currentSetPriceData = this.getSkuPriceData(sku_data, raise_price);
            }  else {
                currentSetPriceData = this.state.skuSetPriceData[sku];
            }
        } else {
            currentSetPriceData = this.state.setPriceData;
        }
        this.setState({
            showSetPriceLayer: true,
            setPriceType: setPriceType,
            showBuyLayer: false,
            currentSetPriceData: currentSetPriceData
        }, function(){
            let setPriceData = this.state.currentSetPriceData;
            let customer_pay_original = setPriceData['customer_pay_original'];
            this.updatePrice(customer_pay_original);
        });
        this.pushLayerState();
    }

    //隐藏价格设置
    hideSetPrice(){
        this.setState({
            showSetPriceLayer: false
        });
        if(window.history && window.history.state && window.history.state.layer == '1'){
            window.history.back();
        }
    }

    //价格拖动回调
    onPriceProgress(c){
        let product_datail = this.state.product_datail;
        let setPriceData = this.state.currentSetPriceData;
        let min = setPriceData['min_price'];
        let max = setPriceData['max_price'];
        let customer_pay_original = (max - min) * c + min;
        this.updatePrice(customer_pay_original);
    }

    //价格输入改变
    onPricechange(value){
        this.updatePrice(value);
    }

    //加价值更新
    updatePrice(customer_pay_original){
        let set_price = this.state.setPriceData;
        let customer_pay_value = Math.round(customer_pay_original);
        let product_datail = this.state.product_datail;
        let setPriceData = this.state.currentSetPriceData;
        let min = setPriceData['min_price'];
        let max = setPriceData['max_price'];
        setPriceData['customer_pay_original'] = customer_pay_original === '' ? '' : customer_pay_value;
        let raise_price = customer_pay_value - min;
        if(raise_price <=0){
            raise_price = 0;
        }
        raise_price = Math.round(raise_price);
        setPriceData['raise_price'] = raise_price;
        let india_gst = setPriceData['india_gst'];
        let gst = Math.round(raise_price * india_gst);
        let margin_price = Math.round(raise_price - gst);
        //当前货币
        let currency_current = product_datail['currency_current'];
        let symbol_left = currency_current.symbol_left ? currency_current.symbol_left : '';
        let symbol_right = currency_current.symbol_right ? currency_current.symbol_right : '';

        let progress_length = max - min;
        let progress_cvalue = Math.floor((raise_price / progress_length) * 100) / 100;

        setPriceData['my_margin'] = symbol_left + margin_price + '(' + raise_price + '-' + gst + 'GST)' + symbol_right;
        setPriceData['customer_pay'] = symbol_left + customer_pay_value +  symbol_right;
        setPriceData['cvalue'] = progress_cvalue;
        setPriceData['gst'] = gst;
        setPriceData['margin_price'] = margin_price;
        setPriceData['india_gst'] = india_gst;
        if(this.state.setPriceType != 'buy'){
            this.setState({
                currentSetPriceData: setPriceData,
                setPriceData: setPriceData
            });
        } else {
            let skuSetPriceData = this.state.skuSetPriceData;
            let sku_data = this.buySkuData.sku_data; 
            if(sku_data){
                let sku = sku_data['product_sku'];
                skuSetPriceData[sku] = setPriceData;
            }
            this.setState({
                currentSetPriceData: setPriceData,
                skuSetPriceData: skuSetPriceData
            });
        }
    }

    //设置价格
    setPriceComponent(){
        let product_datail = this.state.product_datail;
        let setPriceData  = this.state.currentSetPriceData;
        if(!setPriceData){
            return null;
        }
        let min_price_text = setPriceData['min_price_text'];
        let max_price_text = setPriceData['max_price_text'];
        let currency_current = product_datail['currency_current'] ? product_datail['currency_current'] : {};
        let currency_sign = '';
        if(currency_current){
           currency_sign =  currency_current['symbol_left'] ? currency_current['symbol_left'] : currency_current['symbol_right']
        }
        return (
            <div className="setPriceLayer">
                <div className="header">
                    Set Price For Customer
                </div>
                <div className="setPriceContent">
                    <div className="blockList">
                        <div className="blockitem">
                            <span>{ this.state.setPriceType != 'buy' ? 'Start From'  : '' } Shogee Price：</span>
                            <span className="price">{setPriceData['price_original_text']}</span>
                        </div>
                        <div className="blockitem">
                            <span>Shipping Charges：</span>
                            <span className="price">{setPriceData['shipping_charges_text']}</span>
                        </div>
                        <div className="blockitem">
                            <span>Customers Pay：</span> <span className="customersPay">{currency_sign}</span>
                            <input type="number" className="number_input" value={setPriceData.customer_pay_original} onChange={(event) => this.onPricechange(event.target.value)} />
                        </div>
                        <div className="blockitem">
                            <span>Your Margin：</span><span>{setPriceData.my_margin}</span>
                        </div>
                    </div>
                    <div className="blockitem priceProgressBox" id="setPriceDropBox">
                        <div className="priceProgressBlock">
                            <span className="text">{min_price_text}</span>
                            <div className="priceProgress">
                                <Progress style={{'width': '100%'}} callBack={(c) => this.onPriceProgress(c)} cvalue={(setPriceData && setPriceData.cvalue) ? setPriceData.cvalue : '0' } progressDropId="setPriceDropBox" />
                            </div>
                            <span className="text">{max_price_text}</span>
                        </div>
                    </div>
                    <div className="blockitem btnBlcok">
                        {
                            this.state.setPriceType == 'share' ?
                            <div className="buttonItem">
                                <input type="button" value="Share With This Price" className="btnSharePrice" onClick={(event) => this.onSharePrice()}  />
                            </div> : null
                        }
                        {
                            this.state.setPriceType == 'buy' ?
                            <div>
                                <div style={{'marginBottom': '50px'}}></div>
                                <div className="mobileFooter">
                                    <ul className="footNavInfo clearfix">
                                        <li className="ripple" style={{width: '50%', backgroundColor: '#ff585f', 'color': '#ffffff'}}><a  href="javascript:void(0)" onClick={() => this.onConfirmBuy('checkOut')}><span className="iconfont icon-cart" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Checkout</span></a></li>
                                        <li className="ripple" style={{width: '50%', backgroundColor: '#32dc50', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.onConfirmBuy('addToCart')}><span className="iconfont icon-checkout" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Add to Cart</span></a></li>
                                    </ul>
                                </div> 
                            </div>
                            : null
                        }
                    </div>
                </div>
            </div>
        )
    }

    //确认购买sku数据
    onConfirmSku(sku_data, type){
        this.buySkuData = {
            sku_data: sku_data
        }
        if(this.isDApp){
            this.showSetPrice('buy');
        } else {
            this.addToCart(sku_data, type);
        }
    }

    //确认购买
    onConfirmBuy(type){
        let sku_data = this.buySkuData.sku_data;
        this.addToCart(sku_data, type);
    }

    //添加购物车接口
    addToCart(sku_data, type, override){
        let self = this;
        let product_datail = this.state.product_datail;
        let product_id = product_datail['product_id'];
        let setPriceData = this.state.currentSetPriceData;
        var data = {
            product_id: product_id,
            product_sku: sku_data['product_sku'],
            quantity: sku_data['quantity']
        }
        if(override){
            data['override'] = '1';
        }
        if(this.isDApp){
            if(setPriceData.raise_price){
                data['raise_price'] = setPriceData.raise_price;
            }
        } else {
            let promotion_code = this.props.promotion_code;
            if(promotion_code){
                data['price_code'] = promotion_code;
            }
        }
        
        Toast.showLoading();
        HttpUtils.post('/api.php?route=shopping/cart/add', data)
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code == '0000'){
                self.setState({
                    is_add_cart: true,
                    showBuyLayer: false,
                    showSetPriceLayer: false
                })
                if(type == 'checkOut'){
                    var data = {};
                    if(responseData.data.cid){
                        data['cart_ids'] = [responseData.data.cid];
                        try {
                            let cart_ids = [responseData.data.cid];
                            cart_ids = JSON.stringify(cart_ids);
                            window.localStorage.setItem('checkout_cart_ids', cart_ids);
                        } catch(e){

                        }
                    }
                    Control.go('/cart', data);
                } else {
                    Toast.success(responseData.message);
                }
                let currency = product_datail['currency_current']['currency'];
                let product_data = {
                    price: sku_data['price'],
                    name: product_datail['name'],
                    id: product_datail['product_id'],
                    category_name: product_datail['category_name'],
                    currency: currency,
                    quantity: sku_data['quantity']
                }
                this.addCartAppTrack(product_data);
                if(window.history && window.history.state && window.history.state.layer == '1'){
                    window.history.back();
                }
            } else if(responseData.code == '9999'){
                self.overrideCart(sku_data, type);
            }
            else if(responseData.message != ''){
                Toast.danger(responseData.message)
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }

    //添加购物车跟踪
    addCartAppTrack(product){
        Appsflyer.addToCart(product);
    }

    //购物车替换提醒
    overrideCart(sku_data, type){
        let self = this; 
        Toast.confirm({
            text: 'Already have the same item in your shopping cart, are you sure to override the price?',
            onConfirm: function(){
                self.addToCart(sku_data, type, 1);
            }
        });
    }

    //底部组件
    footerrComponent() {
        let is_show_price = this.state.is_show_price;
        let is_show_askprice = this.state.is_show_askprice;
        let whatsapp_number = this.state.ask_whatsapp_number;
        if(this.isDApp){
             return (
                <div className="mobileFooter">
                    { 
                        this.state.is_add_cart ? 
                        <ul className="footNavInfo clearfix">
                            <li className="ripple" style={{width: '50%', backgroundColor: '#ff585f', 'color': '#ffffff'}}><Link to="/cart"><span className="iconfont icon-checkout" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Checkout</span></Link></li>
                            <li className="ripple" style={{width: '50%', backgroundColor: '#32dc50', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.onShowBuy()}><span className="iconfont icon-cart" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Add Other</span></a></li>
                        </ul>
                        : 
                        <ul className="footNavInfo clearfix">
                            <li className="ripple" style={{width: '50%', backgroundColor: '#ff585f', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.shareAll()}><span className="iconfont icon-share" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Share</span></a></li>
                            <li className="ripple" style={{width: '50%', backgroundColor: '#32dc50', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.onShowBuy()}><span className="iconfont icon-cart" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Add To Cart</span></a></li>
                        </ul>
                    }
                </div>
            );
        } else {
            if(!is_show_price){
                if(is_show_askprice){
                    return (
                        <div className="mobileFooter">
                            <ul className="footNavInfo clearfix">
                                <li className="ripple" style={{width: '100%', backgroundColor: '#32dc50', 'color': '#ffffff'}}><a href={"https://api.whatsapp.com/send?phone=" + whatsapp_number} target="_blank"><span className="iconfont icon-whatsapp" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff', 'fontSize': '14px'}}>Ask Best Price</span></a></li>
                            </ul>
                        </div>
                    )
                }
                return null;
            }
            return (
                <div className="mobileFooter">
                    <ul className="footNavInfo clearfix">
                        <li className="ripple" style={{width: '50%', backgroundColor: '#32dc50', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.onShowBuy('addToCart')}><span className="iconfont icon-cart" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Add To Cart</span></a></li>
                        <li className="ripple" style={{width: '50%', backgroundColor: '#ff585f', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.onShowBuy('checkOut')}><span className="iconfont icon-checkout" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Buy It Now</span></a></li>
                    </ul>
                </div>
            )
        }
    }
	
	render(){
        if(!this.state.loading && !this.state.product_datail){
            return (
                <Layout header_title={this.state.header_title} isBack={true} footer={null}>
                    <NotFoundComponent />
                </Layout>
            )
        }
        //占位符
        if(!this.state.product_datail){
            return (
                <Layout isBack={true} header_title={this.state.header_title} isCart={true}  footer={this.footerrComponent()}>
                    <div className="productHeader">
                        <span className="title">Product</span>
                    </div>
                </Layout>
            )
        }
        let setPriceData = this.state.setPriceData;
        let product_datail = this.state.product_datail;
        let is_show_price = this.state.is_show_price;
		return (
            <Layout isBack={true} header_title={this.state.header_title} isCart={true}  footer={this.footerrComponent()}>
                <div className="productDetailInfo">
                    <div className="productHeader">
                        <span className="title">Product</span>
                        {
                            this.state.isDApp ? (
                                <span>
                                    {
                                        !product_datail['in_vendor_store']  
                                        ? <span className="addToStore" onClick={(product_id) => this.addToStore()}><span className="iconfont icon-store"></span>Add to store</span>
                                        : <span className="addToStore"><Link to="/user/store"><span className="iconfont icon-store"></span>View in store</Link></span>
                                    }
                                    <span className="sshare">
                                        <span className="iconfont icon-share1"></span>
                                        <span className="text" onClick={() => this.shareAll()}>Share</span>
                                    </span>
                                </span>
                            ) : null
                        }
                        
                    </div>
        			<div className="ProductSewipe">
                        <SwiperComponent images={product_datail['images']} />
                        {
                            product_datail['out_of_stock'] && 
                            <div className="out_of_stock_box">
                                <div className="out_of_stock">
                                    Out Of Stock
                                </div>
                                {
                                    this.state.isDApp ? 
                                        <div className="noticeAvailable">
                                            <span className="iconfont icon-notices"></span>Notify me when available
                                        </div>
                                    : null
                                }
                            </div>
                        }
                    </div>
                    <div className="productInfo">
                        <div className="name">{product_datail['name']}</div>
                        <div className="boxinfo clearfix">
                            {
                                is_show_price ?  
                                <span>
                                    <span className="pricetext">Starting from</span>
                                    <span className="price">{product_datail['price']}</span>
                                    {
                                        this.isDApp && product_datail['price_extra_display'] && product_datail['price_extra'] ?
                                        <span className="sprice">{product_datail['price_extra']}</span> : ''
                                    }
                                    { 
                                        this.isDApp && product_datail.discount_off ?
                                        <span className="soff">（{product_datail.discount_off} off）</span> : ''
                                    }
                                </span> : null
                            }
                        </div>
                        <div className="sship">
                            
                        </div>
                        <div className="sship">
                            <span className="shipb">
                                
                                {
                                    product_datail['freight_original'] > 0 ? 
                                    <span>
                                         <span className="iconfont icon-ship"></span>
                                        <span>Discounted Shipping</span>
                                        <span className="price">{product_datail.freight}</span> 
                                        {
                                            product_datail['delineation_freight'] ? 
                                            <span className="sprice">{product_datail.delineation_freight}</span> : ''
                                        }
                                    </span> : 
                                    <span>
                                        <span className="iconfont icon-ship"></span><span>Free Shipping</span>
                                    </span>
                                }
                            </span>
                        </div>
                    </div>
                    {
                        this.state.isDApp ? 
                            <div className="productDescriptionBOX">
                                <div className="header setPriceHeader" onClick={() => this.showSetPrice('share')}>
                                    Price for Customers 
                                    <div className="sbtn">
                                        <div className="setBtnBox">
                                            <span className="sbutton">Set Your Price</span>
                                            <span className="sico iconfont icon-shouzhi"></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="content">
                                    <div>
                                        <span>Customers Pay：</span>
                                        <span>{setPriceData.customer_pay}</span>
                                    </div>
                                    <div>
                                        <span>Your Margin：</span><span>{setPriceData.my_margin}</span>
                                    </div>
                                </div>
                            </div> : null
                    }
                    <div className="productDescriptionBOX">
                        <div className="header">
                            Product Details
                            <a className="copyBtn" onClick={() => this.onCopyProductInfo()} href="javascript:void(0)"><span><span className="iconfont icon-copy"></span>Copy</span></a>
                        </div>
                        <div className="content">
                            <div dangerouslySetInnerHTML={{__html: product_datail && product_datail.description}}></div>
                        </div>
                    </div>
                    <div className="productDescriptionBOX" style={{'display': 'none'}}>
                        <div className="header">
                            Check Availability
                            <input type="button" className="rbtn" value="Select An Address" />
                        </div>
                        <div className="content">
                            <div className="inputBox">
                                <input type="text" className="formControl" placeholder="Enter Pincode" />
                                <button className="btn btnPrimary">Check</button>
                            </div>
                        </div>
                    </div>
                    <div className="productDescriptionBOX">
                        <div className="header">
                            Refund and Return Policy
                        </div>
                        <div className="content">
                            If there is any issue with the product,you can raise a Refund/Return request within 7 days of receiving the order.<br />
                            The product should be unused, undamaged and in original condition without any stain,scratches or holes. 
                        </div>
                    </div>
                    {
                        product_datail && product_datail['reviews'] > 0 ? 
                        <div className="productDescriptionBOX">
                            <div className="header">
                                Catalog Reviews
                            </div>
                            <div className="content">
                                {this.state.loading_review && <LoadingComponent />}
                                {!this.state.loading_review && product_datail && product_datail['reviews'] > 0  ?  <ReviewComponent review_data={this.state.review_data} /> : null }
                                <ReviewListComponent review_list={this.state.review_list} />
                                {
                                    product_datail && product_datail['reviews'] > 2 &&
                                    <div className="toReview">
                                    <Link to={'/reviews/' + this.product_id}><span className="text">See More Reviews</span><span className="iconfont icon-to-right"></span></Link>
                                    </div>
                                }
                            </div>
                        </div> : null
                    }
                </div>
                <div className={'buyLayerBox ' + (this.state.showBuyLayer && 'show')}>
                    <div className="coverLayer" onClick={() => this.hideBuy()}></div>
                    <BuyLayer product_datail={product_datail}  hideBuy={() => this.hideBuy()} onConfirm={(sku_data, type) => this.onConfirmSku(sku_data, type)} buyType={this.state.buyType} />
                </div>
                <div className={'setPriceBox ' + (this.state.showSetPriceLayer && 'show')}>
                    <div className="coverLayer" onClick={() => this.hideSetPrice()}></div>
                    {this.setPriceComponent()}
                </div>
            </Layout>
		);
	}
}

export default loginHoc(Detail);