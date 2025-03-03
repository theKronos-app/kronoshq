defmodule Kronos.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      KronosWeb.Telemetry,
      Kronos.Repo,
      {DNSCluster, query: Application.get_env(:kronos, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Kronos.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: Kronos.Finch},
      # Start a worker by calling: Kronos.Worker.start_link(arg)
      # {Kronos.Worker, arg},
      # Start to serve requests, typically the last entry
      KronosWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Kronos.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    KronosWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
