import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import { Link, Control } from 'react-keeper';
import LoadMore from 'appSrcs/component/scroll/loadMore';

import './index.css';

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

function RecordItem(props){
	return (
		<li className="salePerformanceItem">
			<div>
				<span className="dateBetween">{props.stage_title}</span>
				<Link to={"/user/commissionDetail/"+props.id} className="saleDetail">Details</Link>
			</div>
			<div className="">
				<span className="">Weekly Sale</span>
				<span>{props.sales_format}</span>
			</div>
			<div>
				<span className="">Grade</span>
				<span>{props.sale_level_name}</span>
			</div>
			<div>
				<span className="">Final Sales</span>
				<span>{props.sales_done_format}</span>
			</div>
			<div>
				<span className="">Final Grade</span>
				<span><span className="cld8c600">{props.level_name}</span> ({props.rate_percent})</span>
			</div>
			<div>
				<span className="">Bonus</span>
				<span>{props.commission_total_format}</span>
			</div>
			<div>
				<span className="">Collected Margin</span>
				<span>{props.collected_format}</span>
			</div>
			<div>
				<span className="">Referral Commission</span>
				<span>{props.sub_total_format}</span>
			</div>
		</li>
	)
}

export default class Commission extends Component{
	constructor(props) {
	 	super(props);
	
		this.state = {
			value : 'all',
		    hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            details: [],
            current:null,
		};
		this.page = 1;
		this.title = document.title = 'Sales Performance';
	}
	componentDidMount(){
		this.getSalesList();
	}
	getSalesList(){
		let page = this.page
			,details = this.state.details
			,hasMore = true;
        let url = '/api.php?route=vendor/commission/list&page='+page;
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            if(data ){
            	if(data.current && this.page == 1){
			    	this.setState({
			    		current : data.current,
			    	});
			    }
            	if(data.details && data.details.length > 0){
            		let details = data.details;
	            	details = this.state.details.concat(details);
	                if(page >= data.page_total){
	                	hasMore = false;
	                }
	            	this.setState({
				      	details: this.state.details.concat(details),
				      	hasMore: hasMore,
	                    isLoadingMore: false,
				    });
            	}
                this.page++;
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
        if(this.state.isLoadingMore){
            return false;
        }
        if(!this.state.hasMore){
            return false;
        }
        this.getSalesList();
    }

    renderContent(){
    	const details = this.state.details;
    	const currentWeek = this.state.current;

    	return (
    		<div className="accountCommissionBox">
    			<div className="commissionWarn">
    				<span className="commissionWarnIcon">!</span>
    				<span>
    					If shogee gave bonus,colleceted margin to your account,then there will be a sign of Paid
    				</span>
    			</div>
    			<ul className="commissionList">
    				{
    					currentWeek?
    					<li className="salePerformanceItem">
							<div>
								<span className="dateBetween">{'Current Week·'+currentWeek.stage_title}</span>
								<Link to={"/user/commissionDetail/0"} className="saleDetail">Details</Link>
							</div>
							<div className="">
								<span className="">Weekly Sale</span>
								<span>{currentWeek.sales_format}</span>
							</div>
							<div>
								<span className="">Grade</span>
								<span>{currentWeek.sale_level_name}</span>
							</div>
						</li>
						:null
    				}
    			{
    				details.length ? details.map((item,index)=>{
    					return (
    						<RecordItem {...item} key={item.id}/>
    					)
    				}):null
    			}
    			
    			</ul>
    			{
                    //滚动加载
                    this.state.hasMore
                    ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.loadMoreData.bind(this)}/>
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