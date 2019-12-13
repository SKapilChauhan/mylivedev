import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import PlusUtils from 'appSrcs/utils/plus';
import Layout from "../../layout/layout";
import { Link, Control } from 'react-keeper';
import copy from 'copy-to-clipboard';
import Language from 'appSrcs/utils/language';
import Toast from "appSrcs/component/toast/index";
import loginHoc from 'appSrcs/component/hoc/loginHoc';
import './index.css';
import user_image from "appSrcs/static/images/user.png";
import tc_title from "appSrcs/static/images/tc_title.png";
const LANG = Language.getLangContent('view');

//头部组件
class HeaderComponent extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const info = this.props.info;
        return (
            <div className="accountHeader">
                <div className="accountBar">
                    <span className="accountTitle">My Store</span>
                    <Link to="/cart" className="headerCart"><span className="iconfont icon-cart"></span></Link>
                </div>
                <div className="accountInfo">
                    <div className="accountInfoLeft">
                        <img src={info.logo?info.logo:user_image} id="userLogo" onClick={this.props.uploadHandle} alt='' />
                        <div>
                            <span>
                            {
                                this.props.isEdit ? <input id="nicknameIpt" autoFocus={true} style={{width: '1.2rem'}} onBlur={this.props.onBlurHandle} onChange={this.props.changeHandle} type="text" value={this.props.nickname}/> : this.props.nickname
                            }
                            <span className="iconfont icon-edit" onClick={this.props.editHandleClick}></span>
                            </span>
                            
                            <div className="lineTwo">
                                <span><span className="iconfont icon-member"></span>{info.level}</span>
                                <span className="accountInfoRight">
                                    <a href="javascript:void(0)" onClick={(e)=>this.props.handCopyClick(info.referral_code,e)}><span className="iconfont icon-copy"></span></a>
                                    <label>Referral Code:</label>{info.referral_code}
                                </span>
                            </div>
                        </div>
                        <form method="post" id="uploadPhotoForm" encType ="multipart/form-data" className="uploadPhotoForm">
                            <input id="file" name="file" accept="image/*" type="file" onChange={this.props.onFileChangeHandle}/>
                        </form>
                    </div>
                    
                </div>
            </div>
        );
    }
}


class H5HeaderComponent extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const info = this.props.info;
        return (
            <div className="accountHeader h5AccountHeader">
                <div className="accountBar">
                    <span>Me</span>
                </div>
                <div className="accountInfo">
                        <img src={info.userLogo?info.userLogo:user_image} id="userLogo" onClick={this.props.uploadHandle} alt='' />
                        <span>
                            {
                                this.props.isEdit ? <input id="nicknameIpt"  autoFocus={true} style={{width: '1.2rem'}} onBlur={this.props.onBlurHandle} onChange={this.props.changeHandle} type="text" value={this.props.nickname}/> : this.props.nickname
                            }
                        <span className="iconfont icon-edit" onClick={this.props.editHandleClick}></span>
                        </span>
                        <form method="post" id="uploadPhotoForm" encType ="multipart/form-data" className="uploadPhotoForm">
                            <input id="file" name="file" accept="image/*" type="file" onChange={this.props.onFileChangeHandle}/>
                        </form>
                </div>
            </div>
        );
    }
}
//account首页
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowSale : false,
            nickname : '',
            customer_info : {name:null,referral_code:null,level:null,logo:''},
            commission : {
                bonus_referral: "",
                bonus_referral_title: "Bonus & Referral Commission",
                current_sale: "",
                enough_sale: "",
                next_level: "",
                link :"",
            },
            earn_commission_rule : {
                refer_banner : '',
                link : '',
            },
            sale_performance :{
                link: "",
                week_bonus: "",
                week_margin: "",
                week_sales: "",
            },
            menu : [],
            shop_url : '',
            evaluate : {order_num:0},
            processing : {order_num:0},
            shipped : {order_num:0},
            unpaid : {order_num:0},
            msg_num : 0,
            isEdit:false,//是否编辑name
            //copyLink : '11111',
            showCommLayer: 0
        };
        document.title = 'Account';

        this.handStartClick = this.handStartClick.bind(this);
        //this.handCopyClick = this.handCopyClick.bind(this);
    };

	//页面加载完成调用
    componentDidMount() {
        //console.log(window.IsDApp);
        //debugger;
        window.IsDApp ? this.getAccountInfo() : this.getH5AccountInfo();
    }

    componentWillUnmount(){
        //页面卸载时 撤销异步回调
        
        this.setState = (state, callback) => {
          return;
        };
    }

    editHandleClick(){
        this.setState({
            isEdit : true,
        },function(){
            //autoFocus 代替获取焦点
            //document.getElementById('nicknameIpt').focus();
        });
        
    }

    nicknameChangeHandle(event){
        let v = event.target.value.replace(/^\s+|\s+$/g,'');

        this.setState({
            nickname : v
        });
    }

    onBlurHandle(){
        if(this.state.nickname === '' || this.state.nickname === this.tempNickName){
            this.setState({
                isEdit : false,
                nickname : this.tempNickName
            });
            return;
        }

        let url = '/api.php?route=account/personal/edit';
        HttpUtils.post(url, {firstname:this.state.nickname,lastname:''})
        .then((data) => {
            if(data.code == "0000"){
                this.setState({
                    isEdit : false,
                });
                this.tempNickName = this.state.nickname;
            }else {
                this.setState({
                    isEdit : false,
                    nickname : this.tempNickName
                });
                Toast.error({title:data.message});
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    uploadHandle(){
        if(window.plus){
            this.createAvatarUpload();
        } else {
            document.getElementById('file').click();
        }
        
    }

    // app创建上传任务
    createAvatarUpload() {
        PlusUtils.uploadFile("/api.php?route=account/personal/uploadImg", "file")
        .then(function(responseData){
            if(responseData.code === '0000' && responseData.data.image){
                document.getElementById('userLogo').src = responseData.data.image;
            }
        });
    }

    //上传图片
    onFileChangeHandle(event){
        const target = event.target;
        var oData = new FormData(document.getElementById('uploadPhotoForm'));
        //Toast.showLoading();
        HttpUtils.post('/api.php?route=account/personal/uploadImg',oData,true)
        .then((responseData)=>{
            //Toast.hideLoading();
            if(responseData.code === '0000' && responseData.data.image){
                document.getElementById('userLogo').src = responseData.data.image;
            }
        }).catch(error=>{
            console.log('error:' + error);
        });
    }
    getAccountInfo(){
        let url = '/api.php?route=account/personal';
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            if(data){  
                this.setState({
                    customer_info : data.customer_info,
                    commission : data.commission,
                    earn_commission_rule : data.earn_commission_rule,
                    sale_performance :data.sale_performance,
                    menu : data.menu,
                    shop_url : data.shop_url,
                    nickname : data.customer_info.name
                });
               this.tempNickName = data.customer_info.name;
            }
            let showCommLayer = window.localStorage && window.localStorage.getItem('showCommLevelLayer') == '1' ? 0 : 1;
            if(showCommLayer){
                this.showCommLevelLayer();
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    getH5AccountInfo(){
        let url = '/api.php?route=account/personal';
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            if(data){
                const order_catalog = data.order_catalog;
                this.setState({
                    evaluate : order_catalog.evaluate,
                    processing : order_catalog.processing,
                    shipped : order_catalog.shipped,
                    unpaid : order_catalog.unpaid,
                    nickname : data.nickname,
                    msg_num : data.msg_num,
                    customer_info : {userLogo:data.logo},
                });
                this.tempNickName = data.nickname;
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    showCommLevelLayer(){
        this.setState({
            'showCommLayer': true
        });
        if(window.localStorage){
            window.localStorage.setItem('showCommLevelLayer', '1');
        }
    }
    hideCommLayer(){
        this.setState({
            'showCommLayer': false
        })
    }
    renderAccountInfo(){
        const commission = this.state.commission
            ,percent = commission.percent;
        return (
            <div className="accountInfoDetailBox">
                <div className="accountVipBox">
                    <hr className="totalProgress"/>
                    <hr className="currentProgress" style={{"width":percent}}/>
                    <span className="currentPosition" style={{"left":percent}}></span>
                    <span className="currentNum"  style={{"left":0}}>{commission.current_sale}</span>
                    <span className="totalNum">{commission.enough_sale}</span>
                    <span dangerouslySetInnerHTML={{ __html: commission.next_level }}></span>
                    <a href="javascript:void(0)" className="sHelpLink" onClick={() => this.showCommLevelLayer()}><span>?</span></a>
                </div>
                <div className="accountWalletBox">
                    <span>
                        {commission.bonus_referral_title}
                        <font className="c-ff5a61">{commission.bonus_referral}</font>
                    </span>
                    {/*<a href="" className="btn btnPrimary">Withdraw</a>*/}
                    {/*<a href={commission.link} className="btn btnPrimary accountDetailLink">Details</a>*/}
                    <Link to="/user/commission" className="accountDetailLink">
                        Details
                    </Link>
                </div>
            </div>
        )
    }

    renderAccountBanner(){
        const earn_commission_rule = this.state.earn_commission_rule;
        //earn_commission_rule.link
        return (
            earn_commission_rule.refer_banner?
            <Link to="/user/referEarn" className="accountBanner">
                <img src={earn_commission_rule.refer_banner} alt='' />
            </Link>
            :
            null
        )
    }
    //星号展示处理
    handStartClick(e){
        this.setState({
            isShowSale : !this.state.isShowSale
        });
    }
    //copy处理
    handCopyClick(link,e){
        e.preventDefault();
        if(link === ''){
            alert('copy failed! try again later.');
            return;
        }
        copy(link);
        Toast.success('Copy Success!')
        e.stopPropagation();
    }
    //设置应用消息条数
    setBadgeNumber(num){
        num = num > 0 ? num : -1;
        const plus = window.plus;
        plus && plus.runtime.setBadgeNumber(num);
    }

    //注销
    onLogOut(){
        HttpUtils.get('/api.php?route=account/user/signout', {})
        .then((responseData) => {
            if(responseData.code == '0000'){  
                Control.go('login');
            } else if(responseData.message != ''){
                Toast.danger(responseData.message);
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }
    //菜单点击
    handMenuClick(e, item){
        if(item['id'] == 'account_log_out'){
            this.onLogOut();
            this.props.setLoginStatus(false);
            return false;
        }
        Control.go(item['link']);
        return true;
    }

    renderAccountSalesPer(){
        const sale_performance = this.state.sale_performance;
        return (
            <div className="accountSalePer">
                <div className="accountSalePerTitle">
                    <span>Sales Performance  <span className={!this.state.isShowSale?"iconfont icon-eye":"iconfont icon-hideeye"} onClick={this.handStartClick}></span></span>
                    {/*<a href={sale_performance.link}>More ></a>*/}
                    <Link to="/user/commission">More ></Link>
                    
                </div>
                <div className="accountSalePerDetails">
                    <div>
                        {
                            this.state.isShowSale ? <font className="c-ff5a61">***</font>:<font className="c-ff5a61">{sale_performance.week_sales}</font>
                        }
                        
                        <span>Current Week <br/>Actual Sales</span>
                    </div>
                    <div>
                        {
                            this.state.isShowSale ? <font className="c-ff5a61">***</font>:<font className="c-ff5a61">{sale_performance.week_margin}</font>
                        }
                        <span>Last Week <br/>Collected Margin</span>
                    </div>
                    <div>
                        {
                            this.state.isShowSale ? <font className="c-ff5a61">***</font>:<font className="c-ff5a61">{sale_performance.week_bonus}</font>
                        }
                        <span>Last Week <br/>Total Bonus</span>
                    </div>
                </div>
            </div>
        )
    }

    renderAccountItems(){
        const menu = this.state.menu;
        return (
            <ul className="accountItems">
            {
                menu.map((item,index)=>{
                    let link =item.link||'';
                    let cl = index===0?<span className="btn btnPrimary accountItemCopy" onClick={(e)=>this.handCopyClick(this.state.shop_url,e)} >Copy Link</span>:null;

                    //设置应用消息条数
                    if(item.icon === 'message'){
                        this.setBadgeNumber(item.message_num);
                    }

                    return (
                        <li key={item.id}>
                            <Link to={link} onClick={(e)=>this.handMenuClick(e, item)}>
                                <span className="accountItemCon">
                                    <span className={["iconfont","icon-"+item.icon].join(' ')}>
                                    {
                                        item.icon === 'message' && item.message_num > 0 ? <b>{item.message_num}</b>: null
                                    }
                                    </span>
                                    {item.title} 
                                </span>
                                
                                <span className="accountItemGt">&gt;</span>
                                {cl}
                            </Link>
                        </li>
                    )
                })
            }
                
            </ul>
        )
    }

    renderMyOrder(){
       const evaluate = this.state.evaluate,
        processing = this.state.processing,
        shipped = this.state.shipped,
        unpaid = this.state.unpaid;
        return (
            <div className="accountMyOrderBox accountH5MyOrderBox">
                <div className="accountMyOrderTitle">
                    <span>My Orders</span>
                    <Link to="/user/order/index"> &gt;</Link>
                </div>
                <ul className="accountMyOrderList">
                    <li key={11}>
                        <Link to="/user/order/index" state={{order_status_id: unpaid.id}}>
                            <span className={"iconfont icon-unpaid"}>
                                {
                                    unpaid.order_num>0?<b>{unpaid.order_num}</b>:null
                                }
                            </span>
                            Unpaid
                        </Link>
                    </li>
                    <li key={22}>
                        <Link to="/user/order/index" state={{order_status_id: processing.id}}>
                            <span className={"iconfont icon-processing"}>
                                {
                                    processing.order_num>0?<b>{processing.order_num}</b>:null
                                }
                            </span>
                            Processing
                        </Link>
                    </li>
                    <li key={33}>
                        <Link to="/user/order/index" state={{order_status_id: shipped.id}}>
                            <span className={"iconfont icon-shipped"}>
                                {
                                    shipped.order_num>0?<b>{shipped.order_num}</b>:null
                                }
                            </span>
                            Shipped
                        </Link>
                    </li>
                    <li key={44}>
                        <Link to="/user/order/index" state={{order_status_id: evaluate.id}}>
                            <span className={"iconfont icon-evaluate"}>
                                {
                                    evaluate.order_num>0?<b>{evaluate.order_num}</b>:null
                                }
                            </span>
                            Evaluate
                        </Link>
                    </li>
                    {/*<li key={55}>
                        <Link to="/" onClick={(e)=>this.handMenuClick(e)}>
                            <span className={"iconfont icon-cart"}>
                                <b>55</b>
                            </span>
                            Returned
                        </Link>
                    </li>*/}
                </ul>
            </div>
        )
    }
    renderH5Item(){
        const msg_num = this.state.msg_num;
        msg_num && this.setBadgeNumber(msg_num);
        
        return (
            <ul className="accountH5Items">
                <li key={1}>
                    <Link to={'/user/address'}>
                        <span className="accountItemCon">
                            <span className={"iconfont icon-ship"} style={{'fontSize': '18px'}}>
                            </span>
                            Delivered Address 
                        </span>
                        <span className="accountItemGt">&gt;</span>
                    </Link>
                </li>
                <li>
                    <Link to={'/user/notification'}>
                        <span className="accountItemCon">
                            <span className={"iconfont icon-message"}>
                                {
                                    msg_num > 0 ? <b>{msg_num}</b>: null
                                }
                            </span>
                            Notifications 
                        </span>
                        <span className="accountItemGt">&gt;</span>
                    </Link>
                </li>
                <li>
                    <Link to={'/user/settings'}>
                        <span className="accountItemCon">
                            <span className={"iconfont icon-setting"}>
                            </span>
                            Settings 
                        </span>
                        <span className="accountItemGt">&gt;</span>
                    </Link>
                </li>
            </ul>
        )
    }
    commissionLayer(){
        const commission = this.state.commission;
        let levels = commission.levels;
        return (
            <div className={'commLayerBox ' + (this.state.showCommLayer && 'show')}>
                <div className="coverLayer" onClick={() => this.hideCommLayer()}></div>
                <div className='commLayer'>
                    <a className="closeBtn" href="javascript:void(0)" onClick={() => this.hideCommLayer()}>X</a>
                    <img src={tc_title} className="headerImg" />
                    <div className="tableBox">
                        <div className="tableHeader">
                            <div className="tTd">
                                Grade
                            </div>
                            <div className="tTd">
                                Weekly sales/<br /> Reference
                            </div>
                            <div className="tTd perTd">
                                Bouns
                            </div>
                        </div>
                        <div className="tableBody">
                            {
                                levels && levels.map((litem, index)=>{
                                    return (
                                        <div className="tTr" key={index}>
                                            <div className="tTd">
                                                {litem.name}
                                            </div>
                                            <div className="tTd">
                                                {litem.sales_amount}/{litem.invite_number}
                                            </div>
                                            <div className="tTd perTd">
                                                <span className="per">{litem.rate}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="tips">
                    your level can be upgrade by both reference <br />and reselling
                    </div>
                </div>
            </div>
        )
    }
	render() {
        let templete = window.IsDApp ? 
            <Layout header={<HeaderComponent 
                onBlurHandle={this.onBlurHandle.bind(this)} 
                changeHandle={this.nicknameChangeHandle.bind(this)} 
                editHandleClick={this.editHandleClick.bind(this)}
                uploadHandle={this.uploadHandle.bind(this)}
                onFileChangeHandle={this.onFileChangeHandle.bind(this)}
                handCopyClick={this.handCopyClick.bind(this)}
                isEdit={this.state.isEdit} nickname={this.state.nickname} info={this.state.customer_info}/>} current_route='account'>
                {this.renderAccountInfo()}
                {this.renderAccountBanner()}
                {this.renderAccountSalesPer()}
                {this.renderAccountItems()}
                {this.commissionLayer()}
            </Layout>
            :
            <Layout header={<H5HeaderComponent 
                onBlurHandle={this.onBlurHandle.bind(this)} 
                changeHandle={this.nicknameChangeHandle.bind(this)} 
                editHandleClick={this.editHandleClick.bind(this)} 
                uploadHandle={this.uploadHandle.bind(this)}
                onFileChangeHandle={this.onFileChangeHandle.bind(this)}
                isEdit={this.state.isEdit} nickname={this.state.nickname} info={this.state.customer_info}/>} current_route='account'>
                {this.renderMyOrder()}
                {this.renderH5Item()}
            </Layout>
        return(
            templete
        )
	}
}

export default loginHoc(Home);