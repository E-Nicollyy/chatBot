function maiorValor(lista) {
    if (lista.length !== 5) {
      throw new Error("A lista deve conter exatamente 5 números.");
    }
  
    return Math.max(...lista);
  }
  
  // Exemplo
  const numeros = [100, 45, 8, 99, 23];
  
  console.log(numeros,"o maior valor é:", maiorValor(numeros)); // 99