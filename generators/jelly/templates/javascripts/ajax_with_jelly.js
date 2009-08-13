(function($) {
  $.ajaxWithJelly = function(params) {
    $.ajax($.ajaxWithJelly.params(params));
  };

  $.ajaxWithJelly.params = function(otherParams) {
    otherParams = otherParams || {};
    otherParams['data'] = $.extend(otherParams['data'], {
      authenticity_token: _token
    });
    return $.extend({
      dataType: 'json',
      cache: false,
      success : $.ajaxWithJelly.onSuccess
    }, otherParams);
  };

  $.ajaxWithJelly.onSuccess = function(json) {
    var context = json.on ? eval(json.on) : page;
    context[json.method].apply(context, json.arguments);
    return true;
  };
})(jQuery);
