"use strict";

var React = require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var ReactDOM = require('react-dom');
var util = require('dom-find');

var StickyDiv = createReactClass({
    displayName:"StickyDiv",
    propTypes: {
        offsetTop: PropTypes.number,
        zIndex: PropTypes.number,
        className: PropTypes.string
    },
    getDefaultProps: function() {
        return {
            offsetTop: 0,
            className: '',
            zIndex: 9999
        };
    },
    getInitialState : function(){
        return {
            fix: false,
            width: null
        };
    },
    handleResize : function(){
        this.checkWidth();
        this.checkPositions();
    },
    onScroll: function () {
        this.checkWidth();
        this.checkPositions();
    },
    checkPositions: function(){
        var pos = util.findPosRelativeToViewport(ReactDOM.findDOMNode(this));

        if (pos[1]<=this.props.offsetTop){
            this.setState({fix: true});
        } else {
            this.setState({fix: false});
        }
    },
    checkWidth: function () {
        var width = null;
        if (this.refs.duplicate) {
            width = this.refs.duplicate.getBoundingClientRect().width;
        } else {
            width = this.refs.original.getBoundingClientRect().width;
        }
        if (this.state.width !== width) {
            this.setState({
                width: width
            });
        }
    },
    componentDidMount: function () {
        window.addEventListener('scroll', this.onScroll, false);
        window.addEventListener('resize', this.handleResize);
        this.checkWidth();
    },
    componentWillUnmount: function () {
      window.removeEventListener('scroll', this.onScroll, false);
      window.removeEventListener('resize', this.handleResize);
    },
    render: function () {
        var divStyle;

        if (this.state.fix) {
            divStyle = {
                display: 'block',
                position: 'fixed',
                width: this.state.width ? (this.state.width + 'px') : null,
                top: this.props.offsetTop
            };
            return <div style={{zIndex : this.props.zIndex, position:'relative', width:'100%'}}>
                <div ref='duplicate' key='duplicate' style={{visibility:'hidden'}}>
            {this.props.children}
                </div>
                <div ref='original' key='original' className={this.props.className} style={divStyle} >
            {this.props.children}
                </div>
            </div>;
        }
        else {
            divStyle = {
                display: 'block',
                position: 'relative'
            };
            return <div style={{zIndex : this.props.zIndex, position:'relative', width:'100%'}}>
                <div ref='original' key='original' style={divStyle}>
          {this.props.children}
                </div>
            </div>;
        }
    }
});

module.exports = StickyDiv;
