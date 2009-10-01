describe("Jelly", function() {
  var our_token;

  beforeEach(function() {
    spyOn($, 'ajax');
    our_token = "authenticity token";
    window._token = our_token;
  });

  describe("Jelly.activatePage", function() {
    it("should call the page-specific js before the jelly components", function() {
      var thingsCalled = [];

      Jelly.add("MyController", {
        test_action: function() {
          thingsCalled.push('page');
        }
      });

      spyOn(Jelly.Page, 'all').andCallFake(function() {
        thingsCalled.push('components');
      });

      Jelly.activatePage('MyController', 'test_action');

      expect(thingsCalled).toEqual(['page', 'components']);
    });
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
      var foobarShowInvoked, originalPagesAll;
      beforeEach(function() {
        foobarShowInvoked = false;
        Jelly.add("Foobar", {show: function() {
          foobarShowInvoked = true;
        }});
        originalPagesAll = Jelly.Page.all;
      });

      afterEach(function() {
        delete Jelly.all["Foobar"];
        Jelly.Page.all = originalPagesAll;
      });

      it("invokes Jelly.Page.all", function() {
        var allInvoked = false;
        Jelly.Page.all = function() {
          allInvoked = true;
        };
        Jelly.activatePage("Foobar", "show");
        expect(allInvoked).toEqual(true);
      });

      describe("when the passed-in controllerName is defined", function() {
        describe("when the actionName is defined", function() {
          it("invokes the page-specific method", function() {
            expect(Jelly.all["Foobar"].show).toNotEqual(undefined);
            expect(foobarShowInvoked).toEqual(false);
            Jelly.activatePage("Foobar", "show");
            expect(foobarShowInvoked).toEqual(true);
          });

          describe("when the 'all' method is defined", function() {
            var invokedMethods;
            beforeEach(function() {
              invokedMethods = [];
              Jelly.all["Foobar"].all = function() {
                invokedMethods.push("all");
              };

              Jelly.all["Foobar"].baz = function() {
                invokedMethods.push("baz");
              };
            });

            it("invokes the all method before invoking the page-specific method", function() {
              expect(Jelly.all["Foobar"].baz).toNotEqual(undefined);
              expect(invokedMethods).toEqual([]);
              Jelly.activatePage("Foobar", "baz");
              expect(invokedMethods).toEqual(['all', 'baz']);
            });
          });
        });

        describe("when the actionName is not defined", function() {
          it("does nothing", function() {
            expect(Jelly.all["Foobar"].easterBunny).toEqual(undefined);
            expect(foobarShowInvoked).toEqual(false);
            Jelly.activatePage("Foobar", "easterBunny");
            expect(foobarShowInvoked).toEqual(false);
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
        var originalAll;
        beforeEach(function() {
          originalAll = Jelly.Page.prototype.all;
        });

        afterEach(function() {
          Jelly.Page.prototype.all = originalAll;
        });

        it("invokes the global all method on an anonymous Page", function() {
          var anonymousAllInvoked = false;
          Jelly.Page.prototype.all = function() {
            anonymousAllInvoked = true;
          };
          expect(Jelly.all["Baz"]).toEqual(undefined);

          Jelly.activatePage("Baz", "easterBunny");

          expect(anonymousAllInvoked).toEqual(true);
        });
      });
    });

  });
});
