module Jelly
  module Common
    def jelly_callback_hash(method, *arguments)
      {"method" => method, "arguments" => arguments}
    end

    def jelly_attach_hash(*)
      {"method" => method, "arguments" => arguments}
    end

    def jelly_attach_component_definition_hash(component_name, *args)
      {'component' => component_name, 'arguments' => args}
    end
  end
end