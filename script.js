const container = document.getElementById("pokedex");

async function carregarPokemons() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=10");
    const data = await res.json();

    for (let p of data.results) {
      const detalhes = await fetch(p.url);
      const pokemon = await detalhes.json();

      const div = document.createElement("div");

      div.innerHTML = `
        <img src="${pokemon.sprites.front_default}">
        <p>${pokemon.name}</p>
      `;

      container.appendChild(div);
    }

  } catch (erro) {
    console.log("Erro:", erro);
  }
}

carregarPokemons();