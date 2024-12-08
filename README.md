# Extrator de Dados de Lojas

Este script Node.js busca e extrai dados da API do serviço de lavanderia, salvando informações específicas das lojas em um arquivo JSON.

## Requisitos

- Node.js (versão 12 ou superior)
- NPM (Node Package Manager)

## Instalação

1. Clone este repositório ou baixe os arquivos
2. Execute o comando para instalar as dependências:

```bash
npm install
```

## Dependências

- axios: Para realizar requisições HTTP
- fs: Módulo nativo do Node.js para manipulação de arquivos

## Como Executar

Execute o script usando o comando:

```bash
node index.js
```

## Formato de Saída

O script gera um arquivo `stores_data.json` com um array de objetos no seguinte formato:

```json
[
  {
    "codigo": "valor_do_codigo",
    "estado": "valor_do_estado",
    "token": "valor_do_token"
  }
]
```

## Logs

O script fornece feedback em tempo real sobre:
- Início da operação
- Sucesso ou falha na extração dos dados
- Total de lojas processadas
- Detalhes de eventuais erros 