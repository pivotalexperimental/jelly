describe("Jelly", function() {
  var our_token;

  beforeEach(function() {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
  });

  describe("Jelly", function() {
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
        Jelly.add("Foobar", {baz : function() {}, all : function() {}, show: function() {}});
        spyOn(Jelly.all["Foobar"], "show");
      });

      afterEach(function() {
        delete Jelly.all["Foobar"];
      });

      it("should call the page-specific js before the jelly components", function() {
        var thingsCalled = [];

        Jelly.add("MyController", {
          test_action: function() {
            thingsCalled.push('page');
          }
        });

        spyOn(Jelly.Page, 'initComponents').andCallFake(function() {
          thingsCalled.push('components');
        });

        Jelly.activatePage('MyController', 'test_action');

        expect(thingsCalled).toEqual(['page', 'components']);
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

  });
});
