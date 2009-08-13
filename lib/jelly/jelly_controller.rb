module JellyController
  protected

  def update_page(callback_base_name = @action_name, options = {}, &block)
    render :inline => update_page_erb("on_#{callback_base_name}", options, block)
  end

  def update_page_erb(callback_name, options, block)
    @callback_name = callback_name
    @options = options
    @block = block
    <<-ERB
      <%= begin
        args = @block ? instance_eval(&@block) : []
        args = [args] unless args.is_a?(Array)
        {"method" => @callback_name, "arguments" => args}.reverse_merge(@options).to_json
      end %>
    ERB
  end
end