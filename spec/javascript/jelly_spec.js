Jelly.add("MyPage", {
  on_my_method : function(){}
});
var page = Jelly.all["MyPage"];

var My = {};
My.Class = {on_my_method: function() {console.debug("foo bar")}};

describe("Jelly", function(){
  var our_token;

  beforeEach(function(){
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
  });

  describe("ajaxWithJelly", function(){
    it("should set default params and call ajax", function(){
      var params = {foo: "bar"};
      var modifiedParams = "whatever";
      spyOn($.ajaxWithJelly, 'params').andReturn(modifiedParams);
      $.ajaxWithJelly(params);
      expect($.ajaxWithJelly.params).wasCalled();
      expect($.ajaxWithJelly.params).wasCalledWith(params);
      expect($.ajax).wasCalled();
      expect($.ajax).wasCalledWith(modifiedParams);
    });
  });

  describe("ajaxFormWithJelly", function(){

    describe("without ajaxForm plugin", function(){
      it("should not be defined", function(){
        expect($.fn.ajaxForm).toEqual(undefined);
        expect($.fn.ajaxFormWithJelly).toEqual(undefined);
      });
    });

    describe("with ajaxForm plugin", function(){
      var $form;
      beforeEach(function(){
        $form = $('body').append('<form id="myForm"></form>').find('#myForm');
        $.fn.ajaxForm = {};
        spyOn($.fn, 'ajaxForm');
        defineAjaxWithJellyFunctions($);
      });

      afterEach(function(){
        $.fn.ajaxForm = undefined;
        defineAjaxWithJellyFunctions($);
      });

      it("should set default params and call ajax", function(){
        var modifiedParams = "whatever";
        spyOn($.ajaxWithJelly, 'params').andReturn(modifiedParams);
        $form.ajaxFormWithJelly();
        expect($.ajaxWithJelly.params).wasCalled();
        expect($.ajaxWithJelly.params).wasCalledWith(undefined);
        expect($.fn.ajaxForm).wasCalled();
        expect($.fn.ajaxForm).wasCalledWith(modifiedParams);
        expect($.fn.ajaxForm.mostRecentCall.object.get(0)).toEqual($form.get(0));
      });

      it("should merge in params", function(){
        var params = {foo: "bar"};
        spyOn($.ajaxWithJelly, 'params');
        $form.ajaxFormWithJelly(params);
        expect($.ajaxWithJelly.params).wasCalled();
        expect($.ajaxWithJelly.params).wasCalledWith(params);
      });
    });
  });

  describe("ajaxWithJelly.params", function(){
    it("should set some base prams", function(){
      var ajaxParams = $.ajaxWithJelly.params();
      expect(ajaxParams['dataType']).toEqual('json');
      expect(ajaxParams['cache']).toBeFalsy();
      expect(ajaxParams['success']).toEqual($.ajaxWithJelly.onSuccess);
    });

    it("should preserve passed data", function(){
      var ajaxParams = $.ajaxWithJelly.params({foo : 'bar', data: {bar : 'baz'}});
      expect(ajaxParams['foo']).toEqual('bar');
      expect(ajaxParams['data']['bar']).toEqual('baz');
    });

    describe("whether to set authenticity token", function(){
      it("should set an auth token when type is not a GET", function() {
        var ajaxParams = $.ajaxWithJelly.params({type: "NON-GET"});
        expect(ajaxParams['data']['authenticity_token']).toEqual(our_token);
      });

      it("should not set an auth token when type is not passed in", function() {
        var ajaxParams = $.ajaxWithJelly.params();
        expect(ajaxParams['data']).toEqual(undefined);
      });

      it("should not set an auth token when type is GET", function() {
        var ajaxParams = $.ajaxWithJelly.params({type: "GET"});
        expect(ajaxParams['data']).toEqual(undefined);
      });
    });

    it("should allow override of type", function(){
      var ajaxParams = $.ajaxWithJelly.params({type : 'DELETE'});
      expect(ajaxParams['type']).toEqual('DELETE');
    });
  });

  describe("ajaxWithJelly.onSuccess", function(){
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

  describe("Jelly.activatePage", function(){
    it("should call the page-specific js before the jelly components", function(){
      var thingsCalled = [];

      Jelly.add("MyController", {
        test_action: function(){
            thingsCalled.push('page');
          }
      });

      spyOn(Jelly.Page, 'all').andCallFake(function(){
        thingsCalled.push('components');
      });

      Jelly.activatePage('MyController', 'test_action');
      Jelly._activatePage('test_action');

      expect(thingsCalled).toEqual(['page', 'components']);
    });

  });
  
});
