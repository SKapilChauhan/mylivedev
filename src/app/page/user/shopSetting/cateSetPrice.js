import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import LoadMore from 'appSrcs/component/scroll/loadMore';
import empty_image from 'appSrcs/static/images/no_result.png';
import Toast from "appSrcs/component/toast/index";
import './catePrice.css';

export default class CateSetPrice extends Component{
	constructor(props) {
	 	super(props);
        this.header_title = document.title = 'Category Price Setting';
		this.state = {
            loading: true,
			header_title : this.header_title,
		    hasMore: false, //是否存在下一页
            isLoadingMore: false,//是否正在加载
            //分类
            categoryRaise: []
		};
		this.page = 1;
	}
	componentDidMount(){
		this.getCategoryRaise();
	}


    //获取
    getCategoryRaise(){
        HttpUtils.get('/api.php?route=store/storeCategoryRaise', {})
        .then((responseData)=>{
            if(responseData.code === '0000'){
                let data = responseData.data;
               this.setState({
                    settingPriceType: data.type,
                    categoryRaise: data.categoryRaise
               })
            }
        }).catch(error=>{
            
        });
    }

    onChangeHandle(event){
        const target = event.target;
        const value = target.type === 'checkbox'? (target.checked=== true ? 1 : 0) : target.value;
        const name = target.name;
        this.setState({
          [name]: value
        });
    }

    onChangeValue(event, category_id){
        let value = event.target.value;
        let categoryRaise = this.state.categoryRaise;
        categoryRaise[category_id]['setting_price_val'] = value;
        this.setState({
            categoryRaise: categoryRaise
        })
    }

    onSave(){

        let categoryRaise = this.state.categoryRaise;

        let c = [];

        let flag = true;

        for(var category_id in categoryRaise){
            let value = categoryRaise[category_id]['setting_price_val'];
            value = parseFloat(value) ? value : '';
            c.push({
                category_id: category_id,
                value: value
            })
        }

        if(!flag){
            return false;
        }
      
        c = JSON.stringify(c);
        
        let data = {
            'type': this.state.settingPriceType,
            'data': c
        }
        HttpUtils.post('/api.php?route=store/storeCategoryRaise', data)
        .then((responseData)=>{
            if(responseData.code === '0000'){
                Toast.success(responseData.message)
            } else {
                Toast.danger(responseData.message);
            }
        }).catch(error=>{
            
        });
    }

     //底部组件
    footerComponent() {
        return (
            <div className="mobileFooter">
                <ul className="footNavInfo clearfix">
                    <li className="ripple" style={{backgroundColor: '#ff5a61', 'color': '#ffffff'}}>
                        <a href="javascript:void(0)" onClick={() => this.onSave()}>
                            <span className="text" style={{'color': '#ffffff'}}>Save</span>
                        </a>
                    </li>
                </ul>
            </div>
        );
    }


    renderContent(){
    	let categoryRaise = this.state.categoryRaise;
    	return (
    		<div className="catePriceSettingBox">
    			<div className="accountCatePriceSetBox">
                    <div className="radioBox">
                        <div>
                            <input type="radio" value="1" checked={this.state.settingPriceType == 1} name="settingPriceType" id="Percentage" onChange={(e) => this.onChangeHandle(e)} />
                            <label htmlFor="Percentage">Percentage</label>
                        </div>
                        <div>
                            <input type="radio" value="2" checked={this.state.settingPriceType == 2} name="settingPriceType" id="Amount" onChange={(e) => this.onChangeHandle(e)} />
                            <label htmlFor="Amount">Amount</label>
                        </div>
                    </div>
                </div>
                <div className="catePriceSettingList">
                    <div className="catePriceSettingTable">
                        {
                            categoryRaise ? Object.keys(categoryRaise).map((category_id, index)=>{
                                let item = categoryRaise[category_id];
                                return (
                                   <div className="boxListTr" key={category_id}>
                                        <div className="boxTd rowNumberTd">
                                            <span className="rowNumber">{index + 1}</span>
                                        </div>
                                        <div className="boxTd">
                                            <span className="name" dangerouslySetInnerHTML={{__html: item.name}}></span>
                                        </div>
                                        <div className="boxTd">
                                            <div className="inputP">
                                                <span><input type="number" className="formControl" onChange={(e) => this.onChangeValue(e, category_id)} value={item['setting_price_val']} /></span>
                                                {
                                                    this.state.settingPriceType == 1 ? <span className='pspan'>%</span> : null
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : null
                        }
        			</div>
                </div>
    		</div>
    	);
    }
	render(){
		return (
			<Layout header_title={this.state.header_title} isBack={true} footer={this.footerComponent()} >
				{this.renderContent()}
			</Layout>
		);
	}
}