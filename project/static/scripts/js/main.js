(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var StatusAlert = React.createClass({displayName: "StatusAlert",
  render: function(props) {
    var status = this.props.status;
    var label;
    if (status == "Unclaimed"){
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
      React.createElement("div", null, 
        React.createElement("a", {className: 'button ' + disabledF, onClick: _this.props.clickF}, "Finished"), 
        React.createElement("a", {className: 'button ' + disabledU, onClick: _this.props.clickU}, "Unclaimed"), 
        React.createElement("a", {className: "button " + disabledIP, onClick: _this.props.clickIP}, "In Progress"), 
        React.createElement("a", {className: "button " + disabledA, onClick: _this.props.clickA}, "ALL")
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
      label = "button alert small";
    }
    else if (status == "Finished"){
      func = ""
      text = "None"
      label = "button secondary small disabled";
    }
    else if (status == "In Progress"){
      text = "Finish"
      func = this.props.finishItem
      label = "button success small"
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
  render: function() {
    var _this = this;

    function mapObject(object, callback) {
        return Object.keys(object).map(function (key) {
          return callback(object[key], key);
        });
    }

    var createItem = function(item, key) {
      if (item.status == _this.props.statusFilter || _this.props.statusFilter=='all'){
        return (
          React.createElement("tr", {key:  key }, 
            React.createElement("td", null, item.address), 
            React.createElement("td", null, item.room), 
            React.createElement("td", null, item.topic), 
            React.createElement("td", null, item.description), 
            React.createElement("td", null, React.createElement(StatusAlert, {status: item.status})), 
            React.createElement("td", null, 
              React.createElement(ActionComponent, {status: item.status, claimItem:  _this.props.claimItem.bind(null, key), finishItem:  _this.props.finishItem.bind(null, key) })
            )
          )
        );
      }
    };
    return React.createElement("tbody", null,  mapObject(this.props.items, createItem) );
  }
});


var ListQuestions = React.createClass({displayName: "ListQuestions",
  mixins:[ReactFireMixin],

  // sets initial state
  getInitialState: function(){
    var that = this;
    this.firebaseRef = new Firebase("https://karmadb.firebaseio.com");

    return { 
      user_uid: '',
      user_emaul: '',
      user_limit: '',
      status_filter: 'all',
      current_user: '',
      items:{},
      address: '',
      topic: '',
      description: '',
      status: 'Unclaimed',
      geolocation: {},
      room: '',
      disabledAutocomplete: false,
      currentGeolocation: {}
    }
    
  },

  initAutocomplete: function() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.

    var that = this;

    autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */(this.refs.autocomplete),
        {types: ['geocode']});

    google.maps.event.addDomListener(this.refs.autocomplete, 'keydown', function(e) { 
        if (e.keyCode == 13 && $('.pac-container:visible').length) { 
            e.preventDefault(); 
        }
    }); 

    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      that.setState({
        address: place.formatted_address,
        geolocation: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
      });
      that.geoQuery.updateCriteria({
        center: [place.geometry.location.lat(), place.geometry.location.lng()],
        radius: 1
      });
    });
  },


  componentWillMount: function() {
    var that = this;

    this.firebaseRef.onAuth(function (authData) {

      if (authData) {
        var user_uid = authData.uid;
        that.setState({user_uid: user_uid});
        that.bindAsObject(that.firebaseRef.child("users").child(user_uid), 'current_user');

        that.firebaseRef.child("users").child(user_uid).once("value", function(dataSnapshot) {
          var userObject = dataSnapshot.val();
          if (userObject !== null) {
            that.setState({user_email: userObject.email});
            that.setState({user_limit: userObject.limit}); 
          }
        });

      } else {
        window.location = '/login';
        console.log("Client unauthenticated.");
      }
    });

    this.geoFire = new GeoFire(this.firebaseRef.child("_geoFire"));

    this.geoQuery = this.geoFire.query({
      center: [40.110942, -88.21117400000003],
      radius: 0
    });

    this.geolocate();

    this.geoQuery.on("key_entered", function(itemKey) {
      itemKey = itemKey.split(":")[1];
      that.firebaseRef.child("items").child(itemKey).on("value", function(dataSnapshot) {
        var question = dataSnapshot.val();
        var newItems = that.state.items;
        newItems[itemKey] = question;
        if (question !== null) {
          that.setState({items: newItems})
        }
      })
    });

    this.geoQuery.on("key_exited", function(itemKey) {
      itemKey = itemKey.split(":")[1];
      that.firebaseRef.child("items").child(itemKey).off("value");
      var newItems = that.state.items;
      delete newItems[itemKey];
      that.setState({items: newItems});
    });
  },

  componentDidMount: function() { 
    this.initAutocomplete();
  },
  
  onChange: function(e) {
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
    var curr_limit;
    this.firebaseRef.child('items').child(key).once("value", function(dataSnapshot) {
      author_uid = dataSnapshot.child('author_uid').val();
    })
    this.firebaseRef.child('users').child(author_uid).once("value", function(dataSnapshot) {
      curr_limit = dataSnapshot.child('limit').val();
    })
    // curr_limit += 1
    this.firebaseRef.child('items').child(key).update({status: 'Finished'});
    this.firebaseRef.child('users').child(author_uid).child('post').child(key).update({status: 'Finished'});
    // firebaseRef.child('user').child(author_uid).update({limit: curr_limit});
    this.firebaseRef.child('users').child(author_uid).child('limit').transaction(function(current_value){
      return (current_value || 0) + 1
    });
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
        that.geoQuery.updateCriteria({
          center: [position.coords.latitude, position.coords.longitude],
          radius: 1
        });
        var circle = new google.maps.Circle({
          center: that.state.geolocation,
          radius: position.coords.accuracy
        });
        autocomplete.setBounds(circle.getBounds());
        typeof callback === 'function' && callback();
      });
    }
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
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            that.setState({address:results[0].formatted_address});
          }
        } else {
            console.log("fail geocoding: " + status);
        }


      });
    }

    this.geolocate(mainMethod);
    
    // if (!this.state.geolocation || $.isEmptyObject(this.state.geolocation)) {
    //   console.log('this')
    //   this.geolocate(mainMethod);
    // }
    // else {
    //   mainMethod();
    // }
  },

  handleClickPlace: function(place, e) {
    e.preventDefault();

    this.setState({
      address: place.address,
      geolocation: place.geolocation
    });
    this.geoQuery.updateCriteria({
      center: [place.geolocation.lat, place.geolocation.lng],
      radius: 1
    });
  },

  handleSubmit: function(e) {
    e.preventDefault();

    if (this.state.current_user.limit > 0 && this.state.address && this.state.address.trim().length !== 0) {
      this.firebaseRef.child("users").child(this.state.user_uid).child('limit').transaction(function(current_value){
        return (current_value || 0) - 1
      });

      var id = this.firebaseRef.child('items').push({
        address: this.state.address,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description,
        geolocation: this.state.geolocation,
        room: this.state.room,
        author_uid: this.state.user_uid,
        author_email: this.state.user_email,
        author_limit: this.state.current_user.limit
      });

      this.geoFire.set("items:" + id.key(), [this.state.geolocation.lat, this.state.geolocation.lng]);

      this.firebaseRef.child("users").child(this.state.user_uid).child('post').child(id.key()).set({
        address: this.state.address,
        room: this.state.room,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description
      });

      this.setState({
        address: '',
        room:'',
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
      React.createElement("p", null, "Post limit: ", this.state.current_user.limit), 
        React.createElement(FilterButtons, {filter_status: this.state.status_filter, clickF: this.statusfilterF, clickU: this.statusfilterU, clickIP: this.statusfilterIP, clickA: this.statusfilterA}), 
        React.createElement("table", {className: "table table-striped"}, 
          React.createElement("thead", null, 
            React.createElement("th", null, "Address"), 
            React.createElement("th", null, "Room"), 
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
              React.createElement("label", null, "Type in your address/building name", 
              React.createElement("div", {className: "input-group"}, 
                React.createElement("span", {className: "input-group-label", onClick:  this.fillAddressFromGeolocate}, React.createElement("i", {className: "fi-marker"})), 
                  React.createElement("input", {className: "input-group-field", type: "text", id: "building", ref: "autocomplete", onChange:  this.onChange, value:  this.state.address, name: "address", placeholder: "Address/Place", disabled: this.state.disabledAutocomplete})
              ), 
              React.createElement("div", null, 
                "or pick from these popular places: ", 
                this.props.savedPlaces.map(function(item, i) {
                  return (
                      React.createElement("a", {className: "button hollow small default", onClick:  this.handleClickPlace.bind(null, item) }, item.name)
                  );
                }.bind(this))
              )

              ), 
              React.createElement("label", null, "Room/area", 
                  React.createElement("input", {type: "text", id: "room", onChange:  this.onChange, value:  this.state.room, name: "room", placeholder: "1234"})
              ), 
              React.createElement("label", null, "Topic", 
                  React.createElement("input", {type: "text", id: "topic", onChange:  this.onChange, value:  this.state.topic, name: "topic", placeholder: "Topic"})
              ), 
              React.createElement("label", null, "Description", 
                  React.createElement("input", {type: "text", id: "description", onChange:  this.onChange, value:  this.state.description, name: "description", placeholder: "Brief description"})
              ), 
              React.createElement("button", {type: "submit", className: "button success expanded", value: "Submit"}, "Submit")
          )
        )
      )
    );
  }

});

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

React.render(
  React.createElement(ListQuestions, {savedPlaces: savedPlaces}),
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