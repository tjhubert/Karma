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
      label = "button alert tiny";
    }
    else if (status == "Finished"){
      func = ""
      text = "None"
      label = "button secondary tiny disabled";
    }
    else if (status == "In Progress"){
      text = "Finish"
      func = this.props.finishItem
      label = "button success tiny"
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
      if (item.status == _this.props.statusFilter || _this.props.statusFilter=='all'){
        return (
          <tr key={ index }>
            <td>{item.location}</td>
            <td>{item.topic}</td>
            <td>{item.description}</td>
            <td><StatusAlert status={item.status}/></td>
            <td>
              <ActionComponent status={item.status} claimItem={ _this.props.claimItem.bind(null, item['.key']) } finishItem = { _this.props.finishItem.bind(null, item['.key']) } />
            </td>
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
      limit_auth = dataSnapshot.child('limit').val();
      that.setState({user_email:user_email_auth})
      that.setState({user_limit:limit_auth})
    })

    return { 
          user_uid: user_uid,
          items:{},
          location: '',
          topic: '',
          description: '',
          status: 'Unclaimed',
          status_filter: 'all',
          my_user: '' 
        };
  },
  
  componentWillMount: function() {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/items/');
    var firebaseRef_user = new Firebase('https://karmadb.firebaseio.com/user/'+this.state.user_uid);
    this.bindAsObject(firebaseRef_user, 'my_user')
    this.setState({user_limit: this.state.my_user.limit})
    this.bindAsArray(firebaseRef.limitToLast(25), 'items');
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
    })

    firebaseRef.child('items').child(key).update({status: 'In Progress'});
    firebaseRef.child('user').child(author_uid).child('post').child(key).update({status: 'In Progress'});
  },

  finishItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/');
    var author_uid;
    var curr_limit;
    firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
    })
    firebaseRef.child('user').child(author_uid).once("value", function(dataSnapshot) {
      curr_limit = dataSnapshot.child('limit').val();
    })
    // curr_limit += 1
    firebaseRef.child('items').child(key).update({status: 'Finished'});
    firebaseRef.child('user').child(author_uid).child('post').child(key).update({status: 'Finished'});
    // firebaseRef.child('user').child(author_uid).update({limit: curr_limit});
    firebaseRef.child('user').child(author_uid).child('limit').transaction(function(current_value){
      return (current_value || 0) + 1
    });

  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.my_user.limit > 0 && this.state.location && this.state.location.trim().length !== 0) {

      var firebaseRef = new Firebase('https://karmadb.firebaseio.com/user/');
      firebaseRef.child(this.state.user_uid).child('limit').transaction(function(current_value){
        return (current_value || 0) - 1
      });
      var id = this.firebaseRefs['items'].push({
        location: this.state.location,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description,
        author_uid: this.state.user_uid,
        author_email: this.state.user_email,
        author_limit: this.state.my_user.limit

      });

      var new_post_id = id.key()
      
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
    else{
        alert('Please wait for your questions to be answered.')
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
      <p>Registered as: {this.state.user_email}</p>
      <p>Post limit: {this.state.my_user.limit}</p>
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
            <th>Action</th>
          </thead>
          <QuestionPost items={ this.state.items } claimItem={ this.claimItem } finishItem={ this.finishItem } statusFilter={this.state.status_filter}/>    
        </table>
        <form onSubmit={this.handleSubmit}>
          <div className="row column log-in-form">
              <h4 className="text-center">Post New Question</h4>
              <label>Location
                  <input type="text" id="location" onChange={ this.onChange } value={ this.state.location } name="location" placeholder="Location"/>
              </label>
              <label>Topic
                  <input type="text" id="topic" onChange={ this.onChange } value={ this.state.topic } name="topic" placeholder="Topic"/>
              </label>
              <label>Description
                  <input type="text" id="description" onChange={ this.onChange } value={ this.state.description } name="description" placeholder="Brief description" />
              </label>
              <input type="submit" className="button expanded" value="Submit" />
          </div>
        </form>
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