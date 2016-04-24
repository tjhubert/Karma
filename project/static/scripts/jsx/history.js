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

var FilterButtons = React.createClass({
  render: function(props) {
    var _this = this
    var filter_status = _this.props.filter_status;
    console.log(filter_status)
    var disabledU = ''
    var disabledA = ''
    var disabledIP = ''
    var disabledF = ''
    if (filter_status == "Unclaimed"){
      disabledU = "disabled";
    }
    else if (filter_status == "Finished"){
      disabledF = "disabled";
    }
    else if (filter_status == "In Progress"){
      disabledIP = "disabled";
    }
    else if (filter_status == "all"){
      disabledA = "disabled";
    }
    return (
      <div>
        <a className={'button ' + disabledF} onClick={_this.props.clickF}>Finished</a>
        <a className={'button ' + disabledU} onClick={_this.props.clickU}>Unclaimed</a>
        <a className={"button " + disabledIP} onClick={_this.props.clickIP}>In Progress</a>
        <a className={"button " + disabledA} onClick={_this.props.clickA}>ALL</a>
      </div>
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
      if (item.status == _this.props.statusFilter || _this.props.statusFilter=='all'){
        return (
          <tr key={ index }>
            <td>{item.address}</td>
            <td>{item.room}</td>
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

    this.firebaseRef = new Firebase("https://karmadb.firebaseio.com/");
    this.firebaseRef.child("users").child(user_uid).once("value", function(dataSnapshot) {
      user_email_auth = dataSnapshot.child('email').val();
      that.setState({user_email:user_email_auth})
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
    this.bindAsArray(this.firebaseRef.child("users").child(this.state.user_uid).child('post').limitToLast(25), 'items');
  },

  onChange: function(e) {
    // this.setState({text: e.target.value});
    this.setState({ [e.target.name]: e.target.value });
  },

  claimItem: function(key) {
    var author_uid;
    this.firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
      email = dataSnapshot.child('author_email').val();
    })

    this.firebaseRef.child('items').child(key).update({status: 'In Progress'});
    this.firebaseRef.child('users').child(author_uid).child('post').child(key).update({status: 'In Progress'});
  },

  finishItem: function(key) {
    var author_uid;
    this.firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
      email = dataSnapshot.child('author_email').val();
    })

    this.firebaseRef.child('items').child(key).update({status: 'Finished'});
    this.firebaseRef.child('users').child(author_uid).child('post').child(key).update({status: 'Finished'});
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
      this.firebaseRef.child("users").child(this.state.user_uid).child('post').child(new_post_id).set({
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
      <p>Registered as: {this.state.user_email}</p>
      <FilterButtons filter_status={this.state.status_filter} clickF={this.statusfilterF} clickU={this.statusfilterU} clickIP={this.statusfilterIP} clickA={this.statusfilterA} />
        <table className="table table-striped">
          <thead>
            <th>Address</th>
            <th>Room</th>
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