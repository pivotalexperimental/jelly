module JellyHelper

  JELLY_FILES_PATH = "#{RAILS_ROOT}/public/javascripts"

  def page_specific_javascript_files(jelly_files_path = JELLY_FILES_PATH)
    Dir["#{jelly_files_path}/pages/**/*.js"].map do |path|
      path.gsub("#{jelly_files_path}/", "").gsub(/\.js$/, "")
    end
  end

  def init_specific_javascript
    javascript_tag <<-JS
      window._token = '#{form_authenticity_token}'
      Pages.activatePage('#{controller.controller_path.camelcase}', '#{controller.action_name}');
      #{@content_for_javascript}
    JS
  end

  def attach_javascript_component(component_name, *args)
    content_for(:javascript, "page.attach(#{component_name}, #{args.to_json});")
  end

end