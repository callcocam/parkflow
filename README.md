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
- ✅ Criação de períodos para os dias 27, 28 e 29 de dezembro de 2024.
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
