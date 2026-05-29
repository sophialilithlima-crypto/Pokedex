const pokedexList = document.getElementById("pokedexList");
const searchInput = document.getElementById("search");
const pokemonInfo = document.getElementById("pokemonInfo");

const loadMoreBtn = document.getElementById("loadMore");
const favoritesBtn = document.getElementById("favoritesBtn");
const backFavoritesBtn = document.getElementById("backFavorites");

const pokemonCounter = document.getElementById("pokemonCounter");

const backToTopBtn = document.getElementById("backToTop");
const scrollDownBtn = document.getElementById("scrollDown");

let listaPokemons = [];
let cache = {};

let offset = 0;
const limit = 20;

let totalPokemons = 0;

/* ======================
   UTIL
====================== */

function formatarNome(nome){
    return nome.charAt(0).toUpperCase() +
           nome.slice(1);
}

function getFavoritos(){
    return JSON.parse(
        localStorage.getItem("favoritos")
    ) || [];
}

/* ======================
   API
====================== */

async function fetchPokemon(nome){

    if(cache[nome]){
        return cache[nome];
    }

    const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${nome}`
    );

    const data = await res.json();

    cache[nome] = data;

    return data;
}

/* ======================
   CARREGAR
====================== */

async function carregarPokemons(){

    try{

        const res = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
        );

        const data = await res.json();

        totalPokemons = data.count;

        const promises = data.results.map(
            pokemon => fetchPokemon(pokemon.name)
        );

        const novosPokemons =
            await Promise.all(promises);

        listaPokemons.push(...novosPokemons);

        renderCards(listaPokemons);

        pokemonCounter.textContent =
            `${listaPokemons.length} / ${totalPokemons}`;

    }catch(erro){

        console.error(
            "Erro ao carregar Pokémon:",
            erro
        );

    }
}

/* ======================
   CARDS
====================== */

function renderCards(lista){

    pokedexList.innerHTML = "";

    lista.forEach(pokemon => {

        const favoritos =
            getFavoritos();

        const favorito =
            favoritos.includes(pokemon.name);

        const card =
            document.createElement("div");

        card.className =
            favorito
            ? "card favorite-card"
            : "card";

        card.innerHTML = `
            <h4>#${pokemon.id}</h4>

            <img
              src="${pokemon.sprites.front_default}"
              alt="${pokemon.name}"
            >

            <h3>
              ${formatarNome(pokemon.name)}
            </h3>
        `;

        card.addEventListener(
            "click",
            () => mostrarPokemon(pokemon)
        );

        pokedexList.appendChild(card);

    });
}

/* ======================
   DETALHES
====================== */

function mostrarPokemon(pokemon){

    const hp =
        pokemon.stats.find(
            stat => stat.stat.name === "hp"
        ).base_stat;

    const attack =
        pokemon.stats.find(
            stat => stat.stat.name === "attack"
        ).base_stat;

    const defense =
        pokemon.stats.find(
            stat => stat.stat.name === "defense"
        ).base_stat;

    const speed =
        pokemon.stats.find(
            stat => stat.stat.name === "speed"
        ).base_stat;

    const favoritos =
        getFavoritos();

    const favorito =
        favoritos.includes(pokemon.name);

    pokemonInfo.innerHTML = `

        <div class="pokemon-header">

            <h2>
              ${formatarNome(pokemon.name)}
            </h2>

            <button
                class="favorite-star ${favorito ? "active" : ""}"
                data-name="${pokemon.name}"
            >
                ★
            </button>

        </div>

        <img
            class="pokemon-sprite"
            src="${pokemon.sprites.other["official-artwork"].front_default}"
        >

        <p>
            <strong>#${pokemon.id}</strong>
        </p>

        <p>
            <strong>Tipo:</strong>
            ${pokemon.types
                .map(t => t.type.name)
                .join(", ")}
        </p>

        <p>
            <strong>Altura:</strong>
            ${(pokemon.height / 10).toFixed(1)} m
        </p>

        <p>
            <strong>Peso:</strong>
            ${(pokemon.weight / 10).toFixed(1)} kg
        </p>

        <br>

        <div class="stat">
            HP
            <div class="bar">
                <div
                    class="fill hp"
                    style="width:${(hp/255)*100}%">
                </div>
            </div>
        </div>

        <div class="stat">
            Ataque
            <div class="bar">
                <div
                    class="fill attack"
                    style="width:${(attack/190)*100}%">
                </div>
            </div>
        </div>

        <div class="stat">
            Defesa
            <div class="bar">
                <div
                    class="fill defense"
                    style="width:${(defense/230)*100}%">
                </div>
            </div>
        </div>

        <div class="stat">
            Velocidade
            <div class="bar">
                <div
                    class="fill speed"
                    style="width:${(speed/200)*100}%">
                </div>
            </div>
        </div>
    `;

    configurarFavorito();
}

/* ======================
   FAVORITOS
====================== */

function configurarFavorito(){

    const btn =
        document.querySelector(".favorite-star");

    if(!btn) return;

    btn.addEventListener(
        "click",
        () => {

            const nome =
                btn.dataset.name;

            let favoritos =
                getFavoritos();

            if(
                favoritos.includes(nome)
            ){

                favoritos =
                    favoritos.filter(
                        pokemon => pokemon !== nome
                    );

                btn.classList.remove("active");

            }else{

                favoritos.push(nome);

                btn.classList.add("active");

            }

            localStorage.setItem(
                "favoritos",
                JSON.stringify(favoritos)
            );

            renderCards(listaPokemons);

        }
    );
}

/* ======================
   BUSCA
====================== */

searchInput.addEventListener(
    "input",
    () => {

        const valor =
            searchInput.value.toLowerCase();

        const filtrados =
            listaPokemons.filter(
                pokemon =>

                pokemon.name.includes(valor)

                ||

                pokemon.id
                .toString()
                .includes(valor)
            );

        renderCards(filtrados);

    }
);

/* ======================
   FAVORITOS ABA
====================== */

favoritesBtn.addEventListener(
    "click",
    () => {

        const favoritos =
            getFavoritos();

        const lista =
            listaPokemons.filter(
                pokemon =>
                    favoritos.includes(
                        pokemon.name
                    )
            );

        renderCards(lista);

        backFavoritesBtn.style.display =
            "block";
    }
);

backFavoritesBtn.addEventListener(
    "click",
    () => {

        renderCards(listaPokemons);

        backFavoritesBtn.style.display =
            "none";
    }
);

/* ======================
   LOAD MORE
====================== */

loadMoreBtn.addEventListener(
    "click",
    () => {

        offset += limit;

        carregarPokemons();

    }
);

/* ======================
   SCROLL
====================== */

backToTopBtn.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

    }
);

scrollDownBtn.addEventListener(
    "click",
    () => {

        window.scrollTo({
            top:document.body.scrollHeight,
            behavior:"smooth"
        });

    }
);

/* ======================
   INICIAR
====================== */

carregarPokemons();