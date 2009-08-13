raise "Jelly must be used in a Rails environment." unless defined?(ActionController)

require 'jelly/jelly_controller'
require 'jelly/jelly_helper'

ActionController::Base.class_eval do
  include JellyController
end

ActionView::Base.class_eval do
  include JellyHelper
end

ActionView::Helpers::AssetTagHelper.register_javascript_expansion :jelly => ["jquery/jquery-1.3.2", "jquery/jquery.protify-0.3", 
                                                                             "ajax_with_jelly", "jelly"]
ActionView::Helpers::AssetTagHelper.register_javascript_expansion :only_jelly => ["jquery/jquery.protify-0.3", "jelly", "ajax_with_jelly"]