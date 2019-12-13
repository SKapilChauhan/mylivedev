import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../../layout/layout";
import { Link, Control } from 'react-keeper';
import Tab from '../../../component/tab/index';
import LoadMore from 'appSrcs/component/scroll/loadMore';

import '../index.css';

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
	)
}

function FooterComponent(props){
	return (
		null
	)
}

function SaleItem(props){
    return (
        <li>
        	<span>{props.order_no} <br/><i style={{'fontSize':'0.24rem'}}>{props.date_format}</i></span>
        	<span className={~~props.change_sales < 0?"cled676d":null}>{props.change_sales_format}</span>
        	<span>{props.change_collected_format}</span>
        </li>
    )
}

function SaleList(props){
    return (
        <ul className="saleListBox">
        	<li className="saleListTitle">
	        	<span>ID/<br/>Date</span>
	        	<span>Actual Sale(Rs)</span>
	        	<span>Margin<br/>(Rs)</span>
	        </li>
	        <li className="saleListTotal">
	        	<span>Total</span>
	        	<span>{props.sales_real}</span>
	        	<span>{props.collected_total}</span>
	        </li>
        {
            props.list.map((item,index)=>{
                return <SaleItem key={item.id} {...item}/>
            })
        }
        </ul>
    )
}

function BonusItem(props){
    return (
        <li>
        	<span>{props.order_sn} <br/><i style={{'fontSize':'0.24rem'}}>{props.pay_time_format}</i></span>
        	<span>{props.ori_total}/{props.order_total}</span>
        	<span>{props.collected_real}/{~~props.commission<0?<i className="cled676d">props.commission</i>:props.commission}</span>
        </li>
    )
}

function BonusList(props){
    return (
        <ul className="saleListBox">
        	<li className="saleListTitle">
	        	<span>ID/<br/>Date</span>
	        	<span>Order Amount/<br/>Actual Sale(Rs)</span>
	        	<span>Collected Margin/<br/>Bouns(Rs)</span>
	        </li>
	        <li className="saleListTotal">
	        	<span>Total</span>
	        	<span>--/--</span>
	        	<span>{props.collected_real}/{props.commission_total}</span>
	        </li>
        {
            props.list.map((item,index)=>{
                return <BonusItem key={item.id} {...item}/>
            })
        }
        </ul>
    )
}

export default class CommissionDetail extends Component{
	constructor(props) {
	 	super(props);
	
		this.state = {
            sale : {
                current : true,//当前列表
                saleList: [],
                page : 1,
                sales_real : '',
                collected_total : '',
                hasMore: false, //是否存在下一页
                isLoadingMore: false,//是否正在加载
            },
		    bound : {
                current : false,
                page : 1,
                collected_real : '',
                commission_total : '',
                hasMore: false, //是否存在下一页
                isLoadingMore: false,//是否正在加载
                bonusList:[],
            },
            tabs : ['Sale Details','Bonus Details'],
            contents : ['',''],
            time : '',
		};
		
		this.title = document.title = 'Details';
		this.id = this.props.params.id;
	}
	componentDidMount(){
        this.id == 0 ? this.getCurrentSalesList():this.getSalesList();
		//this.getSalesList();
		//this.getBonusList();
	}
    getCurrentSalesList(){
        let page = this.state.sale.page
            ,saleList = this.state.sale.saleList
            ,hasMore = true;
        let url = '/api.php?route=vendor/commission/sales&stage_id='+this.id+'&page='+page;
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            if(data && data.details){
                let saleList = data.details;
                if(data.details && data.details.length){
                    saleList = this.state.sale.saleList.concat(saleList);
                }
                
                if(page >= data.page_size){
                    hasMore = false;
                }
                this.setState({
                    sale : {
                        current : this.state.sale.current,
                        saleList: saleList,
                        sales_real : data.sales_real,
                        collected_total : data.collected_total,
                        page : page+1,
                        hasMore: hasMore, //是否存在下一页
                        isLoadingMore: false,//是否正在加载
                    },
                    time : data.title
                });
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    
    }
	getSalesList(){
		let page = this.state.sale.page
			,saleList = this.state.sale.saleList
			,hasMore = true;
        let url = '/api.php?route=vendor/commission/sales&stage_id='+this.id+'&page='+page;
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            if(data && data.details && data.details.length > 0){
            	let saleList = data.details;
            	saleList = this.state.sale.saleList.concat(saleList);
                let contents = [
                    <SaleList list={saleList} sales_real={data.sales} collected_total={data.collected_total}/>,
                    <BonusList list={this.state.bound.bonusList} collected_real={this.state.bound.collected_real} commission_total={this.state.bound.commission_total}/>
                ]
                if(page >= data.page_size){
                	hasMore = false;
                }
            	this.setState({
			      	contents: contents,
                    sale : {
                        current : this.state.sale.current,
                        saleList: saleList,
                        sales_real : data.sales,
                        collected_total : data.collected_total,
                        page : page+1,
                        hasMore: hasMore, //是否存在下一页
                        isLoadingMore: false,//是否正在加载
                    },
                    time : data.title
			    });
            }
            this.getBonusList();
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    getBonusList(){
        let page = this.state.bound.page
            ,bonusList = this.state.bound.bonusList
            ,hasMore = true;
        let url = '/api.php?route=vendor/commission/bonus&stage_id='+this.id+'&page='+page;
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            if(data && data.details && data.details.length > 0){
                let bonusList = data.details;
                bonusList = this.state.bound.bonusList.concat(bonusList);
                let contents = [
                    <SaleList list={this.state.sale.saleList} sales_real={this.state.sale.sales_real} collected_total={this.state.sale.collected_total}/>,
                    <BonusList list={bonusList} collected_real={data.collected_real} commission_total={data.commission_total}/>
                ]
                if(page >= data.page_size){
                    hasMore = false;
                }
                this.setState({
                    contents: contents,
                    bound : {
                        bonusList: bonusList,
                        page : page+1,
                        collected_real : data.collected_real,
                        commission_total : data.commission_total,
                        hasMore: hasMore, //是否存在下一页
                        isLoadingMore: false,//是否正在加载
                    },
                });
                
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    goBack(){
    	window.history.back();
    }
	// 加载更多数据
    loadMoreData() {
        const tab = document.getElementById('tab');
        const cl = tab.firstChild.classList;
        if([...cl].indexOf('current')>-1){
            //sale选中
            if(this.state.sale.isLoadingMore){
                return false;
            }
            if(!this.state.sale.hasMore){
                return false;
            }
            this.getSalesList();
        }else {
            //bound选中
            //sale选中
            if(this.state.bound.isLoadingMore){
                return false;
            }
            if(!this.state.bound.hasMore){
                return false;
            }
            this.getBonusList();
        }
        
    }
    callback(index){
        if(index == 0){
            this.setState({
                sale : {
                    current : true,
                    saleList: this.state.sale.saleList,
                    page : this.state.sale.page,
                    hasMore: this.state.sale.hasMore, //是否存在下一页
                    isLoadingMore: this.state.sale.isLoadingMore,//是否正在加载
                },
                bound : {
                    current : false,
                    bonusList: this.state.bound.bonusList,
                    page : this.state.bound.page,
                    hasMore: this.state.bound.hasMore, //是否存在下一页
                    isLoadingMore: this.state.bound.isLoadingMore,//
                }
            });
        }else {
            this.setState({
                sale : {
                    current : false,
                    saleList: this.state.sale.saleList,
                    page : this.state.sale.page,
                    hasMore: this.state.sale.hasMore, //是否存在下一页
                    isLoadingMore: this.state.sale.isLoadingMore,//
                },
                bound : {
                    current : true,
                    bonusList: this.state.bound.bonusList,
                    page : this.state.bound.page,
                    hasMore: this.state.bound.hasMore, //是否存在下一页
                    isLoadingMore: this.state.bound.isLoadingMore,//
                }
            });
        }
    }
    renderContent(){
    	return (
    		<div className="accountCommissionBox">
    			<div className="commissionWarn">
    				<span className="commissionWarnIcon">!</span>
    				<span>
    					Order Amount is what you paid for the order.Margin is  with GST if your customer paid for it. Collected Margin is what shogee collected for you without GST.When ids are duplicate,later records are adustment amount.
    				</span>
    			</div>
    			<div className="timeBetween">{this.state.time}</div>
                {
                    this.id == 0 ? 
                    <div id="content"><div className="active">
                    <SaleList list={this.state.sale.saleList} sales_real={this.state.sale.sales_real} collected_total={this.state.sale.collected_total}/>
                    </div></div>
                    :
                    <Tab cb={this.callback.bind(this)} tabs={this.state.tabs} contents={this.state.contents}/>
                }
    			
    			
    			{
                    //滚动加载
                    this.state.sale.current && this.state.sale.hasMore
                    ? <LoadMore isLoadingMore={this.state.sale.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)}/>
                    : ''
                }
                {
                    //滚动加载
                    this.state.bound.current && this.state.bound.hasMore
                    ? <LoadMore isLoadingMore={this.state.bound.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)}/>
                    : ''
                }
    		</div>
    	);
    }
	render(){
		return (
			<Layout 
			header={<HeaderComponent goBack={this.goBack} title={this.title}/>}
			footer={<FooterComponent />}
			>
				{this.renderContent()}
			</Layout>
		);
	}
}