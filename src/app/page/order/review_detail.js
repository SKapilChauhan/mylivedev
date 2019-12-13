import React, { Component } from 'react';
import Layout from "../layout/layout";
import HttpUtils from 'appSrcs/utils/http';
import LoadingComponent from "appSrcs/component/loading";
import { Link  } from 'react-keeper';
import SimpleReactValidator from 'simple-react-validator';
import './review.css';

//首页
class OrderReviewDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header_title: 'Order Review',
            loading: true,
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
        HttpUtils.get('/api.php?route=order/orderReviewDetail&order_id=' + order_id, {})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let order_review_list = responseData.data;
                this.setState({
                    loading: false,
                    order_review_list: order_review_list
                });
            } else {
                this.setState({
                    loading: false,
                    order_review_list: null
                });
            }
        }).catch(error=>{
            
        });
    }

    render() {
        if(this.state.loading){
            return (
                <Layout header_title={this.state.header_title} isBack={true} current_route="order" footer={null}>
                    <LoadingComponent />
                </Layout>
            )
        }
        let order_review_list = this.state.order_review_list;
        let stars = [1,2,3,4,5];
        return(
            <Layout header_title={this.state.header_title} isBack={true} current_route="order" footer={null}>
                <div className="orderReviewBox">
                    <ul>
                        {
                            order_review_list ? order_review_list.map((productItem, pindex) => {
                                return (
                                    <li className="orderReviewItem" key={pindex}>
                                        <div className="orderReviewItemBox">
                                            <div className="imginfo">
                                                <Link to={"/product/" + productItem.product_id}><img src={productItem.product_image} alt='' /></Link>
                                            </div>
                                            <div className="infobox">
                                                <div className="productname">
                                                    <Link to={"/product/" + productItem.product_id}>{productItem['name']}</Link>
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
                                        <div className="ratinginfo">
                                            <span>Rating</span>
                                            <div className="ratingBox">
                                                <ul className="ratingStars clearfix">
                                                    {
                                                        stars.map((rating, sindex) => {
                                                            return (
                                                                <li key={sindex} className={'iconfont icon-star ' + (rating <= productItem['rating'] ? 'selected' : '')}></li>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                            <span></span>
                                        </div>
                                        <div className="formGroup">
                                            <span className="formGroupLabel">Content</span>
                                            <textarea rows="4" readOnly="readOnly" className="formControl" placeholder="Content" maxLength="300" value={productItem['text'] || ''} />
                                        </div>
                                        <div className="uploadReviewImageList">
                                            {
                                                productItem['img'] ? productItem['img'].map((img, ikey) => {
                                                    return (
                                                        <div key={ikey} className="uploadReviewImageItem">
                                                            <div className="uploadReviewImageItemBox">
                                                                <img src={img} alt='' />
                                                            </div>
                                                        </div>
                                                    )
                                                }) : null
                                            }
                                        </div>
                                    </li>
                                )
                            }) : null
                        }
                    </ul>
                </div>
            </Layout>
        )
    }
}

export default OrderReviewDetail;