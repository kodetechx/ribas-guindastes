Prioridade 1: Core Business Logic (Regras de Negócio e Bloqueios)

   1. Bloqueio de Operação por NR Vencida:
       * Backend: Modificar as rotas de criação/atualização de checklist para verificar as NRs do operador logado. Se alguma NR obrigatória para o tipo
         de equipamento estiver vencida, impedir a criação do checklist ou a operação.
       * Frontend: Feedback visual para o operador se suas NRs estiverem vencidas, talvez impedindo o acesso ao checklist.
   2. Bloqueio de Operação por Manutenção Vencida:
       * Backend: Lógica na API para verificar nextMaintenance do equipamento. Se a data for passada, marcar o equipamento como blocked automaticamente
         (ou impedir ação).
       * Frontend: Destacar equipamentos com manutenção vencida na lista e detalhes.
   3. Bloqueio de Operação sem Checklist Diário:
       * Backend: Lógica para que a API de Serviços (quando implementada) ou Equipamentos verifique a existência do checklist diário antes de permitir
         qualquer outra ação com o equipamento.

  Prioridade 2: Gestão de Documentos e Manutenção

   4. Gestão de Documentos (Upload/Download):
       * Backend:
           * Modelos para Document (com tipo, data de validade, link para storage, associado a Operator ou Equipment).
           * Endpoint para upload de arquivos (integrar com storage como AWS S3 ou similar - um diferencial seria usar um serviço local como multer e
             depois adaptar para S3).
           * Endpoint para listar e fazer download de documentos por Operator e Equipment.
       * Frontend:
           * Interface para "Gerenciar Documentos" em EquipmentDetail e OperatorDetail.
           * Na tela MyDocuments do operador, listar documentos reais vindos da API, não mock.
   5. CRUD Completo de Manutenção:
       * Backend: Implementar MaintenanceRepository, MaintenanceService, MaintenanceController, MaintenanceRoutes para o modelo Maintenance (já
         criado).
       * Frontend:
           * Tabela/Lista de histórico de manutenções na página de EquipmentDetail.
           * Formulário para "Agendar Manutenção" (criando novos registros de Maintenance).
   6. "Meus Documentos" para Operador:
       * Backend: Endpoint GET /api/operators/:id/documents para o operador logado.
       * Frontend: Conectar a página MyDocuments.tsx a este endpoint, exibindo os documentos reais do operador.

  Prioridade 3: Funcionalidades Adicionais e UI/UX

   7. Gestão de Serviços:
       * Backend:
           * Modelo Service (com cliente, localização, equipamentos, operadores, status).
           * Endpoints CRUD para Service.
           * Lógica para "Equipamento não pode estar em dois serviços simultaneamente".
       * Frontend:
           * Página ServicesList e ServiceDetail.
           * Opção "Iniciar/Finalizar Serviço" para operadores.
   8. Dashboard - Gráficos e Indicadores:
       * Integrar bibliotecas de gráficos (ex: Recharts, Chart.js) para visualizar KPIs (Utilização de equipamentos, Custos de manutenção).
   9. Notificações/Alertas:
       * Backend: Serviço de notificação (e-mail, push) para documentos vencendo e manutenções próximas.
       * Frontend: Exibir alertas de sistema no Dashboard ou em um componente de notificação global.
   10. Offline-First para Operadores:
       * Frontend: Implementar Service Workers e estratégias de cache para permitir que o aplicativo funcione sem conexão (pelo menos para o checklist
         e visualização de documentos). Sincronização automática quando a conexão é restabelecida.
   11. Logs de Auditoria:
       * Backend: Implementar um mecanismo centralizado de logging para registrar ações críticas (quem fez o quê, quando).
