(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx React.DOM */

var StatusAlert = React.createClass({displayName: "StatusAlert",
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
        React.createElement("span", {className: label}, " ", status, " ")
    );
  }
});


var ActionComponent = React.createClass({displayName: "ActionComponent",
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
        React.createElement("span", {onClick: func, className: label}, text)
    );
  }
});


var QuestionPost = React.createClass({displayName: "QuestionPost",
  render: function(props) {
    var _this = this;
    var createItem = function(item, index) {
      if (item.status == _this.props.statusFilter || _this.props.statusFilter=='all'){
        return (
          React.createElement("tr", {key:  index }, 
            React.createElement("td", null, item.location), 
            React.createElement("td", null, item.topic), 
            React.createElement("td", null, item.description), 
            React.createElement("td", null, React.createElement(StatusAlert, {status: item.status})), 
            React.createElement("td", null, 
              React.createElement(ActionComponent, {status: item.status, claimItem:  _this.props.claimItem.bind(null, item['.key']), finishItem:  _this.props.finishItem.bind(null, item['.key']) })
            )
          )
        );
      }
      
    };
    return React.createElement("tbody", null,  this.props.items.map(createItem) );
  }
});


var ListQuestions = React.createClass({displayName: "ListQuestions",
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
      React.createElement("div", null, 
      React.createElement("p", null, "Registered as: ", this.state.user_email), 
      React.createElement("p", null, "Post limit: ", this.state.my_user.limit), 
      React.createElement("a", {className: "button", onClick: this.statusfilterF}, "Finished"), 
      React.createElement("a", {className: "button", onClick: this.statusfilterU}, "Unclaimed"), 
      React.createElement("a", {className: "button", onClick: this.statusfilterIP}, "In Progress"), 
      React.createElement("a", {className: "button", onClick: this.statusfilterA}, "ALL"), 
        React.createElement("table", {className: "table table-striped"}, 
          React.createElement("thead", null, 
            React.createElement("th", null, "Location"), 
            React.createElement("th", null, "Topic"), 
            React.createElement("th", null, "Description"), 
            React.createElement("th", null, "Status"), 
            React.createElement("th", null, "Action")
          ), 
          React.createElement(QuestionPost, {items:  this.state.items, claimItem:  this.claimItem, finishItem:  this.finishItem, statusFilter: this.state.status_filter})
        ), 
        React.createElement("form", {onSubmit: this.handleSubmit}, 
          React.createElement("div", {className: "row column log-in-form"}, 
              React.createElement("h4", {className: "text-center"}, "Post New Question"), 
              React.createElement("label", null, "Location", 
                  React.createElement("input", {type: "text", id: "location", onChange:  this.onChange, value:  this.state.location, name: "location", placeholder: "Location"})
              ), 
              React.createElement("label", null, "Topic", 
                  React.createElement("input", {type: "text", id: "topic", onChange:  this.onChange, value:  this.state.topic, name: "topic", placeholder: "Topic"})
              ), 
              React.createElement("label", null, "Description", 
                  React.createElement("input", {type: "text", id: "description", onChange:  this.onChange, value:  this.state.description, name: "description", placeholder: "Brief description"})
              ), 
              React.createElement("input", {type: "submit", className: "button expanded", value: "Submit"})
          )
        )
      )
    );
  }

});


React.render(
  React.createElement(ListQuestions, null),
  document.getElementById('main')
);


var Logout = React.createClass({displayName: "Logout",
  logout :function(){
    var ref = new Firebase("https://karmadb.firebaseio.com");
    ref.unauth()
  },
  render: function(props) {
    return (
        React.createElement("button", {onClick: this.logout, className: "button alert"}, "Logout")
    );
  }
});


React.render(
  React.createElement(Logout, null),
  document.getElementById('logout')
);

},{}]},{},[1])