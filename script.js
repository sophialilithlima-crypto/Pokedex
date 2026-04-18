const container = document.getElementById("pokedex");
const searchInput = document.getElementById("search");
const loadMoreBtn = document.getElementById("loadMore");

const modal = document.getElementById("modal");
const modalInfo = document.getElementById("modal-info");
const closeBtn = document.getElementById("close");

const backToTopBtn = document.getElementById("backToTop");
const scrollDownBtn = document.getElementById("scrollDown");

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

function getHPColor(hp) {
  if (hp < 50) return "#e63946";
  if (hp < 100) return "#ffb703";
  return "#4caf50";
}

/* =========================
   FETCH
========================= */
async function fetchPokemon(nome) {
  if (cache[nome]) return cache[nome];

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
  const data = await res.json();

  cache[nome] = data;
  return data;
}

/* =========================
   EVOLUÇÕES
========================= */
async function getFirstEvolution(pokemon) {
  const speciesRes = await fetch(pokemon.species.url);
  const speciesData = await speciesRes.json();

  const evoRes = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  return evoData.chain.species.name;
}

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
   CARREGAR
========================= */
async function carregarPokemons() {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await res.json();

    totalPokemons = data.count;

    const promises = data.results.map(p => fetchPokemon(p.name));
    const novosPokemons = await Promise.all(promises);

    listaPokemons.push(...novosPokemons);

    mostrarPokemons(listaPokemons);

    if (listaPokemons.length >= totalPokemons) {
      loadMoreBtn.style.display = "none";
    }

  } catch (erro) {
    console.log("Erro:", erro);
  }
}

/* =========================
   CARDS
========================= */
function mostrarPokemons(lista) {
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  lista.forEach(pokemon => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h4>#${pokemon.id.toString().padStart(3, "0")}</h4>
      <img src="${pokemon.sprites.front_default}">
      <h3>${formatarNome(pokemon.name)}</h3>
    `;

    card.addEventListener("click", () => abrirModal(pokemon.id));

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/* =========================
   MODAL
========================= */
function renderModal(pokemon, speciesData) {

  // 🔥 ADIÇÃO (única mudança)
  const tipoPrincipal = pokemon.types[0].type.name;

  const hp = pokemon.stats.find(s => s.stat.name === "hp").base_stat;
  const attack = pokemon.stats.find(s => s.stat.name === "attack").base_stat;
  const defense = pokemon.stats.find(s => s.stat.name === "defense").base_stat;
  const speed = pokemon.stats.find(s => s.stat.name === "speed").base_stat;

  modalInfo.innerHTML = `
    <div class="modal-card ${tipoPrincipal}">

      <h2>${formatarNome(pokemon.name)}</h2>

      <img src="${pokemon.sprites.front_default}">

      <p><strong>Geração:</strong> ${speciesData.generation.name}</p>
      <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p>
      <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>

      <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
      <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(", ")}</p>

      <hr>

      <div class="stat">
        <span>HP</span>
        <div class="bar">
          <div class="fill" style="width: ${(hp / 255) * 100}%; background: ${getHPColor(hp)}"></div>
        </div>
        <span>${hp}</span>
      </div>

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
   RESTANTE DO CÓDIGO IGUAL
========================= */

async function abrirModal(id) {
  const pokemon = listaPokemons.find(p => p.id === id);
  if (!pokemon) return;

  pokemonAtual = pokemon;

  const firstName = await getFirstEvolution(pokemon);
  pokemonOriginal = await fetchPokemon(firstName);

  const speciesRes = await fetch(pokemon.species.url);
  const speciesData = await speciesRes.json();

  renderModal(pokemon, speciesData);

  modal.classList.remove("hidden");

  configurarBotoes();
}

function configurarBotoes() {
  const btnEvoluir = document.querySelector(".evoluir");
  const btnVoltar = document.querySelector(".voltar");

  if (btnEvoluir) {
    btnEvoluir.onclick = async () => {
      const nextName = await getNextEvolution(pokemonAtual);

      if (!nextName) {
        btnEvoluir.disabled = true;
        btnEvoluir.innerText = "Sem evolução";
        return;
      }

      const novoPokemon = await fetchPokemon(nextName);
      pokemonAtual = novoPokemon;

      const speciesRes = await fetch(novoPokemon.species.url);
      const speciesData = await speciesRes.json();

      renderModal(novoPokemon, speciesData);
      configurarBotoes();
    };
  }

  if (btnVoltar && !btnVoltar.disabled) {
    btnVoltar.onclick = async () => {
      pokemonAtual = pokemonOriginal;

      const speciesRes = await fetch(pokemonOriginal.species.url);
      const speciesData = await speciesRes.json();

      renderModal(pokemonOriginal, speciesData);
      configurarBotoes();
    };
  }
}

closeBtn.onclick = () => modal.classList.add("hidden");

modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

let timeoutBusca;

searchInput.addEventListener("input", () => {
  clearTimeout(timeoutBusca);

  timeoutBusca = setTimeout(async () => {
    const valor = searchInput.value.toLowerCase().trim();

    if (valor === "") {
      mostrarPokemons(listaPokemons);
      return;
    }

    try {
      const pokemon = await fetchPokemon(valor);

      if (!listaPokemons.find(p => p.id === pokemon.id)) {
        listaPokemons.push(pokemon);
      }

      mostrarPokemons([pokemon]);

    } catch {
      container.innerHTML = "<p>Pokémon não encontrado</p>";
    }

  }, 400);
});

window.addEventListener("scroll", () => {

  // botão subir
  backToTopBtn.style.display = window.scrollY > 300 ? "block" : "none";

  // botão descer (só aparece se não estiver no final)
  const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;

  if (window.scrollY < scrollTotal - 200) {
    scrollDownBtn.style.display = "block";
  } else {
    scrollDownBtn.style.display = "none";
  }
});

backToTopBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

scrollDownBtn.onclick = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth"
  });
};

loadMoreBtn.addEventListener("click", () => {
  offset += limit;
  carregarPokemons();
});

carregarPokemons();