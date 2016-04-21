var StatusAlert = React.createClass({
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
        <span className={label}> {status} </span>
    );
  }
});

var FilterButtons = React.createClass({
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
        <span onClick={func} className={label}>{text}</span>
    );
  }
});


var QuestionPost = React.createClass({
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
          <tr key={ key }>
            <td>{item.address}</td>
            <td>{item.room}</td>
            <td>{item.topic}</td>
            <td>{item.description}</td>
            <td><StatusAlert status={item.status}/></td>
            <td>
              <ActionComponent status={item.status} claimItem={ _this.props.claimItem.bind(null, key) } finishItem = { _this.props.finishItem.bind(null, key) } />
            </td>
          </tr>
        );
      }
    };
    return <tbody>{ mapObject(this.props.items, createItem) }</tbody>;
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

    var userFirebaseRef = new Firebase("https://karmadb.firebaseio.com/user");
    userFirebaseRef.child(user_uid).once("value", function(dataSnapshot) {
      user_email_auth = dataSnapshot.child('email').val();
      limit_auth = dataSnapshot.child('limit').val();
      that.setState({user_email:user_email_auth})
      that.setState({user_limit:limit_auth})
    });

    return { 
      user_uid: user_uid,
      status_filter: 'all',
      my_user: '',
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
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/')
    this.geoFire = new GeoFire(firebaseRef.child("_geoFire"));
    var that = this;

    var firebaseRef_user = new Firebase('https://karmadb.firebaseio.com/user/'+this.state.user_uid);
    this.bindAsObject(firebaseRef_user, 'my_user')
    this.setState({user_limit: this.state.my_user.limit})

    this.geoQuery = this.geoFire.query({
      center: [40.110942, -88.21117400000003],
      radius: 0
    });

    this.geolocate();

    this.geoQuery.on("key_entered", function(itemKey) {
      itemKey = itemKey.split(":")[1];
      firebaseRef.child("items").child(itemKey).on("value", function(dataSnapshot) {
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
      firebaseRef.child("items").child(itemKey).off("value");
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

    if (this.state.my_user.limit > 0 && this.state.address && this.state.address.trim().length !== 0) {
      var firebaseRef = new Firebase('https://karmadb.firebaseio.com/')
      var userFirebaseRef = new Firebase('https://karmadb.firebaseio.com/user/');
      userFirebaseRef.child(this.state.user_uid).child('limit').transaction(function(current_value){
        return (current_value || 0) - 1
      });

      var id = firebaseRef.child('items').push({
        address: this.state.address,
        topic: this.state.topic,
        status: 'Unclaimed',
        description: this.state.description,
        geolocation: this.state.geolocation,
        room: this.state.room,
        author_uid: this.state.user_uid,
        author_email: this.state.user_email,
        author_limit: this.state.my_user.limit
      });

      this.geoFire.set("items:" + id.key(), [this.state.geolocation.lat, this.state.geolocation.lng]);

      userFirebaseRef.child(this.state.user_uid).child('post').child(id.key()).set({
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
      <div>
      <p>Registered as: {this.state.user_email}</p>
      <p>Post limit: {this.state.my_user.limit}</p>
        <FilterButtons filter_status={this.state.status_filter} clickF={this.statusfilterF} clickU={this.statusfilterU} clickIP={this.statusfilterIP} clickA={this.statusfilterA} />
        <table className="table table-striped">
          <thead>
            <th>Address</th>
            <th>Room</th>
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
              <label>Type in your address/building name
              <div className="input-group">
                <span className="input-group-label" onClick= { this.fillAddressFromGeolocate } ><i className="fi-marker"></i></span>
                  <input className="input-group-field" type="text" id="building" ref="autocomplete" onChange={ this.onChange }  value={ this.state.address } name="address" placeholder="Address/Place" disabled={this.state.disabledAutocomplete} />
              </div>
              <div>
                or pick from these popular places:&nbsp;
                {this.props.savedPlaces.map(function(item, i) {
                  return (
                      <a className="button hollow small default" onClick={ this.handleClickPlace.bind(null, item) } >{item.name}</a>
                  );
                }.bind(this))}
              </div>

              </label>
              <label>Room/area
                  <input type="text" id="room" onChange={ this.onChange } value={ this.state.room } name="room" placeholder="1234"/>
              </label>
              <label>Topic
                  <input type="text" id="topic" onChange={ this.onChange } value={ this.state.topic } name="topic" placeholder="Topic"/>
              </label>
              <label>Description
                  <input type="text" id="description" onChange={ this.onChange } value={ this.state.description } name="description" placeholder="Brief description" />
              </label>
              <button type="submit" className="button success expanded" value="Submit">Submit</button>
          </div>
        </form>
      </div>
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
  <ListQuestions savedPlaces={savedPlaces} />,
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