class HomeController < ApplicationController
  def index
  end

  def sign_up
    response = RestClient.post "#{SERVER_URL}api/donors.json", { donor: {email: params[:email], password: params[:password], name: params[:fullname] } }, content_type: :json, accept: :json
    session[:user_signed_in] = JSON.parse(response.body)

    redirect_to sign_in_url
  end

  def sign_in
    response = RestClient.post "#{SERVER_URL}api/sessions/create.json", { email: params[:email], password: params[:password] }, content_type: :json, accept: :json

    if response.class == NilClass
      redirect_to sign_in_url
    else
      session[:token] = JSON.parse(response.body)["session"]["token"]
      session[:user_signed_in] = { email: params[:email], email: params[:email] }
      redirect_to root_url
    end
  end

  def sign_out
    session[:user_signed_in] = nil

    redirect_to sign_in_url
  end
end
