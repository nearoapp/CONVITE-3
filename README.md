# Convite de aniversário — Livia 🎂

Site de convite digital: envelope animado, contador regressivo, confirmação
de presença (RSVP), sugestão de presentes com chave Pix (QR code) e dois
painéis administrativos separados.

## Senhas

As senhas **não ficam mais em texto puro** no `config.js` — só o hash
(SHA-256) delas fica salvo lá, e o site compara o hash do que a pessoa
digita com esse hash. Isso evita que alguém abra o código-fonte da página
(Ctrl+U no navegador) e veja a senha na hora. **Isso ainda não é segurança
de verdade** (o hash de senhas curtas/simples pode ser quebrado por força
bruta com calma), só afasta curiosos casuais.

| Painel | Arquivo | Senha atual |
|---|---|---|
| Painel do cliente (quem encomendou o convite, vê a lista de confirmações) | `admin.html` | `1234` |
| Seu painel exclusivo (aberturas do convite + pedidos de convite próprio) | `meu-painel.html` | `123456789` |

### Como trocar uma senha

1. Escolha a nova senha.
2. Gere o hash SHA-256 dela. Pelo terminal (com Node ou Python instalado):
   ```bash
   node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('SUA_SENHA_NOVA')).then(b=>console.log(Buffer.from(b).toString('hex')))" --input-type=module
   ```
   ou, mais simples, pelo Python:
   ```bash
   python3 -c "import hashlib; print(hashlib.sha256('SUA_SENHA_NOVA'.encode()).hexdigest())"
   ```
   ou ainda em qualquer site de "SHA256 hash generator" (digite a senha, copie o resultado em hexadecimal).
3. Cole o resultado em `config.js`:
   - `adminPasscodeHash` → senha do `admin.html` (cliente)
   - `creatorPasscodeHash` → senha do `meu-painel.html` (seu painel)
4. Publique de novo (veja "Publicar/atualizar" abaixo).

## Sugestão de presentes ("um mimo, se desejar")

Todo o texto dessa seção vem de `config.js`, no bloco `giftsSection`:
título, os dois parágrafos de introdução, a lista de sugestões (com
coraçõezinhos) e o cartão "um recadinho...".

**Atenção:** a foto de referência enviada tinha alguns trechos borrados que
não deu para ler. Eles ficaram marcados como `[EDITE AQUI]` em três lugares:

- 2 itens da lista de sugestões (entre "acessórios"/"produtos de skincare"
  e entre "livros"/"decoração para quarto")
- 1 trecho dentro do "recadinho" sobre preferir receber o valor em dinheiro

Procure por `[EDITE AQUI]` dentro de `config.js` e troque pelo texto certo
antes de publicar para os convidados.

## Chave Pix e QR code

O QR code que aparece nessa seção **não é só uma imagem com a chave
escrita** — ele é montado no formato oficial do Banco Central (o mesmo
"Pix Copia e Cola" que qualquer banco lê), então abre direto a tela de
pagamento no app do convidado, já com seu nome e cidade preenchidos.
Isso é feito 100% no navegador de quem visita a página (arquivo
`vendor-qrcode.js`, uma biblioteca de código aberto incluída no projeto),
sem depender de nenhum site externo.

Tudo isso vem de `config.js`:
```js
pixKey: '58295787861',
pixKeyType: 'CPF',
pixHolder: 'Livia Silva Rocha',
pixCity: 'Sao Paulo',
```

🔴 **Ponto de atenção importante:** `pixKeyType` está como `CPF`, ou seja,
`pixKey` é o CPF completo de alguém. Como este arquivo fica público (é só
JavaScript rodando no navegador — qualquer visitante consegue abrir o
código-fonte da página e ler isso), **isso expõe um CPF completo para
qualquer um que visitar o site**. CPF é dado sensível no Brasil (LGPD).

Recomendo fortemente trocar a chave Pix para um tipo que não exponha dado
pessoal sensível antes de divulgar o link:
- **E-mail** (`pixKeyType: 'E-mail'`)
- **Celular** (`pixKeyType: 'Celular'`)
- **Chave aleatória** (a mais segura — gerada no próprio app do banco,
  não tem relação nenhuma com CPF, e-mail ou celular)

Para trocar: gere a nova chave no app do banco (menu Pix → Minhas chaves),
depois atualize `pixKey` e `pixKeyType` em `config.js`.

## Local da festa

`config.js` → `venueName` (atualmente `"Salão de festa 1"`) e
`venueAddress` (endereço completo, usado também para montar o link do
Google Maps automaticamente).

## Link mais bonito ao compartilhar

Quando alguém cola o link do convite no WhatsApp, Instagram etc., o app
mostra uma prévia (imagem + título + descrição). Isso é controlado pelas
tags `<meta property="og:...">` no início do `index.html`, e a imagem
usada é `og-image.jpg` (já incluída no projeto, gerada no estilo
rosa/vinho/dourado do convite).

**Duas coisas importantes:**
1. Essa prévia **só funciona depois que o site estiver publicado** em um
   endereço `https://` de verdade (Vercel, por exemplo) — não funciona
   abrindo o arquivo direto no computador, nem em rascunhos ainda não
   publicados.
2. As tags `og:title`, `og:description` e `og:image` são **texto fixo**,
   não são geradas pelo `script.js`. Isso é assim de propósito: os
   aplicativos que buscam a prévia do link (WhatsApp, etc.) não executam
   JavaScript, só leem o HTML puro. Ou seja, se você trocar o nome da
   aniversariante, a data ou quiser uma capa diferente, precisa editar
   essas tags manualmente no `<head>` do `index.html` (e trocar/gerar uma
   nova `og-image.jpg`, se quiser uma capa diferente).

## Publicar / atualizar no Vercel

Como o projeto está ligado a um repositório Git (GitHub/GitLab):

```bash
git add .
git commit -m "Ajustes: local, saudação, presentes, pix, senha, link preview"
git push
```

A Vercel detecta o push automaticamente e publica a nova versão em alguns
segundos/minutos. Acompanhe em vercel.com → seu projeto → aba "Deployments".

Se o projeto **não** estiver num repositório Git (por exemplo, você usa
`vercel --prod` direto da pasta), rode esse comando no terminal, dentro da
pasta do projeto, com a Vercel CLI instalada e logada.

## Banco de dados (Firebase / Firestore)

Já vem configurado (projeto `convite-684a2`). Sem isso, cada confirmação
de presença fica salva só no celular de quem confirmou (`localStorage`);
com o Firebase configurado, todas as confirmações aparecem centralizadas
no `admin.html`.

## Painel escondido (`meu-painel.html`) e marca do criador

O rodapé do convite tem uma linha discreta com o nome de quem criou o
convite (`config.js` → `creator`), e existe um painel separado
(`meu-painel.html`, senha própria) que registra:
- **aberturas** do convite (coleção `aberturas` no Firestore)
- **leads**: cliques no link do rodapé pedindo um convite igual
  (coleção `leads`)

Isso é visível só para quem tem a senha do `meu-painel.html` — o cliente
(dono do `admin.html`) não vê essas informações. A página
`privacidade.html` explica isso publicamente para quem visitar o site.

## Estrutura de arquivos

```
index.html         convite (página principal)
script.js           toda a lógica do convite (envelope, contador, RSVP, presentes, Pix)
config.js           TODAS as configurações editáveis (nome, data, local, presentes, Pix, senhas...)
style.css           estilo visual
vendor-qrcode.js     biblioteca de código aberto para gerar o QR code do Pix (não precisa mexer)
admin.html / admin.js         painel do cliente (lista de confirmações)
meu-painel.html / meu-painel.js  seu painel exclusivo (aberturas + leads)
privacidade.html    aviso de privacidade sobre o rastreamento de aberturas
og-image.jpg        imagem de capa usada na prévia do link
musica.mp3          música de fundo (opcional)
```
