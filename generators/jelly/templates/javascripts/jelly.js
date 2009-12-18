/**
 *  Jelly. a sweet unobtrusive javascript framework
 *  for jQuery and Rails
 *
 *  version 0.7.4
 *
 * Copyright (c) 2009 Pivotal Labs
 * Licensed under the MIT license.
 *
 *  * Date: 2009-07-20 9:50:50 (Mon, 20 Jul 2009)
 *
 */

if (!window.Jelly) Jelly = new Object();
Jelly.init = function() {
  this.components = [];
  this.observers = [];
  this.Components.initCalled = false;
  this.Pages.init();
  var self = this;
  $(document).ready(function() {
    self.Components.init();
  });
};

Jelly.attach = function() {
  for (var i = 0; i < arguments.length; i++) {
    var definition = arguments[i];
    var component = (typeof definition.component == "string") ?
                    eval(definition.component) :
                    definition.component;
    var evaluatedDefinition = {
      component: component,
      arguments: definition.arguments
    };
    this.components.push(evaluatedDefinition);
    if (Jelly.Components.initCalled) {
      Jelly.Components.initComponentFromDefinition(evaluatedDefinition);
    }
  }
};

Jelly.notifyObservers = function(params, observers) {
  if (!observers) {
    observers = [];
    for (var i = 0; i < Jelly.observers.length; i++) {
      observers.push(Jelly.observers[i]);
    }

    // Deprecate 'on' in favor of making each page action a Component.
    if (params.on) {
      var additionalObserver = eval(params.on);
      var additionalObserverAlreadyAnObserver = false;
      for (var i = 0; i < observers.length; i++) {
        if (observers[i] == additionalObserver) {
          additionalObserverAlreadyAnObserver = true;
          break;
        }
      }
      if (!additionalObserverAlreadyAnObserver) {
        observers.push(additionalObserver);
      }
    }
  }

  for (var i = 0; i < observers.length; i++) {
    var observer = observers[i];
    if (observer[params.method]) {
      if (observer.detach && observer.detach()) {
        this.garbageCollectObserver(observer);
      } else {
        observer[params.method].apply(observer, params.arguments);
      }
    }
  }
};

Jelly.garbageCollectObserver = function(observer) {
  var index = Jelly.observers.indexOf(observer);
  if (index > -1) {
    this.arrayRemove(Jelly.observers, index, index + 1);
  }
};

Jelly.arrayRemove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

Jelly.Components = {
  init: function() {
    for (var i = 0; i < Jelly.components.length; i++) {
      this.initComponentFromDefinition(Jelly.components[i]);
    }
    this.initCalled = true;
  },
  initComponentFromDefinition: function(definition) {
    var observer;
    if (definition.component.init) {
      observer = definition.component.init.apply(definition.component, definition.arguments);
    }
    Jelly.observers.push(observer ? observer : definition.component);
  }
};

Jelly.Pages = {
  init: function() {
    this.all = {};
    Jelly.all = this.all; // Deprecated
  },

  add: function(name) {
    var page = new Jelly.Page.Constructor(name);
    for (var i = 1; i < arguments.length; i++) {
      $.extend(page, arguments[i]);
    }
    return page;
  }
};
Jelly.add = Jelly.Pages.add; // Deprecated

Jelly.Page = {
  init: function(controllerName, actionName) {
    var page = Jelly.Pages.all[controllerName] || new Jelly.Page.Constructor(controllerName);
    window.page = page;
    if (page.all) page.all();
    if (page[actionName]) page[actionName].call(page);
    page.loaded = true;
    return page;
  },
  Constructor: function(name) {
    this.loaded = false;
    this.documentHref = Jelly.Location.documentHref;

    this.name = name;
    Jelly.Pages.all[name] = this;
  }
};

Jelly.Location = {
  init: function() {
  },

  on_redirect: function(location) {
    top.location.href = location;
  }
};

Jelly.init();
