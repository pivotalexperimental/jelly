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

Jelly.attach = function() {
  for(var i = 0; i < arguments.length; i++) {
    var definition = arguments[i];
    var component = (typeof definition.component == "string") ?
                    eval(definition.component) :
                    definition.component;
    this.components.push({
      component: component,
      arguments: definition.arguments
    });
  }
};

Jelly.notifyObservers = function(params) {
  var context = params.on ? eval(params.on) : page;
  if (context[params.method]) {
    context[params.method].apply(context, params.arguments);
  }
  for(var i = 0; i < Jelly.components.length; i++) {
    var definition = Jelly.components[i];
    if (definition.component[params.method] && definition.component != context) {
      definition.component[params.method].apply(definition.component, params.arguments);
    }    
  }
};

Jelly.Components = {
  init: function() {
    for(var i = 0; i < Jelly.components.length; i++) {
      var definition = Jelly.components[i];
      if (definition.component.init) {
        definition.component.init.apply(definition.component, definition.arguments);
      }
    }
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
