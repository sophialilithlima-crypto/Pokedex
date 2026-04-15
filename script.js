const container = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const loadMoreBtn = document.getElementById("loadMore");

const modal = document.getElementById("modal");
const modalInfo = document.getElementById("modal-info");
const closeBtn = document.getElementById("close");

let listaPokemons = [];

let limit = 20;
let offset = 0;

let pokemonAtual = null;
let pokemonOriginal = null;

/* =========================
   AVISO
========================= */
function mostrarAviso(texto) {
  const aviso = document.createElement("div");
  aviso.innerText = texto;
  aviso.classList.add("aviso");

  document.body.appendChild(aviso);

  setTimeout(() => {
    aviso.remove();
  }, 2000);
}

/* =========================
   CARREGAR POKÉMONS
========================= */
async function carregarPokemons() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await res.json();

    const promises = data.results.map(p =>
    fetch(p.url).then(res => res.json())
  );

const pokemons = await Promise.all(promises);

listaPokemons.push(...pokemons);

    mostrarPokemons(listaPokemons);

  } catch (erro) {
    console.log("Erro:", erro);
  }
}

/* =========================
   MOSTRAR CARDS
========================= */
function mostrarPokemons(lista) {
  container.innerHTML = "";

  lista.forEach(pokemon => {
    container.innerHTML += `
      <div class="card" data-id="${pokemon.id}">
        <h4>#${pokemon.id.toString().padStart(3, "0")}</h4>
        <img src="${pokemon.sprites.front_default}">
        <h3>${pokemon.name}</h3>
      </div>
    `;
  });

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.getAttribute("data-id"));
      abrirModal(id);
    });
  });
}

/* =========================
   EVOLUÇÃO
========================= */
async function getNextEvolution(pokemon) {
  const speciesRes = await fetch(pokemon.species.url);
  const speciesData = await speciesRes.json();

  const evoRes = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  let current = evoData.chain;

  while (current) {
    if (current.species.name === pokemon.name) {
      if (current.evolves_to.length > 0) {
        return current.evolves_to[0].species.name;
      }
    }
    current = current.evolves_to[0];
  }

  return null;
}

async function temEvolucao(pokemon) {
  const next = await getNextEvolution(pokemon);
  return next !== null;
}

/* =========================
   RENDER MODAL
========================= */
function renderModal(pokemon, speciesData, podeEvoluir) {
  const tipoPrincipal = pokemon.types[0].type.name;

  const hp = pokemon.stats.find(s => s.stat.name === "hp").base_stat;
  const attack = pokemon.stats.find(s => s.stat.name === "attack").base_stat;
  const defense = pokemon.stats.find(s => s.stat.name === "defense").base_stat;
  const speed = pokemon.stats.find(s => s.stat.name === "speed").base_stat;

  modalInfo.innerHTML = `
    <div class="${tipoPrincipal}" style="padding: 15px; border-radius: 10px;">
      <h2>${pokemon.name}</h2>
      <img src="${pokemon.sprites.front_default}">

      <p><strong>Geração:</strong> ${speciesData.generation.name}</p>
      <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p>
      <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>

      <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
      <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(", ")}</p>

      <hr>

      <p><strong>HP:</strong> ${hp}</p>
      <p><strong>Ataque:</strong> ${attack}</p>
      <p><strong>Defesa:</strong> ${defense}</p>
      <p><strong>Velocidade:</strong> ${speed}</p>

      <br>

      <button class="btn evoluir" ${!podeEvoluir ? "disabled" : ""}>
        Evolução
      </button>

      <button class="btn voltar">
        Primeira versão
      </button>
    </div>
  `;
}

/* =========================
   ABRIR MODAL
========================= */
async function abrirModal(id) {
  const pokemon = listaPokemons.find(p => p.id === id);

  pokemonAtual = pokemon;
  pokemonOriginal = pokemon;

  const speciesRes = await fetch(pokemon.species.url);
  const speciesData = await speciesRes.json();

  const podeEvoluir = await temEvolucao(pokemon);

  renderModal(pokemon, speciesData, podeEvoluir);

  modal.classList.remove("hidden");

  configurarBotoes();
}

/* =========================
   BOTÕES
========================= */
function configurarBotoes() {
  const btnEvoluir = document.querySelector(".evoluir");
  const btnVoltar = document.querySelector(".voltar");

  if (btnEvoluir) {
    btnEvoluir.onclick = async () => {
      if (btnEvoluir.disabled) {
        mostrarAviso("Sem evoluções");
        return;
      }

      const nextName = await getNextEvolution(pokemonAtual);

      if (!nextName) {
        mostrarAviso("Sem evoluções");
        return;
      }

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextName}`);
      const novoPokemon = await res.json();

      pokemonAtual = novoPokemon;

      const speciesRes = await fetch(novoPokemon.species.url);
      const speciesData = await speciesRes.json();

      const podeEvoluir = await temEvolucao(novoPokemon);

      renderModal(novoPokemon, speciesData, podeEvoluir);
      configurarBotoes();
    };
  }

  if (btnVoltar) {
    btnVoltar.onclick = async () => {
      pokemonAtual = pokemonOriginal;

      const speciesRes = await fetch(pokemonOriginal.species.url);
      const speciesData = await speciesRes.json();

      const podeEvoluir = await temEvolucao(pokemonOriginal);

      renderModal(pokemonOriginal, speciesData, podeEvoluir);
      configurarBotoes();
    };
  }
}

/* =========================
   FECHAR MODAL
========================= */
closeBtn.onclick = () => {
  modal.classList.add("hidden");
};

modal.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};

/* =========================
   BUSCA
========================= */
searchInput.addEventListener("input", () => {
  const valor = searchInput.value.toLowerCase();

  const filtrados = listaPokemons.filter(pokemon =>
    pokemon.name.includes(valor) ||
    pokemon.id.toString().includes(valor)
  );

  mostrarPokemons(filtrados);
});

/* =========================
   CARREGAR MAIS
========================= */
loadMoreBtn.addEventListener("click", () => {
  offset += limit;
  carregarPokemons();
});

/* =========================
   INICIAR
========================= */
carregarPokemons();