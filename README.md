# ParkFlow - Gestão de Voluntários de Estacionamento

Bem-vindo ao ParkFlow! Este é um sistema web para organizar de forma automática os voluntários em turnos de estacionamento durante eventos.

## Acompanhamento do Projeto

Aqui vamos acompanhar o progresso do desenvolvimento, marcando as tarefas como pendentes (⏳) ou concluídas (✅).

### Fase 1: Core (Concluída)
- ✅ Limpeza inicial do projeto.
- ✅ Estrutura de pastas e `README.md` para acompanhamento.
- ✅ Instalação e configuração do Tailwind CSS.
- ✅ Instalação de bibliotecas (`lucide-react`, `date-fns`, `react-router-dom`).
- ✅ CRUD de voluntários.
- ✅ CRUD de turnos.
- ✅ Validações básicas.
- ✅ Persistência de dados com `localStorage`.

### Fase 2: Escalação (Concluída)
- ✅ Interface drag-and-drop para alocação.
- ✅ Algoritmo de distribuição automática.
- ✅ Sistema de designação de capitães.

### Fase 3: Exportação e Relatórios (Simplificado)
- ✅ Exportação da escala para CSV.
- ✅ Botão para resetar dados da aplicação.
- ✅ Funcionalidades de exportação para PDF, Excel e Backup JSON foram implementadas e posteriormente removidas para simplificar a interface a pedido.

### Fase 4: Melhorias de UX (Em andamento)
- ✅ Notificações com `react-hot-toast`.
- ✅ Dashboard com estatísticas e gráficos.
- ✅ Layout responsivo com menu lateral.
- ✅ Componente de Avatar com foto ou iniciais.
- ✅ Pré-cadastro de ~30 voluntários para facilitar o início.
- ⏳ Features de PWA (Progressive Web App).
- ⏳ Suporte para modo offline.

### Fase 5: Configuração de Períodos (Concluída)
- ✅ Criação de períodos para os dias 27, 28 e 29 de junho de 2025.
- ✅ Configuração de turnos de manhã (07:00-12:00) e tarde (13:00-18:00).
- ✅ Períodos criados para ambas as localidades (Portaria e Pátio).
- ✅ Configuração especial de voluntários por turno:
  - **Primeiro turno (07:00-08:00)**: 32 voluntários (todos disponíveis)
  - **Último turno (17:00-18:00)**: 32 voluntários (todos disponíveis)
  - **Turnos intermediários**: 3 voluntários por turno
- ✅ Total de 60 turnos criados (3 dias × 2 períodos × 2 locais × 5 turnos/período).
- ✅ Adicionada coluna "Líder" na lista de voluntários com checkbox para marcar/desmarcar líderes.
- ✅ Funcionalidade de toggle para alternar status de líder diretamente na interface.
- ✅ Implementada barra de rolagem na seção "Voluntários Disponíveis" da página de alocação para melhor navegação.
- ✅ Adicionado botão de remoção (X) nos voluntários alocados nos turnos com efeito hover e confirmação visual.
- ✅ Exportação PDF compacta dos voluntários na página de Voluntários para compartilhamento no WhatsApp.

### Fase 6: Interface Alternativa de Alocação (Concluída)
- ✅ Criada nova página "Alocação Select" como alternativa ao drag-and-drop.
- ✅ Interface com tabela listando todos os voluntários e select para escolher turnos.
- ✅ Filtros por data, local e nome do voluntário para facilitar a busca.
- ✅ Validações automáticas: capacidade máxima, um turno por voluntário por dia.
- ✅ Estatísticas em tempo real: total de voluntários, turnos, alocados e líderes.
- ✅ Visualização clara do turno atual de cada voluntário.
- ✅ Exportação PDF melhorada incluindo informações de turno e local para cada voluntário.

### Fase 7: Expansão da Base de Voluntários e Alocação Automática (Concluída)
- ✅ Adicionados 2 novos voluntários à base de dados:
  - **44. Egmar Antonio Rahmeier - Todos** (Sul)
  - **45. Evonir Boeira - Todos** (Araricá)
- ✅ Total de voluntários: **45 voluntários** cadastrados
- ✅ Alocação automática implementada para turnos especiais do pátio:
  - **27/06 (Sexta) 07:00-09:00**: "Sexta Manhã - Todos os voluntários"
  - **27/06 (Sexta) 16:00-17:30**: "Sexta Tarde - Todos os voluntários"
  - **28/06 (Sábado) 07:00-09:00**: "Sábado Manhã - Todos os voluntários"
  - **28/06 (Sábado) 16:00-17:30**: "Sábado Tarde - Todos os voluntários"
  - **29/06 (Domingo) 07:00-09:00**: "Domingo Manhã - Todos os voluntários"
  - **29/06 (Domingo) 16:00-17:30**: "Domingo Tarde - Todos os voluntários"
- ✅ Sistema executa alocação automática na inicialização da aplicação
- ✅ Cada turno especial recebe o voluntário correspondente ao dia/período
- ✅ Turnos especiais do pátio aparecem como "CHEIO" na interface de seleção

### Fase 8: Gestão de Disponibilidade de Voluntários (Concluída)
- ✅ Adicionada propriedade `unavailableShifts` ao tipo Volunteer para armazenar horários indisponíveis
- ✅ Implementado modo de edição no formulário de voluntários com:
  - ✅ Preenchimento automático dos campos ao editar
  - ✅ Select múltiplo para marcar horários indisponíveis
  - ✅ Visualização clara dos turnos com data, horário e local
  - ✅ Botão de cancelar edição
- ✅ Adicionado botão de editar na lista de voluntários
- ✅ Implementada função de edição no contexto da aplicação
- ✅ Filtro inteligente na interface de alocação:
  - ✅ Voluntários indisponíveis não veem opções de turnos conflitantes
  - ✅ Turnos já alocados mostram status "INDISPONÍVEL" quando aplicável
  - ✅ Sistema preserva alocações existentes mesmo com conflitos de disponibilidade
- ✅ Implementado filtro por nome na página de voluntários com busca em tempo real
- ✅ Sistema de múltiplas alocações permitindo voluntário em vários turnos por dia
- ✅ Interface com checkboxes individuais para seleção de turnos múltiplos
- ✅ Visualização de todos os turnos atuais do voluntário na coluna "Turnos Atuais"

### Fase 9: Sistema de Backup e Restauração (Concluída)
- ✅ Funcionalidade de exportar backup completo em JSON no Dashboard
- ✅ Funcionalidade de importar backup JSON com substituição completa dos dados
- ✅ Validação de estrutura do arquivo JSON na importação
- ✅ Confirmação detalhada antes da importação com informações do backup
- ✅ Notificações de sucesso/erro para operações de backup
- ✅ Nomenclatura automática de arquivos com data/hora (formato: parkflow-backup-DD-MM-YYYY-HH-mm.json)
- ✅ Atualização automática do localStorage após importação
- ✅ Backup inclui: voluntários, turnos, alocações, capitães, data de exportação e versão
- ✅ Correção da página de Capitães para mostrar um capitão por dia (não por local)
- ✅ Interface atualizada com datas corretas (27/06, 28/06, 29/06/2025) e nomes dos dias da semana
- ✅ Correção do problema de fuso horário nas datas da página de Capitães
- ✅ Ordenação correta dos dias (sexta, sábado, domingo) na página de Capitães

### Fase 10: Visualização das Alocações (Concluída)
- ✅ Transformação da página de Alocação Drag&Drop em "Visualização das Alocações"
- ✅ Organização dos turnos por dia da semana (Sexta-feira, Sábado, Domingo)
- ✅ Sistema de cores para status dos turnos:
  - 🔴 Vermelho: Turnos vazios (sem voluntários)
  - 🟡 Amarelo: Turnos incompletos (faltam voluntários)
  - 🟢 Verde: Turnos completos (todos os voluntários alocados)
- ✅ Visualização clara de vagas disponíveis com placeholders
- ✅ Informações detalhadas de cada turno: horário, local, período
- ✅ Identificação visual de líderes de equipe com ícone de estrela
- ✅ Resumo geral com estatísticas de turnos completos, incompletos e vazios
- ✅ Layout responsivo organizado por cards de turnos
- ✅ Ordenação automática: primeiro por local (portaria antes pátio), depois por horário
- ✅ Atualização dos dados padrão dos voluntários com horários indisponíveis configurados
- ✅ Correção das quantidades de voluntários necessários em alguns turnos (padronização)
- ✅ Geração de PDF detalhado com todos os turnos, voluntários, telefones e congregações
- ✅ Geração de cards visuais individuais por turno para download como imagem
- ✅ Compartilhamento direto no WhatsApp com mensagem formatada por turno
- ✅ Cards com design moderno e gradient, incluindo todos os dados dos voluntários
- ✅ Integração com WhatsApp Web para envio automático das escalas

### Fase 11: Melhorias de Responsividade e Compartilhamento (Concluída)
- ✅ Otimização completa da responsividade da página de Visualização das Alocações
- ✅ Layout adaptativo para dispositivos móveis, tablets e desktops
- ✅ Grid responsivo com breakpoints otimizados (1 coluna em mobile, 2-4 colunas em telas maiores)
- ✅ Cards com altura mínima ajustável e layout flexível
- ✅ Botões touch-friendly com tamanhos adequados para dispositivos móveis
- ✅ Texto e ícones redimensionáveis conforme o tamanho da tela
- ✅ Espaçamentos otimizados para diferentes resoluções
- ✅ Funcionalidade de compartilhamento de imagens dos cards implementada:
  - ✅ Botão "Compartilhar" para cada turno
  - ✅ Integração com Web Share API quando disponível
  - ✅ Fallback para download direto em navegadores sem suporte
  - ✅ Geração automática de cards visuais para compartilhamento
- ✅ Interface mobile-first com emojis e textos compactos em telas pequenas
- ✅ Limitação inteligente de vagas exibidas em mobile (máximo 3 + indicador)
- ✅ Área de rolagem para listas de voluntários em cards com muitos participantes
- ✅ Resumo geral com layout responsivo em grid 2x2 (mobile) e 1x4 (desktop)

### Fase 12: Correção de Deploy e Roteamento SPA (Concluída)
- ✅ Correção de todos os erros TypeScript que impediam o build
- ✅ Problema de 404 em rotas SPA após build resolvido
- ✅ Configuração automática para servidores Apache (arquivo .htaccess)
- ✅ Configuração automática para Netlify/Vercel/GitHub Pages (arquivo _redirects)
- ✅ Instruções completas de deploy para diferentes tipos de servidor
- ✅ Build funcionando corretamente sem erros
- ✅ Documentação detalhada de troubleshooting e verificação de deploy
- ✅ Testes locais implementados para validar configurações SPA
- ✅ Otimização completa da responsividade da página Dashboard:
  - ✅ Cabeçalho adaptativo com botões responsivos e textos com emojis em mobile
  - ✅ Grid de estatísticas responsivo (1-2-3 colunas conforme a tela)
  - ✅ Cards de estatísticas com padding e textos ajustáveis
  - ✅ Gráfico de barras otimizado para mobile com fontes menores e tooltips estilizados
  - ✅ Lista de próximos turnos com layout melhorado e badges visuais
  - ✅ Área de rolagem para listas longas com indicador de itens adicionais
  - ✅ Design com emojis e elementos visuais para melhor UX em mobile
  - ✅ Espaçamentos progressivos (sm, lg) para diferentes breakpoints
- ✅ Otimização completa da responsividade das páginas de Voluntários:
  - ✅ Página Volunteers.tsx com cabeçalho adaptativo e filtros responsivos
  - ✅ Campo de busca com ícone emoji e largura total em mobile
  - ✅ Botão de exportar PDF com texto compacto em mobile
  - ✅ Layout em coluna para mobile, linha para desktop
  - ✅ VolunteerForm.tsx completamente redesenhado para responsividade:
    - ✅ Grid adaptativo (1-2-3 colunas conforme o tamanho da tela)
    - ✅ Labels descritivas para todos os campos com emojis
    - ✅ Campos com padding touch-friendly (py-3 em mobile)
    - ✅ Seção de horários indisponíveis otimizada com área de rolagem
    - ✅ Checkboxes com hover effects e melhor espaçamento
    - ✅ Botões com textos adaptativos e emojis contextuais
    - ✅ Feedback visual para horários selecionados com badge azul
    - ✅ Layout flexível que se adapta ao conteúdo disponível
