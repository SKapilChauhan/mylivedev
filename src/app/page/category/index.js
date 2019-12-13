// component/hearder
import React, { Component } from 'react';
import Layout from "../layout/layout";
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../error/notFound";
import HttpUtils from 'appSrcs/utils/http';
import './index.css';
import {CacheLink} from 'react-keeper';
import cateimage from "appSrcs/static/images/cate.png";
import {trans} from 'appSrcs/utils/language';
import ReactSwiper from 'reactjs-swiper';

//banner组件
function BannerComponent(props){
    let items = props.banners;
    if(!items || items.length == 0){
        return null;
    }
    const swiperOptions = {
        preloadImages: true,
        autoplay: 4000,
        autoplayDisableOnInteraction: false
    };
    return (
       <ReactSwiper swiperOptions={swiperOptions} showPagination items={items}  />
    )
}

function CategoryAside(props) {
    let categorys = props.categorys ? props.categorys : [];
    return  (
        <div className='categoryAside'>
            <div>
                <ul>
                    {
                        categorys ? categorys.map((item, index) => {
                            let current = props.current_category && item['category_id'] == props.current_category.category_id ? 'current' : '';
                            return (
                                <li className={`${current ? 'current': ''} ${'categorySideItem'}`} onClick={(item_id) => props.showChildren(item['category_id'])} key={index}>
                                    <span dangerouslySetInnerHTML={{__html: item['name'] }}></span>
                                </li>
                            )
                        }) : null
                    }
                </ul>
            </div>
        </div>
    )
}

function CategoryChildren(props) {
    let categorys = props.category_children ? props.category_children : [];
    let current_category = props.current_category;
    return  (
        <div className='categoryAsideChildren'>
            <ul>
                {
                    categorys ? categorys.map((item, index) => {
                        return (
                            <li className='categoryChildrenItem' key={index}>
                                <CacheLink to={'/category/' + item['category_id']}>
                                    <div className='img'>
                                        <img src={item['image']} alt='' />
                                    </div>
                                    <div className='name' title={item['name'] } dangerouslySetInnerHTML={{__html: item['name'] }}></div>
                                </CacheLink>
                            </li>
                        )
                    }) : null
                }
                {
                    current_category ? 
                    <li className='categoryChildrenItem'>
                        <CacheLink to={'/category/' + current_category['category_id']}>
                            <div className='img'>
                                <img src={cateimage} alt='' />
                            </div>
                            <div className='name' title={current_category['name']} dangerouslySetInnerHTML={{__html: 'All ' + current_category['name'] }}></div>
                        </CacheLink>
                    </li> : null
                }
            </ul>
        </div>
    )
}

class Category extends Component {

    constructor(props) {
        super(props);
        let categorys_obj = {};
        let category_children = [];
        let current_category = null;
        let categorys = this.getCategorysCache();
        if(categorys && categorys.length > 0){
            for(var i in categorys){
                let id = categorys[i]['category_id'];
                categorys_obj[id] = categorys[i];
            }
            current_category = categorys[0];
            category_children = current_category && typeof current_category['children'] != 'undefined' ? current_category['children'] : [];
        }
        this.state = {
            loading: true,
            categorys: categorys,
            current_category: current_category,
            categorys_obj: categorys_obj,
            category_children: category_children
        };
        document.title =  trans('view', 'category.title');
    };

	//页面加载完成调用
    componentDidMount() {
        HttpUtils.getShareUrl('/api.php?route=category',{})
        .then((responseData) => {
            if(responseData.code === '0000'){
                if(typeof responseData.data != 'undefined'){
                    let categorys = typeof responseData.data['ctegories'] != 'undefined' ? responseData.data['ctegories'] : [];
                    if(!categorys || categorys.length == 0){
                        categorys = [];
                        this.setState({
                            categorys: categorys,
                            loading: false
                        });
                        return false;
                    }
                    let categorys_obj = {};
                    for(var i in categorys){
                        let id = categorys[i]['category_id'];
                        categorys_obj[id] = categorys[i];
                    }
                    let first_category = categorys[0];
                    let category_children = typeof first_category['children'] != 'undefined' ? first_category['children'] : [];
                    this.setState({
                        loading: false,
                        categorys: categorys,
                        categorys_obj: categorys_obj,
                        current_category: first_category,
                        category_children: category_children
                    });
                    this.setCategorysCache(categorys);
                }
            }
            
        }).catch(ex => {
            console.error('loaderror, ', ex.message)
        });
    }

    //获取分类本地缓存
    getCategorysCache(){
        let categorys = [];
        try{
            if(window.localStorage){
                var categorys_cache = JSON.parse(window.localStorage.getItem('p_categorys_cache')) || [];
                if(categorys_cache && categorys_cache['data']){
                    var c_time = new Date().getTime();
                    var date = c_time - categorys_cache['time'];
                    var minute = date/(1000 * 60);
                    //60分钟从缓存读取
                    if(minute <= 60){
                        categorys = categorys_cache['data'];
                    } else {
                        window.localStorage.removeItem('p_categorys_cache');
                    }
                }
            }
        }
        catch(e){
            categorys = [];
        }
        return categorys;
    }

    //设置分类本地缓存
    setCategorysCache(categorys){
        try{
            if(window.localStorage){
                var s_data = {"data": categorys, "time": new Date().getTime()};
                window.localStorage.setItem('p_categorys_cache', JSON.stringify(s_data));
            }
        } catch(e){}
    }

    //显示分类子分类
    showChildren(categord_id){
        if(this.state && this.state.categorys_obj && this.state.categorys_obj[categord_id]){
            let category = this.state.categorys_obj[categord_id];
            var category_children = category['children'] ? category['children'] : [];
            this.setState({
                current_category: category,
                category_children: category_children
            });
        }
    }

	render() {
        return (
            <Layout current_route="category" isSearch={true} isCart={true}>
                <div className='categoryBlock'>
                    <CategoryAside categorys={this.state.categorys} current_category={this.state.current_category} showChildren={(item_id) => this.showChildren(item_id) } />
                    <div className='categoryList'>
                        {
                            this.state.current_category && this.state.current_category['banner'] 
                            ? <div className='categoryBanner'>
                                <BannerComponent banners={this.state.current_category['banner']} />
                            </div> : null
                        }
                        <div className='categoryChildren'>
                            <ul className="clearfix">
                                <CategoryChildren category_children={this.state.category_children} current_category={this.state.current_category} />
                            </ul>
                        </div>
                    </div>
                </div>
            </Layout>
        )
	}
}

export default Category;