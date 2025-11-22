let cardContainer = document.querySelector(".card-container");
let dados = [];

// Seleciona todos os elementos de filtro
const caixaBusca = document.querySelector("#caixa-busca");
const botaoBusca = document.querySelector("#botao-busca");
const filtroGenero = document.querySelector("#filtro-genero");
const filtroAno = document.querySelector("#filtro-ano");
const filtroPais = document.querySelector("#filtro-pais");
const filtroDiretor = document.querySelector("#filtro-diretor");
const filtroDuracao = document.querySelector("#filtro-duracao");
const botaoLimpar = document.querySelector("#botao-limpar");

async function iniciarBusca() {
    let resposta = await fetch("data.json");
    dados = await resposta.json();
    popularFiltros();
    renderizarCards(dados); // Renderiza todos os cards ao carregar
}

function popularFiltros() {
    const generos = new Set();
    const anos = new Set();
    const paises = new Set();
    const diretores = new Set();

    dados.forEach(filme => {
        filme.genero.forEach(g => generos.add(g));
        anos.add(filme.ano);
        filme.pais.forEach(p => paises.add(p));
        filme.diretor.forEach(d => diretores.add(d));
    });

    // Ordena e popula os filtros
    [...generos].sort().forEach(g => filtroGenero.innerHTML += `<option value="${g}">${g}</option>`);
    [...anos].sort((a, b) => b - a).forEach(a => filtroAno.innerHTML += `<option value="${a}">${a}</option>`);
    [...paises].sort().forEach(p => filtroPais.innerHTML += `<option value="${p}">${p}</option>`);
    [...diretores].sort().forEach(d => filtroDiretor.innerHTML += `<option value="${d}">${d}</option>`);
}

function aplicarFiltros() {
    const termoBusca = caixaBusca.value.toLowerCase();
    const genero = filtroGenero.value;
    const ano = filtroAno.value;
    const pais = filtroPais.value;
    const diretor = filtroDiretor.value;
    const duracao = filtroDuracao.value;

    const resultados = dados.filter(filme => {
        const buscaOk = termoBusca === '' || filme.titulo.toLowerCase().includes(termoBusca);
        const generoOk = genero === '' || filme.genero.includes(genero);
        const anoOk = ano === '' || filme.ano === ano;
        const paisOk = pais === '' || filme.pais.includes(pais);
        const diretorOk = diretor === '' || filme.diretor.includes(diretor);

        const duracaoMin = parseInt(filme.duracao.replace(' min', ''));
        const duracaoOk = duracao === '' || (duracao === 'curto' && duracaoMin <= 120) || (duracao === 'longo' && duracaoMin > 120);

        return buscaOk && generoOk && anoOk && paisOk && diretorOk && duracaoOk;
    });

    if (resultados.length === 0) {
        // Se a busca por texto foi o único filtro ativo, mostra a mensagem específica.
        if (termoBusca !== '' && genero === '' && ano === '' && pais === '' && diretor === '' && duracao === '') {
            renderizarCards(resultados, 'Nenhum filme encontrado com o título digitado.');
        } else {
            renderizarCards(resultados, 'Nenhum filme encontrado com os critérios selecionados.');
        }
    } else {
        renderizarCards(resultados);
    }
}

function renderizarCards(dados, mensagem = 'Nenhum filme encontrado com os critérios selecionados.') {
    cardContainer.innerHTML = "";
    if (dados.length === 0) {
        cardContainer.innerHTML = `<p class="sem-resultados">${mensagem}</p>`;
        return;
    }
    for (let dado of dados) {
        let article = document.createElement("article");
        article.classList.add("card");
        article.innerHTML = `
        <img src="${dado.imagem}" alt="${dado.titulo}">
        <h2>${dado.titulo} (${dado.ano})</h2>
        <p><strong>Gênero:</strong> ${dado.genero.join(", ")}</p>
        <p><strong>Diretor:</strong> ${dado.diretor.join(", ")}</p>
        <p><strong>Duração:</strong> ${dado.duracao}</p>
        <p><strong>País:</strong> ${dado.pais.join(", ")}</p>
        <p class="sinopse"><strong>Sinopse:</strong> ${dado.sinopse}</p>
        <a href="${dado.trailer_youtube}" target="_blank">Assista ao Trailer</a>`
        cardContainer.appendChild(article);
    }
}

// Adiciona os "escutadores de evento" para todos os filtros
caixaBusca.addEventListener("keyup", aplicarFiltros);

function filtrarComLimpezaDeBusca() {
    caixaBusca.value = ''; // Limpa a barra de busca por texto
    aplicarFiltros();
}

botaoBusca.addEventListener("click", aplicarFiltros); // O botão de busca não limpa nada

// Os filtros de select limpam a busca por texto antes de aplicar
filtroGenero.addEventListener("change", filtrarComLimpezaDeBusca);
filtroAno.addEventListener("change", filtrarComLimpezaDeBusca);
filtroPais.addEventListener("change", filtrarComLimpezaDeBusca);
filtroDiretor.addEventListener("change", filtrarComLimpezaDeBusca);
filtroDuracao.addEventListener("change", filtrarComLimpezaDeBusca);

botaoLimpar.addEventListener("click", () => {
    caixaBusca.value = '';
    filtroGenero.value = '';
    filtroAno.value = '';
    filtroPais.value = '';
    filtroDiretor.value = '';
    filtroDuracao.value = '';
    aplicarFiltros();
});

iniciarBusca();
