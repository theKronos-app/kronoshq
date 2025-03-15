defmodule Kronos.PrefixedUUID do
  @doc """
  Generates prefixed base62 encoded UUIDs (v4).

  ## Examples

      @primary_key {:id, Kronos.PrefixedUUID, prefix: "user", autogenerate: true}
      @foreign_key_type Kronos.PrefixedUUID
  """
  use Ecto.ParameterizedType

  @impl Ecto.ParameterizedType
  def init(opts) do
    schema = Keyword.fetch!(opts, :schema)
    field = Keyword.fetch!(opts, :field)

    case opts[:primary_key] do
      true ->
        prefix = Keyword.get(opts, :prefix) || raise "`:prefix` option is required"

        %{
          primary_key: true,
          schema: schema,
          prefix: prefix
        }

      _any ->
        %{
          schema: schema,
          field: field
        }
    end
  end

  @impl Ecto.ParameterizedType
  def type(_params),
    do: :uuid

  @impl Ecto.ParameterizedType
  # Handle nil in order to support optional `belongs_to` fields
  def cast(nil, _params),
    do: {:ok, nil}

  def cast(data, params) do
    with {:ok, prefix, _uuid} <- slug_to_uuid(data, params),
         {prefix, prefix} <- {prefix, prefix(params)} do
      {:ok, data}
    else
      _ -> :error
    end
  end

  defp slug_to_uuid(string, _params) do
    with [prefix, slug] <- String.split(string, "_"),
         {:ok, uuid} <- decode_base62_uuid(slug) do
      {:ok, prefix, uuid}
    else
      _ -> :error
    end
  end

  defp prefix(%{primary_key: true, prefix: prefix}),
    do: prefix

  # If we deal with a belongs_to assocation we need to fetch the prefix from
  # the association's schema module
  defp prefix(%{schema: schema, field: field}) do
    %{related: schema, related_key: field} = schema.__schema__(:association, field)
    {:parameterized, {__MODULE__, %{prefix: prefix}}} = schema.__schema__(:type, field)

    prefix
  end

  @impl Ecto.ParameterizedType
  def load(nil, _loader, _params),
    do: {:ok, nil}

  def load(data, _loader, params) do
    case Ecto.UUID.load(data) do
      {:ok, uuid} -> {:ok, uuid_to_slug(uuid, params)}
      :error -> :error
    end
  end

  defp uuid_to_slug(uuid, params) do
    "#{prefix(params)}_#{encode_base62_uuid(uuid)}"
  end

  @impl Ecto.ParameterizedType
  def dump(nil, _dumper, _params),
    do: {:ok, nil}

  def dump(slug, _dumper, params) do
    case slug_to_uuid(slug, params) do
      {:ok, _prefix, uuid} -> Ecto.UUID.dump(uuid)
      :error -> :error
    end
  end

  @impl Ecto.ParameterizedType
  def autogenerate(params) do
    Ecto.UUID.generate()
    |> uuid_to_slug(params)
  end

  @impl Ecto.ParameterizedType
  def embed_as(format, _params),
    do: Ecto.UUID.embed_as(format)

  @impl Ecto.ParameterizedType
  def equal?(a, b, _params),
    do: Ecto.UUID.equal?(a, b)

  # UUID Base62 encoder/decoder

  @base62_uuid_length 22
  @uuid_length 32

  # No need for `String.downcase(uuid)` here as `String.to_integer(16)` takes care of that for us
  defp encode_base62_uuid(uuid) do
    uuid
    |> String.replace("-", "")
    |> String.to_integer(16)
    |> base62_encode()
    |> String.pad_leading(@base62_uuid_length, "0")
  end

  defp decode_base62_uuid(string) do
    with {:ok, number} <- base62_decode(string) do
      number_to_uuid(number)
    end
  end

  defp number_to_uuid(number) do
    number
    |> Integer.to_string(16)
    |> String.downcase()
    |> String.pad_leading(@uuid_length, "0")
    |> case do
      <<g1::binary-size(8), g2::binary-size(4), g3::binary-size(4), g4::binary-size(4),
        g5::binary-size(12)>> ->
        {:ok, "#{g1}-#{g2}-#{g3}-#{g4}-#{g5}"}

      other ->
        {:error, "got invalid base62 uuid; #{inspect(other)}"}
    end
  end

  # Base62 encoder/decoder

  @base62_alphabet ~c"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

  for {digit, idx} <- Enum.with_index(@base62_alphabet) do
    defp base62_encode(unquote(idx)), do: unquote(<<digit>>)
  end

  defp base62_encode(number) do
    base62_encode(div(number, unquote(length(@base62_alphabet)))) <>
      base62_encode(rem(number, unquote(length(@base62_alphabet))))
  end

  defp base62_decode(string) do
    string
    |> String.split("", trim: true)
    |> Enum.reverse()
    |> Enum.reduce_while({:ok, {0, 0}}, fn char, {:ok, {acc, step}} ->
      case decode_base62_char(char) do
        {:ok, number} ->
          {:cont,
           {:ok, {acc + number * Integer.pow(unquote(length(@base62_alphabet)), step), step + 1}}}

        {:error, error} ->
          {:halt, {:error, error}}
      end
    end)
    |> case do
      {:ok, {number, _step}} -> {:ok, number}
      {:error, error} -> {:error, error}
    end
  end

  for {digit, idx} <- Enum.with_index(@base62_alphabet) do
    defp decode_base62_char(unquote(<<digit>>)), do: {:ok, unquote(idx)}
  end

  defp decode_base62_char(char),
    do: {:error, "got invalid base62 character; #{inspect(char)}"}
end
