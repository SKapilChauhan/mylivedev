import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import LoadingComponent from "appSrcs/component/loading";
import { Control, Link  } from 'react-keeper';
import Toast from "appSrcs/component/toast/index";
import SimpleReactValidator from 'simple-react-validator';
import './review.css';

//首页
class OrderReview extends Component {

    constructor(props) {
        super(props);
        let footer = this.footerComponent();
        this.state = {
            header_title: 'Order Review',
            loading: true,
            footer: footer
        };
        let params = this.props.params;
        this.order_id = params.id;
        document.title = 'Order Review';
        this.validator = new SimpleReactValidator({
            element: (message, className) => <div className='errormsg'>{message}</div>
        });
    };

    //页面加载完成调用
    componentDidMount() {
        let order_id = this.order_id;
        HttpUtils.get('/api.php?route=order/orderDetail&order_id=' + order_id, {})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let order_detail = responseData.data;
                if(!order_detail){
                    this.setState({
                        loading: false,
                        order_detail: null
                    });
                    return false;
                }
                if(order_detail['is_review'] == '1'){
                    window.history.go(-1);
                    return false;
                }
                for(var i in order_detail['products_data']){
                    order_detail['products_data'][i]['rating'] = 5;
                    order_detail['products_data'][i]['content'] = '';
                    order_detail['products_data'][i]['images'] = [];
                    order_detail['products_data'][i]['add_file'] = true;
                }
                this.setState({
                    loading: false,
                    order_detail: order_detail
                });
            }
        }).catch(error=>{
            
        });
    }

     //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
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

    onRating(rating, index){
        let order_detail = this.state.order_detail;
        let products_data = order_detail['products_data'];
        if(products_data[index]){
            products_data[index]['rating'] = rating;
        }
        order_detail['products_data'] = products_data;
        this.setState({
            order_detail: order_detail
        });
    }

    setProductState(index, skey, svalue){
        let order_detail = this.state.order_detail;
        let products_data = order_detail['products_data'];
        if(products_data[index]){
            products_data[index][skey] = svalue;
        }
        order_detail['products_data'] = products_data;
        this.setState({
            order_detail: order_detail
        });
    }

    addImgaeCallback(index, file, image){
        let order_detail = this.state.order_detail;
        let products_data = order_detail['products_data'];
        if(products_data[index]){
            let item = products_data[index];
            let order_product_id = item['order_product_id'];
            let files = document.getElementById('upload_file_' + order_product_id);
            let name = "order_product_id_" + item['order_product_id'] + "[]";
            let new_file = file;
            file.setAttribute('name', name);
            files.append(file);
            products_data[index]['images'].push(image);
            products_data[index]['new_file'] = false;
        }
        order_detail['products_data'] = products_data;
        this.setState({
            order_detail: order_detail
        }, function(){
            products_data[index]['new_file'] = true;
            order_detail['products_data'] = products_data;
            this.setState({
                order_detail: order_detail
            });
        });
    }

    onFileChange(pindex, event){
        let order_detail = this.state.order_detail;
        let products_data = order_detail['products_data'];
        if(products_data[pindex]){
            let images = products_data[pindex]['images'];
            if(images.length >=3){
                Toast.danger('You only can upload 3 images!');
                return false;
            }
        }
        let self = this;
        let target = event.target;
        try{
            var files = target.files;
            if(files && files.length > 0){
                let file = files[0];
                //Verify that the file type
                if(!file.type || file.type.indexOf('image') == -1){
                    Toast.danger('Please select the image file!');
                    return false;
                }
                if(file.size){
                    var sm = file.size / (1024 * 1024);
                    if(sm > 5){
                        Toast.danger('We currently support a maximum image size of 5M!');
                        return false;
                    }
                }
                if (typeof FileReader != 'undefined') {
                    var reader = new FileReader();
                    reader.onload = function(evt) {
                        self.addImgaeCallback(pindex, target, evt.target.result);
                    }
                    reader.readAsDataURL(file);
                }
            }
        }
        catch(e){}
    }

    onImageDelete(pindex, ikey, event){
        let order_detail = this.state.order_detail;
        let products_data = order_detail['products_data'];
        if(products_data[pindex]){
            let order_product_id = products_data[pindex]['order_product_id'];
            let images = products_data[pindex]['images'];
            if(images.length >=0){
                images.splice(ikey, 1);
            }
            products_data[pindex]['images'] = images;
            this.setState({
                order_detail: order_detail
            }, function(){
           
            });
            let files = document.getElementById('upload_file_' + order_product_id);
            let input_files = files.getElementsByTagName('input');
            let input_file = input_files[ikey];
            files.removeChild(input_file);
        }
    }

    onSubmitForm(){
        if (!this.validator.allValid()) {
            this.validator.showMessages();
            this.forceUpdate();
            return false;
        }
        let review_form = document.getElementById('orderReviewForm');
        var form_data = new FormData(review_form);
        Toast.showLoading();
        HttpUtils.post('/api.php?route=order/orderReview', form_data, true)
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code === '0000'){
                Control.go('/user/order/review_detail/' + this.order_id);
            } else if(responseData.message != ''){
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            Toast.hideLoading();
            Toast.danger('OH, an error has occurred, or check your network and try it again');
        });
    }

    //底部组件
    footerComponent(props) {
        return (
            <div className="mobileFooter">
                <ul className="footNavInfo clearfix">
                    <li className="ripple" style={{width: '40%', backgroundColor: '#ffffff', 'color': '#000000'}}>
                        <Link style={{'color': '#000000', 'fontSize': '14px'}} to="/user/order/index">Cancel</Link>
                    </li>
                    <li className="ripple" style={{width: '60%', backgroundColor: '#32dc50', 'color': '#ffffff'}}>
                        <a style={{'color': '#ffffff', 'fontSize': '14px'}} href="javascript:void(0)" onClick={() => this.onSubmitForm()}>Submit</a>
                    </li>
                </ul>
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
        if(order_detail == null){
            return (
                <Layout header_title={this.state.header_title} isBack={true} current_route="order" footer={null}>
                        
                </Layout>
            )
        }
        let order_product_list = order_detail['products_data'];
        let stars = [1,2,3,4,5];
        return(
            <Layout header_title={this.state.header_title} isBack={true} current_route="order" footer={this.state.footer}>
                <div className="orderReviewBox">
                    <form name="order-review-form" id="orderReviewForm" encType ="multipart/form-data" className="order-review"  onSubmit={(e)=>{
                        e.preventDefault();
                        return false;
                    }}>
                        <ul>
                            {
                                order_product_list ? order_product_list.map((productItem, pindex) => {
                                    return (
                                        <li className="orderReviewItem" key={pindex}>
                                            <div className="orderReviewItemBox">
                                                <div className="imginfo">
                                                    <img src={productItem.image} alt='' />
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
                                            </div>
                                            <div className="rateinfo">
                                                <span>Rating</span>
                                                <div className="ratingBox">
                                                    <ul className="ratingStars clearfix">
                                                        {
                                                            stars.map((item, index) => {
                                                                return (
                                                                    <li onClick={() => this.onRating(item, pindex)} key={index} className={'iconfont icon-star ' + (item <= productItem['rating'] ? 'selected' : '')}></li>
                                                                )
                                                            })
                                                        }
                                                    </ul>
                                                </div>
                                                <span></span>
                                            </div>
                                            <div className="formGroup">
                                                <textarea rows="4"  onChange={(event) => this.setProductState(pindex, 'content', event.target.value)} className="formControl" name={"review_data[" + pindex +"][text]"} placeholder="Write Your Review here" maxLength="300" value={productItem['content'] || ''} />
                                                {this.validator.message('Content', productItem['content'], 'required')}
                                            </div>
                                            <div className="uploadReviewImageList">
                                                {
                                                    productItem['images'] ? productItem['images'].map((img, ikey) => {
                                                        return (
                                                            <div key={ikey} className="uploadReviewImageItem">
                                                                <div className="uploadReviewImageItemBox">
                                                                    <img src={img} alt='' />
                                                                    <a className="remove" href="javascript:void(0)" onClick={(event) => this.onImageDelete(pindex, ikey, event)}>×</a>
                                                                </div>
                                                            </div>
                                                        )
                                                    }) : null
                                                }
                                            </div>
                                            <div className="upload-image-box">
                                                <a className="addReviewBox">
                                                    <span className="iconfont icon-photo"></span>
                                                    <div id={"addFile_" + productItem['order_product_id']}>
                                                        <input accept="image/*" onChange={(event) => this.onFileChange(pindex, event)}  type="file" className="uploadImageFile" />
                                                    </div>
                                                    {
                                                        productItem['new_file'] && <div id={"addFile_" + productItem['order_product_id']}>
                                                            <input accept="image/jpeg,image/jpg,image/png" onChange={(event) => this.onFileChange(pindex, event)}  type="file" className="uploadImageFile" />
                                                        </div>
                                                    }
                                                </a>
                                                <div className="uploadReviewImageList" style={{'visibility': 'hidden'}} id={"upload_file_" + productItem['order_product_id']}>
                                                
                                                </div>
                                            </div>
                                            <input name="order_product_id" type="hidden" name={"review_data[" + pindex +"][order_product_id]"} value={productItem['order_product_id']} />
                                            <input name="order_product_id" type="hidden" name={"review_data[" + pindex +"][rating]"} value={productItem['rating']} />
                                        </li>
                                    )
                                }) : null
                            }
                        </ul>
                        <input name="order_id" type="hidden" value={order_detail['order_id']} />
                    </form>
                </div>
            </Layout>
        )
    }
}

export default OrderReview;