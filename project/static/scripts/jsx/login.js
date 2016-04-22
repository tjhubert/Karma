var LoginForm = React.createClass({

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
    if ( authData ){
      if (authData.google.email.match(/@(illinois|uiuc).edu\s*$/i)) {
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
    } else {
      console.log("Auth data not found");
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
      <div className="row">

          <div id="login" className="medium-6 medium-centered large-4 large-centered columns">
                      <div onClick={this.tryLogIn} className="button expanded" id="log-in-button">
                        Register/Log In with your Illinois email
                      </div>
                      <h4>Yes, it is that easy</h4>
          </div>
      </div>
    )
  }

});

React.render(
  <LoginForm />,
  document.getElementById('main')
);