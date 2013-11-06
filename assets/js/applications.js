window.indexUrl = "http://localhost/jquery-giv2giv/";
window.serverUrl = "http://localhost:3000/";

function signIn(){
  var accounts = new Backbone.Collection;
  accounts.url = window.serverUrl + 'api/sessions/create.json';
  var data = {email: $('#input-username').val(), password: $('#input-password').val()};

  accounts.fetch({
    data: data,
    type: "POST",
    success: function(response,xhr) {
      console.log(response);
      localStorage.setItem('session', JSON.stringify(response));
      goToDashboard();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
      redirect("index.html");
    }
  });
}

function signUp(){
  var accounts = new Backbone.Collection;
  accounts.url = window.serverUrl + 'api/donors.json';
  var data = {donor: {name: $('#fullname').val(), email: $('#email').val(), password: $('#password').val()}}

  accounts.fetch({
    data: data,
    type: "POST",
    success: function(response,xhr) {
      console.log(response);
      localStorage.setItem('session', JSON.stringify(response));
      redirect("index.html");
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function goToDashboard(){
  redirect("dashboard.html");
}

function checkSession() {
  if(localStorage.getItem('session') == null){
    redirect("index.html");
  }
}

function logOut(){
  var accounts = new Backbone.Collection;
  var session = JSON.parse(localStorage.getItem('session'));
  var token = session[0]['session'].token;
  accounts.url = window.serverUrl + 'api/sessions/destroy.json';

  accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    type: "POST",
    success: function(response,xhr) {
      localStorage.clear();
      redirect("index.html");
    },
    error: function (errorResponse) {
      console.log(errorResponse)
    }
  });

}

function redirect(data){
  url = window.indexUrl + data;
  window.location.href = url;
}
