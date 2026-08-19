# 🧾 GestorNF

Sistema para gerenciamento e organização de **notas fiscais, vendedores e usuários**, desenvolvido com **Java + Spring Boot** no backend e **React + Vite** no frontend.

> 🚧 Projeto em desenvolvimento

---

## 📌 Sobre o projeto

O **GestorNF** surgiu a partir de uma necessidade real de negócio: centralizar e organizar informações que anteriormente eram controladas manualmente.

A aplicação permite gerenciar usuários, vendedores e notas fiscais, além de acompanhar o valor total das vendas e calcular automaticamente as comissões mensais dos vendedores.

O projeto foi desenvolvido com o objetivo de aplicar, na prática, conceitos de desenvolvimento de software utilizando **Java, Spring Boot, APIs REST, Spring Security, JWT, PostgreSQL e React**.

Atualmente, o sistema possui um **backend REST integrado a uma aplicação frontend**, permitindo realizar as principais operações através de uma interface gráfica.

---

## 🎯 Objetivos

- Centralizar o gerenciamento de notas fiscais;
- Organizar vendedores e suas respectivas comissões;
- Permitir o cadastro e consulta de notas fiscais;
- Associar notas fiscais aos vendedores;
- Calcular o valor total de notas fiscais por mês;
- Calcular o valor de comissão mensal dos vendedores;
- Controlar o acesso à aplicação através de autenticação;
- Disponibilizar uma API documentada através do Swagger/OpenAPI;
- Disponibilizar uma interface web para utilização do sistema.

---

# 🚀 Funcionalidades

## 👤 Usuários

- ✅ Cadastro de usuário
- ✅ Login
- ✅ Busca de usuário
- ✅ Exclusão de usuário
- ✅ Criptografia de senha
- ✅ Autenticação utilizando JWT
- ✅ Controle de acesso com Spring Security

## 👥 Vendedores

- ✅ Cadastro de vendedor
- ✅ Consulta de vendedor
- ✅ Busca de vendedor por ID
- ✅ Exclusão de vendedor
- ✅ Alteração de comissão
- ✅ Visualização da comissão do vendedor
- ✅ Cálculo de comissão mensal

## 🧾 Notas Fiscais

- ✅ Cadastro de nota fiscal
- ✅ Consulta de nota fiscal
- ✅ Exclusão de nota fiscal
- ✅ Associação da nota fiscal ao vendedor
- ✅ Consulta das notas de um vendedor
- ✅ Busca de nota fiscal por número
- ✅ Consulta do valor total mensal
- ✅ Cálculo do valor total de comissão mensal
- ✅ Visualização dos detalhes da nota fiscal
- ✅ Validação para evitar cadastro de notas fiscais duplicadas

## 🖥️ Frontend

- ✅ Tela de cadastro
- ✅ Tela de login
- ✅ Autenticação integrada com JWT
- ✅ Painel principal
- ✅ Lista de vendedores
- ✅ Busca de vendedor por ID
- ✅ Cadastro de vendedor
- ✅ Alteração de comissão
- ✅ Exclusão de vendedor
- ✅ Cadastro de nota fiscal
- ✅ Busca de nota fiscal
- ✅ Visualização dos detalhes da nota
- ✅ Exclusão de nota fiscal
- ✅ Seleção de mês
- ✅ Visualização do valor mensal de vendas
- ✅ Visualização da comissão mensal
- ✅ Mensagens de sucesso e erro
- ✅ Proteção das rotas autenticadas

---

# 🔐 Segurança

A aplicação utiliza **Spring Security** e **JWT (JSON Web Token)** para autenticação e controle de acesso.

### Fluxo de autenticação

```text
Usuário
   ↓
Login
   ↓
Spring Security
   ↓
Validação das credenciais
   ↓
JWT
   ↓
Frontend armazena o token
   ↓
Requisições autenticadas
   ↓
Backend valida o JWT