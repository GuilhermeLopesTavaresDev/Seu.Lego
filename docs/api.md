# API Do MVP

## Health check

```http
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

## Criar projeto com upload

```http
POST /uploads/image
Content-Type: multipart/form-data
```

Campos:

- `image`: arquivo da imagem.
- `widthStuds`: largura do mosaico em studs. Padrao: `48`.
- `heightStuds`: altura do mosaico em studs. Padrao: `48`.
- `partId`: `tile-1x1` ou `plate-1x1`.
- `colorLimit`: quantidade maxima de cores LEGO no projeto. Padrao: `24`.

Resposta:

```json
{
  "project": {
    "id": "uuid",
    "status": "ready",
    "originalImagePath": "uploads/file",
    "widthStuds": 48,
    "heightStuds": 48,
    "partId": "tile-1x1",
    "colorLimit": 24
  }
}
```

## Buscar projeto

```http
GET /projects/:projectId
```

## Gerar previa e lista de pecas

```http
GET /projects/:projectId/preview
```

Resposta:

```json
{
  "project": {},
  "mosaic": {
    "width": 48,
    "height": 48,
    "colorLimit": 24,
    "fidelityScore": 91,
    "palette": [],
    "cells": []
  },
  "parts": []
}
```

Na versao atual, a previa e calculada sob demanda. Na evolucao do produto, esse processamento deve ser enviado para fila e persistido no banco.

## Baixar manual PDF

```http
GET /projects/:projectId/manual.pdf
```

Retorna um PDF com dados do projeto, lista de pecas e mapa visual de montagem. Na versao atual o arquivo e gerado sob demanda e salvo em `manuals/`.
