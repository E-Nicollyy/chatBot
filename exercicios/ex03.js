// código do exercicio

// let idade1 = 20
// let idade2 = 25
// let soma = idade1 + idade2

// console.log(soma)

// let idade1 = 30
// let idade2 = 35
// let soma = idade1 + idade2
// console.log(soma)



// ================ codigo correto evitando repetições e modificações na logica do programa

let idade1 = 20
let idade2 = 25

const soma = idade1 + idade2
console.log(soma)


//evitando repetições e modificações na logica do programa

function somarIdades(idade1, idade2) {
    let soma = idade1 + idade2;
    console.log(soma);
}

somarIdades(20, 25);
somarIdades(30, 35);
