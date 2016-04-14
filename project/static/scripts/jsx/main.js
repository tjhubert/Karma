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
  render: function() {
    var _this = this;
    var createItem = function(item, index) {

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
    };
    return <tbody>{ this.props.items.map(createItem) }</tbody>;
  }
});


var ListQuestions = React.createClass({
  mixins:[ReactFireMixin],

  // sets initial state
  getInitialState: function(){
    return { 
      items:[],
      location: '',
      topic: '',
      description: '',
      status: 'Unclaimed'

    };
  },
  
  componentWillMount: function() {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/items/');
    this.bindAsArray(firebaseRef.limitToLast(25), 'items');
  },

  onChange: function(e) {
    // this.setState({text: e.target.value});
    this.setState({ [e.target.name]: e.target.value });
  },

  claimItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/items/');
    firebaseRef.child(key).update({status: 'In Progress'});
  },

  finishItem: function(key) {
    var firebaseRef = new Firebase('https://karmadb.firebaseio.com/items/');
    firebaseRef.child(key).update({status: 'Finished'});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.location && this.state.location.trim().length !== 0) {
      this.firebaseRefs['items'].push({
        // text: this.state.text,
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

  // sets state, triggers render method
  // handleChange: function(event){
  //   // grab value form input box
  //   this.setState({searchString:event.target.value});
  //   console.log("scope updated!")
  // },

  render: function() {

    return (
      <div>
        <table className="table table-striped">
          <thead>
            <th>Location</th>
            <th>Topic</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
          </thead>
          <QuestionPost items={ this.state.items } claimItem={ this.claimItem } finishItem={ this.finishItem }/>    
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

// list of countries, defined with JavaScript object literals
var questions = [
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"},
  {"name": "A", "topic":"Data structure", "location":"ECEB"}
];

React.render(
  <ListQuestions items={ questions } />,
  document.getElementById('main')
);