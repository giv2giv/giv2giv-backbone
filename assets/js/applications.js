window.indexUrl = "http://localhost/giv2giv-jquery/";
// window.indexUrl = "http://www.giv2giv.org/giv2giv-jquery/";
window.serverUrl = "http://localhost:3000/";
// window.serverUrl = "https://api.giv2giv.org/";

$(document).ready(function() {
});

function checkSession() {
  if(localStorage.session == null){
    $('#header-functions').hide();
    $('#main-content h3').html("Featured Endowments");
    getFeaturedEndowments();

    $('#github-issues').append("<li><a href='https://github.com/giv2giv/giv2giv-jquery/issues?state=open' class='stat summary'><span class='digit'><span class='text'>Link to github issue</span></span></a></li>");
    $('.inner-nav').append("<li><a href='login.html'><i class='icol-key'></i> Login</a></li>");

  } else{
    $('#header-functions').show();
    $('#main-content h3').html("My Endowments");
    getEndowments();

    var session = JSON.parse(localStorage.session);
    var name = session[0]['donor'].donor.name;
    $('.name').text(name);
    $('.inner-nav').append("<li class='donor_profile'><a href='#'><i class='icol-user'></i> Donor Profile</a></li><li class='statement'><a href='#'><i class='icol-user'></i> Statement</a></li><li class='active'><a href='charities.html'><i class='icol-table'></i> Charities</a></li><li><a onclick='signOut();'><i class='icon-off'></i>Log Out</a></li>");

    if ((localStorage.data_endowment !== undefined) && (localStorage.charity_id !== undefined) && (localStorage.session !== undefined)) {
      createEndowment();

      localStorage.removeItem('charity_id');
      localStorage.removeItem('data_endowment');
      localStorage.removeItem('endowment_id');
    }
    getProfile();
    checkPaymentAccount();
  }
}

function checkSessionIndex() {
  if (localStorage.getItem("session") !== null){
    goToDashboard();
  }
}

function getProfile(){
  if(localStorage.session == null){
    redirect("login.html");
  } else {
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

        $('.donor_profile').html("<a id='button-profile-"+ profile.id +"' href='#' onclick='detailProfile("+ profile.id +");'><i class='icol-user'></i> Donor Profile</a>");

        $('#profile-details').html("<div id='profile-modal' href='#'><h4 class='sub'><span>Email</span></h4><p id='email'></p><h4 class='sub'><span>Address</span></h4><p id='address'></p><h4 class='sub'><span>City, State, Zip</span></h4><p id='city'></p><h4 class='sub'><span>Phone</span></h4><p id='phone'></p><hr/><ul id='donate' class='stats-container'></ul></div>");

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
}

function detailProfile(id) {
  var demos = {
    basicDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false
      });

      trigger.on('click', function(e) {
        target.dialog( 'open' );
        e.preventDefault();
      });
    },

    modalDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false,
        modal: true
      });

      trigger.on('click', function(e) {
        target.dialog( 'open' );
        e.preventDefault();
      });
    }
  };

  if( $.fn.dialog ) {
    demos.modalDialog( $('#profile-modal'), $('#button-profile-'+id) );
  }
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

function getBalanceInformation() {
  if(localStorage.session == null){
    $('.fund-info')
  } else{
    var session = JSON.parse(localStorage.session);
    var token = session[0]['session']['session'].token;

    var donors = new Backbone.Collection;
    donors.url = window.serverUrl + 'api/donors/balance_information.json';

    donors.fetch({
      headers: {'Authorization' :'Token token=' + token},
      success: function(response, xhr) {
        localStorage.setItem('fund', JSON.stringify(response));
        var fund = JSON.parse(localStorage.fund);

        localStorage.setItem('funds', response)
        $('.fund-info').append("<p>My Total Fund : "+ fund[0].donor_current_balance +"</p><p>Giv2Giv Total Fund : </p>")
      },
      error: function (errorResponse) {
        console.log(errorResponse);
      }
    });
  }
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
      if (localStorage.idEndowment) {
        redirect("donate.html")
      } else {
        goToDashboard();
      }
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

      var accounts = new Backbone.Collection;
      accounts.url = window.serverUrl + 'api/sessions/create.json';
      accounts.fetch({
        data: { email: $('#email').val(), password: $('#password').val() },
        type: "POST",
        success: function(response, xhr) {
          console.log(response);
          localStorage.setItem('session', JSON.stringify(response));
          redirect("index.html");
        },
        error: function (errorResponse) {
          console.log(errorResponse);
        }
      });
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
  redirect("index.html");
}

function signOut(){
  var accounts = new Backbone.Collection;
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  accounts.url = window.serverUrl + 'api/sessions/destroy.json';

  $('#loader').show();
  accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    type: "POST",
    success: function(response, xhr) {
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
  $('#loader').show();

  charities.fetch({
    data: { "page":"1", "per_page":"400" },
    success: function(response,xhr) {
      window.charities = JSON.stringify(response);
      $.each(JSON.parse(window.charities), function(key, val) {
        if (val.charity !== undefined) {
          $('#charities').append('<li><a href="charity_details.html" onclick="detailCharity('+val["charity"].id+');">'+ val['charity'].name +'<span style="font-size: 11px; display: block;" class="muted">' + val['charity'].city + '</span></a></li>')
        }
      });
      $('#loader').hide();
    },
    error: function (errorResponse, responseText) {
      console.log(errorResponse);
      console.log(responseText);
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
    if (val.charity !== undefined) {
      $('#input20').append("<option id=" + val.charity.id + ">" + val.charity.name + "</option>");
    }
  });
}

function endowmentFirstStep(){
  if (!$(".form-endowment").valid()) return;
  $("input.endowment-first-step").val("LOADING..");

  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/charity.json';

  $('#loader').show();
  charities.fetch({
    data: { "page":"1", "per_page":"400" },
    success: function(response,xhr) {
      window.charities = response;
      addToList(JSON.stringify(window.charities));
      $('#loader').hide();
    },
    error: function (errorResponse, responseText) {
      console.log(errorResponse);
      console.log(responseText);
    }
  });

  $('.form-actions').find('button:contains(Next)').click();
}

function createEndowment(){
  if ((localStorage.data_endowment !== undefined) && (localStorage.charity_id !== undefined) && (localStorage.session !== undefined)) {
    var session = JSON.parse(localStorage.session);
    var token = session[0]['session']['session'].token;
    var charity_id = JSON.parse(localStorage.charity_id);

    // creatingEndowment(JSON.parse(localStorage.data_endowment), token);
    var endowments = new Backbone.Collection;
    endowments.url = window.serverUrl + 'api/endowment.json';

    $('#loader').show();
    endowments.fetch({
      headers: {'Authorization' :'Token token=' + token},
      data: JSON.parse(localStorage.data_endowment),
      type: "POST",
      success: function(response,xhr) {
        $('#loader').hide();
        localStorage.setItem('endowment_id', JSON.stringify(response));

        var endowment_id = JSON.parse(localStorage.endowment_id);
        addCharityToGroup(endowment_id, charity_id, token);

        $.pnotify({
          title: 'Yeah',
          text: "Successfully to create endowment.",
          type: 'success'
        });

      },
      error: function (errorResponse, responseText) {
        console.log(errorResponse);
        console.log(responseText);
      }
    });

    localStorage.removeItem('charity_id');
    localStorage.removeItem('data_endowment');
    localStorage.removeItem('endowment_id');
  } else {
    var charity_id = new Array;
    $.each($('.select2-search-choice div'), function(key, val){
      charity_id.push($(val).attr("value"));
    })
    localStorage.setItem('charity_id', JSON.stringify(charity_id));


    if (!$(".form-endowment").valid()) return;
    $("input.add-charity").val("LOADING..");

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

    localStorage.setItem('data_endowment', JSON.stringify(data));

    if(localStorage.session == null){
      if (charity_id.length == 0) {
        $.pnotify({
          title: 'Oops!',
          text: "Please select charities first.",
          type: 'error'
        });
      } else {
        redirect("login.html");
      }
    } else{
      var session = JSON.parse(localStorage.session);
      var token = session[0]['session']['session'].token;
      var charity_id = JSON.parse(localStorage.charity_id);

      if (charity_id.length == 0) {
        $.pnotify({
          title: 'Oops!',
          text: "Please select charities first.",
          type: 'error'
        });
      } else {
        // creatingEndowment(JSON.parse(localStorage.data_endowment), token);
        var endowments = new Backbone.Collection;
        endowments.url = window.serverUrl + 'api/endowment.json';

        $('#loader').show();
        endowments.fetch({
          headers: {'Authorization' :'Token token=' + token},
          data: JSON.parse(localStorage.data_endowment),
          type: "POST",
          success: function(response,xhr) {
            $('#loader').hide();
            localStorage.setItem('endowment_id', JSON.stringify(response));
            $('.form-actions').find('button:contains(Next)').click();

            $.pnotify({
              title: 'Yeah',
              text: "Successfully to create endowment.",
              type: 'success'
            });
          },
          error: function (errorResponse, responseText) {
            console.log(errorResponse);
            console.log(responseText);
          }
        });

        var endowment_id = JSON.parse(localStorage.endowment_id);
        addCharityToGroup(endowment_id, charity_id, token);

        localStorage.removeItem('charity_id');
        localStorage.removeItem('data_endowment');
        localStorage.removeItem('endowment_id')
      }
    }
  }
}

function creatingEndowment(data, token) {
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/endowment.json';

  $('#loader').show();
  endowments.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: data,
    type: "POST",
    success: function(response,xhr) {
      $('#loader').hide();
      localStorage.setItem('endowment_id', JSON.stringify(response));
      // $('.form-actions').find('button:contains(Next)').click();
    },
    error: function (errorResponse, responseText) {
      console.log(errorResponse);
      console.log(responseText);
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
  endowments.url = window.serverUrl + 'api/donors/subscriptions.json';
  $('#loader').show();

  endowments.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response, xhr) {
      console.log(response);
      window.mpit = JSON.stringify(response);
      $('#loader').hide();
      if (JSON.parse(window.mpit).length == 0) {
        $('#container-endowments').append("<li><a href='#' class='stat summary'><span class='digit'><span class='text'>No Subscribed Endowment</span></span></a></li>");
      } else {
        addToEndowmentList(JSON.stringify(response));
      }

    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function getFeaturedEndowments() {
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/endowment.json';
  $('#loader').show();

  var keyword = window.location.search.replace("?query=", "");

  endowments.fetch({
    data: {query: keyword},
    success: function(response, xhr) {
      window.featured_endowments = JSON.parse(JSON.stringify(response));
      var featuredEndowments = window.featured_endowments.sort(function() {return 0.5 - Math.random()}).slice(0,5);
      addToEndowmentList(JSON.stringify(featuredEndowments));
      $('#loader').hide();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function addToEndowmentList(source) {
  $.each(JSON.parse(source), function(key, val) {
    if (val.endowment !== undefined) {
      $('#container-endowments').append("<li id='button-modal-"+ val.endowment['id'] +"'><a href='#' onclick='detailEndowment("+ val.endowment['id'] +");' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val.endowment['name'] + "</span>0</span></a></li>");

      if (localStorage.session == null) {
        $('#endowment-details').append("<div id='dialog-modal-"+ val.endowment['id'] +"'><p style='text-align: right;'>Visibility: <b>"+ val.endowment.endowment_visibility +"</b></p><br /><p>Endowment Name: <b>"+ val.endowment.name +"</b></p><p>Description: <b>"+ val.endowment.description +"</b></p><p>Current Balance: <b>"+ '-' +"</b></p><p>Minimum Donation Amount: <b>"+ val.endowment.minimum_donation_amount +"</b></p><br /><p>My Donations: <b>"+ '-' +"</b></p><p>My Grants: <b>"+ '-' +"</b></p><p>My Balance: <b>"+ '-' +"</b></p><br/><p>giv2giv Donations: <b>"+ '-' +"</b></p><p>giv2giv Grants: <b>"+ '-' +"</b></p><p>giv2giv Balance: <b>"+ '-' +"</b></p><br/></div>");

        // $('#endowment-details').append("<ul style='text-align: left;' id='dialog-modal-"+ val.endowment['id'] +"' class='stats-container'><li><a href='#' class='stat summary'><span class='icon icon-circle bg-orange'><i class='icon-user'></i></span><span class='digit'><span class='text'>Description</span>"+ val.endowment['description'] +"</span></a></li><li><a href='#' class='stat summary'><span class='icon icon-circle bg-orange'><i class='icon-user'></i></span><span class='digit'><span class='text'>Current Balance</span>balance</span></a></li><li><a href='#' class='stat summary'><span class='icon icon-circle bg-orange'><i class='icon-user'></i></span><span class='digit'><span class='text'>Minimum Donation Amount</span>"+ val.endowment['minimum_donation_amount'] +"</span></a></li><hr/><a class='btn add-charity' onclick='donateEndowment("+ val.endowment['id'] +");' href='javascript:void(0)'>Donate Now!</a></ul>");
      } else {
        $('#endowment-details').append("<ul style='text-align: left;' id='dialog-modal-"+ val.endowment['id'] +"' class='stats-container'><li><a href='#' class='stat summary'><span class='icon icon-circle bg-orange'><i class='icon-user'></i></span><span class='digit'><span class='text'>Description</span>"+ val.endowment['description'] +"</span></a></li><li><a href='#' class='stat summary'><span class='icon icon-circle bg-orange'><i class='icon-user'></i></span><span class='digit'><span class='text'>Current Balance</span>balance</span></a></li><li><a href='#' class='stat summary'><span class='icon icon-circle bg-orange'><i class='icon-user'></i></span><span class='digit'><span class='text'>Minimum Donation Amount</span>"+ val.endowment['minimum_donation_amount'] +"</span></a></li><hr><li><a href='#' class='stat summary'><span><i></i></span><br/><span class='digit'><span class='text'>My Donations</span>0</span><span class='digit'><span class='text'>My Grants</span>0</span><span class='digit'><span class='text'>My Balance</span>0</span></a></li></ul>");
      }
    }
  });
}

function detailEndowment(id) {
  var demos = {
    basicDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false
      });

      trigger.on('click', function(e) {
        target.dialog( 'open' );
        e.preventDefault();
      });
    },

    modalDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false,
        modal: true
      });

      trigger.on('click', function(e) {
        target.dialog( 'open' );
        e.preventDefault();
      });
    }
  };

  if( $.fn.dialog ) {
    demos.modalDialog( $('#dialog-modal-'+id), $('#button-modal-'+id) );
  }

  // $('#dialog-modal-'+id).dialog( 'open' );
  // localStorage.setItem('idEndowment', id);
  // redirect("endowment_details.html");
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
  if (localStorage.session == null) {
    redirect("login.html");
  } else {
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
          $('#donate').html("<form class='form-vertical' method='post'><input type='text' placeholder='stripeToken' name='[stripeToken]' id='input-stripe-token'><button type='submit' class='btn btn-success btn-block' onclick='createPaymentAccount(); return false;'>Create Payment Account</button></form>")
        } else{
          var str = window.location.pathname;
          if (str.indexOf("index") !== -1) {
            $.each(payment_accounts, function(key, val) {
              $('#donate').append("<li><a href='#' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val['payment_account'].processor + "</span>"+ val['payment_account'].id +"</span></a></li>");
            });
          } else {
            $('#donate').text("Form Donate")
          }
        }
      },
      error: function (errorResponse, responseText) {
        console.log(errorResponse);
        console.log(responseText);
      }
    });
}
}

function createPaymentAccount() {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var payment_accounts = new Backbone.Collection;
  payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts.json';

  var stripe_token = $('#input-stripe-token').val();
  var data = {
    processor: "stripe",
    stripeToken: stripe_token
  }

  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: data,
    type: "POST",
    success: function(response, xhr) {
      console.log(response);
      window.payment_accounts = JSON.stringify(response);
      var payment_accounts = JSON.parse(window.payment_accounts);
      $.pnotify({
        title: 'Yeah',
        text: "Successfully create payment account.",
        type: 'success'
      });
      $('#donate').html("<ul id='donate' class='stats-container'></ul>");
      $('#donate').append("<li><a href='#' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>Stripe</span>"+ response.id +"</span></a></li>");
    },
    error: function (errorResponse, responseText) {
      console.log(errorResponse);
      console.log(responseText);
    }
  });
}

function donateEndowment(id) {
  localStorage.setItem('idEndowment', id);
  redirect("donate.html")
}

function searchCharities() {
  var charities = new Backbone.Collection;
  charities.url = window.serverUrl + 'api/charity.json';
  var data = { query: $('#query').val() }
  $('#loader').show();

  charities.fetch({
    data: data,
    success: function(response, xhr) {
      $('#loader').hide();
      window.charities = JSON.stringify(response);

      addToCharityList(JSON.stringify(response));
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function addToCharityList(source) {
  $.each(JSON.parse(source), function(key, val) {
    window.val = val;
    if (val.charity !== undefined) {
     $('#container-charities').append("<li id='button-modal-"+ val.charity['id'] +"'><a href='#' onclick='detailCharity("+ val.charity['id'] +");' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val.charity['name'] + "</span>0</span></a></li>");

     $('#charity-details').append("<div id='dialog-modal-"+ val.charity['id'] +"'><p style='text-align: right;'>Visibility: <b>"+ val.charity.charity_visibility +"</b></p><br /><p>charity Name: <b>"+ val.charity.name +"</b></p><p>Description: <b>"+ val.charity.description +"</b></p><p>Current Balance: <b>"+ '-' +"</b></p><p>Minimum Donation Amount: <b>"+ val.charity.minimum_donation_amount +"</b></p><br /><p>My Donations: <b>"+ '-' +"</b></p><p>My Grants: <b>"+ '-' +"</b></p><p>My Balance: <b>"+ '-' +"</b></p><br/><p>giv2giv Donations: <b>"+ '-' +"</b></p><p>giv2giv Grants: <b>"+ '-' +"</b></p><p>giv2giv Balance: <b>"+ '-' +"</b></p><br/></div>");
   }
 });
}

function detailCharity(id) {
  var demos = {
    basicDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false
      });

      trigger.on('click', function(e) {
        target.dialog( 'open' );
        e.preventDefault();
      });
    },

    modalDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false,
        modal: true
      });

      trigger.on('click', function(e) {
        target.dialog( 'open' );
        e.preventDefault();
      });
    }
  };

  if( $.fn.dialog ) {
    demos.modalDialog( $('#dialog-modal-'+id), $('#button-modal-'+id) );
  }
}
