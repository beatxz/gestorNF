# GestorNF — Sistema de Gestão de Notas Fiscais

O **GestorNF** é uma aplicação Full Stack desenvolvida para auxiliar vendedores e pequenas empresas no controle de **notas fiscais, clientes, vendedores, comissões e resultados mensais**.

O projeto surgiu a partir de uma necessidade real: organizar o fluxo diário de notas fiscais de uma empresa do ramo de pneus, centralizando informações que antes precisavam ser acompanhadas manualmente.

A aplicação permite registrar vendas, organizar clientes por vendedor, calcular automaticamente diferentes percentuais de comissão, acompanhar resultados mensais e gerar relatórios em PDF.

O GestorNF está atualmente em sua primeira versão funcional, destinada a uso controlado e validação em ambiente real.

---

## Funcionalidades

### Autenticação e usuários

- Cadastro de usuários.
- Login utilizando JWT.
- Verificação de e-mail antes do primeiro acesso.
- Recuperação e redefinição de senha.
- Proteção de rotas autenticadas.
- Configuração da comissão total da empresa.

### Gestão de vendedores

- Cadastro de vendedores.
- Listagem dos vendedores vinculados ao usuário.
- Busca de vendedores por nome.
- Configuração individual da comissão de cada vendedor.
- Validação da comissão do vendedor em relação à comissão total da empresa.
- Exclusão de vendedores sem histórico de notas fiscais.
- Proteção contra exclusão de vendedores que possuem notas vinculadas.

### Gestão de clientes

- Cadastro de clientes.
- Associação de clientes a vendedores.
- Código de identificação do cliente.
- Edição de clientes.
- Ativação e desativação de clientes.
- Validação de código de cliente por vendedor.
- Consulta dos clientes vinculados a cada vendedor.

### Gestão de notas fiscais

- Cadastro de notas fiscais.
- Associação da nota fiscal ao vendedor responsável.
- Associação da nota ao código do cliente.
- Identificação automática da empresa através do cliente.
- Consulta das notas cadastradas.
- Busca global de nota fiscal pelo número.
- Busca de notas pelo código do cliente.
- Filtro de notas por mês e ano.
- Exclusão de notas fiscais.
- Validação para impedir notas fiscais duplicadas.

### Controle de comissões

O sistema permite configurar uma **comissão total da empresa** e uma comissão específica para cada vendedor.

A partir dessas informações, o GestorNF calcula automaticamente:

- Valor total vendido pelo vendedor.
- Comissão do vendedor.
- Percentual restante da comissão da empresa.
- Valor correspondente à comissão do usuário.

### Resultado Geral

A área de Resultado Geral consolida as informações de todos os vendedores no mês selecionado.

São apresentados:

- Total de vendas no mês.
- Total das comissões dos vendedores.
- Comissão do usuário.
- Resultado individual de cada vendedor.
- Percentual de comissão de cada vendedor.
- Participação do usuário em cada venda.

### Relatórios em PDF

O GestorNF permite gerar relatórios em PDF contendo informações das vendas e comissões.

Os relatórios incluem:

- Notas fiscais do período.
- Código do cliente.
- Cliente/empresa.
- Valores das vendas.
- Informações do vendedor.
- Comissões calculadas.
- Resultado geral mensal.

---

## Interface

O frontend foi desenvolvido em **React**, com interface responsiva para desktop, tablet e dispositivos móveis.

O painel principal possui:

- Menu lateral de vendedores.
- Busca integrada por vendedor ou número da nota fiscal.
- Seleção de mês/ano.
- Cards financeiros.
- Tabela de notas fiscais.
- Busca por código do cliente.
- Gerenciamento de clientes.
- Resultado Geral.
- Configurações de comissão.
- Exportação de relatórios.

Em dispositivos menores, o menu lateral utiliza navegação retrátil para preservar o espaço disponível para o conteúdo.

---

## Tecnologias utilizadas

### Backend

- Java 21
- Spring Boot 4
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- PostgreSQL
- Thymeleaf
- Resend
- Swagger / OpenAPI
- Gradle

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Banco de dados

- PostgreSQL
- Supabase

### Infraestrutura

- Vercel — frontend
- Render — backend
- Supabase — banco de dados
- Resend — envio de e-mails

### Ferramentas

- Docker
- Git
- GitHub
- Postman
- IntelliJ IDEA
- VS Code

---

## Arquitetura

```text
Frontend
React + Vite
     │
     │ HTTP / REST
     ▼
Backend
Spring Boot
     │
     ├──────────► Resend
     │             │
     │             └── E-mails de autenticação
     │
     ▼
PostgreSQL
Supabase
```

A comunicação entre frontend e backend é realizada através de uma **API REST**.

O backend concentra as regras de negócio, autenticação, validações, cálculos de comissão, persistência dos dados e geração dos relatórios.

---

## Segurança

O GestorNF utiliza autenticação baseada em **JWT (JSON Web Token)**.

Fluxo principal:

1. O usuário cria uma conta.
2. O sistema envia um e-mail de verificação.
3. O usuário confirma seu endereço de e-mail.
4. Após a confirmação, o login é liberado.
5. O backend gera um token JWT.
6. O frontend utiliza o token Bearer para acessar os recursos protegidos.

Os dados de vendedores, clientes e notas fiscais são associados ao usuário autenticado.

Credenciais, chaves de API e dados de conexão são configurados através de **variáveis de ambiente** e não são armazenados diretamente no código-fonte.

---

## Documentação da API

O backend utiliza **Swagger/OpenAPI** para documentação e testes dos endpoints durante o desenvolvimento.

A API possui recursos para:

- Usuários e autenticação.
- Vendedores.
- Clientes.
- Notas fiscais.
- Comissões.
- Resultados mensais.
- Geração de relatórios em PDF.

O endereço da documentação não é divulgado publicamente nesta fase do projeto.

---

## Executando localmente

### 1. Clone o projeto

```bash
git clone https://github.com/beatxz/gestorNF.git
cd gestorNF
```

### 2. Configure o backend

Configure as variáveis de ambiente necessárias para banco de dados, autenticação e serviço de e-mail.

Exemplo:

```properties
DB_URL=
DB_USERNAME=
DB_PASSWORD=

RESEND_API_KEY=
EMAIL_REMETENTE=

BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173
```

Nunca envie arquivos contendo credenciais reais para o repositório.

### 3. Execute o backend

```bash
./gradlew bootRun
```

### 4. Execute o frontend

```bash
cd frontend
npm install
npm run dev
```

Configure também a URL da API utilizada pelo frontend através da variável de ambiente correspondente.

---

## Docker

O backend possui configuração para execução em container Docker.

### Construir a imagem

```bash
docker build -t gestornf-api .
```

### Executar

```bash
docker run --env-file .env.properties -p 8080:8080 gestornf-api
```

Arquivos contendo variáveis de ambiente e credenciais não devem ser versionados.

---

## Próximas evoluções

Algumas funcionalidades consideradas para versões futuras:

- Importação automática de múltiplas notas fiscais.
- Dashboard com gráficos e evolução mensal.
- Metas mensais de vendas.
- Ranking de vendedores.
- Análise dos principais clientes.
- Sistema de convites.
- Perfis e níveis de acesso.
- Área administrativa.
- Evolução do sistema para diferentes planos de utilização.

---

## Desenvolvido por

**Beatriz Rodrigues**

Projeto Full Stack desenvolvido a partir de uma necessidade real, aplicando conhecimentos de desenvolvimento backend com **Java e Spring Boot**, frontend com **React**, banco de dados PostgreSQL, autenticação, segurança, integração com serviços externos, geração de relatórios e deploy em ambiente de produção.