if(!window.Jelly) Jelly = new Object();

(Jelly.defineAjaxWithJellyFunctions = function($) {
  $.ajaxWithJelly = function(params) {
    $.ajax($.ajaxWithJelly.params(params));
  };

  if ($.fn.ajaxForm) {
    $.fn.ajaxFormWithJelly = function(params) {
      this.ajaxForm($.ajaxWithJelly.params(params));
    };
  }

  $.ajaxWithJelly.params = function(otherParams) {
    otherParams = otherParams || {};

    if (otherParams.type && otherParams.type != "GET") {
      otherParams['data'] = $.extend(otherParams['data'], {
        authenticity_token: window._token
      });
    }
    var observers = otherParams.observers || Jelly.observers;
    return $.extend({
      dataType: 'json',
      cache: false,
      success : function(callbacks) {
        Jelly.Observers.notify.call(observers, callbacks);
      }
    }, otherParams);
  };
})(jQuery);
