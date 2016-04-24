(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Logout = React.createClass({displayName: "Logout",
  logout :function(){
    var ref = new Firebase("https://karmadb.firebaseio.com");
    ref.unauth()
  },
  render: function(props) {
    return (
        React.createElement("button", {onClick: this.logout, className: "button alert"}, "Logout")
    );
  }
});

var NavBar = React.createClass({displayName: "NavBar",
  render: function(props) {
    return (
      React.createElement("div", {className: "top-bar"}, 
        React.createElement("div", {className: "top-bar-left"}, 
          React.createElement("a", {id: "charma-title", href: "/main"}, React.createElement("h3", null, "Charma"))
        ), 
        React.createElement("div", {className: "top-bar-right"}, 
          React.createElement("ul", {className: "dropdown menu", "data-dropdown-menu": true}, 
            React.createElement("li", null, React.createElement("a", {href: "/main"}, "Answer Questions")), 
            React.createElement("li", null, React.createElement("a", {href: "/history"}, "My Posts")), 
            React.createElement("li", null, React.createElement(Logout, null))
          )
        )
      )
    )
  }
});

React.render(
  React.createElement(NavBar, null),
  document.getElementById('navbar')
);


},{}]},{},[1])