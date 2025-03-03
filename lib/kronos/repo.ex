defmodule Kronos.Repo do
  use Ecto.Repo,
    otp_app: :kronos,
    adapter: Ecto.Adapters.Postgres
end
