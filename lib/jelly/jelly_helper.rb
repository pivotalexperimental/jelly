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
    javascript_tag <<-JS
      window._token = '#{form_authenticity_token}'
      #{@content_for_javascript}
      $(document).ready(function() {
        #{@content_for_javascript_on_ready}
      });
    JS
  end

  def clear_jelly_attached()
    @jelly_attached_components = []
  end

  def attach_javascript_component(component_name, *args)
    @jelly_attached_components ||= []    
    key = "Jelly.attach(#{component_name}, #{args.to_json});"
    unless @jelly_attached_components.include? key
      @jelly_attached_components << key
      content_for(:javascript, key)
    end
  end

  def attach_javascript_component_on_ready(component_name, *args)
    @jelly_attached_components_on_ready ||= []
    key = "Jelly.attach(#{component_name}, #{args.to_json});"
    unless @jelly_attached_components_on_ready.include? key
      @jelly_attached_components_on_ready << key
      content_for(:javascript_on_ready, key)
    end
  end

end