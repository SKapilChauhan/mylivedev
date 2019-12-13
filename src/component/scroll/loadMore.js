import React from 'react'

class LoadMore extends React.Component {
    render() {
        return (
            <div className="load-more" ref="wrapper">
                {
                    //如果正在加载中就显示加载中。不是就显示加载更多的按钮
                    this.props.isLoadingMore ? <div className="loadering"></div> : ''
                }
            </div>
        );
    }

    //执行回调
    loadMoreHandle() {
        // 执行传输过来的
        this.props.loadMoreFn();
    }

    //下拉加载更多的方法
    componentDidMount() {
        // 使用滚动时自动加载更多
        const loadMoreFn = this.props.loadMoreFn;
        const wrapper = this.refs.wrapper;
        let timeoutId;
        function callback() {
            const top = wrapper.getBoundingClientRect().top;
            const windowHeight = window.screen.height;
            if (top && top < windowHeight + 20) {
                // 证明 wrapper 已经被滚动到暴露在页面可视范围之内了
                loadMoreFn();
            }
        }
        window.setTimeout(()=>{
            const ele = (this.props.scrollEle &&this.props.scrollEle.current) || window;
            ele.addEventListener('scroll', function () {
                if (this.props.isLoadingMore) {
                    return;
                }
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(callback, 50);
            }.bind(this), false);
        },0)
        
    }
}

export default LoadMore
