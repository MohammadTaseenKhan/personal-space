require "rails_helper"

RSpec.describe "User edits their integrations", type: :system, js: true do
  let(:user) { create(:user, saw_onboarding: true) }
  let(:github_response_body) do
    [
      {
        "id" => 1_296_269,
        "node_id" => "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
        "name" => "Hello-World",
        "full_name" => "octocat/Hello-World"
      },
    ]
  end

  before do
    sign_in user
    stub_request(:get, "https://api.github.com/user/repos?per_page=100")
      .to_return(status: 200, body: github_response_body.to_json, headers: { "Content-Type" => "application/json" })
  end

  describe "via visiting /settings" do
    before do
      visit "/settings"
      puts "*" * 100
      puts page.driver.browser.manage.logs.get(:browser)
      puts page.driver.options.to_s
      puts Capybara.javascript_driver
      puts Capybara.current_driver
      puts "*" * 100
    end

    it "has connect-to-stackbit prompt" do
      find_link("Integrations").click
      puts "-" * 100
      puts page.driver.browser.manage.logs.get(:browser)
      # puts page.driver.options.to_s
      # puts Capybara.javascript_driver
      # puts Capybara.current_driver
      puts "-" * 100

      expect(page).to have_text("Connect to Stackbit")
    end

    it "has connected-to-stackbit prompt if already integrated" do
      create(:doorkeeper_access_token, resource_owner: user)

      click_link "Integrations"
      expect(page).to have_text("Connected to Stackbit")
    end
  end
end
