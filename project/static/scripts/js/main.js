(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */

var ListQuestions = React.createClass({displayName: "ListQuestions",

  // sets initial state
  getInitialState: function(){
    return { searchString: '' };
  },

  // sets state, triggers render method
  handleChange: function(event){
    // grab value form input box
    this.setState({searchString:event.target.value});
    console.log("scope updated!")
  },

  render: function() {

    var questions = this.props.items;
    // var searchString = this.state.searchString.trim().toLowerCase();

    // // filter countries list by value from input box
    // if(searchString.length > 0){
    //   countries = countries.filter(function(country){
    //     return country.name.toLowerCase().match( searchString );
    //   });
    // }

    return (
      React.createElement("div", null, 
        React.createElement("table", {className: "table table-striped"}, 
          React.createElement("thead", null, 
            React.createElement("tr", null, 
              React.createElement("th", null, "Name"), 
              React.createElement("th", null, "Topic"), 
              React.createElement("th", null, "Location"), 
              React.createElement("th", null)
            )
          ), 
          React.createElement("tbody", null, 
             questions.map(function(question) {
              return (
                      React.createElement("tr", null, 
                        React.createElement("td", null, question.name), 
                        React.createElement("td", null, question.topic), 
                        React.createElement("td", null, question.location), 
                        React.createElement("td", null, 
                          React.createElement("button", {className: "btn btn-default"}, 
                            "Claim"
                          )
                        )
                      )
                      )
            })
          )
        )
      )
    )
  }

});

// list of countries, defined with JavaScript object literals
var questions = [
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"}
];

React.render(
  React.createElement(ListQuestions, {items:  questions }),
  document.getElementById('main')
);

},{}]},{},[1])