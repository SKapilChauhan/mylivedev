export default class cache{
    //设置cookie
    static setCookie = function (c_name, value, minute) {
        var exdate = new Date();
        //var domain = document.domain;
        exdate.setTime(exdate.getTime() + minute * 60000);
        document.cookie = c_name + "=" + escape(value) +
            ((minute === null) ? "" : ";expires=" + exdate.toGMTString());
    };
    //获取cookie
    static getCookie = function (cname) {
        if (document.cookie.length > 0) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++)  {
                var c = ca[i].trim();
                if (c.indexOf(name)==0) return c.substring(name.length,c.length);
            }
            return "";
        }
        return "";
    };
    //设置cookie
    static removeCookie = function (c_name) {
        this.setCookie(c_name, '', -1);
    };
    //设置本地缓存
    static setLocalStorage = function(key, value){
        try{
            var storage = window.localStorage;
            if(!storage){
                return false;
            } 
            storage.setItem(key, value);
            return true;
        } catch(e) {
            return false;
        }
    };
    //获取本地缓存
    static getLocalStorage = function(key){
        try{
            var storage = window.localStorage;
            if(!storage){
                return null;
            } 
            return storage.getItem(key);
        } catch(e) {
            return null;
        }
    };
    //删除本地缓存项
    static removeLocalStorage = function(key){
        try{
            var storage = window.localStorage;
            if(!storage){
                return false;
            } 
            storage.removeItem(key);
            return true;
        } catch(e) {
            return false;
        }
    };
    //获取缓存
    static cacheGet = function(key){
        var cache_data = this.getLocalStorage(key);
        if(cache_data == null){
            cache_data = this.getCookie(key);
        }
        return cache_data;
    };
    //设置缓存
    static cachePut = function(key, value){
        var set_flag = this.setLocalStorage(key, value);
        if(!set_flag){
            this.setCookie(key, value);
        }
        return true;
    };
    //删除缓存
    static cacheRemove = function(key){
        var remove_flag = this.removeLocalStorage(key);
        if(!remove_flag){
            this.setCookie(key, '');
        }
        return true;
    };
}
