import React, {Component} from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../../layout/layout";
import Share from 'appSrcs/utils/share';
import Toast from "appSrcs/component/toast/index";
import copy from 'copy-to-clipboard';
import './index.css';
//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader">
            <div className="mobileHeaderBox clearfix">
                <span className="backBox" onClick={props.goBack}><span className="iconfont icon-left"></span></span>
                <div className="mobileHeaderTitle" style={{'textAlign':'center'}}>
                    <div className="name">Refer and Earn</div>
                </div>
            </div>
        </div>
    );
}


export default class ReferEarn extends Component{
	constructor(props) {
	  super(props);
	
	  this.state = {
	  		banner : '',
	  		code : '',
            image : [],
            shareUrl :'',
            content : '',
            title : '',
            nick:'',
	  };
	}

	componentDidMount(){
		this.getData();
	}

	getData(){
		let url = '/api.php?route=share';
        HttpUtils.get(url, {})
        .then((responseData) => {
            const data = responseData.data;
            if(data){  
                this.setState({
                	banner : data.banner,
                    code : data.code,
                    image : data.image,
                    shareUrl :data.url,
                    content : data.content,
                    title : data.title,
                    nick : data.name,
                });
            }
        }).catch(ex => {
            console.error('ERROR')
        });
	}

	goBack(){
        window.history.back();
    }
    shareWhatsApp(){
    	const shareUrl = '';
        const des = 'Hi, ['+this.state.nick+'] has invited you to join their reseller network. Welcome to the family! 👏🎊👏 \n\n'+
                    'Start your own online business with zero investment 😳😳 and earn up to Rs 30,000/- working from home. 😍💰💰😍 \n\n'+
                    'Hurry! limited time offer. 🔔🐎❗\n\n'+
                    'Referral Code:['+this.state.code+']\n\n'+
                    '➡ Click link to signup NOW: ['+this.state.shareUrl+']  ⬅';
        if(window.plus){
           Share.init({
                type : 'whatsapp',//whatsapp fackbook
                images : [],
                description : des,
                url : ''
            },window.plus); 
       }else {
           window.open("whatsapp://send?text="+des+"&via=lopscoop");
       }
        
    }
    shareOhters(){
        const des = 'Hi, ['+this.state.nick+']has invited you to join their reseller network. Welcome to the family! \n\n'+

                    'Start your own online business with zero investment and earn up to Rs 30,000 /- working from home. \n\n'+

                    'Hurry! limited time offer. \n\n'+
                    'Referral Code:['+this.state.code+']\n\n'+
                    'Click link to signup NOW: ['+this.state.shareUrl+'] ';
        //copy(des);
        Share.showMenu(window.plus,{
            type : '',//whatsapp fackbook,whatsapp
            images : [],
            description : des,
            url : '',
        });
    }
	renderContent(){
		let code = this.state.code,
			banner = this.state.banner,
	        image = this.state.image,
	        content = this.state.content,
            title = this.state.title,
	        shareUrl =this.state.shareUrl;
		return (
			<div className="accountReferBox">
				<img src={banner}/>
				<div className="shareBox">
					<span style={{'display':'inline-block'}}>Share links:</span><b>{shareUrl}</b><br/>
					Referral Code:<b>{code}</b>
				</div>
				<ul>
					<li onClick={(e)=>{Share.copyToClip(window.plus,'Share links:'+shareUrl+'\nReferral Code:'+code);Toast.message({title:"Copy Success"});}}>
						<div>
							<span className="iconfont icon-copy"></span>
						</div>
						Copy
					</li>
					<li onClick={this.shareOhters.bind(this)}>
						<div>
							<span className="iconfont icon-share"></span>
						</div>
						Share
					</li>
					<li className="whatAppBox"  onClick={this.shareWhatsApp.bind(this)}>
						<div>
							<span className="iconfont icon-copy"></span>
						</div>
						Share on Whatsapp
					</li>
				</ul>
                <div style={{margin: '0.4rem 0.24rem'}}>
                    <h4 style={{textAlign : 'center'}}>Invite more possibilities<br/>You will never know who will surprise you</h4><br/>
                    <p>With the Refer &amp; Earn program, you can refer your friends and family to become Shogee resellers and earn a commission on their every sale for 24 months.</p>
                </div>
               
				{
					image.map((item,index)=>{
						return <img key={index} src={item} alt='' />
					})
				}
			</div>
		)
	}

	render(){
		return (
			<Layout header={<HeaderComponent goBack={()=>this.goBack()} title={this.title}/>}>
				{this.renderContent()}
			</Layout>
		)
	}
}