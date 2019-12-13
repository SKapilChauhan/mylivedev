import React, { Component } from 'react';

//找不到
class NotFound  extends Component {

    constructor(props) {
        super(props);
        this.state = {
            header: ''
        };
        if(document.title === ''){
            document.title = 'NotFound'; 
        }
    };

    onBack(){
        window.history.go(-1);
    }

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
                <div className="controlGroup">
                    <input type="button" className="btn btnPrimary"  onClick={() => this.onBack()}  value="Back" />
                </div>
            </div>
        )
	}
}

export default NotFound;