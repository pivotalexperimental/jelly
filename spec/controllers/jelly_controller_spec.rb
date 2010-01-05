require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe ApplicationController do

  describe "#jelly_callback" do
    attr_reader :template
    before do
      stub(@controller).render do |params|
        @template = ActionView::Base.new(@controller.class.view_paths, {}, @controller)
        template.send(:_evaluate_assigns_and_ivars)
        response.body = ERB.new(params[:inline]).result(template.send(:binding))
      end
    end

    it "have the method included" do
      @controller.respond_to?(:jelly_callback).should be_true
    end

    describe "Arguments block" do
      describe "self" do
        it "runs with the binding of the ERB template" do
          self_in_block = nil
          @controller.send(:jelly_callback, 'foo', :format => :json) do
            self_in_block = self
            12345
          end
          self_in_block.should == template
        end
      end

      context "when an Array is returned from the block" do
        it "sets the arguments to be an Array around the Hash" do
          @controller.send(:jelly_callback, 'foo', :format => :json) do
            ["foo", "bar"]
          end
          callback = JSON.parse(response.body)
          callback["method"].should == "on_foo"
          callback["arguments"].should == ["foo", "bar"]
        end
      end

      context "when a non-array is returned in the block" do
        context "when the argument is a Hash" do
          it "sets the arguments to be an Array around the Hash" do
            @controller.send(:jelly_callback, 'foo', :format => :json) do
              {"foo" => "bar"}
            end
            callback = JSON.parse(response.body)
            callback["method"].should == "on_foo"
            callback["arguments"].should == [{"foo" => "bar"}]
          end
        end

        context "when the argument is a String" do
          it "sets the arguments to be an Array around the argument" do
            @controller.send(:jelly_callback, 'foo', :format => :json) do
              "foobar"
            end
            callback = JSON.parse(response.body)
            callback["method"].should == "on_foo"
            callback["arguments"].should == ["foobar"]
          end
        end

        context "when the argument is a Number" do
          it "sets the arguments to be an Array around the argument" do
            @controller.send(:jelly_callback, 'foo', :format => :json) do
              12345
            end
            callback = JSON.parse(response.body)
            callback["method"].should == "on_foo"
            callback["arguments"].should == [12345]
          end
        end
      end
    end

    context "when given a format" do
      describe "json" do
        it "responds with a json hash, even if the request is not xhr" do
          stub(request).xhr? {false}

          @controller.send(:jelly_callback, 'foo', {'format' => :json, 'bar' => 'baz'}) do
            "grape"
          end
          callback = JSON.parse(response.body)
          callback["method"].should == "on_foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end

      describe "jsonp" do
        it "responds with a jsonp callback based on the callback param" do
          @controller.params[:callback] = "Jelly.notifyObservers"

          @controller.send(:jelly_callback, 'foo', {'format' => :jsonp, 'bar' => 'baz'}) do
            "grape"
          end
          json = Regexp.new('Jelly\.notifyObservers\((.*)\);').match(response.body)[1]
          callback = JSON.parse(json)
          callback["method"].should == "on_foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end

      describe "iframe" do
        it "responds with a the json in a textarea tag" do
          @controller.send(:jelly_callback, 'foo', {'format' => :iframe, 'bar' => 'baz'}) do
            "grape"
          end
          body = response.body
          body.should =~ /^<textarea>/
          body.should =~ /<\/textarea>$/
          doc = Nokogiri::HTML(body)

          callback = JSON.parse(doc.at("textarea").inner_html)
          callback["method"].should == "on_foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end
    end

    context "when there is a callback param" do
      before do
        @controller.params[:callback] = "Jelly.notifyObservers"
      end

      context "when the request is XHR" do
        before do
          stub(request).xhr? {true}
        end

        it "responds with a call to the given callback method with the json as an argument" do
          @controller.send(:jelly_callback, 'foo', {'bar' => 'baz'}) do
            "grape"
          end
          json = Regexp.new('Jelly\.notifyObservers\((.*)\);').match(response.body)[1]
          callback = JSON.parse(json)
          callback["method"].should == "on_foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end

      context "when the request is not XHR" do
        before do
          stub(request).xhr? {false}
        end

        it "responds with a call to the given callback method with the json as an argument" do
          @controller.send(:jelly_callback, 'foo', {'bar' => 'baz'}) do
            "grape"
          end
          json = Regexp.new('Jelly\.notifyObservers\((.*)\);').match(response.body)[1]
          callback = JSON.parse(json)
          callback["method"].should == "on_foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end
    end

    context "when there is not a callback param" do
      context "when the request is XHR" do
        before do
          stub(request).xhr? {true}
        end

        it "responds with a json hash" do
          @controller.send(:jelly_callback, 'foo', {'bar' => 'baz'}) do
            "grape"
          end
          callback = JSON.parse(response.body)
          callback["method"].should == "on_foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end

      end

      context "when the request is not XHR" do
        before do
          stub(request).xhr? {false}
        end

        context "when there is not a callback param" do
          it "wraps the json response in a textarea tag to support File Uploads in an iframe target (see: http://malsup.com/jquery/form/#code-samples)" do
            @controller.send(:jelly_callback, 'foo', {'bar' => 'baz'}) do
              "grape"
            end
            body = response.body
            body.should =~ /^<textarea>/
            body.should =~ /<\/textarea>$/
            doc = Nokogiri::HTML(body)

            callback = JSON.parse(doc.at("textarea").inner_html)
            callback["method"].should == "on_foo"
            callback["arguments"].should == ["grape"]
            callback["bar"].should == "baz"
          end
        end
      end
    end
  end

  describe "#raw_jelly_callback" do
    attr_reader :response
    before do
      @response = Struct.new(:body).new
      stub(@controller).render do |params|
        response.body = ERB.new(params[:inline]).result(@controller.send(:binding))
      end
    end

    it "have the method included" do
      @controller.respond_to?(:raw_jelly_callback).should be_true
    end

    context "when given a format" do
      describe "json" do
        it "responds with a json hash, even if the request is not xhr" do
          stub(request).xhr? {false}

          @controller.send(:raw_jelly_callback, :format => :json) do
            jelly_callback_hash("foo", "grape").merge('bar' => 'baz')
          end
          callback = JSON.parse(response.body)
          callback["method"].should == "foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end

      describe "jsonp" do
        it "responds with a jsonp callback based on the callback param" do
          @controller.params[:callback] = "Jelly.notifyObservers"

          @controller.send(:raw_jelly_callback, :format => :jsonp) do
            jelly_callback_hash("foo", "grape").merge('bar' => 'baz')
          end
          json = Regexp.new('Jelly\.notifyObservers\((.*)\);').match(response.body)[1]
          callback = JSON.parse(json)
          callback["method"].should == "foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end

      describe "iframe" do
        it "responds with a the json in a textarea tag" do
          @controller.send(:raw_jelly_callback, :format => :iframe) do
            jelly_callback_hash("foo", "grape").merge('bar' => 'baz')
          end
          body = response.body
          body.should =~ /^<textarea>/
          body.should =~ /<\/textarea>$/
          doc = Nokogiri::HTML(body)

          callback = JSON.parse(doc.at("textarea").inner_html)
          callback["method"].should == "foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end
    end

    context "when the request is XHR" do
      before do
        stub(request).xhr? {true}
      end

      it "responds with a json hash" do
        @controller.send(:raw_jelly_callback) do
          jelly_callback_hash("foo", "grape").merge('bar' => 'baz')
        end
        callback = JSON.parse(response.body)
        callback["method"].should == "foo"
        callback["arguments"].should == ["grape"]
        callback["bar"].should == "baz"
      end

    end

    context "when the request is not XHR" do
      before do
        stub(request).xhr? {false}
      end

      context "when there is a callback param" do
        before do
          @controller.params[:callback] = "Jelly.notifyObservers"
        end

        it "responds with a call to the given callback method with the json as an argument" do
          @controller.send(:raw_jelly_callback) do
            jelly_callback_hash("foo", "grape").merge('bar' => 'baz')
          end
          json = Regexp.new('Jelly\.notifyObservers\((.*)\);').match(response.body)[1]
          callback = JSON.parse(json)
          callback["method"].should == "foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end

      context "when there is not a callback param" do
        it "wraps the json response in a textarea tag to support File Uploads in an iframe target (see: http://malsup.com/jquery/form/#code-samples)" do
          @controller.send(:raw_jelly_callback) do
            jelly_callback_hash("foo", "grape").merge('bar' => 'baz')
          end
          body = response.body
          body.should =~ /^<textarea>/
          body.should =~ /<\/textarea>$/
          doc = Nokogiri::HTML(body)

          callback = JSON.parse(doc.at("textarea").inner_html)
          callback["method"].should == "foo"
          callback["arguments"].should == ["grape"]
          callback["bar"].should == "baz"
        end
      end
    end
  end
end
