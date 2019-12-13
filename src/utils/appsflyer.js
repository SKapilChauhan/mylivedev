export default class Appsflyer {

	//原生的交互类
	static trackAppClass(){
		if(!this.TrackApp){
			let TrackApp = window.plus.android.importClass("appsflyer.TrackApp");
			this.TrackApp = new TrackApp();
		}
		return this.TrackApp;
	}

	//是否开启跟踪
	static isOpen(){
		let open = process.env.Appsflyer_Open;
		if(open != '1'){
			return false;
		}
		return true;
	}

	//sdk初始化
	static init(){
		let key = process.env.Appsflyer_DEV_KEY;
		if(!this.isOpen()){
			return false;
		}
		try{
			this.trackAppClass().init(key);
		} catch(e){
			
		}
	}

	/**
	 * //跟踪事件
	 * @param  [type] eventname  事件名称
	 * @param  [object] eventvalue 事件名称值
	 * @return null
	 */
	static trackEvent(eventname, eventvalue){
		if(!window.plus){
			return false;
		}
		let open = process.env.Appsflyer_Open;
		if(!this.isOpen()){
			return false;
		}
		try{
			eventvalue = JSON.stringify(eventvalue);
			let r = this.trackAppClass().trackEvent(eventname, eventvalue);
		} catch(e){
			
		}
	}


	/**
	 * getAppsFlyerUID
	 * @return string | null
	 */
	static getAppsFlyerUID(){
		try{
			return this.trackAppClass().getAppsFlyerUID();
		} catch(e){
			return null;
		}
	}

	//登录事件
	static login(login_method){
		this.trackEvent('af_login', {
			af_login_method: login_method
		});
	}

	/**
	 * 注册事件
	 * @param  {[string]} registration_method 注册方法
	 * @return null
	 */
	static signup(registration_method){
		this.trackEvent('af_complete_registration', {
			af_registration_method: registration_method
		});
	}

	/**
	 * //搜索事件
	 * @param  [string] keyword 搜索关键词
	 * @param  [array] product_ids 
	 * @return null
	 */
	static search(keyword){
		this.trackEvent('af_search', {
			af_search_string: keyword
		});
	}

	//列表视图
	static listView(product_ids, type){
		this.trackEvent('af_list_view', {
			af_content_type: type,
			af_content_list: product_ids
		});
	}

	//内容视图
	static contentView(product){
		this.trackEvent('af_content_view', {
			af_price: product['price'],
			af_content_name: product['name'],
			af_content_id: product['product_id'],
			af_content_type: product['category_name'],
			af_currency: product['currency']
		});
	}

	//添加购物车
	static addToCart(product){
		this.trackEvent('af_add_to_cart', {
			af_price: product['price'],
			af_content_name: product['name'],
			af_content_id: product['id'],
			af_content_type: product['category_name'],
			af_currency: product['currency'],
			af_quantity: product['quantity']
		});
	}

	//发起的结账
	static initiatedCheckout(cart){
		this.trackEvent('af_initiated_checkout', {
			af_price: cart['total_price'],
			af_content_id: cart['product_ids'],
			//af_content_type: cart['product_types'],
			af_currency: cart['currency'],
			af_quantity: cart['quantity']
		});
	}

	//购买事件
	static purchaseCheckout(cart){
		this.trackEvent('af_purchase', {
			af_price: cart['total_price'],
			af_content_id: cart['product_ids'],
			//af_content_type: cart['product_types'],
			af_currency: cart['currency'],
			af_quantity: cart['quantity'],
			af_order_id: cart['order_id'],
			af_receipt_id: cart['order_id']
		});
	}

	//已完成购买
	static completedPurchase(order){
		this.trackEvent('completed_purchase', {
			af_revenue: order['total_price'],
			af_order_id: order['order_id'],
			af_receipt_id: order['order_id'],
			af_currency: order['currency']
		});
	}

	//从购物车移除
	static removeFromCart(product){
		this.trackEvent('remove_from_cart', {
			af_content_id: product['product_id'],
			//af_content_type: product['type']
		});
	}

	//首次购买
	static firstPurchase(order){
		this.trackEvent('first_purchase', {
			af_price: order['total_price'],
			af_content_id: order['product_ids'],
			//af_content_type: order['product_types'],
			af_currency: order['currency'],
			af_quantity: order['quantity'],
			af_order_id: order['order_id'],
			af_receipt_id: order['order_id']
		});
	}

	//首次购买
	static firstPurchase(order){
		this.trackEvent('first_purchase', {
			af_price: order['total_price'],
			af_content_id: order['product_ids'],
			//af_content_type: order['product_types'],
			af_currency: order['currency'],
			af_quantity: order['quantity'],
			af_order_id: order['order_id'],
			af_receipt_id: order['order_id']
		});
	}
	
	//分享
	static share(share_data){
		this.trackEvent('af_share', {
			url: share_data['url'],
			platform: share_data['platform'],
		});
	}
}