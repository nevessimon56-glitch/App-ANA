# App ANA — Plataforma de Pilates

Plataforma web para professores de pilates gerenciarem exercícios, montarem aulas, controlarem a agenda e acompanharem o progresso dos alunos. Inspirada nas necessidades reais de quem hoje planeja aulas no Word ou no papel, com referência ao [MFIT Personal](https://www.mfitpersonal.com.br/).

## Funcionalidades

### Para a professora
- **Biblioteca de exercícios** — cadastro com nome, vídeo, nível de dificuldade, musculatura trabalhada, benefícios e contraindicações
- **Montagem de aulas** — seleção de exercícios e definição da sequência (ordem)
- **Agenda** — visualização semanal, agendamento de aulas, registro de faltas e conclusão de sessões
- **Avaliação de alunos** — nota de 0 a 10 com observações
- **Transferência de alunos** — quando uma professora falta, o aluno pode ser transferido para outra

### Para o aluno
- **Painel de progresso** — nota atual, evolução, exercícios realizados e histórico de aulas
- **Agenda** — visualizar aulas e solicitar remarcação
- **Histórico completo** — todos os registros são salvos

## Tecnologias

- Next.js 16 (App Router)
- TypeScript
- Prisma 7 + SQLite
- Tailwind CSS

## Como rodar

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npx prisma migrate dev

# Popular com dados de exemplo
npm run db:seed

# Iniciar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Publicar para testar no celular

Para gerar um **link público** que qualquer pessoa abre no celular, siga o guia:

👉 **[DEPLOY.md](./DEPLOY.md)** — passo a passo no Render (gratuito)

## Contas de demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Professora | ana@pilates.com | 123456 |
| Aluno | aluno@pilates.com | 123456 |
| Professora substituta | maria@pilates.com | 123456 |

## Estrutura do projeto

```
src/
├── app/
│   ├── professora/     # Área da professora
│   ├── aluno/          # Área do aluno
│   └── api/            # APIs REST
├── components/         # Componentes reutilizáveis
└── lib/                # Utilitários, auth, prisma
prisma/
├── schema.prisma       # Modelo de dados
└── seed.ts             # Dados iniciais
```

## Variáveis de ambiente

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta"
```

## Próximos passos sugeridos

- App mobile (React Native / Expo)
- Notificações push para lembretes de aula
- Pagamentos e planos (como no MFIT)
- Anamnese e questionários de saúde
- Hospedagem de vídeos em nuvem (S3, Cloudinary)
