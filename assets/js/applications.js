window.indexUrl = "http://localhost/giv2giv-jquery/";
window.serverUrl = "http://localhost:3000/";

$(document).ready(function() {
});

function checkSession() {
  if(localStorage.session == null){
    redirect("index.html");
  } else{
    var session = JSON.parse(localStorage.session);
    var name = session[0]['donor'].donor.name;
    $('.name').text(name);
  }
}

function getProfile(){
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var accounts = new Backbone.Collection;
  accounts.url = window.serverUrl + 'api/donors.json';

  accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response,xhr) {
      console.log(response);
      localStorage.setItem('profile', JSON.stringify(response));

      var profile = JSON.parse(localStorage.profile)[0]['donor'];
      $('.profile-username').text(profile.name);
      $('#email').text(profile.email);
      if(profile.city || profile.state || profile.zip || profile.address || profile.phone_number) {
        $('#address').text(profile.address);
        $('#city').text(profile.city + ", " + profile.state + ", " + profile.zip);
        $('#phone').text(profile.phone_number);
      }
    },
    error: function (errorResponse) {
      console.log(errorResponse);
      redirect("index.html");
    }
  });
}

function endowmentDetails(){
  // curl -X GET -H "Content-Type: application/json" -d '' http://localhost:3000/api/endowment/1.json
  var session = JSON.parse(localStorage.session);
  var donorId = session[0]['donor']['donor'].id;

  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/endowment/' + endowment_id + '/add_charity.json';

  charities.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: { id: endowment_id, charity_id: charity_id.toString() },
    type: "POST",
    success: function(response,xhr) {
      console.log(response);
      $('.form-actions').find('button:contains(Next)').click();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

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

function signOut(){
  var accounts = new Backbone.Collection;
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
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

function endowmentFirstStep(){
  if (!$(".form-endowment").valid()) return;
  $("input.endowment-first-step").val("LOADING..");

  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/charity.json';

  charities.fetch({
    data: { "page":"1", "per_page":"400" },
    success: function(response,xhr) {
      // console.log(response);
      window.charities = response;
      addToList(JSON.stringify(window.charities));
      // localStorage.setItem('charities', JSON.stringify(response));
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });

  var aaa = JSON.parse(localStorage.getItem('charities'));

  $('.form-actions').find('button:contains(Next)').click();
}

function addToList(source) {
  $.each(JSON.parse(source), function(key, val) {
    $('#input20').append("<option id=" + val.charity['id'] + ">" + val.charity['name'] + "</option>");
  });
}

function createEndowment(){
  if (!$(".form-endowment").valid()) return;
  $("input.add-charity").val("LOADING..");
  var charity_id = new Array;
  $.each($('.select2-search-choice div'), function(key, val){
    charity_id.push($(val).attr("value"));
  })

  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var name = $('#name').val();
  var minimum_donation_amount = $('#minimum_donation_amount').val();
  var val1 = $("#public").is(":checked");
  var endowment_visibility = (val1 == true ? "public" : "private");
  var description = $('#description').val();

  var data = {
    name: name,
    minimum_donation_amount: minimum_donation_amount,
    endowment_visibility: endowment_visibility,
    description: description
  };

  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/endowment.json';

  endowments.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: data,
    type: "POST",
    success: function(response,xhr) {
      console.log(response);
      localStorage.setItem('endowment_id', JSON.stringify(response));
      $('.form-actions').find('button:contains(Next)').click();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });

  var endowment_id = JSON.parse(localStorage.getItem('endowment_id'));
  var endowment_id = endowment_id[0]['endowment']['id'];
  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/endowment/' + endowment_id + '/add_charity.json';

  charities.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: { id: endowment_id, charity_id: charity_id.toString() },
    type: "POST",
    success: function(response,xhr) {
      console.log(response);
      $('.form-actions').find('button:contains(Next)').click();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}
