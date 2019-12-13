
import React, { Component } from 'react';
import './index.css';

class Progress  extends Component {
    render(){
    	this.id = this.props.id ? this.props.id : 'progress';
        return (
            <div id={this.id} className="progressDrag">
			    <div className="bar">
			        <div className="hang"></div>
			        <span className="mask"></span>
			    </div>
			</div>
        );
    }

    componentWillReceiveProps(nextProps){
        let cvalue = nextProps.cvalue;
        let id = this.id;
        // 1. 获取页面标签
        var progress = document.getElementById(id);
        var bar = progress.children[0];
        var hang = bar.children[0];
        var mask = bar.children[1];

        if(cvalue !== ''){
            this.set(bar, mask, hang, cvalue);
        }
    }

    //
    componentDidMount() {
        let cvalue = this.props.cvalue;
        //拖动区域元素
        let progressDropId = this.props.progressDropId;
        let callBack = this.props.callBack;
    	let id = this.id;
        // 1. 获取页面标签
        var progress = document.getElementById(id);
        var progressDropBox = document.getElementById(progressDropId) ? document.getElementById(progressDropId) : progress;
        var bar = progress.children[0];
        var hang = bar.children[0];
        var mask = bar.children[1];

        if(cvalue){
            this.set(bar, mask, hang, cvalue);
        }

        // 2. 监听鼠标拖拽事件
        progressDropBox.onmousedown = function (event) {
            var event = event || window.event;

            // 2.1 求出初始值
            var initial = event.clientX - mask.offsetLeft;

            document.onmousemove = function (event) {
                var event = event || window.event;

                // 2.2 求出走过的距离
                var distanceX = event.clientX - initial;

                // 2.3 处理边界值
                if (distanceX < 0) {
                    distanceX = 0;
                }
                else if (distanceX >= bar.offsetWidth - mask.offsetWidth) {
                    distanceX = bar.offsetWidth - mask.offsetWidth;
                }
                // 2.3 赋值给小按钮
                mask.style.left = distanceX + 'px';
                hang.style.width = distanceX + 'px';
                let c = distanceX / (bar.offsetWidth - mask.offsetWidth);
                // 2.4 算出百分比
                callBack(c);
                return false;

            }
            // 2.5 结束拖拽和移动事件
            document.onmouseup = function () {
                document.onmousemove = null;
                document.onmouseup = null;
            }
            return false;
        }
        progressDropBox.ontouchstart = function(e){
            var ev = e.targetTouches[0];  
            // 2.1 求出初始值
            var initial = ev.clientX - mask.offsetLeft;

            document.ontouchmove = function (event) {
                var event = event.targetTouches[0];

                // 2.2 求出走过的距离
                var distanceX = event.clientX - initial;

                // 2.3 处理边界值
                if (distanceX < 0) {
                    distanceX = 0;
                }
                else if (distanceX >= bar.offsetWidth - mask.offsetWidth) {
                    distanceX = bar.offsetWidth - mask.offsetWidth;
                }
                // 2.3 赋值给小按钮
                mask.style.left = distanceX + 'px';
                hang.style.width = distanceX + 'px';
                let c = distanceX / (bar.offsetWidth - mask.offsetWidth);
                // 2.4 算出百分比
                callBack(c);
                return false;

            }
            // 2.5 结束拖拽和移动事件
            document.ontouchend = function () {
                document.ontouchmove = null;
                document.ontouchend = null;
            }
            return false;
        }
    }

    set(bar, mask, hang, c){
        if(c > 1){
            c = 1;
        }
        let barWidth = bar.offsetWidth - mask.offsetWidth;
        let distanceX = barWidth * c;
        // 2.3 赋值给小按钮
        mask.style.left = distanceX + 'px';
        hang.style.width = distanceX + 'px';
    }

}

export default Progress;