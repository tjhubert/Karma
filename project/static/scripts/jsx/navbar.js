var Logout = React.createClass({
  logout :function(){
    var ref = new Firebase("https://karmadb.firebaseio.com");
    ref.unauth()
  },
  render: function(props) {
    return (
        <a onClick={this.logout}>Logout</a>
    );
  }
});

var NavBar = React.createClass({
  render: function(props) {
    console.log();
    return (
      <div className="top-bar">
        <div className="top-bar-left">
          <a id="charma-title" href="/main"><h3>Charma</h3></a>
        </div>
        <div className="top-bar-right">
          <ul className="dropdown menu" data-dropdown-menu>
            <li><a className = {window.location.pathname === "/main" ? 'menu-active' : ''} href="/main">Home</a></li>
            <li><a className = {window.location.pathname === "/history" ? 'menu-active' : ''} href="/history">My Posts</a></li>
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
