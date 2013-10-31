class HomeController < ApplicationController
  def index
    # if session[:user_signed_in] && session[:token]
    #   redirect_to dashboard_url
    # end
  end

  def sign_up
    response = RestClient.post "#{SERVER_URL}api/donors.json", { donor: {email: params[:email], password: params[:password], name: params[:name] }, password: params[:password] }, content_type: :json, accept: :json
    session[:user_signed_in] = JSON.parse(response.body)
    redirect_to root_url
  end

  def sign_in
    response = RestClient.post "#{SERVER_URL}api/sessions/create.json", { email: params[:email], password: params[:password] }, content_type: :json, accept: :json
    session[:token] = JSON.parse(response.body)["session"]["token"]
    redirect_to root_url
  end
end
