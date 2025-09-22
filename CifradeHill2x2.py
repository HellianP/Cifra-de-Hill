# cifrahill.py
# Exemplo de uso na linha de comando:
# Para cifrar:   python cifrahill.py -enc textoclaro.txt -out textocifrado.txt
# Para decifrar: python cifrahill.py -dec textocifrado.txt -out textoclaro.txt
# Aluno : Hellian Sampaio Silva Peixinho 
import numpy as np
import sys

# Aqui é onde será feito a conversão de texto em números (A=0, B=1,etc..)
def texto_para_numeros(texto):
    return [ord(caractere) - ord('A') for caractere in texto if caractere.isalpha()]

# Função para converter números em texto, mesma coisa do anterior só que ao contrário ( 0=A, 1=B,etc..)
def numeros_para_texto(numeros):
    return ''.join(chr(num % 26 + ord('A')) for num in numeros)

# Função para cifrar usando a cifra de Hill 
def cifra_de_hill(texto_claro, matriz_chave):
    n = len(matriz_chave)
    numeros_claro = texto_para_numeros(texto_claro)
    while len(numeros_claro) % n != 0:
        numeros_claro.append(ord('k') - ord('A'))  # Preenche com 'k' para completar o bloco se for preciso (ou qualquer outra letra)
    numeros_cifrado = []
    for i in range(0, len(numeros_claro), n):
        bloco = np.array(numeros_claro[i:i+n])
        bloco_cifrado = np.dot(matriz_chave, bloco) % 26
        numeros_cifrado.extend(bloco_cifrado)
    return numeros_para_texto(numeros_cifrado)

# Função para decifrar usando Hill
def decifra_de_hill(texto_cifrado, matriz_chave):
    n = len(matriz_chave)
    numeros_cifrado = texto_para_numeros(texto_cifrado)
    # Calcula inversa da matriz chave no módulo 26
    det = int(round(np.linalg.det(matriz_chave)))
    det_inv = pow(det, -1, 26)
    matriz_chave_inv = (det_inv * np.round(det * np.linalg.inv(matriz_chave)).astype(int)) % 26
    numeros_claro = []
    for i in range(0, len(numeros_cifrado), n):
        bloco = np.array(numeros_cifrado[i:i+n])
        bloco_claro = np.dot(matriz_chave_inv, bloco) % 26
        numeros_claro.extend(bloco_claro)
    return numeros_para_texto(numeros_claro)

# Função principal para tratar argumentos e arquivos
def main():
    matriz_chave = np.array([[7, 8], [10, 3]]) # o determinante da matriz (det) não pode ter divisores comuns com 26.
    if len(sys.argv) != 5 or sys.argv[1] not in ['-enc', '-dec'] or sys.argv[3] != '-out':
        print("Método de Uso via console")
        print("  python cifrahill.py -enc arquivo_entrada.txt -out arquivo_saida.txt")
        print("  python cifrahill.py -dec arquivo_entrada.txt -out arquivo_saida.txt")
        sys.exit(1)
    modo = sys.argv[1]
    arquivo_entrada = sys.argv[2]
    arquivo_saida = sys.argv[4]

    # Lê o texto do arquivo de entrada
    with open(arquivo_entrada, 'r', encoding='utf-8') as f:
        texto = f.read().upper()
    # Executa cifração ou decifração
    if modo == '-enc':
        texto_resultado = cifra_de_hill(texto, matriz_chave)
    else:
        texto_resultado = decifra_de_hill(texto, matriz_chave)

    # Escreve o resultado no arquivo de saída
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        f.write(texto_resultado)
    print(f"Operação '{modo}' concluída. Resultado salvo em '{arquivo_saida}'.")

if __name__ == '__main__':
    main()