import React, {Component} from 'react';

import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import './index.css';
import { Link, Control } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";
import NotFoundComponent from "../../error/notFound";
import copy from 'copy-to-clipboard';
import Toast from "appSrcs/component/toast/index";
import ProductListComponent from "../../component/group/productlist";
import Share from 'appSrcs/utils/share';
import loginHoc from 'appSrcs/component/hoc/loginHoc';
import Appsflyer from "appSrcs/utils/appsflyer";

class Detail extends Component{

	constructor(props) {
		super(props);
        this.isDApp = window.IsDApp;
        let footer = this.footerComponent();
        let vendor_store_id = (Control.state && Control.state.vendor_store_id) || 0;
        this.vendor_store_id = vendor_store_id;
		this.state = {
			loading : true,
            header_title: '',
            footer: footer,
            isDApp: this.isDApp,
            vendor_store: null
		};
        let params = this.props.params;
        this.id = params.id;
	}

	componentDidMount(){
		this.loadData(this.id);
	}

    //参数产品组id变化，重新拉取数据
    componentDidUpdate(){
        let params = this.props.params;
        if(params.id != this.id){
            this.id = params.id;
            this.setState({
                loading : true
            });
            this.loadData(this.id);
        }
    }

    //卸载事件
    componentWillUnmount (){
        Toast.hideLoading();
    }

    //复制
    onCopy = () => {
        let text = '';
        let group_datail = this.state.group_datail;
        if(group_datail){
            let group_description = group_datail.description ? group_datail.description : '';
            group_description = group_description.replace(/<[^>]*>|/g,"");
            text = group_datail.title + group_description;
        }
        copy(text);
        Toast.success({
            text: 'Successful Copy',
            duration: 3000
        })
    };

    //添加组到店铺
    addToStore(){
        let self = this;
        let group_datail = this.state.group_datail;
        let product_group_id = this.id;
        Toast.showLoading();
        HttpUtils.post('/api.php?route=store/addProductGroup',{'product_group_id': product_group_id, 'product_id': '', 'raise_price': null})
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code == '0000'){
                group_datail['in_vendor_store'] = true;
                self.setState({
                    group_datail: group_datail
                });
                Toast.success(responseData.message)
            } else if(responseData.message != ''){
                Toast.danger(responseData.message)
            }
        }).catch(error=>{
            Toast.hideLoading();
        });
    }
	
    //加载产品组数据
	loadData(id){
        if(!id){
            return;
        }
        let req_data = {
            'product_group_id': this.id
        };
        if(this.vendor_store_id){
            req_data['vendor_store_id'] = this.vendor_store_id;
        }
        HttpUtils.getShareUrl('/api.php?route=product_group/view', req_data)
        .then((responseData)=>{
            if(responseData.code == '0000'){
                let group_datail = responseData.data;
                if(!group_datail instanceof Object || Object.keys(group_datail).length === 0){
                    group_datail = null;
                }
                let title = group_datail ? group_datail.title : '';
                let vendor_store = group_datail['vendor_store'] || null;
                this.setState({
                    header_title: title,
                    loading : false,
                    group_datail: group_datail,
                    vendor_store: vendor_store
                });
                this.listViewTrack(group_datail);
            } else if(responseData.code == '4001'){
                //店铺不存在
            }
        }).catch(error=>{
            
        });
	}

    //列表视图跟踪
    listViewTrack(group_datail){
		let product_ids_arry = [];
        if(group_datail.products){
            for(var i in group_datail.products){
                product_ids_arry.push(group_datail.products[i]['product_id']);
            }
            let product_ids = product_ids_arry.join(',');
            Appsflyer.listView(product_ids, 'group');
        }
    }

    //whatsapp分享
    async shareWhatsApp(){
        let self = this;
        let item = this.state.group_datail;
        if(!this.state.group_datail){
            return false;
        }
        let description = item.title + (item.description_share ? item.description_share : '');
        copy(description);
        let images = [];
        for(let i in item['products']){
            let img = item['products'][i]['image'][0]['image'];
            images.push(img);
        }
        let share_data = {
            product_group_id : item.product_group_id,
            description : description,
            images: images
        }
        if(this.props.login()){
            Share.productShareWhatsapp(share_data, function(ret){
                self.updateShareCount();
            });
        }
    }

    //所有分享
    shareAll(){
        let self = this;
        let item = this.state.group_datail;
        if(!this.state.group_datail){
            return false;
        }
        let description = item.title + (item.description_share ? item.description_share : '');
        copy(description);
        let images = [];
        for(let i in item['products']){
            let img = item['products'][i]['image'][0]['image'];
            images.push(img);
        }
        let share_data = {
            product_group_id : item.product_group_id,
            url : '',
            images : images,
            description : description
        }
        if(this.props.login()){
            Share.showMenu(window.plus,share_data,(ret)=>{
                self.updateShareCount();
            });
        }
    }

    //分享数+1
    updateShareCount(){
        let group_datail = this.state.group_datail;
        let products = group_datail['products'];
        //更新数量
        for(var i in products){
            let product_item = products[i];
            let share_count = parseInt(product_item['share_count']);
            share_count = share_count + 1;
            products[i]['share_count'] = share_count;
        }
        group_datail['products'] = products;
        this.setState({
            group_datail: group_datail
        })
    }

    //底部组件
    footerComponent() {
        if(!this.isDApp){
            return null;
        }
        return (
           <div className="mobileFooter">
                <ul className="footNavInfo clearfix">
                    <li className="ripple" style={{width: '50%', backgroundColor: '#ff585f', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.shareAll()}><span className="iconfont icon-share" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Share</span></a></li>
                    <li className="ripple" style={{width: '50%', backgroundColor: '#32dc50', 'color': '#ffffff'}}><a href="javascript:void(0)" onClick={() => this.shareWhatsApp()}><span className="iconfont icon-whatsapp" style={{'color': '#ffffff'}}></span><span className="text" style={{'color': '#ffffff'}}>Whatsapp</span></a></li>
                </ul>
            </div>
        );
    }

	render(){
        if(!this.state.loading && !this.state.group_datail){
            return (
                <Layout isBack={true} header_title={this.state.header_title} isCart={true} footer={null}>
                    <NotFoundComponent />
                </Layout>
            )
        }
        //占位符
        if(!this.state.group_datail){
            return (
                <Layout isBack={true} header_title={this.state.header_title} isCart={true} footer={this.state.footer}>
                    <div className="groupPlaceBlock"></div>
                </Layout>
            )
        }
        let group_datail = this.state.group_datail;
		return (
            <Layout isBack={true} header_title={this.state.header_title} isCart={true} footer={this.state.footer}>
    			<div className="groupDetailBox">
                    <div className="groupDetailInfo">
                        <div className="groupName">
                            {group_datail && this.state.group_datail.title}
                        </div>
                        <div className="groupDescription">
                            <div dangerouslySetInnerHTML={{__html: group_datail && group_datail.description}}></div>
                        </div>
                    </div>
                    {
                        this.state.isDApp ? 
                        <div className="groupBtns">
                            <div className="groupInfoBtn"><span onClick={() => this.onCopy()}><span className="iconfont icon-copy"></span>Copy</span></div>
                            <div className="groupInfoBtn"><a href="javascript: void(0)" onClick={() => this.shareAll()}>
                                <span className="iconfont icon-share1"></span>Share All</a>
                            </div>
                            {
                                group_datail && !group_datail['in_vendor_store'] ? 
                                <div className="groupInfoBtn" onClick={() => this.addToStore()}><span className="iconfont icon-store"></span>Add To Store</div>
                                : <div className="groupInfoBtn"><Link to="/user/store"><span className="iconfont icon-store"></span>View in store</Link></div>
                            }
                        </div> : 
                        this.state.isDApp ? <div className="groupBtns">
                            <div className="groupInfoBtn"><span onClick={() => this.onCopy()}><span className="iconfont icon-copy"></span>Copy</span></div>
                        </div> : null
                    }
                    {
                        group_datail && group_datail.products ? 
                            <ProductListComponent products={group_datail && (this.state.group_datail.products || [])} vendor_store_id={this.vendor_store_id ? this.vendor_store_id : null} vendor_store={this.state.vendor_store ? this.state.vendor_store : null} />
                        : null
                    }
                </div>
            </Layout>
		);
	}
}

export default loginHoc(Detail);