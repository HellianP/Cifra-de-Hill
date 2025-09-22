#!/usr/bin/env node
// hillcipher.js
// Cifra de Hill 2x2 em Node.js
// Uso:
//   node hillcipher.js -crip entrada.txt -out cifrado.txt
//   node hillcipher.js -decrip cifrado.txt -out decifrado.txt

const fs = require('fs');

// Constantes
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MODULO = ALFABETO.length;

// Matriz chave 2x2 (invertível módulo 26)
const MATRIZ_CHAVE = [
    [3, 3],
    [2, 5]
];

// ----------------- Funções utilitárias -----------------

// Converte letra para número (A=0,...,Z=25)
function letraParaNumero(letra) {
    return ALFABETO.indexOf(letra.toUpperCase());
}

// Converte número para letra (mod 26)
function numeroParaLetra(numero) {
    return ALFABETO[(numero + MODULO) % MODULO];
}

// Remove caracteres não alfabéticos e converte para maiúsculas
function preprocessarTexto(texto) {
    return texto.toUpperCase().replace(/[^A-Z]/g, '');
}

// Cria blocos de tamanho fixo e adiciona padding 'X' se necessário
function criarBlocos(texto, tamanhoBloco) {
    while (texto.length % tamanhoBloco !== 0) {
        texto += 'X';
    }
    let blocos = [];
    for (let i = 0; i < texto.length; i += tamanhoBloco) {
        blocos.push(texto.slice(i, i + tamanhoBloco));
    }
    return blocos;
}

// Determinante de matriz 2x2
function det2x2(m) {
    return m[0][0]*m[1][1] - m[0][1]*m[1][0];
}

// Inverso multiplicativo módulo n
function inversoMod(a, m) {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a*x) % m === 1) return x;
    }
    throw new Error("Não existe inverso módulo " + m);
}

// Calcula matriz inversa módulo 26 (somente 2x2)
function matrizInversaMod2x2(m) {
    const det = det2x2(m);
    const invDet = inversoMod(det, MODULO);
    return [
        [( m[1][1]*invDet) % MODULO, (-m[0][1]*invDet) % MODULO],
        [(-m[1][0]*invDet) % MODULO, ( m[0][0]*invDet) % MODULO]
    ].map(row => row.map(x => (x + MODULO) % MODULO)); // corrige negativos
}

// ----------------- Funções principais -----------------

// Cifra o texto
function cifrar(texto) {
    texto = preprocessarTexto(texto);
    const blocos = criarBlocos(texto, 2);
    let resultado = '';

    for (const bloco of blocos) {
        const vetor = [letraParaNumero(bloco[0]), letraParaNumero(bloco[1])];
        const cifrado = [
            (MATRIZ_CHAVE[0][0]*vetor[0] + MATRIZ_CHAVE[0][1]*vetor[1]) % MODULO,
            (MATRIZ_CHAVE[1][0]*vetor[0] + MATRIZ_CHAVE[1][1]*vetor[1]) % MODULO
        ];
        resultado += numeroParaLetra(cifrado[0]) + numeroParaLetra(cifrado[1]);
    }

    return resultado;
}

// Decifra o texto
function decifrar(texto) {
    texto = preprocessarTexto(texto);
    const blocos = criarBlocos(texto, 2);
    const chaveInv = matrizInversaMod2x2(MATRIZ_CHAVE);
    let resultado = '';

    for (const bloco of blocos) {
        const vetor = [letraParaNumero(bloco[0]), letraParaNumero(bloco[1])];
        const decifrado = [
            (chaveInv[0][0]*vetor[0] + chaveInv[0][1]*vetor[1]) % MODULO,
            (chaveInv[1][0]*vetor[0] + chaveInv[1][1]*vetor[1]) % MODULO
        ];
        resultado += numeroParaLetra(decifrado[0]) + numeroParaLetra(decifrado[1]);
    }

    return resultado;
}

// ----------------- Função principal CLI -----------------

function main() {
    const args = process.argv.slice(2); // remove "node" e "script.js"

    let arquivoEntrada = null;
    let arquivoSaida = null;
    let funcao = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-crip") {
            arquivoEntrada = args[i+1];
            funcao = cifrar;
            i++;
        } else if (args[i] === "-decrip") {
            arquivoEntrada = args[i+1];
            funcao = decifrar;
            i++;
        } else if (args[i] === "-out") {
            arquivoSaida = args[i+1];
            i++;
        }
    }

    if (!arquivoEntrada || !arquivoSaida || !funcao) {
        console.error("Uso: node hillcipher.js -crip|-decrip <arquivo> -out <arquivo_saida>");
        process.exit(1);
    }

    // Leitura do arquivo
    let texto;
    try {
        texto = fs.readFileSync(arquivoEntrada, "utf8");
    } catch (e) {
        console.error("Erro ao ler arquivo:", e.message);
        process.exit(2);
    }

    // Processa
    const resultado = funcao(texto);

    // Escreve resultado
    try {
        fs.writeFileSync(arquivoSaida, resultado, "utf8");
    } catch (e) {
        console.error("Erro ao escrever arquivo:", e.message);
        process.exit(3);
    }

    console.log(`Operação concluída! Resultado salvo em: ${arquivoSaida}`);
}

// Executa
main();
