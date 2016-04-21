var LoginForm = React.createClass({

  // sets initial state
  getInitialState: function(){
    var ref = new Firebase("https://karmadb.firebaseio.com");
    var user_uid;
    ref.onAuth(function(authData) {
      if (authData) {
        console.log("Authenticated with uid:", authData.uid);
        window.location = '/main'
      }
    });

    return { 
      searchString: '',
      error: 'test' 
    };
  },
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
    var that = this
    e.preventDefault();
    var ref = new Firebase("https://karmadb.firebaseio.com");

    ref.authWithPassword({
        email    : this.refs.inputUsername.getDOMNode().value,
        password : this.refs.inputPassword.getDOMNode().value
      }, function(error, authData) {
      if (error) {
        that.setState({error:'invalid'});
        console.log("Login Failed!", error);
      } else {
        window.location = "/main";
        console.log("Authenticated successfully with payload:", authData);
      }
    });
  },

  render: function() {

    return (
      <div className="row">

          <div id="login" className="medium-6 medium-centered large-4 large-centered columns">
              <form data-abide noValidate id="log-in-form">
                  <div>
                      <h3 id="login_header" className="text-center">Karma</h3>
                      <label>Email
                          <input onChange={this.cleanCSS} className={this.state.error} type="text" placeholder="Email" ref="inputUsername" required />
                      </label>
                      <label>Password
                          <input onChange={this.cleanCSS} className={this.state.error} type="password" placeholder="Password" ref="inputPassword" pattern="password" required />
                      </label>
                      <input onClick={this.tryLogIn} type="submit" className="button expanded" id="log-in-button" value="Log In" />
                      <a className="button expanded success" href="/register">Register</a>
                  </div>
              </form>
          </div>
      </div>
    )
  }

});

React.render(
  <LoginForm />,
  document.getElementById('main')
);