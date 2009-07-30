module JellyController
  protected

  def update_page(callback_base_name = @action_name, &block)
    @callback_name = "on_#{callback_base_name}"
    @block = block
    render :inline => <<-ERB
      <%= begin
        args = @block ? instance_eval(&@block) : []
        args = [args] unless args.is_a?(Array)
        {"method" => @callback_name, "arguments" => args}.to_json
      end %>
    ERB
  end
end