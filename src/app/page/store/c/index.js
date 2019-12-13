import React ,{ Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import GroupList from "../../component/group/list";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Control } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";

import '../index.css';


//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader">
            <div className="mobileHeaderBox clearfix">
                <span className="backBox" onClick={props.goBack}><span className="iconfont icon-left"></span></span>
                <div className="mobileHeaderTitle" style={{'textAlign':'center'}}>
                    <div className="name">{props.title}</div>
                </div>
            </div>
        </div>
    );
}

export default class Shop extends Component{
    constructor(props) {
        super(props);
        this.state = {
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            categories: [],
            product_group: [],
            loading: true
        };
        this.page = 1;
        this.title = document.title = 'xxxx Store';
    };

    //页面加载完成调用
    componentDidMount() {
        this.loadHomeData();
    }

    //加载首页数据
    loadHomeData(){
        this.getProductListData();
    }

    //加载产品组列表
    getProductListData(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page = this.page;
        let url = '/api.php?route=product_group&page=' + page;
        this.setState({
            isLoadingMore: true
        });
        HttpUtils.get(url, {})
        .then((responseData) => {
            if(typeof responseData.data != 'undefined'){
                let hasMore = true;
                if(!responseData.data || responseData.data.length === 0){
                    hasMore = false;
                }
                let product_group = responseData.data;
                if(this.state.product_group && this.state.product_group.length > 0 && page > 1){
                    product_group = this.state.product_group.concat(product_group);
                }
                this.setState({
                    product_group: product_group,
                    hasMore: hasMore,
                    isLoadingMore: false,
                    loading : false,
                });
                this.page +=1;
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
    goBack(){
        window.history.back();
    }
    render() {
        return(
            <Layout header={<HeaderComponent goBack={()=>this.goBack()} title={this.title}/>}>
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