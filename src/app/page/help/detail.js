import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import { Link } from 'react-keeper';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Tab from '../component/tab/index';
import './index.css';

//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader">
            <div className="mobileHeaderBox clearfix">
                <span className="backBox" onClick={props.goBack}><span className="iconfont icon-left"></span></span>
                <div className="mobileHeaderTitle" style={{'textAlign' : 'center','fontWeight':'bold'}}>
                    <div className="name" dangerouslySetInnerHTML={{ __html: props.title }}></div>
                </div>
                <span className="headerCart"><Link to='/cart'><span className="iconfont icon-cart"></span></Link></span>
            </div>
        </div>
        
    );
}


//帮助页
class HelpDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            content : '',
            title : '',
        };
        //this.title = document.title = 'detail';
        this.id = this.props.params.id || null;
        
    };
    goBack(){
        window.history.back();
    }
    //页面加载完成调用
    componentDidMount() {
        this.getAsyncData();
    }

    getAsyncData(){
        let url = '/api.php?route=help/detail&id='+this.id;
        HttpUtils.get(url, {})
        .then((responseData) => {
            if(typeof responseData.data !== 'undefined'){
                this.setState({
                    content : responseData.data.description,
                    title : responseData.data.title
                });
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }

    renderContent(){
        return (
            222
        )
    }

    render() {
        return(
            <Layout header={<HeaderComponent goBack={()=>this.goBack()} title={this.state.title}/>} current_route="help">
            <div style={{'padding':'0.25rem'}} dangerouslySetInnerHTML={{ __html: this.state.content }}></div>
            </Layout>  
        )
    }
}

export default HelpDetail;