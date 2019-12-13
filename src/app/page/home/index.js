import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import GroupList from "../component/group/list";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { CacheLink, Control } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";
import ReactSwiper from 'reactjs-swiper';
import {trans} from 'appSrcs/utils/language';
import loginHoc from 'appSrcs/component/hoc/loginHoc';


import './index.css';

//banner组件
function BannerComponent(props){
    let items = props.banners;
    if(!items || items.length === 0){
        return <div className="bannerPlaceBlock"></div>
    }
    const swiperOptions = {
        preloadImages: true,
        autoplay: 4000,
        autoplayDisableOnInteraction: false
    };
    return (
       <ReactSwiper swiperOptions={swiperOptions} showPagination items={items} className="homeBanner" />
    )
}


//活动分类组件
function CateComponent(props){
    let categories = props.categories;
    if(!categories || categories.length === 0){
        return null;
    }
    let length = categories.length;
    if(length > 0){
        for(var i in categories){
            categories[i]['link'] = '/promotion/' + categories[i]['category_id'];
        }
        categories[length-1]['layer'] = true;
        categories[length-1]['name'] = 'More'; 
        categories[length-1]['link'] = '/promotions'; 
    }
    return (
        <ul className='homeProbox'>
            {
                categories.map((item, index) => {
                    return (
                        <li className='homeProitem' key={index}>
                            <CacheLink to={item['link']}>
                                <div className='proitembox'>
                                    <img src={item.image || ''} alt="" />
                                    <div className='pname'>{item.name || ''}</div>
                                </div>
                                {
                                    item.layer ? <div className='proitemlayer'></div> : ''
                                }
                            </CacheLink>
                        </li>
                    )
                })
            }
        </ul>
    )
}

//首页
class Home extends Component {

    constructor(props) {
        super(props);
        let banners = this.getBannersCache();
        this.state = {
            banners: banners,
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            categories: [],
            product_group: [],
            vendor_store: null,
            loading: true,
            showConfigModalLayer: false,
            configModal: {}
        };
        this.page = 1;
        this.isDApp = window.IsDApp;
        document.title = trans('view', 'home.title');
        this.scrollEle = React.createRef();
    };

	//页面加载完成调用
    componentDidMount() {
        this.loadHomeData();
        //弹框
        if(window.IsDApp){
            if(this.props.login()){
                this.showConfigModal();
            }
        }
    }

    //刷新首页数据
    updateHomePage(){
        this.page = 1;
        this.setState({
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            product_group: [],
            vendor_store: null,
            loading: true
        })
        this.loadHomeData();
    }

    
    //获取分类本地缓存
    getBannersCache(){
        let banners = [];
        try{
            if(window.localStorage){
                var banners_cache = JSON.parse(window.localStorage.getItem('home_banners_cache')) || [];
                if(banners_cache && banners_cache['data']){
                    var c_time = new Date().getTime();
                    var date = c_time - banners_cache['time'];
                    var minute = date/(1000 * 10);
                    //10分钟从缓存读取
                    if(minute <= 10){
                        banners = banners_cache['data'];
                    } else {
                        window.localStorage.removeItem('home_banners_cache');
                    }
                }
            }
        }
        catch(e){}
        return banners;
    }

    //弹框
    showConfigModal(){
        let hasShowLayer = window.localStorage.getItem('showConfigUrlLayer', '0');
        if(!hasShowLayer || hasShowLayer != '1'){
            HttpUtils.get('/api.php?route=config_url',{})
            .then((responseData)=>{
                let data = responseData.data;
                let configModal = data.banners ? data.banners : {};
                if(configModal.image){
                    this.setState({
                        configModal: configModal,
                        showConfigModalLayer: true
                    });
                    if(window.localStorage){
                        window.localStorage.setItem('showConfigUrlLayer', '1');
                    }
                }
                
            }).catch(error=>{
            });
        }
    }

    //隐藏弹框
    hideConfigModal(){
        this.setState({
            showConfigModalLayer: false
        });
    }

    //跳转
    configModalLink(url){
        if(window.plus){
            window.plus.runtime.openURL(url);
        } else {
            window.open(url,'_blank');
        }
    }

    //设置分类本地缓存
    setBannersCache(banners){
        try{
            if(window.localStorage){
                var s_data = {"data": banners, "time": new Date().getTime()};
                window.localStorage.setItem('home_banners_cache', JSON.stringify(s_data));
            }
        } catch(e){}
    }

    //加载首页数据
    loadHomeData(){
        if(this.isDApp){
             HttpUtils.getShareUrl('/api.php?route=home',{})
            .then((responseData)=>{
                let data = responseData.data;
                let banners = data.banners ? data.banners : [];
                this.setState({
                    loading : false,
                    banners: banners,
                    categories: data.virtual_categories ? data.virtual_categories : []
                });
                this.setBannersCache(banners);
            }).catch(error=>{
            });
        }
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
        HttpUtils.getShareUrl(url, {})
        .then((responseData) => {
            if(responseData.code == '0000'){
                if(typeof responseData.data != 'undefined'){
                    let result_data = responseData.data;
                    let page_product_group = result_data['product_group'] || [];
                    let hasMore = true;
                    if(!page_product_group || page_product_group.length === 0){
                        hasMore = false;
                    }
                    let product_group = this.state.product_group;
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
                        loading : false,
                    });
                    this.page +=1;
                }
            } else if(responseData.code == '4001'){
                //店铺不存在
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
        //处理回退之后 保留浏览位置
        const h = document.documentElement.clientHeight-95;
        return(
            <Layout current_route="home" isMenu={true} isCart={true} isSearch={true} updatePageData={this.updateHomePage.bind(this)}>
                <div style={{height : h,overflowX:'scroll'}} ref={this.scrollEle}>
                    {
                        this.isDApp ? <BannerComponent banners={this.state.banners} /> : null
                    }
                    {
                        this.isDApp ? <CateComponent categories={this.state.categories} /> : null
                    }
                    {
                        this.state.loading ? <LoadingComponent /> : ''
                    }
                    <GroupList product_group={this.state.product_group} vendor_store={this.state.vendor_store} />
                    {
                        //滚动加载
                        this.state.hasMore
                        ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)} scrollEle={this.scrollEle}/>
                        : ''
                    }
                   <div className={'mbBox ' + (this.state.showConfigModalLayer ? 'show' : '')}>
                        <div className="mbLayer" onClick={() => this.hideConfigModal()}></div>
                        <div className="mLayerWrap">
                            <a className="closeBtn" onClick={() => this.hideConfigModal()} href="javascript:void(0)">X</a>
                            <a className="config_link" href="javascript:void(0)" onClick={() => this.configModalLink(this.state.configModal.link ? this.state.configModal.link : '')}>
                                <img src={this.state.configModal.image ? this.state.configModal.image : ''}/>
                            </a>
                        </div>
                    </div>
                </div>
            </Layout>
        )
	}
}

export default loginHoc(Home);