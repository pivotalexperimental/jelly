/**
 *  Jelly. a sweet unobtrusive javascript framework
 *  for jQuery and Rails
 *
 *  version 0.5
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
  Jelly.Pages.init();
  $(document).ready(function() {
    Jelly.Components.init();
  });
};

Jelly.attach = function(component, args) {
  this.components.push([component, args]);
};

Jelly.notifyObservers = function(params) {
  var context = params.on ? eval(params.on) : page;
  if (context[params.method]) {
    context[params.method].apply(context, params.arguments);
  }
  $.protify(Jelly.components).each(function(componentAndArgs) {
    var component = componentAndArgs[0];
    if (component[params.method] && component != context) {
      component[params.method].apply(component, params.arguments);
    }
  });
};

Jelly.Components = {
  init: function() {
    $.protify(Jelly.components).each(function(componentAndArgs) {
      var component = componentAndArgs[0];
      var args = componentAndArgs[1] || [];
      if (component.init) component.init.apply(component, args);
    });
  }
};

Jelly.Pages = {
  init: function() {
    this.all = {};
    Jelly.all = this.all; // Deprecated
  },

  add: function(name) {
    var page = new Jelly.Page(name);
    for (var i = 1; i < arguments.length; i++) {
      $.extend(page, arguments[i]);
    }
    return page;
  }
};
Jelly.add = Jelly.Pages.add; // Deprecated

Jelly.Page = function(name) {
  this.documentHref = Jelly.Location.documentHref;

  this.name = name;
  this.components = [];
  Jelly.Pages.all[name] = this;
};
Jelly.Page.prototype.loaded = false;
Jelly.Page.prototype.all = function() {
};

Jelly.Page.init = function(controllerName, actionName) {
  var page = Jelly.Pages.all[controllerName] || new Jelly.Page(controllerName);
  window.page = page;
  if (page.all) page.all();
  if (page[actionName]) page[actionName].call(page);
  page.loaded = true;
};

Jelly.Location = {
  init: function() {
  },

  on_redirect: function(location) {
    top.location.href = location;
  }
};

Jelly.init();
