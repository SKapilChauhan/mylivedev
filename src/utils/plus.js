//请求地址
const host = window.location.protocol + "//" + window.location.hostname +":" +  window.location.port;

export default class PlusUtils {

	static uploadFile(url, name){
		
		return new Promise((resolve,reject)=>{
			try{
				window.plus.gallery.pick(function(path) {
					let requestUrl = host + url;
		            var task = window.plus.uploader.createUpload(requestUrl, {method:"POST", blocksize:0}, function(upload, status){
		                if (upload.state == 4 && status == 200 ) {  
		                    window.plus.uploader.clear();  //清除上传
		                    let responseText = JSON.parse(upload.responseText);
		                    resolve(responseText);
		                }  
		            });
		            task.addFile(path, {
		                key: name
		            });
		            task.start();
	       	 	});
			} catch(e){
				reject(e);
			}
		});
	}
}