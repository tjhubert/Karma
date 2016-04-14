/** @jsx React.DOM */

var LoginForm = React.createClass({

  // sets initial state
  getInitialState: function(){
    return { searchString: '' };
  },

  // sets state, triggers render method
  handleChange: function(event){
    // grab value form input box
    this.setState({searchString:event.target.value});
    console.log("scope updated!")
  },

  componentDidMount: function() {
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
        console.log(response.text());
      }
    })
    .catch((error) => {
      console.warn(error);
    });
  },

  render: function() {

    return (
      <div className="row">
          <div id="login" className="medium-6 medium-centered large-4 large-centered columns">
              <form data-abide noValidate id="log-in-form">
                  <div>
                      <h3 id="login_header" className="text-center">Karma</h3>
                      <label>Username
                          <input type="text" placeholder="Username" ref="inputUsername" required />
                      </label>
                      <label>Password
                          <input type="password" placeholder="Password" ref="inputPassword" pattern="password" required />
                      </label>
                      <input onClick={this.tryLogIn} type="submit" className="button expanded" id="log-in-button" value="Log In" />
                      <p className="text-center"><a href="/register">Register</a></p>
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