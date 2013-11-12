window.indexUrl = "http://localhost/giv2giv-jquery/";
window.serverUrl = "http://localhost:3000/";
// window.serverUrl = "https://api.giv2giv.org/";

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

function checkSessionIndex() {
  if (localStorage.getItem("session") !== null){
    goToDashboard();
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
  var session = JSON.parse(localStorage.session);
  var donorId = session[0]['donor']['donor'].id;

  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/endowment/' + endowment_id + '/add_charity.json';

  charities.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: { id: endowment_id, charity_id: charity_id.toString() },
    type: "POST",
    success: function(response, xhr) {
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
    success: function(response, xhr) {
      console.log(response);
      localStorage.setItem('session', JSON.stringify(response));
      goToDashboard();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
      if ($('#input-username').val().length == 0 && $('#input-password').val().length == 0) {
        $.pnotify({
          title: 'Oh No!',
          text: 'Fill email and password please',
          type: 'error'
        });
      } else {
        $('#input-username').val("");
        $('#input-password').val("");
        $.pnotify({
          title: 'Oh No!',
          text: 'Invalid email and password. Plase check again.',
          type: 'error'
        });
      }
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
    error: function (response, errorResponse) {
      window.errors = JSON.parse(errorResponse.responseText);
      string = Object.keys(window.errors)[0]
      $.pnotify({
        title: 'Oh No!',
        text: string + " "+ window.errors['email'][0],
        type: 'error'
      });
      $('#email').val("");
      $('#password').val("");
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

function getCharities() {
  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/charity.json';

  charities.fetch({
    data: { "page":"1", "per_page":"400" },
    success: function(response,xhr) {
      window.charities = JSON.stringify(response);
      $.each(JSON.parse(window.charities), function(key, val) {
        $('#charities').append('<li><a href="charity_details.html" onclick="detailCharity('+val["charity"].id+');">'+ val['charity'].name +'<span style="font-size: 11px; display: block;" class="muted">' + val['charity'].city + '</span></a></li>')
      });
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function detailCharity(id) {
  localStorage.setItem('idCharity', id);
  redirect("charity_details.html");
}

function getDetailCharity() {
  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/charity/' + localStorage.idCharity + '.json';

  charities.fetch({
    success: function(response,xhr) {
      window.charity = JSON.stringify(response);
      var charity = JSON.parse(window.charity);
      $('#name').text(charity[0]['charity'].name);
      $('#email').text(charity[0]['charity'].email);
      $('#address').text(charity[0]['charity'].address);
      $('#city').text(charity[0]['charity'].city + ", " + charity[0]['charity'].state + ", " + charity[0]['charity'].zip);
      $('#classification').text(charity[0]['charity'].classification_code);
      $('#ntee').text(charity[0]['charity'].ntee_code);
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function addToList(source) {
  $.each(JSON.parse(source), function(key, val) {
    $('#input20').append("<option id=" + val.charity['id'] + ">" + val.charity['name'] + "</option>");
  });
}

function endowmentFirstStep(){
  if (!$(".form-endowment").valid()) return;
  $("input.endowment-first-step").val("LOADING..");

  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/charity.json';

  charities.fetch({
    data: { "page":"1", "per_page":"400" },
    success: function(response,xhr) {
      window.charities = response;
      addToList(JSON.stringify(window.charities));
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });

  $('.form-actions').find('button:contains(Next)').click();
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


  if (charity_id.length == 0) {
    $.pnotify({
      title: 'Oops!',
      text: "Please select charities first.",
      type: 'error'
    });
  } else {
    creatingEndowment(data, token);

    var endowment_id = JSON.parse(localStorage.endowment_id);
    addCharityToGroup(endowment_id, charity_id, token);
  }
}

function creatingEndowment(data, token) {
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/endowment.json';

  endowments.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: data,
    type: "POST",
    success: function(response,xhr) {
      localStorage.setItem('endowment_id', JSON.stringify(response));
      // $('.form-actions').find('button:contains(Next)').click();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function addCharityToGroup(endowment_id, charity_id, token) {
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

function getEndowments() {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/donors/endowments.json';

  endowments.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response, xhr) {
      console.log(response);
      addToEndowmentList(JSON.stringify(response));
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function addToEndowmentList(source) {
  $.each(JSON.parse(source), function(key, val) {
    $('#container-endowments').append("<li><a href='endowment_details.html' onclick='detailEndowment("+ val.endowment['id'] +");' class='stat summary'><span class='sparkline'></span><span class='digit'>" + val.endowment['name'] + "</span> <span class='text'>Balance</span></a></li>");
  });
}

function detailEndowment(id, name) {
  localStorage.setItem('idEndowment', id);
  redirect("endowment_details.html");
}

function getDetailEndowment() {
  $('#endowment_id').text(localStorage.idEndowment);
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/endowment/' + localStorage.idEndowment + '.json';

  endowments.fetch({
    success: function(response, xhr) {
      window.endowment = JSON.stringify(response);
      var endowment = JSON.parse(window.endowment);
      $('#name').text(endowment[0]['endowment'].name);
      $('#description').text(endowment[0]['endowment'].email);
      $('#current_balance').text("Current Balance");
      $('#minimum_donation_amount').text(endowment[0]['endowment'].city + ", " + endowment[0]['endowment'].state + ", " + endowment[0]['endowment'].zip);
    },
    error: function (errorResponse, response) {
      console.log(errorResponse);
      console.log(response);
    }
  });
}

function checkPaymentAccount() {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var payment_accounts = new Backbone.Collection;
  payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts.json';

  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response, xhr) {
      window.payment_accounts = JSON.stringify(response);
      var payment_accounts = JSON.parse(window.payment_accounts);
      if (payment_accounts.length == 0) {
        $('#donate').text("You don't have any payment accounts.")
      };
    },
    error: function (errorResponse, responseText) {
      console.log(errorResponse);
      console.log(responseText);
    }
  });
}

function donateEndowment(id) {
  redirect("donate.html")
}

function createPaymentAccount() {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var payment_accounts = new Backbone.Collection;
  payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts.json';

  data = {
    processor: "stripe",
    stripeToken: ""
  }

  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: data,
    type: "POST",
    success: function(response, xhr) {
      window.payment_accounts = JSON.stringify(response);
      var payment_accounts = JSON.parse(window.payment_accounts);
    },
    error: function (errorResponse, responseText) {
      console.log(errorResponse);
      console.log(responseText);
    }
  });
}
