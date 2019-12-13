import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import GroupList from "../component/group/list";
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../error/notFound";

import {trans} from 'appSrcs/utils/language';

import './view.css';

//首页
class Home extends Component {

    constructor(props) {
        super(props);
        this.sort = '';
        this.state = {
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            categories: [],
            loading: true,
            sort: this.sort,
            product_group: []
        };
        this.isDApp = window.IsDApp;
        this.page = 1;
        let params = this.props.params;
        this.category_id = params.id;
        
        document.title = trans('view', 'category.title');
        this.scrollEle = React.createRef();
    };

    //页面加载完成调用
    componentDidMount() {
        this.loadHomeData();
    }

    componentDidUpdate(){
        //处理分类参数id变化
        let params = this.props.params;
        //更新分类，重新查询
        if(params.id && params.id !== this.category_id){
            this.category_id = params.id;
            this.page = 1;
            this.setState({
                product_group: [],
                vendor_store: {},
                loading : true,
                hasMore: false,
                isLoadingMore: false
            });
            this.getProductListData();
        }
    }

    //加载首页数据
    loadHomeData(){
        this.getProductListData();
    }

    onSort(sort){
        this.sort = sort;
        this.page = 1;
        this.setState({
            product_group: [],
            loading : true,
            hasMore: false,
            isLoadingMore: false,
            sort: this.sort
        });
        this.getProductListData();
    }

    //加载产品组列表
    getProductListData(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page  = this.page;
        let category_id = this.category_id;
        let sort = this.sort;
        let url = '/api.php?route=category/product&path=' + category_id + '&page=' + page;
        this.setState({
            isLoadingMore: true
        });
        let req = {};
        if(sort){
            req['sort'] = sort;
        }
        HttpUtils.getShareUrl(url, req)
        .then((responseData) => {
            if(responseData.code === '0000'){
                let result_data = responseData.data;
                if(typeof result_data.product_group != 'undefined'){
                    let hasMore = true;
                    if(!result_data.product_group || result_data.product_group.length === 0){
                        hasMore = false;
                    }
                    let product_group = this.state.product_group || [];
                    let page_product_group = result_data.product_group || [];
                    if(page === 1){
                        product_group = page_product_group;
                    }
                    else if(page_product_group && page_product_group.length > 0){
                        product_group = product_group.concat(page_product_group);
                    }
                    //分类名称
                    let category_name = result_data.category_name;
                    let vendor_store = result_data['vendor_store'] || null;
                    this.setState({
                        product_group: product_group,
                        vendor_store: vendor_store,
                        hasMore: hasMore,
                        isLoadingMore: false,
                        loading: false,
                        category_name: category_name
                    });
                    //标题修改
                    if(page == 1 && category_name){
                        document.title = trans('view', 'category.title') + '-' + category_name;
                    }
                    this.page +=1;
                }
            }
        }).catch(ex => {
            console.error('ERROR')
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
        this.getProductListData();
    }

    render() {
        if(!this.state.loading && this.state.product_group && this.state.product_group.length === 0){
            return (
                <Layout isBack={true} isCart={true} isSearch={true} >
                    <NotFoundComponent tip="Looks like we cannot find any Product" />
                </Layout>
            )
        }
        //处理回退之后 保留浏览位置
        const h = document.documentElement.clientHeight-145;
        return(
            <Layout isBack={true} isSearch={true} isCart={true}>
                <div className="listSortBox">
                    <span>Sort By</span>
                    <select onChange={(event) => this.onSort(event.target.value)} value={this.state.sort}>
                        <option value="">Default</option>
                        <option value="best_sellers">Best Seller</option>
                        <option value="best_shares">Best Shares</option>
                        <option value="new_arrival">New Arrival</option>
                        {this.isDApp ? <option value="price_low_to_high">Price Low to High</option> : null}
                        {this.isDApp ? <option value="price_high_to_low">Price High to Low</option> : null}
                    </select>
                </div>
                { this.state.loading ? <LoadingComponent /> : null }
                <div style={{height : h,overflowX:'scroll'}} ref={this.scrollEle}>
                { this.state.product_group ? <GroupList product_group={this.state.product_group} vendor_store={this.state.vendor_store} /> : null }
                {
                    //滚动加载
                    this.state.hasMore
                    ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)} scrollEle={this.scrollEle}/>
                    : ''
                }
                </div>
            </Layout>
        )
    }
}

export default Home;