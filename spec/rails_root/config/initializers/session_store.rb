# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_rails_root_session',
  :secret      => '7bc680488f32703dcc8d4f0b02f629e0a913e3877e67408c83dc7d83d06532806585afbe4d27aa0c91c4341cc0a09e143b50b586da9dfc842de3474a5af40a6b'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
