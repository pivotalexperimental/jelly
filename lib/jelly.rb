raise "Jelly must be used in a Rails environment." unless defined?(ActionController)

require 'jelly/common'
require 'jelly/jelly_controller'
require 'jelly/jelly_helper'

ActionController::Base.class_eval do
  include JellyController
end

ActionView::Base.class_eval do
  include JellyHelper
end

ActionView::Helpers::AssetTagHelper.register_javascript_expansion :jelly => ["jquery/jquery-1.3.2", "ajax_with_jelly", "jelly"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :only_jelly => ["jelly", "ajax_with_jelly"]