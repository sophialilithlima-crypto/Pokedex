export default function PokemonCard({
  pokemon,
  onClick,
  favorito,
  toggleFavorito
}) {

  const id = pokemon.url
    .split("/")
    .filter(Boolean)
    .pop();

  const imagem =
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <div
      className={`pokemon-card ${
        favorito
          ? "pokemon-card-favorite"
          : ""
      }`}
      onClick={onClick}
    >

      <button
        className={`favorite-btn ${
          favorito
            ? "favorite-active"
            : ""
        }`}
        onClick={(e) => {

          e.stopPropagation();

          toggleFavorito(
            pokemon.name
          );

        }}
      >
        {favorito ? "⭐" : "☆"}
      </button>

      <img
        src={imagem}
        alt={pokemon.name}
      />

      <h3>
        #{id.padStart(3, "0")}
      </h3>

      <h2>
        {pokemon.name}
      </h2>

    </div>
  );
}