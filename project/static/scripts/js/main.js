(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */

var StatusAlert = React.createClass({displayName: "StatusAlert",
  render: function(props) {
    var status = this.props.status;
    var label;
    if (status == "Unclaimed"){
      label = "alert label";
    }
    else if (status == "Finished"){
      label = "success label";
    }
    else if (status == "In Progress"){
      label = "warning label";
    }
    else{
      label = "secondary label"
    }
    return (
        React.createElement("span", {className: label}, " ", status, " ")
    );
  }
});

var ActionComponent = React.createClass({displayName: "ActionComponent",
  render: function(props) {
    var status = this.props.status;
    var text;
    var label;
    var func;
    if (status == "Unclaimed"){
      text = "Claim"
      func = this.props.claimItem
      label = "button alert tiny";
    }
    else if (status == "Finished"){
      func = ""
      text = "None"
      label = "button secondary tiny disabled";
    }
    else if (status == "In Progress"){
      text = "Finish"
      func = this.props.finishItem
      label = "button success tiny"
    }
    else{
      text = "Error"
      label = "secondary button disabled tiny"
    }
    return (
        React.createElement("span", {onClick: func, className: label}, text)
    );
  }
});


var QuestionPost = React.createClass({displayName: "QuestionPost",
  render: function() {
    var _this = this;
    var createItem = function(item, index) {

      return (
        React.createElement("tr", {key:  index }, 
          React.createElement("td", null, item.location), 
          React.createElement("td", null, item.topic), 
          React.createElement("td", null, item.description), 
          React.createElement("td", null, React.createElement(StatusAlert, {status: item.status})), 
          React.createElement("td", null, 
            React.createElement(ActionComponent, {status: item.status, claimItem:  _this.props.claimItem.bind(null, item['.key']), finishItem:  _this.props.finishItem.bind(null, item['.key']) })
          )
        )
      );
    };
    return React.createElement("tbody", null,  this.props.items.map(createItem) );
  }
});


var ListQuestions = React.createClass({displayName: "ListQuestions",
  mixins:[ReactFireMixin],

  // sets initial state
  getInitialState: function(){
    return { 
      items:[],
      location: '',
      topic: '',
      description: '',
      status: 'Unclaimed'

    };
  },
  
  componentWillMount: function() {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/items/');
    this.bindAsArray(firebaseRef.limitToLast(25), 'items');
  },

  onChange: function(e) {
    // this.setState({text: e.target.value});
    this.setState({ [e.target.name]: e.target.value });
  },

  claimItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/items/');
    firebaseRef.child(key).update({status: 'In Progress'});
  },

  finishItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/items/');
    firebaseRef.child(key).update({status: 'Finished'});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.location && this.state.location.trim().length !== 0) {
      this.firebaseRefs['items'].push({
        // text: this.state.text,
        location: this.state.location,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description

      });
      this.setState({
        // text: '',
        location: '',
        topic: '',
        status: 'Unclaimed',
        description: ''
      });
    }
  },

  // sets state, triggers render method
  // handleChange: function(event){
  //   // grab value form input box
  //   this.setState({searchString:event.target.value});
  //   console.log("scope updated!")
  // },

  render: function() {

    return (
      React.createElement("div", null, 
        React.createElement("table", {className: "table table-striped"}, 
          React.createElement("thead", null, 
            React.createElement("th", null, "Location"), 
            React.createElement("th", null, "Topic"), 
            React.createElement("th", null, "Description"), 
            React.createElement("th", null, "Status"), 
            React.createElement("th", null, "Action")
          ), 
          React.createElement(QuestionPost, {items:  this.state.items, claimItem:  this.claimItem, finishItem:  this.finishItem})
        ), 
        React.createElement("form", {onSubmit: this.handleSubmit}, 
          React.createElement("div", {class: "row column log-in-form"}, 
              React.createElement("h4", {class: "text-center"}, "Post New Question"), 
              React.createElement("label", null, "Location", 
                  React.createElement("input", {type: "text", id: "location", onChange:  this.onChange, value:  this.state.location, name: "location", placeholder: "Location"})
              ), 
              React.createElement("label", null, "Topic", 
                  React.createElement("input", {type: "text", id: "topic", onChange:  this.onChange, value:  this.state.topic, name: "topic", placeholder: "Topic"})
              ), 
              React.createElement("label", null, "Description", 
                  React.createElement("input", {type: "text", id: "description", onChange:  this.onChange, value:  this.state.description, name: "description", placeholder: "Brief description"})
              ), 
              React.createElement("input", {type: "submit", className: "button expanded", value: "Submit"})
          )
        )
      )
    );
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