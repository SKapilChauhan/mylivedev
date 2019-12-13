import cache from './cache';
export default class Language {

	static lanConfig = {};

	//获取当前语言包对象
	static getLangContent(m){
		let lang = this.getLanguage();
		let langObj = {};
		try{
			langObj = require('appSrcs/lang/' + lang + '/' + m);
			if(langObj == null){
				langObj = require('appSrcs/lang/en/' + m);
			}
		} catch(e){

			langObj = require('appSrcs/lang/en/' + m);
		}
		return langObj.default;
	}

	//获取当前语言内容
	static trans(m, key, default_value){
		if(!this.lanConfig[m]){
			this.lanConfig[m] = this.getLangContent(m);
		}
		let lanConfig = this.lanConfig[m];
		if(key == null){
            return null;
        }
        var key_array = key.split(".");
        var value = '';
        if(typeof lanConfig === "object"){
        	for(let k in key_array){
        		let key_value = key_array[k];
        		if(value === '' && typeof lanConfig[key_value] != "undefined"){
                    value = lanConfig[key_value];
                }
                else {
                    if(typeof value[key_value] != "undefined"){
                        value = value[key_value];
                    }
                }
        	}
        }
        if(typeof value !== "string" || value === ""){
            return typeof default_value != "undefined" ? default_value : '';
        }
        return value;
	}

	//获取当前语言
	static getLanguage(){
		let lang = cache.cacheGet('language');
		if(lang == null){
			lang = 'en';
		}
		return lang;
	}
	//设置当前语言
	static setLanguage(lang){
		cache.cachePut('language', lang);
	}
}

export function trans(m, key, default_value){
	return Language.trans(m, key, default_value);
}
