module JellyController
  protected
  include Jelly::Common

  def jelly_callback(callback_base_name = @action_name, options = {}, &block)
    options[:format] ||= if request.xhr?
      :json
    elsif params[:callback]
      :jsonp
    else
      :iframe
    end
    render :inline => jelly_callback_erb("on_#{callback_base_name}", options, block)
  end

  def jelly_callback_erb(callback_name, options, block)
    options[:format] ||= :json
    @callback_name = callback_name
    @options = options
    @block = block
    case options[:format].to_sym
      when :iframe
        "<textarea>#{jelly_callback_erb_template}</textarea>"
      when :jsonp
        @jsonp_callback = params[:callback]
        jelly_callback_erb_template
      else
        jelly_callback_erb_template
    end
  end

  def jelly_callback_erb_template
    <<-ERB
      <%= begin
        args = @block ? instance_eval(&@block) : []
        args = [args] unless args.is_a?(Array)
        json = {"method" => @callback_name, "arguments" => args}.reverse_merge(@options).to_json
        @jsonp_callback ? "\#{@jsonp_callback}(\#{json});" : json
      end %>
    ERB
  end
end
