# Documentação do Projeto RIBAS - Gestão Operacional

## 1. Visão Geral
A plataforma **RIBAS** é um sistema de gestão operacional e documental projetado especificamente para empresas de locação e manutenção de equipamentos pesados. O foco principal é garantir a conformidade com normas de segurança (NRs) e automatizar o controle de campo.

---

## 2. Funcionalidades Principais

### A. Gestão de Equipamentos e Operadores
*   **CRUD Completo:** Cadastro, Edição, Deleção e Visualização de Equipamentos e Operadores.
*   **Identificação:** Geração de QR Code para cada equipamento, permitindo acesso imediato a checklists e documentos em campo.
*   **Mídia:** Suporte a upload de fotos/avatares para identificação rápida.

### B. Conformidade e Segurança (Regras de Bloqueio)
*   **Validação de NRs:** Operadores com certificações vencidas são impedidos de realizar checklists.
*   **Validação de Manutenção:** Equipamentos com manutenção vencida possuem operação bloqueada.
*   **Logs de Auditoria:** Registro centralizado de todas as ações críticas (Criação, Atualização e Deleção) para total rastreabilidade.

### C. Gestão Documental e Manutenção
*   **Upload de Documentos:** Gestão de arquivos associados a operadores e equipamentos, com controle de validade e status (Válido, Vencendo, Vencido).
*   **Histórico:** Registro completo de manutenções (preventivas/corretivas), incluindo custos e mecânicos responsáveis.

### D. Operacional em Campo
*   **Checklist Digital:** Registro diário obrigatório com interface adaptada para uso móvel.
*   **Gestão de Serviços:** Acompanhamento de demandas com trava de duplicidade (um equipamento não pode estar em dois serviços ativos).
*   **Offline-First:** Uso de *Service Workers* para cache de recursos, garantindo carregamento da interface em áreas sem conexão.

---

## 3. Arquitetura Técnica

### Backend
*   **Node.js + Express:** API RESTful.
*   **MongoDB + Mongoose:** Estrutura de dados NoSQL.
*   **Segurança:** Autenticação JWT, Bcrypt, RBAC (Admin, Gestor, Operador).

### Frontend
*   **React + Vite + TailwindCSS:** UI moderna baseada no estilo "Industrial ERP".
*   **Bibliotecas:** `recharts` (KPIs), `lucide-react` (iconografia), `axios` (API).

---

## 4. Estrutura de Rotas (Principais)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | Autenticação | Público |
| GET | `/api/equipments` | Lista frota | Autenticado |
| POST | `/api/maintenances` | Registra manutenção | Admin/Manager |
| POST | `/api/documents` | Upload de documentos | Admin/Manager |
| GET | `/api/services` | Lista serviços | Admin/Manager |
| GET | `/api/stats/dashboard` | KPIs e Alertas | Admin/Manager |

---

## 5. Guia de Desenvolvimento

### Configuração
1.  **Variáveis de Ambiente (.env no /server):**
    *   `MONGODB_URI`: String de conexão MongoDB.
    *   `JWT_SECRET`: Chave secreta para tokens.
    *   `PORT`: Porta do servidor (default: 5000).

### Comandos
*   **Server:** `npm install` -> `npm run seed` -> `npm run dev`
*   **Client:** `npm install` -> `npm run dev`

---

## 6. Roadmap de Evolução
1.  **Sincronização Offline:** Implementar `SyncService` para checklists pendentes.
2.  **Notificações Automáticas:** Integração de `node-cron` com `nodemailer` para alertas proativos.
3.  **Storage Cloud:** Migração de uploads para AWS S3 (via `multer-s3`).
4.  **Relatórios PDF:** Geração de relatórios de manutenção e checklists para exportação.
