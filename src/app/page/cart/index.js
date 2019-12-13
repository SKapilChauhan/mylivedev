import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import Toast from "appSrcs/component/toast/index";
import { Control, Link  } from 'react-keeper';
import './index.css';
import loginHoc from 'appSrcs/component/hoc/loginHoc';
import cart_empty_image from 'appSrcs/static/images/cart_empty.png';
import Appsflyer from "appSrcs/utils/appsflyer";

//首页
class Cart extends Component {

    //构造函数
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            //购物车数据
            cart_data: [],
            //选择后的金额信息
            totals_data : {},
            //选择后的购物数量
            cart_items: 0,
            //是否勾选全部
            selected_all: false,
            header_title: 'Cart'
        };
        document.title = 'Cart';
    };

    //页面加载完成调用
    componentDidMount() {
        this.getCartData();
    }

    //组件卸载
    componetWillUnmount(){
        Toast.hideLoading();
    }

    //获取当前选择的cart_ids
    getSelectCartIds(){
        let cart_ids = this.getSelectCartIdsCache();
        if(!cart_ids){
            cart_ids = (Control.state && Control.state.cart_ids) || 0;
        }
        return cart_ids;
    }

    //获取选择缓存cart_ids
    getSelectCartIdsCache(){
        let cart_ids = false;
        try {
            cart_ids = window.localStorage.getItem('checkout_cart_ids');
            cart_ids = JSON.parse(cart_ids);
        } catch(e){

        }
        return cart_ids;
    }

    //更新选择项缓存cart_ids
    updateSelectCartIdsCache(){
        let cart_ids = [];
        let cart_data = this.state.cart_data;
        let cart_products = cart_data.products;
        for(let i in cart_products){
            let supplier_products = cart_products[i]['products'];
            for(var c in supplier_products){
                if(supplier_products[c]['checked'] && supplier_products[c]['checked'] == '1'){
                    cart_ids.push(supplier_products[c]['cart_id']);
                }
            }
        }
        if(cart_ids.length > 0){
            this.setSelectCartIdsCache(cart_ids);
        }
    }

    //设置选择项缓存cart_ids
    setSelectCartIdsCache(cart_ids){
        try {
            cart_ids = JSON.stringify(cart_ids);
            window.localStorage.setItem('checkout_cart_ids', cart_ids);
        } catch(e){

        }
    }

    //获取购物车数据
    getCartData(callback){
        HttpUtils.get('/api.php?route=shopping/cart', {})
        .then((responseData)=>{
            if(responseData.code == '0000'){
                let cart_data = responseData.data;
                let totals = cart_data.totals;
                let totals_data = {};
                for(var i in totals){
                    let code = totals[i]['code'];
                    totals_data[code] = totals[i];
                }
                this.setState({
                    loading: false,
                    cart_data: cart_data,
                    totals_data: totals_data
                });
                let cart_ids = this.getSelectCartIds();
                if(cart_ids){
                    this.checkCheckoutItem(cart_ids)
                } else {
                    this.checkAll();
                }
                typeof callback == 'function' && callback();
            }
        }).catch(error=>{
            
        });
    }

    //自动选择结账的项
    checkCheckoutItem(cart_ids){
        let cart_data = this.state.cart_data;
        var selected_all = true;
        for(var i in cart_data.products){
            let supplier_products = cart_data.products[i]['products'];
            for(var c in supplier_products){
                if(this.inArray(supplier_products[c]['cart_id'], cart_ids)){
                    cart_data.products[i]['products'][c]['checked'] = '1';
                } else {
                    selected_all = false;
                }
            }
        }
        this.setState({
            cart_data: cart_data,
            selected_all: selected_all
        }, function(){
            this.updateCheckItem();
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

    //数量输入改变
    updateQty(s_index, key, quantity){
        let self = this;
        let cart_data = this.state.cart_data;
        let supplier_products = cart_data.products[s_index]['products'];
        let cart_item = supplier_products[key];
        let stock = cart_item['variant']['quantity'];
        if(quantity > stock){
            quantity = stock;
        }
        if(quantity <=0){
            quantity = 1;
        }
        let cid = cart_item['cart_id'];
        cart_item.quantity = quantity;
        cart_data.products[s_index].products[key] = cart_item;
        this.setState({
            cart_data: cart_data
        });
        if(this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        this.timerId = setTimeout(function() {
            self.updateCartItem(s_index, key, {
                'cid': cid,
                'qty': quantity
            })
        }, 1000);
    }

    //增减数量
    reaseQty(type, s_index, key){
        let cart_data = this.state.cart_data;
        let supplier_products = cart_data.products[s_index]['products'];
        let cart_item = supplier_products[key];
        let cid = cart_item['cart_id'];
        let quantity = parseInt(cart_item.quantity);
        if(type == 'increase'){
            quantity = quantity + 1;
        } else if(type == 'decrease'){
            if(quantity <=1){
                return false;
            }
            quantity = quantity - 1;
        } else {
            return false;
        }
        let stock = cart_item['variant']['quantity'];
        if(quantity > stock){
            quantity = stock;
            Toast.danger("The current maximum stock is " + stock);
        }
        if(quantity <=0){
            quantity = 1;
        }
        Toast.showLoading();
        this.updateCartItem(s_index, key, {
            'cid': cid,
            'qty': quantity
        })
    }

    //更新购物车接口
    updateCartItem(s_index, key, data, callback){
        HttpUtils.post('/api.php?route=shopping/cart/update', data)
        .then((responseData)=>{
            if(responseData.code == '0000'){
                Toast.hideLoading();
                this.updateItemQty(s_index, key, data.qty);
            } else {
                Toast.danger(responseData.message)
                Toast.hideLoading();
            }
        }).catch(error=>{
            Toast.hideLoading();
        }); 
    }

    //更新数量金额信息
    updateItemQty(s_index, key, quantity){
        let cart_data = this.state.cart_data;
        let cart_item = cart_data.products[s_index]['products'][key];
        cart_item['quantity'] = quantity;
        let total_number = parseFloat(cart_item['price_number']) * parseInt(cart_item['quantity']);
        cart_item['total_number'] = total_number;
        let currency = cart_data['currency'];
        let total_text = currency.left_symbol + total_number + currency.right_symbol;
        cart_item['total_text'] = total_text;
        cart_data.products[s_index]['products'][key] = cart_item;
        cart_data.reminder[cart_item['cart_id']] = [];
        this.setState({
            cart_data: cart_data
        }, function(){
            this.updateCheckItem();
        });
    }

    //删除购物车
    removeCartItem(s_index, key, cart_item){
        let self = this;
        let id = cart_item['cart_id'];
        Toast.confirm({
            text: 'Are you sure to remove it from your cart!',
            onConfirm: function(){
                HttpUtils.post('/api.php?route=shopping/cart/remove', {'cid': id})
                .then((responseData)=>{
                    Toast.hideLoading();
                    if(responseData.code == '0000'){
                        let cart_data = self.state.cart_data;
                        cart_data.products[s_index].products.splice(key, 1);
                        cart_data.reminder[id] = [];
                        self.setState({
                            cart_data: cart_data
                        }, function(){
                            self.updateCheckItem();
                        });
                        self.removeCartTrack(cart_item)
                    } else {
                        Toast.danger(responseData.message)
                    }
                }).catch(error=>{
                    Toast.hideLoading();
                }); 
            }
        });
    }

    //删除购物车跟踪
    removeCartTrack(cart_item){
        Appsflyer.removeFromCart({
            product_id: cart_item['product_id']
        })
    }

    //改变选择
    handleChange(s_index, key) {
        let cart_data = this.state.cart_data;
        let cart_item = cart_data.products[s_index].products[key];
        let selected_all = true;
        if(cart_item['checked'] && cart_item['checked'] == '1'){
            cart_data.products[s_index].products[key]['checked'] = '0';
            selected_all = false;
        } else {
            cart_data.products[s_index].products[key]['checked'] = '1';
            for(let i in cart_data.products){
                let supplier_products = cart_data.products[i]['products'];
                for(var c in supplier_products){
                    if(!supplier_products[c]['checked'] || supplier_products[c]['checked'] != '1'){
                        selected_all = false;
                    }
                }
                
            }
        }
        this.setState({
            cart_data: cart_data,
            selected_all: selected_all
        }, function(){
            this.updateCheckItem();
        });
        this.updateSelectCartIdsCache();
    }

    //全选选择取消操作
    handleCheckAll(){
        if(this.state.selected_all){
            this.unCheckAll();
        } else {
           this.checkAll();
        }
    }

    //取消全选
    unCheckAll(){
        let cart_data = this.state.cart_data;
        let cart_products = cart_data.products;
        for(var i in cart_products){
            let supplier_products = cart_products[i]['products'];
            for(var c in supplier_products){
                cart_products[i]['products'][c]['checked'] = '0';
            }
            
        }
        this.setState({
            selected_all: false,
            cart_data: cart_data
        }, function(){
            this.updateCheckItem();
        });
        this.setSelectCartIdsCache([]);
    }

    //全选
    checkAll(){
        let cart_data = this.state.cart_data;
        let cart_products = cart_data.products;
        for(var i in cart_products){
            let supplier_products = cart_products[i]['products'];
            for(var c in supplier_products){
                cart_products[i]['products'][c]['checked'] = '1';
            }
        }
        this.setState({
            selected_all: true,
            cart_data: cart_data
        }, function(){
            this.updateCheckItem();
        });
        this.updateSelectCartIdsCache();
    }

    //更新选择项的金额数量
    updateCheckItem(){
        let totals_data = this.state.totals_data;
        let cart_data = this.state.cart_data;
        let cart_products = cart_data.products;
        let total = 0;
        let sub_total = 0;
        let cart_items = 0;
        for(let i in cart_products){
            let supplier_products = cart_products[i]['products'];
            for(var c in supplier_products){
                let item  = supplier_products[c];
                if(item['checked'] == '1'){
                    let c_total = parseFloat(item['price_number']) * parseInt(item['quantity']);
                    sub_total = Math.floor((sub_total + c_total) * 100) / 100 ;
                    cart_items += parseInt(item['quantity']);
                }
            }
            
        }
        let currency = cart_data['currency'];
        total = sub_total;
        totals_data['sub_total']['text'] = currency.left_symbol + sub_total + currency.right_symbol;
        totals_data['total']['text'] = currency.left_symbol + total + currency.right_symbol;
        this.setState({
            totals_data: totals_data,
            cart_items: cart_items
        });
    }

    //进入结账页
    procedOrder(){
        let state_data = [];
        let is_checked = false;
        let cart_ids = [];
        let cart_data = this.state.cart_data;
        let cart_products = cart_data.products || [];
        let reminder = this.state.cart_data && this.state.cart_data.reminder ? this.state.cart_data.reminder : {};
        //产品异常
        let is_reminder = false;
        for(let i in cart_products){
            let supplier_products = cart_products[i]['products'];
            for(var c in supplier_products){
                let item = supplier_products[c];
                if(item['checked'] && item['checked'] == '1'){
                    if(reminder && reminder[item['cart_id']] && reminder[item['cart_id']].length > 0){
                        is_reminder = true;
                    }
                    cart_ids.push(item['cart_id']);
                }
            }
            
        }
        state_data['cart_ids'] = cart_ids;
        if(cart_ids.length > 0){
            is_checked = true;
        }
        if(!is_checked){
            Toast.danger('Please Select The products!');
            return false;
        }
        if(is_reminder){
            Toast.danger('Sorry, there are products with low stock!');
            return false;
        }
        if(!this.props.isLogin){
            Control.replace("/login", { redirect_link: Control.path, redirect_state: Control.state });
        } else {
            Control.go('/checkout', state_data);
        }
    }

    //购物车产品列表
    cartProductList(){
        let carts = this.state.cart_data && this.state.cart_data.products ? this.state.cart_data.products : [];
        let reminder = this.state.cart_data && this.state.cart_data.reminder ? this.state.cart_data.reminder : {};
        if(!carts || carts.length == 0){
            return null;
        }
        return (
            <div>
                {
                    carts.map((supplier_item, s_index) => {
                        return (
                            <div className="supplierCartItem" key={s_index}>
                                <ul className="cartProductList">
                                    {
                                        supplier_item['products'].map((item, index) => {
                                            let error_message = '';
                                            let cart_reminder =  reminder && reminder[item['cart_id']] && reminder[item['cart_id']] ? reminder[item['cart_id']] : [];
                                            if(cart_reminder){
                                                for(var rkey in cart_reminder){
                                                    error_message += cart_reminder[rkey];
                                                }
                                            }
                                            return (
                                                <li className="cartProductItem" key={index}>
                                                    <div className="check">
                                                        <div className="checkbox">
                                                            <input type="checkbox" checked={item['checked'] && item['checked'] == '1' ? true : false}  onChange={()=>{this.handleChange(s_index, index)}}  />
                                                            <label htmlFor="checkbox" className="checkbox-label"></label>
                                                        </div>
                                                    </div>
                                                    <div className="imginfo">
                                                        <Link to={'/product/' + item['product_id']}><img src={item['variant'] && item['variant']['image']} alt='' /></Link>
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
                                                                item['variant']['option'].map((op, oindex) => {
                                                                    return (
                                                                        <span key={oindex}>{op['option_name_text']}: {op['option_value_text']}</span>
                                                                    )
                                                                })
                                                            }
                                                            </div> : null
                                                        }
                                                        {

                                                            error_message ?  <span className="errormsg">{error_message}</span> : ''
                                                        }
                                                        <div className="qtybox clearfix">
                                                            <span className="text">Quantity</span>
                                                            <div className="input">
                                                                <span className="numberReduce" data-type="decrease" onClick={(type) => this.reaseQty('decrease', s_index, index)}>-</span>
                                                                <input className="formControl" type="number" name="qty" value={item.quantity} min="1"  onChange={(event) => this.updateQty(s_index, index, event.target.value)} />
                                                                <span className="numberReduce" data-type="increase" onClick={(type) => this.reaseQty('increase', s_index, index)} >+</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="removebtn" onClick={(type) => this.removeCartItem(s_index, index, item)}><span className="iconfont icon-trash"></span></span>
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
        )
    }

    //底部
    footer() {
        let totals_data = this.state.totals_data;
        return (
            <div className="mobileFooter">
                <ul className="footNavInfo">
                    <li className="cartFooterCheck" style={{flex: 3}}>
                        <div className="checkTotalBox">
                            <div className="checkAllBox">
                                <span className="checkbox">
                                    <input type="checkbox" checked={this.state.selected_all ? true : false}  onChange={()=>{this.handleCheckAll()}} />
                                    <label htmlFor="checkbox" className="checkbox-label"></label>
                                </span>
                                <span className="checkAllText">All</span>
                            </div>
                            <div className="totalInfo">
                                <span className="ptext">Total:</span> {totals_data['sub_total'] ? totals_data['sub_total']['text'] : null}
                                <div className="ws">(Without Shipping)</div>
                                {
                                    this.state.cart_items ? <div className="cartItems">{this.state.cart_items} items</div> : null
                                }
                            </div>
                        </div>
                    </li>
                    <li className="ripple" style={{width: '40%', flex: 2}}>
                        <input type="button" style={{width: '100%', backgroundColor: '#ff5a61', 'color': '#ffffff', backgroundColor: '#ff5a61', 'lineHeight': '49px'}} onClick={() => this.procedOrder()} value="Proceed " />
                    </li>
                </ul>
            </div>
        );
    }


    render() {
        let products = this.state.cart_data.products;
        if(this.state.loading && !products){
            return (
                <Layout isBack={true} header_title={this.state.header_title} current_route={'cart'}>
                </Layout>
            )
        }
        if(products && products.length == 0){
            return (
                <Layout isBack={true} footer={null} header_title={this.state.header_title}>
                    <div className="noResults">
                        <div className="resultImg">
                            <img src={cart_empty_image} alt='' />
                        </div>
                        <div className="resultContent">
                            <p>
                                You Cart  is empty
                            </p>
                        </div>
                        <div className="controlGroup">
                            <Link to="/" className="btn btnPrimary">Browse Catalogs</Link>
                        </div>
                    </div>
                </Layout>
            )
        }
        let totals_data = this.state.totals_data;
        return(
            <Layout isBack={true} footer={this.footer()} header_title={this.state.header_title} current_route={'cart'}>
                <div className="paymentMethodBlock">Payment Method : PayUbiz</div>
                <div>
                    <ul className="amountList">
                        {
                            totals_data['sub_total'] ? 
                            <li>
                                <span className="text">{totals_data['sub_total']['title']}</span>
                                <span className="value">{totals_data['sub_total']['text']}</span>
                            </li> : ''
                        }
                        
                    </ul>
               </div>
               {
                    totals_data['total'] ?
                    <div className="totalPriceBox">
                        <span className="text">Total Price</span>
                        <span className="value">{totals_data['total']['text']}</span>
                    </div> : ''
               }
               <div className="cartProduct">
                    {this.cartProductList()}
               </div>
            </Layout>
        )
    }
}

export default loginHoc(Cart);