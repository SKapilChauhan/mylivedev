// component/hearder
import React, { Component } from 'react';
import './index.css';

class Model extends Component {

	constructor(props) {
		super(props);
		this.state = {
			visible : true
		};
	}

	render() {
		if(this.state.visible){
			return (
				<div className="modal-wrapper">
					<div className="modal">
						<div className="modal-content">
							{this.props.children}
						</div>
					</div>
					<div className="modal-layer" onClick={() => this.closeModal()}></div>
	            </div>
            );
		} else {
			return null;
		}
	}

	openModal() {
        this.setState({visible: true});
    }

    afterOpenModal() {
        
    }

    closeModal() {
        this.setState({visible: false});
    }
}

export default Model;