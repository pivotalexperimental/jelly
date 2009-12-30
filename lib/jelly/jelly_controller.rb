module JellyController
  protected
  include Jelly::Common

  def jelly_callback(callback_base_name = @action_name, options = {}, &block)
    raw_jelly_callback(options) do
      arguments = block.try(:call) || []
      arguments = [arguments] unless arguments.is_a?(Array)
      jelly_callback_hash("on_#{callback_base_name}", *arguments).merge(options)
    end
  end

  def raw_jelly_callback(options={}, &block)
    options.symbolize_keys!
    options[:format] ||= if request.xhr?
      :json
    elsif params[:callback]
      :jsonp
    else
      :iframe
    end
    render :inline => jelly_callback_erb(options, &block)
  end

  def jelly_callback_erb(options={}, &block)
    options[:format] ||= :json
    @jelly_block = block
    case options[:format].to_sym
      when :iframe
        "<textarea>#{jelly_callback_erb_template}</textarea>"
      when :jsonp
        "#{params[:callback]}(#{jelly_callback_erb_template});"
      else
        jelly_callback_erb_template
    end
  end

  def jelly_callback_erb_template
    "<%= instance_eval(&@jelly_block).to_json %>"
  end
end
