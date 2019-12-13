// component/footer
import React, { Component } from 'react';
import {Link} from 'react-keeper';

class Footer extends Component {
	onLinkClick(item){
		let menu_name = item && item['name'] ? item['name'] : '';
		//当前页是首页，再次点击首页，刷新首页数据
		if(menu_name == 'Home' && this.props.current_route == 'home'){
			this.props.updatePageData && typeof this.props.updatePageData == 'function' && this.props.updatePageData();
		}
		if(menu_name == 'Home'){
			document.title = 'Home';
		}
	}
	render() {
		let current_route = this.props.current_route || '';
		if(typeof this.props.footer != 'undefined'){
			return this.props.footer;
		}
		let isDApp = window.IsDApp;
		let menus = [];
		let className = ''
		if(isDApp){
			className = 'dappFooter';
			menus = [{
				'name': 'Home',
				'icon': 'home',
				'link': '/',
				'route': 'home'
			},{
				'name': 'Catelog',
				'icon': 'catalog',
				'link': '/categorys',
				'route': 'category'
			},{
				'name':'Order',
				'icon': 'order',
				'link': '/user/order/index',
				'route': 'order'
			},{
				'name': 'Help',
				'icon': 'help',
				'link': '/help',
				'route': 'help',
			},{'name': 'My Store',
				'icon': 'store',
				'link': '/user/index',
				'route': 'account'
			}];
		} else {
			className = 'H5Footer';
			menus = [{
				'name': 'Home',
				'icon': 'home',
				'link': '/',
				'route': 'home'
			},{
				'name': 'Cart',
				'icon': 'cart',
				'link': '/cart',
				'route': 'cart'
			},{
				'name':'Order',
				'icon': 'order',
				'link': '/user/order/index',
				'route': 'order'
			},{'name': 'Me',
				'icon': 'account',
				'link': '/user/index',
				'route': 'account'
			}];
		}
		return (
			<div className={"mobileFooter " + className }>
				<ul className="footNavInfo clearfix">
					{
						menus.map((item, index) => {
							if(item['route'] === current_route){
								item['icon'] = item['icon'] + '_ah';
							}
							let icon_src = require("appSrcs/static/images/icon/" + item['icon'] + '.png');
			                return (
			                    <li className="ripple" key={index} onClick={() => this.onLinkClick(item)}>
				                    <Link to={item['link']}>
				                    	<img style={{height: '22px'}} className={'ico ico-' + item['icon']} src={icon_src} alt='' />
				                    	<div><span className="text">{item['name']}</span></div>
				                    </Link>
			                    </li>
			                )
		            	})
					}
	            </ul>
            </div>
		)
	}
}

export default Footer;