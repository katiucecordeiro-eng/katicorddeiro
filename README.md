# Asterik

Caderno de estudo digital de anatomia para estudantes de medicina, enfermagem e
áreas da saúde. Estude colorindo pranchas estilo atlas científico, fazendo
anotações, respondendo quizzes com ranking e usando um Pomodoro integrado às
sessões de estudo.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (banco de dados Postgres, autenticação e storage)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e preencha com as credenciais do seu
   projeto Supabase (Project Settings > API):

   ```bash
   cp .env.example .env.local
   ```

3. Rode as migrations em `supabase/migrations` no seu projeto Supabase (via
   `supabase db push`, pela CLI, ou colando o SQL no SQL Editor do dashboard).
   Opcionalmente, rode `supabase/seed.sql` para popular dados de exemplo.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
  app/
    (auth)/          # login, cadastro — layout público
    (app)/           # dashboard, pranchas, quiz, pomodoro, colecao, perfil — layout protegido
  components/
    auth/            # formulários de login/cadastro
    layout/          # AppShell (sidebar + nav) e navegação
    perfil/          # formulário de edição de perfil
    pomodoro/        # timer Pomodoro
  lib/
    supabase/        # clientes Supabase (browser, server, middleware) e tipos gerados
  proxy.ts           # Proxy (ex-middleware) — protege rotas e sincroniza sessão
supabase/
  migrations/        # schema SQL + RLS policies
  seed.sql           # dados de exemplo (sistemas e pranchas)
```

## Banco de dados

O schema (tabelas `profiles`, `sistemas`, `pranchas`, `progresso_usuario`,
`quiz_perguntas`, `quiz_respostas_usuario`, `sessoes_pomodoro`, a função
`ranking()` e as políticas de Row Level Security) está em
`supabase/migrations/`. Cada usuário só acessa seus próprios dados de
progresso, respostas de quiz e sessões de Pomodoro; o acesso às pranchas é
liberado por plano (`white`/`black`) via RLS.

## Deploy

Projeto pronto para deploy na [Vercel](https://vercel.com/new). Configure as
mesmas variáveis de `.env.example` no painel do projeto.
