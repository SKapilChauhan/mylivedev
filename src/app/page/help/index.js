import React, { Component } from 'react';
import HttpUtils from 'appSrcs/utils/http';
import Layout from "../layout/layout";
import { Link, CacheLink, Control } from 'react-keeper';
import { LazyLoadImage } from 'react-lazy-load-image-component';
/*import { Player } from 'video-react';*/
/*import "../../../../node_modules/video-react/dist/video-react.css";*/
import Tab from '../component/tab/index';
import './index.css';

//头部组件
function HeaderComponent(props){
    return (
        <div className="mobileHeader">
            <div className="mobileHeaderBox clearfix">
                <div className="mobileHeaderTitle" style={{'textAlign' : 'left','fontWeight':'bold'}}>
                    <div className="name">{props.title}</div>
                </div>
                <Link to="/cart" className="headerCart"><span className="iconfont icon-cart"></span></Link>
            </div>
        </div>
    );
}

function ConnectUsComponent(props){
    return (
        <div className="helpConnectUs">
            <p>phone number: <a href={"tel:" + props.tel}>{props.tel}</a> </p>
            {/*<p>Share links: <a href="https://www.shogee.com" target="_blank">www.shogee.com</a> </p>*/}
            <p>E-mails: {props.email}</p>
            <p>Support Time are from 9am--6pm</p>
        </div>
    )
}
//https://media.w3.org/2010/05/sintel/trailer_hd.mp4
function VideoComponet(props){
    return (
        <div className="helpVideoBox">
            <p>{props.title}</p>
            {/*<video controls preload="auto" width="100%" src={props.url}>
                <source src={props.src} type='video/mp4' />
            </video>*/}
            {/*<Player>
              <source src={'https://www.youtube.com/embed/xjS6SftYQaQ'} />
            </Player>*/}
            <iframe src={props.src} frameBorder="1" width="100%" height="auto" allowfullscreen="true"></iframe>
        </div>
    )
}

function VideoList(props){
    return (
        <div>
        {
            props.list ?  props.list.map((item,index)=>{
                return <VideoComponet key={index} src={item.link} title={item.title}/>
            }) : null
        }
        </div>
    )
}

function FaqList(props){
    return (
        <dl className="helpFaqList">
        {
            props.list ? props.list.map((item,index)=>{
                return (
                    <React.Fragment key={index}>
                    <dt>{item.title}</dt>
                    {
                        item.list ? item.list.map((_item,_index)=>{
                            return (
                                <dd key={_index}>
                                    <Link to={_item.href} >{_item.title}</Link>
                                </dd>
                            )
                        }) : null
                    } 
                    </React.Fragment>
                    
                )
            }) : null
        }
        </dl>
    )
}
//帮助页
class Help extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tel : '',
            tabs : ['Video','FAQ'],
            contents : ['','']
        };
        this.title = document.title = 'Help';
    };
    goBack(){
        window.history.back();
    }
    //页面加载完成调用
    componentDidMount() {
        this.getAsyncData();
    }

    getAsyncData(){
        let url = '/api.php?route=help/index';
        HttpUtils.getShareUrl(url, {})
        .then((responseData) => {
            if(typeof responseData.data !== 'undefined'){
                let result_data = responseData.data;
                let contents = [<VideoList list={result_data.videos} />,<FaqList list={result_data.informations}/>]
                this.setState({
                    contents : contents,
                    tel : result_data.tel,
                    email: result_data.email
                });
            }
        }).catch(ex => {
            console.error('ERROR')
        });
    }

    renderContent(){
        return (
            <div className="accountHelpBox">
                <ConnectUsComponent tel={this.state.tel} email={this.state.email}/>
                <Tab tabs={this.state.tabs} contents={this.state.contents}/>
            </div>
        )
    }

    render() {
        return(
            <Layout header={<HeaderComponent goBack={()=>this.goBack()} title={this.title}/>} current_route="help">
                {this.renderContent()}
            </Layout>  
        )
    }
}

export default Help;