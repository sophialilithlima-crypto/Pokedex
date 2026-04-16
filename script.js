const container = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const loadMoreBtn = document.getElementById("loadMore");

const modal = document.getElementById("modal");
const modalInfo = document.getElementById("modal-info");
const closeBtn = document.getElementById("close");

let listaPokemons = [];

let limit = 20;
let offset = 0;
let totalPokemons = 0;

let pokemonAtual = null;
let pokemonOriginal = null;

let cache = {};

/* =========================
   UTIL
========================= */
function formatarNome(nome) {
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

/* =========================
   FETCH COM CACHE
========================= */
async function fetchPokemon(nome) {
  if (cache[nome]) return cache[nome];

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
  const data = await res.json();

  cache[nome] = data;
  return data;
}

/* =========================
   PRIMEIRA EVOLUÇÃO
========================= */
async function getFirstEvolution(pokemon) {
  const speciesRes = await fetch(pokemon.species.url);
  const speciesData = await speciesRes.json();

  const evoRes = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  return evoData.chain.species.name;
}

/* =========================
   PRÓXIMA EVOLUÇÃO
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

/* =========================
   CARREGAR POKÉMONS
========================= */
async function carregarPokemons() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await res.json();

    // 🔥 NOVO: pega o total de pokémons
    totalPokemons = data.count;

    for (let p of data.results) {
      const pokemon = await fetchPokemon(p.name);
      listaPokemons.push(pokemon);
    }

    mostrarPokemons(listaPokemons);

    // 🔥 NOVO: esconde botão quando acabar
    if (listaPokemons.length >= totalPokemons) {
      loadMoreBtn.classList.add("hidden");
    }

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
        <h3>${formatarNome(pokemon.name)}</h3>
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
   RENDER MODAL
========================= */
function renderModal(pokemon, speciesData) {
  const tipoPrincipal = pokemon.types[0].type.name;

  const hp = pokemon.stats.find(s => s.stat.name === "hp").base_stat;
  const attack = pokemon.stats.find(s => s.stat.name === "attack").base_stat;
  const defense = pokemon.stats.find(s => s.stat.name === "defense").base_stat;
  const speed = pokemon.stats.find(s => s.stat.name === "speed").base_stat;

  modalInfo.innerHTML = `
    <div class="modal-card ${tipoPrincipal}" style="padding: 15px; border-radius: 10px;">
      <h2>${formatarNome(pokemon.name)}</h2>
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

      <button class="btn evoluir">Evolução</button>
      <button class="btn voltar" ${pokemon.name === pokemonOriginal.name ? "disabled" : ""}>
        Forma inicial
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

  const firstName = await getFirstEvolution(pokemon);
  pokemonOriginal = await fetchPokemon(firstName);

  const speciesRes = await fetch(pokemon.species.url);
  const speciesData = await speciesRes.json();

  renderModal(pokemon, speciesData);

  modal.classList.remove("hidden");

  configurarBotoes();
}

/* =========================
   BOTÕES COM ANIMAÇÃO
========================= */
function configurarBotoes() {
  const btnEvoluir = document.querySelector(".evoluir");
  const btnVoltar = document.querySelector(".voltar");

  if (btnEvoluir) {
    btnEvoluir.onclick = async () => {

      const card = modalInfo.firstElementChild;

      const nextName = await getNextEvolution(pokemonAtual);

      if (!nextName) {
        btnEvoluir.disabled = true;
        btnEvoluir.innerText = "Sem evolução";
        return;
      }

      // anima saída
      card.classList.add("fade-out");

      setTimeout(async () => {

        const novoPokemon = await fetchPokemon(nextName);
        pokemonAtual = novoPokemon;

        const speciesRes = await fetch(novoPokemon.species.url);
        const speciesData = await speciesRes.json();

        renderModal(novoPokemon, speciesData);

        // anima entrada
        const novoCard = modalInfo.firstElementChild;
        novoCard.classList.add("fade-in");

        configurarBotoes();

      }, 300);
    };
  }

  if (btnVoltar && !btnVoltar.disabled) {
    btnVoltar.onclick = async () => {

      const card = modalInfo.firstElementChild;

      card.classList.add("fade-out");

      setTimeout(async () => {

        pokemonAtual = pokemonOriginal;

        const speciesRes = await fetch(pokemonOriginal.species.url);
        const speciesData = await speciesRes.json();

        renderModal(pokemonOriginal, speciesData);

        const novoCard = modalInfo.firstElementChild;
        novoCard.classList.add("fade-in");

        configurarBotoes();

      }, 300);
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