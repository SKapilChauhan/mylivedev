import React, { Component } from 'react';

//找不到
class NotStoreFound  extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header: ''
        };
        if(document.title === ''){
            document.title = 'NotFound'; 
        }
    };

	render() {
        return(
            <div className="noResults">
                <div className="resultImg">
                    <span className="noResultImage"></span>
                </div>
                <div className="resultContent">
                    <p>
                    {
                        (this.props && this.props.tip) || 'Looks like we cannot find any results'
                    }
                    </p>
                </div>
            </div>
        )
	}
}

export default NotStoreFound;