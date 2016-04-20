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
      error: true,
      errorMsg: ''
    };
  },

  // sets state, triggers render method
  handleChange: function(event){

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
    e.preventDefault()
    var that = this
    if( !(this.state.errorName || this.state.errorEmail || this.state.errorUsername || this.state.errorPassword) ){
      var ref = new Firebase("https://karmadb.firebaseio.com");
      ref.createUser({
        email    : that.refs.inputEmail.getDOMNode().value,
        password : that.refs.inputPassword.getDOMNode().value
      }, function(error, userData) {
        if (error) {
          that.setState({errorMsg: error.code})
          if (error.code == 'EMAIL_TAKEN'){
            that.setState({errorEmail: true})
            that.refs.inputEmail.getDOMNode().className = 'invalid'
          }
          console.log("Error creating user:", error.code);

        } 
        else {
          console.log("Successfully created user account with uid:", userData.uid);
          
          //Push data to FB
          ref.child('user').child(userData.uid).set({
            name: that.refs.inputFullName.getDOMNode().value,
            email: that.refs.inputEmail.getDOMNode().value,
            limit: 2,
            uid: userData.uid,
            post: {
              
            }
          });

          //Log new user in
          ref.authWithPassword({
            email    : that.refs.inputEmail.getDOMNode().value,
            password : that.refs.inputPassword.getDOMNode().value
          }, function(error, authData) {
            if (error) {
              console.log("Login Failed!", error);
            } else {
              window.location = '/main'
              console.log("Authenticated successfully with payload:", authData);
            }
          });
        }
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
                      React.createElement("p", null, this.state.errorMsg), 
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