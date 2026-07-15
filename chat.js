import OpenAI from "openai";
import readline from "readline/promises";

const endpoint = "https://foundry0807.services.ai.azure.com/openai/v1";
const deploymentName = "gpt-5.4-mini";
const apiKey = process.env.API_OPENAI

const openai = new OpenAI({
  baseURL: endpoint,
  apiKey: apiKey,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("\n\n ================ Chat Bot Iniciado ===================");
  console.log("\n\nPara encerrar o chat, digite 'sair'\n\n ");

  let historico = [
    {
      "role": "system",
      "content": "você é um assistente inteligente de futebol. Qualquer coisa fora do tema em que você é especialista(futebol) você vai dizer educadamente que só trata tema da sua especialidade e volte ao tema, ajudando o usuario a decidir qualquer outra coisa relacionada sobre futebol, pode dar exemplos em tópicos. Responda apenas em pt-br"
    }
  ]

  while (true) {

    let mensagemUsuario = await rl.question("\n Você: ")

    if( mensagemUsuario.toLowerCase() == "sair"){
        break
    }

    historico.push({

      "role": "user",
      "content": mensagemUsuario

    })

    const resposta = await openai.responses.create({
      model: deploymentName,
      instructions: "você é um assistente inteligente de futebol. Qualquer coisa fora do tema em que você é especialista(futebol) você vai dizer educadamente que só trata tema da sua especialidade e volte ao tema, ajudando o usuario a decidir qualquer outra coisa relacionada sobre futebol, pode dar exemplos em tópicos.",
      input: historico
    });

    historico.push({

      "role": "assistant",
      "content": resposta.output_text,


    })

    //filtrando para o historico receber e mostrar apenas as ultimas 20 mensagens/historico

    historico = [
      historico[0],
      ...historico.slice(-40) //slice mantém 20 pares de conversa
    ];

    console.log("\nResposta - Assistente Inteligente: \n\n",resposta.output_text);
    
    //filtrando para ele receber no console apenas o system
    console.log("historico",historico.find(item => item.role === "system"))
  }

  rl.close()
}

main();
