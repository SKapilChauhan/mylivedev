import React, { Component } from 'react';
import './index.css'
class Tab extends Component {
    constructor(props) {
        super(props)
        this.state = {
            current: 0
        }
    }
    handleClick(index) {
        this.setState({ current: index });
        this.props.cb && this.props.cb(index);
    }
    currentClass(index) {
        return this.state.current === index ? 'current' : '';
    }
    contentClass(index) {
        return this.state.current === index ? 'active' : '';
    }

    render() {
        return (
            <div id="outer" >
                <ul id="tab" >
                    { 
                      this.props.tabs.map((val,index) => {
                          return (
                            <li key={index} className={this.currentClass(index)} onClick={(e)=>this.handleClick(index)} >{val}</li>
                          )
                      }) 
                    }
                </ul>
                <div id="content" >
                    { 
                      this.props.contents.map((val,index ) => {
                          return ( 
                            <div key={index} className={this.contentClass(index)} >{val}</div>
                          )
                      })  
                    }
                </div>
          </div>
        )
    }

}

export default Tab;