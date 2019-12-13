
import React, { Component } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import {Control,CacheLink} from 'react-keeper';
import lazyimage from 'appSrcs/static/images/loading.gif';
import Share from 'appSrcs/utils/share';
import copy from 'copy-to-clipboard';
import loginHoc from 'appSrcs/component/hoc/loginHoc';
import './list.css';

class GroupList extends Component {
    async shareWhatsApp(item){
        if(this.props.login()){
            const des = item.title + item.description_share;
            let share_data = {
                product_group_id : item.product_group_id,
                description : des,
                images : item['main_images'] ? item['main_images'] : []
            };
            Share.productShareWhatsapp(share_data, function(ret){
                if(ret.data && ret.data.share_count){
                    //更新分享数据
                    document.getElementById('shareCount'+item.product_group_id).innerHTML = ret.data.share_count;
                }
            });
           
        }
    }
    shareOhters(item){
        const des = item.title + item.description_share;
        if(this.props.login()){
            Share.showMenu(window.plus,{
                type : '',//whatsapp fackbook,whatsapp
                images : item['main_images'],
                description : des,
                url : '',
                product_group_id : item.product_group_id,
            },(ret)=>{
                //更新分享数据
                document.getElementById('shareCount'+item.product_group_id).innerHTML = ret.data.share_count;
            });
        }
       
    }
    componentDidMount(){
        
    }

    handleChange(event) {
        const target = event.target;
        const groupDom = target.parentNode.parentNode;
        //target.checked ? groupDom.classList.add("selectedGroup") : groupDom.classList.remove("selectedGroup");
        /*const value = target.type === 'checkbox'? target.checked : target.value;
        const name = target.name;
        this.setState({
          [name]: value
        });*/
    }
    render(){
        let product_group = this.props.product_group ? this.props.product_group : [];
        let vendor_store = this.props.vendor_store ? this.props.vendor_store : null;
        let isShowCkb = this.props.isShowCkb;
        let isDApp = window.IsDApp;
        let is_show_price = true;
        let is_show_askprice = false;
        let whatsapp_number =  '';
        //h5店铺设置不展示价格
        if(!isDApp && vendor_store){
            if(typeof vendor_store['is_show_price'] != 'undefined' && vendor_store['is_show_price']  != '1'){
                is_show_price = false;
            }
            whatsapp_number = vendor_store['whats_app_number'] ? vendor_store['whats_app_number'] : ''
            if(!is_show_price && whatsapp_number){
                if(typeof vendor_store['is_show_askprice'] != 'undefined' && vendor_store['is_show_askprice']  == '1'){
                    is_show_askprice = true;
                }
            }
        }
        return (
            <ul>
            {
                product_group ? product_group.map((item, index) => {

                    let length = item['main_images'] && item['main_images'].length ? item['main_images'].length : 0;

                    let image_1 = (item['main_images'] && item['main_images'].length > 0) ? item['main_images'][0] : '';

                    let image_2 =  item['main_images'] && item['main_images'].length > 0 
                                    ? (
                                        item['main_images'].length > 1  ? item['main_images'][1] : item['main_images'][0]
                                    ) : '';
                    let image_3  = item['main_images'] && item['main_images'].length > 0  
                                    ? (
                                        item['main_images'].length >2 ? item['main_images'][2] : item['main_images'][0]
                                    ) : ''

                    let image_class = 'imgbox_' + length;
                    return (
                        <li className="groupListItem" index={index} key={index.toString()}>
                        {
                            isShowCkb?<label><input groupid={item.product_group_id} name="groupCbk" className="mui-checkbox" type="checkbox" onChange={(e)=>{this.handleChange(e)}}/></label>:null
                        }
                            <div className="groupListItemBox">
                                <CacheLink to={'/group/' + item['product_group_id']} state={{vendor_store_id:item.vendor_store_id}}>
                                    <div className="imgblock">
                                        <div className={"imgbox " + image_class}>
                                            <div className="img1">
                                                <div>
                                                   <LazyLoadImage
                                                        alt=''
                                                        src={image_1}
                                                        placeholderSrc={lazyimage}
                                                    />
                                                </div>
                                                {
                                                    item['out_of_stock'] && 
                                                    <div>
                                                        <div className="out_of_stock">
                                                            Out Of Stock
                                                        </div>
                                                        {
                                                            isDApp ? 
                                                            <div className="noticeAvailable">
Notify                                                                <span className="iconfont icon-notices"></span>Notify me when available
                                                            </div> : null
                                                        }
                                                    </div>
                                                }
                                                
                                            </div>
                                            {
                                                item['main_images'] && item['main_images'].length > 1 ? 
                                                <div className="img2">
                                                    <div className="img2Item">
                                                        <LazyLoadImage src={image_2} alt='' placeholderSrc={lazyimage}  />
                                                    </div>
                                                    {
                                                        image_3 ? 
                                                        <div className="img2Item img22">
                                                        <LazyLoadImage src={image_3} alt='' placeholderSrc={lazyimage} />
                                                        {
                                                            item['product_total'] > 3 && 
                                                            (
                                                                <div>
                                                                    <div className="layer"></div>
                                                                    <div className="overcount">+{item['product_total'] - 3} More</div>
                                                                </div>
                                                            )
                                                        }
                                                        </div> : null
                                                    }
                                                    
                                                </div> : null
                                            }
                                        </div>
                                    </div>
                                </CacheLink>
                                <div className="infoblock">
                                    <CacheLink to={'/group/' + item['product_group_id']} state={{vendor_store_id:item.vendor_store_id}}><div className="name">{item.title}</div></CacheLink>
                                    <div className="boxInfo">
                                        {
                                            is_show_price ?
                                            <span>
                                                <span className="priceText">Starting From</span>
                                                <span className="price">{item.price || ''}</span>
                                                {
                                                    isDApp &&  item.price_extra_display &&
                                                    (
                                                        <span>
                                                            { 
                                                                item.price_extra && <span className="sprice">{item.price_extra}</span> 
                                                            }
                                                            { 
                                                                item.discount_off && 
                                                                <span className="soff">（{item.discount_off} off）</span>
                                                            }
                                                        </span>
                                                    )
                                                } 
                                            </span> : null
                                        }
                                        {
                                            is_show_askprice ? 
                                            <a href={"https://api.whatsapp.com/send?phone=" + whatsapp_number} target="_blank">
                                            <span className="askprice">
                                                <span className="iconfont icon-whatsapp"></span> <span>Ask Best Price</span>
                                            </span></a> : null
                                        }
                                        <span className="sshare">
                                            <span><span id={'shareCount'+item['product_group_id']}>{item['share_count']}</span></span>
                                            <span className="iconfont icon-share"></span>
                                        </span>
                                    </div>
                                    <div className="shipbox clearfix">
                                        <span className="shipblock">
                                            {
                                                item['freight_original'] > 0 ? 
                                                <span>
                                                    <span className="iconfont icon-ship"></span>
                                                    <span>Discounted Shipping</span>
                                                    <span className="price">{item.freight}</span> 
                                                    {
                                                        item['delineation_freight'] ? <span className="sprice">{item.delineation_freight}</span> : ''
                                                    }
                                                </span> :
                                                <span>
                                                    <span className="iconfont icon-ship"></span><span>Free Shipping</span>
                                                </span>
                                            }
                                        </span>
                                    </div>
                                    {
                                        isDApp ? <div className="btnfnfo">
                                            <span className="btn btnShare" onClick={() => this.shareOhters(item)}>
                                                <span className="iconfont icon-share"></span>
                                                <span className="text">Share</span>
                                            </span>
                                            <span className="btn btnWhatsapp" onClick={(text) => this.shareWhatsApp(item)}>
                                                <span className="iconfont icon-whatsapp"></span>
                                                <span className="text">Share on whatsapp</span>
                                            </span>
                                        </div> : null
                                    }
                                    
                                </div>
                            </div>
                        </li>
                    )
                }) : null
            }
            </ul>
        )
    }
}

export default loginHoc(GroupList);