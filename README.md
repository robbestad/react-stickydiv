# react-stickydiv

Component for [React][1] to set a div sticky when it's scrolled beyond a certain toggle point. 

Demo at [Robbestad.com/stickydiv][2]

There are zero variables to set (courtesy of [z5h][4])

## Installation

    % npm install react-stickydiv --save

## Usage


#### With JSX

    var StickyDiv = require('react-stickydiv');

    MyComponent = React.createClass({
      render: function() {
         return (
           <StickyDiv>
           	 I'm Sticky
           </StickyDiv>
        );
      }
    });

#### Without JSX

      var MyComponent = React.createClass({
          render: function() {
              return React.createElement(StickyDiv, null, React.createElement("div", null, "I'm Sticky"));
          }
      });



[1]: https://facebook.github.io/react/
[2]: http://performantdesign.herokuapp.com/
[3]: https://github.com/svenanders/react-stickydiv/issues/1
[4]: https://gist.github.com/z5h/d95304d8d8e1fb6d0619
