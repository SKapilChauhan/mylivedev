import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { CacheLink} from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";
import {trans} from 'appSrcs/utils/language';

import './index.css';

//头部组件
class HeaderComponent extends Component {
    render() {
        return (
            <div className="mobileHeader">
                <div className="mobileHeaderBox clearfix">
                    <span className="backBox" onClick={() => window.history.go(-1)}><span className="iconfont icon-back"></span></span>
                    <span className="mobileHeaderTitle" style={{'textAlign':'left'}}>
                        <div className="name">Promtion</div>
                    </span>
                    <span className="headerCart"><span className="iconfont icon-cart"></span></span>
                </div>
            </div>
        );
    }
}

//活动分类组件
class PromtionComponent extends Component {

    render() {
        let promtions = this.props.promtions;
        return (
            <ul className="promtionBox">
            {
                promtions ? promtions.map((item, index) => {
                    return (
                        <li className="promtionItem" key={index}>
                            <CacheLink to={'/promotion/' + item['category_id']}>
                                <div className="promtionItemBox">
                                    <LazyLoadImage src={item.image} alt="" />
                                    <div className="name">{item.name}</div>
                                </div>
                            </CacheLink>
                        </li>
                    )
                }) : null
            }
            </ul>
        );
    }
}

//活动页
class Promtion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header: <HeaderComponent />,
            promtions: [],
            loading: false
        };
        this.page = 1;
        this.title = trans('view', 'promtion.title');
        document.title = this.title;
    };

	 //页面加载完成调用
    componentDidMount() {
        this.getListData();
    }


    //加载产品组列表
    getListData(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page = this.page;
        let offset = this.state.promtions.length;
        let url = '/api.php?route=active_catalog&offset=' + offset;
        this.setState({
            isLoadingMore: true
        });
        HttpUtils.getShareUrl(url, {})
        .then((responseData) => {
            if(responseData.code == '0000'){
                if(typeof responseData.data !== 'undefined'){
                    let result_data = responseData.data;
                    let hasMore = true;
                    if(!result_data.virtual_categories || result_data.virtual_categories.length === 0){
                        hasMore = false;
                    }
                    let page_promtions = result_data.virtual_categories;
                    let promtions = this.state.promtions;
                    if(page === 1){
                        promtions = page_promtions;
                    }
                    else if(page_promtions && page_promtions.length > 0){
                        promtions = promtions.concat(page_promtions);
                    }
                    this.setState({
                        promtions: promtions,
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
        this.getListData();
    }

	render() {
        if(this.state.loading){
            return (
                <Layout header={this.state.header}>
                    <LoadingComponent />
                </Layout>
            )
        }
        let promtion = this.state.promtions && this.state.promtions[0] ? this.state.promtions[0] : {};
        return(
            <Layout isBack={true} header_title={this.title} isCart={true}>
                <PromtionComponent promtions={this.state.promtions} />
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

export default Promtion;