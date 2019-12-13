// component/header
import React, { Component } from 'react';
import Swipe from "appSrcs/component/swipe";
import "./index.css";

class Aside extends Component {
	constructor(props) {
        super(props);
        let categorys = this.props.categories;
        let first_category = categorys[0];
        this.state = {
        	showChild : false,
            current_category: first_category
        }
    };
      //下拉加载更多的方法
    componentDidMount() {
    	let self = this;
    	//左滑隐藏
		let swipe_item = document.getElementById('mobileAsideB');
		Swipe.initSwipe(swipe_item, {
			swipeLeft: function(e){
				self.props.hideAside();
			}
		})
    }
    handleClick(cid,event){
    	const target = event.target
    		,ud = document.getElementById('ud'+cid)
    		,ul = document.getElementById('ul'+cid);
    	ud.classList.contains('down') ? ud.classList.remove('down') : ud.classList.add('down');
    	ul.classList.contains('show') ? ul.classList.remove('show') : ul.classList.add('show');
    	event.stopPropagation();
    }

    //显示分类子分类
    showChildren(index){
    	let categorys = this.props.categories;
    	let current_category = categorys[index] ? categorys[index] : null;
        this.setState({
           	current_category: current_category
        });
    }

    //子级分类
    categoryChildren(current_category) {
	    let category_children = current_category && current_category['children'] ? current_category['children'] : [];
	    return  (
	        <ul>
	        	{
	        		current_category ? <li key={current_category.category_id} onClick={(e)=>{this.props.searchByCategory(current_category.category_id); e.stopPropagation();}}>
						<span>All</span>
					</li> : null
	        	}
                {
                    category_children.map((subitem, index) => {
                        return (
							<li key={subitem.category_id} onClick={(e)=>{this.props.searchByCategory(subitem.category_id); e.stopPropagation();}}>
					            <span dangerouslySetInnerHTML={{__html: subitem['name']}}></span>
					        </li>
                        )
                    })
                }
	        </ul>
	    )
	}

	render() {
		let current_category = this.state.current_category;
		return (
			<div ref={this.aside} className={'mobileAsideBox ' + (this.props.isShow ? 'show': '')} id='mobileAsideB'>
				<div className={'mobileAside ' }>
				    <div className="mobileasidepanel">
				    	<div className="asideCateHeader">
				    		<span>Category</span>
				    	</div>
				    	<div className="cateLayBox">
					    	<div className="asideCateLeft">
						        <ul>
							        {
							        	this.props.categories ? this.props.categories.map((item,index)=>{
							        		let current_class = current_category && item['category_id'] == current_category.category_id ? 'current' : '';
							        		return (
							        			<li key={item.category_id} className={current_class} onClick={()=>{this.showChildren(index)}}>
									                <div><span dangerouslySetInnerHTML={{__html: item['name']}}></span><span id={"ud"+item.category_id} className='ud down'></span></div>
									            </li>
							        		)
							        	}) : null
							        }
						            
						        </ul>
						    </div>
						    <div className='asideCateRight'>
	                            {this.categoryChildren(current_category)}
	                        </div>
                        </div>
				    </div>
				</div>
				<div className="maskLayer" onClick={()=>{this.props.hideAside()}}></div>
			</div>
		)
	}
}

export default Aside;