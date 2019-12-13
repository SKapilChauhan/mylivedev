import React ,{ Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import Toast from "appSrcs/component/toast/index";
import GroupList from "../../component/group/list";
import Aside from "../../component/aside";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {Link, CacheLink, Control } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../../error/notFound";

import '../index.css';


//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader storeMobileHeader">
            <div className="mobileHeaderBox clearfix">
                <div>
                    <span className="backBox" onClick={props.goBack}><span className="iconfont icon-left"></span></span>
                    <div className="mobileHeaderTitle"> My Store</div>
                    <span className="headerCart">
                        <Link to="/cart">
                        <span className="iconfont icon-cart"></span></Link>
                    </span>
                </div>
                <div className="storeTooBarBox">
                    <span className="headerMenu" onClick={props.showAside}>
                        <span className="iconfont icon-menu"></span>
                    </span>
                    <div className="headerSearch">
                        <form onSubmit={(e)=>{
                            e.preventDefault();
                            props.onSubmit(e);
                        }}>
                        <div className="headerSearchBox">
                            <input className="" name="keyword" value={props.keyword} onChange={props.onChange}/>
                            <span className="iconfont icon-search"></span>
                        </div>
                        </form>
                    </div>
                </div>
                <div className="storeNameBox">
                    <span className="name">{props.title}</span>
                    <span className="storeManageBtn" onClick={props.handleManageClick}>{props.isEdit?'OK':'Manage Products'}</span>
                </div>
            </div>
        </div>
    );
}

//分类搜索栏
function ToolBar(props){
    return (
        <div className="mobileHeaderBox storeTooBarBox">
            <span className="headerMenu" onClick={() => this.showAside()}>
                <span className="iconfont icon-menu"></span>
            </span>
            <div className="headerSearch">
                <form onSubmit={(e)=>{
                    e.preventDefault();
                    Control.go('/search/' + e.target.keyword.value);
                }}>
                <div className="headerSearchBox">
                    <input className="" name="keyword" value={props.keyword} onChange={props.onChange}/>
                    <span className="iconfont icon-search"></span>
                </div>
                </form>
            </div>
        </div>
    )
}

//尾部组件重写
function FooterComponent(props){
    if(!props.isEdit){
        return null;
    }
    return (
        <div className="mobileFooter">
            <label className="selectAllBox"><input name="groupCbk" className="mui-checkbox" type="checkbox" onChange={props.handleChange}/>  All</label>
            <div className="shopOptBtnBox">
                <span className="shopOptBtn setPriceBtn" onClick={props.handleClick}>Set Price</span>
                <span className="shopOptBtn delGroupBtn" onClick={props.handleClick}>Delete</span>
            </div>
        </div>
    )
}
//设置价格组件
function StorePriceComponent(props){
    return (
        <React.Fragment>
            <div className="layer" onClick={props.onClickHandle}></div>
            <div className="storePriceSetBox">
                <label className="setPriceTitle">Set Price For My Products</label>
                <div className="radioBox">
                    <div>
                        <input type="radio" value="0" checked={props.settingPriceType == 0} name="settingPriceType" id="Percentage" onChange={props.onChangeHandle}/>
                        <label htmlFor="Percentage">Percentage</label>
                    </div>
                    <div>
                        <input type="radio" value="1" checked={props.settingPriceType == 1} name="settingPriceType" id="Amount" onChange={props.onChangeHandle}/>
                        <label htmlFor="Amount">Amount</label>
                    </div>
                    {/*<label><input type="radio"/>Percentage</label>
                    <label><input type="radio"/>Amount</label>*/}
                </div>
                <div className="iptPirceBOx">
                    <label>
                        <input type="text" name="settingPriceVal" value={props.settingPriceVal} onChange={props.onChangeHandle}/>
                        {
                            props.settingPriceType == 0 ? '%':null
                        }
                    </label>
                </div>
                <p>If you set the price lower than shogee price , then it will be shogee price.Amount & Percent can be lower than zero.</p>
                <div className="storeBtnBox">
                    <span className="cancelBtn" onClick={props.onClickHandle}>Cancel</span>
                    <span className="comfirmBtn" onClick={props.onClickHandle}>Confirm</span>
                </div>
            </div>
        </React.Fragment>
    );
}
export default class Shop extends Component{
    constructor(props) {
        super(props);
        this.state = {
            isSelectedAll : false,
            isEdit : false,//是否是编辑产品组
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            categories: [],
            product_group: null,
            isShowPrcieLayer: false,//是否显示设置价格弹框
            settingPriceType : 0,//0 百分比 1：数字
            settingPriceVal: 0,//提价值
            loading: true,
            title : '',
            keyword: '', 
            isShowAside : false,//是否显示分类侧边栏
        };
        this.page = 1;
        this.scrollEle = React.createRef();
    };

    //页面加载完成调用
    componentDidMount() {
        this.loadHomeData();
    }

    //加载首页数据
    loadHomeData(){
        this.getProductListData();
        this.getCategories();
    }
    resetPage(callback){
        this.page = 1;
        callback && this.setState({
            isSelectedAll : false,
            isEdit : false,//是否是编辑产品组
            hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            product_group: null,
            isShowPrcieLayer: false,//是否显示设置价格弹框
            settingPriceType : 0,//0 百分比 1：数字
            settingPriceVal: 0,//提价值
            loading: true,
        },callback);
    }
    //加载产品组列表
    getProductListData(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page = this.page;
        let url = '/api.php?route=store/getProductGroupList&page=' + page;
        this.setState({
            isLoadingMore: true
        });
        HttpUtils.get(url, {})
        .then((responseData) => {
            if(typeof responseData.data != 'undefined'){
                let hasMore = true;
                if(!responseData.data || responseData.data.product_group.length === 0){
                    hasMore = false;
                }
                let product_group = responseData.data.product_group;
                document.title = responseData.data.vendor_store.store_name;
                if(this.state.product_group && this.state.product_group.length > 0 && page > 1){
                    product_group = this.state.product_group.concat(product_group);
                }
                this.setState({
                    product_group: product_group,
                    hasMore: hasMore,
                    isLoadingMore: false,
                    loading : false,
                    title : document.title,
                });
                this.page +=1;
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    //搜索关键字
    searchByKeword(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page = this.page;
        let url = '/api.php?route=store/search';
        this.setState({
            isLoadingMore: true
        });
        HttpUtils.get(url, {'search': this.state.keyword,page:page})
        .then((responseData) => {
            if(typeof responseData.data != 'undefined'){
                let hasMore = true;
                if(!responseData.data || responseData.data.product_group.length === 0){
                    hasMore = false;
                }
                let product_group = responseData.data.product_group;
                if(responseData.data.vendor_store){
                    document.title = responseData.data.vendor_store.store_name;
                }
                
                if(this.state.product_group && this.state.product_group.length > 0 && page > 1){
                    product_group = this.state.product_group.concat(product_group);
                }
                this.setState({
                    product_group: product_group,
                    hasMore: hasMore,
                    isLoadingMore: false,
                    loading : false,
                    title : document.title,
                });
                this.page +=1;
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    //根据分类查找
    searchByCategory(){
        if(this.state.isLoadingMore){
            return false;
        }
        let page = this.page;
        let url = '/api.php?route=store/categoryProduct';
        this.setState({
            isLoadingMore: true
        });
        HttpUtils.get(url, {'path': this.cid,page:page})
        .then((responseData) => {
            if(responseData.data && responseData.data.product_group){
                let hasMore = true;
                if(!responseData.data || responseData.data.product_group.length === 0){
                    hasMore = false;
                }
                let product_group = responseData.data.product_group;
                if(responseData.data.vendor_store){
                    document.title = responseData.data.vendor_store.store_name;
                }
                
                if(this.state.product_group && this.state.product_group.length > 0 && page > 1){
                    product_group = this.state.product_group.concat(product_group);
                }
                this.setState({
                    product_group: product_group,
                    hasMore: hasMore,
                    isLoadingMore: false,
                    loading : false,
                    title : document.title,
                });
                this.page +=1;
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    //获取店铺分类
    getCategories(){
        let url = '/api.php?route=store/category';
        HttpUtils.get(url, {})
        .then((responseData) => {
            if(responseData.data && responseData.data.ctegories){
                this.setState({
                    categories : responseData.data.ctegories
                });
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
    handleManageClick(event){
        const s = this.state.isEdit;
        this.setState({
            isEdit : !s,
        })
        event.preventDefault();
    }
    handleSelectedAllClick(){
        const sa = this.state.isSelectedAll;
        const cks = document.getElementsByClassName('mui-checkbox');
        for(let i = 0; i < cks.length; i++){
            cks[i].checked = !sa;
        }
        this.setState({
            isSelectedAll : !sa,
        })
    }
    handleRadioChange(event) {
        const target = event.target,
            value = target.value,
            name = target.name;
        this.setState({
          [name]: value
        });
    }
    getSelectedRroupIndex(){
        let n = [];
        const cks = document.getElementsByClassName('mui-checkbox');
        for(let i = 0; i < cks.length; i++){
            if(cks[i].checked){
                n.push(i);
            }
        }
        return n;
    }
    //删除指定产品组
    removeGroupByIndex(arr){
        //倒序
        let indexes = this.getSelectedRroupIndex().reverse();
        for (var i = 0; i < indexes.length; i++) {
            arr.splice(indexes[i], 1);
        }
        return arr;
    }
    //更新产品组 type:0(百分比) 1(数量)、base调整基数
    updateGroupByIndex(arr,type,base){
        base = parseFloat(base);
        let indexes = this.getSelectedRroupIndex();
        indexes.forEach((item,index)=>{
            if(arr[item] != undefined){
                if(type == 1){
                    arr[item].price = (parseFloat(arr[item].price)+base).toFixed(2);
                }else {
                    arr[item].price = (parseFloat(arr[item].price)+parseFloat(arr[item].price)*base/100).toFixed(2);
                }
            }
             
        });
        return arr;
    }
    updateGroups(arr,newArr){
        newArr.forEach((item,index)=>{
            if(item != undefined){
                const gid = item.product_group_id;
                arr.forEach((_item,_index)=>{
                    if(_item != undefined && _item.product_group_id == gid){
                        arr[_index].price = item.price;
                        //throw new Error('over')
                    }
                    
                })
            }
        })
        return arr;
    }
    handleGroupUpdateClick(event){
        const target = event.target;
        const className = target.className;
        const groups = this.state.product_group;
        const indexes = this.getSelectedRroupIndex();
        let newGropus = [];
        
        if(groups.length == 0) return;
        //设置价格
        if(className.indexOf('setPriceBtn')>-1 ){
            if(indexes.length == 0){
                Toast.error({title:'Please select a group at least'});
                return;
            }
            this.setState({
                isShowPrcieLayer : true,
            });
            //newGropus = this.updateGroupByIndex(groups,0,15);
        }else if(className.indexOf('delGroupBtn')>-1) {
            //删除产品组
            if(indexes.length == 0){
                Toast.error({title:'Please select a group at least'});
                return;
            }
            let selectedGroupsIds = [];
            indexes.forEach((item,index)=>{
                this.state.product_group[item] != undefined && selectedGroupsIds.push(this.state.product_group[item].product_group_id);
            })
            this.delProductAsync({product_group_ids:selectedGroupsIds.join(',')});
        }
        event.preventDefault();
    }
    //价格设置提交
    handlePriceClick(event){
        const target = event.target;
        const className = target.className;
        //关闭价格弹框
        if(className.indexOf('cancelBtn')>-1 || className.indexOf('layer')>-1){
            this.setState({
                isShowPrcieLayer : false,
            });
        }else if(className.indexOf('comfirmBtn')>-1) {
            //提交价格设置
            let indexes = this.getSelectedRroupIndex();
            let product_group_ids = [];
            indexes.forEach((item,index)=>{
                this.state.product_group[item] != undefined && product_group_ids.push(this.state.product_group[item].product_group_id);
            })
            this.setPriceAsync({
                product_group_ids : product_group_ids.join(','),
                setting_price_type:this.state.settingPriceType,
                setting_price_val:this.state.settingPriceVal,
            });
        }
        event.preventDefault();
    }
    //调价格
    setPriceAsync(param){
        Toast.showLoading();
        let url = '/api.php?route=store/setPriceForProductGroup';
        HttpUtils.post(url, param)
        .then((responseData) => {
            Toast.hideLoading();
            if(responseData.code === '0000'){
                Toast.success();
                const newGropus = this.updateGroups(this.state.product_group,responseData.data.product_group_price);
                this.setState({
                    isShowPrcieLayer : false,
                    product_group : newGropus,
                });
            }
            
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    //删除产品
    delProductAsync(param){
        Toast.showLoading();
        let url = '/api.php?route=store/deleteProductGroup';
        HttpUtils.post(url, param)
        .then((responseData) => {
            Toast.hideLoading();
            if(responseData.code === '0000'){
                Toast.success();
                let newGropus = this.removeGroupByIndex(this.state.product_group);
                this.setState({
                    product_group : newGropus,
                });
            }
            
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    onSubmit(e){
        this.resetPage(()=>this.searchByKeword());
        
    }
    onChange(event){
        this.setState({keyword: event.target.value})
    }
    showAside(){
        this.setState({isShowAside: true})
    }
    hideAside(){
        this.setState({isShowAside: false})
    }
    getCategory(cid){
        this.cid = cid;
        this.setState({isShowAside: false})
        this.resetPage(()=>this.searchByCategory());
    }
    render() {
        //处理回退之后 保留浏览位置
        const h = document.documentElement.clientHeight-145;
        return(

            <Layout
            pageClass="storeWrap"
            header={<HeaderComponent 
                    goBack={()=>this.goBack()} 
                    title={this.state.title} 
                    isEdit={this.state.isEdit} 
                    handleManageClick={this.handleManageClick.bind(this)}
                    onSubmit={this.onSubmit.bind(this)}
                    onChange={this.onChange.bind(this)}
                    keyword={this.state.keyword}
                    showAside = {this.showAside.bind(this)}
                    />}
            footer={<FooterComponent isEdit={this.state.isEdit} 
                    handleChange={this.handleSelectedAllClick.bind(this)}
                    handleClick = {this.handleGroupUpdateClick.bind(this)}
                    
                    />}
            >
        {/*侧边栏*/}
        {
            this.state.categories.length?<Aside 
            categories={this.state.categories}
            isShow={this.state.isShowAside} 
            searchByCategory={this.getCategory.bind(this)}
            hideAside={this.hideAside.bind(this)}/>
            :null
        }
            {
                this.state.product_group !=null && this.state.product_group.length == 0?
                <NotFoundComponent tip="Looks like we cannot find any Product" />
                :
                <div className={this.state.isEdit?"manageGroup":null} style={{height : h,overflowX:'scroll'}} ref={this.scrollEle}>
                    <GroupList isShowCkb={this.state.isEdit}  product_group={this.state.product_group} />
                </div>
            }
                
                {
                    //滚动加载
                    this.state.hasMore
                    ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)} scrollEle={this.scrollEle}/>
                    : ''
                }
                {
                    this.state.isShowPrcieLayer ? 
                    <StorePriceComponent 
                    onChangeHandle={this.handleRadioChange.bind(this)} 
                    onClickHandle={this.handlePriceClick.bind(this)}
                    settingPriceType={this.state.settingPriceType} 
                    settingPriceVal={this.state.settingPriceVal}
                    />
                    :
                    null
                }
                
            </Layout>
        )
    }
}