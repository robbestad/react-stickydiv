/** @jsx React.DOM */
"use strict";

var React = require("react");

var SetIntervalMixin = {
    componentWillMount: function() {
        this.intervals = [];
    },
    setInterval: function() {
        this.intervals.push(setInterval.apply(null, arguments));
    },
    componentWillUnmount: function() {
        this.intervals.map(clearInterval);
    }
};

var StickyDiv = React.createClass({
    mixins: [SetIntervalMixin], // Use the mixin
    getInitialState:function(){
        return{
            scrollTop : '0'
        }
    },
    componentDidMount: function() {
        this.setInterval(this.tick, 1); // Call a method on the mixin
        console.table(this.props.children);
    },
    tick: function() {
        var scrollTop = (window.pageYOffset !== undefined) ?
            window.pageYOffset : (document.documentElement ||
            document.body.parentNode || document.body).scrollTop;
            this.setState({scrollTop: scrollTop});
    },
    render: function () {
        var divStyle;
        if(this.state.scrollTop>=this.props.togglepoint){
            divStyle= {
                display: 'block',
                position: 'fixed',
                top: this.props.top+'px',
                height: this.props.height+'px',
                width: this.props.width+"px"
            }
        }
        else {
            divStyle= {
                display: 'block',
                position: 'relative',
                height: this.props.height+'px',
                width: this.props.width+"px"
            }

        }
        return React.DOM.div(
            {style: divStyle},this.props.children
        );


    }
});
module.exports = StickyDiv;
