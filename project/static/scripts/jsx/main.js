/** @jsx React.DOM */

var ListQuestions = React.createClass({

  // sets initial state
  getInitialState: function(){
    return { searchString: '' };
  },

  // sets state, triggers render method
  handleChange: function(event){
    // grab value form input box
    this.setState({searchString:event.target.value});
    console.log("scope updated!")
  },

  render: function() {

    var questions = this.props.items;
    // var searchString = this.state.searchString.trim().toLowerCase();

    // // filter countries list by value from input box
    // if(searchString.length > 0){
    //   countries = countries.filter(function(country){
    //     return country.name.toLowerCase().match( searchString );
    //   });
    // }

    return (
      <div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Topic</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            { questions.map(function(question) {
              return (
                      <tr>
                        <td>{question.name}</td>
                        <td>{question.topic}</td>
                        <td>{question.location}</td>
                        <td>
                          <button className="btn btn-default">
                            Claim
                          </button>
                        </td>
                      </tr>
                      )
            })}
          </tbody>
        </table>
      </div>
    )
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