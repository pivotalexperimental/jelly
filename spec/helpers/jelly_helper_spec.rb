require File.dirname(__FILE__) + '/../spec_helper.rb'

describe "JellyHelper" do

  describe "#init_specific_javascript" do
    it "should create a javascript include tag to initialize the Page object" do
      stub_controller = mock(Object, :controller_path => 'my_fun_controller', :action_name => 'super_good_action')
      helper.should_receive(:controller).any_number_of_times.and_return(stub_controller)
      helper.should_receive(:form_authenticity_token).and_return('areallysecuretoken')
      output = helper.init_specific_javascript
      output.should include('<script type="text/javascript">')
      output.should include("Jelly.activatePage('MyFunController', 'super_good_action');")
    end
  end

  describe "#page_specific_javascript_files" do
    it "returns the javascript files in the given path" do
      my_rails_root = File.join(File.dirname(__FILE__), '/../fixtures')
      files = helper.page_specific_javascript_files("foo", my_rails_root)
      files.should_not be_empty
      files.should =~ ['foo/pages/lions', 'foo/pages/tigers', 'foo/pages/bears']
    end
  end

  describe "#attach_javascript_component" do
    it "adds a call to page.attach in the javascript content" do
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg3')
      expected_args = ['arg1','arg2','arg3'].to_json
      assigns[:content_for_javascript].should include("page.attach(MyComponent, #{expected_args}")
    end
  end

end