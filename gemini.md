# 🛒 MEU MERCADO — Guia de Arquitetura e Desenvolvimento (gemini.md)

Este documento orienta o desenvolvimento contínuo do projeto **Meu Mercado**, especificando a estrutura do sistema, tecnologias empregadas, rotinas de execução local e diretrizes para o agente de IA (Gemini / Antigravity) e desenvolvedores.

---

## 📌 Visão Geral do Projeto

O **Meu Mercado** é um PWA (Progressive Web App) moderno para gerenciamento de compras de supermercado e controle de despensa inteligente familiar. Possui reconhecimento de voz avançado (com inteligência para interpretar produtos, quantidades e preços simultaneamente), feedback sonoro e tátil nativo, suporte a itens fracionados por peso (kg), múltiplos perfis de família e sincronização com **Google Sheets** (via Google Apps Script) e o sistema **Meu Financeiro**.

- **Hospedagem Frontend:** Firebase Hosting (Projeto: `meu-mercado-1db5c`)
- **Backend / Banco de Dados:** Google Sheets + Google Apps Script (GAS)
- **Integração Externa:** Meu Financeiro (`https://meu-financeiro-39138.web.app`)

---

## 📂 Estrutura do Repositório

```text
MEU MERCADO/
├── .firebase/                  # Cache e metadados de hosting do Firebase
├── .firebaserc                 # Configuração do projeto Firebase (meu-mercado-1db5c)
├── .gitignore                  # Arquivos e pastas ignorados no controle de versão
├── firebase.json               # Configurações de rotas e rewrites do Firebase Hosting
├── package.json                # Gerenciamento de scripts, dependências e ferramentas de dev
├── gemini.md                   # Diretrizes técnicas do projeto e instruções de desenvolvimento
├── public/                     # Frontend da aplicação (PWA servido aos usuários)
│   ├── index.html              # Interface do usuário (telas: Início, Compras, Listas, Modais)
│   ├── app.js                  # Lógica central da aplicação, catálogo, parser de voz e sincronização
│   ├── app.css                 # Folha de estilo completa, responsiva, temas claro e escuro
│   ├── audio.js                # Motor de sintetizador de som puro (Web Audio API) e vibração
│   ├── sw.js                   # Service Worker para cache e funcionamento 100% offline
│   ├── manifest.json           # Manifesto PWA (ícones, cores de tema e inicialização)
│   ├── favicon.png             # Ícone do navegador
│   ├── apple-touch-icon.png    # Ícone para iOS
│   └── icons/                  # Ícones PWA em diferentes resoluções (192px, 512px, maskable)
└── MEU MERCADO/                # Scripts do Google Apps Script (Backend & Planilhas)
    ├── Codigo.gs               # Banco de dados na planilha, tabelas, categorias, produtos e CRUD
    ├── INTEGRACAO_FINANCEIRO.gs# Comunicação e envio de compras para o Meu Financeiro
    ├── Index.html              # Interface legada/alternativa do WebApp Google Apps Script
    ├── Estilos.html            # Estilos do WebApp Google Apps Script
    └── pagina-voz-github.html  # Página auxiliar de testes para transcrição de voz
```

---

## 🛠️ Tecnologias e Bibliotecas

| Componente | Tecnologia | Finalidade |
|---|---|---|
| **Frontend UI** | HTML5 Semântico, CSS3 Moderno, JavaScript ES6+ Puro | Rápido, sem overhead de frameworks, suporte nativo PWA |
| **Voz & IA Local** | Web Speech API (`webkitSpeechRecognition`) | Transcrição de voz em tempo real em português brasileiro |
| **Áudio & Háptico** | Web Audio API + Vibration API | Efeitos sonoros sem arquivos externos (bips e sinos de conclusão) |
| **Armazenamento Local**| LocalStorage (`meu_mercado_v2_4_`) | Persistência local imediata offline-first |
| **Hospedagem** | Firebase Hosting & Firebase Tools | Deploy rápido em CDN global com certificado SSL automático |
| **Servidor Dev Local** | `live-server` / `serve` | Servidor local com recarregamento automático (live reload) |
| **Backend & Sheets** | Google Apps Script (`clasp`) | Integração com planilhas Google Sheets e endpoints REST |

---

## 🚀 Como Rodar e Testar Localmente

### 1. Pré-requisitos
- Node.js instalado (v18+)
- Dependências instaladas (`npm install`)

### 2. Comandos Disponíveis

```bash
# Iniciar o servidor local de desenvolvimento com Live Reload (porta 3000):
npm run dev
# ou
npm start

# Visualizar a aplicação com o pacote serve:
npm run preview

# Testar localmente com o emulador do Firebase Hosting:
npm run serve:firebase

# Realizar o deploy da versão para produção no Firebase Hosting:
npm run deploy
```

> [!NOTE]
> A Web Speech API e o Service Worker requerem um contexto seguro (`https://` ou `localhost`). O servidor em `http://localhost:3000` atende integralmente a esse requisito.

---

## 🧠 Lógica e Módulos Centrais

### 1. Parser de Voz Inteligente (`public/app.js`)
O sistema aceita comandos naturais pelo microfone:
- **Exemplo 1 (Item Completo):** *"Leite integral cinco reais e setenta centavos"* ou *"Arroz 5 kg 29 e 90"*. O parser extrai o nome do produto no catálogo, a quantidade falada e o preço unitário.
- **Exemplo 2 (Microfone no Item no Supermercado):** Ao editar um item diretamente no carrinho, comandos como *"Sete a 5,70"*, *"5 e 70"* ou *"Sete, 5 e 70"* atualizam quantidade e valor sem truncar números ou confundir centavos (evita o problema clássico de 70 vs 75).
- **Tratamento de Números por Extenso:** Dicionário `PALAVRAS_NUMEROS` converte palavras como *dois, dez, vinte, trinta, etc.* diretamente em valores numéricos.

### 2. Motor de Som Sintetizado (`public/audio.js`)
- Não depende de arquivos de áudio externos (.mp3/.wav), garantindo latência zero e 100% de disponibilidade offline.
- Som de adição/checkbox: Onda triangular sintetizada com rampa rápida de frequência.
- Som de finalização de compras: Arpejo musical maior (Dó, Mi, Sol, Dó agudo) sintetizado em ondas senoidais + vibração tripla no celular.

### 3. Integração com Google Sheets e Meu Financeiro
- `CONFIG.GAS_WEBAPP_URL`: Endpoint que recebe e sincroniza a lista de compras concluída com a planilha oficial.
- `CONFIG.FINANCEIRO_URL`: Redirecionamento e integração com o sistema **Meu Financeiro**, permitindo que os gastos do supermercado alimentem automaticamente o fluxo de caixa familiar.

---

## 📋 Diretrizes para Desenvolvimento Futuro

1. **Preservação de Código Puro:** Mantenha a arquitetura Vanilla JS no frontend sem introduzir dependências pesadas desnecessárias, visando carregamento instantâneo em smartphones.
2. **Offline-First:** Qualquer alteração no estado deve ser persistida primeiro no `localStorage` antes de tentar sincronizações em rede.
3. **Padrão de Cores e Estilos:** Utilize as variáveis CSS declaradas no topo de `public/app.css` (`--cor-marca`, `--cor-fundo`, `--cor-card`, etc.) para garantir compatibilidade perfeita entre o tema Claro e o tema Noturno.
4. **Deploy Seguro:** Antes de executar `npm run deploy`, verifique se as alterações no `public/app.js` e `public/index.html` não quebraram o Service Worker ou a renderização dos componentes principais.
