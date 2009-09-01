require File.dirname(__FILE__) + '/../spec_helper.rb'

describe "JellyHelper" do

  describe "#init_specific_javascript" do
    it "should create a javascript include tag to initialize the Page object" do
      stub_controller = mock(Object, :controller_path => 'my_fun_controller', :action_name => 'super_good_action')
      helper.should_receive(:controller).any_number_of_times.and_return(stub_controller)
      helper.should_receive(:form_authenticity_token).and_return('areallysecuretoken')
      output = helper.spread_jelly
      output.should include('<script type="text/javascript">')
      output.should include("Jelly.activatePage('MyFunController', 'super_good_action');")
    end
  end

  describe "#application_jelly_files" do
    it "returns the javascript files in the given path" do
      my_rails_root = File.join(File.dirname(__FILE__), '/../fixtures')
      files = helper.application_jelly_files("foo", my_rails_root)
      files.should_not be_empty
      files.should =~ ['foo/pages/lions', 'foo/pages/tigers', 'foo/pages/bears']
    end
  end

  describe "#attach_javascript_component" do

    after do
      #need to clear this since it's saving state between tests
      assigns[:content_for_javascript] = ""
      helper.clear_jelly_attached()
    end

    it "fails to add multiple calls to page.attach for the same component" do
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg3')
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg3')
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg5')
      assigns[:content_for_javascript].should == 'page.attach(MyComponent, ["arg1","arg2","arg3"]);page.attach(MyComponent, ["arg1","arg2","arg5"]);'
    end

    it "adds a call to page.attach in the javascript content" do
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg3')
      expected_args = ['arg1','arg2','arg3'].to_json
      assigns[:content_for_javascript].should == "page.attach(MyComponent, #{expected_args});"
    end

    it "adds a call to page.attach in the javascript_on_ready content" do
      helper.attach_javascript_component_on_ready("MyComponent", 'arg1', 'arg2', 'arg3')
      expected_args = ['arg1','arg2','arg3'].to_json
      assigns[:content_for_javascript_on_ready].should == "page.attach(MyComponent, #{expected_args});"
    end

  end

end