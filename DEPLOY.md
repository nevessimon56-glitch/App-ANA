# Como publicar o App ANA para qualquer pessoa testar no celular

Siga estes passos **uma única vez**. No final você terá um link público (ex.: `https://app-ana.onrender.com`) para mandar por WhatsApp.

---

## Antes de começar

1. Use a branch **`cursor/pilates-platform-mvp-f983`** (é onde está o app hoje).  
   Depois que fizer merge do PR na `main`, pode usar a `main` também.

2. Crie uma conta gratuita em **[render.com](https://render.com)** (pode entrar com GitHub).

---

## Passo a passo no Render (recomendado)

### 1. Conectar o repositório

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **New +** → **Blueprint**
3. Conecte sua conta do GitHub se ainda não conectou
4. Selecione o repositório **App-ANA**
5. Em **Branch**, escolha **`cursor/pilates-platform-mvp-f983`**
6. O Render vai detectar o arquivo `render.yaml` — clique em **Apply**

### 2. Aguardar o deploy

O Render vai:

- Instalar dependências
- Criar o banco de dados
- Popular com as contas de demonstração
- Publicar o site

Isso leva cerca de **5 a 10 minutos** na primeira vez.

### 3. Copiar o link

Quando o status ficar **Live** (verde), clique no serviço **app-ana** e copie a URL no topo, algo como:

```
https://app-ana-xxxx.onrender.com
```

**Esse é o link que você manda para qualquer pessoa testar no celular.**

---

## O que enviar por WhatsApp

Copie e cole (trocando o link):

```
Oi! Testa a plataforma de Pilates que estou montando:

👉 https://app-ana-xxxx.onrender.com

Contas para entrar:

Professora: ana@pilates.com
Senha: 123456

Aluno: aluno@pilates.com
Senha: 123456

Abre no celular ou no computador. Qualquer dúvida me fala!
```

---

## Contas de demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Professora | ana@pilates.com | 123456 |
| Aluno | aluno@pilates.com | 123456 |
| Professora substituta | maria@pilates.com | 123456 |

---

## Observações importantes

### Plano gratuito “dorme”
No plano free do Render, se ninguém acessar por ~15 minutos, o site “hiberna”. A **primeira abertura** depois disso pode demorar **30–60 segundos** — é normal. Avise quem for testar.

### Dados no plano gratuito
No plano free **não há disco persistente**. Os dados de demonstração são recriados a cada deploy. Para uso real com muitos alunos, será preciso um plano pago ou outro serviço de banco.

### Vídeos enviados
Vídeos enviados pela professora podem ser perdidos se o app for atualizado/reiniciado no plano gratuito.

### Atualizar o app depois
Sempre que você fizer merge de mudanças na branch `main`, o Render **atualiza sozinho** em alguns minutos.

---

## Alternativa: Railway

Se preferir o [Railway](https://railway.app):

1. **New Project** → **Deploy from GitHub** → repositório App-ANA
2. Adicione um **Volume** com mount path `/data`
3. Variáveis de ambiente:
   ```
   DATABASE_URL=file:/data/dev.db
   JWT_SECRET=uma-chave-secreta-longa-aqui
   ```
4. Build command:
   ```
   npm install && npm run build && npm run db:seed
   ```
5. Start command: `npm start`

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Página não abre / demora muito | Plano free hibernou — espere 1 minuto e tente de novo |
| Erro no deploy | Veja os **Logs** no painel do Render |
| Login não funciona | Rode o deploy de novo; o `db:seed` cria as contas demo |
| Repositório não aparece | Confirme que o GitHub está conectado e o código está na `main` |
