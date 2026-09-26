# Pokédex

Uma Pokédex interativa desenvolvida com **React** e **Vite**, utilizando a **PokéAPI** para consultar dados dos Pokémon em tempo real.

O projeto foi desenvolvido com foco em praticar consumo de API, gerenciamento de estado, componentes reutilizáveis, filtros, favoritos e construção de uma interface inspirada em uma Pokédex.

## 📸 Demonstração

<img width="1423" height="888" alt="image" src="https://github.com/user-attachments/assets/fa9a72b3-fb25-4bba-a6ae-283d9b0d6bfc" />


## ✨ Funcionalidades

- 🔎 **Busca de Pokémon** por nome.
- 📚 **Carregamento progressivo** da Pokédex, permitindo explorar mais Pokémon sem sobrecarregar a interface.
- ⭐ **Sistema de favoritos**, com destaque visual para os Pokémon selecionados.
- 📋 **Visualização detalhada** do Pokémon selecionado.
- 🖼️ Exibição da arte oficial do Pokémon.
- 🏷️ Informações de **tipo, altura e peso**.
- ⚡ Exibição das **habilidades**.
- 📖 Consulta da **descrição da espécie**.
- 💎 Identificação da classificação da espécie como **comum, lendária ou mítica**.
- 📊 Visualização dos **status base** por meio de barras.
- 📱 Interface organizada em uma estrutura visual inspirada no design de uma Pokédex.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| **React** | Construção da interface e componentes |
| **Vite** | Ambiente de desenvolvimento e build |
| **JavaScript (ES6+)** | Lógica e funcionalidades |
| **CSS3** | Estilização e layout |
| **PokéAPI** | Fonte dos dados dos Pokémon |
| **Fetch API** | Comunicação com a API externa |
| **ESLint** | Padronização e análise do código |

## 🔌 API

Os dados são obtidos através da **PokéAPI**, uma API pública que disponibiliza informações sobre Pokémon.

- PokéAPI: https://pokeapi.co/
- Documentação: https://pokeapi.co/docs/v2

O projeto utiliza endpoints da API para consultar a lista de Pokémon, informações individuais e dados das espécies.

## 📂 Estrutura do projeto

```text
Pokedex/
├── pokedex-react/
│   ├── src/
│   │   ├── Components/
│   │   │   └── PokemonCard.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── docs/
│   └── pokedex-preview.png
└── README.md
```

## 🚀 Como executar

### Pré-requisitos

Antes de começar, é necessário ter instalado:

- [Node.js](https://nodejs.org/)
- npm

### Instalação

Clone o repositório e entre na pasta da aplicação:

```bash
cd pokedex-react
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Depois, acesse no navegador o endereço exibido pelo Vite, normalmente:

```text
http://localhost:5173/
```

### Build de produção

Para gerar a versão de produção:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

## 🧠 Conceitos praticados

Este projeto foi desenvolvido como uma oportunidade de praticar conceitos importantes do desenvolvimento front-end, incluindo:

- Componentização com React.
- Hooks como `useState` e `useEffect`.
- Consumo de APIs REST.
- Requisições assíncronas com `fetch`.
- Renderização dinâmica de listas.
- Manipulação e filtragem de dados.
- Gerenciamento de favoritos.
- Eventos e interação do usuário.
- Organização de estilos com CSS.
- Estruturação de uma aplicação utilizando Vite.

## 🎯 Objetivo do projeto

O objetivo principal é aplicar, em um projeto prático, conceitos de desenvolvimento front-end e integração com uma API externa, criando uma experiência de navegação simples e visualmente organizada.

## 👩‍💻 Autora

**Sophia Lilith**

Projeto desenvolvido para estudo e prática de desenvolvimento web com React.

