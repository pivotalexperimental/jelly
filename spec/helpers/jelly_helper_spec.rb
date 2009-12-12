require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe JellyHelper do

  def jelly_attach_arguments(html)
    JSON.parse(Regexp.new('Jelly\.attach\((.*)\);').match(html)[1])
  end

  describe "#spread_jelly" do
    before do
      stub_controller = mock(Object, :controller_path => 'my_fun_controller', :action_name => 'super_good_action')
      helper.should_receive(:controller).any_number_of_times.and_return(stub_controller)
      helper.should_receive(:form_authenticity_token).and_return('areallysecuretoken')
    end

    it "should create a javascript include tag that attaches the Jelly.Location and Jelly.Page components" do
      output = helper.spread_jelly
      output.should include('<script type="text/javascript">')
      argument = jelly_attach_arguments(output)
      argument.should include({'name' => "Jelly.Location", 'arguments' => []})
      argument.should include({'name' => "Jelly.Page", 'arguments' => ['MyFunController', 'super_good_action']})
    end
  end

  describe "#application_jelly_files" do
    context "when passing in a jelly path" do
      it "returns the javascript files in /javascipts/:jelly_path/pages and /javascipts/:jelly_path/components" do
        my_rails_root = File.join(File.dirname(__FILE__), '/../fixtures')
        files = helper.application_jelly_files("foo", my_rails_root)
        files.should_not be_empty
        files.should =~ ['foo/components/paw', 'foo/components/teeth', 'foo/pages/lions', 'foo/pages/tigers', 'foo/pages/bears']
      end
    end

    context "when not passing in a jelly path" do
      it "returns the javascript files in /javascipts/pages and /javascipts/components" do
        my_rails_root = File.join(File.dirname(__FILE__), '/../fixtures')
        files = helper.application_jelly_files("", my_rails_root)
        files.should_not be_empty
        files.should =~ ['components/component1', 'pages/page1']
      end
    end
  end

  describe "#attach_javascript_component" do
    before do
      def helper.form_authenticity_token
        "12345"
      end
    end

    after do
      helper.clear_jelly_attached()
    end

    it "fails to add multiple calls to Jelly.attach for the same component" do
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg3')
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg3')
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg5')
      assigns[:jelly_attached_components].should == [
        {'name' => "MyComponent", 'arguments' => ['arg1', 'arg2', 'arg3']},
        {'name' => "MyComponent", 'arguments' => ['arg1', 'arg2', 'arg5']},
      ]
    end

    it "adds a call to Jelly.attach in the javascript content" do
      helper.attach_javascript_component("MyComponent", 'arg1', 'arg2', 'arg3')
      expected_args = ['arg1','arg2','arg3'].to_json
      assigns[:jelly_attached_components].should == [
        {'name' => "MyComponent", 'arguments' => ['arg1', 'arg2', 'arg3']}
      ]

      html = helper.spread_jelly
      pre_document_ready_part = html.split("\n")[0..3].join("\n")
      pre_document_ready_part.split("\n")[0].should_not include("$(document).ready(function() {")

      arguments = jelly_attach_arguments(pre_document_ready_part)
      arguments.should include({'name' => "MyComponent", 'arguments' => ['arg1', 'arg2', 'arg3']})
    end

    it "adds a call to Jelly.attach in the javascript_on_ready content" do
      helper.attach_javascript_component_on_ready("MyComponent", 'arg1', 'arg2', 'arg3')

      assigns[:jelly_attached_components_on_ready].should == [
        {'name' => "MyComponent", 'arguments' => ['arg1', 'arg2', 'arg3']}
      ]

      html = helper.spread_jelly
      document_ready_part = html.split("\n")[4..-1].join("\n")
      document_ready_part.split("\n")[0].should include("$(document).ready(function() {")
      arguments = jelly_attach_arguments(document_ready_part)
      arguments.should include({'name' => "MyComponent", 'arguments' => ['arg1', 'arg2', 'arg3']})
    end

  end

end