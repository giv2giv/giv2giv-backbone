window.indexUrl = "http://localhost/giv2giv-jquery/";
// window.indexUrl = "http://www.giv2giv.org/giv2giv-jquery/";

// window.serverUrl = "http://localhost:3000/";
// window.stripePublishKey = "pk_test_ys65GDVxkAM0Ej8fwpDItB2s"

window.serverUrl = "https://api.giv2giv.org/";
window.stripePublishKey = "pk_test_d678rStKUyF2lNTZ3MfuOoHy"

$(document).ready(function() {
});

function checkContainerVisibility() {
  if ($('#public').is(":checked") || $('#private').is(":checked")) {
    $('#container-visibility').addClass("success");
  };
}

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

    var str = window.location.href;
    if (str.indexOf("reset_token") !== -1) {
      resetPassword();
    }

  } else{
    $('#header-functions').show();
    $('#title-my-endowments').html("My Endowments");
    $('#title-featured-endowments').html("Featured Endowments");
    getEndowments($('#container-my-endowments'));
    getFeaturedEndowments($('#container-featured-endowments'));

    var session = JSON.parse(localStorage.session);
    var name = session[0]['donor'].donor.name;
    $('.info .name').text(name);
    $('.inner-nav').append("<li class='donor_profile'><a href='javascript:void(0)'><i class='icol-user'></i> Donor Profile</a></li><li class='statement'><a href='#'><i class='icol-blog'></i> Statement</a></li><li><a href='charities.html'><i class='icol-table'></i> Charities</a></li><li><a onclick='signOut();'><i class='icon-off'></i>Log Out</a></li>");

    if ((localStorage.data_endowment !== undefined) && (localStorage.charity_id !== undefined) && (localStorage.session !== undefined)) {
      createEndowment();

      localStorage.removeItem('charity_id');
      localStorage.removeItem('data_endowment');
      localStorage.removeItem('endowment_id');
    }
    getProfile();
    showAllPaymentAccount();
    getDonorStatement();

    // checkPaymentAccount();
  }
}

function forgotPassword() {
  var accounts = new Backbone.Collection;
  accounts.url = window.serverUrl + 'api/donors/forgot_password.json';
  data = { email: $( "input[name='Reset[email]']" ).val() }

  $('#loader').show();
  accounts.fetch({
    type: "POST",
    data: data,
    success: function(response, xhr) {
      response = JSON.parse(JSON.stringify(response));
      $( "input[name='Reset[email]']" ).val("");

      $.pnotify({
        title: 'Yeah',
        text: response[0].message,
        type: 'success'
      });
    },
    error: function (errorResponse) {
      console.log(errorResponse)
    }
  });
}

function resetPassword() {
  var accounts = new Backbone.Collection;
  accounts.url = window.serverUrl + 'api/donors/reset_password.json';
  reset_token = window.location.search.split("?reset_token=")
  data = { reset_token: reset_token[1] }

  $('#loader').show();
  accounts.fetch({
    type: "GET",
    data: data,
    success: function(response, xhr) {
      response = JSON.parse(JSON.stringify(response));
      $.pnotify({
        title: 'Yeah',
        text: response[0].message,
        type: 'success'
      });
    },
    error: function (errorResponse) {
      console.log(errorResponse)
    }
  });
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
        window.profile = JSON.parse(localStorage.profile)[0]['donor'];

        $('.donor_profile').html("<a id='button-profile-"+ profile.id +"' onclick='detailProfile("+ profile.id +");'><i class='icol-user'></i> Donor Profile</a>");

        $('#button-profile-'+ profile.id).click();

        $('#profile-details').html("<div id='profile-modal' href='#'><form id='form-profile' method='post'><div class='control-group'><label class='control-label' for='input00'>Name</label><div class='controls'><input type='text' id='profile-name'></div><label class='control-label' for='input00'>Email</label><div class='controls'><span id='email input07' class='uneditable-input'>"+profile.email+"</span></div><label class='control-label' for='input00'>Address</label><div class='controls'><input type='text' id='address'></div><label class='control-label' for='input00'>City, State, Zip</label><div class='controls'><input type='text' class='input-mini' placeholder='city' id='city'><input type='text' class='input-mini' placeholder='state' id='zip'><input type='text' class='input-mini' placeholder='zip' id='state'></div><label class='control-label' for='input00'>Phone</label><div class='controls'><input type='text' id='phone_number'></div></div><a class='btn btn-success' onclick='updateProfile();' href='javascript:void(0)'>Save</a></form><div id='loader-profile' style='display: none;'><img src='assets/images/preloaders/8.gif' alt=''></div><hr/><div id='payment-accounts'></div><ul id='donate' class='stats-container'></ul></div>");

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
        // redirect("index.html");
      }
    });
}
}

function getDonorStatement() {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;

  var payment_accounts = new Backbone.Collection;
  // payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts/all_donation_list.json';
  payment_accounts.url = window.serverUrl + 'api/donors/donations.json';

  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    data: { start_date: "2012-01-01" },
    success: function(response,xhr) {
      var profile = JSON.parse(localStorage.profile)[0]['donor'];
      var response = JSON.parse(JSON.stringify(response));
      window.mpit = response;
      if (response.length !== 0) {
        var count = Object.keys(response[0]).length;
        // localStorage.setItem('profile', JSON.stringify(response));
        // detailStatement(profile.id);

        $('.statement').html("<a id='button-statement-"+ profile.id +"' onclick='detailStatement("+ profile.id +");'><i class='icol-blog'></i> Statement</a>");

        $('#button-statement-'+ profile.id).click();

        // mpot
        if (count == 0) {
          $('#donor-statement-details').html("<div id='donor-statement-modal' href='#'><div id='invoice-toolbar' class='btn-toolbar'><div class='btn-group'><button type='button' id='invoice-print' class='btn'><i class='icol-printer'></i> Print Invoice</button></div></div><div class='invoice paper-stack'><div class='invoice-header clearfix'><div class='invoice-logo'><img src='assets/images/logo.png' alt=''></div><div class='invoice-company'>Giv2Giv<br>190 Doe Hill Drive<br>Churchville VA<br>24421<br></div></div><div class='invoice-sub clearfix'><div class='invoice-to'><span class='invoice-caption'></span><b>Donor Name: </b><span>" + profile.name + "</span><br><b>Email: </b><span>" + profile.email + "</span><br><b>Address: </b><span>" + profile.email + "</span><br><b>City, State, Zip: </b><span>" + profile.city + " " + profile.state + " " + profile.zip + "</span><br></div><div class='invoice-info'><span class='invoice-caption'></span><ul><li>Statement Print Date <span>October 25, 2012</span></li></ul></div></div><div class='invoice-content clearfix'><ul style='list-style: none; margin-top: 15px;' id='donation-container'>No More Donations</ul><div class='invoice-total'><span>Total Donations in 2013:</span> $ "+ response[0].total +"</div></div><div style='width: 70%; padding: 10px;'>Giv2Giv is a 501(c)(3) charitable organization. No goods or services were provided to you by Giv2Giv in exchange for your donation. This donation may be claimed for a deduction from your U.S. taxes. Please consult with your tax counsel regarding the deductibility rules that apply to your specific tax situation.</div></div></div>");

        } else {
          $('#donor-statement-details').html("<div id='donor-statement-modal' href='#'><div id='invoice-toolbar' class='btn-toolbar'><div class='btn-group'><button type='button' id='invoice-print' class='btn'><i class='icol-printer'></i> Print Invoice</button></div></div><div class='invoice paper-stack'><div class='invoice-header clearfix'><div class='invoice-logo'><img src='assets/images/logo.png' alt=''></div><div class='invoice-company'>Giv2Giv<br>190 Doe Hill Drive<br>Churchville VA<br>24421<br></div></div><div class='invoice-sub clearfix'><div class='invoice-to'><span class='invoice-caption'></span><b>Print Statement for Year : </b><span><select name='year'><option value='2013'>2013</option><option value='2014'>2014</option></select></span><br><br><b>Donor Name: </b><span>" + profile.name + "</span><br><b>Email: </b><span>" + profile.email + "</span><br><b>Address: </b><span>" + profile.email + "</span><br><b>City, State, Zip: </b><span>" + profile.city + " " + profile.state + " " + profile.zip + "</span><br></div><div class='invoice-info'><span class='invoice-caption'></span><ul><li>Statement Print Date <span>October 25, 2012</span></li></ul></div></div><div class='invoice-content clearfix'><ul style='list-style: none; margin-top: 15px;' id='donation-container'></ul><div class='invoice-total'><span>Total Donations in 2013:</span> $ "+ response[0].total +"</div></div><div style='width: 70%; padding: 10px;'>Giv2Giv is a 501(c)(3) charitable organization. No goods or services were provided to you by Giv2Giv in exchange for your donation. This donation may be claimed for a deduction from your U.S. taxes. Please consult with your tax counsel regarding the deductibility rules that apply to your specific tax situation.</div></div></div>");
        }

        window.lili = response[0];
        $.each(response[0].donations, function(key, val) {
          // window.lolo = val;
          getEndowentById(val, response[0].total);
        });


        $('#invoice-print').on('click', function() { window.print(); });
      };
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function getEndowentById(val, total) {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;

  var payment_accounts = new Backbone.Collection;
  payment_accounts.url = window.serverUrl + 'api/endowment/'+ val.donation.endowment_id +'.json';

  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response, xhr) {
      data = JSON.parse(JSON.stringify(response));

      $('#donation-container').append("<li>Donations To: "+ data[0].endowment.endowment.name +"<br /><div style='margin-left: 15px;'><div style='float: left;'>"+ val.donation.created_at +" </div><div style='margin-left: 45px;'> $"+ val.donation.gross_amount +"</div></div><div style='margin-left: 45px;'>Total Donated to "+ data[0].endowment.endowment.name +": "+ total +"</div></li><br />");
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
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

function detailStatement(id) {
  localStorage.setItem('detailStatement', true);

  var demos = {
    modalDialog: function( target, trigger ) {
      target.dialog({
        autoOpen: false,
        modal: true
      });

      trigger.on('click', function(e) {
        target.dialog( 'open' );
        $('.ui-dialog #donor-statement-modal').parent().css({ 'position': 'absolute', 'margin': 'auto', 'top': 0, 'right': 0, 'bottom': 0, 'left': 0, 'width': '1200px', 'height': '600px' });
        e.preventDefault();
      });
    }
  };


  if( $.fn.dialog ) {
    demos.modalDialog( $('#donor-statement-modal'), $('#button-statement-'+id) );
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
      localStorage.clear();
      checkSession();
      getBalanceInformation();
      getFeaturedEndowments($('#container-featured-endowments'));
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

  $('.form-actions').find('button:contains(Next)').click();
}

function createEndowment(){
  if ((localStorage.data_endowment !== undefined) && (localStorage.charity_id !== undefined) && (localStorage.session !== undefined)) {
    var session = JSON.parse(localStorage.session);
    var token = session[0]['session']['session'].token;
    var charity_id = JSON.parse(localStorage.charity_id);

    // creatingEndowment(JSON.parse(localStorage.data_endowment), token);

    if (charity_id.length == 0) {
      $.pnotify({
        title: 'Oops!',
        text: "Please select charities first.",
        type: 'error'
      });
    } else {
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
    }


    localStorage.removeItem('charity_id');
    localStorage.removeItem('data_endowment');
    localStorage.removeItem('endowment_id');
  } else {
    var charity_id = $('#selected-charities li').map(function(i,n) { return $(n).attr('id');}).get();
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
            var endowment_id = JSON.parse(JSON.stringify(response));
            addCharityToGroup(endowment_id, charity_id, token);

            $('#loader').hide();
            localStorage.setItem('endowment_id', JSON.stringify(response));
            var val = JSON.parse(localStorage.endowment_id)[0];

            var enDetails = JSON.parse(localStorage.endowment_details)[0];
            if (enDetails.my_balances !== undefined) {
              memberCharityEndowment(val.endowment.charities, val.endowment.id);

              if (localStorage.session !== undefined) {
                checkPaymentAccont(val.endowment.id, enDetails);
                selectPaymentAccount(val.endowment.id);
              }
            }

            $('#donor-endowment').append("<div id='donor-modal-"+ val.endowment.id +"'>Donate to <b>"+ val.endowment.name +"</b><br /><br /><form id='form-donation-"+ val.endowment.id +"' class='form-horizontal' method='post'><input type='text' name='donor[amount]' id='donor_amount_"+ val.endowment.id +"' placeholder='Amount'/><br/><div id='plan-"+ val.endowment.id +"'></div><br /><div id='select-payment-account-"+ val.endowment.id +"'><select id='selected-payment-account-" + val.endowment.id + "'><option>Select Payment Account</option></select></div><br /><br /><a class='btn btn-success' onclick='donateSubscription("+ val.endowment.id +");' href='javascript:void(0)'>Make Donation</a><div id='loader-donate-"+ val.endowment.id +"' style='display: none; float: right;'><img src='assets/images/preloaders/8.gif' alt=''></div></form></div>");

            $('#plan-' + val.endowment.id).html("<br/><input type='radio' name='time' value='month'>Per Month<br><!--<input type='radio' name='time' value='week'>Per Week<br>--><input type='radio' name='time' value='onetime'>One Time<br />");

            console.log("popopooooooo");
            $('input[name=time]', '#form-donation-' + val.endowment.id).click(function() {
              if ($('input[name=time]:checked').val() == 'onetime') {
                $('#plan-' + val.endowment.id).append("<br /><input type='password' placeholder='Password' name='[password]' id='input-password-one-time' class='big required'>")
              } else {
                $('#plan-' + val.endowment.id + '> input[id=input-password-one-time]').remove();
              }
            });

            $('#selected-payment-account-' + val.endowment.id).change(function() {
              window.payment_account_id = $(this).val();
            });

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

          $.each(Object.keys(window.endowments), function( index, value ) {
            // console.log( value );
            var val = window.endowments[value]
            data = val[0][Object.keys(val[0])[0]];
            // console.log( val[0][Object.keys(val[0])[0]] );
            container.append("<li><a href='#' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + data.endowment_name + "</span>" + data.endowment_donation_amount + "</span></a></li>");
          });


          // val = val[0][Object.keys(val[0])[0]];
          // window.piti = val;
          // container.append("<li id='button-modal-"+ val.endowment['id'] +"'><a href='#' onclick='detailEndowment("+ val.endowment_name +");' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val.endowment_name + "</span>0</span></a></li>");

          getDetailEndowment(val.endowment.id);
          if (localStorage.endowment_details !== undefined) {
            var enDetails = JSON.parse(localStorage.endowment_details)[0];
            if (enDetails.my_balances !== undefined) {
              $('#endowment-details').append("<div id='dialog-modal-"+ val.endowment.id +"'><p style='text-align: right;'>Visibility: <b>"+ val.endowment.endowment_visibility +"</b></p><br /><p>Endowment Name: <b>"+ val.endowment.name +"</b></p><p>Description: <b>"+ val.endowment.description +"</b></p><p>Current Balance: <b>"+ '-' +"</b></p><p>Minimum Donation Amount: <b>"+ val.endowment.minimum_donation_amount +"</b></p><br/><div id='donation-status-"+ val.endowment.id +"'></div><div id='giv2giv-data-"+ val.endowment.id +"'></div><p>giv2giv Donations: <b>"+ enDetails.global_balances.endowment_donations +"</b></p><p>giv2giv Grants: <b>"+ enDetails.global_balances.endowment_grants +"</b></p><p>giv2giv Balance: <b>"+ enDetails.global_balances.endowment_balance +"</b></p><hr/><div id='member_charities-"+ val.endowment.id +"'><br/></div></div>");

              memberCharityEndowment(val.endowment.charities, val.endowment.id);

              if (localStorage.session !== undefined) {
                checkPaymentAccont(val.endowment.id, enDetails);
                selectPaymentAccount(val.endowment.id);
              } else {
                $('#donation-status-'+ val.endowment.id).append("<a id='donor-button-modal-"+ val.endowment.id +"' class='btn add-charity' onclick='donateEndowment("+ val.endowment.id +");' href='javascript:void(0)'>Donate Now!</a><br/><br/>");

                $('#donor-button-modal-' + val.endowment.id).click();
              }

              $('#donor-endowment').append("<div id='donor-modal-"+ val.endowment.id +"'>Donate to <b>"+ val.endowment.name +"</b><br /><br /><form id='form-donation-"+ val.endowment.id +"' class='form-horizontal' method='post'><input type='text' name='donor[amount]' id='donor_amount_"+ val.endowment.id +"' placeholder='Amount'/><br/><div id='plan-"+ val.endowment.id +"'></div><br /><div id='select-payment-account-"+ val.endowment.id +"'><select id='selected-payment-account-" + val.endowment.id + "'><option>Select Payment Account</option></select></div><br /><br /><a class='btn btn-success' onclick='donateSubscription("+ val.endowment.id +");' href='javascript:void(0)'>Make Donation</a><div id='loader-donate-"+ val.endowment.id +"' style='display: none; float: right;'><img src='assets/images/preloaders/8.gif' alt=''></div></form></div>");

              if (localStorage.session == undefined) {
                $('#plan-' + val.endowment.id).html("<br/><input type='radio' name='time' value='month' disabled>Per Month<br><!--<input type='radio' name='time' value='week' disabled>Per Week<br>--><input type='radio' name='time' value='onetime' checked='checked'>One Time<br />");

                $('#select-payment-account-' + val.endowment.id).html("<form action='' method='POST' id='payment-form-"+ val.endowment.id +"'><span class='payment-errors'></span><div class='form-row'><input type='text' size='20' data-stripe='number' value='4242424242424242' placeholder='Card Number' /></div><div class='form-row'><input type='text' size='4' data-stripe='cvc' value='314' placeholder='CCV' /></div><div class='form-row'><input type='text' size='2' data-stripe='exp-month' value='9' placeholder='MM' style='width: 15%;' /><input type='text' size='4' data-stripe='exp-year' value='2014'  placeholder='YYYY' style='float: right; margin-right: 50px; width: 55%;' /></div><div class='form-row'><input id='email-"+ val.endowment.id +"' type='text' size='4' value='' placeholder='Email' /></div></form>")
              } else {
                $('#plan-' + val.endowment.id).html("<br/><input type='radio' name='time' value='month'>Per Month<br><!--<input type='radio' name='time' value='week'>Per Week<br>--><input type='radio' name='time' value='onetime'>One Time<br />");

                $('input[name=time]', '#form-donation-' + val.endowment.id).click(function() {
                  if ($('input[name=time]:checked').val() == 'onetime') {
                    $('#plan-' + val.endowment.id).append("<br /><input type='password' placeholder='Password' name='[password]' id='input-password-one-time' class='big required'>")
                  } else {
                    $('#plan-' + val.endowment.id + '> input[id=input-password-one-time]').remove();
                  }
                });

            // cek payment account

            $('#selected-payment-account-' + val.endowment.id).change(function() {
              window.payment_account_id = $(this).val();
            });
          }
        }
      }

          // addToEndowmentList(JSON.stringify(response), container);
        });

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
      getDetailEndowment(val.endowment.id);

      container.append("<li id='button-modal-"+ val.endowment.id +"'><a href='#' onclick='detailEndowment("+ val.endowment.id +");' class='stat summary'><span class='icon icon-circle bg-green'><i class='icon-stats'></i></span><span class='digit'><span class='text'>" + val.endowment.name + "</span><span id='balance-"+ val.endowment.id +"'>-</span></span></a></li>");

      if (localStorage.endowment_details !== undefined) {
        var enDetails = JSON.parse(localStorage.endowment_details)[0];
        if (enDetails.my_balances !== undefined) {
          $('#endowment-details').append("<div id='dialog-modal-"+ val.endowment.id +"'><p style='text-align: right;'>Visibility: <b>"+ val.endowment.endowment_visibility +"</b></p><br /><p>Endowment Name: <b>"+ val.endowment.name +"</b></p><p>Description: <b>"+ val.endowment.description +"</b></p><p>Current Balance: <b>0.0</b></p><p>Minimum Donation Amount: <b>"+ val.endowment.minimum_donation_amount +"</b></p><br/><div id='donation-status-"+ val.endowment.id +"'></div><div id='giv2giv-data-"+ val.endowment.id +"'></div><hr/><div id='member_charities-"+ val.endowment.id +"'><br/></div></div>");

          // for donor statement
          // if (localStorage.detailStatement == "true") {
          //   console.log("mpiiiiit")
          //   $('#donation-container').append("<li>Donations To: "+ enDetails.endowment.endowment.name +"<br /><div style='margin-left: 15px;'><div style='float: left;'>Date 1</div><div style='margin-left: 45px;'>Amount 1</div></div><div style='margin-left: 15px;'><div style='float: left;'>Date 2</div><div style='margin-left: 45px;'>Amount 2</div></div><div style='margin-left: 45px;'>Total Donated to Endowment Name: 0.0</div></li><br />");
          // }

          memberCharityEndowment(val.endowment.charities, val.endowment.id);

          if (localStorage.session !== undefined) {
            checkPaymentAccont(val.endowment.id, enDetails);
            selectPaymentAccount(val.endowment.id);
          } else {
            $('#donation-status-'+ val.endowment.id).append("<a id='donor-button-modal-"+ val.endowment.id +"' class='btn add-charity' onclick='donateEndowment("+ val.endowment.id +");' href='javascript:void(0)'>Donate Now!</a><br/><br/>");

            $('#donor-button-modal-' + val.endowment.id).click();
          }

          $('#donor-endowment').append("<div id='donor-modal-"+ val.endowment.id +"'>Donate to <b>"+ val.endowment.name +"</b><br /><br /><form id='form-donation-"+ val.endowment.id +"' class='form-horizontal' method='post'><input type='text' name='donor[amount]' id='donor_amount_"+ val.endowment.id +"' placeholder='Amount'/><br/><div id='plan-"+ val.endowment.id +"'></div><br /><div id='select-payment-account-"+ val.endowment.id +"'><select id='selected-payment-account-" + val.endowment.id + "'><option>Select Payment Account</option></select></div><br /><br /><a class='btn btn-success' onclick='donateSubscription("+ val.endowment.id +");' href='javascript:void(0)'>Make Donation</a><div id='loader-donate-"+ val.endowment.id +"' style='display: none; float: right;'><img src='assets/images/preloaders/8.gif' alt=''></div></form></div>");

          if (localStorage.session == undefined) {
            $('#plan-' + val.endowment.id).html("<br/><input type='radio' name='time' value='month' disabled>Per Month<br><!--<input type='radio' name='time' value='week' disabled>Per Week<br>--><input type='radio' name='time' value='onetime' checked='checked'>One Time<br />");

            $('#select-payment-account-' + val.endowment.id).html("<form action='' method='POST' id='payment-form-"+ val.endowment.id +"'><span class='payment-errors'></span><div class='form-row'><input type='text' size='20' data-stripe='number' value='4242424242424242' placeholder='Card Number' /></div><div class='form-row'><input type='text' size='4' data-stripe='cvc' value='314' placeholder='CCV' /></div><div class='form-row'><input type='text' size='2' data-stripe='exp-month' value='9' placeholder='MM' style='width: 15%;' /><input type='text' size='4' data-stripe='exp-year' value='2014'  placeholder='YYYY' style='float: right; margin-right: 50px; width: 55%;' /></div><div class='form-row'><input id='email-"+ val.endowment.id +"' type='text' size='4' value='' placeholder='Email' /></div></form>")
          } else {
            $('#plan-' + val.endowment.id).html("<br/><input type='radio' name='time' value='month'>Per Month<br><!--<input type='radio' name='time' value='week'>Per Week<br>--><input type='radio' name='time' value='onetime'>One Time<br />");

            $('input[name=time]', '#form-donation-' + val.endowment.id).click(function() {
              if ($('input[name=time]:checked').val() == 'onetime') {
                $('#plan-' + val.endowment.id).append("<br /><input type='password' placeholder='Password' name='[password]' id='input-password-one-time' class='big required'>")
              } else {
                $('#plan-' + val.endowment.id + '> input[id=input-password-one-time]').remove();
              }
            });

            // cek payment account

          }

          $('#selected-payment-account-' + val.endowment.id).change(function() {
            window.payment_account_id = $(this).val();
          });
        }
      }
    }
  });
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
      localStorage.setItem('endowment_details_' + id, JSON.stringify(response));

      var balance = JSON.parse(JSON.stringify(response))[0].global_balances;
      $('#balance-' + id).text(balance.endowment_balance);
      $('#giv2giv-data-' + id).html("<p>giv2giv Donations: <b>"+ balance.endowment_donations +"</b></p><p>giv2giv Grants: <b>"+ balance.endowment_grants +"</b></p><p>giv2giv Balance: <b>"+ balance.endowment_balance +"</b></p>");

      // $('#donation-container').append("<li>Donations To: Endowment "+ response +"<br /><div style='margin-left: 15px;'><div style='float: left;'>Date 1</div><div style='margin-left: 45px;'>Amount 1</div></div><div style='margin-left: 15px;'><div style='float: left;'>Date 2</div><div style='margin-left: 45px;'>Amount 2</div></div><div style='margin-left: 45px;'>Total Donated to Endowment Name: 0.0</div></li><br />")
    },
    error: function (errorResponse) {
      // localStorage.setItem('endowment_details', "");
      console.log(errorResponse);
      console.log("Failed");
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

    $('#form-donation-' + localStorage.idEndowment + ' .btn').text('Loading...')
    $('#form-donation-' + localStorage.idEndowment + ' .btn').attr('disabled', true);

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
          $('#form-donation-' + localStorage.idEndowment + ' .btn').attr('disabled', false);
          $('#form-donation-' + localStorage.idEndowment + ' .btn').text('Make Donation')

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
  $('#form-donation-' + localStorage.idEndowment + ' .btn').text('Loading...')
  $('#form-donation-' + localStorage.idEndowment + ' .btn').attr('disabled', true);

  if (localStorage.session == undefined) {
    Stripe.setPublishableKey(window.stripePublishKey);

    var stripeResponseHandler = function(status, response) {
      var $form = $('#payment-form-' + id);

      if (response.error) {
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
      } else {
        var stripe_token = response.id;
        console.log(stripe_token)
        $form.append($('<input type="hidden" name="stripeToken" />').val(stripe_token));

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
  } else {
    var session = JSON.parse(localStorage.session);
    var token = session[0]['session']['session'].token;
    var payment_accounts = new Backbone.Collection;

    payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts/one_time_payment.json';
    data = { amount: $('#donor_amount_' + id).val(), endowment_id: id, email: session[0]['donor'].donor.email, payment_account_id: window.payment_account_id, password: $('#input-password-one-time').val() }

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
  }
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

      } else{
        $.each(payment_accounts, function(key, val) {
          $('#select-payment-account-' + id + '> select').append("<option value='"+ val.payment_account.id +"'>" + val.payment_account.stripe_cust_id + "</option>");
        });
      }
    },
    error: function (errorResponse) {
      console.log(errorResponse);
    }
  });
}

function openProfileForm() {
  $('#profile-modal').dialog();
  localStorage.setItem('openProfileForm', true);
}

function donateEndowment(id) {
  localStorage.setItem('idEndowment', id);

  if ((localStorage.session !== undefined)  && (JSON.parse(window.payment_accounts).length == 0)) {
    $('#select-payment-account-' + localStorage.idEndowment).html("<a class='btn' id='button-profile-"+ window.profile.id +"' onclick='openProfileForm();'> Add Payment Account</a>");
  };

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
  localStorage.setItem('idEndowment', id);
  // redirect("endowment_details.html");
}

function showAllPaymentAccount() {
  var session = JSON.parse(localStorage.session);
  var token = session[0]['session']['session'].token;
  var payment_accounts = new Backbone.Collection;
  payment_accounts.url = window.serverUrl + 'api/donors/payment_accounts.json';


  payment_accounts.fetch({
    headers: {'Authorization' :'Token token=' + token},
    success: function(response, xhr) {
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
    type: "DELETE",
    contentType: "application/json",
    success: function(response, xhr) {

    },
    error: function (errorResponse) {
      console.log(errorResponse)
    }
  });

  $.pnotify({
    title: 'Yeah',
    text: "Successfully remove payment account.",
    type: 'success'
  });
  $('#payment-account-'+id).remove();
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
  Stripe.setPublishableKey(window.stripePublishKey);
  var $form = $('#payment-account-form');

  $('#payment-account-form button').text('Loading...')
  $('#payment-account-form button').attr('disabled', true);

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
          $('#payment-account-form button').text('Create Payment Account')
          $('#payment-account-form button').attr('disabled', false);

          $.pnotify({
            title: 'Yeah',
            text: "Successfully create payment account.",
            type: 'success'
          });

          var payment_account = payment_accounts[0].payment_account;

          $('#payment-accounts ul').append("<li id='payment-account-"+ payment_account.id +"'>Payment Account "+ payment_account.id + "<span><a onclick='destroyPaymentAccount("+ payment_account.id +")'> [x]</a></span><span><a onclick='editPaymentAccount("+ payment_account.id +")'> [edit]</a></span><br /><div style='margin-left: 15px;'><div>" + payment_account.processor + " - " + payment_account.stripe_cust_id +"</div></div></li><br />");

          if (localStorage.openProfileForm == "true") {
            $('#profile-modal').remove();

            if ($('#select-payment-account-' + localStorage.idEndowment + '> select').length == 0) {
              $('#select-payment-account-'+ localStorage.idEndowment).html("<select id='selected-payment-account-" + localStorage.idEndowment + "'><option>Select Payment Account</option></select>")
            }

            $('#select-payment-account-' + localStorage.idEndowment + '> select').append("<option value='"+ payment_account.id +"'>" + payment_account.stripe_cust_id + "</option>");

            $('#selected-payment-account-' + localStorage.idEndowment).change(function() {
              window.payment_account_id = $(this).val();
            });
          }
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
  Stripe.setPublishableKey(window.stripePublishKey);
  var $form = $('#payment-account-form');

  $('#payment-account-form button').text('Loading...')
  $('#payment-account-form button').attr('disabled', true);

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
          $('#payment-accounts form').html("<span class='payment-errors'></span><div class='form-row'><input type='text' size='20' data-stripe='number' value='4242424242424242' placeholder='Card Number' /></div><div class='form-row'><input type='text' size='4' data-stripe='cvc' value='314' placeholder='CCV' /></div><div class='form-row'><input type='text' size='2' data-stripe='exp-month' value='9' placeholder='MM' style='width: 15%;' /><input type='text' size='4' data-stripe='exp-year' value='2014'  placeholder='YYYY' style='float: right; margin-right: 37px; width: 58%;'/></div><button type='submit' class='btn btn-success btn-block' onclick='createPaymentAccount(); return false;' style='width: 86%;'>Create Payment Account</button>");

          $('#payment-account-form button').text('Create Payment Account')
          $('#payment-account-form button').attr('disabled', false);

          $.pnotify({
            title: 'Yeah',
            text: "Successfully update payment account.",
            type: 'success'
          });

        },
        error: function (errorResponse) {
          console.log(errorResponse);
        }
      });
}
};

Stripe.createToken($form, stripeResponseHandler);
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

function searchCharities() {
  $('input#query').on('keyup', function(){
    if ($(this).data('val')!=this.value) {
      var query = $(this).val();

      var charities = new Backbone.Collection;
      charities.url = window.serverUrl + 'api/charity.json';
      var data = { query: query }
      $('#loader').show();

      if ((query == "") || ($('#query').val() == "")) {
        $('#loader').hide();
        $('.charities-container').html("");
      } else {
        charities.fetch({
          data: data,
          success: function(response, xhr) {
            $('#loader').hide();
            window.charities = JSON.parse(JSON.stringify(response));

            var str = window.location.pathname;
            if (str.indexOf("new_endowment") !== -1) {
              $('#charity-details').html("");
              $('.charities-container').html("<ul id='charities' style='list-style: none;'>")
              $.each(window.charities, function(key, val) {
                if (val.message !== "Not found") {
                  $('.charities-container #charities').append("<li onclick='selectThisCharity("+ val.charity.id + ',' + '"' + val.charity.name + '"' +");' class='list-charity' id='button-charity-"+ val.charity.id +"'><span style='color: #0088CC; text-decoration: none;'>"+ val.charity.name +"<span class='muted' style='font-size: 11px; display: block;'>"+ val.charity.city +"</span></span></li>");
                }
              });

            } else if(str.indexOf("charities") !== -1) {
              $('#charity-details').html("");
              $('.charities-container').html("<ul id='charities' style='list-style: none;'>")
              $.each(window.charities, function(key, val) {
                if (val.message !== "Not found") {
                  $('.charities-container #charities').append("<li onclick='detailCharity("+ val.charity.id +");' class='list-charity' id='button-charity-"+ val.charity.id +"'><span style='color: #0088CC; text-decoration: none;'>"+ val.charity.name +"<span class='muted' style='font-size: 11px; display: block;'>"+ val.charity.city +"</span></span></li>");

                  $('#charity-details').append("<div id='charity-details-"+ val.charity.id +"'><p>Charity Name: <b>"+ val.charity.name +"</b></p><p>Charity Email: <b>"+ val.charity.email +"</b></p><p>Address: <b>"+ val.charity.address +"</b></p><p>City, State, Zip: <b>"+ '-' +"</b></p><p>Activity: <b>"+ '-' +"</b></p><p>Classification: <b>"+ val.charity.classification_code +"</b></p><p>NTEE: <b>"+ val.charity.ntee_code +"</b></p><br/><p>Total granted to charity from me: <b>"+ '-' +"</b></p><p>Total granted to charity from giv2giv: <b>"+ '-' +"</b><br/></div>");
                }
              });
}
},
error: function (errorResponse) {
  console.log(errorResponse);
}
});
}
}
$(this).data('val', this.value);
});
}

function selectThisCharity(id, name) {
  console.log(id)
  $('#selected-charities').append("<li id='"+ id +"'>" + name + "<span><a onclick='removeSelectedCharity("+ id +")'> [x]</a></span><li>")
}

function removeSelectedCharity(id) {
  $('#' + id).remove();
}

function detailCharity(id) {
  localStorage.setItem('idCharity', id);

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
    demos.modalDialog( $('#charity-details-'+id), $('#button-charity-'+id) );
  }

  $('#charity-details-'+id).dialog('open');
  // $('#button-charity-'+ id).click();
}
