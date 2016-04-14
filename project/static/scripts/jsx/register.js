/** @jsx React.DOM */

var RegisterForm = React.createClass({

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

  tryRegister: function() {

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
          <div className="medium-6 medium-centered large-4 large-centered columns">
              <form id="register-form" data-abode noValidate>
                  <div className="row column log-in-form">
                      <h4 className="text-center">Register</h4>
                      <label>Username
                          <input type="text" placeholder="johndoe12" ref="inputUsername" required />
                      </label>
                      <label>Full Name
                          <input type="text" placeholder="John Doe" ref="inputFullName" required/>
                      </label>
                      <label>Email
                          <input type="text" placeholder="johndoe@example.com" ref="inputEmail" required/>
                      </label>
                      <label>Password
                          <input type="password" placeholder="Password" ref="inputPassword" required pattern="alpha_numeric"/>
                      </label>
                      
                      <input onClick={this.tryRegister} type="submit" className="button expanded" value="Register" />
                  </div>
              </form>
          </div>
      </div>
    )
  }

});

React.render(
  <RegisterForm />,
  document.getElementById('main')
);