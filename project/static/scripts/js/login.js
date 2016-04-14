(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LoginForm = React.createClass({displayName: "LoginForm",

  // sets initial state
  getInitialState: function(){
    return { searchString: '',
            error: 'test' };
  },

  // sets state, triggers render method
  handleChange: function(event){
    // grab value form input box
    this.setState({searchString:event.target.value});
    console.log("scope updated!")
  },

  componentDidMount: function() {
  },
  cleanCSS:function(){
    this.setState({error:''})
  },
  tryLogIn: function(e) {

    e.preventDefault();
    fetch('/checkAuth', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputUsername: this.refs.inputUsername.getDOMNode().value,
        inputPassword: this.refs.inputPassword.getDOMNode().value,
      })
    })
    .then((response) => {
      if (response.status === 200) {
        window.location = "/main";
      } else {
        this.setState({error:'invalid'});
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  },

  render: function() {

    return (
      React.createElement("div", {className: "row"}, 

          React.createElement("div", {id: "login", className: "medium-6 medium-centered large-4 large-centered columns"}, 
              React.createElement("form", {"data-abide": true, noValidate: true, id: "log-in-form"}, 
                  React.createElement("div", null, 
                      React.createElement("h3", {id: "login_header", className: "text-center"}, "Karma"), 
                      React.createElement("label", null, "Username", 
                          React.createElement("input", {onChange: this.cleanCSS, className: this.state.error, type: "text", placeholder: "Username", ref: "inputUsername", required: true})
                          
                      ), 
                      React.createElement("label", null, "Password", 
                          React.createElement("input", {onChange: this.cleanCSS, className: this.state.error, type: "password", placeholder: "Password", ref: "inputPassword", pattern: "password", required: true})
                      ), 
                      React.createElement("input", {onClick: this.tryLogIn, type: "submit", className: "button expanded", id: "log-in-button", value: "Log In"}), 
                      React.createElement("a", {className: "button expanded success", href: "/register"}, "Register")
                  )
              )
          )
      )
    )
  }

});

React.render(
  React.createElement(LoginForm, null),
  document.getElementById('main')
);

},{}]},{},[1])