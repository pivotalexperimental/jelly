Jelly.add("MyPage", {
  on_my_method : function(){}
});
var page = Jelly.all["MyPage"];

var My = {};
My.Class = {on_my_method: function() {console.debug("foo bar")}};

describe("ajax_with_jelly", function(){
  describe("Initializer", function(){
    var our_token = "authenticity token";

    beforeEach(function(){
      spyOn($, 'ajax');
      window._token = our_token;
    });

    it("should set up params and call ajax", function(){
      $.ajaxWithJelly({foo : 'bar', type: 'POST', data: {bar : 'baz'}});
      expect($.ajax).wasCalled();
      var ajaxParams = ($.ajax).mostRecentCall.args[0];
      expect(ajaxParams['dataType']).toEqual('json');
      expect(ajaxParams['cache']).toBeFalsy();
      expect(ajaxParams['success']).toEqual($.ajaxWithJelly.onSuccess);
      expect(ajaxParams['foo']).toEqual('bar');
      expect(ajaxParams['data']['authenticity_token']).toEqual(our_token);
      expect(ajaxParams['data']['bar']).toEqual('baz');
    });

    it("should not send an auth token when type is GET", function() {
      $.ajaxWithJelly({ data : {foo : 'bar'}, type: "GET" });
      expect($.ajax).wasCalled();
      var ajaxParams = ($.ajax).mostRecentCall.args[0];
      expect(ajaxParams['data']['authenticity_token']).toEqual(null);
    });

    it("should not send an auth token when type is null (jQuery defaults to GET)", function() {
      $.ajaxWithJelly({ data : {foo : 'bar'} });
      expect($.ajax).wasCalled();
      var ajaxParams = ($.ajax).mostRecentCall.args[0];
      expect(ajaxParams['data']['authenticity_token']).toEqual(null);
    });

    it("should allow override of type", function(){
      $.ajaxWithJelly({type : 'DELETE'});
      expect($.ajax).wasCalled();
      var ajaxParams = ($.ajax).mostRecentCall.args[0];
      expect(ajaxParams['type']).toEqual('DELETE');
    });
  });

  it("should call page.mymethod", function(){
    spyOn(page, 'on_my_method');
    $.ajaxWithJelly.onSuccess({
      "arguments":["arg1", "arg2"],
      "method":"on_my_method"
    });
    expect(page.on_my_method).wasCalled();
    expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
  });

  it("should call My.Class.mymethod", function(){
    spyOn(My.Class, 'on_my_method');
    $.ajaxWithJelly.onSuccess({
      "arguments":["arg1", "arg2"],
      "method":"on_my_method",
      "on":"My.Class"
    });
    expect(My.Class.on_my_method).wasCalled();
    expect(My.Class.on_my_method).wasCalledWith('arg1', 'arg2');
  });
});