ActionController::Base.class_eval do
  include JellyController
end

ActionView::Base.class_eval do
  include JellyHelper
end
