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
    mixins: [SetIntervalMixin],  
    getInitialState:function(){
        return{
            scrollTop:0
        }
    },
    componentWillMount: function() {
        this.setInterval(this.tick, 0);  
    },
    tick: function() {
        var scrollTop = (window.pageYOffset !== undefined) ?
            window.pageYOffset : (document.documentElement ||
            document.body.parentNode || document.body).scrollTop;
        this.setState({scrollTop:scrollTop});
    },

    render: function () {
        var divStyle, scrollTop = this.state.scrollTop,
            width = this.props.width > 0 ? this.props.width+"px" : '100%';

        if(scrollTop>=this.props.togglepoint){
            divStyle= {
                display: 'block',
                position: 'fixed',
                top: this.props.top+'px',
                width: width
            }
        }
        else {
            divStyle= {
                display: 'block',
                position: 'relative',
                width: width
            }

        }
        return React.DOM.div(
            {style: divStyle},this.props.children
        );


    }
});
module.exports = StickyDiv;