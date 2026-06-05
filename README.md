# Magno Mini Site

Mini-site estático para link na bio, com conteúdo editável em `content.json`.

## Como editar

Abra `content.json` e altere:

- `title`: título do card
- `description`: texto menor
- `cta`: texto do botão nos cards principais
- `url`: link de destino
- `image`: caminho da imagem
- `tag`: selo pequeno do card
- `theme`: `green`, `gold` ou `blue`

As imagens ficam em `assets/`. Você pode exportar cards do Canva e substituir os arquivos atuais mantendo o mesmo nome, ou adicionar novas imagens e ajustar o campo `image`.

## Editor visual

Com o servidor local rodando, acesse:

```text
http://localhost:8080/editor.html
```

Edite os campos, clique em `Baixar content.json` e substitua o `content.json` antigo pelo novo. Para trocar logos/imagens, coloque os arquivos em `assets/` e use caminhos como `assets/minha-imagem.png`.

Para adicionar novos itens, use os botões `Adicionar destaque` e `Adicionar link`. Novos destaques já recebem um tema visual pronto automaticamente. Os temas disponíveis são `green`, `purple`, `blue`, `gold`, `red` e `dark`.

Em cada card, o botão `Escolher imagem` embute a imagem diretamente no JSON exportado. Isso é mais prático, mas deixa o `content.json` maior. Se quiser manter o JSON leve, salve a imagem em `assets/` e preencha o campo `Imagem` com o caminho do arquivo.

## Como visualizar

Na pasta do projeto, rode:

```bash
python3 -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

No macOS, você também pode abrir com duplo clique:

- `abrir-editor.command`: abre o editor
- `abrir-site.command`: abre o mini-site

## Publicação

Este projeto funciona em Cloudflare Pages ou GitHub Pages. Publique a pasta inteira como site estático.

## Usar em dois Macs

O caminho mais prático é manter esta pasta em um repositório GitHub:

1. No Mac principal, envie a pasta para o GitHub.
2. No notebook, clone o mesmo repositório.
3. Edite pelo `editor.html`.
4. Baixe o `content.json`, substitua o antigo e faça commit/push.
5. No outro Mac, use `git pull` para receber as mudanças.

O editor é local e não salva sozinho no GitHub. Ele gera o `content.json` atualizado para você versionar.
