// component/header
import React, { Component } from 'react';
import { Control, Link } from 'react-keeper';
import Aside from "../component/aside";
import {LoginContext} from 'appSrcs/store/context';
import HttpUtils from 'appSrcs/utils/http';

class Header extends Component {
	static contentType = LoginContext
	constructor(props) {
        super(props);
        this.state = {
            keyword: props.keyword || '', 
        };
    };
    componentDidMount(){
    	
    }
	render() {
		if(typeof this.props.header != 'undefined'){
			return this.props.header;
		}
		return (
			<div className="mobileHeader">
	            <div className="mobileHeaderBox clearfix">
	                { 
	            		this.props.isBack &&  this.backBox()
	                }
	            	{ 
	            		this.props.isMenu &&  this.menuBox()
	                }
	                { 
	            		typeof this.props.header_title != 'undefined' &&  this.titleBox()
	                }
	                {
	                	this.props.isSearch && this.searchBox()
	                }
	                {
	                	this.props.isCart && this.cartBox()
	                }
	            </div>
        	</div>
		)
	}

	backBox(){
		return (
			<span className="backBox" onClick={() => this.onBack()}><span className="iconfont icon-back"></span></span>
		)
	}

	onBack(){
		if(this.props.onBack && typeof this.props.onBack == 'function'){
			this.props.onBack();
		} else {
			if(window.history.length > 0){
				window.history.go(-1);
			} else {
				Control.go('/')
			}
		}
	}

	titleBox() {
		return (
			<div className="mobileHeaderTitle">{this.props.header_title || ''}</div>
		)
	}

	//显示侧边栏
	showAside(){
		let self =  this;
		let categorys = this.state.categorys;
		if(categorys && categorys.length > 0){
			this.setState({
                categorys: categorys,
                isShowAside: true
            });
		} else {
			this.getCategory(function(){
				self.setState({isShowAside: true})
			});
		}
    }

    getCategory(callback){
    	HttpUtils.get('/api.php?route=category',{})
        .then((responseData) => {
            if(typeof responseData.data != 'undefined'){
                let categorys = typeof responseData.data['ctegories'] != 'undefined' ? responseData.data['ctegories'] : [];
                this.setState({
                    categorys: categorys
                });
                typeof callback == 'function' && callback();
            }
        }).catch(ex => {
            console.error('loaderror, ', ex.message)
        });
    }

    searchByCategory(category_id){
    	Control.go('/category/' + category_id);
    }

    //隐藏侧边栏
    hideAside(){
        this.setState({isShowAside: false})
    }

	menuBox(){
		return (
			<div className="headerMenuBox">
				<span className="headerMenu" onClick={() => this.showAside()}>
	            	<span className="iconfont icon-menu"></span>
	            </span>
	            <div className="headerMAside">
		            {
			            this.state.isShowAside ? <Aside categories={this.state.categorys} 
			            isShow={this.state.isShowAside} 
			            searchByCategory={this.searchByCategory.bind(this)}
			            hideAside={this.hideAside.bind(this)} /> : null
		        	}
	        	</div>
        	</div>
		)
	}
	searchBox(){
		return (
	        <div className="headerSearch">
	        	<form onSubmit={(e)=>{
		            e.preventDefault();
		            Control.go('/search/' + e.target.keyword.value);
		        }}>
	            <div className="headerSearchBox">
	                <input className="" name="keyword" value={this.state.keyword} onChange={(event) => this.setState({keyword: event.target.value})}/>
	                <span className="iconfont icon-search"></span>
	            </div>
	            </form>
	        </div>
		)
	}
	cartBox(){
		return (
			<span className="headerCart">
				<Link to="/cart">
				<span className="iconfont icon-cart"></span></Link>
			</span>
		)
	}
}

export default Header;