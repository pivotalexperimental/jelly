module JellyHelper
  include Jelly::Common

  def application_jelly_files(jelly_files_path_from_javascripts = '', rails_root = RAILS_ROOT)
    rails_root = File.expand_path(rails_root)
    (
      Dir[File.expand_path("#{rails_root}/public/javascripts/#{jelly_files_path_from_javascripts}/components/**/*.js")] +
      Dir[File.expand_path("#{rails_root}/public/javascripts/#{jelly_files_path_from_javascripts}/pages/**/*.js")]
    ).map do |path|
      path.gsub("#{rails_root}/public/javascripts/", "").gsub(/\.js$/, "")
    end
  end

  def spread_jelly
    attach_javascript_component("Jelly.Location")
    attach_javascript_component("Jelly.Page", controller.controller_path.camelcase, controller.action_name)
    <<-HTML
      #{window_token_javascript_tag}
      #{jelly_component_sources.uniq.collect {|a| javascript_src_tag "components/#{a}", {} }.join("\r\n")}
      #{attach_javascript_component_javascript_tag(jelly_attachments)}
    HTML
  end

  def window_token_javascript_tag
    javascript_tag("window._token = '#{form_authenticity_token}';")
  end

  def attach_javascript_component_javascript_tag(*components)
    components = [components].flatten
    javascript_tag <<-JS
      $(document).ready(function() {
        Jelly.attach.apply(Jelly, #{components.to_json});
      });
    JS
  end

  def clear_jelly_attached
    jelly_attachments.clear
  end

  def attach_javascript_component(component_name, *args)
    # first, check whether we need to create a script tag for this component
    src_tag = args.detect {|a| a.class == Hash and a.has_key? :create_src_tag}
    if src_tag
      args.delete(src_tag)
      jelly_component_sources << component_name
    end

    key = jelly_attachment_hash(component_name, *args)
    unless jelly_attachments.include? key
      jelly_attachments << key
    end
  end

  def attach_javascript_component_on_ready(component_name, *args)
    warn "attach_javascript_component_on_ready is deprecated since attach_javascript_component adds components to be attached in a $(document).ready block\n#{puts caller.join("\n\t")}"
    attach_javascript_component(component_name, *args)
  end

  def jelly_attachments
    @jelly_attachments ||= []
  end

  def jelly_component_sources
    @jelly_component_sources ||= []
  end

end
