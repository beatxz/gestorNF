#  GestorNF

Sistema backend desenvolvido para gerenciamento e organização de **notas fiscais, vendedores e usuários**, com autenticação, controle de acesso e cálculo de valores mensais e comissões.

> 🚧 Projeto em desenvolvimento

---

##  Sobre o projeto

O **GestorNF** surgiu a partir de uma necessidade real de negócio: centralizar e organizar informações que anteriormente eram controladas manualmente.

A aplicação tem como objetivo facilitar o gerenciamento de usuários, vendedores e notas fiscais, permitindo maior organização dos dados e oferecendo recursos para acompanhamento das vendas e cálculo de comissões.

O projeto também representa uma oportunidade de aplicar, na prática, conceitos de desenvolvimento backend utilizando **Java e Spring Boot**, trabalhando com APIs REST, persistência de dados, autenticação, segurança e organização em camadas.

---

##  Objetivos

* Centralizar o gerenciamento de notas fiscais;
* Organizar vendedores e suas respectivas comissões;
* Permitir o cadastro e consulta de notas fiscais;
* Calcular o valor total de notas fiscais por mês;
* Calcular o valor de comissão mensal dos vendedores;
* Controlar o acesso à aplicação através de autenticação;
* Disponibilizar uma API documentada através do Swagger/OpenAPI.

---

##  Funcionalidades

###  Usuários

* ✅ Cadastro de usuário
* ✅ Login
* ✅ Busca de usuário
* ✅ Exclusão de usuário
* ✅ Criptografia de senha
* ✅ Autenticação utilizando JWT
* ✅ Controle de acesso com Spring Security

###  Vendedores

* ✅ Cadastro de vendedor
* ✅ Consulta de vendedor
* ✅ Exclusão de vendedor
* ✅ Alteração de comissão
* ✅ Cálculo de comissão mensal

###  Notas Fiscais

* ✅ Cadastro de nota fiscal
* ✅ Consulta de nota fiscal
* ✅ Exclusão de nota fiscal
* ✅ Associação da nota fiscal ao vendedor
* ✅ Consulta do valor total mensal
* ✅ Cálculo do valor total de comissão mensal

---

## 🔐 Segurança

A aplicação utiliza **Spring Security** e **JWT (JSON Web Token)** para autenticação e controle de acesso.

Fluxo de autenticação:

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
```

Os endpoints protegidos exigem autenticação através do token JWT.

---

##  Arquitetura

O projeto utiliza uma organização baseada em camadas, buscando manter as responsabilidades separadas:

```text
com.dev.gestorNF
│
├── business
│   ├── dto
│   │   ├── in
│   │   └── out
│   │
│   ├── mapper
│   ├── NotaFiscalService
│   ├── UsuarioService
│   └── VendedorService
│
├── controller
│   ├── NotaFiscalController
│   ├── UsuarioController
│   └── VendedorController
│
└── infrastructure
    ├── entity
    ├── repository
    ├── exception
    └── security
```

### Principais responsabilidades

**Controller**
Responsável pelos endpoints da API e comunicação com as requisições HTTP.

**Service**
Responsável pelas regras de negócio da aplicação.

**DTO**
Responsável por definir os dados de entrada e saída da API.

**Mapper / Converter**
Responsável pela conversão entre DTOs e entidades.

**Entity**
Representa as entidades persistidas no banco de dados.

**Repository**
Responsável pelo acesso aos dados utilizando Spring Data JPA.

**Security**
Responsável pela autenticação e autorização utilizando Spring Security e JWT.

---

## Tecnologias utilizadas

### Backend

* Java 21
* Spring Boot
* Spring MVC
* Spring Data JPA
* Hibernate
* Spring Security
* JWT
* PostgreSQL
* Gradle

### Documentação e testes

* Swagger / OpenAPI
* Postman

### Ferramentas

* IntelliJ IDEA
* Git
* GitHub

---

##  Documentação da API

A API possui documentação interativa utilizando **Swagger/OpenAPI**.

Com a aplicação em execução, a documentação pode ser acessada através de:

```text
http://localhost:8080/swagger-ui/index.html
```

A documentação permite visualizar e testar os endpoints disponíveis na aplicação.

---

##  Principais endpoints

### Usuário

| Método | Endpoint           | Descrição         |
| ------ | ------------------ | ----------------- |
| GET    | `/usuario`         | Buscar usuário    |
| POST   | `/usuario`         | Cadastrar usuário |
| POST   | `/usuario/login`   | Realizar login    |
| DELETE | `/usuario/{email}` | Deletar usuário   |

### Vendedor

| Método | Endpoint         | Descrição          |
| ------ | ---------------- | ------------------ |
| POST   | `/vendedor`      | Cadastrar vendedor |
| PATCH  | `/vendedor`      | Alterar comissão   |
| GET    | `/vendedor/{id}` | Buscar vendedor    |
| DELETE | `/vendedor/{id}` | Deletar vendedor   |

### Nota Fiscal

| Método | Endpoint                    | Descrição                 |
| ------ | --------------------------- | ------------------------- |
| GET    | `/notaFiscal`               | Buscar notas fiscais      |
| POST   | `/notaFiscal`               | Cadastrar nota fiscal     |
| DELETE | `/notaFiscal`               | Deletar nota fiscal       |
| GET    | `/notaFiscal/valorMensal`   | Consultar valor mensal    |
| GET    | `/notaFiscal/valorComissao` | Consultar comissão mensal |

---

##  Próximos passos

O projeto continua em desenvolvimento.

Entre as próximas etapas estão:

* [ ] Desenvolvimento do frontend
* [ ] Integração com a API
* [ ] Geração de relatórios
* [ ] Exportação de dados
* [ ] Melhorias na gestão de notas fiscais
* [ ] Novas funcionalidades para acompanhamento das vendas

---

##  Desenvolvimento

Projeto desenvolvido por **Beatriz** como projeto prático de desenvolvimento backend, com foco em Java, Spring Boot, APIs REST, segurança e persistência de dados.

---

⭐ Se este projeto foi útil ou interessante para você, fique à vontade para acompanhar sua evolução!
