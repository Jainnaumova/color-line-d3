import React, { Component, createRef } from 'react';
import App from './App'

import "./App.css";

export default class AppWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dimensions: {
        width: null,
        height: null,
        offsetLeft: null
      },
    }
      this.handleResize = this.handleResize.bind(this)
      this.appWrapper = createRef()
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleResize)
      const dimensions = {...this.state.dimensions};
      console.log('this.appwrapper ', this.appWrapper)
      dimensions.offsetLeft = this.appWrapper.current.offsetLeft;
      this.setState({ dimensions });
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize)
    }

    handleResize() {
      const dimensions = {
        width: this.appWrapper.current.clientWidth,
        height: this.appWrapper.current.clientHeight,
        offsetLeft: this.appWrapper.current.offsetLeft
      }
      this.setState({ dimensions });
    }

    render() {
      // console.log('STATE', this.state);
      return (
        <div className='main'>
          <div ref={this.appWrapper} className='appWrapper'>
            <App dimensions={this.state.dimensions} />
          </div>
        </div>
      )
    }
}
