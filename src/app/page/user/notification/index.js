import React, {Component} from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import {Link,Control,CacheLink} from 'react-keeper';
import LoadMore from 'appSrcs/component/scroll/loadMore';
import './index.css';
import test_image from "appSrcs/static/images/1111.png";

//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader">
            <div className="mobileHeaderBox clearfix">
                <span className="backBox" onClick={props.goBack}><span className="iconfont icon-left"></span></span>
                <div className="mobileHeaderTitle" style={{'textAlign':'center'}}>
                    <div className="name">Notifications</div>
                </div>
            </div>
        </div>
    );
}

function Item(props){
	return (
		<li onClick={()=>props.onHandleClcik(props.id,props.url)}>
		<div className="accountNotiTime">{props.date_added}</div>
			<div className="accountNotiItemConent">
				<h4>{props.title}{~~props.is_read == 0?<span className="unRead"></span>:null}</h4>
				<p>
					{props.content}
					{
						props.image_url ? <img src={props.image_url} alt='' /> : null
					}
				</p>
			</div>
			
		</li>
	)
}

export default class Notification extends Component{
	constructor(props) {
	  super(props);
	
	  this.state = {
	  	hasMore: false, //是否存在下一页
        isLoadingMore: false,//是否正在加载
	  	notices : []
	  };
	  this.page = 1;
	}
	componentDidMount(){
		this.getData();
	}

	getData(){
		let page = this.page;
		let url = '/api.php?route=notification&pagesize=5&page='+page;
		this.setState({
            isLoadingMore: true
        });
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            const rows = data.rows;
            let hasMore = true,notices = null;
            if(rows.length){
                notices = this.state.notices.concat(rows);
            }

            if(~~data.page >= data.pagenum){
            	hasMore = false;
            }
            
            this.setState({
                notices: notices,
                hasMore: hasMore,
                isLoadingMore: false,
                loading : false,
            });
            this.page +=1;
        }).catch(ex => {
            console.error('ERROR')
        });
	}
	goBack(){
        window.history.back();
    }
    setReadedMsg(id,destination){
    	let url = '/api.php?route=notification/isRead&id='+id;
        HttpUtils.get(url, {})
        .then((responseData) => {
        	if(responseData.code == '0000'){
        		Control.go(destination);
        	}
         }).catch(ex => {
            console.error('ERROR')
        });
    }
	renderContent(){
		let notices = this.state.notices;
		if(!notices || notices.length === 0) return null;
		return (
			<ul className="accountNotiListBox">
			{
				notices.map((item,index)=>{
					return <Item key={item.id} {...item} onHandleClcik={this.setReadedMsg.bind(this)}/>
				})
			}
			</ul>
		)
	}

	render(){
		return (
			<Layout header={<HeaderComponent goBack={()=>this.goBack()} title={this.title}/>}>
				{this.renderContent()}
				{
                    //滚动加载
                    this.state.hasMore
                    ? <LoadMore isLoadingMore={this.state.isLoadingMore} loadMoreFn={this.getData.bind(this)}/>
                    : null
                }
			</Layout>
		)
	}
}