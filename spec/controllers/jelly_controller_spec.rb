require File.dirname(__FILE__) + '/../spec_helper.rb'

describe ApplicationController do

  describe "#update_page" do
    it "have the method included" do
      @controller.respond_to?(:update_page).should be_true
    end
  end

end
