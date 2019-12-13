import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import empty_image from 'appSrcs/static/images/no_result.png';
import Toast from "appSrcs/component/toast/index";
import './index.css';

export default class Vendors extends Component{
	constructor(props) {
	 	super(props);
        this.header_title = document.title = ' Subordinate distributors';
		this.state = {
            loading: true,
			header_title : this.header_title,
		    hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            //下级分销商
            vendors: null,
            //子级分销商集合
            vendors_children: {}
		};
		this.page = 1;
	}
	componentDidMount(){
		this.getVendorsList();
	}
	//获取下级分销商列表
    getVendorsList(callback){
        let page = this.page;
        let data = {
            page: this.page,
        };
        HttpUtils.get('/api.php?route=vendor/vendor/getSubVendors', data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let hasMore = true;
                let data = responseData.data;
                let page_vendor_list = data.vendor_list;
                if(!page_vendor_list || page_vendor_list.length === 0){
                    hasMore = false;
                }
                let vendor_list = this.state.vendor_list || [];
                if(page === 1){
                    vendor_list = page_vendor_list;
                }
                else if(page_vendor_list && page_vendor_list.length > 0){
                    vendor_list = vendor_list.concat(page_vendor_list);
                }
                this.setState({
                    hasMore: hasMore,
                    isLoadingMore: false,
                    loading : false,
                    vendor_list: vendor_list,
                });
                this.page +=1;
            }
            typeof callback === 'function' && callback();
        }).catch(error=>{
            
        });
    }

    //显示加载下级分销商
    showVendorsChildren(customer_id){
        let vendors_children = this.state.vendors_children;
        if(!vendors_children[customer_id]){
            this.getSubVendorsList(customer_id);
        } else {
            let vendors_children_c = vendors_children[customer_id];
            let is_show = vendors_children_c['show'] ? true : false;
            if(is_show){
                vendors_children_c['show'] =  false;
            } else {
                vendors_children_c['show'] =  true;
            }
            vendors_children[customer_id] = vendors_children_c;
            this.setState({
                vendors_children: vendors_children
            });
        }
    }

    //获取下级分销商列表
    getSubVendorsList(customer_id, callback){
        let vendors_children = this.state.vendors_children;
        let vendors_children_c = vendors_children[customer_id] || {
            list: [],
            page: 1,
            hasMore: true
        }
        let page = vendors_children_c.page;
        let data = {
            page: page,
            customer_id: customer_id
        };
        HttpUtils.get('/api.php?route=vendor/vendor/getSubVendors', data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let hasMore = true;
                let data = responseData.data;
                let page_vendor_list = data.vendor_list;
                if(!page_vendor_list || page_vendor_list.length === 0){
                    hasMore = false;
                }
                let vendor_list = vendors_children_c['list'] || [];
                if(page === 1){
                    vendor_list = page_vendor_list;
                }
                else if(page_vendor_list && page_vendor_list.length > 0){
                    vendor_list = vendor_list.concat(page_vendor_list);
                }
                if(responseData.limit && vendor_list.length < responseData.limit){
                    hasMore = false;
                }
                vendors_children_c['list'] = vendor_list;
                vendors_children_c['hasMore'] = hasMore;
                vendors_children_c['page'] +=1;
                vendors_children_c['show'] = true;
                let vendors_children = this.state.vendors_children;
                vendors_children[customer_id] = vendors_children_c;
                //更新下级分销商
                this.setState({
                    vendors_children: vendors_children
                });
                if(vendor_list.length == 0){
                    Toast.danger('No Subordinate distributors');
                }
            }
            typeof callback === 'function' && callback();
        }).catch(error=>{
            
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
        this.getVendorsList();
    }

    //加载下级更多列表
    loadMoreChildrenData(customer_id){
        this.getSubVendorsList(customer_id);
    }

    //下级分销商视图
    getSubVendorsRender(customer_id){
        let vendors_children_c = this.state.vendors_children[customer_id] || {
            list: [],
            hasMore: false
        };
        let vendors_children_list = vendors_children_c['list'] || [];
        if(!vendors_children_list || vendors_children_list.length == 0){
            return null;
        }
        let hasMore = vendors_children_c.hasMore ? true : false;
        let is_display = vendors_children_c.show ? 'block' : 'none';
        return (
            <div className="childrenBox" style={{'display' : is_display}}>
                <ul>
                {
                    vendors_children_list ? vendors_children_list.map((citem,index)=>{
                        return (
                            <li className="childrenVendorItem">
                                <div className="boxListTr">
                                    <div className="rowNumberTd">
                                        <span className="rowNumber">{index + 1}</span>
                                    </div>
                                    <div className="boxTd nicknameTd">
                                        <span className="nickname">{citem['nickname']}</span>
                                    </div>
                                    <div className="boxTd">
                                        <span>{citem['telephone']}</span>
                                    </div>
                                    <div className="boxTd">
                                        <span>{citem['add_time']}</span>
                                    </div>
                                </div>
                            </li>
                        )
                    }) : null
                }
                </ul>
                {
                    //加载更多
                    hasMore
                    ? <a className="moreBtn" onClick={() => this.loadMoreChildrenData(customer_id)}>
                        <span className="mbtn">More..</span>
                    </a>
                    : ''
                }
            </div>
        );
    }

    vendorListRender(vendor_list){
        if(vendor_list == null){
            return null;
        }
        if(vendor_list && vendor_list.length == 0){
            return (
                <div className="noResults">
                    <div className="resultImg">
                        <img src={empty_image} width="120" alt='' />
                    </div>
                    <div className="resultContent">
                        <p>
                            You don't currently have any distributors, please work harder.
                        </p>
                    </div>
                </div>
            )
        }
        return (
            <ul className="vendorListBox">
            {
                vendor_list.map((item,index)=>{
                    let vendors_children_c = this.state.vendors_children[item['customer_id']] || {};
                    let ud_class = vendors_children_c.show ? 'down' : 'up';
                    return (
                        <li className="vendorListItem">
                            <div className="boxListTr">
                                <div className="boxTd rowNumberTd">
                                    <span className="rowNumber">{index + 1}</span>
                                </div>
                                <div className="boxTd nicknameTd">
                                    <span className="nickname">{item['nickname']}</span>
                                </div>
                                <div className="boxTd phoneBoxTd">
                                    <span>{item['telephone']}</span>
                                </div>
                                <div className="boxTd addTimeBoxTd">
                                    <span>{item['add_time']}</span>
                                    <a className="udLink" onClick={() => this.showVendorsChildren(item['customer_id'])}>
                                        <span className={'ud ' + ud_class}></span>
                                    </a>
                                </div>
                            </div>
                            {this.getSubVendorsRender(item['customer_id'])}
                        </li>
                    )
                })
            }
            </ul>
        );
    }

    renderContent(){
    	const vendor_list = this.state.vendor_list;
    	return (
    		<div className="accountVendorBox">
    			<div className="boxCwarn">
    				<span className="cwarnIcon">!</span>
    				<span>
                        By default, the first level distributor is displayed, and the folded second level distributor is displayed.
    				</span>
    			</div>
                <div className="vendorListTable">
                    <div className="tVendorHeader">
                        <div className="boxTd rowNumberTd"> </div>
                        <div className="boxTd nicknameTd">Nickname</div>
                        <div className="boxTd phoneBoxTd">Telephone</div>
                        <div className="boxTd addTimeBoxTd">Adding time</div>
                    </div>
        			<div className="vendorListBlock">
        				{ this.vendorListRender(vendor_list) }
        			</div>
                </div>
    			{
                    //滚动加载
                    this.state.hasMore
                    ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)} />
                    : ''
                }
    		</div>
    	);
    }
	render(){
		return (
			<Layout header_title={this.state.header_title} isBack={true} >
				{this.renderContent()}
			</Layout>
		);
	}
}