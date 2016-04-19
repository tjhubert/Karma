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
  render: function() {
    var _this = this;

    function mapObject(object, callback) {
        return Object.keys(object).map(function (key) {
          return callback(object[key], key);
        });
    }

    var createItem = function(item, key) {

      return (
        React.createElement("tr", {key:  key }, 
          React.createElement("td", null, item.location), 
          React.createElement("td", null, item.room), 
          React.createElement("td", null, item.topic), 
          React.createElement("td", null, item.description), 
          React.createElement("td", null, React.createElement(StatusAlert, {status: item.status})), 
          React.createElement("td", null, 
            React.createElement(ActionComponent, {status: item.status, claimItem:  _this.props.claimItem.bind(null, key), finishItem:  _this.props.finishItem.bind(null, key) })
          )
        )
      );
    };
    return React.createElement("tbody", null,  mapObject(this.props.items, createItem) );
  }
});


var ListQuestions = React.createClass({displayName: "ListQuestions",
  mixins:[ReactFireMixin],

  // sets initial state
  getInitialState: function(){
    return { 
      items:{},
      location: '',
      topic: '',
      description: '',
      status: 'Unclaimed',
      geolocation: {},
      room: '',
      disabledAutocomplete: false,
      currentGeolocation: {},
    };
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
        location: place.formatted_address,
        geolocation: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
      });
    });
  },


  componentWillMount: function() {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/')
    this.geoFire = new GeoFire(firebaseRef.child("_geoFire"));
    var that = this;


    this.geoQuery = this.geoFire.query({
      center: [40.110942, -88.21117400000003],
      radius: 0
    });

    this.geolocate();

    this.geoQuery.on("key_entered", function(itemKey, location) {
      itemKey = itemKey.split(":")[1];
      firebaseRef.child("items").child(itemKey).once("value", function(dataSnapshot) {
        var question = dataSnapshot.val();
        var newItems = that.state.items;
        newItems[itemKey] = question;
        if (question !== null) {
          // Add the vehicle to the list of vehicles in the query
          that.setState({items: newItems})
        }
      })
    });

    this.geoQuery.on("key_exited", function(itemKey, location) {
      itemKey = itemKey.split(":")[1];
      var newItems = that.state.items;
      delete newItems[itemKey];
      that.setState({items: newItems});
    });
    // this.bindAsArray(firebaseRef.child("items").limitToLast(25), 'items');
  },

  componentDidMount: function() {
    this.initAutocomplete();
  },


  onChange: function(e) {
    // this.setState({text: e.target.value});
    this.setState({ [e.target.name]: e.target.value });
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

  fillAddressFromGeolocate: function() {

    var that = this;

    this.setState({disabledAutocomplete: true});
    this.setState({location: "Finding your location..."});

    var mainMethod = function() {
      var geocoder = new google.maps.Geocoder();
      var latLng = new google.maps.LatLng(that.state.geolocation.lat, that.state.geolocation.lng);
      geocoder.geocode( { 'location': latLng}, function(results, status) {
        that.setState({disabledAutocomplete: false});
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            that.setState({location:results[0].formatted_address});
          }
        } else {
            console.log("fail geocoding: " + status);
        }


      });
    }
    if (!this.state.geolocation || $.isEmptyObject(this.state.geolocation)) {
      this.geolocate(mainMethod);
    }
    else {
      mainMethod();
    }
  },


  claimItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/')
    firebaseRef.child("items").child(key).update({status: 'In Progress'});
    var geo = this.state.items[key].geolocation;
    firebaseRef.child("_geoFire").child("items:"+key).remove();
    this.geoFire.set("items:" + key, [geo.lat, geo.lng]);
  },

  finishItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/')
    firebaseRef.child("items").child(key).update({status: 'Finished'});
    var geo = this.state.items[key].geolocation;
    firebaseRef.child("_geoFire").child("items:"+key).remove();
    this.geoFire.set("items:" + key, [geo.lat, geo.lng]);
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.location && this.state.location.trim().length !== 0) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/')

      var id = firebaseRef.child('items').push({
        // text: this.state.text,
        location: this.state.location,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description,
        geolocation: this.state.geolocation,
        room: this.state.room

      });
      this.geoFire.set("items:" + id.key(), [this.state.geolocation.lat, this.state.geolocation.lng]);
      this.setState({
        // text: '',
        location: '',
        topic: '',
        status: 'Unclaimed',
        description: '',
        geolocation: {},
        room: ''
      });
    }
  },

  render: function() {

    return (
      React.createElement("div", null, 
        React.createElement("table", {className: "table table-striped"}, 
          React.createElement("thead", null, 
            React.createElement("th", null, "Location"), 
            React.createElement("th", null, "Room"), 
            React.createElement("th", null, "Topic"), 
            React.createElement("th", null, "Description"), 
            React.createElement("th", null, "Status"), 
            React.createElement("th", null, "Action")
          ), 
          React.createElement(QuestionPost, {items:  this.state.items, claimItem:  this.claimItem, finishItem:  this.finishItem})
        ), 
        React.createElement("form", {onSubmit: this.handleSubmit}, 
          React.createElement("div", {className: "row column log-in-form"}, 
              React.createElement("h4", {className: "text-center"}, "Post New Question"), 
              React.createElement("label", null, "Building/address", 
              React.createElement("div", {className: "input-group"}, 
                React.createElement("span", {className: "input-group-label", onClick:  this.fillAddressFromGeolocate}, React.createElement("i", {className: "fi-marker"})), 
                  React.createElement("input", {className: "input-group-field", type: "text", id: "building", ref: "autocomplete", onChange:  this.onChange, value:  this.state.location, name: "location", placeholder: "Location", disabled: this.state.disabledAutocomplete})
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

},{}]},{},[1])