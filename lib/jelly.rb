require 'jelly/jelly_controller'
require 'jelly/jelly_helper'

raise "Must require rails before requiring jelly." unless defined?(ActionController)

ActionController::Base.class_eval do
  include JellyController
end

ActionView::Base.class_eval do
  include JellyHelper
end
