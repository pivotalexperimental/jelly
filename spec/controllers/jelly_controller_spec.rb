require File.dirname(__FILE__) + '/../spec_helper.rb'

describe ApplicationController do

  describe "#jelly_callback" do
    before do
      @controller.stub!(:render)
    end

    it "have the method included" do
      @controller.respond_to?(:jelly_callback).should be_true
    end

    it "should render inline the return of jelly_callback_erb" do
      block = lambda{'foo yo'}
      mock_erb = "whatever"
      @controller.should_receive(:jelly_callback_erb).with("on_foo", {}, block).and_return(mock_erb)
      @controller.should_receive(:render).with(:inline => mock_erb)
      @controller.send(:jelly_callback, "foo", &block)
    end

    describe "#jelly_callback_erb" do
      before do
        request.stub!(:xhr?).and_return(true)
      end

      context "with options" do
        it "should work with a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {'bar' => 'baz'}, lambda{'grape'})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape'],
            'bar' => 'baz'
          }
        end

        it "should work without a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {'bar' => 'baz'}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => [],
            'bar' => 'baz'
          }
        end

        it "should work if options are passed with symbol keys" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {:bar => 'baz'}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => [],
            'bar' => 'baz'
          }
        end
      end

      context "without options" do
        it "should work with a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {}, lambda{'grape'})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape']
          }
        end

        it "should work with a block of more than one thing" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {}, lambda{['grape','tangerine']})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape','tangerine']
          }
        end

        it "should work without a block" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => []
          }
        end
      end

      it "should escape html in the arguments" do
        block = lambda{'<div class="foo"></div>'}
        erb = @controller.send(:jelly_callback_erb, 'foo', {}, block)
        JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
          'method' => 'foo',
          'arguments' => ['<div class="foo"></div>']
        }
      end

      context "when the request is not an XHR" do
        before do
          request.stub!(:xhr?).and_return(false)
        end

        it "should wrap json response in a textarea tag to support File Uploads in an iframe target (see: http://malsup.com/jquery/form/#code-samples)" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {'bar' => 'baz'}, lambda{'grape'})
          result = ERB.new(erb).result(@controller.send(:binding))
          result.should =~ /^<textarea>/
          result.should =~ /<\/textarea>$/
        end
      end

      context "when the request is an XHR" do
        before do
          request.stub!(:xhr?).and_return(true)
        end

        it "should not do the textarea nonsense" do
          erb = @controller.send(:jelly_callback_erb, 'foo', {'bar' => 'baz'}, lambda{'grape'})
          ERB.new(erb).result(@controller.send(:binding)).should_not =~ /textarea/
        end

      end

    end
  end
end
