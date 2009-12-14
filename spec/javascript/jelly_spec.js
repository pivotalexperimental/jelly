describe("Jelly", function() {
  var our_token;

  beforeEach(function() {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
    Jelly.init();
  });

  describe(".add", function() {
    afterEach(function() {
      delete Jelly.Pages.all["test-name"];
    });

    it("instantiates a Page with the passed-in name and attaches the set of passed-in functions to the Page object", function() {
      expect(Jelly.Pages.all["test-name"]).toEqual(undefined);

      var showFn = function() {
      };
      var newFn = function() {
      };
      var indexFn = function() {
      };
      var newPage = Jelly.Pages.add("test-name", {show: showFn}, {'new': newFn}, {index: indexFn});
      expect(Jelly.Pages.all["test-name"]).toNotEqual(undefined);
      expect(newPage).toEqual(Jelly.Pages.all["test-name"]);
      expect(newPage.show).toEqual(showFn);
      expect(newPage['new']).toEqual(newFn);
      expect(newPage.index).toEqual(indexFn);
    });
  });

  describe(".init", function() {
    it("should init the Jelly components", function() {
      var thingsCalled = [];

      Jelly.Pages.add("MyController", {
        test_action: function() {
          thingsCalled.push('page');
        }
      });

      spyOn(Jelly.Components, 'init').andCallFake(function() {
        thingsCalled.push('components');
      });

      Jelly.init();

      expect(thingsCalled).toEqual(['components']);
    });
  });

  describe(".attach", function() {
    it("adds the given component (evaluating strings) and argument definitions to Jelly.components", function() {
      var component1 = {
        init: function() {
        }
      };
      var component2 = {
        init: function() {
        }
      };
      Jelly.attach(
        {component: "Jelly.Page", arguments: ["MyPage", "index"]},
        {component: component1, arguments: [1, 2]},
        {component: component2, arguments: [3, 4, 5]}
      );

      expect(Jelly.components).toEqual([
        {component: Jelly.Page, arguments: ["MyPage", "index"]},
        {component: component1, arguments: [1, 2]},
        {component: component2, arguments: [3, 4, 5]}
      ]);
    });
  });

  describe(".notifyObservers", function() {
    beforeEach(function() {
      Jelly.Pages.add("MyPage", {
        on_my_method : function() {
        }
      });
      page = Jelly.Pages.all["MyPage"];
    });

    describe("when the callback method is defined on the page", function() {
      it("should call the callback method on the page", function() {
        spyOn(page, 'on_my_method');
        Jelly.notifyObservers({
          "arguments":["arg1", "arg2"],
          "method":"on_my_method"
        });
        expect(page.on_my_method).wasCalled();
        expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
      });

      it("should call the callback method on the page, within the context of the page", function() {
        page.on_my_method = function(arg1, arg2) {
          expect(this).toEqual(page);
        };

        Jelly.notifyObservers({
          "arguments":["arg1", "arg2"],
          "method":"on_my_method"
        });
      });

      describe("when there are attached components", function() {
        it("calls the callback methods in the order of the attached components", function() {
          var component = {
            on_my_method: function() {
            }
          };
          Jelly.attach({component: "Jelly.Page", arguments: ["MyPage", "index"]});
          Jelly.attach({component: component, arguments: []});

          var functionsCalledInOrder = [];
          spyOn(page, 'on_my_method').andCallFake(function() {
            functionsCalledInOrder.push("page");
          });
          spyOn(component, 'on_my_method').andCallFake(function() {
            functionsCalledInOrder.push("component");
          });
          Jelly.notifyObservers({
            "arguments":["arg1", "arg2"],
            "method":"on_my_method"
          });
          expect(page.on_my_method).wasCalled();
          expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
          expect(component.on_my_method).wasCalled();
          expect(component.on_my_method).wasCalledWith('arg1', 'arg2');
          expect(functionsCalledInOrder).toEqual(["page", "component"]);
        });
      });
    });

    describe("when the page object does not define the callback method", function() {
      it("does not blow up", function() {
        expect(page.on_my_undefined_method).toBe(undefined);
        Jelly.notifyObservers({
          "arguments":["arg1", "arg2"],
          "method":"on_my_undefined_method"
        });
      });
    });

    describe("when the 'on' parameter is present", function() {
      beforeEach(function() {
        callbackObject = {};
        callbackObject.secondObject = {on_my_method: function() {
        }};
      });

      afterEach(function() {
        delete callbackObject;
      });

      describe("when the 'on' object defines the callback method", function() {
        it("should call on_my_method on that object", function() {
          spyOn(callbackObject.secondObject, 'on_my_method');
          Jelly.notifyObservers({
            "arguments":["arg1", "arg2"],
            "method":"on_my_method",
            "on":"callbackObject.secondObject"
          });
          expect(callbackObject.secondObject.on_my_method).wasCalledWith('arg1', 'arg2');
        });

        describe("when that object is also a component", function () {
          it("should only call the callback once", function() {
            Jelly.attach({component: callbackObject.secondObject, arguments: []});
            spyOn(callbackObject.secondObject, 'on_my_method');
            Jelly.notifyObservers({
              "arguments":["arg1", "arg2"],
              "method":"on_my_method",
              "on":"callbackObject.secondObject"
            });
            expect(callbackObject.secondObject.on_my_method.callCount).toEqual(1);
          });
        });
      });

      describe("when the 'on' object does not define the callback method", function() {
        it("does not blow up", function() {
          expect(callbackObject.secondObject.on_my_undefined_method).toBe(undefined);
          Jelly.notifyObservers({
            "arguments":["arg1", "arg2"],
            "method":"on_my_undefined_method",
            "on":"callbackObject.secondObject"
          });
        });
      });
    });
  });
});

describe("Jelly.Page", function() {
  var our_token;

  beforeEach(function() {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
    Jelly.init();
  });

  describe(".init", function() {
    beforeEach(function() {
      Jelly.Pages.add("Foobar", {
        baz : function() {
        },
        all : function() {
        },
        show: function() {
        }
      });
      spyOn(Jelly.Pages.all["Foobar"], "show");
    });

    afterEach(function() {
      delete Jelly.Pages.all["Foobar"];
    });

    describe("when the passed-in controllerName is defined", function() {
      describe("when the actionName is defined", function() {
        it("invokes the page-specific method", function() {
          var foobar = Jelly.Pages.all["Foobar"];
          expect(foobar.show).wasNotCalled();
          Jelly.Page.init("Foobar", "show");
          expect(foobar.show).wasCalled();
        });

        describe("when the 'all' method is defined", function() {
          var invokedMethods;
          beforeEach(function() {
            invokedMethods = [];
            spyOn(Jelly.Pages.all["Foobar"], "all").andCallFake(function() {
              invokedMethods.push("all");
            });
            spyOn(Jelly.Pages.all["Foobar"], "baz").andCallFake(function() {
              invokedMethods.push("baz");
            });
          });

          it("invokes the all method before invoking the page-specific method", function() {
            expect(invokedMethods).toEqual([]);
            Jelly.Page.init("Foobar", "baz");
            expect(invokedMethods).toEqual(['all', 'baz']);
          });
        });
      });

      describe("when the actionName is not defined", function() {
        it("does not blow up", function() {
          expect(Jelly.Pages.all["Foobar"].easterBunny).toEqual(undefined);
          Jelly.Page.init("Foobar", "easterBunny");
        });

        describe("when the 'all' method is defined", function() {
          var invokedMethods;
          beforeEach(function() {
            invokedMethods = [];
            Jelly.Pages.all["Foobar"].all = function() {
              invokedMethods.push("all");
            };
          });

          it("invokes the all method", function() {
            expect(Jelly.Pages.all["Foobar"].easterBunny).toEqual(undefined);
            expect(invokedMethods).toEqual([]);
            Jelly.Page.init("Foobar", "easterBunny");
            expect(invokedMethods).toEqual(['all']);
          });
        });
      });
    });

    describe("when the passed-in controllerName is not defined", function() {
      it("invokes all method on an anonymous Page", function() {
        spyOn(Jelly.Page.prototype, "all");
        expect(Jelly.Pages.all["Baz"]).toEqual(undefined);

        Jelly.Page.init("Baz", "easterBunny");

        expect(Jelly.Pages.all["Baz"].all).wasCalled();
      });
    });
  });
});

describe("Jelly.Location", function() {
  var our_token, originalTop;

  beforeEach(function() {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
    Jelly.init();
    originalTop = top;
  });

  afterEach(function() {
    top = originalTop;
  });

  describe(".on_redirect", function() {
    it("sets top.location.href to the given location", function() {
      top = {location: {}};
      Jelly.Location.on_redirect("http://mars.com");
      expect(top.location.href).toEqual("http://mars.com");
    });
  });
});
