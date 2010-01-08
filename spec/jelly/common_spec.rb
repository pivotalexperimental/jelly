require File.expand_path(File.dirname(__FILE__) + '/../spec_helper.rb')

describe Jelly::Common do
  attr_reader :fixture
  before do
    @fixture = Class.new do
      include Jelly::Common
    end.new
  end

  describe "#jelly_callback_hash" do
    it "creates a hash with a method and arguments" do
      fixture.jelly_callback_hash("my_method", 1, 2, 3).should == {
        "method" => "my_method",
        "arguments" => [1, 2, 3]
      }
    end
  end

  describe "#jelly_callback_attach_hash" do
    context "when passed attachments" do
      it "creates a hash with the attach param being set to the given attachments" do
        attachments = [
          fixture.jelly_attachment_hash("Foo", 1, 2),
          fixture.jelly_attachment_hash("Bar", 3),
        ]
        fixture.jelly_callback_attach_hash(attachments).should == {
          "attach" => attachments
        }
      end
    end

    context "when not passed attachments" do
      it "creates a hash with the attach param being set to #jelly_attachments" do
        attachments = [
          fixture.jelly_attachment_hash("Foo", 1, 2),
          fixture.jelly_attachment_hash("Bar", 3),
        ]
        stub(fixture).jelly_attachments {attachments}
        fixture.jelly_callback_attach_hash.should == {
          "attach" => attachments
        }
      end
    end
  end
end