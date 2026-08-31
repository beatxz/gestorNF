# 📊 GestorNF — Sistema de Gestão de Notas Fiscais

O **GestorNF** é uma aplicação Full Stack desenvolvida para auxiliar vendedores e pequenas empresas no controle de **notas fiscais**, **comissões** e **vendas mensais**.

O projeto surgiu a partir de uma necessidade real: organizar o fluxo diário de notas fiscais de uma empresa do ramo de pneus, permitindo acompanhar vendas, calcular comissões e consultar o faturamento de forma simples.

> Atualmente o sistema está em fase de MVP (Produto Mínimo Viável) e já está disponível online para testes.

---

##  Funcionalidades

###  Autenticação de usuários

* Cadastro de usuários.
* Login utilizando JWT.
* Verificação de e-mail antes do primeiro acesso.
* Recuperação de senha por e-mail (token temporário).

###  Gestão de vendedores

* Cadastro de vendedores.
* Alteração da comissão de cada vendedor.
* Listagem dos vendedores vinculados ao usuário.
* Exclusão de vendedores.

###  Gestão de notas fiscais

* Cadastro de notas fiscais.
* Associação da nota a um vendedor.
* Consulta de notas cadastradas.
* Exclusão de notas fiscais.
* Validação para impedir notas fiscais duplicadas.

###  Controle financeiro

* Soma do valor total vendido no mês.
* Cálculo automático da comissão mensal do vendedor.
* Consulta por período (mês/ano).

---

##  Demonstração

### Tela de Login

* Login com autenticação JWT.
* Link para recuperação de senha.
* Link para criação de conta.

### Dashboard

* Cards com faturamento mensal.
* Cards com comissão mensal.
* Lista de vendedores.
* Cadastro de novas notas fiscais.
* Tabela com notas cadastradas.

---

## 🛠️ Tecnologias Utilizadas

### Backend

* Java 21
* Spring Boot 4
* Spring Security + JWT
* Spring Data JPA
* Hibernate
* PostgreSQL
* Thymeleaf
* Resend (envio de e-mails)
* Swagger / OpenAPI

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router

### Banco de Dados

* PostgreSQL (Supabase)

### Deploy

* Frontend hospedado na **Vercel**.
* Backend hospedado na **Render**.
* Banco de dados hospedado na **Supabase**.

### Ferramentas

* Docker
* Git
* GitHub
* Postman
* IntelliJ IDEA
* VS Code

---

##  Arquitetura do Projeto

```text
Frontend (React + Vercel)
            │
            ▼
Backend (Spring Boot + Render)
            │
            ▼
Banco PostgreSQL (Supabase)
            │
            ▼
Resend (Verificação e recuperação de senha)
```

---

##  Segurança

O sistema utiliza autenticação baseada em **JWT**.

Fluxo de autenticação:

1. Usuário cria uma conta.
2. Um e-mail de verificação é enviado.
3. Após confirmar o e-mail, o usuário pode realizar login.
4. As rotas protegidas exigem um token Bearer JWT.

---

## 📧 Verificação de E-mail

O GestorNF envia automaticamente:

* E-mail de verificação de conta.
* E-mail de recuperação de senha.

Os links são gerados dinamicamente conforme o ambiente (desenvolvimento ou produção).

---

## 🌐 Projeto Online

### Frontend

Disponível na Vercel.

### Backend

API publicada na Render com documentação Swagger.

---

## 📖 Documentação da API

A documentação da API está disponível através do Swagger/OpenAPI.

Entre as principais rotas estão:

### Usuários

* Cadastro.
* Login.
* Verificação de e-mail.
* Recuperação de senha.

### Vendedores

* Listagem.
* Cadastro.
* Atualização de comissão.
* Exclusão.

### Notas Fiscais

* Cadastro.
* Busca.
* Exclusão.
* Valor mensal.
* Comissão mensal.

---

## 🚀 Como executar localmente

### 1. Clone o projeto

```bash
git clone https://github.com/beatxz/gestorNF.git
```

### 2. Backend

Configure as variáveis de ambiente:

```properties
DB_URL=
DB_USERNAME=
DB_PASSWORD=

RESEND_API_KEY=
EMAIL_REMETENTE=

BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
```

Execute:

```bash
./gradlew bootRun
```

### 3. Frontend

Entre na pasta do frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker

O backend possui Dockerfile para execução em containers.

Construção da imagem:

```bash
docker build -t gestornf-api .
```

Execução:

```bash
docker run --env-file .env.properties -p 8080:8080 gestornf-api
```

---

## 📌 Próximas funcionalidades

* Importação de múltiplas notas fiscais.
* Código do cliente na nota fiscal.
* Filtros por período e vendedor.
* Dashboard com gráficos.
* Convite de usuários por e-mail.
* Perfis de acesso (Administrador e Vendedor).
* Relatórios em PDF.

---

## 👩🏾‍💻 Desenvolvido por

**Beatriz Rodrigues**

Projeto desenvolvido como aplicação Full Stack para estudo de Java, Spring Boot e React, evoluindo para um MVP de uso real para gestão de notas fiscais e comissões.
