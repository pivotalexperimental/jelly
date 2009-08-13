In your environment.rb in the Rails::Initializer.run block, be sure to require jelly:
  config.gem "pivotal-jelly"
Then install the required JavaScript files by running:
  script/generate jelly