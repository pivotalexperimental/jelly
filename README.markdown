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

Jelly maps page-specific Javascript functions to Rails Actions and Controllers. For example: StoriesController#index will
activate the `index` function in the `Fun` Jelly object. Jelly uses jQuery's `$(document).ready()` to execute the
page-specifc function when the page has loaded. Let's look at some code:

In `public/javascripts/pages/stories.js`, we create a simple Jelly file:

    Jelly.add("Stories", {

      index: function() {
        $('a.clickme').click(function() {
          alert('Hello world!');
        });
      }

    });

Jelly will automatically execute the `index` function when the Rails app runs the `StoriesController#index` action. Lets
continue the example by adding more Javascript functions that map to the `new` and `show` Rails actions. We can also
specify an `all` function, which will be executed on all actions in the `StoriesController`.

    Jelly.add("Stories", {

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

Jelly adds an `$.ajaxWithJelly()` function to the jQuery namespace which is a simple wrapper for jQuery's `$.ajax()`.
When you use `$.ajaxWithJelly()` to create an ajax event, Jelly automatically adds an onSuccess handler to your ajax
call that invokes the Jelly framework after receiving the ajax response.

Jelly's convention relies on the Controller to specify the javascript callback after an ajax request. We can invoke Jelly
in response to a javascript request with the `jelly_callback` method.

### Simple AJAX example with `$.ajaxWithJelly()` and `jelly_callback`

The view, `new.html.erb`:

    <a href="#" id="create_story_link">create story</a>

The controller, `stories_controller.rb`

    class StoriesController < ApplicationController
      def new
      end

      def create
        Story.create!(params[:story])
        respond_to do |format|
          format.html
          format.js { jelly_callback }
        end
      end
    end

The javascript, `pages/stories.js`:

    Jelly.add("Stories", {

      new: function() {
        $("#create_story_link").click(function() {
          $.ajaxWithJelly({
            url: "/stories",
            data: {
              name : 'Untitled Story',
            }
          });
        });
      },

      on_create: function() {
        alert('Your story has been created!');
      }
    });

The example above attaches an ajax event to the "create story" link, and when clicked, jQuery will fire a ajax POST request to
the create action of our controller. The controller then responds with `jelly_callback`, and by default invokes the
javascript function named `on_create` in the Stories javascript file.

### Passing parameters to the Jelly callback target

If we wanted to make the creation of the story a bit more interesting, we can send back a html fragment of the
new story that has been created, and pass it as a parameter to `on_create` so it can be added to the page. Let's see how that might look:

The view, `new.html.erb`:

    <a href="#" id="create_story_link">create story</a>
    <ul id="stories">
      <li>First Story</li>
    </ul>

The controller, `stories_controller.rb`

    class StoriesController < ApplicationController
      def new
      end

      def create
        Story.create!(params[:story])
        respond_to do |format|
          format.html
          format.js do
            jelly_callback do
              render :partial => 'story_list_item'
            end
          end
        end
      end
    end

The javascript, `pages/stories.js`:

    Jelly.add("Stories", {

      new: function() {
        $("#create_story_link").click(function() {
          $.ajaxWithJelly({
            url: "/stories",
            data: {
              name : 'Untitled Story',
            }
          });
        });
      },

      on_create: function(storyListItemHtml) {
        $("#stories").append(storyListItemHtml);
      }
    });

The `jelly_callback` function accepts a block which is evaluated in the context of the view layer, which allows you to
render partials and use Rails Helpers as you normally would. You can pass as many parameters as you want to the javascript
callback by passing an array to the `jelly_callback` block:

### Passing multiple parameters to the Jelly callback target

in the controller, `stories_controller.rb`:

    def create
      @story = Story.create!(params[:story])
      respond_to do |format|
        format.html
        format.js do
          jelly_callback do
            [ render(:partial => 'story_list_item'), @story.id, "Nice looking story, smart guy" ]
          end
        end
      end
    end

in the javascript, `pages/stories.js`:

    on_create: function(storyListItemHtml, storyId, message) {
      $(storyListItemHtml).attr('id', storyId).appendTo($("#stories"));
      alert(message);
    },

### Specifying custom callback functions in `jelly_callback`

As we have seen above, by default, `jelly_callback` invokes the javascript function by prepending `on_` to the Rails
action name. The `jelly_callback` method can take an optional parameter for the name of the callback to allow more fine-grained
client-side behaviors depending on the server-side response.

in the controller, `stories_controller.rb`

    def create
      begin
        Story.create!(params[:story])
        respond_to do |format|
          format.html
          format.js do
            jelly_callback('successful_create') do
              render :partial => 'story_list_item'
            end
          end
        end
      rescue
        respond_to do |format|
          format.html
          format.js do
            jelly_callback('failed_create')
          end
        end
      end
    end

in the javascript, `pages/stories.js`:

    on_successful_create: function(storyListItemHtml) {
      $("#stories").append(storyListItemHtml);
    },

    on_failed_create: function() {
      alert('Oops, there was a problem creating your story!);
    }

DEVELOPMENT
-----------

Track Jelly's development roadmap on [Jelly's Pivotal Tracker project](http://www.pivotaltracker.com/projects/30454)

To run ruby tests, run `rake spec`.

To run Javascript tests, open `jelly/spec/jasmine_runner.html` in a web browser.
