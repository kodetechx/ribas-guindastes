# Melhorias e Novas Funcionalidades — Sistema de Gestão de Guindastes

## Objetivo

Implementar melhorias estruturais no sistema de gestão de guindastes com foco em:

* automatização de validações por cliente;
* controle de requisitos obrigatórios por serviço;
* checklist individual por equipamento;
* criação de uma nova área de configurações administrativas;
* fortalecimento das regras de negócio antes da alocação de equipamentos e operadores;
* maior flexibilidade operacional e redução de falhas humanas.

A IA deve analisar a estrutura atual do projeto e implementar as melhorias preservando o padrão já utilizado no código.

---

# 1. SERVIÇOS + REGRAS POR CLIENTE

---

## Objetivo

Ao cadastrar um serviço e vincular um cliente, o sistema deve conhecer previamente:

* documentos obrigatórios exigidos pelo cliente;
* equipamentos permitidos/necessários;
* operadores aptos;
* bloqueios de alocação caso os requisitos não sejam atendidos.

---

## 1.1 Cadastro de Clientes com Requisitos

Criar formulário CRUD completo de clientes.

Cada cliente deve possuir:

### Dados básicos

* razão social
* nome fantasia
* CNPJ
* telefone
* e-mail
* endereço
* observações

---

### Documentos obrigatórios exigidos pelo cliente

Permitir selecionar múltiplos documentos obrigatórios.

Exemplo:

* NR11
* NR12
* NR35
* certificado operacional
* laudo de inspeção
* ART
* ASO
* documento personalizado

Estrutura sugerida:

```ts
ClientRequiredDocument {
  id
  clientId
  documentTypeId
  required: boolean
}
```

---

### Equipamentos exigidos/opcionais

Permitir definir:

* equipamentos obrigatórios
* categorias permitidas
* restrições específicas

Exemplo:

```ts
ClientEquipmentRule {
  id
  clientId
  equipmentTypeId
  required
}
```

---

## 1.2 Regras ao cadastrar um novo serviço

Ao criar serviço:

Selecionar:

* cliente
* data
* local
* observações
* equipamentos
* operadores

Após selecionar cliente:

carregar automaticamente:

* documentos obrigatórios
* requisitos de equipamentos
* exigências do operador

Exibir em tela:

### Requisitos do cliente

✔ NR11 obrigatória
✔ Laudo atualizado
✔ Certificado do equipamento
✔ Operador habilitado

---

## 1.3 Validação de equipamento antes da alocação

Regra obrigatória:

Um equipamento NÃO pode ser alocado se não atender os requisitos do cliente.

Validar:

* documentos vencidos
* documentos ausentes
* certificados obrigatórios
* categoria incompatível
* checklist pendente (se necessário)

Caso inválido:

bloquear seleção

Exibir erro:

```txt
Equipamento não pode ser alocado.
Pendências:
- NR11 vencida
- Laudo obrigatório ausente
```

---

## 1.4 Validação de operador

Mesmo comportamento:

validar antes da alocação:

* treinamentos obrigatórios
* certificados
* documentos vencidos
* habilitações

Exibir bloqueio:

```txt
Operador não apto para este cliente.
Pendências:
- NR35 vencida
```

---

## Critérios de aceite

✔ cliente pode definir requisitos
✔ serviço carrega requisitos automaticamente
✔ equipamento inválido não pode ser vinculado
✔ operador inválido não pode ser vinculado
✔ mensagens claras de erro

---

# 2. CHECKLIST INDIVIDUAL POR EQUIPAMENTO

---

## Situação atual

Hoje existe checklist global para todos os equipamentos.

---

## Objetivo

Cada equipamento deve possuir checklist próprio.

Possibilidade de:

* criar checklist novo
* reutilizar checklist existente
* editar checklist individualmente
* duplicar checklist de outro equipamento

---

## 2.1 Estrutura sugerida

```ts
ChecklistTemplate {
  id
  name
  description
}
```

```ts
ChecklistItem {
  id
  templateId
  title
  description
  order
  required
}
```

```ts
EquipmentChecklist {
  id
  equipmentId
  templateId
}
```

---

## 2.2 Ao cadastrar equipamento

Adicionar campo:

### Checklist

Opções:

* usar checklist existente
* criar novo checklist
* duplicar checklist de outro equipamento

---

## 2.3 CRUD de checklist

Permitir:

### Criar

* nome
* descrição

### Adicionar itens

* título
* descrição
* obrigatório
* ordem

### Editar

### Excluir

### Duplicar

---

## Exemplo

Checklist — Guindaste Liebherr

1. verificar pneus
2. verificar nível hidráulico
3. testar estabilizadores
4. validar trava de segurança
5. testar giro da lança

Checklist — Munck

1. testar comandos
2. validar mangueiras
3. conferir trava traseira

---

## Critérios de aceite

✔ checklist por equipamento
✔ CRUD completo
✔ reutilização de templates
✔ duplicação
✔ associação no cadastro

---

# 3. NOVA ABA — CONFIGURAÇÕES

---

## Objetivo

Criar módulo administrativo:

```txt
Configurações
```

No menu lateral.

---

## Subabas

---

### 3.1 Formulários

Gerenciar:

* tipos de documentos
* categorias
* campos customizados
* status
* validações futuras

CRUD:

* criar
* editar
* excluir
* ativar/desativar

---

### 3.2 Checklists

Gerenciar todos templates.

Ações:

* criar
* editar
* duplicar
* excluir

---

### 3.3 Regras por cliente

Visualizar:

* clientes
* requisitos
* documentos
* equipamentos obrigatórios

---

### 3.4 Preferências futuras

Preparar estrutura para:

* notificações
* alertas automáticos
* vencimentos
* parâmetros gerais

---

## Frontend esperado

Nova rota:

```txt
/settings
```

Subrotas:

```txt
/settings/forms
/settings/checklists
/settings/client-rules
```

---

## Backend esperado

Criar endpoints:

```txt
GET /settings
POST /settings
```

```txt
GET /clients/:id/requirements
POST /clients/:id/requirements
```

```txt
GET /checklists
POST /checklists
PUT /checklists/:id
DELETE /checklists/:id
```

```txt
POST /services/validate-equipment
POST /services/validate-operator
```

---

# Regras gerais de implementação

A IA deve:

* preservar estrutura atual
* manter padrão visual
* reutilizar componentes existentes
* manter TypeScript tipado
* validar backend e frontend
* criar migrations se necessário
* atualizar interfaces/types
* garantir responsividade
* não quebrar funcionalidades atuais

---

# Testes obrigatórios

Validar:

### Serviços

* criar cliente
* definir requisitos
* abrir serviço
* tentar alocar inválido
* bloquear corretamente

---

### Equipamentos

* criar checklist
* associar equipamento
* editar
* duplicar

---

### Configurações

* CRUD completo
* salvar
* editar
* persistir

---

# Resultado esperado

Ao finalizar:

O sistema deverá permitir:

✔ cadastrar clientes com exigências próprias
✔ impedir alocação inválida
✔ validar operadores automaticamente
✔ checklist individual por equipamento
✔ criar templates
✔ gerenciar tudo pela aba Configurações
✔ manter compatibilidade com o sistema atual
