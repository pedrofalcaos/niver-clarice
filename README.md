# 🎉 Aniversário da Clarice — Site de Confirmação (tema Bluey)

Site responsivo e animado para os convidados confirmarem presença no aniversário
da Clarice. Backend em **Node.js + Express** e banco **PostgreSQL**, pronto para
hospedar no **Railway**.

## ✨ O que tem
- Convite animado (céu, nuvens, patinhas flutuantes, contagem regressiva, confete).
- Detalhes da festa com **link para o Google Maps**.
- Formulário de confirmação (nome) que grava no PostgreSQL.
- Contador público de presenças confirmadas.
- Painel **/admin** protegido por senha com lista, total, copiar e remover.

## 📋 Dados da festa
- **Dia:** 20/06/2026 (Sábado)
- **Horário:** 15h
- **Local:** Salão de Festa do Edifício Laura Caula — Rua Neto Campelo, n°70

## 🚀 Subir no Railway
1. Crie um projeto no [Railway](https://railway.app) e conecte este repositório
   (ou faça deploy via `railway up`).
2. No projeto, clique em **New → Database → PostgreSQL**. Isso cria a variável
   `DATABASE_URL` automaticamente.
3. No serviço do site, em **Variables**, adicione:
   - `DATABASE_URL` = `${{ Postgres.DATABASE_URL }}`  (referência ao banco)
   - `ADMIN_PASSWORD` = *sua senha do painel*
4. O Railway roda `npm install` e depois `npm start`. A tabela `confirmacoes`
   é criada sozinha na primeira execução.
5. Em **Settings → Networking**, gere o domínio público e compartilhe o link. 🎈

> A porta é definida pelo Railway via `PORT` (já tratado no `server.js`).

## 💻 Rodar localmente
```bash
npm install
# defina as variaveis (PowerShell):
$env:DATABASE_URL="postgresql://usuario:senha@localhost:5432/clarice"
$env:ADMIN_PASSWORD="clarice2026"
npm start
```
Acesse http://localhost:3000  (painel em /admin.html).

## 🖼️ Adicionar suas imagens
Coloque as imagens em `public/assets/` e siga as instruções de
`public/assets/LEIA-ME.txt` para trocar os mascotes desenhados por fotos/PNGs.

## 🗂️ Estrutura
```
server.js          API + servidor estático
db.js              conexão e criação da tabela no PostgreSQL
public/
  index.html       o convite
  styles.css       tema Bluey + animações
  script.js        contagem, confete, envio do formulário
  admin.html/js    painel da família
  assets/          suas imagens
```
