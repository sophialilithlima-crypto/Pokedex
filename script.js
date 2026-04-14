const container = document.getElementById("pokedex");
const searchInput = document.getElementById("search");

const modal = document.getElementById("modal");
const modalInfo = document.getElementById("modal-info");
const closeBtn = document.getElementById("close");

let listaPokemons = [];

async function carregarPokemons() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=105");
    const data = await res.json();

    for (let p of data.results) {
      const detalhes = await fetch(p.url);
      const pokemon = await detalhes.json();

      listaPokemons.push(pokemon);
    }

    mostrarPokemons(listaPokemons);

  } catch (erro) {
    console.log("Erro:", erro);
  }
}

function mostrarPokemons(lista) {
  container.innerHTML = "";

  lista.forEach(pokemon => {
    container.innerHTML += `
      <div class="card" onclick="abrirModal(${pokemon.id})">
        <img src="${pokemon.sprites.front_default}">
        <h3>${pokemon.name}</h3>
      </div>
    `;
  });
}

function abrirModal(id) {
  const pokemon = listaPokemons.find(p => p.id === id);

  modalInfo.innerHTML = `
    <h2>${pokemon.name}</h2>
    <img src="${pokemon.sprites.front_default}">
    <p><strong>Altura:</strong> ${pokemon.height}</p>
    <p><strong>Peso:</strong> ${pokemon.weight}</p>
    <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
  `;

  modal.classList.remove("hidden");
}

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

/* BUSCA */
searchInput.addEventListener("input", () => {
  const valor = searchInput.value.toLowerCase();

  const filtrados = listaPokemons.filter(pokemon =>
    pokemon.name.includes(valor)
  );

  mostrarPokemons(filtrados);
});

carregarPokemons();