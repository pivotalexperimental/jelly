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
    return $.extend({
      dataType: 'json',
      cache: false,
      success : $.ajaxWithJelly.onSuccess
    }, otherParams);
  };

  $.ajaxWithJelly.onSuccess = function(json) {
    var context = json.on ? eval(json.on) : page;
    context[json.method].apply(context, json.arguments);
    $.protify(Jelly.Page.components).each(function(componentAndArgs) {
      var component = componentAndArgs[0];
      if(component[json.method]) {
        component[json.method].apply(component, json.arguments);
      }
    });
    return true;
  };
})(jQuery);
