/** @jsx React.DOM */

var RegisterForm = React.createClass({

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
        } else {
          // this.setState({error:'invalid'})
          console.log(response.text());
        }
      })
      .catch((error) => {
        console.warn(error);
      });
    }
    
  },

  render: function() {

    return (
      <div className="row">
          <div className="medium-6 medium-centered large-4 large-centered columns">
              <form id="register-form" data-abode noValidate>
                  <div className="row column log-in-form">

                      <h4 className="text-center">Register {this.state.error}</h4>
                      <label>Username
                          <input onChange={this.usernameVerify} type="text" placeholder="johndoe12" ref="inputUsername" required />
                      </label>
                      <label>Full Name
                          <input onChange={this.nameVerify} type="text" placeholder="John Doe"  ref="inputFullName" required/>
                      </label>
                      <label>Email (...@illinois.edu)
                          <input onChange={this.emailVerify} type="text" placeholder="johndoe@example.com" ref="inputEmail" required/>
                      </label>
                      <label>Password
                          <input onChange={this.passwordVerify} type="password" placeholder="Password" ref="inputPassword" required pattern="alpha_numeric"/>
                      </label>
                      
                      <input onClick={this.tryRegister} type="submit" className="button expanded success" value="Register" />
                      <a className="button expanded" href="/login">Login</a>
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