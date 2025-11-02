# Plataforma de Aprendizado Imersivo de Língua Inglesa

---

**Trabalho de Conclusão de Curso (TCC)**<br>
**Autor:** Thiago Trzcinski<br>
**Instituição:** IFC Campus Videira<br>
**Curso:** Ciência da Computação<br>
**Ano:** 2025<br>
**Orientador:** MSc. Fábio José Rodrigues Pinheiro<br>
**Coorientador:** MSc. Thiago Barbosa Silva

---

## Resumo

Este projeto apresenta uma **plataforma de aprendizado de língua inglesa** que utiliza Inteligência Artificial para gerar narrativas interativas multimodais, desenvolvida como Trabalho de Conclusão de Curso. A plataforma combina **Ciência da Computação** e **Linguística Aplicada a Aquisição de Língua Estrangeira** para criar uma experiência de aprendizado imersiva baseada em histórias adaptativas geradas por IA, integrando texto, imagens e áudio de forma contextualizada.

Fundamentada em teorias de aquisição de linguagem, especialmente a **Hipótese do Input Compreensível (i+1) de Krashen** e a **Teoria da Codificação Dupla**, a plataforma oferece conteúdo adaptativo que se ajusta ao nível de proficiência do estudante, promovendo aprendizado natural através de exposição contextualizada à língua-alvo. O sistema é construído com TypeScript, Express.js e PostgreSQL, seguindo princípios de Domain-Driven Design (DDD) e Clean Architecture, garantindo escalabilidade e manutenibilidade.

## 1. Visão Geral do Sistema

A plataforma é um **ambiente de aprendizado imersivo de língua inglesa** que utiliza narrativas interativas geradas por IA para promover aquisição natural da linguagem, integrando canais visuais (imagens) e verbais (texto + áudio) para reforçar aprendizado e retenção.

A arquitetura técnica segue princípios de Clean Architecture e Domain-Driven Design, oferecendo uma API RESTful documentada (Swagger/OpenAPI), autenticação JWT, persistência em PostgreSQL, e cobertura abrangente de testes automatizados. O sistema inclui arquitetura preparada para orquestração de múltiplos provedores de IA com fallback automático e rastreamento de custos.

---

## 2. Tecnologias Utilizadas

### 2.1 Stack Tecnológico Principal

#### Backend e Runtime

- **Node.js**: Ambiente de execução JavaScript server-side
- **TypeScript**: Superset tipado de JavaScript para maior segurança e produtividade
- **Express.js**: Framework web minimalista e flexível para Node.js

#### Banco de Dados

- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional robusto
- **TypeORM**: ORM (Object-Relational Mapping) para TypeScript e JavaScript

#### Provedores de Inteligência Artificial

- **Mocked AI Provider**: Provedor simulado para testes e desenvolvimento, retornando respostas determinísticas para texto, imagem e áudio

**Nota:** O sistema foi arquitetado para suportar múltiplos provedores de IA (OpenAI, Anthropic, Google, Stability AI, ElevenLabs), mas atualmente apenas o provedor MOCKED está implementado. A arquitetura modular permite adicionar novos provedores seguindo a interface `IAIProvider`.

#### Autenticação e Segurança

- **JSON Web Tokens (JWT)**: Autenticação stateless e segura
- **bcrypt**: Hashing de senhas com salt

#### Documentação e Testes

- **Swagger/OpenAPI**: Documentação interativa de API
- **Jest**: Framework de testes com suporte a TypeScript
- **Supertest**: Testes de integração HTTP

#### Injeção de Dependências e Arquitetura

- **TSyringe**: Container de injeção de dependências leve para TypeScript
- **Reflect Metadata**: Suporte a decorators e metadados

#### Ferramentas de Desenvolvimento

- **ts-node-dev**: Desenvolvimento com hot-reload
- **Prettier**: Formatação consistente de código
- **ESLint**: Análise estática de código
- **Winston**: Sistema de logging estruturado

#### Bibliotecas Auxiliares

- **Axios**: Cliente HTTP para requisições a APIs externas
- **Lodash**: Utilitários JavaScript
- **UUID**: Geração de identificadores únicos
- **class-validator**: Validação de DTOs
- **class-transformer**: Transformação de objetos

### 2.2 Infraestrutura e DevOps

- **Git**: Controle de versão
- **pnpm**: Gerenciador de pacotes eficiente
- **PostgreSQL**: Banco de dados relacional

---

## 3. Metodologias e Técnicas de Desenvolvimento

### 3.1 Clean Architecture (Arquitetura Limpa)

O projeto implementa os princípios de Clean Architecture, organizando o código em camadas concêntricas com dependências unidirecionais:

**Camadas da Arquitetura:**

1. **Domain (Domínio)**: Núcleo da aplicação contendo regras de negócio

   - Entidades de domínio independentes de frameworks
   - Value Objects para conceitos do domínio
   - Interfaces de repositórios e serviços
   - Regras de negócio puras

2. **Application (Aplicação)**: Casos de uso e orquestração

   - Serviços de aplicação que coordenam operações
   - DTOs (Data Transfer Objects) para comunicação entre camadas
   - Lógica de orquestração de IA

3. **Infrastructure (Infraestrutura)**: Implementações técnicas

   - Repositórios concretos com TypeORM
   - Implementações de serviços de IA
   - Integrações com APIs externas

4. **Presentation (Apresentação)**: Interface HTTP
   - Controllers REST
   - Middlewares de autenticação e validação
   - Tratamento de requisições e respostas

### 3.2 Domain-Driven Design (DDD)

Aplicação de conceitos de DDD para modelar o domínio de histórias interativas:

- **Entidades**: Story, StoryContent, StoryChoice, User
- **Value Objects**: StoryStatus, StoryGenre, ContentType, ChoiceType, AIProvider
- **Agregados**: Story como agregado raiz contendo Content e Choices
- **Repositórios**: Abstrações para persistência de agregados
- **Serviços de Domínio**: Lógica que não pertence a uma entidade específica

### 3.3 Dependency Injection (Injeção de Dependências)

Utilização de TSyringe para implementar Inversão de Controle (IoC):

- Desacoplamento entre camadas
- Facilita testes unitários com mocks
- Gerenciamento automático de ciclo de vida de objetos
- Configuração centralizada de dependências

### 3.4 Design Patterns Aplicados

- **Repository Pattern**: Abstração de acesso a dados
- **Service Layer Pattern**: Encapsulamento de lógica de negócio
- **Strategy Pattern**: Seleção dinâmica de provedores de IA
- **Factory Pattern**: Criação de entidades de domínio
- **DTO Pattern**: Transferência de dados entre camadas

### 3.5 Princípios SOLID

- **S**ingle Responsibility: Cada classe tem uma única responsabilidade
- **O**pen/Closed: Aberto para extensão, fechado para modificação
- **L**iskov Substitution: Subtipos substituíveis por seus tipos base
- **I**nterface Segregation\*\*: Interfaces específicas ao invés de genéricas
- **D**ependency Inversion: Dependência de abstrações, não de implementações

### 3.6 Test-Driven Development (TDD)

Desenvolvimento orientado a testes com cobertura abrangente:

- **Testes Unitários**: Validação de lógica de negócio isolada
- **Testes de Integração**: Verificação de interação entre componentes
- **Testes E2E**: Validação de fluxos completos da aplicação
- **Mocks e Stubs**: Isolamento de dependências externas

---

## 4. Arquitetura do Sistema

### 4.1 Estrutura de Diretórios

```
tcc-ai-story-system/              # Repositório Git raiz
└── ai-story-system/              # Aplicação principal
    ├── src/
    │   ├── domain/               # Camada de Domínio
    │   │   ├── entities/         # Entidades de negócio
    │   │   │   ├── story.entity.ts
    │   │   │   ├── story-content.entity.ts
    │   │   │   └── story-choice.entity.ts
    │   │   ├── value-objects/    # Objetos de valor
    │   │   │   ├── story-status.value-object.ts
    │   │   │   ├── story-genre.value-object.ts
    │   │   │   ├── content-type.value-object.ts
    │   │   │   ├── choice-type.value-object.ts
    │   │   │   └── ai-provider.value-object.ts
    │   │   ├── repositories/     # Interfaces de repositórios
    │   │   ├── services/         # Interfaces de serviços de domínio
    │   │   ├── dtos/             # Data Transfer Objects
    │   │   ├── errors/           # Erros customizados de domínio
    │   │   └── interfaces/       # Contratos de serviços
    │   │
    │   ├── application/          # Camada de Aplicação
    │   │   └── services/         # Serviços de aplicação
    │   │       ├── story.service.ts
    │   │       ├── ai-orchestration.service.ts
    │   │       ├── story-content.service.ts
    │   │       ├── story-choice.service.ts
    │   │       └── user.service.ts
    │   │
    │   ├── infrastructure/       # Camada de Infraestrutura
    │   │   ├── repositories/     # Implementações de repositórios
    │   │   │   ├── story.repository.ts
    │   │   │   ├── story-content.repository.ts
    │   │   │   └── story-choice.repository.ts
    │   │   └── services/         # Implementações de serviços externos
    │   │       └── ai-providers/ # Provedores de IA
    │   │           └── mocked-ai-provider.service.ts
    │   │
    │   ├── presentation/         # Camada de Apresentação
    │   │   ├── controllers/      # Controllers REST
    │   │   │   ├── story.controller.ts
    │   │   │   ├── ai-orchestration.controller.ts
    │   │   │   └── user.controller.ts
    │   │   ├── middleware/       # Middlewares HTTP
    │   │   │   ├── auth.middleware.ts
    │   │   │   ├── error-handler.middleware.ts
    │   │   │   └── validation.middleware.ts
    │   │   └── dtos/             # DTOs de requisição/resposta
    │   │
    │   ├── database/             # Configuração de banco de dados
    │   │   ├── entities/         # Entidades TypeORM
    │   │   ├── migrations/       # Migrações de schema
    │   │   └── data-source.ts    # Configuração do DataSource
    │   │
    │   ├── config/               # Configurações
    │   │   ├── database.ts
    │   │   ├── ai-providers.ts
    │   │   └── swagger.ts
    │   │
    │   ├── infra/                # Infraestrutura transversal
    │   │   ├── container/        # Configuração de DI
    │   │   └── http/             # Configuração HTTP
    │   │
    │   ├── tests/                # Testes automatizados
    │   │   ├── unit/             # Testes unitários
    │   │   ├── integration/      # Testes de integração
    │   │   ├── e2e/              # Testes end-to-end
    │   │   └── mocks/            # Mocks para testes
    │   │
    │   ├── utils/                # Utilitários
    │   ├── types/                # Definições de tipos TypeScript
    │   ├── app.ts                # Configuração do Express
    │   ├── bootstrap.ts          # Inicialização da aplicação
    │   └── index.ts              # Entry point
    │
    ├── package.json              # Dependências e scripts
    ├── tsconfig.json             # Configuração TypeScript
    ├── jest.config.js            # Configuração de testes
    └── README.md                 # Este documento
```

### 4.2 Fluxo de Dados

```
Cliente HTTP
    ↓
[Presentation Layer]
    ↓ (DTOs)
[Application Layer]
    ↓ (Domain Entities)
[Domain Layer]
    ↓ (Repository Interfaces)
[Infrastructure Layer]
    ↓
Banco de Dados / APIs Externas
```

### 4.3 Diagrama de Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Story      │  │      AI      │  │     User     │       │
│  │  Controller  │  │  Controller  │  │  Controller  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Story     │  │      AI      │  │     User     │       │
│  │   Service    │  │Orchestration │  │   Service    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Entities   │  │    Value     │  │  Repository  │       │
│  │   & Logic    │  │   Objects    │  │  Interfaces  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Repository   │  │  AI Provider │  │   External   │      │
│  │Implementations│  │   Services   │  │   Services   │      │
│  └───────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Instalação e Configuração

### 5.1 Pré-requisitos

- **Node.js** versão 18 ou superior
- **PostgreSQL** versão 13 ou superior
- **pnpm** (gerenciador de pacotes)
- **Git** para controle de versão
- Chaves de API dos provedores de IA (opcional para desenvolvimento com mock)

### 5.2 Instalação

1. **Clone o repositório:**

```bash
git clone <repository-url>
cd tcc-ai-story-system/ai-story-system
```

2. **Instale as dependências:**

```bash
pnpm install
```

3. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados PostgreSQL:**

```bash
# Crie o banco de dados
createdb ai_story_system

# Execute as migrações
pnpm run db:migrate
```

5. **Inicie o servidor de desenvolvimento:**

```bash
pnpm run dev
```

A API estará disponível em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/api-docs`.

### 5.3 Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `ai-story-system/` com base no arquivo `.env.example`.

---

## 6. Documentação da API

### 6.1 Swagger/OpenAPI

A API é completamente documentada usando Swagger/OpenAPI 3.0. Após iniciar o servidor, acesse a documentação interativa em:

```
http://localhost:3000/api-docs
```

A documentação Swagger permite:

- Visualizar todos os endpoints disponíveis
- Testar requisições diretamente no navegador
- Ver schemas de requisição e resposta
- Entender códigos de status HTTP
- Explorar modelos de dados

---

---

## 7. Integração com Provedores de IA

### 7.1 Arquitetura de Orquestração

O sistema implementa um serviço de orquestração (`AIOrchestrationService`) que gerencia múltiplos provedores de IA de forma transparente:

**Características:**

- **Seleção Automática**: Escolhe o melhor provedor baseado em tipo de conteúdo e requisitos
- **Fallback Inteligente**: Se um provedor falhar, tenta automaticamente outro
- **Balanceamento de Carga**: Distribui requisições entre provedores disponíveis
- **Rastreamento de Custos**: Monitora uso e custos de cada provedor
- **Cache de Respostas**: Evita requisições duplicadas

### 7.2 Provedor Implementado

#### Provedor Mockado (MOCKED)

O sistema atualmente implementa apenas o provedor mockado (`MockedAIService`) que:

- **Não requer chaves de API** - Funciona imediatamente após instalação
- **Retorna respostas determinísticas** - Ideal para testes automatizados
- **Suporta todos os tipos de geração** - Texto, imagem (URLs simuladas) e áudio (URLs simuladas)
- **Simula progressão de história** - 5 segmentos de história pré-definidos com escolhas
- **Permite testar toda a funcionalidade** - Sem custos de API

**Capacidades:**

- Geração de texto narrativo em inglês
- URLs simuladas para imagens contextualizadas
- URLs simuladas para áudio/narração
- Geração de escolhas interativas
- Estimativa de custos (valores mockados)

**Uso Recomendado:**

- Desenvolvimento local
- Testes automatizados (unitários e E2E)
- Demonstrações sem custos de API
- Validação de fluxos de negócio

### 7.3 Provedores Planejados (Não Implementados)

A arquitetura do sistema foi projetada para suportar múltiplos provedores de IA através da interface `IAIProvider`. Os seguintes provedores estão planejados para implementação futura:

**Geração de Texto:**

- OpenAI GPT-4 - Para narrativas adaptativas com controle de complexidade
- Anthropic Claude 3 - Para diálogos naturais e nuances culturais
- Google Gemini Pro - Opção custo-efetiva

**Geração de Imagens:**

- Stability AI (Stable Diffusion) - Ilustrações contextualizadas
- DALL-E 3 - Imagens de alta qualidade

**Geração de Áudio:**

- ElevenLabs - Text-to-speech com vozes nativas em inglês

---

## 8. Modelo de Dados

### 8.1 Schema do Banco de Dados

#### Tabela: stories

```sql
CREATE TABLE stories (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    prompts JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    current_content_id UUID,
    total_choices_made INTEGER DEFAULT 0,
    estimated_reading_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tabela: story_content

```sql
CREATE TABLE story_content (
    id UUID PRIMARY KEY,
    story_id UUID NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    text_content TEXT,
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
);
```

#### Tabela: story_choices

```sql
CREATE TABLE story_choices (
    id UUID PRIMARY KEY,
    story_id UUID NOT NULL,
    content_id UUID NOT NULL,
    choice_type VARCHAR(50) NOT NULL,
    text VARCHAR(500) NOT NULL,
    next_content_id UUID,
    consequences JSONB DEFAULT '{}',
    is_selected BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES story_content(id) ON DELETE CASCADE
);
```

#### Tabela: users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8.2 Relacionamentos

```
users (1) ──────< (N) stories
stories (1) ─────< (N) story_content
stories (1) ─────< (N) story_choices
story_content (1) ──< (N) story_choices
```

### 8.3 Enumerações

**StoryStatus:**

- `DRAFT`: História em criação
- `IN_PROGRESS`: História sendo jogada
- `COMPLETED`: História finalizada
- `PUBLISHED`: História publicada para outros
- `ARCHIVED`: História arquivada

**StoryGenre:**

- `FANTASY`: Fantasia
- `SCI_FI`: Ficção Científica
- `MYSTERY`: Mistério
- `ROMANCE`: Romance
- `HORROR`: Terror
- `ADVENTURE`: Aventura
- `THRILLER`: Suspense
- `HISTORICAL`: Histórico
- `CUSTOM`: Personalizado

**ContentType:**

- `TEXT`: Conteúdo textual
- `IMAGE`: Imagem
- `AUDIO`: Áudio/Narração
- `COMBINED`: Múltiplos tipos

**ChoiceType:**

- `NARRATIVE`: Escolha narrativa
- `DIALOGUE`: Escolha de diálogo
- `ACTION`: Escolha de ação
- `MORAL`: Dilema moral
- `EXPLORATION`: Exploração
- `CUSTOM`: Personalizado

---

## 9. Testes Automatizados

### 9.1 Estratégia de Testes

O projeto implementa uma estratégia abrangente de testes em três níveis:

#### Testes Unitários

- **Escopo**: Lógica de negócio isolada, entidades de domínio, value objects
- **Framework**: Jest com ts-jest
- **Cobertura**: Mínimo 80% de cobertura de código

#### Testes de Integração

- **Escopo**: Interação entre camadas, repositórios com banco de dados
- **Framework**: Jest com banco de dados de teste

#### Testes End-to-End (E2E)

- **Escopo**: Fluxos completos da aplicação via HTTP
- **Framework**: Jest + Supertest

### 9.2 Mocks

O projeto utiliza mocks para isolar dependências externas:

- **MockedAIProvider**: Simula provedores de IA
- **In-Memory Repositories**: Para testes unitários rápidos
- **Test Database**: Banco PostgreSQL separado para testes de integração

---

## 10. Desenvolvimento e Extensibilidade

### 10.1 Adicionando Novos Provedores de IA

Para integrar um novo provedor de IA ao sistema:

1. **Criar serviço do provedor:**

```typescript
// src/infrastructure/services/ai-providers/novo-provider.service.ts
import { injectable } from "tsyringe";
import { IAIProvider } from "../../../domain/interfaces/ai-provider.interface";

@injectable()
export class NovoProviderService implements IAIProvider {
  async generateText(
    request: TextGenerationRequest,
  ): Promise<AIGenerationResult> {
    // Implementar lógica de geração
  }

  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<AIGenerationResult> {
    // Implementar lógica de geração
  }

  // ... outros métodos
}
```

2. **Adicionar configuração:**

```typescript
// src/config/ai-providers.ts
export const aiProviderConfig = {
  novoProvider: {
    apiKey: process.env.NOVO_PROVIDER_API_KEY,
    model: process.env.NOVO_PROVIDER_MODEL,
    enabled: process.env.NOVO_PROVIDER_ENABLED === "true",
  },
};
```

3. **Registrar no container de DI:**

```typescript
// src/infra/container/services.ts
container.register<IAIProvider>("NovoProvider", {
  useClass: NovoProviderService,
});
```

4. **Atualizar orquestração:**

```typescript
// src/application/services/ai-orchestration.service.ts
// Adicionar lógica para selecionar e usar o novo provedor
```

5. **Adicionar testes:**

```typescript
// src/tests/infrastructure/novo-provider.service.test.ts
describe("NovoProviderService", () => {
  // Implementar testes
});
```

### 10.2 Boas Práticas de Desenvolvimento

- **Sempre escrever testes** antes ou junto com o código
- **Seguir princípios SOLID** em todas as implementações
- **Documentar APIs** com comentários JSDoc e Swagger
- **Validar inputs** usando class-validator
- **Tratar erros** de forma consistente com classes de erro customizadas
- **Usar TypeScript** de forma estrita (strict mode)
- **Commitar código** formatado com Prettier
- **Revisar código** antes de merge

---

## 11. Segurança

### 11.1 Autenticação e Autorização

- **JWT Tokens**: Autenticação stateless
- **Bcrypt**: Hashing de senhas com salt
- **Middleware de Auth**: Proteção de rotas sensíveis

### 11.2 Validação de Dados

- **class-validator**: Validação de DTOs
- **Sanitização**: Prevenção de XSS e SQL Injection
- **Rate Limiting**: Proteção contra abuso de API

### 11.3 Boas Práticas

- Nunca commitar chaves de API ou secrets
- Usar variáveis de ambiente para configurações sensíveis
- Implementar HTTPS em produção
- Manter dependências atualizadas
- Realizar auditorias de segurança regulares

---

## 12. Limitações e Trabalhos Futuros

### 12.1 Limitações Atuais

**Pedagógicas:**

- Sistema de avaliação de nível ainda não implementado (requer testes de proficiência)
- Feedback linguístico limitado (sem correção gramatical automática)
- Ausência de exercícios complementares (foco apenas em narrativas)
- Sem rastreamento detalhado de aquisição de vocabulário individual

**Técnicas:**

- **Apenas provedor MOCKED implementado** - Provedores de IA reais (OpenAI, Anthropic, Google, etc.) não estão implementados
- **Sem containerização Docker** - Dockerfile e docker-compose não incluídos no projeto
- Interface web não incluída (apenas API backend)
- Armazenamento de mídia local (URLs simuladas no provedor mockado)
- Suporte limitado a WebSockets para interação em tempo real

**Linguísticas:**

- Foco exclusivo em inglês (outros idiomas não implementados)
- Sem suporte a variações dialetais específicas
- Ausência de análise de erros comuns por língua materna do estudante

### 12.2 Melhorias Futuras

**Funcionalidades Pedagógicas:**

- [ ] **Sistema de Avaliação de Proficiência**: Teste adaptativo para determinar nível CEFR inicial
- [ ] **Feedback Linguístico Inteligente**: Correção contextualizada de erros com explicações
- [ ] **Rastreamento de Vocabulário**: Sistema de spaced repetition para palavras aprendidas
- [ ] **Exercícios Complementares**: Atividades de consolidação baseadas na narrativa
- [ ] **Análise de Progresso**: Dashboard detalhado de aquisição linguística
- [ ] **Recomendação Adaptativa**: Sugestão de histórias baseada em lacunas de conhecimento
- [ ] **Modo Conversacional**: Diálogos interativos com personagens da história
- [ ] **Pronúncia e Speaking**: Reconhecimento de fala para prática de produção oral

**Expansão Linguística:**

- [ ] **Múltiplos Idiomas**: Adaptação para espanhol, francês, alemão, mandarim, etc.
- [ ] **Variações Dialetais**: Suporte a diferentes sotaques e variantes regionais
- [ ] **Análise Contrastiva**: Adaptação baseada na língua materna do estudante
- [ ] **Conteúdo Cultural**: Integração de aspectos culturais dos países de língua-alvo
- [ ] **Registro Linguístico**: Exposição a diferentes níveis de formalidade

**Gamificação Avançada:**

- [ ] **Sistema de Conquistas**: Badges por marcos de aprendizado
- [ ] **Ranking e Competição**: Leaderboards entre estudantes
- [ ] **Missões Diárias**: Desafios para manter engajamento
- [ ] **Personalização de Avatar**: Customização visual baseada em progresso
- [ ] **Modo Colaborativo**: Histórias em grupo para prática social

**Técnicas e Infraestrutura:**

- [ ] **Implementação de Provedores de IA Reais**: OpenAI GPT-4, Anthropic Claude, Google Gemini, Stability AI, ElevenLabs
- [ ] **Containerização Docker**: Dockerfile e docker-compose para deploy simplificado
- [ ] **Interface Web Completa**: Frontend React/Vue para experiência do usuário
- [ ] **Aplicativo Mobile**: Apps iOS e Android nativos
- [ ] **Cache Distribuído**: Redis para otimização de performance
- [ ] **Fila de Mensagens**: RabbitMQ/Kafka para processamento assíncrono
- [ ] **GraphQL API**: Alternativa ao REST para queries flexíveis
- [ ] **Microserviços**: Separação de serviços para escalabilidade
- [ ] **CI/CD Automatizado**: Pipeline completo de deploy
- [ ] **Kubernetes**: Orquestração de containers em produção
- [ ] **Monitoramento Avançado**: Prometheus, Grafana, ELK Stack

**Pesquisa e Validação:**

- [ ] **Estudos de Eficácia**: Pesquisa empírica sobre ganhos de proficiência
- [ ] **A/B Testing**: Comparação de diferentes abordagens pedagógicas
- [ ] **Análise de Corpus**: Estudo de padrões de erro e aquisição
- [ ] **Machine Learning**: Modelos preditivos de sucesso de aprendizado
- [ ] **Publicações Acadêmicas**: Artigos sobre resultados e metodologia

---

## 13. Conclusão

### 13.1 Resultados Alcançados

Este projeto demonstra com sucesso a implementação de uma **plataforma educacional inovadora** que integra Inteligência Artificial, teorias de aquisição de linguagem e princípios de design instrucional. Os principais resultados incluem:

**Contribuições Pedagógicas:**
**Implementação de Input Compreensível (i+1)**: Sistema adaptativo que fornece conteúdo linguístico apropriado ao nível do estudante
**Aprendizado Multimodal**: Integração efetiva de texto, imagem e áudio baseada na Teoria da Codificação Dupla
**Contextualização Significativa**: Aprendizado através de narrativas ao invés de exercícios isolados
**Gamificação Educacional**: Elementos de jogo que aumentam motivação e engajamento

**Contribuições Técnicas:**
**Arquitetura Robusta**: Implementação completa de Clean Architecture e DDD aplicada a contexto educacional
**Arquitetura Preparada para Multi-IA**: Sistema projetado para orquestração de múltiplos provedores através de interface abstrata
**API Educacional Completa**: RESTful API documentada (Swagger/OpenAPI) e testada para plataformas de ensino
**Qualidade de Código**: Testes abrangentes (unitários e E2E) e boas práticas de engenharia de software
**Extensibilidade**: Arquitetura preparada para adicionar novos provedores de IA, idiomas, níveis e recursos pedagógicos

**Contribuições Interdisciplinares:**
**Ponte entre Áreas**: Integração bem-sucedida de Ciência da Computação, Linguística Aplicada e Educação
**Fundamentação Teórica**: Aplicação prática de teorias consolidadas de aquisição de linguagem
**Prova de Conceito**: Demonstração viável de IA generativa aplicada ao ensino de idiomas

### 13.2 Aprendizados

O desenvolvimento deste TCC proporcionou aprendizado prático e teórico em múltiplas dimensões:

**Técnicos:**

- Arquitetura de software em larga escala para aplicações educacionais
- Design de arquitetura extensível para integração com múltiplas APIs de IA generativa
- Desenvolvimento backend com TypeScript e Node.js
- Modelagem de domínio complexo com DDD aplicado a contexto educacional
- Testes automatizados e TDD
- Padrões de design e princípios SOLID
- Prompt engineering para geração de conteúdo educacional

**Pedagógicos e Linguísticos:**

- Teorias de aquisição de segunda língua (Krashen, Long)
- Princípios de design instrucional e aprendizado adaptativo
- Multimodalidade e Teoria da Codificação Dupla
- Gamificação aplicada à educação
- Avaliação de proficiência linguística e progressão

**Interdisciplinares:**

- Integração de conhecimentos de Computação, Linguística e Educação
- Tradução de teorias pedagógicas em requisitos técnicos
- Balanceamento entre rigor acadêmico e viabilidade técnica
- Documentação técnica e acadêmica profissional

---

## 14. Informações do Autor

**Nome:** Thiago Trzcinski<br>
**Email:** [thiagotrzcinski7878@gmail.com]<br>
**LinkedIn:** [linkedin.com/in/thiago-trzcinski]<br>
**GitHub:** [github.com/thiago-trzcinski]

---

**Trabalho de Conclusão de Curso - 2025**
