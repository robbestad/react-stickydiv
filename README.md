# react-grid

Component for [React][1] to keep a div sticky when the it is scrolled beyond a certain toggle point. 

Demo at [Performant Design][2] where you'll see the menu responding to scroll events by moving with page when you scroll from the top, but getting sticky as soon as it's about to move out of view.

## Installation

    % npm install react-sticky --save

## Usage

    var StickyDiv = require('react-sticky');

    MyComponent = React.createClass({
      render: function() {
         return (
           <StickyDiv togglepoint="85" top="40" height="50" width="100" >
           	 Sticky divs with react
           </StickyDiv>
        );
      }
    });

[1]: https://facebook.github.io/react/
[2]: http://performantdesign.herokuapp.com/