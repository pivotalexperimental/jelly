describe("Jelly", function() {
  var our_token;

  beforeEach(function() {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
  });

  describe(".add", function() {
    afterEach(function() {
      delete Jelly.all["test-name"];
    });

    it("instantiates a Page with the passed-in name and attaches the set of passed-in functions to the Page object", function() {
      expect(Jelly.all["test-name"]).toEqual(undefined);

      var showFn = function() {
      };
      var newFn = function() {
      };
      var indexFn = function() {
      };
      var newPage = Jelly.add("test-name", {show: showFn}, {'new': newFn}, {index: indexFn});
      expect(Jelly.all["test-name"]).toNotEqual(undefined);
      expect(newPage).toEqual(Jelly.all["test-name"]);
      expect(newPage.show).toEqual(showFn);
      expect(newPage['new']).toEqual(newFn);
      expect(newPage.index).toEqual(indexFn);
    });
  });

  describe(".activatePage", function() {
    beforeEach(function() {
      Jelly.add("Foobar", {baz : function() {
      }, all : function() {
      }, show: function() {
      }});
      spyOn(Jelly.all["Foobar"], "show");
    });

    afterEach(function() {
      delete Jelly.all["Foobar"];
    });

    it("should init the Jelly components before calling the page-specific js", function() {
      var thingsCalled = [];

      Jelly.add("MyController", {
        test_action: function() {
          thingsCalled.push('page');
        }
      });

      spyOn(Jelly, 'initComponents').andCallFake(function() {
        thingsCalled.push('components');
      });

      Jelly.activatePage('MyController', 'test_action');

      expect(thingsCalled).toEqual(['components', 'page']);
    });

    describe("when the passed-in controllerName is defined", function() {
      describe("when the actionName is defined", function() {
        it("invokes the page-specific method", function() {
          var foobar = Jelly.all["Foobar"];
          expect(foobar.show).wasNotCalled();
          Jelly.activatePage("Foobar", "show");
          expect(foobar.show).wasCalled();
        });

        describe("when the 'all' method is defined", function() {
          var invokedMethods;
          beforeEach(function() {
            invokedMethods = [];
            spyOn(Jelly.all["Foobar"], "all").andCallFake(function() {
              invokedMethods.push("all");
            });
            spyOn(Jelly.all["Foobar"], "baz").andCallFake(function() {
              invokedMethods.push("baz");
            });
          });

          it("invokes the all method before invoking the page-specific method", function() {
            expect(invokedMethods).toEqual([]);
            Jelly.activatePage("Foobar", "baz");
            expect(invokedMethods).toEqual(['all', 'baz']);
          });
        });
      });

      describe("when the actionName is not defined", function() {
        it("does not blow up", function() {
          expect(Jelly.all["Foobar"].easterBunny).toEqual(undefined);
          Jelly.activatePage("Foobar", "easterBunny");
        });

        describe("when the 'all' method is defined", function() {
          var invokedMethods;
          beforeEach(function() {
            invokedMethods = [];
            Jelly.all["Foobar"].all = function() {
              invokedMethods.push("all");
            };
          });

          it("invokes the all method", function() {
            expect(Jelly.all["Foobar"].easterBunny).toEqual(undefined);
            expect(invokedMethods).toEqual([]);
            Jelly.activatePage("Foobar", "easterBunny");
            expect(invokedMethods).toEqual(['all']);
          });
        });
      });
    });

    describe("when the passed-in controllerName is not defined", function() {
      it("invokes all method on an anonymous Page", function() {
        spyOn(Jelly.Page.prototype, "all");
        expect(Jelly.all["Baz"]).toEqual(undefined);

        Jelly.activatePage("Baz", "easterBunny");

        expect(Jelly.all["Baz"].all).wasCalled();
      });
    });
  });

  describe(".notifyObservers", function() {
    beforeEach(function() {
      Jelly.add("MyPage", {
        on_my_method : function() {
        }
      });
      page = Jelly.all["MyPage"];
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
        it("calls the callback method on the page first and then on the component", function() {
          var component = function() {
          };
          component.on_my_method = function() {
          };
          page.attach(component);

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
            page.attach(callbackObject.secondObject);
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
