module Jelly
  module Common
    def jelly_callback_hash(method, *arguments)
      {"method" => method, "arguments" => arguments}
    end
  end
end