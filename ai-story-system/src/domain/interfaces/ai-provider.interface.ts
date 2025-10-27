import { AIProvider } from '../value-objects/ai-provider.value-object';

/**
 * # 🤖 GUIA COMPLETO DE INTEGRAÇÃO DE PROVEDORES DE IA
 *
 * ## 📋 Visão Geral
 *
 * Este sistema utiliza uma arquitetura de abstração para integração com diferentes provedores de IA,
 * permitindo adicionar novos serviços de forma modular e consistente. O sistema atualmente suporta
 * apenas o provider MOCKED para testes, mas foi projetado para facilitar a adição de novos providers.
 *
 * ## 🏗️ Arquitetura do Sistema
 *
 * ### Componentes Principais:
 *
 * 1. **IAIProvider Interface** - Contrato padrão que todos os providers devem implementar
 * 2. **AIOrchestrationService** - Serviço central que roteia requisições para providers específicos
 * 3. **AIProvider Value Object** - Enum que define os tipos de providers disponíveis
 * 4. **Container DI** - Sistema de injeção de dependência para registro de providers
 * 5. **Configuração** - Sistema centralizado de configuração por provider
 *
 * ### Fluxo de Execução:
 *
 * ```
 * Controller → AIOrchestrationService → Provider Específico → API Externa
 *     ↑              ↑                        ↑                    ↑
 *   Request      Roteamento              Implementação        Resposta
 * ```
 *
 * ## 🚀 Como Adicionar um Novo Provider
 *
 * ### Passo 1: Adicionar ao Enum AIProvider
 *
 * Edite `src/domain/value-objects/ai-provider.value-object.ts`:
 *
 * ```typescript
 * export enum AIProvider {
 *   MOCKED = 'mocked',
 *   OPENAI = 'openai',        // ← Adicione aqui
 *   ANTHROPIC = 'anthropic',  // ← Ou aqui
 * }
 * ```
 *
 * Atualize também os métodos:
 * - `getDisplayName()`
 * - `getDescription()`
 * - `getModels()`
 * - `getDefaultModel()`
 * - `supportsStreaming()`
 *
 * ### Passo 2: Criar o Serviço do Provider
 *
 * Crie `src/infrastructure/services/ai-providers/[provider]-ai.service.ts`:
 *
 * ```typescript
 * import { injectable } from 'tsyringe';
 * import { IAIProvider } from '../../../domain/interfaces/ai-provider.interface';
 * import { AIProvider } from '../../../domain/value-objects/ai-provider.value-object';
 *
 * @injectable()
 * export class OpenAIService implements IAIProvider {
 *
 *   getProvider(): AIProvider {
 *     return AIProvider.OPENAI;
 *   }
 *
 *   async generateText(prompt: string, options?: any): Promise<string> {
 *     // Implementar chamada para API do OpenAI
 *     const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *       method: 'POST',
 *       headers: {
 *         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
 *         'Content-Type': 'application/json',
 *       },
 *       body: JSON.stringify({
 *         model: options?.model || 'gpt-4',
 *         messages: [{ role: 'user', content: prompt }],
 *         max_tokens: options?.maxTokens || 1000,
 *         temperature: options?.temperature || 0.7,
 *       }),
 *     });
 *
 *     const data = await response.json();
 *     return data.choices[0].message.content;
 *   }
 *
 *   async generateImage(prompt: string, options?: any): Promise<string> {
 *     // Implementar geração de imagem
 *   }
 *
 *   async generateAudio(prompt: string, options?: any): Promise<string> {
 *     // Implementar geração de áudio
 *   }
 *
 *   // ... implementar outros métodos obrigatórios
 * }
 * ```
 *
 * ### Passo 3: Registrar no Container DI
 *
 * Edite `src/infra/container/infrastructure.ts`:
 *
 * ```typescript
 * import { OpenAIService } from '../../infrastructure/services/ai-providers/openai-ai.service';
 *
 * // Registrar o serviço
 * container.register('OpenAIService', { useClass: OpenAIService });
 * ```
 *
 * ### Passo 4: Adicionar Configuração
 *
 * Edite `src/config/ai-providers.ts`:
 *
 * ```typescript
 * const providerConfigs = {
 *   [AIProvider.OPENAI]: {
 *     apiKey: process.env.OPENAI_API_KEY || '',
 *     baseUrl: 'https://api.openai.com/v1',
 *     models: ['gpt-4', 'gpt-3.5-turbo'],
 *     defaultModel: 'gpt-4',
 *     maxTokens: 4000,
 *     rateLimitPerMinute: 60,
 *     costPer1kTokens: { input: 0.03, output: 0.06 },
 *   },
 * };
 * ```
 *
 * ### Passo 5: Atualizar AIOrchestrationService
 *
 * Edite `src/application/services/ai-orchestration.service.ts`:
 *
 * ```typescript
 * // Adicionar método específico do provider
 * private async generateWithOpenAI(
 *   request: TextGenerationRequest,
 *   config: AIProviderConfig,
 * ): Promise<TextGenerationResult> {
 *   const openaiService = container.resolve<OpenAIService>('OpenAIService');
 *
 *   try {
 *     const content = await openaiService.generateText(request.prompt, {
 *       maxTokens: request.maxTokens || config.maxTokens,
 *       temperature: request.temperature || 0.7,
 *       model: config.model,
 *     });
 *
 *     return {
 *       success: true,
 *       content,
 *       provider: AIProvider.OPENAI,
 *       model: config.model,
 *       generationTime: Date.now() - startTime,
 *       tokensUsed: this.estimateTokens(content),
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: `OpenAI generation failed: ${error.message}`,
 *       provider: AIProvider.OPENAI,
 *       model: config.model,
 *     };
 *   }
 * }
 *
 * // Adicionar case no switch do generateText()
 * switch (config.provider) {
 *   case AIProvider.OPENAI:
 *     return this.generateWithOpenAI(request, config);
 *   case AIProvider.MOCKED:
 *     return this.generateWithMocked(request, config);
 *   default:
 *     throw new Error(`Unsupported provider: ${config.provider}`);
 * }
 * ```
 *
 * ### Passo 6: Atualizar Utilitários
 *
 * Edite `src/utils/ai-provider-inference.ts`:
 *
 * ```typescript
 * export function inferProviderFromModel(model: string): AIProvider {
 *   if (model.startsWith('gpt-') || model.includes('openai')) {
 *     return AIProvider.OPENAI;
 *   }
 *   // ... outras verificações
 *   return AIProvider.MOCKED; // fallback
 * }
 *
 * export function getAvailableModelsForProvider(provider: AIProvider): string[] {
 *   switch (provider) {
 *     case AIProvider.OPENAI:
 *       return ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'];
 *     case AIProvider.MOCKED:
 *       return ['test', 'mock', 'test-model-v1'];
 *     default:
 *       return ['test'];
 *   }
 * }
 * ```
 *
 * ### Passo 7: Adicionar Testes
 *
 * Crie `src/tests/infrastructure/services/openai-ai.service.spec.ts`:
 *
 * ```typescript
 * describe('OpenAIService', () => {
 *   let service: OpenAIService;
 *
 *   beforeEach(() => {
 *     service = new OpenAIService();
 *   });
 *
 *   describe('generateText', () => {
 *     it('should generate text using OpenAI API', async () => {
 *       // Mock da API do OpenAI
 *       // Teste da funcionalidade
 *     });
 *   });
 * });
 * ```
 *
 * ## 🔧 Variáveis de Ambiente Necessárias
 *
 * Adicione ao `.env`:
 *
 * ```env
 * # OpenAI Configuration
 * OPENAI_API_KEY=sk-your-openai-api-key-here
 * OPENAI_ORG_ID=org-your-organization-id  # opcional
 *
 * # Anthropic Configuration
 * ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
 * ```
 *
 * ## ⚠️ Considerações Importantes
 *
 * ### Tratamento de Erros
 * - Sempre implementar try/catch em chamadas de API
 * - Retornar objetos de resultado padronizados
 * - Logar erros para debugging
 *
 * ### Rate Limiting
 * - Respeitar limites de taxa dos providers
 * - Implementar retry com backoff exponencial
 * - Monitorar uso de tokens/requests
 *
 * ### Segurança
 * - Nunca hardcodar API keys
 * - Validar inputs antes de enviar para APIs
 * - Implementar moderação de conteúdo
 *
 * ### Performance
 * - Implementar cache quando apropriado
 * - Usar streaming para respostas longas
 * - Monitorar latência e custos
 *
 * ## 📚 Recursos Adicionais
 *
 * - Documentação da API do provider
 * - Exemplos de integração
 * - Testes de integração
 * - Monitoramento e métricas
 *
 * ---
 *
 * Para dúvidas ou suporte, consulte a documentação específica de cada provider
 * ou entre em contato com a equipe de desenvolvimento.
 */

export interface IAIProvider {
  /**
   * 🏷️ **Obtém o tipo do provider**
   *
   * @returns {AIProvider} O enum que identifica este provider (ex: AIProvider.OPENAI)
   *
   * @example
   * ```typescript
   * const provider = aiService.getProvider();
   * console.log(provider); // AIProvider.OPENAI
   * ```
   */
  getProvider(): AIProvider;

  /**
   * 📝 **Gera conteúdo de texto usando IA**
   *
   * Este é o método principal para geração de texto. Deve ser implementado para
   * fazer chamadas à API específica do provider e retornar o texto gerado.
   *
   * @param {string} prompt - O prompt/instrução para a IA gerar texto
   * @param {object} options - Opções de configuração para a geração
   * @param {number} options.maxTokens - Número máximo de tokens a gerar (padrão: 1000)
   * @param {number} options.temperature - Criatividade da resposta 0.0-1.0 (padrão: 0.7)
   * @param {string} options.model - Modelo específico a usar (padrão: modelo padrão do provider)
   *
   * @returns {Promise<string>} O texto gerado pela IA
   *
   * @throws {Error} Quando a API falha ou retorna erro
   *
   * @example
   * ```typescript
   * const text = await aiService.generateText(
   *   "Escreva uma história sobre um dragão",
   *   { maxTokens: 500, temperature: 0.8 }
   * );
   * ```
   */
  generateText(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    },
  ): Promise<string>;

  /**
   * 🖼️ **Gera imagens usando IA**
   *
   * Implementa a geração de imagens baseada em prompts de texto.
   * Deve retornar uma URL válida para a imagem gerada.
   *
   * @param {string} prompt - Descrição da imagem a ser gerada
   * @param {object} options - Opções de configuração para a geração
   * @param {'small'|'medium'|'large'} options.size - Tamanho da imagem (padrão: 'medium')
   * @param {string} options.style - Estilo artístico (ex: 'realistic', 'cartoon')
   * @param {'standard'|'hd'} options.quality - Qualidade da imagem (padrão: 'standard')
   * @param {string} options.model - Modelo específico para geração de imagem
   *
   * @returns {Promise<string>} URL da imagem gerada
   *
   * @throws {Error} Quando a geração falha ou o provider não suporta imagens
   *
   * @example
   * ```typescript
   * const imageUrl = await aiService.generateImage(
   *   "Um castelo medieval ao pôr do sol",
   *   { size: 'large', quality: 'hd' }
   * );
   * ```
   */
  generateImage(
    prompt: string,
    options?: {
      size?: 'small' | 'medium' | 'large';
      style?: string;
      quality?: 'standard' | 'hd';
      model?: string;
    },
  ): Promise<string>;

  /**
   * 🔊 **Gera áudio/narração usando IA**
   *
   * Implementa a síntese de voz para converter texto em áudio.
   * Deve retornar uma URL válida para o arquivo de áudio gerado.
   *
   * @param {string} prompt - Texto a ser convertido em áudio
   * @param {object} options - Opções de configuração para a geração
   * @param {string} options.voice - Voz a ser usada (ex: 'narrator', 'female', 'male')
   * @param {number} options.speed - Velocidade da fala 0.5-2.0 (padrão: 1.0)
   * @param {'mp3'|'wav'|'ogg'} options.format - Formato do arquivo de áudio (padrão: 'mp3')
   * @param {string} options.model - Modelo específico para síntese de voz
   *
   * @returns {Promise<string>} URL do arquivo de áudio gerado
   *
   * @throws {Error} Quando a geração falha ou o provider não suporta áudio
   *
   * @example
   * ```typescript
   * const audioUrl = await aiService.generateAudio(
   *   "Era uma vez, em um reino distante...",
   *   { voice: 'narrator', speed: 1.2 }
   * );
   * ```
   */
  generateAudio(
    prompt: string,
    options?: {
      voice?: string;
      speed?: number;
      format?: 'mp3' | 'wav' | 'ogg';
      model?: string;
    },
  ): Promise<string>;

  /**
   * ✅ **Verifica se o provider está disponível**
   *
   * Testa a conectividade e disponibilidade do serviço de IA.
   * Deve fazer uma verificação real (ex: ping na API) quando possível.
   *
   * @returns {Promise<boolean>} true se o provider está disponível e funcionando
   *
   * @example
   * ```typescript
   * const isOnline = await aiService.isAvailable();
   * if (!isOnline) {
   *   console.log("Provider indisponível, usando fallback");
   * }
   * ```
   */
  isAvailable(): Promise<boolean>;

  /**
   * 📋 **Obtém lista de modelos disponíveis**
   *
   * Retorna todos os modelos que este provider suporta.
   * Pode fazer uma consulta à API ou retornar uma lista estática.
   *
   * @returns {Promise<string[]>} Array com nomes dos modelos disponíveis
   *
   * @example
   * ```typescript
   * const models = await aiService.getModels();
   * console.log(models); // ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']
   * ```
   */
  getModels(): Promise<string[]>;

  /**
   * 💰 **Estima o custo de uma requisição**
   *
   * Calcula o custo estimado baseado no número de tokens de entrada e saída.
   * Deve usar as tabelas de preço atuais do provider.
   *
   * @param {number} inputTokens - Número de tokens na entrada (prompt)
   * @param {number} outputTokens - Número estimado de tokens na saída
   * @param {string} model - Modelo específico para cálculo (opcional)
   *
   * @returns {Promise<number>} Custo estimado em dólares (USD)
   *
   * @example
   * ```typescript
   * const cost = await aiService.estimateCost(100, 500, 'gpt-4');
   * console.log(`Custo estimado: $${cost.toFixed(4)}`);
   * ```
   */
  estimateCost(
    inputTokens: number,
    outputTokens: number,
    model?: string,
  ): Promise<number>;

  /**
   * 🛡️ **Modera conteúdo para adequação**
   *
   * Analisa o conteúdo para detectar material inadequado, ofensivo ou perigoso.
   * Deve usar as ferramentas de moderação do provider quando disponíveis.
   *
   * @param {string} content - Conteúdo a ser analisado
   *
   * @returns {Promise<object>} Resultado da moderação
   * @returns {boolean} returns.flagged - true se o conteúdo foi sinalizado como inadequado
   * @returns {string[]} returns.categories - Categorias de problemas detectados
   * @returns {number} returns.confidence - Nível de confiança da análise (0.0-1.0)
   *
   * @example
   * ```typescript
   * const moderation = await aiService.moderateContent("Texto a ser analisado");
   * if (moderation.flagged) {
   *   console.log(`Conteúdo inadequado: ${moderation.categories.join(', ')}`);
   * }
   * ```
   */
  moderateContent(content: string): Promise<{
    flagged: boolean;
    categories: string[];
    confidence: number;
  }>;
}

/**
 * 🏭 **Factory para criação de instâncias de providers de IA**
 *
 * Interface opcional que pode ser implementada para criar um sistema de factory
 * para gerenciar múltiplos providers de IA de forma centralizada.
 */
export interface AIProviderFactory {
  /**
   * 🔨 **Cria uma instância de provider de IA**
   *
   * Factory method para criar instâncias específicas de providers baseado no tipo.
   *
   * @param {AIProvider} provider - Tipo do provider a ser criado
   *
   * @returns {IAIProvider} Instância do provider solicitado
   *
   * @throws {Error} Quando o provider não é suportado ou não pode ser criado
   *
   * @example
   * ```typescript
   * const factory = new AIProviderFactoryImpl();
   * const openaiProvider = factory.createProvider(AIProvider.OPENAI);
   * ```
   */
  createProvider(provider: AIProvider): IAIProvider;

  /**
   * 📋 **Obtém todos os providers disponíveis**
   *
   * Retorna uma lista de todos os providers que podem ser criados por esta factory.
   *
   * @returns {AIProvider[]} Array com todos os providers suportados
   *
   * @example
   * ```typescript
   * const availableProviders = factory.getAvailableProviders();
   * console.log(availableProviders); // [AIProvider.OPENAI, AIProvider.ANTHROPIC]
   * ```
   */
  getAvailableProviders(): AIProvider[];

  /**
   * ✅ **Verifica se um provider é suportado**
   *
   * Testa se a factory pode criar uma instância do provider especificado.
   *
   * @param {AIProvider} provider - Provider a ser verificado
   *
   * @returns {boolean} true se o provider é suportado
   *
   * @example
   * ```typescript
   * if (factory.isProviderSupported(AIProvider.OPENAI)) {
   *   const provider = factory.createProvider(AIProvider.OPENAI);
   * }
   * ```
   */
  isProviderSupported(provider: AIProvider): boolean;
}
