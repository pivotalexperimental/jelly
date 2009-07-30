Jelly.add("MyPage", {
  on_my_method : function(){}
});
var page = Jelly.all["MyPage"];

var My = {};
My.Class = {on_my_method: function() {console.debug("foo bar")}};

describe("ajax_with_json_callback", function(){
  beforeEach(function(){
    new Mom();
  });

  describe("Initializer", function(){
    beforeEach(function(){
      spyOn($, 'ajax');
    });
    it("should set up params and call ajax", function(){
      var our_token = "authenticity token";
      window._token = our_token;
      $.ajaxWithJelly({foo : 'bar', data: {bar : 'baz'}});
      expect($.ajax).wasCalled();
      var ajaxParams = ($.ajax).mostRecentCall.args[0];
      expect(ajaxParams['dataType']).toEqual('json');
      expect(ajaxParams['cache']).toBeFalsy();
      expect(ajaxParams['success']).toEqual($.ajaxWithJelly.onSuccess);
      expect(ajaxParams['foo']).toEqual('bar');
      expect(ajaxParams['data']['authenticity_token']).toEqual(our_token);
      expect(ajaxParams['data']['bar']).toEqual('baz');
      expect(ajaxParams['type']).toEqual('POST');
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