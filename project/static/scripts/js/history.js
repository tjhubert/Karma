(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var StatusAlert = React.createClass({displayName: "StatusAlert",
  render: function(props) {
    var status = this.props.status;
    var label;
    if (status == "Unclaimed" || status == "Canceled" || status == "Expired"){
      label = "status-alert";
    }
    else if (status == "Finished"){
      label = "status-success";
    }
    else if (status == "In Progress"){
      label = "status-warning";
    }
    else{
      label = "status-secondary"
    }
    return (
        React.createElement("span", {className: label}, " ", status, " ")
    );
  }
});

var FilterButtons = React.createClass({displayName: "FilterButtons",
  render: function(props) {
    var _this = this
    var filter_status = _this.props.filter_status;
    var disabledU = ''
    var disabledA = ''
    var disabledIP = ''
    var disabledF = ''
    var disabledCanceled = ''
    var disabledExpired = ''
    if (filter_status == "Unclaimed"){
      disabledU = "disabled";
    }
    else if (filter_status == "Finished"){
      disabledF = "disabled";
    }
    else if (filter_status == "In Progress"){
      disabledIP = "disabled";
    }
    else if (filter_status == "Canceled"){
      disabledCanceled = "disabled";
    }
    else if (filter_status == "Expired"){
      disabledExpired = "disabled";
    }
    else if (filter_status == "all"){
      disabledA = "disabled";
    }
    return (
      React.createElement("div", null, 
        React.createElement("a", {className: "button hollow" + disabledExpired, onClick: _this.props.clickExpired}, "Expired"), 
        React.createElement("a", {className: "button hollow" + disabledCanceled, onClick: _this.props.clickCanceled}, "Canceled"), 
        React.createElement("a", {className: 'button hollow' + disabledU, onClick: _this.props.clickU}, "Unclaimed"), 
        React.createElement("a", {className: "button hollow" + disabledIP, onClick: _this.props.clickIP}, "In Progress"), 
        React.createElement("a", {className: 'button hollow' + disabledF, onClick: _this.props.clickF}, "Finished"), 
        React.createElement("a", {className: "button hollow" + disabledA, onClick: _this.props.clickA}, "ALL")
      )
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
        React.createElement("span", {onClick: func, className: label}, text)
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
      text = "Cancel"
      func = this.props.cancelItem
      label = "button alert small";
    }
    else if (status == "Finished" || status == "Canceled" || status == "Expired"){
      text = "Repost"
      func = this.props.repostItem
      label = "button success small";
    }
    else if (status == "In Progress"){
      text = "Cancel"
      func = this.props.cancelItem
      label = "button alert small"
    }
    else{
      text = "Error"
      label = "secondary button disabled small"
    }
    return (
        React.createElement("span", {onClick: func, className: label}, text)
    );
  }
});



var QuestionPost = React.createClass({displayName: "QuestionPost",
  render: function(props) {
    var _this = this;

    this.props.items = _.sortBy(this.props.items, 'created_at').reverse();


    var createItem = function(item, index) {
      if (item.status == _this.props.statusFilter || _this.props.statusFilter=='all'){
        return (
          React.createElement("tr", {key:  index }, 
            React.createElement("td", null, item.address), 
            React.createElement("td", null, item.room), 
            React.createElement("td", null, item.course), 
            React.createElement("td", null, item.description), 
            React.createElement("td", null,  moment(item.posted_at).format("MM-DD-YYYY HH:mm") ), 
            React.createElement("td", null, React.createElement(StatusAlert, {status: item.status})), 
            React.createElement("td", null, 
              React.createElement(ActionComponent, {status: item.status, cancelItem:  _this.props.cancelItem.bind(null, item[".key"]), repostItem:  _this.props.repostItem.bind(null, item[".key"]) })
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
    this.firebaseRef = new Firebase("https://karmadb.firebaseio.com/");
    this.geoFire = new GeoFire(this.firebaseRef.child("_geoFire"));

    var user_uid;
    this.firebaseRef.onAuth(function(authData) {
      if (authData) {
        user_uid = authData.uid
        console.log("Authenticated with uid:", authData.uid);
      } else {
        window.location = '/login'
        console.log("Client unauthenticated.")
      }
    });


    return { 
          user_uid: user_uid,
          items:[],
          location: '',
          course: '',
          description: '',
          status: 'Unclaimed',
          status_filter: 'all',
          initializingUserData: true,
          current_user: '',
          address: '',
          geolocation: '',
          description: '',
          disabledAutocomplete: false
        };
  },
  
  componentWillMount: function() {
    this.bindAsArray(this.firebaseRef.child("users").child(this.state.user_uid).child('post').limitToLast(25), 'items');
    this.bindAsObject(this.firebaseRef.child("users").child(this.state.user_uid), 'current_user');
    this.setState({initializingUserData: false});

    this.firebaseRef.child("users").child(this.state.user_uid).child('post').on("child_changed", function(snapshot, key) {
      var posts = snapshot.val(); //this.current_user.post
      console.log('chat_session: ' + posts.chat_session)
      window.open('/chat/' + String(posts.chat_session), '_blank')
    })
  
  },

  cancelItem: function(key) {
    var author_uid;
    var that = this;
    this.firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
      that.firebaseRef.child('users').child(author_uid).child('post').child(key).update({status: 'Canceled'});
      that.firebaseRef.child('users').child(author_uid).child('limit').transaction(function(current_value){
        return (current_value || 0) + 1
      });
    })
    this.firebaseRef.child('items').child(key).update({status: 'Canceled'});
  },

  repostItem: function(key) {
    var author_uid;
    var curr_limit;
    var that = this;
    this.firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
      that.firebaseRef.child('users').child(author_uid).once("value", function(dataSnapshot) {
        curr_limit = dataSnapshot.child('limit').val();
        if (curr_limit > 0) {
          that.firebaseRef.child('items').child(key).update({status: 'Unclaimed', posted_at: Date.now()});
          that.firebaseRef.child('users').child(author_uid)
          .child('post').child(key).update({status: 'Unclaimed', posted_at: Date.now()});
          that.firebaseRef.child("users").child(author_uid).child('limit').transaction(function(current_value){
            return (current_value || 0) - 1
          });
        } else {
          alert('Please wait for your questions to be answered.')
        }
      })
    })
  },

  componentDidMount: function() { 
    this.questionForm = new Foundation.Reveal($("#post-question-form"));
    this.initAutocomplete();
  },

  openPostQuestionForm: function() {
    if (this.state.current_user.limit > 0) {
      this.questionForm.open();
    } else {
      alert('Please wait for your questions to be answered.')
    }
  },

  onChange: function(e) {
    // this.setState({text: e.target.value});
    this.setState({ [e.target.name]: e.target.value });
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
  statusfilterCanceled: function(e){
    this.setState({status_filter:'Canceled'})
  },
  statusfilterExpired: function(e){
    this.setState({status_filter:'Expired'})
  },
  statusfilterA: function(e){
    this.setState({status_filter:'all'})
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var that = this;

    if (this.state.current_user.limit > 0) {
      this.firebaseRef.child("users").child(this.state.user_uid).child('limit').transaction(function(current_value){
        return (current_value || 0) - 1
      });

      var dateNow = Date.now();

      var id = this.firebaseRef.child('items').push({
        address: this.state.address,
        course: this.state.course,
        status: 'Unclaimed',
        description: this.state.description,
        geolocation: this.state.geolocation,
        room: this.state.room,
        author_uid: this.state.user_uid,
        author_email: this.state.current_user.email,
        author_limit: this.state.current_user.limit,
        created_at: dateNow,
        posted_at: dateNow
      });


      if (this.state.geolocation.lat && this.state.geolocation.lng) {
        this.geoFire.set("items:" + id.key(), [this.state.geolocation.lat, this.state.geolocation.lng]);
      }

      this.firebaseRef.child("users").child(this.state.user_uid).child('post').child(id.key()).set({
        address: this.state.address,
        room: this.state.room,
        course: this.state.course,
        status: 'Unclaimed',
        description: this.state.description,
        created_at: dateNow,
        posted_at: dateNow
      });

      this.setState({
        address: '',
        room:'',
        course: '',
        status: 'Unclaimed',
        description: ''
      });

      that.closePostQuestionForm();
    }
    else{
        alert('Please wait for your questions to be answered.')
    }
  },

  closePostQuestionForm: function() {
    this.questionForm.close();
  },

  initAutocomplete: function() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.

    var that = this;
    this.autocomplete = {};

    [this.refs.post_question_autocomplete].forEach(function (autocompleteRef) {
      that.autocomplete[autocompleteRef.id] = new google.maps.places.Autocomplete(autocompleteRef,{types: ['geocode']});

      google.maps.event.addDomListener(autocompleteRef, 'keydown', function(e) { 
          if (e.keyCode == 13 && $('.pac-container:visible').length) { 
              e.preventDefault(); 
          }
      });


      that.autocomplete[autocompleteRef.id].addListener('place_changed', function() {
        var place = that.autocomplete[autocompleteRef.id].getPlace();
        that.setState({
          address: place.formatted_address,
          geolocation: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        });
      });

    });

  },

  fillAddressFromGeolocate: function(e) {
    e.preventDefault()
    var that = this;

    this.setState({disabledAutocomplete: true});
    this.setState({address: "Finding your location..."});

    var mainMethod = function() {
      var geocoder = new google.maps.Geocoder();
      var latLng = new google.maps.LatLng(that.state.geolocation.lat, that.state.geolocation.lng);

      geocoder.geocode( { 'location': latLng}, function(results, status) {
        that.setState({disabledAutocomplete: false});
        if (status == google.maps.GeocoderStatus.OK && results[0]) {
            that.setState({address:results[0].formatted_address});
        } else {
            that.setState({address: "Failed to locate your current location."});
            console.log("fail geocoding: " + status);
        }
      });

    }

    this.geolocate(mainMethod);
    
  },  

  geolocate: function(callback) {
    var that = this;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        that.setState({
          geolocation:{
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
        var circle = new google.maps.Circle({
          center: that.state.geolocation,
          radius: position.coords.accuracy
        });
        _.forEach(that.autocomplete, function (autocomplete) {
          autocomplete.setBounds(circle.getBounds());
        });
        typeof callback === 'function' && callback();
      });
    }
  },

  handleClickPlace: function(place, e) {
    e.preventDefault();

    this.setState({
      address: place.address,
      geolocation: place.geolocation
    });
   
  },

  render: function() {

    var savedPlaces = [
      {
        name: "Siebel",
        address: "Thomas M. Siebel Center for Computer Science, 201 N Goodwin Ave, Urbana, IL 61801, USA",
        geolocation: {
          lat: 40.11402580000001,
          lng: -88.22480730000001
        } 
      },
      {
        name: "ECEB",
        address: "Electrical and Computer Engineering Building, 306 N Wright St, Urbana, IL 61801, USA",
        geolocation: {
          lat: 40.114918,
          lng: -88.22825309999996
        }
      },
      {
        name: "Grainger",
        address: "1301 W Springfield Ave, Urbana, IL 61801, USA",
        geolocation : {
          lat: 40.1123977,
          lng: -88.22727479999998
        }
      }
    ];

    return (
      React.createElement("div", null, 

        React.createElement("div", {className: "row small-12 columns"}, 
          React.createElement("div", {className: "columns small-6"}, 
            React.createElement("p", null,  this.state.initializingUserData ? 'Initializing data..' : 'Hi ' + this.state.current_user.name + '!'), 
            React.createElement("p", null, "Logged In as: ", React.createElement("strong", null,  this.state.initializingUserData ? 'Initializing data..' : this.state.current_user.email))
          ), 
          React.createElement("div", {className: "columns small-6 text-center"}, 
            React.createElement("div", {className: "button default", onClick: this.openPostQuestionForm}, 
              React.createElement("i", {className: "fi-plus"}), " Post New Question"
            ), 
            React.createElement("p", null, "Post limit: ", React.createElement("strong", null,  this.state.initializingUserData ? 'Initializing data..' : this.state.current_user.limit))
          )
        ), 

        React.createElement(FilterButtons, {filter_status: this.state.status_filter, clickF: this.statusfilterF, clickU: this.statusfilterU, 
        clickIP: this.statusfilterIP, clickA: this.statusfilterA, clickCanceled: this.statusfilterCanceled, clickExpired: this.statusfilterExpired}), 
          React.createElement("table", {className: "table table-striped"}, 
            React.createElement("thead", {className: "table-questions-head"}, 
              React.createElement("th", null, "Address"), 
              React.createElement("th", null, "Room"), 
              React.createElement("th", null, "Course"), 
              React.createElement("th", null, "Description"), 
              React.createElement("th", null, "Posted at"), 
              React.createElement("th", null, "Status"), 
              React.createElement("th", null, "Action")
            ), 
            React.createElement(QuestionPost, {items:  this.state.items, cancelItem:  this.cancelItem, repostItem:  this.repostItem, statusFilter: this.state.status_filter})
          ), 

        React.createElement("div", {className: "reveal small", id: "post-question-form", "data-reveal": true}, 
          React.createElement("a", {className: "float-right", onClick:  this.closePostQuestionForm}, 
              React.createElement("span", {"aria-hidden": "true"}, React.createElement("i", {className: "fi-x"}))
            ), 

            React.createElement("form", {onSubmit: this.handleSubmit}, 
              React.createElement("div", {className: "row column log-in-form"}, 
                  React.createElement("h4", {className: "text-center"}, "Post New Question"), 
                  React.createElement("label", null, "Type in your address/building name", 
                  React.createElement("div", {className: "input-group"}, 
                    React.createElement("span", {className: "input-group-label", onClick:  this.fillAddressFromGeolocate}, React.createElement("i", {className: "fi-marker"})), 
                      React.createElement("input", {className: "input-group-field", type: "text", id: "building", ref: "post_question_autocomplete", onChange:  this.onChange, 
                      value:  this.state.address, name: "address", placeholder: "Address/Place", disabled: this.state.disabledAutocomplete})
                  ), 
                  React.createElement("div", null, 
                    "or pick from these popular places: ", 
                    savedPlaces.map(function(item, i) {
                      return (
                          React.createElement("a", {className: "button hollow small default", onClick:  this.handleClickPlace.bind(null, item) }, item.name)
                      );
                    }.bind(this))
                  )

                  ), 
                  React.createElement("label", null, "Room/area", 
                      React.createElement("input", {type: "text", id: "room", onChange:  this.onChange, value:  this.state.room, name: "room", placeholder: "SIEBL 1404"})
                  ), 
                  React.createElement("label", null, "course", 
                      React.createElement("input", {type: "text", id: "course", onChange:  this.onChange, value:  this.state.course, name: "course", placeholder: "CS 225"})
                  ), 
                  React.createElement("label", null, "Description", 
                      React.createElement("input", {type: "text", id: "description", onChange:  this.onChange, value:  this.state.description, name: "description", placeholder: "Brief description"})
                  ), 
                  React.createElement("button", {type: "submit", "data-close": true, className: "button success expanded", value: "Submit"}, "Submit")
              )
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