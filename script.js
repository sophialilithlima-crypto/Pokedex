const container = document.getElementById("pokedex");
const searchInput = document.getElementById("search");

const modal = document.getElementById("modal");
const modalInfo = document.getElementById("modal-info");
const closeBtn = document.getElementById("close");

let listaPokemons = [];

/* CARREGAR POKÉMONS */
async function carregarPokemons() {
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1028");
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

/* MOSTRAR CARDS */
function mostrarPokemons(lista) {
  container.innerHTML = "";

  lista.forEach(pokemon => {
    container.innerHTML += `
  <div class="card" data-id="${pokemon.id}">
        <img src="${pokemon.sprites.front_default}">
        <h3>${pokemon.name}</h3>
      </div>
    `;
  });

  /* ADICIONA EVENTO DE CLIQUE NOS CARDS */
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.getAttribute("data-id"));
      abrirModal(id);
    });
  });
}

/* ABRIR MODAL */

async function abrirModal(id) {
  const pokemon = listaPokemons.find(p => p.id === id);

  // BUSCAR DADOS DA ESPÉCIE (pra pegar geração)
  const speciesRes = await fetch(pokemon.species.url);
  const speciesData = await speciesRes.json();

  const tipoPrincipal = pokemon.types[0].type.name;

  // PEGAR STATS
  const hp = pokemon.stats.find(s => s.stat.name === "hp").base_stat;
  const attack = pokemon.stats.find(s => s.stat.name === "attack").base_stat;
  const defense = pokemon.stats.find(s => s.stat.name === "defense").base_stat;
  const speed = pokemon.stats.find(s => s.stat.name === "speed").base_stat;

  modalInfo.innerHTML = `
    <div class="${tipoPrincipal}" style="padding: 15px; border-radius: 10px;">
      <h2>${pokemon.name}</h2>
      <img src="${pokemon.sprites.front_default}">

      <p><strong>Espécie:</strong> ${speciesData.name}</p>

      <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p>
      <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>

      <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>

      <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(", ")}</p>

      <hr>

      <p><strong>HP:</strong> ${hp}</p>
      <p><strong>Ataque:</strong> ${attack}</p>
      <p><strong>Defesa:</strong> ${defense}</p>
      <p><strong>Velocidade:</strong> ${speed}</p>
    </div>
  `;

  modal.classList.remove("hidden");
}
/* FECHAR MODAL (CORRIGIDO) */
closeBtn.onclick = () => {
  modal.classList.add("hidden");
};

/* FECHAR CLICANDO FORA */
modal.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};

/* BUSCA */
searchInput.addEventListener("input", () => {
  const valor = searchInput.value.toLowerCase();

  const filtrados = listaPokemons.filter(pokemon =>
    pokemon.name.includes(valor)
  );

  mostrarPokemons(filtrados);
});

carregarPokemons();