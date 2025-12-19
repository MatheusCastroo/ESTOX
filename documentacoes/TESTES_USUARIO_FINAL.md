# 🧪 Guia de Testes - Usuário Final

Este documento contém todos os testes que podem ser realizados no sistema ESTOX, simulando o uso real de um usuário final.

## 📋 Índice

1. [Testes de Cadastro e Autenticação](#1-testes-de-cadastro-e-autenticação)
2. [Testes de Configuração de Loja](#2-testes-de-configuração-de-loja)
3. [Testes de Gerenciamento de Veículos](#3-testes-de-gerenciamento-de-veículos)
4. [Testes de Catálogo Público](#4-testes-de-catálogo-público)
5. [Testes de Leads](#5-testes-de-leads)
6. [Testes de Dashboard e Relatórios](#6-testes-de-dashboard-e-relatórios)
7. [Testes de Configurações](#7-testes-de-configurações)
8. [Testes de Responsividade](#8-testes-de-responsividade)

---

## 1. Testes de Cadastro e Autenticação

### 1.1. Cadastro de Novo Usuário

**Objetivo:** Verificar se um novo usuário consegue se cadastrar no sistema.

**Passos:**
1. Acesse: `http://localhost:8080/cadastro.html`
2. Preencha o formulário:
   - Nome completo
   - Email válido (ex: `teste@exemplo.com`)
   - Senha (mínimo 6 caracteres)
   - Nome da loja (opcional)
   - Telefone (opcional)
   - Cidade e Estado (opcional)
3. Marque a opção "Li e aceito os Termos de Uso"
4. Clique em "Criar conta"

**Resultado Esperado:**
- ✅ Mensagem de sucesso aparece
- ✅ Redirecionamento para a página de onboarding
- ✅ Usuário é autenticado automaticamente

**Cenários de Erro a Testar:**
- ❌ Email já cadastrado
- ❌ Senha muito curta
- ❌ Campos obrigatórios vazios
- ❌ Email inválido

---

### 1.2. Login

**Objetivo:** Verificar se um usuário consegue fazer login.

**Passos:**
1. Acesse: `http://localhost:8080/login.html`
2. Digite o email cadastrado
3. Digite a senha
4. Clique em "Entrar"

**Resultado Esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para o dashboard
- ✅ Token de autenticação salvo

**Cenários de Erro a Testar:**
- ❌ Email não cadastrado
- ❌ Senha incorreta
- ❌ Campos vazios

---

### 1.3. Recuperação de Senha

**Objetivo:** Verificar se o usuário consegue solicitar recuperação de senha.

**Passos:**
1. Acesse: `http://localhost:8080/esqueci-senha.html`
2. Digite o email cadastrado
3. Clique em "Enviar"

**Resultado Esperado:**
- ✅ Mensagem de confirmação
- ✅ Email de recuperação enviado (se implementado)

---

### 1.4. Logout

**Objetivo:** Verificar se o usuário consegue fazer logout.

**Passos:**
1. Faça login no sistema
2. Clique no botão "Sair" no menu superior
3. Confirme o logout

**Resultado Esperado:**
- ✅ Usuário é deslogado
- ✅ Redirecionamento para a página inicial
- ✅ Token removido do localStorage

---

## 2. Testes de Configuração de Loja

### 2.1. Onboarding - Configuração Inicial da Loja

**Objetivo:** Verificar se o usuário consegue configurar sua loja após o cadastro.

**Passos:**
1. Após o cadastro, você será redirecionado para `onboarding.html`
2. Preencha os campos:
   - Nome da loja
   - Slug (URL personalizada - será gerado automaticamente)
   - Telefone
   - WhatsApp
   - Descrição da loja
3. Clique em "Salvar e Continuar"

**Resultado Esperado:**
- ✅ Mensagem de sucesso: "Loja configurada com sucesso!"
- ✅ Redirecionamento para o dashboard
- ✅ Loja criada no sistema

**Cenários de Erro a Testar:**
- ❌ Slug já existe (deve sugerir outro)
- ❌ Campos obrigatórios vazios
- ❌ Slug com caracteres inválidos

---

### 2.2. Editar Configurações da Loja

**Objetivo:** Verificar se o usuário consegue editar as informações da loja.

**Passos:**
1. Faça login no sistema
2. Acesse: `http://localhost:8080/configuracoes.html`
3. Na seção "Informações da Loja", edite os campos:
   - Nome da loja
   - Slug
   - Telefone
   - WhatsApp
   - Email
   - Endereço
   - Cidade
   - Estado
   - Descrição
4. Clique em "Salvar Alterações"

**Resultado Esperado:**
- ✅ Mensagem de sucesso: "Configurações salvas com sucesso!"
- ✅ Alterações salvas no banco de dados
- ✅ Dados atualizados na tela

**Cenários de Erro a Testar:**
- ❌ Slug já existe (deve mostrar erro)
- ❌ Campos obrigatórios vazios

---

## 3. Testes de Gerenciamento de Veículos

### 3.1. Cadastrar Novo Veículo

**Objetivo:** Verificar se o usuário consegue cadastrar um novo veículo.

**Passos:**
1. Faça login no sistema
2. Acesse: `http://localhost:8080/veiculos-novo.html`
3. Preencha o formulário:

   **Informações Básicas:**
   - Marca (selecione)
   - Modelo (digite, ex: "Civic Touring")
   - Ano (digite, ex: 2023)
   - Quilometragem (digite, ex: 50000)
   - Preço (digite, ex: 150000)
   - Combustível (selecione)
   - Câmbio (selecione)
   - Cor (digite, ex: "Prata")

   **Descrição:**
   - Adicione uma descrição do veículo

   **Opcionais:**
   - Adicione opcionais (ex: "Couro", "Teto Solar")

   **Fotos:**
   - Faça upload de imagens (arraste ou clique)

   **Status:**
   - Selecione o status (Disponível, Reservado, Vendido)

4. Clique em "Salvar Veículo"

**Resultado Esperado:**
- ✅ Mensagem de sucesso: "Veículo salvo com sucesso!"
- ✅ Redirecionamento para a lista de veículos
- ✅ Veículo aparece na lista

**Cenários de Erro a Testar:**
- ❌ Campos obrigatórios vazios
- ❌ Ano inválido (menor que 1900 ou maior que 2100)
- ❌ Quilometragem negativa
- ❌ Preço negativo
- ❌ Loja não configurada (deve mostrar erro específico)

---

### 3.2. Listar Veículos

**Objetivo:** Verificar se a lista de veículos está funcionando corretamente.

**Passos:**
1. Faça login no sistema
2. Acesse: `http://localhost:8080/veiculos.html`
3. Verifique se os veículos cadastrados aparecem na lista

**Resultado Esperado:**
- ✅ Lista de veículos exibida
- ✅ Informações corretas (marca, modelo, ano, preço)
- ✅ Imagens exibidas (se houver)
- ✅ Status visível

**Funcionalidades a Testar:**
- 🔍 Busca por marca/modelo
- 🔍 Filtro por status
- 📄 Paginação (se implementada)

---

### 3.3. Visualizar Detalhes do Veículo

**Objetivo:** Verificar se os detalhes do veículo são exibidos corretamente.

**Passos:**
1. Na lista de veículos, clique em um veículo
2. Ou acesse diretamente a página de detalhes

**Resultado Esperado:**
- ✅ Todas as informações do veículo exibidas
- ✅ Imagens exibidas corretamente
- ✅ Opcionais listados
- ✅ Descrição completa visível

---

### 3.4. Editar Veículo

**Objetivo:** Verificar se o usuário consegue editar um veículo existente.

**Passos:**
1. Na lista de veículos, clique em "Editar" (se disponível)
2. Ou acesse a página de edição
3. Modifique os campos desejados
4. Clique em "Salvar"

**Resultado Esperado:**
- ✅ Alterações salvas
- ✅ Mensagem de sucesso
- ✅ Dados atualizados na lista

---

### 3.5. Excluir Veículo

**Objetivo:** Verificar se o usuário consegue excluir um veículo.

**Passos:**
1. Na lista de veículos, clique em "Excluir"
2. Confirme a exclusão no diálogo
3. Verifique se o veículo foi removido

**Resultado Esperado:**
- ✅ Diálogo de confirmação aparece
- ✅ Mensagem de sucesso: "Veículo excluído com sucesso!"
- ✅ Veículo removido da lista

**Cenários a Testar:**
- ❌ Cancelar a exclusão (não deve excluir)
- ✅ Confirmar a exclusão (deve excluir)

---

## 4. Testes de Catálogo Público

### 4.1. Acessar Catálogo Público

**Objetivo:** Verificar se o catálogo público está acessível.

**Passos:**
1. Acesse: `http://localhost:8080/catalogo.html?store_slug=slug-da-loja`
2. Substitua `slug-da-loja` pelo slug da sua loja

**Resultado Esperado:**
- ✅ Página do catálogo carrega
- ✅ Informações da loja exibidas
- ✅ Lista de veículos disponíveis
- ✅ Apenas veículos com status "Disponível" aparecem

---

### 4.2. Filtrar Veículos no Catálogo

**Objetivo:** Verificar se os filtros funcionam no catálogo público.

**Passos:**
1. No catálogo público, use os filtros:
   - Busca por marca/modelo
   - Ano mínimo/máximo
   - Preço máximo
   - Câmbio
2. Verifique se os resultados são filtrados

**Resultado Esperado:**
- ✅ Filtros aplicados corretamente
- ✅ Resultados atualizados em tempo real
- ✅ Mensagem quando não há resultados

---

### 4.3. Visualizar Detalhes do Veículo no Catálogo

**Objetivo:** Verificar se os detalhes do veículo são exibidos no catálogo público.

**Passos:**
1. No catálogo, clique em um veículo
2. Ou acesse: `catalogo.html?store_slug=slug&vehicle_id=id`

**Resultado Esperado:**
- ✅ Detalhes completos do veículo
- ✅ Imagens exibidas
- ✅ Botão de contato (WhatsApp) visível
- ✅ Informações de contato da loja

---

### 4.4. Criar Lead pelo Catálogo Público

**Objetivo:** Verificar se um visitante consegue criar um lead pelo catálogo.

**Passos:**
1. No catálogo público, visualize um veículo
2. Preencha o formulário de contato:
   - Nome
   - Telefone ou Email
   - Mensagem (opcional)
3. Clique em "Enviar" ou "Entrar em Contato"

**Resultado Esperado:**
- ✅ Lead criado com sucesso
- ✅ Mensagem de confirmação
- ✅ Lead aparece no painel do vendedor

---

## 5. Testes de Leads

### 5.1. Visualizar Lista de Leads

**Objetivo:** Verificar se a lista de leads está funcionando.

**Passos:**
1. Faça login no sistema
2. Acesse: `http://localhost:8080/leads.html`
3. Verifique se os leads aparecem na lista

**Resultado Esperado:**
- ✅ Lista de leads exibida
- ✅ Informações do lead (nome, contato, veículo, data)
- ✅ Status do lead visível

---

### 5.2. Filtrar Leads

**Objetivo:** Verificar se os filtros de leads funcionam.

**Passos:**
1. Na página de leads, use os filtros:
   - Busca por nome/contato
   - Filtro por status (Novo, Em Contato, Interessado, etc.)
2. Verifique se os resultados são filtrados

**Resultado Esperado:**
- ✅ Filtros aplicados corretamente
- ✅ Resultados atualizados

---

### 5.3. Atualizar Status do Lead

**Objetivo:** Verificar se o usuário consegue atualizar o status de um lead.

**Passos:**
1. Na lista de leads, selecione um novo status no dropdown
2. Aguarde a atualização

**Resultado Esperado:**
- ✅ Mensagem de sucesso: "Status do lead atualizado com sucesso!"
- ✅ Status atualizado na lista
- ✅ Mudança salva no banco de dados

---

### 5.4. Excluir Lead

**Objetivo:** Verificar se o usuário consegue excluir um lead.

**Passos:**
1. Na lista de leads, clique em "Excluir"
2. Confirme a exclusão

**Resultado Esperado:**
- ✅ Lead removido da lista
- ✅ Mensagem de confirmação

---

## 6. Testes de Dashboard e Relatórios

### 6.1. Visualizar Dashboard

**Objetivo:** Verificar se o dashboard está funcionando corretamente.

**Passos:**
1. Faça login no sistema
2. Acesse: `http://localhost:8080/dashboard.html`
3. Verifique as informações exibidas

**Resultado Esperado:**
- ✅ Estatísticas gerais (total de veículos, leads, etc.)
- ✅ Gráficos e métricas
- ✅ Veículos recentes
- ✅ Leads recentes

---

### 6.2. Visualizar Relatórios

**Objetivo:** Verificar se os relatórios estão funcionando.

**Passos:**
1. Acesse: `http://localhost:8080/relatorios.html`
2. Verifique os relatórios disponíveis

**Resultado Esperado:**
- ✅ Estatísticas do dashboard
- ✅ Top veículos mais vistos
- ✅ Estatísticas mensais
- ✅ Gráficos exibidos corretamente

---

## 7. Testes de Configurações

### 7.1. Configurar Notificações

**Objetivo:** Verificar se o usuário consegue configurar as notificações.

**Passos:**
1. Acesse: `http://localhost:8080/configuracoes.html`
2. Na seção "Notificações", marque/desmarque as opções:
   - Email para novos leads
   - Relatório semanal
   - Atualizações da plataforma
3. Clique em "Salvar Alterações"

**Resultado Esperado:**
- ✅ Mensagem de sucesso: "Configurações salvas com sucesso!"
- ✅ Preferências salvas
- ✅ Configurações mantidas após logout/login

---

## 8. Testes de Responsividade

### 8.1. Teste em Desktop

**Objetivo:** Verificar se o sistema funciona bem em telas grandes.

**Passos:**
1. Acesse o sistema em um navegador desktop
2. Teste todas as funcionalidades principais
3. Verifique o layout e usabilidade

**Resultado Esperado:**
- ✅ Layout responsivo
- ✅ Elementos bem posicionados
- ✅ Navegação fluida

---

### 8.2. Teste em Tablet

**Objetivo:** Verificar se o sistema funciona bem em tablets.

**Passos:**
1. Redimensione o navegador para tamanho de tablet (768px - 1024px)
2. Ou use o DevTools do navegador (F12) para simular tablet
3. Teste as funcionalidades principais

**Resultado Esperado:**
- ✅ Layout adaptado para tablet
- ✅ Menu lateral funcional
- ✅ Formulários utilizáveis

---

### 8.3. Teste em Mobile

**Objetivo:** Verificar se o sistema funciona bem em smartphones.

**Passos:**
1. Redimensione o navegador para tamanho mobile (320px - 767px)
2. Ou use o DevTools do navegador (F12) para simular mobile
3. Teste as funcionalidades principais

**Resultado Esperado:**
- ✅ Layout adaptado para mobile
- ✅ Menu hambúrguer funcional
- ✅ Formulários utilizáveis
- ✅ Botões com tamanho adequado para toque

---

## 9. Testes de Performance

### 9.1. Tempo de Carregamento

**Objetivo:** Verificar se as páginas carregam em tempo razoável.

**Passos:**
1. Abra o DevTools (F12)
2. Vá na aba "Network"
3. Recarregue a página (Ctrl+R)
4. Verifique o tempo de carregamento

**Resultado Esperado:**
- ✅ Páginas carregam em menos de 3 segundos
- ✅ Imagens otimizadas
- ✅ Recursos carregados de forma eficiente

---

### 9.2. Uso de Memória

**Objetivo:** Verificar se o sistema não consome muita memória.

**Passos:**
1. Abra o DevTools (F12)
2. Vá na aba "Performance" ou "Memory"
3. Use o sistema normalmente
4. Monitore o uso de memória

**Resultado Esperado:**
- ✅ Uso de memória razoável
- ✅ Sem vazamentos de memória
- ✅ Performance estável

---

## 10. Testes de Segurança

### 10.1. Autenticação

**Objetivo:** Verificar se a autenticação está funcionando corretamente.

**Testes:**
- ✅ Tentar acessar páginas protegidas sem login (deve redirecionar)
- ✅ Token expirado deve forçar novo login
- ✅ Logout deve invalidar o token

---

### 10.2. Validação de Dados

**Objetivo:** Verificar se os dados são validados corretamente.

**Testes:**
- ✅ Tentar enviar dados inválidos (deve mostrar erro)
- ✅ Tentar SQL injection (deve ser bloqueado)
- ✅ Tentar XSS (deve ser sanitizado)

---

## 📝 Checklist de Testes

Use este checklist para garantir que todos os testes foram realizados:

### Cadastro e Autenticação
- [ ] Cadastro de novo usuário
- [ ] Login
- [ ] Recuperação de senha
- [ ] Logout

### Configuração de Loja
- [ ] Onboarding
- [ ] Editar configurações da loja

### Gerenciamento de Veículos
- [ ] Cadastrar novo veículo
- [ ] Listar veículos
- [ ] Visualizar detalhes
- [ ] Editar veículo
- [ ] Excluir veículo

### Catálogo Público
- [ ] Acessar catálogo
- [ ] Filtrar veículos
- [ ] Visualizar detalhes
- [ ] Criar lead

### Leads
- [ ] Visualizar lista
- [ ] Filtrar leads
- [ ] Atualizar status
- [ ] Excluir lead

### Dashboard e Relatórios
- [ ] Visualizar dashboard
- [ ] Visualizar relatórios

### Configurações
- [ ] Configurar notificações

### Responsividade
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

---

## 🐛 Como Reportar Problemas

Ao encontrar um problema durante os testes:

1. **Anote o problema:**
   - O que você estava fazendo?
   - Qual página/funcionalidade?
   - Qual foi o resultado esperado?
   - Qual foi o resultado real?

2. **Capture evidências:**
   - Screenshot do erro
   - Mensagem de erro completa
   - Console do navegador (F12)

3. **Informações do ambiente:**
   - Navegador e versão
   - Sistema operacional
   - Tamanho da tela

---

## ✅ Critérios de Aceitação

Um teste é considerado **aprovado** quando:
- ✅ A funcionalidade funciona como esperado
- ✅ Mensagens de sucesso/erro são claras
- ✅ Interface é intuitiva e responsiva
- ✅ Performance é aceitável
- ✅ Não há erros no console

Um teste é considerado **reprovado** quando:
- ❌ Funcionalidade não funciona
- ❌ Mensagens de erro não aparecem ou são confusas
- ❌ Interface quebrada ou não responsiva
- ❌ Performance ruim
- ❌ Erros no console

---

**Última atualização:** 2024-12-05







