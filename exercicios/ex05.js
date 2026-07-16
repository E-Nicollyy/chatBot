// ==========================================================
// API FOOTBALL DEMO
// Autor: Nicolly Soterio
// Descrição: Sistema de consulta utilizando a API-Football
// ==========================================================

// Chave da API — lida de variável de ambiente (não deixe chaves
// reais direto no código-fonte, principalmente se for
// compartilhar/versionar o arquivo).
// No terminal: export API_FOOTBALL_KEY="sua_chave_aqui"
const API_KEY = "c9ad40bcb364bd559ad31f02e9609024";

if (!API_KEY) {
    console.log("\n⚠️  Defina a variável de ambiente API_FOOTBALL_KEY antes de rodar.");
    process.exit(1);
}

// URL Base
const BASE_URL = "https://v3.football.api-sports.io";

// Biblioteca para leitura do teclado
// (o projeto usa "type": "module" no package.json, por isso "import")
import readline from "readline";

// Interface do terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Atalho pra transformar rl.question em Promise (evita repetir isso
// em toda função que precisa ler algo do teclado)
function perguntar(texto) {
    return new Promise(resolve => rl.question(texto, resolve));
}

// Ano atual, usado como sugestão de temporada
function anoAtual() {
    return new Date().getFullYear();
}

// ==========================================================
// Campeonatos disponíveis no menu
// IDs confirmados nos tutoriais oficiais/comunidade da API-Football.
// Se algum não bater com o seu plano, confira em:
// https://dashboard.api-football.com/soccer/ids
// ==========================================================
const LIGAS = [
    { id: 2, nome: "Champions League" },
    { id: 71, nome: "Brasileirão Série A" },
    { id: 39, nome: "Premier League" },
    { id: 140, nome: "La Liga" },
    { id: 13, nome: "Copa Libertadores" },
    { id: 1, nome: "Copa do Mundo" }
];


// ==========================================================
// Função responsável por consumir qualquer endpoint da API
// ==========================================================
async function consumirAPI(endpoint) {

    try {

        const response = await fetch(`${BASE_URL}${endpoint}`, {

            method: "GET",

            headers: {
                "x-apisports-key": API_KEY
            }

        });

        if (!response.ok) {

            throw new Error(`Erro ${response.status}`);

        }

        const dados = await response.json();

        // a API-Football às vezes retorna erros dentro do próprio
        // JSON (status 200) em vez de status HTTP de erro
        if (dados.errors && Object.keys(dados.errors).length > 0) {
            console.log("\n⚠️  A API retornou um aviso:", JSON.stringify(dados.errors));
        }

        return dados;

    } catch (erro) {

        console.log("\n❌ Erro:", erro.message);

        return null;

    }

}


// ==========================================================
// Cabeçalho / Menu Principal
// ==========================================================
function cabecalho() {

    console.log(`
=====================================================
             API FOOTBALL DEMO
=====================================================

1 - Jogo ao vivo

2 - Campeonatos

3 - Buscar time

0 - Sair

=====================================================
`);

}

function menu() {

    console.clear();

    cabecalho();

    rl.question("Escolha uma opção: ", async (opcao) => {

        switch (opcao) {

            case "1":
                await jogoAoVivo();
                break;

            case "2":
                await campeonatos();
                break;

            case "3":
                await buscarTime();
                break;

            case "0":

                console.log("\nSistema encerrado.");

                rl.close();

                return;

            default:

                console.log("\nOpção inválida.");

        }

        console.log("\nPressione ENTER para voltar ao menu...");

        rl.question("", () => {

            menu();

        });

    });

}


// ==========================================================
// 1 - Jogo ao Vivo
// ==========================================================
async function jogoAoVivo() {

    console.clear();
    console.log("========== JOGO AO VIVO ==========\n");

    const dados = await consumirAPI("/fixtures?live=all");

    if (!dados || dados.response.length === 0) {
        console.log("Nenhum jogo ao vivo no momento.");
        return;
    }

    console.table(

        dados.response.map(jogo => ({

            Liga: jogo.league.name,

            Confronto: `${jogo.teams.home.name} x ${jogo.teams.away.name}`,

            Placar: `${jogo.goals.home ?? 0} - ${jogo.goals.away ?? 0}`,

            // elapsed pode vir null (ex: intervalo/pênaltis)
            Minuto: jogo.fixture.status.elapsed ?? "-"

        }))

    );

}


// ==========================================================
// 3 - Buscar Time (independente de campeonato)
// ==========================================================
async function buscarTime() {

    console.clear();

    console.log("========== BUSCAR TIME ==========\n");

    const nome = await perguntar("Digite o nome do time: ");

    if (!nome || nome.trim() === "") {
        console.log("\nDigite um nome válido.");
        return;
    }

    const dados = await consumirAPI(`/teams?search=${encodeURIComponent(nome)}`);

    if (!dados || dados.response.length === 0) {

        console.log("\nTime não encontrado.");

        return;

    }

    console.table(

        dados.response.map(item => {

            // venue pode vir null para seleções/times sem estádio cadastrado
            const venue = item.venue || {};

            return {

                Nome: item.team.name,

                País: item.team.country,

                Fundação: item.team.founded ?? "N/D",

                Estádio: venue.name ?? "N/D"

            };

        })

    );

}


// ==========================================================
// 2 - Campeonatos
// ==========================================================
async function campeonatos() {

    console.clear();

    console.log("========== CAMPEONATOS ==========\n");

    console.table(

        LIGAS.map((liga, indice) => ({

            "#": indice + 1,

            Campeonato: liga.nome

        }))

    );

    const escolha = await perguntar("\nEscolha o número do campeonato: ");

    const liga = LIGAS[Number(escolha) - 1];

    if (!liga) {
        console.log("\nOpção inválida.");
        return;
    }

    const seasonInput = await perguntar(`Temporada (ano, ex: ${anoAtual()}): `);

    const season = Number(seasonInput) || anoAtual();

    console.log(`\nBuscando times de ${liga.nome} (${season})...`);

    const dadosTimes = await consumirAPI(`/teams?league=${liga.id}&season=${season}`);

    if (!dadosTimes || dadosTimes.response.length === 0) {
        console.log("\nNenhum time encontrado para esse campeonato/temporada.");
        return;
    }

    console.clear();

    console.log(`========== TIMES — ${liga.nome} (${season}) ==========\n`);

    console.table(

        dadosTimes.response.map((item, indice) => ({

            "#": indice + 1,

            Time: item.team.name

        }))

    );

    const escolhaTime = await perguntar("\nEscolha o número do time: ");

    const timeSelecionado = dadosTimes.response[Number(escolhaTime) - 1]?.team;

    if (!timeSelecionado) {
        console.log("\nOpção inválida.");
        return;
    }

    await menuTime(liga, timeSelecionado, season);

}


// ==========================================================
// Submenu de um time dentro de um campeonato/temporada
// ==========================================================
async function menuTime(liga, time, season) {

    let continuar = true;

    while (continuar) {

        console.clear();

        console.log(`========== ${time.name} — ${liga.nome} (${season}) ==========\n`);

        console.log("1 - Classificação");
        console.log("2 - Jogos do time");
        console.log("3 - Vitórias, empates e derrotas");
        console.log("4 - Artilheiros");
        console.log("5 - Estatísticas de uma partida");
        console.log("0 - Voltar\n");

        const opcao = await perguntar("Escolha uma opção: ");

        switch (opcao) {

            case "1":
                await mostrarClassificacao(liga, season, time);
                break;

            case "2":
                await mostrarJogosDoTime(liga, season, time);
                break;

            case "3":
                await mostrarVitoriasEmpatesDerrotas(liga, season, time);
                break;

            case "4":
                await mostrarArtilheiros(liga, season, time);
                break;

            case "5":
                await mostrarEstatisticasDePartida(liga, season, time);
                break;

            case "0":
                continuar = false;
                break;

            default:
                console.log("\nOpção inválida.");

        }

        if (continuar) {
            console.log("\nPressione ENTER para continuar...");
            await perguntar("");
        }

    }

}


// ---- Classificação -----------------------------------------------
async function mostrarClassificacao(liga, season, time) {

    console.clear();

    console.log(`========== CLASSIFICAÇÃO — ${liga.nome} (${season}) ==========\n`);

    const dados = await consumirAPI(`/standings?league=${liga.id}&season=${season}`);

    const tabela = dados?.response?.[0]?.league?.standings?.[0];

    if (!tabela || tabela.length === 0) {
        console.log("Classificação indisponível.");
        return;
    }

    console.table(

        tabela.map(item => ({

            "  ": item.team.name === time.name ? "→" : "",

            Posição: item.rank,

            Time: item.team.name,

            Pontos: item.points,

            Jogos: item.all.played,

            Vitórias: item.all.win,

            Empates: item.all.draw,

            Derrotas: item.all.lose

        }))

    );

}


// ---- Jogos do time -------------------------------------------------
async function mostrarJogosDoTime(liga, season, time) {

    console.clear();

    console.log(`========== JOGOS — ${time.name} ==========\n`);

    const dados = await consumirAPI(`/fixtures?league=${liga.id}&season=${season}&team=${time.id}`);

    if (!dados || dados.response.length === 0) {
        console.log("Nenhum jogo encontrado.");
        return;
    }

    console.table(

        dados.response.map(jogo => ({

            Data: jogo.fixture.date.substring(0, 10),

            Confronto: `${jogo.teams.home.name} x ${jogo.teams.away.name}`,

            Placar: jogo.goals.home !== null
                ? `${jogo.goals.home} - ${jogo.goals.away}`
                : "-",

            Status: jogo.fixture.status.short

        }))

    );

}


// ---- Vitórias, empates e derrotas -----------------------------------
async function mostrarVitoriasEmpatesDerrotas(liga, season, time) {

    console.clear();

    console.log(`========== APROVEITAMENTO — ${time.name} ==========\n`);

    const dados = await consumirAPI(`/teams/statistics?league=${liga.id}&season=${season}&team=${time.id}`);

    const fixtures = dados?.response?.fixtures;

    if (!fixtures) {
        console.log("Estatísticas indisponíveis para esse time/temporada.");
        return;
    }

    console.table([
        {
            Jogos: fixtures.played?.total ?? "N/D",
            Vitórias: fixtures.wins?.total ?? "N/D",
            Empates: fixtures.draws?.total ?? "N/D",
            Derrotas: fixtures.loses?.total ?? "N/D"
        }
    ]);

}


// ---- Artilheiros -------------------------------------------------
async function mostrarArtilheiros(liga, season, time) {

    console.clear();

    console.log(`========== ARTILHEIROS — ${liga.nome} (${season}) ==========\n`);

    const dados = await consumirAPI(`/players/topscorers?league=${liga.id}&season=${season}`);

    if (!dados || dados.response.length === 0) {
        console.log("Nenhum dado encontrado.");
        return;
    }

    // tenta filtrar só os artilheiros do time selecionado
    const doTime = dados.response.filter(
        jogador => jogador.statistics?.[0]?.team?.id === time.id
    );

    const lista = doTime.length > 0 ? doTime : dados.response;

    if (doTime.length === 0) {
        console.log(`Nenhum artilheiro de ${time.name} no top 20. Mostrando ranking geral da liga:\n`);
    }

    console.table(

        lista.map((jogador, indice) => {

            const stats = jogador.statistics && jogador.statistics[0];

            return {

                "#": indice + 1,

                Nome: jogador.player.name,

                Time: stats?.team?.name ?? "N/D",

                Gols: stats?.goals?.total ?? 0

            };

        })

    );

}


// ---- Estatísticas de uma partida -------------------------------------
async function mostrarEstatisticasDePartida(liga, season, time) {

    console.clear();

    console.log(`========== ESCOLHA A PARTIDA — ${time.name} ==========\n`);

    const dados = await consumirAPI(`/fixtures?league=${liga.id}&season=${season}&team=${time.id}`);

    if (!dados || dados.response.length === 0) {
        console.log("Nenhum jogo encontrado para esse time.");
        return;
    }

    console.table(

        dados.response.map((jogo, indice) => ({

            "#": indice + 1,

            Data: jogo.fixture.date.substring(0, 10),

            Confronto: `${jogo.teams.home.name} x ${jogo.teams.away.name}`,

            Status: jogo.fixture.status.short

        }))

    );

    const escolha = await perguntar("\nEscolha o número da partida: ");

    const jogoEscolhido = dados.response[Number(escolha) - 1];

    if (!jogoEscolhido) {
        console.log("\nOpção inválida.");
        return;
    }

    const dadosStats = await consumirAPI(`/fixtures/statistics?fixture=${jogoEscolhido.fixture.id}`);

    if (!dadosStats || dadosStats.response.length === 0) {
        console.log("\nNenhuma estatística encontrada para essa partida (pode ainda não ter começado).");
        return;
    }

    console.clear();

    console.log(`========== ESTATÍSTICAS ==========`);
    console.log(`${jogoEscolhido.teams.home.name} x ${jogoEscolhido.teams.away.name}\n`);

    dadosStats.response.forEach(equipe => {

        console.log(`\n--- ${equipe.team.name} ---`);

        if (!equipe.statistics || equipe.statistics.length === 0) {
            console.log("Sem estatísticas disponíveis para este time.");
            return;
        }

        console.table(

            equipe.statistics.map(item => ({

                Estatística: item.type,

                Valor: item.value ?? "-"

            }))

        );

    });

}


// ==========================================================
// Inicia o sistema
// ==========================================================
menu();
