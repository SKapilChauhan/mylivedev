import React, {Component} from 'react';
import HttpUtils from 'appSrcs/utils/http';
import PlusUtils from 'appSrcs/utils/plus';
import Layout from "../../layout/layout";
import SimpleReactValidator from 'simple-react-validator';
import Toast from "appSrcs/component/toast/index";
import './index.css';
import bankSet from "appSrcs/static/images/bankSet.png";

//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader">
            <div className="mobileHeaderBox clearfix">
                <span className="backBox" onClick={props.goBack}><span className="iconfont icon-left"></span></span>
                <div className="mobileHeaderTitle" style={{'textAlign':'center'}}>
                    <div className="name">My Bank Details</div>
                </div>
            </div>
        </div>
    );
}

function FooterComponent(){
	return null;
}

export default class BankSet extends Component{
	constructor(props) {
	 	super(props);
		this.state = {
		  	accountNumber: "",
		  	confirmAccountNumber: "",
			accountHolderName: "",
			ifscCode: "",
			accountIdCard: "",
			card_img : bankSet,
		};
		document.title = 'My Bank Details';
        this.validator = new SimpleReactValidator({
            element: (message, className) => <div className='errormsg'>{message}</div>
        });
	}
	componentDidMount(){
		this.loadBankInfo();
	}
	loadBankInfo(){
		Toast.showLoading();
        let url = '/api.php?route=account/bankcard';
        HttpUtils.get(url, {})
        .then((responseData) => {
            Toast.hideLoading();
            if(responseData.code === '0000' && responseData.data){
            	const data = responseData.data;
                this.setState({
					accountNumber: data.card_no,
				  	confirmAccountNumber: data.card_no,
					accountHolderName: data.vendor_name,
					ifscCode: data.ifsc_code,
					accountIdCard: data.vendor_idno,
					card_img : data.card_img || this.state.card_img,
				});
            }
            
        }).catch(ex => {
            console.error('ERROR')
        });
	}
	goBack(){
        window.history.back();
    }
    onBlurHandle(event){
    	const target = event.target;
    	target.parentNode.classList.remove('focus');
    }
    onFocusHandle(event){
    	const target = event.target
    		,lineBoxDoms = document.getElementsByClassName('lineBox');
    	/*[...lineBoxDoms].forEach((item,index)=>{
    		item.classList.remove('focus');
    	});*/
    	
    	target.parentNode.classList.add('focus');
    }
    handleSubmit(event) {
    	event.preventDefault();
	    if (!this.validator.allValid()) {
            this.validator.showMessages();
            this.forceUpdate();
            return;
        }

        if(this.state.accountNumber != this.state.confirmAccountNumber){
        	Toast.danger({text:'Confirm account number and account number do not match',duration:2000});
        	return;
        }

        Toast.showLoading();
        let url = '/api.php?route=account/bankcard';
        let param = {
        	accountNumber: this.state.accountNumber,
		  	confirmAccountNumber: this.state.confirmAccountNumber,
			accountHolderName: this.state.accountHolderName,
			ifscCode: this.state.ifscCode,
			accountIdCard: this.state.accountIdCard,
        }
        HttpUtils.post(url, param)
        .then((responseData) => {
            Toast.hideLoading();
            if(responseData.code === '0000'){
                Toast.success();
            }
            
        }).catch(ex => {
            console.error('ERROR')
        });

	}
	handleInputChange(event){
		const target = event.target;
		const name = target.name
			,value = target.value;
		this.setState({
			[name] : value,
		});
	}
	//上传图片
	onFileChangeHandle(event){
		const target = event.target;
		var oData = new FormData(document.getElementById('uploadPhotoForm'));
		Toast.showLoading();
        HttpUtils.post('/api.php?route=account/bankcard/uploadImg',oData,true)
        .then((responseData)=>{
            Toast.hideLoading();
            if(responseData.code === '0000' && responseData.data){
                document.getElementById('card_img').src = responseData.data.card_img;
            }
        }).catch(error=>{
            console.log('error:' + error);
        });
	}
	uploadHandle(){
		if(window.plus){
			this.createBankImageUpload();
		} else {
			document.getElementById('file').click();
		}
		
	}
	// app创建上传任务
    createBankImageUpload() {
        PlusUtils.uploadFile("/api.php?route=account/bankcard/uploadImg", "file")
        .then(function(responseData){
            if(responseData.code === '0000' && responseData.data){
                document.getElementById('card_img').src = responseData.data.card_img;
            }
        });
    }
	renderContent(){
		return (
			<React.Fragment>
					<form method="post" id="uploadPhotoForm" encType ="multipart/form-data" className="uploadPhotoForm">
						<input id="file" name="file" accept="image/*" type="file" onChange={this.onFileChangeHandle.bind(this)}/>
					</form>
			<form className="bankSetForm" onSubmit={this.handleSubmit.bind(this)}>
				<div className="uploadPhotoBox">
					<img src={this.state.card_img} id="card_img" onClick={this.uploadHandle.bind(this)} alt='' />
				</div>
				<div className="lineBox focus">
					<label>Account Number</label>
					<input type="text" name="accountNumber" value={this.state.accountNumber} onBlur={this.onBlurHandle.bind(this)} onChange={this.handleInputChange.bind(this)} onFocus={this.onFocusHandle.bind(this)}/>
					{this.validator.message('accountNumber', this.state.accountNumber, 'required')}
				</div>
				<div className="lineBox">
					<label>Confirm Account Number</label>
					<input type="text" name="confirmAccountNumber" value={this.state.confirmAccountNumber} onBlur={this.onBlurHandle.bind(this)} onChange={this.handleInputChange.bind(this)} onFocus={this.onFocusHandle.bind(this)}/>
					{this.validator.message('confirmAccountNumber', this.state.confirmAccountNumber, 'required')}
				</div>
				<div className="lineBox">
					<label>Account Holder'name</label>
					<input type="text" name="accountHolderName" value={this.state.accountHolderName} onBlur={this.onBlurHandle.bind(this)} onChange={this.handleInputChange.bind(this)} onFocus={this.onFocusHandle.bind(this)}/>
					{this.validator.message('accountHolderName', this.state.accountHolderName, 'required')}
				</div>
				<div className="lineBox">
					<label>Ifsc Code</label>
					<input type="text" name="ifscCode" value={this.state.ifscCode} onBlur={this.onBlurHandle.bind(this)} onChange={this.handleInputChange.bind(this)} onFocus={this.onFocusHandle.bind(this)}/>
					{this.validator.message('ifscCode', this.state.ifscCode, 'required')}
				</div>
				<div className="lineBox">
					<label>Adhaar card number</label>
					<input type="text" name="accountIdCard" value={this.state.accountIdCard} onBlur={this.onBlurHandle.bind(this)} onChange={this.handleInputChange.bind(this)} onFocus={this.onFocusHandle.bind(this)}/>
					{this.validator.message('accountIdCard', this.state.accountIdCard, 'required')}
				</div>
				<input type="submit" value="Submit" className="submitBtn"/>
			</form>
			</React.Fragment>
		)
	}

	render(){
		return (
			<Layout 
			header={<HeaderComponent goBack={()=>this.goBack()} title={this.title}/>}
			footer={<FooterComponent/>}
			>
				{this.renderContent()}
				
			</Layout>
		)
	}
}