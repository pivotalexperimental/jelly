raise "Jelly must be used in a Rails environment." unless defined?(ActionController)

require 'jelly/jelly_controller'
require 'jelly/jelly_helper'

ActionController::Base.class_eval do
  include JellyController
end

ActionView::Base.class_eval do
  include JellyHelper
end
