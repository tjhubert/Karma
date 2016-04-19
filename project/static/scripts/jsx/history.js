/** @jsx React.DOM */

var StatusAlert = React.createClass({
  render: function(props) {
    var status = this.props.status;
    var label;
    if (status == "Unclaimed"){
      label = "alert label";
    }
    else if (status == "Finished"){
      label = "success label";
    }
    else if (status == "In Progress"){
      label = "warning label";
    }
    else{
      label = "secondary label"
    }
    return (
        <span className={label}> {status} </span>
    );
  }
});


var ActionComponent = React.createClass({
  render: function(props) {
    var status = this.props.status;
    var text;
    var label;
    var func;
    if (status == "Unclaimed"){
      text = "Claim"
      func = this.props.claimItem
      label = "button alert disabled tiny";
    }
    else if (status == "Finished"){
      func = ""
      text = "None"
      label = "button secondary tiny disabled";
    }
    else if (status == "In Progress"){
      text = "Finish"
      func = this.props.finishItem
      label = "button success disabled tiny"
    }
    else{
      text = "Error"
      label = "secondary button disabled tiny"
    }
    return (
        <span onClick={func} className={label}>{text}</span>
    );
  }
});


var QuestionPost = React.createClass({
  render: function(props) {
    var _this = this;
    var createItem = function(item, index) {
      console.log(_this.props.statusFilter)
      if (item.status == _this.props.statusFilter || _this.props.statusFilter=='all'){
        return (
          <tr key={ index }>
            <td>{item.location}</td>
            <td>{item.topic}</td>
            <td>{item.description}</td>
            <td><StatusAlert status={item.status}/></td>
          </tr>
        );
      }
      
    };
    return <tbody>{ this.props.items.map(createItem) }</tbody>;
  }
});


var ListQuestions = React.createClass({
  mixins:[ReactFireMixin],

  // sets initial state
  getInitialState: function(){
    var that = this
    var ref = new Firebase("https://karmadb.firebaseio.com");
    var user_uid;
    ref.onAuth(function(authData) {
      if (authData) {
        user_uid = authData.uid
        console.log("Authenticated with uid:", authData.uid);
      } else {
        window.location = '/login'
        console.log("Client unauthenticated.")
      }
    });

    var firebaseref = new Firebase("https://karmadb.firebaseio.com/user");
    firebaseref.child(user_uid).once("value", function(dataSnapshot) {
      user_email_auth = dataSnapshot.child('email').val();
      that.setState({user_email:user_email_auth})
      console.log(user_email_auth)
    })

    return { 
          user_uid: user_uid,
          items:{},
          location: '',
          topic: '',
          description: '',
          status: 'Unclaimed',
          status_filter: 'all'       
        };
  },
  
  componentWillMount: function() {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/user/');
    this.bindAsArray(firebaseRef.child(this.state.user_uid).child('post').limitToLast(25), 'items');
  },

  onChange: function(e) {
    // this.setState({text: e.target.value});
    this.setState({ [e.target.name]: e.target.value });
  },

  claimItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/');
    var author_uid;
    firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
      email = dataSnapshot.child('author_email').val();
      console.log(email)
    })

    firebaseRef.child('items').child(key).update({status: 'In Progress'});
    firebaseRef.child('user').child(author_uid).child('post').child(key).update({status: 'In Progress'});
  },

  finishItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/');
    var author_uid;
    firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
      email = dataSnapshot.child('author_email').val();
      console.log(email)
    })

    firebaseRef.child('items').child(key).update({status: 'Finished'});
    firebaseRef.child('user').child(author_uid).child('post').child(key).update({status: 'Finished'});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.location && this.state.location.trim().length !== 0) {
      var id = this.firebaseRefs['items'].push({
        // text: this.state.text,
        location: this.state.location,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description,
        author_uid: this.state.user_uid,
        author_email: this.state.user_email

      });
      var new_post_id = id.key()
      var firebaseRef = new Firebase('https://karmadb.firebaseio.com/user/');
      firebaseRef.child(this.state.user_uid).child('post').child(new_post_id).set({
        location: this.state.location,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description
      });
      this.setState({
        // text: '',
        location: '',
        topic: '',
        status: 'Unclaimed',
        description: ''
      });
    }
  },
  statusfilterF: function(e){
    this.setState({status_filter:'Finished'})
  },
  statusfilterU: function(e){
    this.setState({status_filter:'Unclaimed'})
  },
  statusfilterIP: function(e){
    this.setState({status_filter:'In Progress'})
  },
  statusfilterA: function(e){
    this.setState({status_filter:'all'})
  },
  render: function() {

    return (
      <div>
      <p>{this.state.user_email}</p>
      <a className="button" onClick={this.statusfilterF}>Finished</a>
      <a className="button" onClick={this.statusfilterU}>Unclaimed</a>
      <a className="button" onClick={this.statusfilterIP}>In Progress</a>
      <a className="button" onClick={this.statusfilterA}>ALL</a>
        <table className="table table-striped">
          <thead>
            <th>Location</th>
            <th>Topic</th>
            <th>Description</th>
            <th>Status</th>
          </thead>
          <QuestionPost items={ this.state.items } claimItem={ this.claimItem } finishItem={ this.finishItem } statusFilter={this.state.status_filter}/>    
        </table>
      </div>
    );
  }

});


React.render(
  <ListQuestions  />,
  document.getElementById('main')
);


var Logout = React.createClass({
  logout :function(){
    var ref = new Firebase("https://karmadb.firebaseio.com");
    ref.unauth()
  },
  render: function(props) {
    return (
        <button onClick={this.logout} className="button alert">Logout</button>
    );
  }
});


React.render(
  <Logout/>,
  document.getElementById('logout')
);