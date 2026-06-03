const pokedexList = document.getElementById("pokedexList");
const searchInput = document.getElementById("search");
const pokemonInfo = document.getElementById("pokemonInfo");
const typeFilter =
document.getElementById("typeFilter");

const loadMoreBtn = document.getElementById("loadMore");
const favoritesBtn = document.getElementById("favoritesBtn");
const backFavoritesBtn = document.getElementById("backFavorites");
const favoritesCount =
document.getElementById("favoritesCount");

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
        console.log(
        "Pokémons carregados:",
        listaPokemons.length
        );

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

    const favoritos =
    getFavoritos();

    lista.sort((a,b)=>{

    const aFav =
    favoritos.includes(a.name);

    const bFav =
    favoritos.includes(b.name);

    return bFav - aFav;

    });

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
            async () => await mostrarPokemon(pokemon)
        );

        pokedexList.appendChild(card);

    });
}

/* ======================
   DETALHES
====================== */

async function mostrarPokemon(pokemon){

    const descricao =
    await getDescricaoPokemon(pokemon);

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
            <strong>Raridade:</strong>
            <span class="raridade">
            ${getRaridade(pokemon)}
            </span>
        </p>
        <p>
            <strong>Altura:</strong>
            ${(pokemon.height / 10).toFixed(1)} m
        </p>

        <p>
            <strong>Peso:</strong>
            ${(pokemon.weight / 10).toFixed(1)} kg
        </p>

        <p>
            <strong>Descrição:</strong>
        </p>

        <p style="
            margin-top:8px;
            margin-bottom:15px;
            font-size:14px;
            line-height:1.5;
            ">
            ${descricao}
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

            atualizarContadorFavoritos();

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


function getRaridade(pokemon){

    const tipos =
        pokemon.types.map(
            t => t.type.name
        );

    if(
        pokemon.id <= 151 &&
        (
            pokemon.name.includes("mew") ||
            pokemon.name.includes("articuno") ||
            pokemon.name.includes("zapdos") ||
            pokemon.name.includes("moltres")
        )
    ){
        return "Lendário";
    }

    if(
        tipos.includes("dragon") ||
        tipos.includes("psychic")
    ){
        return "Épico";
    }

    if(
        tipos.includes("ghost") ||
        tipos.includes("steel")
    ){
        return "Raro";
    }

    return "Comum";
}

function filtrarTipo(){

    const tipo =
    typeFilter.value;

    if(tipo === ""){

        renderCards(listaPokemons);

        return;
    }

    const filtrados =
    listaPokemons.filter(
        pokemon =>

        pokemon.types.some(
            t => t.type.name === tipo
        )
    );

    renderCards(filtrados);
}

typeFilter.addEventListener(
    "change",
    filtrarTipo
);

function atualizarContadorFavoritos(){

    const favoritos =
    getFavoritos();

    favoritesCount.textContent =
    favoritos.length;
}

async function getDescricaoPokemon(pokemon){

    const res =
    await fetch(
        pokemon.species.url
    );

    const species =
    await res.json();

    const texto =
    species.flavor_text_entries.find(
        entry =>
        entry.language.name === "en"
    );

    if(!texto){
        return "Descrição não disponível.";
    }

    return texto.flavor_text
        .replace(/\n/g," ")
        .replace(/\f/g," ");
}

atualizarContadorFavoritos();

/* ======================
   INICIAR
====================== */

carregarPokemons();