/**
 *  Jelly. a sweet unobtrusive javascript framework
 *  for jQuery and Rails
 *
 *  version 0.8.0
 *
 * Copyright (c) 2009 Pivotal Labs
 * Licensed under the MIT license.
 *
 *  * Date: 2009-07-20 9:50:50 (Mon, 20 Jul 2009)
 *
 */

if (!window.Jelly) Jelly = new Object();
if (!Function.prototype.bind) {
  Function.prototype.bind = function(object) {
    var self = this;
    return function() {
      return self.apply(object, arguments);
    }
  }
}
Jelly.init = function() {
  this.components = [];
  this.observers = [];
  this.notifyObservers = this.Observers.notify;
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

Jelly.Observers = {
  notify: function(callbacks) {
    if (this == Jelly) {
      return Jelly.Observers.notify.call(this.observers, callbacks);
    }
    if (!$.isArray(callbacks)) {
      callbacks = [callbacks];
    }

    var observers = this.slice(0);
    for (var i = 0; i < callbacks.length; i++) {
      var callback = callbacks[i];

      // Deprecate 'on' in favor of making each page action a Component.
      if (callback.on) {
        var additionalObserver = eval(callback.on);
        if (observers.indexOf(additionalObserver) == -1) {
          observers.push(additionalObserver);
        }
      }

      for (var j = 0; j < observers.length; j++) {
        var observer = observers[j];
        if (observer[callback.method]) {
          if (observer.detach && observer.detach()) {
            Jelly.Observers.garbageCollectObserver.call(this, observer);
          } else {
            observer[callback.method].apply(observer, callback.arguments);
          }
        }
      }

      if (callback.attach) {
        Jelly.attach.apply(Jelly, callback.attach);
      }
    }
  },

  garbageCollectObserver: function(observer) {
    var index = this.indexOf(observer);
    if (index > -1) {
      Jelly.Observers.remove.call(this, index, index + 1);
    }
  },

  remove: function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
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
