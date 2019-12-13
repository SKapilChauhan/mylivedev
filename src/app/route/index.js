import React from 'react';
import {Route, Control } from 'react-keeper';
import LoadingComponent from "appSrcs/component/loading";

import Loadable from 'react-loadable';

import {LoginContext} from 'appSrcs/store/context';

//首页
import HomeComponent from '../page/home';

//分类页
import CategoryComponent from '../page/category';

//分类列表
import CategoryViewComponent from '../page/category/view';

//搜索页
import SearchComponent from '../page/search';

//订单
import OrderComponent from '../page/order';

//帮助页
import HelpComponent from '../page/help';

//产品组详情页
import GroupComponent from '../page/group/detail';

//详情页
import DetailComponent from '../page/detail';

//购物车页
import CartComponent from '../page/cart';

//下单页
import CheckoutComponent from '../page/checkout';

//登录
import LoginComponent from '../page/auth/login';

//个人中心主页
import UserIndexComponent from '../page/user/home';

//账号设置页面
import UserSettingsComponent from '../page/user/settings';

//404
import NotFoundComponent from '../page/error/notFound';

//路由登录验证
const loginFilter = (v, callback, props)=> {
   if(!v.isLogin){
       Control.replace("/login", { redirect_link: Control.path, redirect_state: Control.state });
        return;
    } else {
        callback();
    }
}

//404store
const NotStoreFoundComponent = Loadable({
    loader: () => import('../page/error/notStoreFound'),
    loading: () => <LoadingComponent />
});

//活动页
const PromotionComponent = Loadable({
    loader: () => import('../page/promotion'),
    loading: () => <LoadingComponent />
});

//活动页列表
const PromotionViewComponent = Loadable({
    loader: () => import('../page/promotion/view'),
    loading: () => <LoadingComponent />
});

//评论页
const ReviewComponent = Loadable({
    loader: () => import('../page/detail/review'),
    loading: () => <LoadingComponent />
});

//帮助页详情
const HelpDetailComponent = Loadable({
    loader: () => import('../page/help/detail'),
    loading: () => <LoadingComponent />
});

/*账户相关*/

const UserAddressComponent = Loadable({
    loader: () => import('../page/address/index'),
    loading: () => <LoadingComponent />
});

//支付成功
const PaySuccessComponent = Loadable({
    loader: () => import('../page/pay/success'),
    loading: () => <LoadingComponent />
});
//支付失败
const PayFaildComponent = Loadable({
    loader: () => import('../page/pay/faild'),
    loading: () => <LoadingComponent />
});

//订单详情
const OrderDetailComponent = Loadable({
    loader: () => import('../page/order/detail'),
    loading: () => <LoadingComponent />
});

//订单评论
const OrderReviewComponent = Loadable({
    loader: () => import('../page/order/review'),
    loading: () => <LoadingComponent />
});

//订单评论详情
const OrderReviewDetailComponent = Loadable({
    loader: () => import('../page/order/review_detail'),
    loading: () => <LoadingComponent />
});

//订单物流跟踪
const OrderTrackComponent = Loadable({
    loader: () => import('../page/order/track'),
    loading: () => <LoadingComponent />
});

//销售奖金详情
const SaleCommissionListComponent= Loadable({
    loader: () => import('../page/user/commission'),
    loading: () => <LoadingComponent />
});
//销售奖金列表
const SaleCommissionDetailComponent = Loadable({
    loader: () => import('../page/user/commission/detail'),
    loading: () => <LoadingComponent />
});

//通知消息
const NotificationComponent = Loadable({
    loader: () => import('../page/user/notification'),
    loading: () => <LoadingComponent />
});

//分享分销商
const ReferEarnComponent = Loadable({
    loader: () => import('../page/user/referEarn'),
    loading: () => <LoadingComponent />
});

const SubVendors = Loadable({
    loader: () => import('../page/user/subVendors'),
    loading: () => <LoadingComponent />
});

//店铺设置
const shopSettingComponent = Loadable({
    loader: () => import('../page/user/shopSetting'),
    loading: () => <LoadingComponent />
});
//B端店铺即分销商店铺
const BShopComponent = Loadable({
    loader: () => import('../page/store/b'),
    loading: () => <LoadingComponent />
});
//店铺分类加价设置
const CateSetPriceComponent = Loadable({
    loader: () => import('../page/user/shopSetting/cateSetPrice'),
    loading: () => <LoadingComponent />
});
/*账户相关*/

//c端店铺
const CShopComponent = Loadable({
    loader: () => import('../page/store/c'),
    loading: () => <LoadingComponent />
});

//银行卡设置
const MyBankComponent = Loadable({
    loader: () => import('../page/user/myBank'),
    loading: () => <LoadingComponent />
});

//全局路由配置
const RouteConfig = () => (
    <div>
        <Route cache="parent" component={HomeComponent} path='/' />
        <Route exact path='/category/:id' component={CategoryViewComponent} />
        <Route path='/categorys' component={CategoryComponent} />
        <Route path='/promotions' component={PromotionComponent} />
        <Route path='/promotion/:id' component={PromotionViewComponent} />
        <Route path='/search/:keyword' component={SearchComponent} />

        <Route path='/store' component={CShopComponent} />
        
        <Route path='/group/:id' component={GroupComponent} />
        <Route path='/product/:id' component={DetailComponent} />
        <Route path='/reviews/:id' component={ReviewComponent} />

        <Route path='/cart' component={CartComponent} />
        <Route path='/pay/success/:id' component={PaySuccessComponent} />
        <Route path='/pay/failure/:id' component={PayFaildComponent} />
        
        <Route path='/help' component={HelpComponent} />
        <Route path='/helpDetail/:id' component={HelpDetailComponent} />
        <Route path='/login' component={LoginComponent} />

        <LoginContext.Consumer>
            {(v)=>{
                return (
                    <div>
                        <Route path='/checkout' component={CheckoutComponent} enterFilter={(callback, props)=>{loginFilter(v, callback, props)}} />
                        <Route path='/user' component={UserRoute} enterFilter={(callback, props)=>{loginFilter(v, callback, props)}}>
                        </Route>
                    </div>
                )
            }}
        </LoginContext.Consumer>
        <Route miss component={ NotFoundComponent }/>
        <Route path='/4001' component={ NotStoreFoundComponent }/>
    </div>
)

//需要登录的路由，账户管理相关
const UserRoute = () => (
     <div>
        <Route path='/index' component={UserIndexComponent}   />
        <Route path='/settings' component={UserSettingsComponent}  />
        <Route path='/address' component={UserAddressComponent}   />
        <Route path='/commission' component={SaleCommissionListComponent}  />
        <Route path='/commissionDetail/:id' component={SaleCommissionDetailComponent}  />
        <Route path='/notification' component={NotificationComponent}  />
        <Route path='/referEarn' component={ReferEarnComponent}  />
        <Route path='/subVendors' component={SubVendors}  />
        <Route path='/setting' component={shopSettingComponent}  />
        <Route path='/order/index' component={OrderComponent}  />
        <Route path='/order/detail/:id' component={OrderDetailComponent}  />
        <Route path='/order/review/:id' component={OrderReviewComponent}  />
        <Route path='/order/review_detail/:id' component={OrderReviewDetailComponent}  />
        <Route path='/order/track/:id' component={OrderTrackComponent}  />
        <Route path='/store' component={BShopComponent} />
        <Route path='/mybank' component={MyBankComponent} />
        <Route path='/cateSetPrice' component={CateSetPriceComponent} />
    </div>
)


export default RouteConfig