# This file is copied to ~/spec when you run 'ruby script/generate rspec'
# from the project root directory.
ENV["RAILS_ENV"] ||= 'test'
ENV['RAILS_ROOT'] ||= File.dirname(__FILE__) + '/rails_root'
require File.expand_path(File.join(ENV['RAILS_ROOT'], 'config/environment.rb'))
require 'rubygems'
require 'spec'
require 'spec/rails'

require File.dirname(__FILE__) + "/../lib/jelly"

Spec::Runner.configure do |configuration|
end

class Spec::ExampleGroup
  include ActionController::TestProcess
end

# This is here to allow you to integrate views on all of your controller specs
Spec::Runner.configuration.before(:all, :behaviour_type => :controller) do
  @integrate_views = false
end
