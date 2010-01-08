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

  describe(".attach", function() {
    describe("when the argument contains a 'component' key", function() {
      describe("when the component does not respond to init", function() {
        describe("when the component is referenced as a String", function() {
          beforeEach(function() {
            window.MyComponent = {
            };
          });

          afterEach(function() {
            delete window.MyComponent;
          });

          it("attaches the component to Jelly.observers", function() {
            Jelly.attach({component: "MyComponent"});
            expect(Jelly.observers).toContain(MyComponent);
          });
        });

        describe("when the component is referenced as itself", function() {
          it("attaches the component to Jelly.observers", function() {
            var component = {};
            Jelly.attach({component: component});
            expect(Jelly.observers).toContain(component);
          });
        });
      });

      describe("when component responds to init", function() {
        describe("when the component's init method returns undefined", function() {
          describe("when the component is referenced as a String", function() {
            beforeEach(function() {
              window.MyComponent = {
                init: function() {
                }
              };
            });

            afterEach(function() {
              delete window.MyComponent;
            });

            it("calls the init method on the component and attaches the component to Jelly.observers", function() {
              spyOn(MyComponent, 'init');
              Jelly.attach({component: MyComponent, arguments: [1, 2]});
              expect(MyComponent.init).wasCalledWith(1, 2);
              expect(Jelly.observers).toContain(MyComponent);
            });
          });

          describe("when the component is referenced as itself", function() {
            var component;
            beforeEach(function() {
              component = {
                init: function() {
                }
              };
            });

            it("calls the init method on the component and attaches the component to Jelly.observers", function() {
              spyOn(component, 'init');
              Jelly.attach({component: component, arguments: [1, 2]});
              expect(component.init).wasCalledWith(1, 2);
              expect(Jelly.observers).toContain(component);
            });
          });
        });

        describe("when the component's init method returns false", function() {
          var component;
          beforeEach(function() {
            component = {
              init: function() {
                component.initCalled = true;
                return false;
              }
            };
          });

          it("calls the init method on the component and does not attaches an observer to Jelly.observers", function() {
            var originalObserversLength = Jelly.observers.length;
            Jelly.attach({component: component, arguments: [1, 2]});
            expect(component.initCalled).toBeTruthy();
            expect(Jelly.observers.length).toEqual(originalObserversLength);
            expect(Jelly.observers).toNotContain(component);
          });
        });

        describe("when the component's init method returns null", function() {
          var component;
          beforeEach(function() {
            component = {
              init: function() {
                component.initCalled = true;
                return null;
              }
            };
          });

          it("calls the init method on the component and does not attaches an observer to Jelly.observers", function() {
            var originalObserversLength = Jelly.observers.length;
            Jelly.attach({component: component, arguments: [1, 2]});
            expect(component.initCalled).toBeTruthy();
            expect(Jelly.observers.length).toEqual(originalObserversLength);
            expect(Jelly.observers).toNotContain(component);
          });
        });

        describe("when the component's init method returns an object", function() {
          it("attaches the returned object (instead of the component) to Jelly.observers", function() {
            var observer = new Object();
            var component = {
              init: function() {
                return observer;
              }
            };
            Jelly.attach({component: component, arguments: [1, 2]});
            expect(Jelly.observers).toContain(observer);
            expect(Jelly.observers).toNotContain(component);
          });
        });
      });
    });

    describe("when the argument does not contain a 'component' key", function() {
      describe("when the component is referenced as a String", function() {
        beforeEach(function() {
          window.MyComponent = {
            init: function() {
            }
          };
        });

        afterEach(function() {
          delete window.MyComponent;
        });

        it("does not call init and attaches the component to Jelly.observers", function() {
          spyOn(MyComponent, 'init');
          Jelly.attach("MyComponent");
          expect(MyComponent.init).wasNotCalled();
          expect(Jelly.observers).toContain(MyComponent);
        });
      });

      describe("when the component is referenced as itself", function() {
        it("does not call init and attaches the component to Jelly.observers", function() {
          var component = {
            init: function() {
            }
          };
          spyOn(component, 'init');
          Jelly.attach(component);
          expect(component.init).wasNotCalled();
          expect(Jelly.observers).toContain(component);
        });
      });
    });
  });

  describe(".notifyObservers", function() {
    beforeEach(function() {
      Jelly.Pages.add("MyPage", {
        on_my_method : function() {
        }
      });
      Jelly.attach({component: "Jelly.Page", arguments: ["MyPage", "index"]});
    });

    describe("when bound to the default Jelly.observers collection", function() {
      describe("the active page object", function() {
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

          describe("when there are attached components", function() {
            it("calls the callback methods in the order of the attached components", function() {
              var component = {
                on_my_method: function() {
                }
              };
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

    describe("when bound to an array of custom observers", function() {
      it("notifies the given observers and not the existing Jelly.observers, unless in the list of observers", function() {
        var component = {
          on_my_method: function() {
          }
        };
        Jelly.attach({component: "Jelly.Page", arguments: ["MyPage", "index"]});
        Jelly.attach({component: component, arguments: []});

        spyOn(page, 'on_my_method');
        spyOn(component, 'on_my_method');

        var customObserver1 = {on_my_method: function() {}};
        spyOn(customObserver1, 'on_my_method');
        var customObserver2 = {on_my_method: function() {}};
        spyOn(customObserver2, 'on_my_method');

        Jelly.notifyObservers.call([customObserver1, customObserver2],{
          "arguments":["arg1", "arg2"],
          "method":"on_my_method"
        });

        expect(page.on_my_method).wasNotCalled();
        expect(component.on_my_method).wasNotCalled();

        expect(customObserver1.on_my_method).wasCalled();
        expect(customObserver1.on_my_method).wasCalledWith('arg1', 'arg2');
        expect(customObserver2.on_my_method).wasCalled();
        expect(customObserver2.on_my_method).wasCalledWith('arg1', 'arg2');
      });
    });

    describe("an observer listening to the callback method", function() {
      var observer;
      beforeEach(function() {
        observer = {
          on_my_method: function() {
          }
        };
        Jelly.attach({component: observer, arguments: []});
        expect(Jelly.observers).toContain(observer);
      });

      describe("when the observer does not have a detach method defined", function() {
        beforeEach(function() {
          expect(observer.detach).toBe(undefined);
        });

        it("leaves the observer in Jelly.observers and calls the callback method on the observer", function() {
          spyOn(observer, "on_my_method");

          Jelly.notifyObservers({method: "on_my_method", arguments: []});
          expect(Jelly.observers).toContain(observer);
          expect(observer.on_my_method).wasCalled();
        });
      });

      describe("when the observer a detach method defined", function() {
        describe("when the detach method is truthy", function() {
          var anotherObserver;
          beforeEach(function() {
            observer.detach = function() {
              return true;
            };
            anotherObserver = {
              on_my_method: function() {
              }
            };
            Jelly.attach({component: anotherObserver, arguments: []});
          });

          it("removes observer in Jelly.observers, does not call the callback method on the observer, and calls the other observers", function() {
            spyOn(observer, "on_my_method");
            spyOn(anotherObserver, "on_my_method");

            Jelly.notifyObservers({method: "on_my_method", arguments: []});
            expect(Jelly.observers).toNotContain(observer);
            expect(observer.on_my_method).wasNotCalled();
            expect(anotherObserver.on_my_method).wasCalled();
          });
        });

        describe("when the detach method is falsy", function() {
          beforeEach(function() {
            observer.detach = function() {
              return undefined;
            }
          });

          it("leaves the observer in Jelly.observers and calls the callback method on the observer", function() {
            spyOn(observer, "on_my_method");

            Jelly.notifyObservers({method: "on_my_method", arguments: []});
            expect(Jelly.observers).toContain(observer);
            expect(observer.on_my_method).wasCalled();
          });
        });
      });
    });

    describe("when the 'attach' parameter is present", function() {
      var observers;
      beforeEach(function() {
        MyComponent = {
          init: function() {
          }
        };
        spyOn(MyComponent, 'init');
        observers = [];
      });

      describe("when the method is present", function() {
        it("attaches the given attachments to the observers and calls the callback on the recently attached observer", function() {
          Jelly.notifyObservers.call(observers, {
            "arguments":["arg1", "arg2"],
            "method":"on_my_method",
            "attach":[{component: "MyComponent", arguments: [1,2]}]
          });
          expect(MyComponent.init).wasCalledWith(1, 2);
          expect(Jelly.observers).toNotContain(MyComponent);
          expect(observers).toContain(MyComponent);
        });
      });

      describe("when there are no other paramaters present", function() {
        it("attaches the given attachments to the observers", function() {
          Jelly.notifyObservers.call(observers, {
            "attach":[{component: "MyComponent", arguments: [1,2]}]
          });
          expect(Jelly.observers).toNotContain(MyComponent);
          expect(observers).toContain(MyComponent);
        });
      });
    });

    describe("when given an array of callbacks", function() {
      it("notifies the observers of all of the callback hashes", function() {
        page.on_my_method2 = function() { };
        spyOn(page, 'on_my_method');
        spyOn(page, 'on_my_method2');
        Jelly.notifyObservers([
          {
            "arguments":["arg1", "arg2"],
            "method":"on_my_method"
          },
          {
            "arguments": ["arg3"],
            "method":"on_my_method2"
          }
        ]);

        expect(page.on_my_method).wasCalledWith('arg1', 'arg2');
        expect(page.on_my_method2).wasCalledWith('arg3');
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
      Jelly.Pages.add("DefinedComponent", {
        baz : function() {
        },
        all : function() {
        },
        show: function() {
        }
      });
      spyOn(Jelly.Pages.all["DefinedComponent"], "show");
    });

    afterEach(function() {
      delete Jelly.Pages.all["DefinedComponent"];
    });

    describe("when the passed-in controllerName is defined", function() {
      describe("when the actionName is defined", function() {
        it("invokes the page-specific method", function() {
          var foobar = Jelly.Pages.all["DefinedComponent"];
          expect(foobar.show).wasNotCalled();
          Jelly.Page.init("DefinedComponent", "show");
          expect(foobar.show).wasCalled();
        });

        describe("when the 'all' method is defined", function() {
          var invokedMethods;
          beforeEach(function() {
            invokedMethods = [];
            spyOn(Jelly.Pages.all["DefinedComponent"], "all").andCallFake(function() {
              invokedMethods.push("all");
            });
            spyOn(Jelly.Pages.all["DefinedComponent"], "baz").andCallFake(function() {
              invokedMethods.push("baz");
            });
          });

          it("invokes the all method before invoking the page-specific method", function() {
            expect(invokedMethods).toEqual([]);
            Jelly.Page.init("DefinedComponent", "baz");
            expect(invokedMethods).toEqual(['all', 'baz']);
          });
        });
      });

      describe("when the actionName is not defined", function() {
        it("does not blow up", function() {
          expect(Jelly.Pages.all["DefinedComponent"].easterBunny).toEqual(undefined);
          Jelly.Page.init("DefinedComponent", "easterBunny");
        });

        describe("when the 'all' method is defined", function() {
          var invokedMethods;
          beforeEach(function() {
            invokedMethods = [];
            Jelly.Pages.all["DefinedComponent"].all = function() {
              invokedMethods.push("all");
            };
          });

          it("invokes the all method", function() {
            expect(Jelly.Pages.all["DefinedComponent"].easterBunny).toEqual(undefined);
            expect(invokedMethods).toEqual([]);
            Jelly.Page.init("DefinedComponent", "easterBunny");
            expect(invokedMethods).toEqual(['all']);
          });
        });
      });
    });

    describe("when the passed-in controllerName is not defined", function() {
      it("does nothing and does not cause an error", function() {
        expect(Jelly.Pages.all["UndefinedComponent"]).toEqual(undefined);
        Jelly.Page.init("UndefinedComponent", "easterBunny");
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
    originalTop = window.top;
  });

  afterEach(function() {
    window.top = originalTop;
  });

  describe(".on_redirect", function() {
    it("sets top.location.href to the given location", function() {
      window.top = {location: {}};
      Jelly.Location.on_redirect("http://mars.com");
      expect(window.top.location.href).toEqual("http://mars.com");
    });
  });
});
