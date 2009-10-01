describe("Jelly", function(){
  var our_token;

  beforeEach(function(){
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
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
