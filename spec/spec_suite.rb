Dir["#{File.dirname(__FILE__)}/{controllers,helpers}/**/*_spec.rb"].each do |file|
  require file
end