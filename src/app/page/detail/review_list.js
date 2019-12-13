import React, {Component} from 'react';
//评论列表组件
export default class ReviewListComponent extends Component{
    render(){
        let review_list = this.props.review_list;
        if(!review_list || review_list.length === 0){
            return null;
        }
        return (
            <div>
                <div className="reviewsListBox">
                    <ul>
                        {
                            review_list.map((item, index) => {
                                return (
                                   <li key={index} className="reviewsListItem">
                                        <div className="title">{item['author']}</div>
                                        <div className="star">
                                           {this.ratingStar(item['rating'])}
                                        </div>
                                        <div className="content">
                                            <div dangerouslySetInnerHTML={{__html: item['text']}}></div>
                                        </div>
                                        {
                                            item['images'] && 
                                            <ul className="imgList">
                                            {
                                                item['images'].map((img, ikey) => {
                                                    return (
                                                        <li key={ikey} className="imgListitem">
                                                            <img src={img || ''} alt='' />
                                                        </li>
                                                    )
                                                })
                                            }
                                            </ul>
                                        }
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }

    ratingStar(rating){
        let stars = [1,2,3,4,5];
        return (
            <div>
            {
                stars.map((item, index) => {
                    return (
                        <span key={index} className={'iconfont icon-star ' + (item<=rating ? 'selected' : '')}></span>
                    )
                    
                })
            }
            </div>
        )
    }
}