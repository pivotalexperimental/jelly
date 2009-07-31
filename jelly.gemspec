# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{jelly}
  s.version = "0.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Pivotal Labs, Inc"]
  s.date = %q{2009-07-30}
  s.description = %q{TODO}
  s.email = %q{opensource@pivotallabs.com}
  s.extra_rdoc_files = [
    "README.markdown"
  ]
  s.files = [
    ".gitignore",
     "MIT-LICENSE",
     "README.markdown",
     "Rakefile",
     "VERSION",
     "generators/jelly/USAGE",
     "generators/jelly/jelly_generator.rb",
     "generators/jelly/templates/javascripts/ajax_with_jelly.js",
     "generators/jelly/templates/javascripts/jelly.js",
     "generators/jelly/templates/javascripts/jquery/jquery-1.3.2.js",
     "generators/jelly/templates/javascripts/jquery/jquery.protify-0.3.js",
     "init.rb",
     "install.rb",
     "lib/jelly_controller.rb",
     "lib/jelly_helper.rb",
     "spec/controllers/jelly_controller_spec.rb",
     "spec/fixtures/pages/bears.js",
     "spec/fixtures/pages/lions.js",
     "spec/fixtures/pages/tigers.js",
     "spec/helpers/jelly_helper_spec.rb",
     "spec/javascript/jelly_spec.js",
     "spec/spec_helper.rb",
     "tasks/jelly_tasks.rake",
     "uninstall.rb"
  ]
  s.homepage = %q{http://github.com/pivotal/jelly}
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib"]
  s.rubygems_version = %q{1.3.3}
  s.summary = %q{a sweet unobtrusive javascript framework for jQuery and Rails}
  s.test_files = [
    "spec/controllers/jelly_controller_spec.rb",
     "spec/helpers/jelly_helper_spec.rb",
     "spec/spec_helper.rb"
  ]

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 3

    if Gem::Version.new(Gem::RubyGemsVersion) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
