# 📋 GestorNF

Sistema desenvolvido para auxiliar no gerenciamento e organização de notas fiscais, vendedores e usuários, centralizando informações que anteriormente eram controladas de forma manual.

> 🚧 Projeto em desenvolvimento

---

##  Sobre o projeto

O **GestorNF** é uma aplicação backend desenvolvida a partir de uma necessidade real de negócio: facilitar o controle de notas fiscais e das informações relacionadas aos vendedores.

A proposta do sistema é centralizar os dados em uma aplicação, permitindo o gerenciamento de usuários, vendedores e notas fiscais de forma mais organizada, segura e estruturada.

O projeto também está sendo desenvolvido como uma oportunidade de aplicar, na prática, conceitos de desenvolvimento backend com Java e Spring Boot, incluindo autenticação, persistência de dados, arquitetura em camadas, APIs REST e boas práticas de organização de código.

---

## 💡 Problema

O controle das informações relacionadas às notas fiscais pode se tornar trabalhoso quando realizado manualmente, principalmente quando existe um volume significativo de documentos diariamente.

O GestorNF busca facilitar esse processo através da centralização das informações, permitindo:

- Organizar usuários e vendedores;
- Cadastrar e consultar notas fiscais;
- Associar notas fiscais aos vendedores;
- Centralizar informações em um banco de dados;
- Controlar o acesso à aplicação através de autenticação;
- Preparar a estrutura para geração de relatórios e cálculo de comissões.

---

## 🚀 Funcionalidades

### 👤 Usuários

Atualmente o sistema permite:

- ✅ Cadastro de usuários;
- ✅ Autenticação de usuários;
- ✅ Busca de usuário por e-mail;
- ✅ Exclusão de usuário por e-mail;
- ✅ Criptografia de senha;
- ✅ Autenticação utilizando JWT;
- ✅ Controle de acesso utilizando Spring Security.

### 👨‍💼 Vendedores

O sistema permite o gerenciamento de vendedores:

- ✅ Cadastro de vendedor;
- ✅ Consulta de vendedor;
- ✅ Edição de vendedor;
- ✅ Exclusão de vendedor.

Os vendedores fazem parte da estrutura de organização das notas fiscais, permitindo que posteriormente os documentos sejam relacionados aos respectivos responsáveis.

### 🧾 Notas fiscais

A funcionalidade de notas fiscais está em desenvolvimento.

A aplicação será responsável pelo gerenciamento de informações como:

- Número da nota fiscal;
- Empresa;
- Valor;
- Data;
- Vendedor relacionado.

Também está sendo considerada a necessidade de alterações ou cancelamentos de notas após o cadastro.

---

## 🔐 Segurança

A aplicação utiliza **Spring Security** juntamente com **JWT (JSON Web Token)** para autenticação e controle de acesso.

O fluxo de autenticação funciona de forma semelhante a:

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
Requisições autenticadas
