import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import GroupList from "../component/group/list";
import { Control } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../error/notFound";
import {trans} from 'appSrcs/utils/language';
import Appsflyer from "appSrcs/utils/appsflyer";

//搜索
class Home extends Component {

    constructor(props) {
        super(props);
        this.page = 1;
        let params = this.props.params;
        this.keyword = params.keyword;
        this.sort = '';
        this.isDApp = window.IsDApp;
        this.state = {
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            categories: [],
            loading: true,
            keyword: this.keyword,
            product_group: [],
            vendor_store: null,
            sort: this.sort
        };
    };

    //页面加载完成调用
    componentDidMount() {
        this.onSearch(this.keyword);
    }

    componentDidUpdate(){
        //处理参数id变化
        let params = this.props.params;
        //重新查询
        if(params.keyword && params.keyword !== this.keyword){
            this.keyword = params.keyword;
            this.onSearch(this.keyword);
        }
    }

    onSearch(keyword){
        this.setState({
            loading: true,
            hasMore: false,
            keyword: keyword,
            product_group: []
        });
        this.page = 1;
        this.keyword = keyword;
        this.setTitle();
        this.getProductListData();
        Appsflyer.search(keyword);
    }

    setTitle(){
        document.title =  trans('view', 'search.title') + '-' + this.keyword;
    }

    onBack(){
        Control.go('/');
    }

    //加载产品组列表
    getProductListData(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page  = this.page;
        let sort = this.sort;
        let url = '/api.php?route=search&page=' + page;
        this.setState({
            isLoadingMore: true
        });
        let req = {'search': this.keyword};
        if(this.sort){
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
                    let vendor_store = result_data['vendor_store'] || null;
                    this.setState({
                        product_group: product_group,
                        vendor_store: vendor_store,
                        hasMore: hasMore,
                        isLoadingMore: false,
                        loading: false
                    });
                    this.page +=1;
                }
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }

    //排序
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
                <Layout isBack={true} isCart={true} isSearch={true} keyword={this.keyword}>
                    <NotFoundComponent tip="Looks like we cannot find any Product" />
                </Layout>
            )
        }
        return(
            <Layout isBack={true} onBack={() => this.onBack()} isSearch={true} isCart={true} keyword={this.keyword}>
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
                {
                    this.state.product_group ? <GroupList product_group={this.state.product_group} vendor_store={this.state.vendor_store} /> : null
                }
                {
                    //滚动加载
                    this.state.hasMore
                    ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)}/>
                    : ''
                }
            </Layout>
        )
    }
}

export default Home;