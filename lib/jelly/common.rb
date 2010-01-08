module Jelly
  module Common
    def jelly_callback_hash(method, *arguments)
      {"method" => method, "arguments" => arguments}
    end

    def jelly_callback_attach_hash(components=jelly_attachments)
      {"attach" => components}
    end

    def jelly_attachment_hash(component_name, *args)
      {'component' => component_name, 'arguments' => args}
    end
  end
end