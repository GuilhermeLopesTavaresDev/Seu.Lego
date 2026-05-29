# Lego Photo Mosaic

Aplicacao web para transformar fotos de pessoas em projetos de pixel art montaveis com pecas LEGO reais ou compativeis.

O objetivo inicial do projeto e receber uma imagem, converter cada ponto da foto para a cor LEGO mais proxima disponivel, gerar uma previa visual, calcular a lista de pecas necessarias e criar um manual personalizado em PDF.

## Stack proposta

- Node.js
- TypeScript
- Express
- Arquitetura MVC
- PostgreSQL
- Redis + BullMQ para processamento assíncrono
- Sharp para processamento de imagem
- PDFKit ou Playwright/Puppeteer para gerar manuais em PDF
- Prisma ou TypeORM para persistencia

## Estrutura

```txt
src/
  app.ts
  server.ts
  config/
  controllers/
  models/
  repositories/
  routes/
  services/
  jobs/
  views/
```

## Fluxo principal

1. Usuario envia uma foto.
2. Sistema valida e armazena a imagem original.
3. Um projeto e criado com status `processing`.
4. O backend converte a foto para uma grade de pixels LEGO.
5. Cada cor da imagem e aproximada para a cor LEGO real mais proxima.
6. O sistema calcula as pecas necessarias.
7. Uma previa e gerada.
8. O manual PDF personalizado fica disponivel para download.

## Primeira versao

A primeira versao deve usar pecas `1x1`, como `Plate 1x1` ou `Tile 1x1`, porque isso simplifica a montagem e maximiza a fidelidade visual. Depois o sistema pode ganhar um modo economico que substitui blocos contiguos de mesma cor por pecas maiores.

## Como rodar futuramente

```powershell
npm install
npm --prefix frontend install
npm run build
npm run dev
```

Depois acesse:

```txt
http://localhost:3000
```

Durante o desenvolvimento, tambem e possivel rodar o frontend separado:

```powershell
npm run dev:frontend
```

Antes de conectar banco, fila e pagamentos, configure as variaveis do arquivo `.env.example`.

## Frontend

O frontend fica isolado em `frontend/` e foi criado com React, TypeScript, Vite e Three.js. Ele inclui:

- Upload de imagem.
- Selecao de tamanho do mosaico.
- Escolha entre `Tile 1x1` e `Plate 1x1`.
- Tema claro e escuro.
- Previa 2D da pixel art.
- Modelo 3D em escala real aproximada.
- Lista de pecas calculada pelo backend.
- Download de PDF com lista de pecas e mapa de montagem.
- Formatos quadrados e verticais para reduzir cortes em retratos.

## Dados locais

Enquanto nao houver PostgreSQL, o MVP salva projetos em `data/projects.json`, uploads em `uploads/` e PDFs em `manuals/`. Essas pastas ficam fora do Git.
