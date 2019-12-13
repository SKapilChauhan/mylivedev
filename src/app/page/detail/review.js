import React, {Component} from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import './review.css';
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../error/notFound";
import ReviewListComponent from "./review_list";
import LoadMore from 'appSrcs/component/scroll/loadMore';

export default class Detail extends Component{

	constructor(props) {
		super(props);
        let title = 'Review';
        let params = this.props.params;
        this.product_id = params.id;
        this.page = 1;
        this.state = {
            loading : true,
            header_title: title,
            footer: null,
            product_reviews : null
        };
	}


	componentDidMount(){
		this.getReviewListData();
	}

    componentDidUpdate(){
        let params = this.props.params;
        if(params.id != this.product_id){
            this.product_id = params.id;
            this.page = 1;
            this.setState({
                loading : true
            });
            this.getReviewListData();
        }
    }

     // 加载更多数据
    loadMoreData() {
        if(this.state.isLoadingMore){
            return false;
        }
        if(!this.state.hasMore){
            return false;
        }
        this.getReviewListData();
    }
	
     //加载产品组列表
    getReviewListData(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page  = this.page;
        let product_id = this.product_id;
        let url = '/api.php?route=product/review&product_id=' + product_id + '&page=' + page;
        this.setState({
            isLoadingMore: true
        });
        HttpUtils.get(url, {})
        .then((responseData) => {
            let result_data = responseData.data;
            if(typeof result_data.reviews != 'undefined'){
                let hasMore = true;
                if(!result_data.reviews || result_data.reviews.length === 0){
                    hasMore = false;
                }
                let product_reviews = this.state.product_reviews;
                let page_product_reviews = result_data.reviews;
                if(page == 1){
                    product_reviews = page_product_reviews;
                }
                else if(page_product_reviews && page_product_reviews.length > 0){
                    product_reviews = product_reviews.concat(page_product_reviews);
                }
                this.setState({
                    product_reviews: product_reviews,
                    hasMore: hasMore,
                    isLoadingMore: false,
                    loading: false
                });
                this.page +=1;
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }

	
	render(){
         if(this.state.loading){
            return (
                <Layout isBack={true} header_title={this.state.header_title} footer={null}>
                    <LoadingComponent />
                </Layout>
            )
        }
        if(!this.state.product_reviews || this.state.product_reviews.length === 0){
            return (
                <Layout isBack={true} header_title={this.state.header_title} footer={null}>
                    <NotFoundComponent  />
                </Layout>
            )
        }
		return (
            <Layout isBack={true} header_title={this.state.header_title} isCart={true} footer={this.state.footer}>
                <div className="content">
                    <div className="reviewsListBlock">
                        <ReviewListComponent review_list={this.state.product_reviews} />
                    </div>
                    {
                        //滚动加载
                        this.state.hasMore
                        ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)}/>
                        : ''
                    }
                </div>
            </Layout>
		);
	}
}
