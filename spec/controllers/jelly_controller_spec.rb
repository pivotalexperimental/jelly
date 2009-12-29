require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe ApplicationController do

  describe "#jelly_callback" do
    attr_reader :response
    before do
      @response = Struct.new(:body).new
      stub(@controller).render do |params|
        response.body = ERB.new(params[:inline]).result(@controller.send(:binding))
      end
    end

    it "have the method included" do
      @controller.respond_to?(:jelly_callback).should be_true
    end

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

      context "when there is a callback param" do
        before do
          @controller.params[:callback] = "Jelly.notifyObservers"
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

    describe "#jelly_callback_erb" do
      before do
        stub(request).xhr? {true}
      end

      context "with options" do
        it "should work with a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {'bar' => 'baz'}, lambda{'grape'})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape'],
            'bar' => 'baz',
            'format' => 'json'
          }
        end

        it "should work without a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {'bar' => 'baz'}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => [],
            'bar' => 'baz',
            'format' => 'json'
          }
        end

        it "should work if options are passed with symbol keys" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {:bar => 'baz'}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => [],
            'bar' => 'baz',
            'format' => 'json'
          }
        end
      end

      context "without options" do
        it "should work with a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {}, lambda{'grape'})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape'],
            'format' => 'json'
          }
        end

        it "should work with a block of more than one thing" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {}, lambda{['grape','tangerine']})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape','tangerine'],
            'format' => 'json'
          }
        end

        it "should work without a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => [],
            'format' => 'json'
          }
        end
      end

      it "should escape html in the arguments" do
        block = lambda{'<div class="foo"></div>'}
        erb = @controller.send(:jelly_callback_erb, 'foo', {}, block)
        JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
          'method' => 'foo',
          'arguments' => ['<div class="foo"></div>'],
          'format' => 'json'
        }
      end
    end
  end
end
