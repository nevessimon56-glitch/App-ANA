# Migração para PostgreSQL (fazer em casa)

Guia para quando você estiver no seu PC pessoal. **Não precisa fazer agora** — o app funciona no Render com SQLite para testes.

---

## Por que migrar?

No plano gratuito do Render, o SQLite pode **perder dados** quando o app reinicia. PostgreSQL guarda tudo de forma permanente.

---

## Passo 1 — Criar banco gratuito (5 min)

Escolha **uma** opção:

### Opção A: Neon (recomendado, gratuito)
1. Acesse [neon.tech](https://neon.tech) e crie conta
2. **New Project** → nome: `app-ana`
3. Copie a **Connection string** (formato `postgresql://...`)

### Opção B: Supabase
1. Acesse [supabase.com](https://supabase.com)
2. **New project**
3. Em **Settings → Database**, copie a **URI** de conexão

---

## Passo 2 — Ajustar o projeto no seu PC

Abra o terminal na pasta do projeto:

```bash
git clone https://github.com/nevessimon56-glitch/App-ANA.git
cd App-ANA
git checkout cursor/pilates-platform-mvp-f983
npm install
```

Edite `prisma/schema.prisma` — troque o datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Instale o adapter do PostgreSQL:

```bash
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

Crie/edite o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
JWT_SECRET="sua-chave-secreta-longa"
```

Rode a migração:

```bash
npx prisma migrate dev --name postgres
npm run db:seed
npm run dev
```

Teste em `http://localhost:3000` com `ana@pilates.com` / `123456`.

---

## Passo 3 — Atualizar o Render

No painel do Render → serviço **app-ana** → **Environment**:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Cole a connection string do Neon/Supabase |
| `JWT_SECRET` | Uma chave secreta longa |

Salve. O Render vai fazer redeploy automaticamente.

---

## Passo 4 — Atualizar o código do adapter (se necessário)

O `src/lib/prisma.ts` precisará usar o adapter PostgreSQL em vez do SQLite.  
Se ao fazer isso em casa aparecer erro, abra uma issue ou peça ajuda — posso preparar essa alteração no repositório antes.

---

## Checklist rápido

- [ ] Conta criada no Neon ou Supabase
- [ ] Connection string copiada
- [ ] `schema.prisma` com `provider = "postgresql"`
- [ ] `npm install` + `prisma migrate dev` + `db:seed`
- [ ] Testado localmente
- [ ] `DATABASE_URL` atualizada no Render
- [ ] Deploy **Live** no Render

---

## Enquanto isso (no PC do trabalho)

Você pode normalmente:

- Usar o app publicado: `https://app-ana-7g6t.onrender.com`
- Testar com alunos e professoras
- Cadastrar exercícios e montar aulas
- Compartilhar o link para outras pessoas testarem

Só evite cadastrar muitos dados importantes até migrar, pois no plano free eles podem ser perdidos num reinício.
