Jelly
=====

What is Jelly?
--------------
Jelly is an unobtrusive Javascript framework for [jQuery](http://jquery.com) and [Rails](http://rubyonrails.org).
It provides a set of conventions and tools that help you organize your AJAX and client-side code,
while keeping Javascript out of your views and markup. Jelly is the glue between your Rails controllers
and jQuery events.

Jelly encourages and enables unit testing your Javascript code. Using a Javascript testing framework such as [Jasmine](http://github.com/pivotal/jasmine)
or [Screw Unit](http://github.com/nathansobo/screw-unit), Jelly allows you to test AJAX and client-side
events independently from your Rails app.

What Jelly is NOT
-----------------
**Jelly is NOT a Javascript generator.** With Jelly, you're writing pure Javascript to define your AJAX browser events. Jelly simply
provides a set of Javascript functions to make interacting with Rails easier. It's nothing like RJS.

**Jelly is NOT a Javascript framework.** Jelly is designed to be used with jQuery and jQuery's event-based
AJAX framework. Jelly also supports the popular [jQuery ajaxForm](http://malsup.com/jquery/form/) plugin.

Requirements
------------
* Rails 2.3.x
* jQuery 1.3.x

Installation
------------

Jelly is now available as a gem on on [RubyForge](http://rubyforge.org/projects/pivotalrb/):

    sudo gem install jelly

Then, install the required Javascript files to your <code>public/javascripts</code> directory by running the Jelly generator:

    script/generate jelly

Getting Started
--------------------------------

Be sure to require <code>jelly</code> when your application loads. This can be done in your `environment.rb` in the `Rails::Initializer.run` block:

    config.gem "jelly"

Then, in your layouts, add the following to the `<head>` section:

    <%= javascript_include_tag :jelly, *application_jelly_files %>
    <%= spread_jelly %>

The `javascript_include_tag` line will include the required Javascript libraries for jelly. The `:jelly` javascript
expansion includes the latest version of jQuery. If you already have jQuery included in the page, use the `:only_jelly`
expansion instead

The `spread_jelly` line activates the events that you have defined on the current page.

Usage
-------------

Jelly maps page-specific Javascript functions to Rails Actions and Controllers. For example: FunController#index will
activate the `index` function in the `Fun` Jelly object. Jelly uses jQuery's `$(document).ready()` to execute the
page-specifc function when the page has loaded. Let's look at some code:

In `public/javascripts/pages/fun.js`, I write a simple Jelly file:

    Jelly.add("Fun", {

      index: function() {
        $('a.clickme').click(function() {
          alert('Hello world!');
        });
      }

    });

Jelly will automatically execute the `index` function when the Rails app runs the `FunController#index` action. Lets
continue the example by adding more Javascript functions that map to the `new` and `show` Rails actions. We can also
specify an `all` function, which will be executed on all actions in the `FunController`.

    Jelly.add("Fun", {

      index: function() {
        $('a.clickme').click(function() {
          alert('Hello world!');
        });
      },

      'new': function() {
        $('#mydiv').html('<span>Hello World</span>');
      },

      show : function() {},

      all: function() {
        $('#hidden_stuff').show();
      }

    });

Notice the slightly different syntax for `new`. This is because `new` is a reserved word in Javascript.
Create a separate file in `public/javascripts/pages` for each of your controllers as you use Jelly throughout your application.

AJAX With Jelly
---------------

You can trigger callbacks on the page object from Rails with the `jelly_callback` method.
Adding to the `index.html.erb` file from above:

    <a href="#" id="jelly_ajax_link">Click me for Jelly Ajax Action</a>
    <span id="jelly_callback_element">This gets filled in by the Jelly Ajax callback</span>

And update your controller:

    class FunController < ApplicationController
      def index
      end

      def ajax_action
        jelly_callback do
          [
            render(:partial => 'fun_partial'),
            "second_parameter"
          ]
        end
      end
    end

Update your page object in `fun.js`:

    Jelly.add("Fun", {
      all: function() {
        $('title').text("Hello!  Isn't this fun?");
      },
      index: function() {
        $('h1').text("Welcome to the index page.");
        $("#jelly_ajax_link").click(function() {
          $.ajaxWithJelly({
            type: "GET",
            url: "/fun/ajax_action"
          });
        });
      },
      on_ajax_action: function(html, second_parameter) {
        $('#jelly_callback_element').html(html);
      }
    });

And finally, make the partial `_fun_partial.html.erb` and just put "Hello from the server!" in it, then visit your page
and watch the ajax callbacks in action.

The `jelly_callback` method takes an optional parameter for the name of the callback, and the provided block can return
either one parameter, or an array of parameters.

DEVELOPMENT
-----------

Track Jelly's development roadmap on [Jelly's Pivotal Tracker project](http://www.pivotaltracker.com/projects/30454)

To run ruby tests, run `rake spec`.

To run Javascript tests, open `jelly/spec/jasmine_runner.html` in a web browser.
