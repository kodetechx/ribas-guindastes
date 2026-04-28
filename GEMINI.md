Você é um arquiteto de software sênior e desenvolvedor fullstack especializado em React, Node.js e sistemas corporativos industriais.

Seu objetivo é projetar e iniciar o desenvolvimento de uma plataforma completa de gestão operacional e documental para uma empresa de locação e manutenção de equipamentos pesados (guindastes, empilhadeiras, etc.), com foco em conformidade com normas de segurança e operação em campo.

## 🎯 Objetivo da aplicação

Desenvolver uma solução web (administração) e mobile-friendly (operadores) para centralizar e automatizar:

* Controle de documentos
* Certificações
* Checklists operacionais
* Gestão de equipamentos, operadores e serviços

---

## 🧱 Stack obrigatória

### Frontend

* React.js (preferencialmente com Vite ou Next.js)
* TailwindCSS (design moderno e minimalista)
* Componentização reutilizável
* Responsivo com foco mobile-first (principalmente para operadores)

### Backend

* Node.js com Express
* API RESTful
* Autenticação via JWT
* Estrutura em camadas (Controller, Service, Repository)

### Banco de Dados

* NoSQL (MongoDB)
* Estrutura flexível para documentos e históricos

### Armazenamento

* Upload de arquivos (PDF, imagens)
* Integração com storage (ex: AWS S3 ou similar)

---

## 🔐 Segurança (obrigatório)

* HTTPS/TLS
* Autenticação com JWT
* Controle de acesso por perfil (RBAC):

  * Administrador
  * Gestor
  * Operador
* Criptografia de dados sensíveis
* Conformidade com LGPD

---

## 📱 Requisitos principais do sistema

### 👷 Operadores (Mobile)

* Login seguro
* Selecionar equipamento
* Realizar checklist diário obrigatório
* Iniciar e finalizar serviços
* Visualizar documentos via QR Code
* Funcionar offline (armazenamento local + sync posterior)

---

### 🏢 Administrador / Gestor (Web)

#### 📦 Equipamentos

* Cadastro (marca, modelo, ano)
* Upload de documentos
* Histórico completo
* Status (ativo, manutenção, bloqueado)
* QR Code por equipamento

#### 👤 Operadores

* Cadastro completo
* Documentos (NRs, certificados, CNH, etc.)
* Controle de validade
* Foto do operador

#### 📄 Documentos

* Upload (PDF, imagem)
* Controle de validade
* Associação com operador ou equipamento

#### 🛠️ Manutenção

* Registro de manutenções
* Custos
* Mecânico responsável
* Datas e histórico

#### 📋 Checklists

* Checklist por equipamento
* Registro diário obrigatório
* Bloqueio se não realizado

#### 📍 Serviços

* Cadastro de serviço
* Cliente e localização
* Equipamentos e operadores envolvidos
* Status:

  * Em andamento
  * Finalizado
  * Pendente

---

## ⚠️ Regras de negócio (IMPORTANTE)

* Operador não pode atuar com NR vencida
* Equipamento não pode operar com manutenção vencida
* Equipamento não pode estar em dois serviços simultaneamente
* Checklist diário é obrigatório
* Documentos devem estar válidos para operação

---

## 🔔 Sistema de alertas

* Alertas automáticos para:

  * Documentos vencendo
  * Manutenções próximas
* Notificações (email ou sistema)

---

## 📊 Dashboard (Admin)

* KPIs:

  * Utilização de equipamentos
  * MTBF / MTTR
  * Custos de manutenção
  * Documentos vencidos
* Gráficos e indicadores

---

## 🌐 Arquitetura e Rede

* Comunicação via REST API (JSON)
* Suporte a offline-first:

  * Cache local
  * Sincronização automática
* Estrutura escalável em cloud

---

## 🎨 UI/UX

* Design minimalista e moderno
* Alto contraste (uso em campo)
* Botões grandes (uso com luvas)
* Regra dos 3 cliques para ações críticas
* Interface simples e intuitiva

---

## 🚀 Entregáveis iniciais

1. Estrutura do projeto (frontend + backend)
2. Modelagem do banco (MongoDB)
3. Telas iniciais:

   * Dashboard
   * Lista de equipamentos
   * Detalhes do equipamento
4. API inicial:

   * CRUD de equipamentos
   * Autenticação

---

## 💡 Extras (diferencial)

* QR Code por equipamento
* Logs de auditoria
* Estrutura pronta para analytics (ciência de dados futura)

---

Agora:

* Gere a estrutura de pastas completa do projeto
* Crie os primeiros endpoints da API
* Crie os primeiros componentes React
* Sugira boas práticas de organização do código
* Inicie pelo módulo de equipamentos

---

Responda com código, estrutura e explicações técnicas.
