
export default class Swipe {

    static getSlideAngle(dx, dy) { 
        return Math.atan2(dy, dx) * 180 / Math.PI; 
    } 

    //根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动 
    static getSlideDirection(startX, startY, endX, endY) { 
        var dy = endY - startY; 
        var dx = endX - startX; 
        var result = 0;   
        //如果滑动距离太短 
        if(Math.abs(dx) < 2 && Math.abs(dy) < 2) { 
        	return result; 
        } 
        var angle = this.getSlideAngle(dx, dy); 
        if(angle >= -45 && angle < 45) { 
            //向右
        	result = 4; 

        } else if (angle >= 45 && angle < 135) { 
            //向上;
        	result = 1; 

        } else if (angle >= -135 && angle < -45) { 
            //向下
        	result = 2; 

        } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) { 
            //向左
        	result = 3; 
        } 
        return result; 
    } 

    static initSwipe(elem, option){

        var self = this;
        
        //滑动处理 

        var startX, startY; 

        elem.addEventListener('touchstart', function (ev) { 

          startX = ev.touches[0].pageX; 

          startY = ev.touches[0].pageY;   

        }, false); 

        elem.addEventListener('touchend',function (ev) { 

            var endX, endY; 

            endX = ev.changedTouches[0].pageX; 

            endY = ev.changedTouches[0].pageY; 

            var direction = self.getSlideDirection(startX, startY, endX, endY); 

            switch(direction) { 

                case 1: 
                    option.swipeTop && option.swipeTop(ev);
                    break; 
                case 2: 
                    option.swipeBottom && option.swipeBottom(ev);
                    break; 
                case 3: 
                    option.swipeLeft && option.swipeLeft(ev);
                    break; 
                case 4: 
                    option.swipeRight && option.swipeRight(ev);
                    break; 
                default:            
            } 

        }, false);
    }
}


 

 