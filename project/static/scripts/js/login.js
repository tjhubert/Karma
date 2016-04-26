(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LoginForm = React.createClass({displayName: "LoginForm",

  // sets initial state
  getInitialState: function(){
    this.firebaseRef = new Firebase("https://karmadb.firebaseio.com");
    var user_uid;
    var that = this;
    // this.firebaseRef.unauth()
    // this.firebaseRef.onAuth(function(authData) {
    //   that.verifyIllinoisEmailAndRedirect(authData);
    // });

    return { 
      searchString: '',
      error: 'test' 
    };
  },

  handleChange: function(event){
    // grab value form input box
    this.setState({searchString:event.target.value});
    console.log("scope updated!");
  },

  verifyIllinoisEmailAndRedirect: function(authData) {
    var that = this;
    if ( authData ){
      if ( authData.google ){
        if (authData.google.email && authData.google.email.match(/@(illinois|uiuc).edu\s*$/i)) {
          console.log("Log In successful!");
          this.firebaseRef.child("users").child(authData.uid).once("value", function (dataSnapshot) {
            var currentUser = dataSnapshot.val();
            if (currentUser === null) {
              var newUser = {
                uid: authData.uid,
                email: authData.google.email,
                name: authData.google.displayName,
                limit: 2,
                post: {}
              };
              that.firebaseRef.child("users").child(authData.uid).set(newUser, function(error) {
                if (error) {
                  that.firebaseRef.unauth();
                  console.log("Something wrong happened: ",error);
                }
                else {
                  window.location = '/main';
                }
              }) ;
            } else {
              window.location = '/main';
            }
          });
        } else {
          this.firebaseRef.unauth();
          alert("Please allow email access/Must use Illinois email. Logout from any of your Google accounts.");
        }
      } else{
                
        that.firebaseRef.child("users").child(authData.uid).once("value", function(dataSnapshot) {
          var userObject = dataSnapshot.val();
          if (userObject !== null) {
            var verified = userObject.verified
            if (!verified){
              that.firebaseRef.unauth()
              alert("Please verify your email. Contact administrator if you didn't get a verification email.")
            }else{
              window.location = "/main"
            }
          }
        });
      }
    } else {
      console.log("AuthData not found");
    }
      
    
  },

  componentDidMount: function() {
  },
  cleanCSS:function(){
    this.setState({error:''})
  },
  tryLogInGoogle: function(e) {
    console.log('google')
    var that = this
    e.preventDefault();
    var ref = new Firebase("https://karmadb.firebaseio.com");

    ref.authWithOAuthPopup("google", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        that.verifyIllinoisEmailAndRedirect(authData);
      }
    },{
      scope: "email"
    });

  },

  tryLogInEmail:function(e){
    console.log('custom')
    var that = this
    e.preventDefault();
    this.firebaseRef.authWithPassword({
        email    : this.refs.inputUsername.getDOMNode().value,
        password : this.refs.inputPassword.getDOMNode().value
      }, function(error, authData) {
      if (error) {
        that.setState({error:'invalid'});
        console.log("Login Failed!", error);
      } else {
        that.verifyIllinoisEmailAndRedirect(authData)
      }
    });
  },

  render: function() {

    return (
      React.createElement("div", null, 
        React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "medium-8 medium-centered large-6 large-centered columns"}, 
              React.createElement("h2", null, "Charma"), 
              React.createElement("h4", null, "Give help, get help"), 
              React.createElement("h6", null, "There must be somebody else in Grainger who has solved that question on your homework. So, why don't we give each other a hand?")
            ), 

            React.createElement("div", {id: "login", className: "medium-6 medium-centered large-4 large-centered columns"}, 
              React.createElement("div", {onClick: this.tryLogInGoogle, className: "button expanded", id: "log-in-button"}, 
                "Register/Log In with your Illinois email"
              ), 
              React.createElement("h4", null, "Yes, it is that easy")
            )
        ), 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "medium-8 medium-centered large-6 large-centered columns"}, 
              React.createElement("div", null, 
                  React.createElement("h3", {id: "login_header", className: "text-center"}, "Karma"), 
                  React.createElement("label", null, "Email", 
                      React.createElement("input", {onChange: this.cleanCSS, className: this.state.error, type: "text", placeholder: "Email", ref: "inputUsername", required: true})
                  ), 
                  React.createElement("label", null, "Password", 
                      React.createElement("input", {onChange: this.cleanCSS, className: this.state.error, type: "password", placeholder: "Password", ref: "inputPassword", pattern: "password", required: true})
                  ), 
                  React.createElement("input", {onClick: this.tryLogInEmail, type: "submit", className: "button expanded", id: "log-in-button", value: "Log In"}), 
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