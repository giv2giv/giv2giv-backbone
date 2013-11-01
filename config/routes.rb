Giv2givJquery::Application.routes.draw do
  root :to => "dashboard#index"

  get "/sign_in" => "home#index"
  post "/sign_in" => "home#sign_in"
  post "/sign_up" => "home#sign_up"
  get "/sign_out" => "home#sign_out"

  get "/new_endowment" => "dashboard#new_endowment"
  post "/create_endowment" => "dashboard#create_endowment"
end
