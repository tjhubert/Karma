(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */

var RegisterForm = React.createClass({displayName: "RegisterForm",

  // sets initial state
  getInitialState: function(){
    return {
      errorEmail: true,
      errorUsername: true,
      errorPassword: true,
      errorName: true,
      error: true
    };
  },

  // sets state, triggers render method
  handleChange: function(event){
    // grab value form input box
    // this.setState({searchString:event.target.value});
    // console.log("scope updated!")
  },

  componentDidMount: function() {
  },
  nameVerify:function(e){
    str = e.target.value
    if(str.trim().length < 2){
      e.target.className = "invalid"
      this.setState({errorName: true })
    }
    else{

      this.setState({errorName: false})
      e.target.className = ""
    }
  },
  passwordVerify:function(e){
    str = e.target.value
    if(str.trim().length < 2){
      e.target.className = "invalid"
      this.setState({errorPassword: true })
    }
    else{

      this.setState({errorPassword: false})
      e.target.className = ""
    }
  },
  usernameVerify:function(e){
    str = e.target.value
    if(str.trim().length < 2){
      e.target.className = "invalid"
      this.setState({errorUsername: true })
    }
    else{

      this.setState({errorUsername: false})
      e.target.className = ""
    }
  },
  emailVerify:function(e){
    var re = /[^\s@]+@illinois\.edu$/
    email = e.target.value
    // console.log(email)
    if (!re.test(email)) {
      e.target.className = "invalid"
      this.setState({errorEmail:true})
      // this.setState({error:true})
    }
    else{
      e.target.className = ""
      this.setState({errorEmail:false})
      // this.setState({error:false})
    }
  },
  tryRegister: function(e) {
    e.preventDefault();
      if( !(this.state.errorName || this.state.errorEmail || this.state.errorUsername || this.state.errorPassword) ){
        fetch('/addUser', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputUsername: this.refs.inputUsername.getDOMNode().value,
          inputPassword: this.refs.inputPassword.getDOMNode().value,
          inputFullName: this.refs.inputFullName.getDOMNode().value,
          inputEmail: this.refs.inputEmail.getDOMNode().value,
        })
      })
      .then((response) => {
        if (response.status === 200) {
          window.location = "/main";
        }
        else if (response.status == 499){
          this.setState({errorUsername: true})
          this.refs.inputUsername.getDOMNode().className = 'invalid'
          this.refs.inputUsername.getDOMNode().value = ''
        } 
        else {
          // this.setState({error:'invalid'})
          // console.log(response.text());
        }
      })
      .catch((error) => {
        console.warn(error);
      });
    }
    
  },

  render: function() {

    return (
      React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "medium-6 medium-centered large-4 large-centered columns"}, 
              React.createElement("form", {id: "register-form", "data-abode": true, noValidate: true}, 
                  React.createElement("div", {className: "row column log-in-form"}, 

                      React.createElement("h4", {className: "text-center"}, "Register ", this.state.error), 
                      React.createElement("label", null, "Username", 
                          React.createElement("input", {onChange: this.usernameVerify, type: "text", placeholder: "johndoe12", ref: "inputUsername", required: true})
                      ), 
                      React.createElement("label", null, "Full Name", 
                          React.createElement("input", {onChange: this.nameVerify, type: "text", placeholder: "John Doe", ref: "inputFullName", required: true})
                      ), 
                      React.createElement("label", null, "Email (...@illinois.edu)", 
                          React.createElement("input", {onChange: this.emailVerify, type: "text", placeholder: "johndoe@example.com", ref: "inputEmail", required: true})
                      ), 
                      React.createElement("label", null, "Password", 
                          React.createElement("input", {onChange: this.passwordVerify, type: "password", placeholder: "Password", ref: "inputPassword", required: true, pattern: "alpha_numeric"})
                      ), 
                      
                      React.createElement("input", {onClick: this.tryRegister, type: "submit", className: "button expanded success", value: "Register"}), 
                      React.createElement("a", {className: "button expanded", href: "/login"}, "Login")
                  )
              )
          )
      )
    )
  }

});

React.render(
  React.createElement(RegisterForm, null),
  document.getElementById('main')
);

},{}]},{},[1])