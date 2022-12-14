module Api
  module V0
    class TagsController < ApiController
      include Api::TagsController

      before_action :set_cache_control_headers, only: %i[index]
    end
  end
end
