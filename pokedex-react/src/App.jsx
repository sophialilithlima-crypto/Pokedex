import "./App.css";
import { useEffect, useState } from "react";
import PokemonCard from "./components/PokemonCard";

export default function App() {

  const [pokemons, setPokemons] = useState([]);
  const [totalPokemons, setTotalPokemons] = useState(0);
  const [pokemonDetalhes, setPokemonDetalhes] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);

  const [offset, setOffset] = useState(0);
  const [busca, setBusca] = useState("");

  const [favoritos, setFavoritos] = useState([]);

  const limit = 20;

  async function carregarPokemons() {

    const resposta = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );

    const dados = await resposta.json();

    setTotalPokemons(dados.count);

    setPokemons((anterior) => {

      const todos = [
        ...anterior,
        ...dados.results
      ];

      return todos.filter(
        (pokemon, index, array) =>
          index ===
          array.findIndex(
            (p) =>
              p.name === pokemon.name
          )
      );

    });

  }

  useEffect(() => {
    carregarPokemons();
  }, [offset]);

  async function selecionarPokemon(pokemon) {

    const respostaPokemon = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
    );

    const dadosPokemon =
      await respostaPokemon.json();

    setPokemonDetalhes(dadosPokemon);

    const respostaSpecies = await fetch(
      dadosPokemon.species.url
    );

    const dadosSpecies =
      await respostaSpecies.json();

    setPokemonSpecies(dadosSpecies);
  }

  function toggleFavorito(nomePokemon) {

    if (favoritos.includes(nomePokemon)) {

      setFavoritos(
        favoritos.filter(
          (nome) => nome !== nomePokemon
        )
      );

    } else {

      setFavoritos([
        ...favoritos,
        nomePokemon
      ]);

    }
  }

  const pokemonsFiltrados = pokemons
    .filter((pokemon) =>
      pokemon.name
        .toLowerCase()
        .includes(
          busca.toLowerCase()
        )
    )
    .sort((a, b) => {

      const aFav =
        favoritos.includes(a.name);

      const bFav =
        favoritos.includes(b.name);

      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      return 0;
    });

  return (
    <div className="pokedex">

      <div className="left-panel">

        <div className="top-section">

          <div className="main-led"></div>

          <div className="mini-led red"></div>

          <div className="mini-led yellow"></div>

          <div className="mini-led green"></div>

        </div>

        <h1>Pokédex</h1>

        <div className="pokedex-counters">

          <p className="favorites-counter">
          ⭐ Favoritos: {favoritos.length}
          </p>

          <p className="pokemon-counter">
          📦 Pokémons: {pokemons.length}/{totalPokemons}
          </p>

        </div>

        <input
          type="text"
          placeholder="Buscar Pokémon..."
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
        />

        <div className="left-screen">

          <div className="pokemon-list">

            {pokemonsFiltrados.map((pokemon) => (

              <PokemonCard
                key={pokemon.name}
                pokemon={pokemon}
                favorito={
                  favoritos.includes(
                    pokemon.name
                  )
                }
                toggleFavorito={
                  toggleFavorito
                }
                onClick={() =>
                  selecionarPokemon(pokemon)
                }
              />

            ))}

          </div>

          <button
            className="load-more"
            onClick={() =>
              setOffset(
                (valor) =>
                  valor + limit
              )
            }
          >
            Carregar Mais
          </button>

        </div>

        <div className="controls">

          <div className="joystick"></div>

          <div className="buttons">

            <div className="small-button"></div>
            <div className="small-button"></div>

          </div>

        </div>

      </div>

      <div className="right-panel">

        {pokemonDetalhes ? (

          <div className="pokemon-info">

            <h2 className="pokemon-name">
              {pokemonDetalhes.name}
            </h2>

            <p className="pokemon-id">
              #{pokemonDetalhes.id
                .toString()
                .padStart(3, "0")}
            </p>

            <img
              className="pokemon-big-image"
              src={
                pokemonDetalhes.sprites.other[
                  "official-artwork"
                ].front_default
              }
              alt={pokemonDetalhes.name}
            />

            <div className="types-container">

              {pokemonDetalhes.types.map(
                (tipo) => (
                  <span
                    key={tipo.type.name}
                    className={`type-badge ${tipo.type.name}`}
                  >
                    {tipo.type.name}
                  </span>
                )
              )}

            </div>

            <div className="info-grid">

              <div className="info-box">
                <span>Altura</span>
                <strong>
                  {(pokemonDetalhes.height / 10).toFixed(1)} m
                </strong>
              </div>

              <div className="info-box">
                <span>Peso</span>
                <strong>
                  {(pokemonDetalhes.weight / 10).toFixed(1)} kg
                </strong>
              </div>

            </div>

            <div className="abilities">

              <h3>Habilidades</h3>

              <p>
                {pokemonDetalhes.abilities
                  .map(
                    (habilidade) =>
                      habilidade.ability.name
                  )
                  .join(", ")}
              </p>

            </div>

            <div className="pokemon-description">

              <h3>Descrição</h3>

              <p>

                {pokemonSpecies?.flavor_text_entries
                  ?.find(
                    (texto) =>
                      texto.language.name === "en"
                  )
                  ?.flavor_text
                  ?.replace(/\f/g, " ")}

              </p>

            </div>

            <div className="pokemon-rarity">

              <h3>Raridade</h3>

              <p>

                {pokemonSpecies?.is_legendary
                  ? "Lendário"
                  : pokemonSpecies?.is_mythical
                  ? "Mítico"
                  : "Comum"}

              </p>

            </div>

            <div className="stats-container">

              <h3>Status Base</h3>

              {pokemonDetalhes.stats.map(
                (stat) => (

                  <div
                    key={stat.stat.name}
                    className="stat-item"
                  >

                    <span>
                      {stat.stat.name}
                    </span>

                    <div className="stat-bar">

                      <div
  className={`stat-fill ${
    stat.base_stat < 50
      ? "low-stat"
      : stat.base_stat < 90
      ? "medium-stat"
      : "high-stat"
  }`}
  style={{
    width:
      `${Math.min(
        stat.base_stat,
        150
      ) / 150 * 100}%`
  }}
/>
                      

                    </div>

                    <strong>
                      {stat.base_stat}
                    </strong>

                  </div>

                )
              )}

            </div>

          </div>

        ) : (

          <div className="empty-panel">

            <h2>
              Selecione um Pokémon
            </h2>

          </div>

        )}

      </div>

    </div>
  );
}