# Documentação do Projeto RIBAS - Gestão Operacional

## 1. Visão Geral
A plataforma **RIBAS** é um sistema de gestão operacional e documental projetado especificamente para empresas de locação e manutenção de equipamentos pesados. O foco principal é garantir a conformidade com normas de segurança (NRs) e automatizar o controle de campo.

### Objetivos Principais
*   **Centralização:** Controle total de equipamentos e operadores.
*   **Segurança:** Bloqueio de operação para equipamentos sem manutenção ou operadores com NRs vencidas.
*   **Agilidade:** Checklist diário digital via QR Code para operadores em campo.

---

## 2. Arquitetura Técnica

O projeto utiliza uma stack moderna e escalável:

### Backend
*   **Node.js & Express:** Servidor robusto e rápido.
*   **MongoDB & Mongoose:** Banco NoSQL para flexibilidade no armazenamento de documentos e históricos.
*   **JWT (JSON Web Token):** Autenticação segura.
*   **Bcrypt.js:** Criptografia de senhas.

### Frontend
*   **React.js (Vite):** Interface reativa e performática.
*   **TailwindCSS:** Design industrial, moderno e responsivo.
*   **Lucide React:** Iconografia técnica e intuitiva.
*   **Context API:** Gerenciamento de estado global de autenticação.

---

## 3. Estrutura de Pastas

```text
/RIBAS
├── /client (Frontend)
│   ├── /src
│   │   ├── /components (Componentes reutilizáveis: Sidebar, Layout, Cards)
│   │   ├── /context (Contexto de Autenticação)
│   │   ├── /pages (Telas principais: Dashboard, Listas, Detalhes, Checklist)
│   │   └── /services (Comunicação com a API)
├── /server (Backend)
│   ├── /src
│   │   ├── /controllers (Lógica de entrada/saída)
│   │   ├── /models (Esquemas do MongoDB: Equipment, Operator, Checklist, Maintenance)
│   │   ├── /routes (Definição de endpoints)
│   │   ├── /middleware (Proteção de rotas e RBAC)
│   │   └── /repositories (Acesso direto ao banco de dados)
└── /docs (Documentação)
```

---

## 4. Regras de Negócio Implementadas

1.  **Checklist Obrigatório:** Um equipamento só deve operar após a submissão do checklist diário.
2.  **Controle de Acesso (RBAC):**
    *   **Admin/Manager:** Acesso total, gestão de usuários e visualização de KPIs.
    *   **Operator:** Acesso limitado à lista de equipamentos, realização de checklists e consulta de seus próprios documentos.
3.  **Segurança de Campo:** Se um item crítico do checklist for marcado como "Não Conforme", o sistema gera um alerta visual imediato de bloqueio.

---

## 5. Guia de Instalação e Execução

### Pré-requisitos
*   Node.js (v18+)
*   MongoDB (Local ou Atlas)

### Configuração do Servidor
1.  Entre na pasta `/server`.
2.  Crie um arquivo `.env` baseado no exemplo:
    ```env
    MONGODB_URI=mongodb://localhost:27017/ribas
    JWT_SECRET=sua_chave_secreta
    PORT=5000
    ```
3.  Instale dependências: `npm install`
4.  Popule o banco: `npm run seed`
5.  Inicie: `npm run dev`

### Configuração do Cliente
1.  Entre na pasta `/client`.
2.  Instale dependências: `npm install`
3.  Inicie: `npm run dev`

---

## 6. Endpoints da API

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/login` | Autentica usuário e retorna token | Público |
| GET | `/api/equipments` | Lista todos os equipamentos | Autenticado |
| GET | `/api/equipments/:id` | Detalhes e histórico de um equipamento | Autenticado |
| POST | `/api/checklists` | Submete novo checklist diário | Operador/Admin |
| GET | `/api/stats/dashboard` | Retorna KPIs e alertas | Admin/Manager |

---

## 7. Próximos Passos (Roadmap)
*   [ ] Integração com AWS S3 para upload real de PDFs de certificados.
*   [ ] Geração de relatórios em PDF para clientes.
*   [ ] Implementação de modo offline-first com Service Workers.
*   [ ] Notificações Push para alertas de manutenção.
