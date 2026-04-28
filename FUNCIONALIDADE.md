Você é um desenvolvedor fullstack sênior especializado em React, Node.js e MongoDB. Sua tarefa é evoluir uma aplicação web já existente, adicionando novas funcionalidades sem quebrar a estrutura atual.

## Objetivo

Implementar melhorias no sistema de documentos e adicionar suporte opcional a avatar (foto) para operadores e equipamentos.

---

## Regras gerais

* NÃO alterar funcionalidades já existentes
* Manter compatibilidade com o banco de dados atual (realizar migração incremental se necessário)
* Seguir o padrão atual do projeto (arquitetura, nomenclatura, organização)
* Garantir validação no frontend e backend
* Manter o design consistente com o restante da aplicação

---

## Funcionalidade 1: Tipagem e Validade de Documentos

### Objetivo

Permitir que cada documento cadastrado possua:

* Tipo de documento
* Data de validade (opcional)

---

### Backend (Node.js + MongoDB)

Atualizar o modelo de documentos para incluir:

* type: string (obrigatório)
  Exemplos:

  * "CNH"
  * "Documento do Veículo"
  * "Certificação NR-35"
  * "Laudo Técnico"
  * "Registro de Manutenção"

* expirationDate: Date (opcional)

* relatedTo:

  * equipmentId (opcional)
  * operatorId (opcional)

---

### Regras de negócio

* O campo "type" deve ser obrigatório
* O campo "expirationDate" deve ser opcional
* Caso exista expirationDate:

  * Deve ser validado (não aceitar datas inválidas)
* Documentos com validade devem ser utilizados no sistema de alertas

---

### Integração com Dashboard

* Criar lógica para identificar:

  * Documentos vencidos
  * Documentos próximos do vencimento (ex: 30 dias)
* Expor esses dados via API
* Integrar com os indicadores do dashboard

---

### Frontend (React)

Atualizar o formulário de upload de documentos:

* Adicionar campo "Tipo de documento"

  * Select ou autocomplete
  * Permitir valores pré-definidos + customizado

* Adicionar campo "Data de validade"

  * Input de data
  * Opcional
  * Exibir claramente quando não aplicável

* Exibir tipo e validade:

  * Na listagem de documentos
  * Na tela de detalhes (equipamento ou operador)

* Indicar status visual:

  * Vencido
  * Próximo do vencimento
  * Válido

---

## Funcionalidade 2: Avatar (Foto) para Operadores e Equipamentos

### Objetivo

Permitir adicionar uma imagem opcional ao cadastrar:

* Operadores
* Equipamentos

---

### Backend

Atualizar modelos:

Operator:

* avatarUrl: string (opcional)

Equipment:

* imageUrl: string (opcional)

---

### Upload

* Permitir upload de imagem (jpg, png)
* Armazenar em storage (local ou cloud)
* Salvar URL no banco

---

### Frontend

Atualizar formulários de cadastro:

* Adicionar campo de upload de imagem
* Preview da imagem antes de salvar

---

### Exibição

* Se houver imagem:

  * Exibir avatar/foto
* Se NÃO houver:

  * Manter ícone padrão atual

---

### Regras de UX

* Avatar deve ser pequeno e discreto
* Não quebrar layout existente
* Manter visual clean e industrial

---

## Entregáveis

* Atualização dos modelos (MongoDB)
* Novos campos nos formulários
* Upload funcional de imagens
* Integração com dashboard (alertas de documentos)
* Atualização das telas de listagem e detalhes

---

## Extras (opcional, se possível)

* Filtro de documentos por tipo
* Ordenação por validade
* Badge visual para status (vencido / válido)

---

Agora:

* Gere o código necessário para backend (model, controller, rotas)
* Gere o código do frontend (formulários e exibição)
* Sugira alterações no banco (migration ou adaptação)
* Mantenha consistência com o projeto existente