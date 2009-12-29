# This file is copied to ~/spec when you run 'ruby script/generate rspec'
# from the project root directory.
ENV["RAILS_ENV"] ||= 'test'
ENV['RAILS_ROOT'] ||= File.dirname(__FILE__) + '/rails_root'
ARGV.push("-b")
require File.expand_path(File.join(ENV['RAILS_ROOT'], 'config/environment.rb'))
require 'rubygems'
gem "test-unit"
require 'test/unit'
require 'rr'

class Test::Unit::TestCase
  class << self
    def inherited(sub_class)
      super
      DESCENDANTS << sub_class
    end
    alias_method :inherited_without_test_unit_gem_inherited_fix, :inherited
    alias_method :inherited, :inherited_without_test_unit_gem_inherited_fix
  end
end

require 'spec'
require 'spec/rails'
require 'spec/autorun'
require 'nokogiri'

$LOAD_PATH.unshift(File.expand_path("#{File.dirname(__FILE__)}/../lib"))
require "jelly"

Spec::Runner.configure do |configuration|
  configuration.mock_with :rr
end

class Spec::ExampleGroup
  include ActionController::TestProcess
end

# This is here to allow you to integrate views on all of your controller specs
Spec::Runner.configuration.before(:all, :behaviour_type => :controller) do
  @integrate_views = false
end
