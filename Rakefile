require 'spec/version'
require 'spec/rake/spectask'
require 'rake/rdoctask'

desc 'Default: run specs'
task :default => :spec

desc 'Test the jelly plugin with Rspec.'
Spec::Rake::SpecTask.new(:spec) do |t|
  t.libs << 'lib'
  t.libs << 'spec'
  t.pattern = 'spec/**/*_spec.rb'
  t.verbose = true
end

desc 'Generate documentation for the jelly plugin.'
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'Jelly.'
  rdoc.options << '--line-numbers' << '--inline-source'
  rdoc.rdoc_files.include('README')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

begin
  require 'jeweler'
  Jeweler::Tasks.new do |gemspec|
    gemspec.name = "jelly"
    gemspec.summary = "a sweet unobtrusive javascript framework for jQuery and Rails"
    gemspec.description = "Jelly provides a set of tools and conventions for creating rich ajax/javascript web applications with jQuery and Ruby on Rails."
    gemspec.email = "opensource@pivotallabs.com"
    gemspec.homepage = "http://github.com/pivotal/jelly"
    gemspec.authors = ["Pivotal Labs, Inc"]
    gemspec.files.exclude 'spec/**/*'
    gemspec.add_dependency('rails', '>= 2.3.0')
  end
rescue LoadError
  puts "Jeweler not available. Install it with: sudo gem install jeweler"
end
