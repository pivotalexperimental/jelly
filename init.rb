ActionController::Base.class_eval do
  include JsweetController
end

ActionView::Base.class_eval do
  include JsweetHelper
end
