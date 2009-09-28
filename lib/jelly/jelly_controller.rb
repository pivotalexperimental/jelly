module JellyController
  protected

  def jelly_callback(callback_base_name = @action_name, options = {}, &block)
    render :inline => jelly_callback_erb("on_#{callback_base_name}", options, block)
  end

  def jelly_callback_erb(callback_name, options, block)
    @callback_name = callback_name
    @options = options
    @block = block
    erb = <<-ERB
      <%= begin
        args = @block ? instance_eval(&@block) : []
        args = [args] unless args.is_a?(Array)
        {"method" => @callback_name, "arguments" => args}.reverse_merge(@options).to_json
      end %>
    ERB
    request.xhr? ? erb : "<textarea>#{erb}</textarea>"
  end


end
