class DashboardController < ApplicationController
  def index
    session[:button] = "dashboard"
  end

  def new_endowment
    session[:button] = "new_endowment"
    unless session[:user_signed_in]
      redirect_to sign_in_path
    end
  end

  def create_endowment
    params_endowment = { name: params[:name], minimum_donation_amount: params[:minimum_donation_amount], endowment_visibility: params[:endowment_visibility] }
    request = Typhoeus::Request.new("#{SERVER_URL}api/endowment.json", method: :post, params: params_endowment, headers: { 'Content-Type'=> "application/json", 'Authorization' => "Token token=#{session[:token]}" })
    response = request.run

    if response.code == 201
      session[:endowment] = JSON.parse(response.body)["endowment"]
    end
  end
end
