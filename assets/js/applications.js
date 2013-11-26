window.indexUrl = "http://localhost/giv2giv-jquery/";
// window.indexUrl = "http://www.giv2giv.org/giv2giv-jquery/";
window.serverUrl = "http://localhost:3000/";
// window.serverUrl = "https://api.giv2giv.org/";

$(document).ready(function() {
});

function checkSession() {
  if(localStorage.session == null){
    $('#header-functions').hide();
    $('#title-my-endowments').html("");

    $('#container-my-endowments').html("");
    $('#container-featured-endowments').html("");

    $('#title-featured-endowments').html("Featured Endowments");
    getFeaturedEndowments($('#container-featured-endowments'));

    $('.inner-nav').html("");
    $('.inner-nav').append("<li class='active'><a href='index.html'><i class='icol-dashboard'></i> Dashboard</a></li><li><a href='login.html'><i class='icol-key'></i> Login</a></li>");

  } else{
    $('#header-functions').show();
    $('#title-my-endowments').html("My Endowments");
    $('#title-featured-endowments').html("Featured Endowments");
    getEndowments($('#container-my-endowments'));
    getFeaturedEndowments($('#container-featured-endowments'));

    var session = JSON.parse(localStorage.session);
    var name = session[0]['donor'].donor.name;
    $('.info .name').text(name);
    $('.inner-nav').append("<li class='donor_profile'><a href='javascript:void(0)'><i class='icol-user'></i> Donor Profile</a></li><li class='statement'><a href='statement.html'><i class='icol-blog'></i> Statement</a></li><li><a href='charities.html'><i class='icol-table'></i> Charities</a></li><li><a onclick='signOut();'><i class='icon-off'></i>Log Out</a></li>");

    if ((localStorage.data_endowment !== undefined) && (localStorage.charity_id !== undefined) && (localStorage.session !== undefined)) {
      createEndowment();

      localStorage.removeItem('charity_id');
      localStorage.removeItem('data_endowment');
      localStorage.removeItem('endowment_id');
    }
    getProfile();
    showAllPaymentAccount();
    // checkPaymentAccount();
  }
}

function checkSessionIndex() {
  if (localStorage.getItem("session") !== null){
    goToDashboard();
  }
}

function updateProfile(){
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var donors = new Backbone.Collection;
  donors.url = window.serverUrl + 'api/donors.json';

  data = {
    donor: {
      name: $('#profile-name').val(),
      address: $('#address').val(),
      city: $('#city').val(),
      state: $('#state').val(),
      zip: $('#zip').val(),
      phone_number: $('#phone_number').val()
    }
  }

  $('#loader-profile').show();
  donors.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: data,
    type: "PUT",
    success: function(response,xhr) {
      localStorage.setItem('profile', JSON.stringify(response));
      $('#loader-profile').hide();

      var profile = JSON.parse(localStorage.profile)[0]['donor'];

      $('#profile-name').val(profile.name);
      $('#address').val(profile.address);
      $('#city').val(profile.city);
      $('#state').val(profile.state);
      $('#zip').val(profile.zip);
      $('#phone_number').val(profile.phone_number);
      $('.info .name').text(profile.name);

      $.pnotify({
        title: 'Yeah',
        text: "Successfully to update donor profile.",
        type: 'success'
      });

      $('#loader-profile').hide();
      $('#profile-modal').remove();

      getProfile();
      // checkPaymentAccount();
      showAllPaymentAccount();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
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
        // console.log(response);
        localStorage.setItem('profile', JSON.stringify(response));

        var profile = JSON.parse(localStorage.profile)[0]['donor'];

        $('.donor_profile').html("<a id='button-profile-"+ profile.id +"' onclick='detailProfile("+ profile.id +");'><i class='icol-user'></i> Donor Profile</a>");

        $('#button-profile-'+ profile.id).click();

        $('#profile-details').html("<div id='profile-modal' href='#'><form id='form-profile' method='post'><div class='control-group'><label class='control-label' for='input00'>Name</label><div class='controls'><input type='text' id='profile-name'></div><label class='control-label' for='input00'>Email</label><div class='controls'><span id='email input07' class='uneditable-input'>"+profile.email+"</span></div><label class='control-label' for='input00'>Address</label><div class='controls'><input type='text' id='address'></div><label class='control-label' for='input00'>City, State, Zip</label><div class='controls'><input type='text' class='input-mini' placeholder='city' id='city'><input type='text' class='input-mini' placeholder='state' id='zip'><input type='text' class='input-mini' placeholder='zip' id='state'></div><label class='control-label' for='input00'>Phone</label><div class='controls'><input type='text' id='phone_number'></div></div><a class='btn' onclick='updateProfile();' href='javascript:void(0)'>Save</a></form><div id='loader-profile' style='display: none;'><img src='assets/images/preloaders/8.gif' alt=''></div><hr/><div id='payment-accounts'></div><ul id='donate' class='stats-container'></ul></div>");

        $('.profile-username').text(profile.name);

        $('.info .name').text(profile.name);

        $('#profile-name').val(profile.name);
        $('#email').val(profile.email);
        $('#address').val(profile.address);
        $('#city').val(profile.city);
        $('#state').val(profile.state);
        $('#zip').val(profile.zip);
        $('#phone_number').val(profile.phone_number)
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
    modalDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false,
        modal: true
      });

      if (($('#payment-account-form').size() == 0)) {
        showAllPaymentAccount();
      }

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

      // localStorage.setItem('funds', response)
      $('.fund-info').append("<p>My Total Fund : "+ fund[0].donor_current_balance +"</p><p>Giv2Giv Total Fund : "+ fund[0].giv2giv_current_balance +"</p>")
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
  var data = { email: $('#input-username').val(), password: $('#input-password').val() }

  accounts.fetch({
    data: data,
    type: "POST",
    success: function(response, xhr) {
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
      localStorage.setItem('session', JSON.stringify(response));

      var accounts = new Backbone.Collection;
      accounts.url = window.serverUrl + 'api/sessions/create.json';
      accounts.fetch({
        data: { email: $('#email').val(), password: $('#password').val() },
        type: "POST",
        success: function(response, xhr) {
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
      window.mpit = JSON.parse(JSON.stringify(response));
      localStorage.clear();
      checkSession();
      getBalanceInformation();
    // redirect("index.html");
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
    error: function (errorResponse) {
      console.log(errorResponse);
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
      error: function (errorResponse) {
        console.log(errorResponse);
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
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
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
      console.log("///////////////////////////////////////////")

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
            console.log("*********************************************")
            localStorage.setItem('endowment_id', JSON.stringify(response));
            $('.form-actions').find('button:contains(Next)').click();

            $.pnotify({
              title: 'Yeah',
              text: "Successfully to create endowment.",
              type: 'success'
            });
          },
          error: function (errorResponse) {
            console.log(errorResponse);
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
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function addCharityToGroup(endowment_id, charity_id, token) {
  var endowment_id = endowment_id[0]['endowment']['id'];
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;

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

function getEndowments(container) {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/donors/subscriptions.json';
  $('#loader').show();

  endowments.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response, xhr) {
      window.endowments = JSON.parse(JSON.stringify(response));
      $('#loader').hide();
      if (window.endowments.length == 0) {
        container.append("<li><a href='#' class='stat summary'><span class='digit'><span class='text'>No Subscribed Endowment</span></span></a></li>");
      } else {
        $.each(window.endowments, function(key, val) {
          val = val[0][Object.keys(val[0])[0]];

          container.append("<li><a href='#' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val.endowment_name + "</span>" + val.endowment_donation_amount + "</span></a></li>");
        });

        // addToEndowmentList(JSON.stringify(response), container);
      }
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function getFeaturedEndowments(container) {
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/endowment.json';
  $('#loader').show();

  var keyword = window.location.search.replace("?query=", "");

  endowments.fetch({
    data: {query: keyword},
    success: function(response, xhr) {
      window.featured_endowments = JSON.parse(JSON.stringify(response));
      var featuredEndowments = window.featured_endowments.sort(function() {return 0.5 - Math.random()}).slice(0,5);
      addToEndowmentList(JSON.stringify(featuredEndowments), container);
      $('#loader').hide();
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function addToEndowmentList(source, container) {
  $.each(JSON.parse(source), function(key, val) {
    if (val.endowment !== undefined) {
      container.append("<li id='button-modal-"+ val.endowment['id'] +"'><a href='#' onclick='detailEndowment("+ val.endowment['id'] +");' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val.endowment['name'] + "</span>0</span></a></li>");


      getDetailEndowment(val.endowment.id);
      if (localStorage.endowment_details !== undefined) {
        var enDetails = JSON.parse(localStorage.endowment_details)[0];
        if (enDetails.my_balances !== undefined) {
          $('#endowment-details').append("<div id='dialog-modal-"+ val.endowment.id +"'><p style='text-align: right;'>Visibility: <b>"+ val.endowment.endowment_visibility +"</b></p><br /><p>Endowment Name: <b>"+ val.endowment.name +"</b></p><p>Description: <b>"+ val.endowment.description +"</b></p><p>Current Balance: <b>"+ '-' +"</b></p><p>Minimum Donation Amount: <b>"+ val.endowment.minimum_donation_amount +"</b></p><br/><div id='donation-status-"+ val.endowment.id +"'></div><p>giv2giv Donations: <b>"+ enDetails.global_balances.endowment_donations +"</b></p><p>giv2giv Grants: <b>"+ enDetails.global_balances.endowment_grants +"</b></p><p>giv2giv Balance: <b>"+ enDetails.global_balances.endowment_balance +"</b></p><hr/><div id='member_charities-"+ val.endowment.id +"'><br/></div></div>");


          memberCharityEndowment(val.endowment.charities, val.endowment.id);

          if (localStorage.session !== undefined) {
            checkPaymentAccont(val.endowment.id, enDetails);
            selectPaymentAccount(val.endowment.id);
          } else {
            $('#donation-status-'+ val.endowment.id).append("<a id='donor-button-modal-"+ val.endowment.id +"' class='btn add-charity' onclick='donateEndowment("+ val.endowment.id +");' href='javascript:void(0)'>Donate Now!</a><br/><br/>");

            $('#donor-button-modal-' + val.endowment.id).click();
          }

          $('#donor-endowment').append("<div id='donor-modal-"+ val.endowment.id +"'>Donate to <b>"+ val.endowment.name +"</b><br /><br /><form id='form-donation-"+ val.endowment.id +"' class='form-horizontal' method='post'><input type='text' name='donor[amount]' id='donor_amount_"+ val.endowment.id +"' placeholder='Amount'/><br/><div id='plan-"+ val.endowment.id +"'></div><br /><div id='select-payment-account-"+ val.endowment.id +"'><select id='selected-payment-account-" + val.endowment.id + "'><option>Select Payment Account</option></select></div><br /><br /><a class='btn' onclick='donateSubscription("+ val.endowment.id +");' href='javascript:void(0)'>Make Donation</a><div id='loader-donate-"+ val.endowment.id +"' style='display: none; float: right;'><img src='assets/images/preloaders/8.gif' alt=''></div></form></div>");

          if (localStorage.session == undefined) {
            $('#plan-' + val.endowment.id).html("<br/><input type='radio' name='time' value='month' disabled>Per Month<br><input type='radio' name='time' value='week' disabled>Per Week<br><input type='radio' name='time' value='onetime' checked='checked'>One Time<br />");

            $('#select-payment-account-' + val.endowment.id).html("<form action='' method='POST' id='payment-form-"+ val.endowment.id +"'><span class='payment-errors'></span><div class='form-row'><input type='text' size='20' data-stripe='number' value='4242424242424242' placeholder='Card Number' /></div><div class='form-row'><input type='text' size='4' data-stripe='cvc' value='314' placeholder='CCV' /></div><div class='form-row'><input type='text' size='2' data-stripe='exp-month' value='9' placeholder='MM' style='width: 15%;' /><input type='text' size='4' data-stripe='exp-year' value='2014'  placeholder='YYYY' style='float: right; margin-right: 50px; width: 55%;' /></div><div class='form-row'><input id='email-"+ val.endowment.id +"' type='text' size='4' value='' placeholder='Email' /></div></form>")
          } else {
            $('#plan-' + val.endowment.id).html("<br/><input type='radio' name='time' value='month'>Per Month<br><input type='radio' name='time' value='week'>Per Week<br><input type='radio' name='time' value='onetime'>One Time<br />");
          }

          $('#selected-payment-account-' + val.endowment.id).change(function() {
            window.payment_account_id = $(this).val();
          });
        }
      }
    }
  });
}

function checkPaymentAccont(id, enDetails) {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;

  var payment_accounts = new Backbone.Collection;
  payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts/all_donation_list.json';

  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: { endowment_id: id },
    // type: "POST",
    success: function(response, xhr) {
      window.response = JSON.parse(JSON.stringify(response));
      console.log(window.response[0].donations.length)
      if (window.response[0].donations.length == 0) {
        $('#donation-status-'+ id).append("<a id='donor-button-modal-"+ id +"' class='btn add-charity' onclick='donateEndowment("+ id +");' href='javascript:void(0)'>Donate Now!</a><br/><br/>");

        $('#donor-button-modal-' + id).click();
      } else {
        $('#donation-status-'+ id).html("<hr/><p>My Donations: <b>"+ enDetails.my_balances.my_donations_amount +"</b></p><p>My Grants: <b>"+ enDetails.my_balances.my_grants_amount +"</b></p><p>My Balance: <b>"+ enDetails.my_balances.my_endowment_balance +"</b></p><br/>");
      }
    },
    error: function (errorResponse) {
      window.errorResponse = console.log(errorResponse);
    }
  });
}

function donateSubscription(id) {

  subscribe_plan = $('input[name=time]:checked', '#form-donation-' + id).val();

  if (subscribe_plan == "month"){
    var session = JSON.parse(localStorage.session);
    var token = session[0]['session']['session'].token;
    var payment_accounts = new Backbone.Collection;

    payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts/' + window.payment_account_id + '/donate_subscription.json';
    data = { amount: $('#donor_amount_' + id).val(), endowment_id: id }

    $('#loader-donate').show();

    payment_accounts.fetch({
      headers: {'Authorization' :'Token token=' + token},
      data: data,
      type: "POST",
      success: function(response, xhr) {
        response = JSON.parse(JSON.stringify(response));
        if ((response[0].message) == "Success") {
          $('#donor-modal-' + id).remove()
          $('#loader-donate').hide();
          $.pnotify({
            title: 'Yeah',
            text: "Successfully donate to this endowment.",
            type: 'success'
          });

          var enDetails = JSON.parse(localStorage.endowment_details)[0];
          checkPaymentAccont(id, enDetails);
        } else {
          $.pnotify({
            title: 'Oops',
            text: response[0].message,
            type: 'error'
          });
        }

      },
      error: function (errorResponse) {
        window.errorResponse = console.log(errorResponse);
      }
    });
  } else if (subscribe_plan == "onetime"){
    Stripe.setPublishableKey('pk_test_ys65GDVxkAM0Ej8fwpDItB2s');

    var stripeResponseHandler = function(status, response) {
      var $form = $('#payment-form-' + id);

      if (response.error) {
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
      } else {
        var stripe_token = response.id;
        console.log(stripe_token)
        $form.append($('<input type="hidden" name="stripeToken" />').val(stripe_token));
        // $form.find('.payment-errors').text(stripe_token);

        var payment_accounts = new Backbone.Collection;

        payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts/one_time_payment.json';
        data = { amount: $('#donor_amount_' + id).val(), endowment_id: id, email: $('#email-' + id).val(), stripeToken: stripe_token}

        $('#loader-donate-' + id).show();

        payment_accounts.fetch({
          data: data,
          type: "POST",
          success: function(response, xhr) {
            response = JSON.parse(JSON.stringify(response));
            if ((response[0].message) == "Success") {
              $('#donor-modal-' + id).remove();
              $('#dialog-modal-' + id).remove();
              $('#loader-donate-' + id).hide();
              $.pnotify({
                title: 'Yeah',
                text: "Successfully donate to this endowment.",
                type: 'success'
              });
            } else {
              $.pnotify({
                title: 'Oops',
                text: response[0].message,
                type: 'error'
              });
            }

          },
          error: function (errorResponse) {
            window.errorResponse = console.log(errorResponse);
          }
        });
      }
    };

    var $form = $('#payment-form-' + id);
    Stripe.createToken($form, stripeResponseHandler);

  }
}

function selectPaymentAccount(id) {
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
        $('#select-payment-account-' + id).html("");
        // $('#select-payment-account-' + id).html("<form class='form-vertical' method='post'><input type='text' placeholder='stripeToken' name='[stripeToken]' id='input-stripe-token'><button type='submit' class='btn btn-success' onclick='createPaymentAccount(); return false;'>Create Payment Account</button></form>");

      } else{
        $.each(payment_accounts, function(key, val) {
          // $('#select-payment-account-' + id).append("<li><a href='#' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val['payment_account'].processor + "</span>"+ val['payment_account'].id +"</span></a></li>");
          $('#select-payment-account-' + id + '> select').append("<option value='"+ val.payment_account.id +"'>" + val.payment_account.stripe_cust_id + "</option>");
        });
      }
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function donateEndowment(id) {
  localStorage.setItem('idEndowment', id);

  var demos = {
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
    demos.modalDialog( $('#donor-modal-'+id), $('#donor-button-modal-'+id) );
  }

  // redirect("donate.html")
}

function memberCharityEndowment(data, id) {
  $('#member_charities-' + id).html("<br />")
  if (data.length == 0) {
    $('#member_charities-' + id).html("No Member Charities");
  } else {
    // $('#member_charities-' + id).html("<ul style='list-style: none;'></ul>")
    $.each(data, function(key, val) {
      $('#member_charities-' + id).append("<ul style='list-style: none; margin: auto;'><li>Member Charity "+ (key+1) + "<br /><div style='margin-left: 15px;'><div style='float: left;'>Name: </div><div style='margin-left: 45px;'>" + val.name +"</div></div><div style='margin-left: 15px;'><div style='float: left;'>State: </div><div style='margin-left: 45px;'>-</div></div><div style='margin-left: 15px;'><div style='float: left;'>City: </div><div style='margin-left: 45px;'>-</div></div></li><br /></ul>");
    })
  }
}

function detailEndowment(id) {
  var demos = {
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

function getDetailEndowment(id) {
  $('#endowment_id').text(localStorage.idEndowment);
  var endowments = new Backbone.Collection;
  endowments.url = window.serverUrl + 'api/endowment/' + id + '.json';

  endowments.fetch({
    success: function(response, xhr) {
      // window.endowment = JSON.parse(result);
      // localStorage.setItem('endowment_details', JSON.parse(result));
      localStorage.setItem('endowment_details', JSON.stringify(response));
    },
    error: function (errorResponse) {
      localStorage.setItem('endowment_details', "");
      console.log(errorResponse);
    }
  });
}

function showAllPaymentAccount() {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var payment_accounts = new Backbone.Collection;
  payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts.json';


  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response, xhr) {
      // alert("iiiiiiiiiiiiiiiiiiii");
      $('#payment-accounts').html("<form action='' method='POST' id='payment-account-form'><span class='payment-errors'></span><div class='form-row'><input type='text' size='20' data-stripe='number' value='4242424242424242' placeholder='Card Number' /></div><div class='form-row'><input type='text' size='4' data-stripe='cvc' value='314' placeholder='CCV' /></div><div class='form-row'><input type='text' size='2' data-stripe='exp-month' value='9' placeholder='MM' style='width: 15%;' /><input type='text' size='4' data-stripe='exp-year' value='2014'  placeholder='YYYY' style='float: right; margin-right: 37px; width: 58%;'/></div><button type='submit' class='btn btn-success btn-block' onclick='createPaymentAccount(); return false;' style='width: 86%;'>Create Payment Account</button></form><br /><br />");

      window.payment_accounts = JSON.stringify(response);
      var payment_accounts = JSON.parse(window.payment_accounts);
      $('#payment-accounts').append("<ul style='list-style: none; margin: auto;'></ul>");
      $.each(payment_accounts, function(key, val) {
        $('#payment-accounts ul').append("<li id='payment-account-"+ val.payment_account.id +"'>Payment Account "+ val.payment_account.id + "<span><a onclick='destroyPaymentAccount("+ val.payment_account.id +")'> [x]</a></span><span><a onclick='editPaymentAccount("+ val.payment_account.id +")'> [edit]</a></span><br /><div style='margin-left: 15px;'><div>" + val.payment_account.processor + " - " + val.payment_account.stripe_cust_id +"</div></div></li><br />");
      });
    },
    error: function (errorResponse) {
      console.log(errorResponse);
      $.pnotify({
        title: 'Oops',
        text: "Unable to fetch data. Please reload this page.",
        type: 'error'
      });
    }
  });
}

function editPaymentAccount(id) {
  $('#payment-accounts form').html("<span class='payment-errors'></span><div class='form-row'><input type='text' size='20' data-stripe='number' value='4242424242424242' placeholder='Card Number' /></div><div class='form-row'><input type='text' size='4' data-stripe='cvc' value='314' placeholder='CCV' /></div><div class='form-row'><input type='text' size='2' data-stripe='exp-month' value='9' placeholder='MM' style='width: 15%;' /><input type='text' size='4' data-stripe='exp-year' value='2014'  placeholder='YYYY' style='float: right; margin-right: 37px; width: 58%;' /></div><button type='submit' class='btn btn-success btn-block' onclick='updatePaymentAccount("+ id +"); return false;' style='width: 86%;'>Update Payment Account</button>");
}

function destroyPaymentAccount(id) {
  var payment_accounts = new Backbone.Collection;
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts/'+ id +'.json';

  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    method: "DELETE",
    success: function(response, xhr) {
      $('#payment-account-'+id).remove();

      $.pnotify({
        title: 'Yeah',
        text: "Successfully remove payment account.",
        type: 'success'
      });
    },
    error: function (errorResponse) {
      console.log(errorResponse)
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
          $('#donate').html("<form class='form-vertical' method='post'><input type='text' placeholder='stripeToken' name='[stripeToken]' id='input-stripe-token'><button type='submit' class='btn btn-success btn-block' onclick='createPaymentAccount(); return false;'>Create Payment Account</button></form>");
        } else{
          var str = window.location.pathname;
          if (str.indexOf("index") !== -1) {
            $.each(payment_accounts, function(key, val) {
              $('#donate').html("<li><a href='#' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val['payment_account'].processor + "</span>"+ val['payment_account'].id +"</span></a></li>");
            });
          } else {
            $('#donate').text("Form Donate")
          }
        }
      },
      error: function (errorResponse) {
        console.log(errorResponse);
      }
    });
}
}

function createPaymentAccount() {
  Stripe.setPublishableKey('pk_test_ys65GDVxkAM0Ej8fwpDItB2s');
  var $form = $('#payment-account-form');

  var stripeResponseHandler = function(status, response) {
    if (response.error) {
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      var stripe_token = response.id;
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      $form.find('.payment-errors').text(token);

      var session = JSON.parse(localStorage.session);
      var token = session[0]['session']['session'].token;
      var payment_accounts = new Backbone.Collection;
      payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts.json';

      var data = {
        processor: "stripe",
        stripeToken: stripe_token
      }

      payment_accounts.fetch({
        headers: {'Authorization' :'Token token=' + token},
        data: data,
        type: "POST",
        success: function(response, xhr) {
          window.payment_accounts = JSON.stringify(response);
          var payment_accounts = JSON.parse(window.payment_accounts);
          $('#payment-account-form input').val("");

          $.pnotify({
            title: 'Yeah',
            text: "Successfully create payment account.",
            type: 'success'
          });

          var payment_account = payment_accounts[0].payment_account;

          $('#payment-accounts ul').append("<li id='payment-account-"+ payment_account.id +"'>Payment Account "+ '-' + "<span><a onclick='destroyPaymentAccount("+ payment_account.id +")'> [x]</a></span><br /><div style='margin-left: 15px;'><div>" + payment_account.processor + " - " + payment_account.stripe_cust_id +"</div></div></li><br />");
          // $.each(payment_accounts, function(key, val) {
          // });
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}
};

Stripe.createToken($form, stripeResponseHandler);
}

function updatePaymentAccount(id) {
  Stripe.setPublishableKey('pk_test_ys65GDVxkAM0Ej8fwpDItB2s');
  var $form = $('#payment-account-form');

  var stripeResponseHandler = function(status, response) {
    if (response.error) {
      $form.find('.payment-errors').text(response.error.message);
      $form.find('button').prop('disabled', false);
    } else {
      var stripe_token = response.id;
      $form.append($('<input type="hidden" name="stripeToken" />').val(token));
      $form.find('.payment-errors').text(token);

      var session = JSON.parse(localStorage.session);
      var token = session[0]['session']['session'].token;
      var payment_accounts = new Backbone.Collection;
      payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts.json';
      payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts/' + id + '.json';

      var data = {
        processor: "stripe",
        stripeToken: stripe_token
      }

      payment_accounts.fetch({
        headers: {'Authorization' :'Token token=' + token},
        data: data,
        type: "PUT",
        success: function(response, xhr) {
          response = JSON.parse(JSON.stringify(response));
          if ((response[0].message) == "Success") {
            $('#donor-modal-' + id).remove()
            $('#loader-donate').hide();
            $.pnotify({
              title: 'Yeah',
              text: "Successfully update payment account.",
              type: 'success'
            });

            var enDetails = JSON.parse(localStorage.endowment_details)[0];
            checkPaymentAccont(id, enDetails);
          } else {
            $.pnotify({
              title: 'Oops',
              text: response[0].message,
              type: 'error'
            });
          }

          alert("yeyeyeyee");
          // window.payment_accounts = JSON.stringify(response);
          // var payment_accounts = JSON.parse(window.payment_accounts);
          // $('#payment-account-form input').val("");

          // $.pnotify({
          //   title: 'Yeah',
          //   text: "Successfully update payment account.",
          //   type: 'success'
          // });

          // var payment_account = payment_accounts[0].payment_account;
          // $('#payment-accounts ul').append("<li id='payment-account-"+ payment_account.id +"'>Payment Account "+ '-' + "<span><a onclick='destroyPaymentAccount("+ payment_account.id +")'> [x]</a></span><br /><div style='margin-left: 15px;'><div>" + payment_account.processor + " - " + payment_account.stripe_cust_id +"</div></div></li><br />");
        },
        error: function (errorResponse) {
          console.log(errorResponse);
        }
      });
}
};

Stripe.createToken($form, stripeResponseHandler);
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
  $('#container-charities').html("");
  $.each(JSON.parse(source), function(key, val) {
    window.val = val;
    if (val.charity !== undefined) {
      $('#container-charities').append("<li id='button-modal-"+ val.charity.id +"'><a href='#' onclick='detailCharity("+ val.charity.id +");' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val.charity.name + "</span>0</span></a></li>");

      $('#charity-details').append("<div id='dialog-modal-"+ val.charity.id +"'><p>Charity Name: <b>"+ val.charity.name +"</b></p><p>Charity Email: <b>"+ val.charity.email +"</b></p><p>Address: <b>"+ val.charity.address +"</b></p><p>City, State, Zip: <b>"+ '-' +"</b></p><p>Activity: <b>"+ '-' +"</b></p><p>Classification: <b>"+ val.charity.classification_code +"</b></p><p>NTEE: <b>"+ val.charity.ntee_code +"</b></p><br/><p>Total granted to charity from me: <b>"+ '-' +"</b></p><p>Total granted to charity from giv2giv: <b>"+ '-' +"</b><br/></div>");
    }
  });
}

function detailCharity(id) {
  var demos = {
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

