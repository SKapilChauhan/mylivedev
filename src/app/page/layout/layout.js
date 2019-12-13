// component/layout
import React, { Component } from 'react';
import Header from './header';
import Footer from './footer';

class Layout extends Component {
	render() {
		return (
			<div className={this.props.pageClass || '' }>
				<Header {...this.props} />
				<div className="warpContent">
					{this.props.children}
				</div>
            	<Footer {...this.props} />
            </div>
		)
	}
}

export default Layout;