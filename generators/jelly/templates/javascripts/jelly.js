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

var Jelly = new Object();
Jelly.all = {};

Jelly.add = function(name) {
  var page = new Jelly.Page(name);
  for(var i=1; i < arguments.length; i++) {
    $.extend(page, arguments[i]);
  }
  return page;
};

var page;
Jelly.activatePage = function(controllerName, actionName) {
  page = Jelly.all[controllerName] || new Jelly.Page(controllerName);
  $(document).ready(function(){
    Jelly._activatePage(actionName); 
  });
};

Jelly._activatePage = function(actionName){
  if(page.all) page.all();
  if(page[actionName]) page[actionName].call(page);
  Jelly.Page.all();
  page.loaded = true;
};

Jelly.Page = function(name) {
  this.name = name;
  Jelly.all[name] = this;
};

Jelly.Page.all = function() {
  $.protify(Jelly.Page.components).each(function(componentAndArgs) {
    var component = componentAndArgs[0];
    var args = componentAndArgs[1] || [];
    if(component.init) component.init.apply(component, args);
  });
};
Jelly.Page.components = [];
Jelly.Page.prototype.loaded = false;
Jelly.Page.prototype.documentHref = function() {
  return document.location.href;
};
Jelly.Page.prototype.on_redirect = function(location){
  top.location.href = location;
};

Jelly.Page.prototype.attach = function(component, args) {
  var methodNames = [];
  // TODO: Figure out a better way to do this.
  for(var methodName in component.pageMixin) {
    methodNames.push(methodName);
  }
  var self = this;
  $.protify(methodNames).each(function(methodName) {
    self[methodName] = function() {
      if(this['before_' + methodName]) {
        this['before_' + methodName].apply(this, arguments);
      }
      var returnValue = component.pageMixin[methodName].apply(this, arguments);
      if(this['after_' + methodName]) {
        this['after_' + methodName].apply(this, arguments);
      }
      return returnValue;
    };
  });
  Jelly.Page.components.push([component, args]);
};
