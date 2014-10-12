# react-stickydiv

Component for [React][1] to set a div sticky when it's scrolled beyond a certain toggle point. 

Demo at [Performant Design][2] where you'll see the menu responding to scroll events by moving with the page when you scroll from the top, but getting sticky as soon as it's about to move out of view.

There are three variables to set:

> togglepoint: this is the trigger in pixels from the top of the page.

> top: the sticky point from the top of the page

> width: the width of the div. This is optional and will be set to 100% if not given

## Installation

    % npm install react-stickydiv --save

## Usage

    var StickyDiv = require('react-stickydiv');

    MyComponent = React.createClass({
      render: function() {
         return (
           <StickyDiv togglepoint="85" top="40" width="100" >
           	 Sticky divs with react
           </StickyDiv>
        );
      }
    });

[1]: https://facebook.github.io/react/
[2]: http://performantdesign.herokuapp.com/
