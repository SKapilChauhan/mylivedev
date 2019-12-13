import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import GroupList from "../component/group/list";
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../error/notFound";
import Language from 'appSrcs/utils/language';
import { Link } from 'react-keeper';

const LANG = Language.getLangContent('view');

//头部组件
class HeaderComponent extends Component {
    render() {
        return (
            <div className="mobileHeader">
                <div className="mobileHeaderBox clearfix">
                    <span className="backBox" onClick={() => window.history.go(-1)}><span className="iconfont icon-back"></span></span>
                    <div className="headerSearch">
                        <div className="headerSearchBox">
                            <input className="" />
                            <span className="iconfont icon-search"></span>
                        </div>
                    </div>
                    <span className="headerCart"><Link to='/cart'><span className="iconfont icon-cart"></span></Link></span>
                </div>
            </div>
        );
    }
}

//首页
class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header: <HeaderComponent />,
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            loading: true,
            product_group: []
        };
        this.page = 1;
        let params = this.props.params;
        this.category_id = params.id;
        document.title = LANG['home']['title'] || 'Home';
    };

    //页面加载完成调用
    componentDidMount() {
        this.getProductListData();
    }

    componentDidUpdate(){
        let params = this.props.params;
        if(params.id && params.id != this.category_id){
            this.category_id = params.id;
            this.page = 1;
            this.getProductListData();
            this.setState({
                loading : true,
                isLoadingMore: false,
                product_group: []
            });
        }
    }


   //加载产品组列表
    getProductListData(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page  = this.page;
        let category_id = this.category_id;
        let url = '/api.php?route=category/product&path=' + category_id + '&page=' + page;
        this.setState({
            isLoadingMore: true
        });
        HttpUtils.getShareUrl(url, {})
        .then((responseData) => {
            if(responseData.code == '0000'){
                let result_data = responseData.data;
                if(typeof result_data.product_group !== 'undefined'){
                    let hasMore = true;
                    if(!result_data.product_group || result_data.product_group.length === 0){
                        hasMore = false;
                    }
                    let product_group = this.state.product_group || [];
                    let page_product_group = result_data.product_group || [];
                    if(page_product_group && page_product_group.length > 0){
                        product_group = product_group.concat(page_product_group);
                    }
                    this.setState({
                        product_group: product_group,
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
        if(this.state.loading ){
            return (
                <Layout header={this.state.header}>
                    <LoadingComponent />
                </Layout>
            )
        }
        if(this.state.product_group && this.state.product_group.length === 0){
            return (
                <Layout header={this.state.header}>
                    <NotFoundComponent tip="Looks like we cannot find any Product" />
                </Layout>
            )
        }
        return(
            <Layout header={this.state.header}>
                <GroupList product_group={this.state.product_group} />
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