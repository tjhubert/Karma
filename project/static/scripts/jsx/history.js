var StatusAlert = React.createClass({
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
      <div>
        <a className={"button " + disabledExpired} onClick={_this.props.clickExpired}>Expired</a>
        <a className={"button " + disabledCanceled} onClick={_this.props.clickCanceled}>Canceled</a>
        <a className={'button ' + disabledU} onClick={_this.props.clickU}>Unclaimed</a>
        <a className={"button " + disabledIP} onClick={_this.props.clickIP}>In Progress</a>
        <a className={'button ' + disabledF} onClick={_this.props.clickF}>Finished</a>
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

var ActionComponent = React.createClass({
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
        <span onClick={func} className={label}>{text}</span>
    );
  }
});



var QuestionPost = React.createClass({
  render: function(props) {
    var _this = this;

    this.props.items = _.sortBy(this.props.items, 'created_at').reverse();


    var createItem = function(item, index) {
      if (item.status == _this.props.statusFilter || _this.props.statusFilter=='all'){
        return (
          <tr key={ index }>
            <td>{item.address}</td>
            <td>{item.room}</td>
            <td>{item.course}</td>
            <td>{item.description}</td>
            <td>{ moment(item.posted_at).format("MM-DD-YYYY HH:mm") }</td>
            <td><StatusAlert status={item.status}/></td>
            <td>
              <ActionComponent status={item.status} cancelItem={ _this.props.cancelItem.bind(null, item[".key"]) } repostItem = { _this.props.repostItem.bind(null, item[".key"]) } />
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
  
  componentWillMount: function() {
    this.bindAsObject(this.firebaseRef.child("users").child(this.state.user_uid), 'current_user');
    this.setState({initializingUserData: false});
    this.bindAsArray(this.firebaseRef.child("users").child(this.state.user_uid).child('post').limitToLast(25), 'items');
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
      <div>

        <div className="row small-12 columns">
          <div className="columns small-6">
            <p>{ this.state.initializingUserData ? 'Initializing data..' : 'Hi ' + this.state.current_user.name + '!'}</p>
            <p>Logged In as: <strong>{ this.state.initializingUserData ? 'Initializing data..' : this.state.current_user.email}</strong></p>
          </div>
          <div className="columns small-6 text-center">
            <div className="button success" onClick={this.openPostQuestionForm}>
              <i className="fi-plus"></i> Post New Question
            </div>
            <p>Post limit: <strong>{ this.state.initializingUserData ? 'Initializing data..' : this.state.current_user.limit}</strong></p>
          </div>
        </div>

        <FilterButtons filter_status={this.state.status_filter} clickF={this.statusfilterF} clickU={this.statusfilterU}
        clickIP={this.statusfilterIP} clickA={this.statusfilterA} clickCanceled={this.statusfilterCanceled} clickExpired={this.statusfilterExpired}/>
          <table className="table table-striped">
            <thead className="table-questions-head">
              <th>Address</th>
              <th>Room</th>
              <th>Course</th>
              <th>Description</th>
              <th>Posted at</th>
              <th>Status</th> 
              <th>Action</th> 
            </thead>
            <QuestionPost items={ this.state.items } cancelItem={ this.cancelItem } repostItem={ this.repostItem } statusFilter={this.state.status_filter}/>    
          </table>

        <div className="reveal small" id="post-question-form" data-reveal>
          <a className="float-right" onClick={ this.closePostQuestionForm }>
              <span aria-hidden="true"><i className="fi-x"></i></span>
            </a>

            <form onSubmit={this.handleSubmit}>
              <div className="row column log-in-form">
                  <h4 className="text-center">Post New Question</h4>
                  <label>Type in your address/building name
                  <div className="input-group">
                    <span className="input-group-label" onClick= { this.fillAddressFromGeolocate } ><i className="fi-marker"></i></span>
                      <input className="input-group-field" type="text" id="building" ref="post_question_autocomplete" onChange={ this.onChange }
                      value={ this.state.address } name="address" placeholder="Address/Place" disabled={this.state.disabledAutocomplete} />
                  </div>
                  <div>
                    or pick from these popular places:&nbsp;
                    {savedPlaces.map(function(item, i) {
                      return (
                          <a className="button hollow small default" onClick={ this.handleClickPlace.bind(null, item) } >{item.name}</a>
                      );
                    }.bind(this))}
                  </div>

                  </label>
                  <label>Room/area
                      <input type="text" id="room" onChange={ this.onChange } value={ this.state.room } name="room" placeholder="SIEBL 1404"/>
                  </label>
                  <label>course
                      <input type="text" id="course" onChange={ this.onChange } value={ this.state.course } name="course" placeholder="CS 225"/>
                  </label>
                  <label>Description
                      <input type="text" id="description" onChange={ this.onChange } value={ this.state.description } name="description" placeholder="Brief description" />
                  </label>
                  <button type="submit" data-close className="button success expanded" value="Submit">Submit</button>
              </div>
            </form>
        </div>

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