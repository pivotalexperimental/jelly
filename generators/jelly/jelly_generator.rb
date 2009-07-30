class JellyGenerator < Rails::Generator::NamedBase
  def manifest
    record do |m|
      m.file 'jelly.js', "public/javascripts/jelly.js"
      m.file 'ajax_with_jelly.js', "public/javascripts/ajax_with_jelly.js"
      m.file 'jquery/jquery-1.3.2.js', "public/javascripts/jquery-1.3.2.js"
      m.file 'jquery/jquery.protify-0.3.js', "public/javascripts/jquery.protify-0.3.js"
    end
  end
end
