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

var NavBar = React.createClass({
  render: function(props) {
    return (
      <div className="top-bar">
        <div className="top-bar-left">
          <a id="charma-title" href="/main"><h3>Charma</h3></a>
        </div>
        <div className="top-bar-right">
          <ul className="dropdown menu" data-dropdown-menu>
            <li><a href="/main">Answer Questions</a></li>
            <li><a href="/history">My Posts</a></li>
            <li><Logout/></li>
          </ul>
        </div>
      </div>
    )
  }
});

React.render(
  <NavBar/>,
  document.getElementById('navbar')
);
