require File.dirname(__FILE__) + '/../spec_helper.rb'

describe ApplicationController do

  describe "#update_page" do
    before do
      @controller.stub!(:render)
    end

    it "have the method included" do
      @controller.respond_to?(:update_page).should be_true
    end

    it "should render inline the return of update_page_erb" do
      block = lambda{'foo yo'}
      mock_erb = "whatever"
      @controller.should_receive(:update_page_erb).with("on_foo", {}, block).and_return(mock_erb)
      @controller.should_receive(:render).with(:inline => mock_erb)
      @controller.send(:update_page, "foo", &block)
    end

    describe "#update_page_erb" do
      context "with options" do
        it "should work with a block" do
          erb = @controller.send(:update_page_erb, 'foo', {'bar' => 'baz'}, lambda{'grape'})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape'],
            'bar' => 'baz'
          }
        end

        it "should work without a block" do
          erb = @controller.send(:update_page_erb, 'foo', {'bar' => 'baz'}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => [],
            'bar' => 'baz'
          }
        end

        it "should work if options are passed with symbol keys" do
          erb = @controller.send(:update_page_erb, 'foo', {:bar => 'baz'}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => [],
            'bar' => 'baz'
          }
        end
      end

      context "without options" do
        it "should work with a block" do
          erb = @controller.send(:update_page_erb, 'foo', {}, lambda{'grape'})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape']
          }
        end

        it "should work with a block of more than one thing" do
          erb = @controller.send(:update_page_erb, 'foo', {}, lambda{['grape','tangerine']})
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => ['grape','tangerine']
          }
        end

        it "should work without a block" do
          erb = @controller.send(:update_page_erb, 'foo', {}, nil)
          JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
            'method' => 'foo',
            'arguments' => []
          }
        end
      end

      it "should escape html in the arguments" do
        block = lambda{'<div class="foo"></div>'}
        erb = @controller.send(:update_page_erb, 'foo', {}, block)
        JSON.parse(ERB.new(erb).result(@controller.send(:binding))).should == {
          'method' => 'foo',
          'arguments' => ['<div class="foo"></div>']
        }
      end
    end
  end


end
