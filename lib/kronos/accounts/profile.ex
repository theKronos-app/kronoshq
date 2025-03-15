defmodule Kronos.Accounts.Profile do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type Kronos.PrefixedUUID
  schema "profiles" do
    field :user_name, :string
    field :avatar_url, :string
    field :settings, :map, default: %{}
    belongs_to :user, Kronos.Accounts.User

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(profile, attrs) do
    profile
    |> cast(attrs, [:user_name, :avatar_url, :settings, :user_id])
    |> validate_required([:user_id])
    |> validate_length(:user_name, max: 50)
    |> foreign_key_constraint(:user_id)
  end
end
