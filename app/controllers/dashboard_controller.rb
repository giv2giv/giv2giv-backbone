class DashboardController < ApplicationController
  def index
    unless session[:user_signed_in]
      redirect_to sign_in_path
    end
  end

  def new_endowment
  end

  def create_endowment
    response = RestClient.post "#{SERVER_URL}api/endowment.json", { token: session[:token], name: params[:name], minimum_donation_amount: params[:minimum_donation_amount], endowment_visibility: params[:endowment_visibility] }, content_type: :json, accept: :json
    session[:endowment] = JSON.parse(response.body)
  end
end
