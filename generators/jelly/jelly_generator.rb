class JellyGenerator < Rails::Generator::Base
  def manifest
    record do |m|
      m.file 'javascripts/jelly.js', "public/javascripts/jelly.js"
      m.file 'javascripts/ajax_with_jelly.js', "public/javascripts/ajax_with_jelly.js"
      m.directory('public/javascripts/jquery')
      m.file 'javascripts/jquery/jquery-1.3.2.js', "public/javascripts/jquery/jquery-1.3.2.js"
      m.file 'javascripts/jquery/jquery.protify-0.3.js', "public/javascripts/jquery/jquery.protify-0.3.js"
      m.directory('public/javascripts/pages')
    end
  end
end
