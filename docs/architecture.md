# Arquitetura Do Sistema

## Objetivo

Construir uma aplicacao web capaz de transformar uma foto em um projeto fisico de mosaico LEGO, usando as cores LEGO disponiveis mais proximas da imagem original.

## Principios

- A foto nao precisa ter correspondencia exata de cor.
- Cada cor sera aproximada para a cor LEGO disponivel mais parecida.
- O resultado precisa ser montavel fisicamente.
- A lista de pecas deve considerar cor, tipo de peca e quantidade.
- Processamentos pesados devem rodar em background.
- O backend deve seguir MVC, separando controllers, models, repositories e services.

## Componentes

### Frontend

Responsavel por:

- Upload da foto.
- Recorte e ajuste da imagem.
- Escolha do tamanho do mosaico.
- Escolha do tipo de peca.
- Visualizacao da previa.
- Download do manual PDF.
- Area do usuario e historico de projetos.

### Backend

Responsavel por:

- Receber uploads.
- Validar arquivos.
- Criar projetos.
- Processar imagens.
- Mapear cores.
- Calcular pecas.
- Gerar PDF.
- Integrar pagamentos.
- Integrar catalogos externos de pecas.

### Banco De Dados

Entidades principais:

- users
- projects
- uploaded_images
- lego_colors
- lego_parts
- lego_part_colors
- project_pixels
- project_parts
- manuals
- payments

### Fila De Processamento

Usada para tarefas demoradas:

- Conversao de imagem.
- Geracao da previa.
- Geracao do PDF.
- Sincronizacao do catalogo LEGO.

## Fluxo Tecnico

```txt
UploadController
  -> StorageService
  -> ProjectRepository
  -> ProcessImageJob
      -> ImageProcessingService
      -> ColorMatchingService
      -> LegoCatalogService
      -> MosaicGenerationService
      -> PartsOptimizerService
      -> PdfManualService
```

## Estrategia De Cores

1. Redimensionar a imagem para a grade escolhida.
2. Extrair a cor media de cada celula.
3. Converter RGB para CIELAB.
4. Comparar com a paleta LEGO usando Delta E CIEDE2000.
5. Montar uma paleta limitada com as cores LEGO mais relevantes para aquela imagem.
6. Remapear cada celula para a melhor cor dentro da paleta limitada.
7. Se a peca nao existir naquela cor, escolher a proxima melhor cor disponivel.

## Tipos De Projeto

- Fiel: mais cores, mais detalhe, maior custo.
- Equilibrado: reduz cores raras e melhora disponibilidade.
- Economico: usa menos cores e tenta reduzir a quantidade de pecas.
