import Toast from "appSrcs/component/toast/index";
import HttpUtils from 'appSrcs/utils/http';
import Appsflyer from "appSrcs/utils/appsflyer";
export default class Share {
	static getPackage(shareType){
		const type = shareType;
		let _package = ''
		switch (type) {
			case 'whatsapp':
				_package = 'com.whatsapp';
				break;
			case 'facebook':
				_package = 'com.facebook.katana';
				break;
			case 'telegram':
				_package = 'org.telegram.messenger';
				break;
			case 'instagram':
				_package = 'com.instagram.android';
				break;
		}
		return _package;
	}
	static isInstalledApp(pkgname,plus) { 
		Toast.showLoading(); 
        plus.android.importClass('java.util.ArrayList');  
        plus.android.importClass('android.content.pm.PackageInfo');  
        plus.android.importClass('android.content.pm.PackageManager');  
        var MainActivity = plus.android.runtimeMainActivity();  
        var PackageManager = MainActivity.getPackageManager();  
        var pinfo = plus.android.invoke(PackageManager, 'getLaunchIntentForPackage', pkgname) 
        Toast.hideLoading(); 
        return pinfo != null;  
    } 
	//{type:'whatsapp',images:['aa.jpg','bb.jpg'],description:'xxxx'}
	static init(shareObj,plus){
		if(!navigator.userAgent.match(/Html5Plus/i)) {
			console.log('Not app');
	        //非5+引擎环境，直接return;  
	        return;  
	    }
	    
		if(!shareObj || !shareObj.type){ 
			console.log('Share param error');
			return;
		}
		const shareType = shareObj.type
			, images = shareObj.images
			, description = shareObj.description
			, url = shareObj.url
		const _package = this.getPackage(shareType);
		//复制剪切板
		this.copyToClip(plus,description+' '+url);
		
		let Intent = plus.android.importClass("android.content.Intent")
			, ArrayList = plus.android.importClass('java.util.ArrayList')
			, Uri = plus.android.importClass('android.net.Uri')
			, Environment = plus.android.importClass('android.os.Environment')
			, File = plus.android.importClass('java.io.File')
			, sdcardDir = plus.android.invoke(Environment.getExternalStorageDirectory(),'getAbsolutePath');
			var StrictMode = plus.android.importClass("android.os.StrictMode");  
            var Build = plus.android.importClass("android.os.Build"); 
		// 导入后可以使用new方法创建类的实例对象
		let intent=new Intent();
		intent.setAction(Intent.ACTION_SEND);
		//调用分享包
		intent.setPackage(_package);
		
		if(images && images.length){
			intent.setType("image/*"); 
		    let galleryFiles = new ArrayList();
		    for(let i=0;i<images.length;i++){
		    	const item = images[i];
                if(Build.VERSION.SDK_INT >= 24) {
                    var builder = new StrictMode.VmPolicy.Builder();
          			StrictMode.setVmPolicy(builder.build()); 
                } 
				
		    	galleryFiles.add(Uri.fromFile(new File(item)));
		    } 
		    // Add the URI to the Intent.
		    if(shareType == 'instagram'){
		    	intent.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(new File(images[0])));
		    	intent.putExtra(Intent.EXTRA_TEXT, description+url);
		    }else {
		    	intent.setAction("android.intent.action.SEND_MULTIPLE");
		    	intent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, galleryFiles);
		    }
		}else {
			intent.setType("text/plain");
			intent.putExtra(Intent.EXTRA_TEXT, description);
		}
        
		intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
		plus.android.runtimeMainActivity().startActivity(intent);
		try{
			Appsflyer.share({
				platform: shareType,
				url: url
			});
		} catch(e) {

		}
	}

	//产品whatsapp 分享
	static async productShareWhatsapp(shareObj, cb){
		if(!window.plus){
			return false;
		}
		if(!this.isInstalledApp(this.getPackage('whatsapp'),window.plus)){
			//Please download app for sharing platform
			Toast.error({title:"Please download Whatsapp for sharing platform"});
			return;
	    }
        let description = shareObj.description ? shareObj.description : '';
        if(description && description.length > 800){
        	description = description.substring(0, 800) + '...';
        }
        if(shareObj.product_group_id){
        	description = description + ' \n Buy Now:';
        }
        if(shareObj.product_group_id && shareObj['images'].length){
	        let request_data = {
	            product_group_id : shareObj.product_group_id,
	            sns : 'whatsapp'
	        };
	        if(shareObj.product_id){
	        	request_data['product_id'] = shareObj.product_id;
	        }
	        if(shareObj.raise_price && shareObj.raise_price > 0){
	        	request_data['raise_price'] = shareObj.raise_price;
	        }
	        const result = await Share.fecthShareUrl(request_data);
	        const share_url = result.data.share_url;
	        let share_images = shareObj['images'] ? shareObj['images'] : [];
	        this.downLoad(window.plus, share_images,(images)=>{
	            Share.init({
	                type : 'whatsapp',
	                images : images,
	                description : description,
	                url : share_url
	            }, window.plus);
	        });
	        typeof cb == 'function' && cb(result);
        }else {
        	Share.init({
                type : 'whatsapp',
                images : shareObj.images ? shareObj.images : [],
                description : description,
                url : ''
            }, window.plus);
        }
        
	}
	static showMenu(plus,shareObj,cb){
		if(!window.plus ){
			return;
		}
		plus.nativeUI.actionSheet({
			title: 'Share To',
			cancel: "Cancel",
			buttons: [{
				title: "whatsapp"
			}, {
				title: "facebook"
			},{
				title: "instagram"
			}]
		}, async(e)=> {//添加async await
			var index = e.index;
			switch(index) {
				case 1: 
					this.productShareWhatsapp(shareObj,cb);
					break;
				case 2: //分享到facebook
					//share('weixin', msg, callback);
					if(!this.isInstalledApp(this.getPackage('facebook'),plus)){
						//Please download app for sharing platform
						Toast.error({title:"Please download Facebook for sharing platform"});
						return;
				    }
					shareObj.type = 'facebook';
					if(shareObj.product_group_id){
						let request_data = {
				            product_group_id : shareObj.product_group_id,
				            sns : 'facebook'
				        };
				        if(shareObj.product_id){
				        	request_data['product_id'] = shareObj.product_id;
				        }
				        if(shareObj.raise_price && shareObj.raise_price > 0){
				        	request_data['raise_price'] = shareObj.raise_price;
				        }
						const result = await this.fecthShareUrl(request_data);
						const share_url = result.data.share_url;
						if(shareObj.description){
							shareObj.description = shareObj.description + ' \n Buy Now:';
						}
			            this.downLoad(plus,shareObj['images'],(images)=>{
			            	shareObj.images = images;
			            	shareObj.url = share_url;
			            	this.init(shareObj,plus);
			            });
			            cb && cb(result);
					}else {
						this.init(shareObj,plus);
					}
					
					break;
				case 3: //分享到instagram
					if(!this.isInstalledApp(this.getPackage('instagram'),plus)){
						//Please download app for sharing platform
						Toast.error({title:"Please download Instagram for sharing platform"});
						return;
				    }
					shareObj.type = 'instagram';
					if(shareObj.product_group_id){
						let request_data = {
				            product_group_id : shareObj.product_group_id,
				            sns : 'instagram'
				        };
				        if(shareObj.product_id){
				        	request_data['product_id'] = shareObj.product_id;
				        }
				        if(shareObj.raise_price && shareObj.raise_price > 0){
				        	request_data['raise_price'] = shareObj.raise_price;
				        }
						const _result = await this.fecthShareUrl(request_data);
				        const _share_url = _result.data.share_url;
				        if(shareObj.description){
							shareObj.description = shareObj.description + ' \n Buy Now:';
						}
			            this.downLoad(plus,shareObj['images'],(images)=>{
			            	shareObj.images = images;
			            	shareObj.url = _share_url;
			            	this.init(shareObj,plus);
			            });
			            cb && cb(_result);
			        }else {
						this.init(shareObj,plus);
					}
					break;
				case 4: //更多分享
					
					break;
			}
		})
	}
	static downLoad(plus,files,callback){
		if(!window.plus){
			return;
		}
		let l = files.length,i = 0,pics=[];
		Toast.showLoading();
		for(let j =0;j < files.length;j++){
			plus.downloader.createDownload(files[j], {}, function(d, status){
				// 下载完成
				if(status == 200){
					i++;
					//保存到相册
					plus.gallery.save(d.filename, function() {
						//console.log('图片保存==='+i);
						//pics.push(plus.io.convertLocalFileSystemURL(d.filename));
					});
					pics.push(plus.io.convertLocalFileSystemURL(d.filename));
					if(i == l){
						callback && callback(pics);
						Toast.hideLoading();
						//Toast.message({title:"1.图片已经保存到相册<br>2.描述已复制到剪贴板"});
					}
					//alert("Download success: " + d.filename);
				} else {
					Toast.hideLoading();
					Toast.message({title:"Download failed: " + status});
				}
			}).start();
		}
	}
	static fecthShareUrl(param,callback){
		const url = '/api.php?route=share_record/add';
		return HttpUtils.post(url,param)
		
	}
	static copyToClip(plus,txt){
		const Context = plus.android.importClass("android.content.Context");
		const main = plus.android.runtimeMainActivity();
		const clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
		plus.android.invoke(clip,"setText",txt);
		if(!this.description_copy_alert){
			this.description_copy_alert = 0;
		}
		if(this.description_copy_alert <10){
			alert('Content Already Copied');
			this.description_copy_alert ++;
		} else {
			Toast.success({
            	text: 'Content Already Copied',
            	duration: 3000
        	})
		}
	}
}