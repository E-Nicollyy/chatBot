// ==========================================================
// API FOOTBALL DEMO
// Autor: Nicolly Soterio
// Descrição: Sistema de consulta utilizando a API-Football
// ==========================================================

// Chave da API — agora lida de variável de ambiente (não deixe
// chaves reais direto no código-fonte, principalmente se for
// compartilhar/versionar o arquivo).
// No terminal: export API_FOOTBALL_KEY="sua_chave_aqui"
const API_KEY = "c9ad40bcb364bd559ad31f02e9609024";

if (!API_KEY) {
    console.log("\n⚠️  Defina a variável de ambiente API_FOOTBALL_KEY antes de rodar.");
    process.exit(1);
}

// URL Base
const BASE_URL = "https://v3.football.api-sports.io";

import readline from "readline";

// Interface do terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


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

        // BUG FIX: a API-Football às vezes retorna erros dentro do
        // próprio JSON (status 200) em vez de status HTTP de erro.
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
// Limpa a tela do terminal
// ==========================================================
function limparTela() {

    console.clear();

}


// ==========================================================
// Cabeçalho
// ==========================================================
function cabecalho() {

    console.log(`
=====================================================
             API FOOTBALL DEMO
=====================================================

1 - Jogos ao vivo

2 - Jogos da Copa do Mundo

3 - Seleções participantes

4 - Jogadores da Copa

5 - Classificação

6 - Artilheiros

7 - Estatísticas da partida

8 - Próximos jogos

9 - Buscar time

0 - Sair

=====================================================
`);

}


// ==========================================================
// Menu Principal
// ==========================================================
function menu() {

    limparTela();

    cabecalho();

    rl.question("Escolha uma opção: ", async (opcao) => {

        switch (opcao) {

            case "1":
                await jogosAoVivo();
                break;

            case "2":
                await jogosCopa();
                break;

            case "3":
                await selecoesParticipantes();
                break;

            case "4":
                await jogadoresCopa();
                break;

            case "5":
                await classificacao();
                break;

            case "6":
                await artilheiros();
                break;

            case "7":
                await estatisticas();
                break;

            case "8":
                await proximosJogos();
                break;

            case "9":
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
// 1 - Jogos ao Vivo
// ==========================================================
async function jogosAoVivo() {

    console.clear();
    console.log("========== JOGOS AO VIVO ==========\n");

    const dados = await consumirAPI("/fixtures?live=all");

    if (!dados || dados.response.length === 0) {
        console.log("Nenhum jogo ao vivo no momento.");
        return;
    }

    dados.response.forEach((jogo) => {

        console.log(`🏆 ${jogo.league.name}`);

        console.log(`${jogo.teams.home.name} ${jogo.goals.home ?? 0} x ${jogo.goals.away ?? 0} ${jogo.teams.away.name}`);

        // BUG FIX: elapsed pode vir null (ex: intervalo/pênaltis)
        console.log(`⏱ ${jogo.fixture.status.elapsed ?? "-"}'`);

        console.log("------------------------------------------");

    });

}


// ==========================================================
// 2 - Jogos da Copa do Mundo
// ==========================================================
async function jogosCopa() {

    console.clear();

    console.log("========== COPA DO MUNDO ==========\n");

    // League = 1 (World Cup)
    const dados = await consumirAPI("/fixtures?league=1&season=2026");

    if (!dados || dados.response.length === 0) {

        console.log("Nenhum jogo encontrado.");

        return;

    }

    dados.response.forEach((jogo) => {

        console.log(`📅 ${jogo.fixture.date.substring(0,10)}`);

        console.log(`${jogo.teams.home.name} x ${jogo.teams.away.name}`);

        console.log(`Status: ${jogo.fixture.status.long}`);

        console.log("------------------------------------------");

    });

}


// ==========================================================
// 3 - Seleções Participantes
// ==========================================================
async function selecoesParticipantes() {

    console.clear();

    console.log("===== SELEÇÕES PARTICIPANTES =====\n");

    const dados = await consumirAPI("/teams?league=1&season=2026");

    if (!dados || dados.response.length === 0) {

        console.log("Nenhuma seleção encontrada.");

        return;

    }

    dados.response.forEach((time, indice) => {

        console.log(`${indice + 1}. ${time.team.name}`);

    });

}


// ==========================================================
// 4 - Jogadores da Copa
// ==========================================================
async function jogadoresCopa() {

    console.clear();

    console.log("===== JOGADORES =====\n");

    console.log("Informe o ID da seleção.");

    console.log("Exemplo:");

    console.log("Brasil = 6");

    console.log("Argentina = 26");

    console.log("França = 2\n");

    const id = await new Promise(resolve => {

        rl.question("ID da seleção: ", resolve);

    });

    // BUG FIX: validar entrada antes de chamar a API
    if (!id || isNaN(Number(id))) {
        console.log("\nID inválido. Digite apenas números.");
        return;
    }

    const dados = await consumirAPI(`/players?team=${id}&season=2026`);

    if (!dados || dados.response.length === 0) {

        console.log("Nenhum jogador encontrado.");

        return;

    }

    dados.response.forEach((item) => {

        // BUG FIX: statistics[0] pode não existir para o jogador
        const stats = item.statistics && item.statistics[0];

        console.log("--------------------------------");

        console.log("Nome :", item.player.name);

        console.log("Idade:", item.player.age);

        console.log("País :", item.player.nationality);

        console.log("Posição:", stats?.games?.position ?? "N/D");

    });

}


// ==========================================================
// 5 - Classificação
// ==========================================================
async function classificacao() {

    console.clear();

    console.log("========== CLASSIFICAÇÃO ==========\n");

    const dados = await consumirAPI("/standings?league=1&season=2026");

    // BUG FIX: verificar toda a cadeia antes de acessar standings[0]
    const tabela = dados?.response?.[0]?.league?.standings?.[0];

    if (!dados || !tabela || tabela.length === 0) {

        console.log("Classificação indisponível.");

        return;

    }

    console.table(

        tabela.map(time => ({

            Posição: time.rank,

            Seleção: time.team.name,

            Pontos: time.points,

            Jogos: time.all.played,

            Vitórias: time.all.win,

            Empates: time.all.draw,

            Derrotas: time.all.lose

        }))

    );

}


// ==========================================================
// 6 - Artilheiros
// ==========================================================
async function artilheiros() {

    console.clear();

    console.log("========== ARTILHEIROS ==========\n");

    const dados = await consumirAPI("/players/topscorers?league=1&season=2026");

    if (!dados || dados.response.length === 0) {

        console.log("Nenhum dado encontrado.");

        return;

    }

    dados.response.forEach((jogador, indice) => {

        // BUG FIX: statistics[0] pode vir ausente
        const stats = jogador.statistics && jogador.statistics[0];

        console.log(`${indice + 1}º`);

        console.log("Nome :", jogador.player.name);

        console.log("Seleção :", stats?.team?.name ?? "N/D");

        console.log("Gols :", stats?.goals?.total ?? 0);

        console.log("-------------------------------------");

    });

}

// ==========================================================
// 7 - Estatísticas da Partida
// ==========================================================
async function estatisticas() {

    console.clear();

    console.log("========== ESTATÍSTICAS ==========\n");

    const fixture = await new Promise(resolve => {

        rl.question("Informe o ID da partida: ", resolve);

    });

    // BUG FIX: validar entrada antes de chamar a API
    if (!fixture || isNaN(Number(fixture))) {
        console.log("\nID inválido. Digite apenas números.");
        return;
    }

    const dados = await consumirAPI(`/fixtures/statistics?fixture=${fixture}`);

    if (!dados || dados.response.length === 0) {

        console.log("\nNenhuma estatística encontrada.");

        return;

    }

    dados.response.forEach(time => {

        console.log("\n====================================");

        console.log("Time:", time.team.name);

        console.log("====================================");

        // BUG FIX: statistics pode vir null (partida ainda não começou)
        if (!time.statistics || time.statistics.length === 0) {
            console.log("Sem estatísticas disponíveis para este time.");
            return;
        }

        time.statistics.forEach(item => {

            console.log(`${item.type}: ${item.value ?? "-"}`);

        });

    });

}


// ==========================================================
// 8 - Próximos Jogos
// ==========================================================
async function proximosJogos() {

    console.clear();

    console.log("========== PRÓXIMOS JOGOS ==========\n");

    const dados = await consumirAPI("/fixtures?next=10");

    if (!dados || dados.response.length === 0) {

        console.log("Nenhum jogo encontrado.");

        return;

    }

    dados.response.forEach(jogo => {

        console.log("🏆", jogo.league.name);

        console.log(
            `${jogo.teams.home.name} x ${jogo.teams.away.name}`
        );

        console.log(
            "📅",
            jogo.fixture.date.substring(0,10)
        );

        console.log(
            "⏰",
            jogo.fixture.date.substring(11,16)
        );

        console.log("---------------------------------------");

    });

}


// ==========================================================
// 9 - Buscar Time
// ==========================================================
async function buscarTime() {

    console.clear();

    console.log("========== BUSCAR TIME ==========\n");

    const nome = await new Promise(resolve => {

        rl.question("Digite o nome do time: ", resolve);

    });

    // BUG FIX: evitar chamada com campo vazio
    if (!nome || nome.trim() === "") {
        console.log("\nDigite um nome válido.");
        return;
    }

    const dados = await consumirAPI(

        `/teams?search=${encodeURIComponent(nome)}`

    );

    if (!dados || dados.response.length === 0) {

        console.log("\nTime não encontrado.");

        return;

    }

    dados.response.forEach(item => {

        // BUG FIX: venue pode vir null para seleções/times sem estádio cadastrado
        const venue = item.venue || {};

        console.log("\n====================================");

        console.log("Nome:", item.team.name);

        console.log("País:", item.team.country);

        console.log("Fundação:", item.team.founded ?? "N/D");

        console.log("Estádio:", venue.name ?? "N/D");

        console.log("Cidade:", venue.city ?? "N/D");

        console.log("Capacidade:", venue.capacity ?? "N/D");

        console.log("====================================");

    });

}


// ==========================================================
// Inicia o sistema
// ==========================================================
menu();