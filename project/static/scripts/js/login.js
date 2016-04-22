(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LoginForm = React.createClass({displayName: "LoginForm",

  // sets initial state
  getInitialState: function(){
    this.firebaseRef = new Firebase("https://karmadb.firebaseio.com");
    var user_uid;
    var that = this;
    this.firebaseRef.onAuth(function(authData) {
      that.verifyIllinoisEmailAndRedirect(authData);
    });

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
    if ( authData && authData.google.email.match(/@(illinois|uiuc).edu\s*$/i) ) {
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
      console.log("Must use Illinois email");
    }
  },

  componentDidMount: function() {
  },
  cleanCSS:function(){
    this.setState({error:''})
  },
  tryLogIn: function(e) {
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

  render: function() {

    return (
      React.createElement("div", {className: "row"}, 

          React.createElement("div", {id: "login", className: "medium-6 medium-centered large-4 large-centered columns"}, 
                      React.createElement("div", {onClick: this.tryLogIn, className: "button expanded", id: "log-in-button"}, 
                        "Register/Log In with your Illinois email"
                      ), 
                      React.createElement("h4", null, "Yes, it is that easy")
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