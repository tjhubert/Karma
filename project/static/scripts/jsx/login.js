var LoginForm = React.createClass({

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
      <div>
        <div className="row">
            <div className="medium-8 medium-centered large-6 large-centered columns">
              <h2>Charma</h2>
              <h4>Give help, get help</h4>
              <h6>There must be somebody else in Grainger who has solved that question on your homework. So, why don't we give each other a hand?</h6>
            </div>

            <div id="login" className="medium-6 medium-centered large-4 large-centered columns">
              <div onClick={this.tryLogInGoogle} className="button expanded" id="log-in-button">
                Register/Log In with your Illinois email
              </div>
              <h4>Yes, it is that easy</h4>
            </div>
        </div>
        <div className="row">
          <div className="medium-8 medium-centered large-6 large-centered columns">
              <div>
                  <h3 id="login_header" className="text-center">Karma</h3>
                  <label>Email
                      <input onChange={this.cleanCSS} className={this.state.error} type="text" placeholder="Email" ref="inputUsername" required />
                  </label>
                  <label>Password
                      <input onChange={this.cleanCSS} className={this.state.error} type="password" placeholder="Password" ref="inputPassword" pattern="password" required />
                  </label>
                  <input onClick={this.tryLogInEmail} type="submit" className="button expanded" id="log-in-button" value="Log In" />
                  <a className="button expanded success" href="/register">Register</a>
              </div>
          </div>
        </div>
      </div>
    )
  }

});

React.render(
  <LoginForm />,
  document.getElementById('main')
);