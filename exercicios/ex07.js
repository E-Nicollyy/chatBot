// ======================================================
// Consulta de Clima utilizando a API Open-Meteo
// https://open-meteo.com/
// Não necessita de API Key
// ======================================================

import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Obtém latitude e longitude da cidade
async function buscarCidade(cidade) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;

    const response = await fetch(url);

    const dados = await response.json();

    if (!dados.results) {

        console.log("Cidade não encontrada.");

        return null;

    }

    return dados.results[0];

}

// Consulta a previsão do tempo
async function consultarClima(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=15`;

    const response = await fetch(url);

    return await response.json();

}

async function iniciar() {

    rl.question("Digite a cidade: ", async (cidade) => {

        const local = await buscarCidade(cidade);

        if (!local) {

            rl.close();

            return;

        }

        const clima = await consultarClima(

            local.latitude,

            local.longitude

        );

        console.clear();

        console.log("==========================================");
        console.log("          PREVISÃO DO TEMPO");
        console.log("==========================================");

        console.log(`Cidade: ${local.name}`);

        console.log(`País: ${local.country}`);

        console.log(`Latitude: ${local.latitude}`);

        console.log(`Longitude: ${local.longitude}`);

        console.log("------------------------------------------");

        console.log("Temperatura Atual:");

        console.log(`${clima.current.temperature_2m} °C`);

        console.log("------------------------------------------");

        console.log("Previsão para os próximos 15 dias\n");

        for (let i = 0; i < clima.daily.time.length; i++) {

            console.log(`Data: ${clima.daily.time[i]}`);

            console.log(
                `Máxima: ${clima.daily.temperature_2m_max[i]} °C`
            );

            console.log(
                `Mínima: ${clima.daily.temperature_2m_min[i]} °C`
            );

            console.log(
                `Chance de chuva: ${clima.daily.precipitation_probability_max[i]}%`
            );

            console.log("------------------------------------------");

        }

        rl.close();

    });

}

iniciar();