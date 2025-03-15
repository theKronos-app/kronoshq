defmodule Kronos.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Kronos.Accounts` context.
  """

  def unique_user_email, do: "user#{System.unique_integer()}@example.com"
  def valid_user_password, do: "hello world!"

  def valid_user_attributes(attrs \\ %{}) do
    Enum.into(attrs, %{
      email: unique_user_email(),
      password: valid_user_password()
    })
  end

  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> valid_user_attributes()
      |> Kronos.Accounts.register_user()

    user
  end

  def extract_user_token(fun) do
    {:ok, captured_email} = fun.(&"[TOKEN]#{&1}[TOKEN]")
    [_, token | _] = String.split(captured_email.text_body, "[TOKEN]")
    token
  end

  def valid_profile_attributes(attrs \\ %{}) do
    Enum.into(attrs, %{
      "user_name" => "TestUser",
      "avatar_url" => "https://example.com/avatar.jpg",
      "settings" => %{"theme" => "dark", "notifications" => true}
    })
  end

  # Note: This function is no longer needed since users automatically get a profile
  # when they are created. Use Accounts.get_profile_by_user_id(user.id) instead.
  def profile_fixture(user, attrs \\ %{}) do
    # Delete any existing profile first to avoid conflicts
    case Kronos.Accounts.get_profile_by_user_id(user.id) do
      nil -> :ok
      profile -> Kronos.Accounts.delete_profile(profile)
    end
    
    attrs = valid_profile_attributes(attrs)
    
    {:ok, profile} = Kronos.Accounts.create_profile(user, attrs)
    
    profile
  end
end
