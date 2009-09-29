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

Getting Started - "Spread Jelly"
--------------------------------

Be sure to require <code>jelly</code> when your application loads. This can be done in your `environment.rb` in the `Rails::Initializer.run` block:

    config.gem "jelly"

Then, in your layouts, add the following:

    <%= javascript_include_tag :jelly, *application_jelly_files %>
    <%= spread_jelly %>

This will include the required JavaScripts for jelly and activate the current page.  The `:jelly` javascript expansion
includes jQuery. If you already have jQuery included in the page, use the `:only_jelly` expansion instead.

EXAMPLE USAGE
-------------

Assuming you have controller named `fun` with an action called `index` and that you have a layout called `fun.html.erb`
that is already setup as described above.  In your fun index view (`index.html.erb`), put:

    <h1>Your page's 'index' function did not run. Jelly is not configured correctly.</h1>
    <span class="all">Your page's 'all' function did not run. Jelly is not configured correctly.</span>

Then, in `public/javascripts/pages/fun.js`, put:

    Jelly.add("Fun", {
      all: function() {
        $('span.all').text("I am displayed on every action in this controller.");
      },
      index: function() {
        $('h1').text("Welcome to the index page.");
      }
    });

Now goto `/fun/index` and see Jelly in action!

AJAX CALLBACKS WITH JELLY
-------------------------

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

To run ruby tests, run `rake spec`.
To run JavaScript tests, open `jelly/spec/jasmine_runner.html` in a web browser.
