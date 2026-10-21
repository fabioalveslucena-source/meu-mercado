/**
 * ============================================================================
 * 🛒 MOTOR DA APLICAÇÃO — MEU MERCADO (PWA 2026 v2.4)
 * ============================================================================
 * Atualizações de Ponta:
 * 1. 🎙️ Item por Voz Completo: fala produto, quantidade e preço de uma vez só sem corte prematuro!
 * 2. 🎙️ Microfone do Item no Supermercado: entende "Sete, 5,70", "7 a 5,70" ou "5,70" com prévia em tempo real (evita bugs de 75 x 70).
 * 3. ⚖️ Suporte Completo a Itens por Peso (kg): Tomate italiano, carnes e frutas permitem 1,0 kg, 0,5 kg, 1,5 kg com modal de peso direto.
 * 4. 📋 Seletor de Listas Amplo & Sem Cortes de Texto no Supermercado.
 * 5. 💡 Seção Despensa ("O que está faltando em casa") com design moderno, filtros por categoria e adição em 1 toque.
 * 6. 👨‍👩‍👧 Perfil da Família com Fábio Administrador e alternador de tema claro/escuro.
 */

const CONFIG = {
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyVzn-uiAsqoXOxDGDqeVTTr3pFWPEc6SfqmiTH8j3YTAnr4MPrKRAXtQjbPI7VHp3x9w/exec',
  FINANCEIRO_URL: 'https://meu-financeiro-39138.web.app',
  STORAGE_PREFIX: 'meu_mercado_v2_4_'
};

// ============================================================================
// CATÁLOGO OFICIAL COMPLETO (BASE DE DADOS DO GOOGLE SHEETS)
// ============================================================================
const CATALOGO_BASE = [
  // MERCEARIA
  { nome: 'Arroz branco 5 kg', categoria: '🥫 Mercearia', precoMedio: 29.90, icone: '🍚' },
  { nome: 'Feijão preto 1 kg', categoria: '🥫 Mercearia', precoMedio: 8.90, icone: '🫘' },
  { nome: 'Feijão carioca 1 kg', categoria: '🥫 Mercearia', precoMedio: 8.50, icone: '🫘' },
  { nome: 'Óleo de soja 900 ml', categoria: '🥫 Mercearia', precoMedio: 6.90, icone: '🍾' },
  { nome: 'Azeite de oliva 500 ml', categoria: '🥫 Mercearia', precoMedio: 36.90, icone: '🫒' },
  { nome: 'Extrato de tomate', categoria: '🥫 Mercearia', precoMedio: 4.50, icone: '🥫' },
  { nome: 'Molho de tomate', categoria: '🥫 Mercearia', precoMedio: 3.20, icone: '🥫' },
  { nome: 'Batata palha', categoria: '🥫 Mercearia', precoMedio: 7.90, icone: '🍟' },
  { nome: 'Macarrão espaguete 500 g', categoria: '🥫 Mercearia', precoMedio: 4.80, icone: '🍝' },
  { nome: 'Café torrado 500g', categoria: '🥫 Mercearia', precoMedio: 19.90, icone: '☕' },
  { nome: 'Açúcar refinado 1 kg', categoria: '🥫 Mercearia', precoMedio: 4.90, icone: '🍬' },
  { nome: 'Sal refinado 1 kg', categoria: '🥫 Mercearia', precoMedio: 2.80, icone: '🧂' },
  { nome: 'Farinha de trigo 1 kg', categoria: '🥫 Mercearia', precoMedio: 5.50, icone: '🌾' },
  { nome: 'Milho verde lata', categoria: '🥫 Mercearia', precoMedio: 4.20, icone: '🌽' },
  { nome: 'Atum em pedaços', categoria: '🥫 Mercearia', precoMedio: 8.90, icone: '🐟' },

  // LATICÍNIOS & FRIOS
  { nome: 'Leite integral 1 L', categoria: '🧀 Laticínios', precoMedio: 5.70, icone: '🥛' },
  { nome: 'Leite desnatado 1 L', categoria: '🧀 Laticínios', precoMedio: 5.80, icone: '🥛' },
  { nome: 'Creme de leite', categoria: '🧀 Laticínios', precoMedio: 3.80, icone: '🧁' },
  { nome: 'Leite condensado', categoria: '🧀 Laticínios', precoMedio: 6.50, icone: '🥫' },
  { nome: 'Manteiga com sal', categoria: '🧀 Laticínios', precoMedio: 12.90, icone: '🧈' },
  { nome: 'Requeijão cremoso', categoria: '🧀 Laticínios', precoMedio: 8.90, icone: '🥣' },
  { nome: 'Queijo muçarela (kg)', categoria: '🧀 Laticínios', precoMedio: 45.90, icone: '🧀' },
  { nome: 'Iogurte natural', categoria: '🧀 Laticínios', precoMedio: 4.20, icone: '🍶' },

  // CARNES
  { nome: 'Carne bovina (kg)', categoria: '🥩 Carnes', precoMedio: 38.90, icone: '🥩' },
  { nome: 'Carne moída (kg)', categoria: '🥩 Carnes', precoMedio: 29.90, icone: '🥩' },
  { nome: 'Peito de frango (kg)', categoria: '🥩 Carnes', precoMedio: 19.90, icone: '🍗' },
  { nome: 'Bife alcatra (kg)', categoria: '🥩 Carnes', precoMedio: 44.90, icone: '🥩' },
  { nome: 'Linguiça toscana (kg)', categoria: '🥩 Carnes', precoMedio: 22.90, icone: '🌭' },
  { nome: 'Bacon em cubos', categoria: '🥩 Carnes', precoMedio: 14.90, icone: '🥓' },

  // HORTIFRÚTI
  { nome: 'Tomate italiano (kg)', categoria: '🥬 Hortifrúti', precoMedio: 8.90, icone: '🍅' },
  { nome: 'Cebola (kg)', categoria: '🥬 Hortifrúti', precoMedio: 5.80, icone: '🧅' },
  { nome: 'Alho (pct)', categoria: '🥬 Hortifrúti', precoMedio: 6.90, icone: '🧄' },
  { nome: 'Batata inglesa (kg)', categoria: '🥬 Hortifrúti', precoMedio: 6.50, icone: '🥔' },
  { nome: 'Cenoura (kg)', categoria: '🥬 Hortifrúti', precoMedio: 5.20, icone: '🥕' },
  { nome: 'Banana prata (kg)', categoria: '🥬 Hortifrúti', precoMedio: 7.50, icone: '🍌' },
  { nome: 'Maçã nacional (kg)', categoria: '🥬 Hortifrúti', precoMedio: 9.80, icone: '🍎' },
  { nome: 'Alface americana', categoria: '🥬 Hortifrúti', precoMedio: 4.50, icone: '🥬' },

  // LIMPEZA
  { nome: 'Sabão em pó 1.6kg', categoria: '🧼 Limpeza', precoMedio: 19.90, icone: '🧼' },
  { nome: 'Detergente líquido', categoria: '🧼 Limpeza', precoMedio: 2.50, icone: '🧴' },
  { nome: 'Amaciante de roupas 2L', categoria: '🧼 Limpeza', precoMedio: 16.90, icone: '🧴' },
  { nome: 'Desinfetante 1L', categoria: '🧼 Limpeza', precoMedio: 6.90, icone: '🧹' },
  { nome: 'Água sanitária 2L', categoria: '🧼 Limpeza', precoMedio: 5.50, icone: '🧴' },
  { nome: 'Esponja de aço', categoria: '🧼 Limpeza', precoMedio: 3.20, icone: '🧽' },
  { nome: 'Papel toalha', categoria: '🧼 Limpeza', precoMedio: 5.90, icone: '🧻' },

  // HIGIENE
  { nome: 'Papel higiênico 12un', categoria: '🧴 Higiene', precoMedio: 22.90, icone: '🧻' },
  { nome: 'Sabonete em barra', categoria: '🧴 Higiene', precoMedio: 3.20, icone: '🧼' },
  { nome: 'Creme dental', categoria: '🧴 Higiene', precoMedio: 4.90, icone: '🪥' },
  { nome: 'Shampoo', categoria: '🧴 Higiene', precoMedio: 16.90, icone: '🧴' }
];

const PALAVRAS_NUMEROS = {
  'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'tres': 3, 'três': 3,
  'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9,
  'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14,
  'catorze': 14, 'quinze': 15, 'dezesseis': 16, 'dezessete': 17,
  'dezoito': 18, 'dezenove': 19, 'vinte': 20, 'trinta': 30, 'quarenta': 40,
  'cinquenta': 50, 'sessenta': 60, 'setenta': 70, 'oitenta': 80, 'noventa': 90
};

// ============================================================================
// ESTADO GLOBAL
// ============================================================================
let appState = {
  usuarioAtivoId: 'u_fabio',
  usuariosFamilia: [
    { id: 'u_fabio', nome: 'Fábio Lucena', papel: 'Administrador 👑', avatar: '👨‍💼', fotoUrl: '' },
    { id: 'u_secretaria', nome: 'Secretária', papel: 'Preparação da Lista', avatar: '👩‍🍳', fotoUrl: '' },
    { id: 'u_esposa', nome: 'Esposa', papel: 'Família', avatar: '👩‍💼', fotoUrl: '' }
  ],
  tema: 'claro',
  listaAtivaId: 'lst_1',
  listas: [
    {
      id: 'lst_1',
      nome: 'Compras do Mês',
      status: 'ABERTA',
      dataCriacao: new Date().toISOString(),
      orcamentoMeta: 350.00
    }
  ],
  itens: [
    { id: 'i1', idLista: 'lst_1', produto: 'Arroz branco 5 kg', categoria: '🥫 Mercearia', quantidade: 1, precoUnitario: 29.90, comprado: true },
    { id: 'i2', idLista: 'lst_1', produto: 'Feijão preto 1 kg', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 8.90, comprado: true },
    { id: 'i3', idLista: 'lst_1', produto: 'Leite integral 1 L', categoria: '🧀 Laticínios', quantidade: 6, precoUnitario: 5.70, comprado: false },
    { id: 'i4', idLista: 'lst_1', produto: 'Café torrado 500g', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 19.90, comprado: false },
    { id: 'i5', idLista: 'lst_1', produto: 'Tomate italiano (kg)', categoria: '🥬 Hortifrúti', quantidade: 1, precoUnitario: 8.90, comprado: false },
    { id: 'i6', idLista: 'lst_1', produto: 'Detergente líquido', categoria: '🧼 Limpeza', quantidade: 3, precoUnitario: 2.50, comprado: false }
  ],
  produtosCatalogo: CATALOGO_BASE,
  historico: [],
  corredorAtivo: 'todos',
  filtroDespensaAtivo: 'todos',
  itemSendoEditado: null,
  valorTecladoBuffer: '0'
};

// Variáveis de Voz
let ditandoContinuo = false;
let reconhecimentoContinuo = null;
let itensDitadosBuffer = [];

let recVozCompleta = null;
let timeoutVozCompleta = null;
let itemVozCompletaDetectado = null;

let recVozItemRapido = null;
let timeoutVozItemRapido = null;
let idItemOuvidoAtual = null;
let dadosItemOuvidoDetectados = null;

let itemEditandoQtdId = null;

// ============================================================================
// PERSISTÊNCIA & INICIALIZAÇÃO
// ============================================================================
function salvarLocal() {
  try {
    localStorage.setItem(CONFIG.STORAGE_PREFIX + 'state', JSON.stringify(appState));
  } catch (e) {
    console.warn('Erro ao salvar local:', e);
  }
}

function carregarLocal() {
  try {
    const salvo = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'state');
    if (salvo) {
      const parsed = JSON.parse(salvo);
      appState = { ...appState, ...parsed };
    }
  } catch (e) {
    console.warn('Erro ao carregar local:', e);
  }
}

window.alternarTema = function() {
  if (appState.tema === 'escuro') {
    appState.tema = 'claro';
    document.body.classList.remove('tema-escuro');
    document.getElementById('btnTema').textContent = '🌙';
  } else {
    appState.tema = 'escuro';
    document.body.classList.add('tema-escuro');
    document.getElementById('btnTema').textContent = '☀️';
  }
  salvarLocal();
};

function aplicarTema() {
  const btn = document.getElementById('btnTema');
  if (appState.tema === 'escuro') {
    document.body.classList.add('tema-escuro');
    if (btn) btn.textContent = '☀️';
  } else {
    document.body.classList.remove('tema-escuro');
    if (btn) btn.textContent = '🌙';
  }
}

// ============================================================================
// NAVEGAÇÃO
// ============================================================================
window.abrirTela = function(idTela, botaoNav) {
  if (idTela !== 'telaPrepararLista' && ditandoContinuo) {
    pararDitadoContinuo();
  }

  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  const telaAlvo = document.getElementById(idTela);
  if (telaAlvo) {
    telaAlvo.classList.add('ativa');
  }

  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('ativo'));
  if (botaoNav) {
    botaoNav.classList.add('ativo');
  } else {
    if (idTela === 'telaInicio') document.getElementById('navInicio')?.classList.add('ativo');
    if (idTela === 'telaCompras') document.getElementById('navCompras')?.classList.add('ativo');
    if (idTela === 'telaListas') document.getElementById('navListas')?.classList.add('ativo');
  }

  renderizarTudo();
};

// ============================================================================
// CÁLCULOS
// ============================================================================
function calcularTotais(idLista = appState.listaAtivaId) {
  const itens = appState.itens.filter(i => i.idLista === idLista);
  let totalEstimado = 0;
  let totalCarrinho = 0;
  let itensComprados = 0;

  itens.forEach(item => {
    const subtotal = (Number(item.quantidade) || 1) * (Number(item.precoUnitario) || 0);
    totalEstimado += subtotal;
    if (item.comprado) {
      totalCarrinho += subtotal;
      itensComprados++;
    }
  });

  const lista = appState.listas.find(l => l.id === idLista);
  const meta = lista?.orcamentoMeta || 350.00;
  const percMeta = meta > 0 ? Math.min(Math.round((totalCarrinho / meta) * 100), 100) : 0;

  return {
    totalItens: itens.length,
    itensComprados,
    totalEstimado,
    totalCarrinho,
    meta,
    percMeta,
    nomeLista: lista?.nome || 'Minha Lista',
    statusLista: lista?.status || 'ABERTA',
    dataCriacao: lista?.dataCriacao || new Date().toISOString()
  };
}

// ============================================================================
// RENDERIZAÇÃO
// ============================================================================
function renderizarTudo() {
  renderizarCabecalhoPerfil();
  renderizarTermometro();
  renderizarTelaInicio();
  renderizarTelaCompras();
  renderizarTelaListas();
  salvarLocal();
}

function renderizarCabecalhoPerfil() {
  const usuario = appState.usuariosFamilia.find(u => u.id === appState.usuarioAtivoId) || appState.usuariosFamilia[0];
  const nomeDisplay = document.getElementById('topoNomeUsuario');
  const papelDisplay = document.getElementById('topoPapelUsuario');
  const avatarContainer = document.getElementById('avatarUsuario');

  if (nomeDisplay) nomeDisplay.textContent = usuario.nome;
  if (papelDisplay) papelDisplay.textContent = usuario.papel;

  if (avatarContainer) {
    if (usuario.fotoUrl) {
      avatarContainer.innerHTML = `<img src="${usuario.fotoUrl}" alt="Foto de perfil" />`;
    } else {
      avatarContainer.textContent = usuario.avatar || '👨‍💼';
    }
  }
}

function renderizarTermometro() {
  const totais = calcularTotais();
  const elementoGasto = document.getElementById('termometroGasto');
  const elementoMeta = document.getElementById('termometroMeta');
  const barra = document.getElementById('termometroBarra');

  if (elementoGasto) elementoGasto.textContent = formatarMoeda(totais.totalCarrinho);
  if (elementoMeta) elementoMeta.textContent = `Meta: ${formatarMoeda(totais.meta)}`;

  if (barra) {
    barra.style.width = `${totais.percMeta}%`;
    barra.className = 'termometro-barra-progresso';
    if (totais.percMeta >= 95) barra.classList.add('perigo');
    else if (totais.percMeta >= 80) barra.classList.add('alerta');
  }
}

// ============================================================================
// 1. TELA INÍCIO: REPOSIÇÃO MODERNA DA DESPENSA
// ============================================================================
function renderizarTelaInicio() {
  const totais = calcularTotais();
  const subCompras = document.getElementById('inicioSubCompras');
  if (subCompras) {
    subCompras.textContent = `${totais.nomeLista}: ${totais.itensComprados} de ${totais.totalItens} no carrinho (${formatarMoeda(totais.totalCarrinho)})`;
  }

  const grid = document.getElementById('gridProdutosReposicao');
  if (!grid) return;

  const itensNaLista = appState.itens.filter(i => i.idLista === appState.listaAtivaId);
  const nomesNaLista = itensNaLista.map(i => i.produto.toLowerCase());

  let catalogo = appState.produtosCatalogo;
  if (appState.filtroDespensaAtivo !== 'todos') {
    catalogo = catalogo.filter(p => p.categoria.includes(appState.filtroDespensaAtivo));
  }

  grid.innerHTML = catalogo.map(p => {
    const jaAdicionado = nomesNaLista.includes(p.nome.toLowerCase());
    return `
      <div class="card-produto-reposicao">
        <div class="card-prod-topo">
          <div class="card-prod-icone">${p.icone || '🛒'}</div>
          <div class="card-prod-info">
            <div class="card-prod-nome">${p.nome}</div>
            <div class="card-prod-preco">Média: ${formatarMoeda(p.precoMedio)}</div>
          </div>
        </div>

        <button class="btn-adicionar-reposicao ${jaAdicionado ? 'adicionado' : ''}" onclick="adicionarProdutoDoCatalogo('${p.nome}')">
          <span>${jaAdicionado ? '✓ Na Lista' : '+ Adicionar'}</span>
        </button>
      </div>
    `;
  }).join('');
}

window.filtrarSugestoesDespensa = function(categoria, botao) {
  appState.filtroDespensaAtivo = categoria;
  document.querySelectorAll('.pill-despensa').forEach(b => b.classList.remove('ativa'));
  if (botao) botao.classList.add('ativa');
  renderizarTelaInicio();
};

// ============================================================================
// 📝 PREPARAR LISTA — MODO DITADO CONTÍNUO DA DESPENSA (PARA SECRETÁRIA)
// ============================================================================
window.abrirPrepararLista = function() {
  itensDitadosBuffer = [];
  atualizarTagsDitadasUI();
  const dataHoje = new Date();
  const nomePadrao = `Compras ${dataHoje.getDate().toString().padStart(2, '0')}/${(dataHoje.getMonth() + 1).toString().padStart(2, '0')}`;
  const inputNome = document.getElementById('nomeListaPreparacao');
  if (inputNome) inputNome.value = nomePadrao;

  abrirTela('telaPrepararLista', null);
};

window.alternarDitadoContinuoDespensa = function() {
  if (ditandoContinuo) {
    pararDitadoContinuo();
  } else {
    iniciarDitadoContinuo();
  }
};

function iniciarDitadoContinuo() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Comando de voz contínuo não suportado neste navegador. Use o Chrome no celular.');
    return;
  }

  reconhecimentoContinuo = new SpeechRecognition();
  reconhecimentoContinuo.lang = 'pt-BR';
  reconhecimentoContinuo.continuous = true;
  reconhecimentoContinuo.interimResults = false;

  ditandoContinuo = true;
  const btn = document.getElementById('btnDitadoContinuo');
  const statusBox = document.getElementById('statusDitadoDespensa');

  if (btn) {
    btn.classList.add('ouvindo');
    btn.textContent = '⏹️';
  }
  if (statusBox) {
    statusBox.textContent = '🔴 Microfone Aberto! Fale os produtos com calma. Pode ir na despensa e falar no seu ritmo...';
    statusBox.style.color = '#ef4444';
  }

  window.SomMercado.bipItem();

  reconhecimentoContinuo.onresult = function(event) {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        let fala = event.results[i][0].transcript;
        console.log('🎙️ Fala capturada na despensa:', fala);
        adicionarItensAoBuffer(fala);
      }
    }
  };

  reconhecimentoContinuo.onerror = function(event) {
    console.log('Aviso no reconhecimento contínuo:', event.error);
  };

  reconhecimentoContinuo.onend = function() {
    if (ditandoContinuo) {
      try {
        reconhecimentoContinuo.start();
      } catch (e) {}
    }
  };

  try {
    reconhecimentoContinuo.start();
  } catch (err) {
    console.warn('Erro ao ligar mic:', err);
  }
}

function pararDitadoContinuo() {
  ditandoContinuo = false;
  if (reconhecimentoContinuo) {
    try {
      reconhecimentoContinuo.stop();
    } catch (e) {}
  }
  const btn = document.getElementById('btnDitadoContinuo');
  const statusBox = document.getElementById('statusDitadoDespensa');

  if (btn) {
    btn.classList.remove('ouvindo');
    btn.textContent = '🎙️';
  }
  if (statusBox) {
    statusBox.textContent = 'Microfone pausado. Clique no microfone para continuar falando ou em "Salvar Lista" abaixo.';
    statusBox.style.color = 'var(--texto-principal)';
  }
}

function adicionarItensAoBuffer(fala) {
  let limpa = fala.replace(/[.?!]/g, ' ').toLowerCase().trim();
  let pedacos = limpa.split(/[,;\n]|\s+e\s+|\s+mais\s+/i).map(p => p.trim()).filter(p => p.length > 0);

  pedacos.forEach(p => {
    const info = extrairProdutoEQuantidade(p);
    itensDitadosBuffer.push(info);
    window.SomMercado.bipItem();
  });

  atualizarTagsDitadasUI();
}

function extrairProdutoEQuantidade(texto) {
  let termo = texto.trim();
  let qtd = 1;

  const matchNum = termo.match(/^(\d+(?:[,\.]\d+)?)\s*(?:unidades?|un|caixas?|pacotes?|latas?|kg|quilos?|litros?)?\s*(?:de\s+)?(.*)$/i);
  if (matchNum) {
    qtd = parseFloat(matchNum[1].replace(',', '.')) || 1;
    termo = matchNum[2].trim();
  } else {
    for (const pal in PALAVRAS_NUMEROS) {
      const reg = new RegExp('^' + pal + '\\s*(?:de\\s+)?(.*)$', 'i');
      const mExt = termo.match(reg);
      if (mExt) {
        qtd = PALAVRAS_NUMEROS[pal];
        termo = mExt[1].trim();
        break;
      }
    }
  }

  const achado = buscarNoCatalogo(termo);

  return {
    nome: achado.nome,
    categoria: achado.categoria,
    quantidade: qtd,
    precoUnitario: achado.precoMedio || 0
  };
}

function buscarNoCatalogo(termo) {
  if (!termo) return { nome: 'Produto', categoria: '📦 Outros', precoMedio: 0 };
  const limpo = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  for (const prod of appState.produtosCatalogo) {
    const prodLimpo = prod.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (prodLimpo.includes(limpo) || limpo.includes(prodLimpo)) {
      return prod;
    }
  }

  let cat = '📦 Outros';
  if (/leite|queijo|iogurte|manteiga|requeijao|creme/i.test(limpo)) cat = '🧀 Laticínios';
  else if (/carne|frango|bife|peito|linguica|bacon/i.test(limpo)) cat = '🥩 Carnes';
  else if (/tomate|cebola|alho|batata|fruta|banana|maca|alface|legume/i.test(limpo)) cat = '🥬 Hortifrúti';
  else if (/arroz|feijao|oleo|azeite|molho|cafe|acucar|sal|farinha|espaguete|macarrao/i.test(limpo)) cat = '🥫 Mercearia';
  else if (/sabao|detergente|amaciante|desinfetante|esponja|limpeza/i.test(limpo)) cat = '🧼 Limpeza';
  else if (/papel|sabonete|shampoo|pasta|escova|higiene/i.test(limpo)) cat = '🧴 Higiene';

  const nomeFormatado = termo.charAt(0).toUpperCase() + termo.slice(1);
  return { nome: nomeFormatado, categoria: cat, precoMedio: 0 };
}

function atualizarTagsDitadasUI() {
  const container = document.getElementById('containerTagsDitadas');
  const contador = document.getElementById('contadorItensDitados');
  if (contador) contador.textContent = `${itensDitadosBuffer.length} produtos anotados`;

  if (!container) return;
  if (itensDitadosBuffer.length === 0) {
    container.innerHTML = '<span style="color: var(--texto-suave); font-size: 13px; font-style: italic;">Nenhum produto falado ainda. Ative o microfone acima e diga o que falta na despensa...</span>';
    return;
  }

  container.innerHTML = itensDitadosBuffer.map((item, idx) => `
    <div class="tag-item-ditado">
      <span>${item.nome} (${item.quantidade}x)</span>
      <span class="btn-remover-tag" onclick="removerTagDitada(${idx})">✕</span>
    </div>
  `).join('');
}

window.removerTagDitada = function(idx) {
  itensDitadosBuffer.splice(idx, 1);
  atualizarTagsDitadasUI();
};

window.adicionarItemDigitadoManual = function(e) {
  if (e && e.key && e.key !== 'Enter') return;
  const input = document.getElementById('inputItemManualDespensa');
  const texto = input?.value.trim();
  if (!texto) return;

  adicionarItensAoBuffer(texto);
  input.value = '';
};

window.concluirPreparacaoLista = function() {
  pararDitadoContinuo();

  if (itensDitadosBuffer.length === 0) {
    alert('A secretária ainda não ditou nenhum produto. Fale os produtos ou digite antes de gerar a lista.');
    return;
  }

  const inputNome = document.getElementById('nomeListaPreparacao');
  const nome = inputNome?.value.trim() || `Compras ${new Date().toLocaleDateString('pt-BR')}`;

  const novaListaId = 'lst_' + Date.now();
  const novaLista = {
    id: novaListaId,
    nome: nome,
    status: 'ABERTA',
    dataCriacao: new Date().toISOString(),
    orcamentoMeta: 350.00
  };

  appState.listas.unshift(novaLista);
  appState.listaAtivaId = novaListaId;

  itensDitadosBuffer.forEach((item, i) => {
    appState.itens.push({
      id: 'i_' + Date.now() + '_' + i,
      idLista: novaListaId,
      produto: item.nome,
      categoria: item.categoria,
      quantidade: item.quantidade || 1,
      precoUnitario: item.precoUnitario || 0,
      comprado: false
    });
  });

  itensDitadosBuffer = [];
  window.SomMercado.bipItem();
  salvarLocal();

  alert(`✅ Lista "${novaLista.nome}" gerada com sucesso!\nTodos os itens foram preparados para o Fábio comprar no supermercado.`);
  abrirTela('telaCompras', document.getElementById('navCompras'));
};

// ============================================================================
// 🛒 TELA COMPRAS: SUPERMERCADO & ITENS COM SUPORTE A KG
// ============================================================================
function ehItemPorKg(item) {
  if (!item) return false;
  const nome = (item.produto || '').toLowerCase();
  const cat = (item.categoria || '').toLowerCase();
  return nome.includes('(kg)') || nome.includes(' kg') || cat.includes('hortifrúti') || cat.includes('carnes');
}

function renderizarTelaCompras() {
  const container = document.getElementById('listaItensCompras');
  const seletorListas = document.getElementById('seletorListaAtiva');
  const badgeStatus = document.getElementById('badgeStatusLista');
  const dataDisplay = document.getElementById('dataListaAtiva');
  const bannerFechada = document.getElementById('bannerListaFechada');
  const barraRodape = document.getElementById('barraFinalizarCompras');

  const totais = calcularTotais();

  // 1. Dropdown de Lista Ativa limpo e sem truncamentos
  if (seletorListas) {
    seletorListas.innerHTML = appState.listas.map(l => `
      <option value="${l.id}" ${l.id === appState.listaAtivaId ? 'selected' : ''}>
        🛒 ${l.nome}
      </option>
    `).join('');
  }

  // 2. Badge de Status (Aberta ou Fechada)
  if (badgeStatus) {
    if (totais.statusLista === 'ABERTA') {
      badgeStatus.className = 'badge-status-ativa';
      badgeStatus.textContent = 'Aberta';
    } else {
      badgeStatus.className = 'badge-status-fechada';
      badgeStatus.textContent = 'Finalizada';
    }
  }

  // 3. Data de criação
  if (dataDisplay) {
    const dataObj = new Date(totais.dataCriacao);
    dataDisplay.textContent = `📅 Criada em ${dataObj.toLocaleDateString('pt-BR')} às ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 4. Banner se estiver fechada
  if (totais.statusLista === 'FECHADA') {
    if (bannerFechada) bannerFechada.style.display = 'flex';
    if (barraRodape) barraRodape.style.display = 'none';
  } else {
    if (bannerFechada) bannerFechada.style.display = 'none';
    if (barraRodape) barraRodape.style.display = 'flex';
  }

  if (!container) return;

  let itens = appState.itens.filter(i => i.idLista === appState.listaAtivaId);
  if (appState.corredorAtivo !== 'todos') {
    itens = itens.filter(i => i.categoria.includes(appState.corredorAtivo));
  }

  if (itens.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--texto-secundario);">
        <div style="font-size: 40px; margin-bottom: 8px;">🛒</div>
        <strong style="font-size: 16px; color: var(--texto-principal);">Sua lista está vazia</strong>
        <p style="font-size: 13px; margin-top: 4px;">Adicione produtos pelo botão "+ Item por voz" acima.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = itens.map(item => {
    const porKg = ehItemPorKg(item);
    const qtdTexto = porKg ? `${String(item.quantidade).replace('.', ',')} kg` : item.quantidade;

    return `
      <div class="item-card ${item.comprado ? 'comprado' : ''}" id="card_${item.id}">
        <div class="item-checkbox" onclick="alternarItem('${item.id}')">
          ${item.comprado ? '✓' : ''}
        </div>

        <div class="item-info" onclick="alternarItem('${item.id}')">
          <div class="item-nome">${item.produto}</div>
          <div class="item-categoria">${item.categoria}</div>
        </div>

        <!-- Microfone inteligente no item do corredor -->
        <button class="btn-mic-item" id="mic_${item.id}" onclick="ouvirVozItemSupermercado('${item.id}')" title="Falar quantidade e preço (Ex: 'sete a 5,70' ou '5,70')">
          🎙️
        </button>

        <!-- Controle de Quantidade com suporte a Quilos e Toque para Digitar -->
        <div class="item-qtd-controle">
          <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', -1)">-</button>
          <span class="qtd-valor" onclick="abrirModalEditarQuantidade('${item.id}')" title="Tocar para ajustar peso exato">${qtdTexto}</span>
          <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', 1)">+</button>
        </div>

        <div class="item-preco-tag ${item.precoUnitario > 0 ? 'com-preco' : ''}" onclick="abrirTecladoPreco('${item.id}')">
          ${item.precoUnitario > 0 ? formatarMoeda(item.precoUnitario * item.quantidade) : 'R$ Preço'}
        </div>

        <button class="btn-excluir-item" onclick="excluirItem('${item.id}')" title="Excluir produto da lista">
          🗑️
        </button>
      </div>
    `;
  }).join('');
}

window.trocarListaComprasDropdown = function(idLista) {
  appState.listaAtivaId = idLista;
  window.SomMercado.bipItem();
  renderizarTudo();
};

// ============================================================================
// ⚖️ CONTROLE DE QUANTIDADE & PESO EM KG (PASSOS DE 0,5 KG OU DIRETO)
// ============================================================================
window.alterarQuantidade = function(idItem, direcao) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  const porKg = ehItemPorKg(item);
  const passo = porKg ? 0.5 : 1;
  const delta = direcao * passo;

  let nova = Math.round(((Number(item.quantidade) || 1) + delta) * 10) / 10;

  if (nova <= 0) {
    window.excluirItem(idItem);
  } else {
    item.quantidade = nova;
    renderizarTudo();
  }
};

window.abrirModalEditarQuantidade = function(idItem) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  itemEditandoQtdId = idItem;
  const titulo = document.getElementById('tituloEditarQtd');
  const input = document.getElementById('inputNovaQuantidade');

  if (titulo) titulo.textContent = `${item.produto}`;
  if (input) input.value = item.quantidade;

  document.getElementById('modalEditarQuantidade')?.classList.add('aberto');
};

window.fecharModalEditarQuantidade = function() {
  document.getElementById('modalEditarQuantidade')?.classList.remove('aberto');
  itemEditandoQtdId = null;
};

window.definirQtdRapida = function(valor) {
  const input = document.getElementById('inputNovaQuantidade');
  if (input) input.value = valor;
};

window.salvarNovaQuantidade = function() {
  if (!itemEditandoQtdId) return;
  const item = appState.itens.find(i => i.id === itemEditandoQtdId);
  if (!item) return;

  const input = document.getElementById('inputNovaQuantidade');
  const val = parseFloat(input?.value) || 1;

  if (val <= 0) {
    window.excluirItem(itemEditandoQtdId);
  } else {
    item.quantidade = Math.round(val * 100) / 100;
    window.SomMercado.bipItem();
    renderizarTudo();
  }

  fecharModalEditarQuantidade();
};

// ============================================================================
// 🎙️ MODAL 1: ITEM POR VOZ COMPLETO ("Creme de leite, quatro, 2,70 cada")
// ============================================================================
window.abrirModalVozCompleta = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Comando de voz não suportado neste navegador. Use o Google Chrome.');
    return;
  }

  const modal = document.getElementById('modalVozCompleta');
  const statusTexto = document.getElementById('textoStatusVoz');
  const transcricao = document.getElementById('textoFaladoEmTempoReal');
  const cardPreview = document.getElementById('cardItemInterpretado');
  const btnConfirmar = document.getElementById('btnConfirmarVozCompleta');

  itemVozCompletaDetectado = null;
  if (statusTexto) statusTexto.textContent = 'Ouvindo... Fale com calma!';
  if (transcricao) transcricao.textContent = 'Aguardando sua voz...';
  if (cardPreview) cardPreview.style.display = 'none';
  if (btnConfirmar) btnConfirmar.style.display = 'none';

  if (modal) modal.classList.add('aberto');
  window.SomMercado.bipItem();

  recVozCompleta = new SpeechRecognition();
  recVozCompleta.lang = 'pt-BR';
  recVozCompleta.continuous = true;
  recVozCompleta.interimResults = true;

  recVozCompleta.onresult = function(event) {
    let falaCompleta = '';
    for (let i = 0; i < event.results.length; i++) {
      falaCompleta += event.results[i][0].transcript + ' ';
    }
    falaCompleta = falaCompleta.trim();

    if (transcricao) transcricao.textContent = `"${falaCompleta}"`;

    // Processa os dados falados em tempo real
    const detectado = interpretarFalaItemCompleto(falaCompleta);
    if (detectado && detectado.nome) {
      itemVozCompletaDetectado = detectado;
      atualizarPreviewVozCompleta(detectado);
    }

    // Reinicia o temporizador de confirmação por pausa (2.2s de silêncio)
    if (timeoutVozCompleta) clearTimeout(timeoutVozCompleta);
    timeoutVozCompleta = setTimeout(() => {
      if (itemVozCompletaDetectado && itemVozCompletaDetectado.nome) {
        if (statusTexto) statusTexto.textContent = '✨ Item identificado! Toque em Confirmar ou aguarde.';
      }
    }, 2200);
  };

  recVozCompleta.onerror = function(err) {
    console.log('Aviso reconhecimento voz completa:', err);
  };

  recVozCompleta.onend = function() {
    console.log('Reconhecimento voz completa finalizado.');
  };

  try {
    recVozCompleta.start();
  } catch (e) {
    console.warn('Erro ao iniciar voz completa:', e);
  }
};

function atualizarPreviewVozCompleta(detectado) {
  const cardPreview = document.getElementById('cardItemInterpretado');
  const btnConfirmar = document.getElementById('btnConfirmarVozCompleta');

  document.getElementById('previewProdNome').textContent = detectado.nome;
  document.getElementById('previewProdCat').textContent = detectado.categoria;
  document.getElementById('previewProdQtd').textContent = detectado.quantidade;
  document.getElementById('previewProdPreco').textContent = formatarMoeda(detectado.precoUnitario);
  document.getElementById('previewProdTotal').textContent = formatarMoeda(detectado.quantidade * detectado.precoUnitario);

  if (cardPreview) cardPreview.style.display = 'block';
  if (btnConfirmar) btnConfirmar.style.display = 'flex';
}

window.confirmarInsercaoItemVozCompleto = function() {
  if (!itemVozCompletaDetectado || !itemVozCompletaDetectado.nome) {
    alert('Nenhum item detectado ainda. Fale o produto com calma.');
    return;
  }

  appState.itens.push({
    id: 'item_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: itemVozCompletaDetectado.nome,
    categoria: itemVozCompletaDetectado.categoria,
    quantidade: itemVozCompletaDetectado.quantidade || 1,
    precoUnitario: itemVozCompletaDetectado.precoUnitario || 0,
    comprado: itemVozCompletaDetectado.precoUnitario > 0 // Se já falou o preço, já está no carrinho!
  });

  window.SomMercado.bipItem();
  fecharModalVozCompleta();
  renderizarTudo();
};

window.fecharModalVozCompleta = function() {
  if (timeoutVozCompleta) clearTimeout(timeoutVozCompleta);
  if (recVozCompleta) {
    try { recVozCompleta.stop(); } catch (e) {}
  }
  document.getElementById('modalVozCompleta')?.classList.remove('aberto');
};

/**
 * Interpretador Robusto de Frases Completas em Português:
 * "Creme de leite, quatro, 2,70 cada" -> { nome: 'Creme de leite', quantidade: 4, precoUnitario: 2.70 }
 * "Arroz branco, dois a 29,90" -> { nome: 'Arroz branco 5 kg', quantidade: 2, precoUnitario: 29.90 }
 * "Leite condensado 3 por 6,50"
 */
function interpretarFalaItemCompleto(frase) {
  let limpa = frase.replace(/[?!]/g, ' ').replace(/\s+/g, ' ').trim();
  limpa = limpa.replace(/^(adicionar|coloque|comprar|colocar|quero|bota)\s+/i, '').trim();

  // Substitui vírgula decimal (ex: 2,70 -> 2.70) para não quebrar no split
  limpa = limpa.replace(/(\d+),(\d+)/g, '$1.$2');

  let nomeProduto = '';
  let quantidade = 1;
  let preco = 0;

  // 1. Tenta separar por vírgulas ou ponto e vírgula
  let partes = limpa.split(/[,;]/).map(p => p.trim()).filter(p => p.length > 0);

  if (partes.length >= 3) {
    nomeProduto = partes[0];
    quantidade = extrairApenasNumero(partes[1]);
    preco = extrairPrecoDeTexto(partes[2]);
  } else if (partes.length === 2) {
    nomeProduto = partes[0];
    let segParte = partes[1];
    let mQtdPreco = segParte.match(/^(\d+|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez)\s*(?:unidades?|un|caixas?|latas?|pct)?\s*(?:a|por|de)?\s*(\d+(?:\.\d{1,2})?)\s*(?:reais|cada)?$/i);
    if (mQtdPreco) {
      quantidade = converterNumeroOuExtenso(mQtdPreco[1]);
      preco = converterPrecoString(mQtdPreco[2]);
    } else {
      preco = extrairPrecoDeTexto(segParte);
      if (preco === 0) {
        quantidade = extrairApenasNumero(segParte);
      }
    }
  } else {
    // Frase contínua sem vírgulas: "creme de leite quatro 2.70 cada" ou "arroz dois a 29.90"
    let mQtdPrecoFinal = limpa.match(/\b(\d+|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez)\s*(?:unidades?|un|caixas?|latas?|pct)?\s*(?:a|por|de)?\s*(\d+(?:\.\d{1,2})?)\s*(?:reais|cada)?$/i);
    if (mQtdPrecoFinal) {
      quantidade = converterNumeroOuExtenso(mQtdPrecoFinal[1]);
      preco = converterPrecoString(mQtdPrecoFinal[2]);
      nomeProduto = limpa.substring(0, mQtdPrecoFinal.index).trim();
    } else {
      let mPrecoSo = limpa.match(/\b(\d+(?:\.\d{1,2})?)\s*(?:reais|cada)?$/i);
      if (mPrecoSo) {
        preco = converterPrecoString(mPrecoSo[1]);
        nomeProduto = limpa.substring(0, mPrecoSo.index).trim();
      } else {
        nomeProduto = limpa;
      }
    }
  }

  let achado = buscarNoCatalogo(nomeProduto);
  if (preco === 0 && achado.precoMedio) {
    preco = achado.precoMedio;
  }

  return {
    nome: achado.nome,
    categoria: achado.categoria,
    quantidade: quantidade || 1,
    precoUnitario: preco || 0
  };
}

// ============================================================================
// 🎙️ MODAL 2: VOZ DO ITEM NO SUPERMERCADO ("Sete, 5,70", "7 a 5,70")
// ============================================================================
window.ouvirVozItemSupermercado = function(idItem) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Comando de voz não suportado neste navegador. Use o Google Chrome.');
    return;
  }

  idItemOuvidoAtual = idItem;
  dadosItemOuvidoDetectados = null;

  const modal = document.getElementById('modalVozItemRapido');
  const titulo = document.getElementById('tituloItemVozRapido');
  const transcricao = document.getElementById('transcricaoItemRapido');
  const previewBox = document.getElementById('previewItemRapidoBox');
  const btnConfirmar = document.getElementById('btnConfirmarItemRapido');

  if (titulo) titulo.textContent = item.produto;
  if (transcricao) transcricao.textContent = 'Fale agora a quantidade e o preço...';
  if (previewBox) previewBox.style.display = 'none';
  if (btnConfirmar) btnConfirmar.style.display = 'none';

  if (modal) modal.classList.add('aberto');
  window.SomMercado.bipItem();

  recVozItemRapido = new SpeechRecognition();
  recVozItemRapido.lang = 'pt-BR';
  recVozItemRapido.continuous = true;
  recVozItemRapido.interimResults = true;

  recVozItemRapido.onresult = function(event) {
    let fala = '';
    for (let i = 0; i < event.results.length; i++) {
      fala += event.results[i][0].transcript + ' ';
    }
    fala = fala.trim();

    if (transcricao) transcricao.textContent = `"${fala}"`;

    const dados = interpretarFalaItemNoMercado(fala, item);
    if (dados.preco > 0 || dados.quantidade > 0) {
      dadosItemOuvidoDetectados = dados;
      atualizarPreviewItemRapido(dados, item);
    }

    if (timeoutVozItemRapido) clearTimeout(timeoutVozItemRapido);
    timeoutVozItemRapido = setTimeout(() => {
      if (dadosItemOuvidoDetectados && dadosItemOuvidoDetectados.preco > 0) {
        confirmarVozItemRapido();
      }
    }, 2000);
  };

  recVozItemRapido.onerror = function(err) {
    console.log('Aviso voz item rápido:', err);
  };

  recVozItemRapido.start();
};

function atualizarPreviewItemRapido(dados, item) {
  const previewBox = document.getElementById('previewItemRapidoBox');
  const btnConfirmar = document.getElementById('btnConfirmarItemRapido');

  const qtdFinal = dados.quantidade || item.quantidade || 1;
  const precoFinal = dados.preco || item.precoUnitario || 0;

  document.getElementById('itemRapidoQtdVal').textContent = qtdFinal;
  document.getElementById('itemRapidoPrecoVal').textContent = formatarMoeda(precoFinal);
  document.getElementById('itemRapidoSubtotalVal').textContent = formatarMoeda(qtdFinal * precoFinal);

  if (previewBox) previewBox.style.display = 'block';
  if (btnConfirmar) btnConfirmar.style.display = 'flex';
}

window.confirmarVozItemRapido = function() {
  if (!idItemOuvidoAtual) return;
  const item = appState.itens.find(i => i.id === idItemOuvidoAtual);
  if (!item || !dadosItemOuvidoDetectados) return;

  if (dadosItemOuvidoDetectados.preco > 0) {
    item.precoUnitario = dadosItemOuvidoDetectados.preco;
  }
  if (dadosItemOuvidoDetectados.quantidade > 0) {
    item.quantidade = dadosItemOuvidoDetectados.quantidade;
  }
  item.comprado = true;

  window.SomMercado.bipItem();
  fecharModalVozItemRapido();
  renderizarTudo();
};

window.fecharModalVozItemRapido = function() {
  if (timeoutVozItemRapido) clearTimeout(timeoutVozItemRapido);
  if (recVozItemRapido) {
    try { recVozItemRapido.stop(); } catch (e) {}
  }
  document.getElementById('modalVozItemRapido')?.classList.remove('aberto');
  idItemOuvidoAtual = null;
};

/**
 * Analisa as formas que o usuário fala no supermercado:
 * - "Sete, 5,70" -> qtd: 7, preco: 5.70
 * - "7 a 5,70" -> qtd: 7, preco: 5.70
 * - "5,70" -> qtd: anterior, preco: 5.70
 * - "cinco e setenta" -> preco: 5.70
 * - Anomalia Google "75 70" -> detecta 7 unidades a 5,70!
 */
function interpretarFalaItemNoMercado(texto, itemAtual) {
  let frase = String(texto || '').toLowerCase().trim();
  frase = frase.replace(/[?!]/g, ' ').replace(/\s+/g, ' ');

  // Normaliza vírgula decimal (ex: 5,70 -> 5.70)
  frase = frase.replace(/(\d+),(\d+)/g, '$1.$2');

  let quantidade = (itemAtual && itemAtual.quantidade) ? itemAtual.quantidade : 1;
  let preco = 0;

  // 1. Glitch do Google Speech: "75 70" para quem falou "sete cinco e setenta"
  let mGlitch = frase.match(/^([1-9])([1-9])\s*[,;\s]\s*(\d{2})$/);
  if (mGlitch) {
    quantidade = Number(mGlitch[1]);
    preco = parseFloat(`${mGlitch[2]}.${mGlitch[3]}`);
    return { quantidade, preco };
  }

  // 2. Padrão explícito: "7 a 5.70" ou "7 por 5.70" ou "7 unidades a 5.70"
  let m1 = frase.match(/^(\d+|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez|doze)\s*(?:unidades?|un|caixas?|latas?|pct)?\s*(?:a|por|de)\s*(\d+(?:\.\d{1,2})?)\s*(?:reais|cada)?/i);
  if (m1) {
    quantidade = converterNumeroOuExtenso(m1[1]);
    preco = converterPrecoString(m1[2]);
    return { quantidade, preco };
  }

  // 3. Padrão com vírgula ou pausa e PREÇO DECIMAL COM PONTO: "7, 5.70" ou "sete, 5.70"
  let m2 = frase.match(/^(\d+|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez|doze)\s*(?:unidades?|un|caixas?|latas?|pct)?\s*[,;\s]+\s*(\d+\.\d{1,2})\s*(?:reais|cada)?/i);
  if (m2) {
    quantidade = converterNumeroOuExtenso(m2[1]);
    preco = converterPrecoString(m2[2]);
    return { quantidade, preco };
  }

  // 4. Fala por extenso "cinco e setenta" ou "sete cinco e setenta"
  let mExtDuplo = frase.match(/^(\w+)\s+(\w+)\s+e\s+(\w+)$/);
  if (mExtDuplo && PALAVRAS_NUMEROS[mExtDuplo[1]] && PALAVRAS_NUMEROS[mExtDuplo[2]] && PALAVRAS_NUMEROS[mExtDuplo[3]]) {
    quantidade = PALAVRAS_NUMEROS[mExtDuplo[1]];
    preco = PALAVRAS_NUMEROS[mExtDuplo[2]] + (PALAVRAS_NUMEROS[mExtDuplo[3]] / 100);
    return { quantidade, preco };
  }

  let mExt = frase.match(/^(\w+)\s+e\s+(\w+)$/);
  if (mExt && PALAVRAS_NUMEROS[mExt[1]] !== undefined && PALAVRAS_NUMEROS[mExt[2]] !== undefined) {
    preco = PALAVRAS_NUMEROS[mExt[1]] + (PALAVRAS_NUMEROS[mExt[2]] / 100);
    return { quantidade, preco };
  }

  // 5. Apenas preço unitário com ponto decimal: "5.70"
  let mPreco = frase.match(/(\d+)\.(\d{1,2})/);
  if (mPreco) {
    preco = parseFloat(`${mPreco[1]}.${mPreco[2].padEnd(2, '0')}`);
    let partesAntes = frase.split(mPreco[0])[0].trim();
    if (partesAntes) {
      let mQtdAntes = partesAntes.match(/\b(\d+|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez)\b/i);
      if (mQtdAntes) {
        quantidade = converterNumeroOuExtenso(mQtdAntes[1]);
      }
    }
    return { quantidade, preco };
  }

  // 6. Preço inteiro: "cinco reais" ou "5 reais"
  let mInt = frase.match(/(\d+)\s*(?:reais|real)/i);
  if (mInt) {
    preco = parseFloat(mInt[1]);
    return { quantidade, preco };
  }

  return { quantidade, preco };
}

function converterNumeroOuExtenso(val) {
  if (!val) return 1;
  const str = String(val).toLowerCase().trim();
  if (PALAVRAS_NUMEROS[str] !== undefined) return PALAVRAS_NUMEROS[str];
  const n = parseFloat(str.replace(',', '.'));
  return isNaN(n) ? 1 : n;
}

function converterPrecoString(val) {
  if (!val) return 0;
  const str = String(val).trim().replace(',', '.');
  const p = parseFloat(str);
  return isNaN(p) ? 0 : p;
}

function extrairApenasNumero(texto) {
  const m = texto.match(/\b(\d+(?:[,\.]\d+)?)\b/);
  if (m) return parseFloat(m[1].replace(',', '.')) || 1;
  for (const pal in PALAVRAS_NUMEROS) {
    if (new RegExp('\\b' + pal + '\\b', 'i').test(texto)) {
      return PALAVRAS_NUMEROS[pal];
    }
  }
  return 1;
}

function extrairPrecoDeTexto(texto) {
  let m = texto.match(/(\d+)[,\.](\d{1,2})/);
  if (m) {
    return parseFloat(`${m[1]}.${m[2].padEnd(2, '0')}`);
  }
  let mInt = texto.match(/(\d+)\s*(?:reais|cada)?/);
  if (mInt) return parseFloat(mInt[1]);
  return 0;
}

// ============================================================================
// ADICIONAR PRODUTOS MANUALMENTE OU PELO CATÁLOGO
// ============================================================================
window.adicionarProdutoManual = function(e) {
  if (e && e.key && e.key !== 'Enter') return;
  const input = document.getElementById('inputAdicionarManual');
  const nome = input?.value.trim();
  if (!nome) return;

  const dados = extrairProdutoEQuantidade(nome);

  appState.itens.push({
    id: 'item_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: dados.nome,
    categoria: dados.categoria,
    quantidade: 1,
    precoUnitario: dados.precoUnitario || 0,
    comprado: false
  });

  input.value = '';
  window.SomMercado.bipItem();
  renderizarTudo();
};

window.adicionarProdutoDoCatalogo = function(nome) {
  const dados = buscarNoCatalogo(nome);
  appState.itens.push({
    id: 'item_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: dados.nome,
    categoria: dados.categoria,
    quantidade: 1,
    precoUnitario: dados.precoMedio || 0,
    comprado: false
  });
  window.SomMercado.bipItem();
  renderizarTudo();
};

// ============================================================================
// EXCLUIR E ALTERNAR ITENS
// ============================================================================
window.excluirItem = function(idItem) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  if (confirm(`Deseja remover "${item.produto}" da lista?`)) {
    appState.itens = appState.itens.filter(i => i.id !== idItem);
    window.SomMercado.bipDesmarcar();
    renderizarTudo();
  }
};

window.alternarItem = function(idItem) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  item.comprado = !item.comprado;
  if (item.comprado) window.SomMercado.bipItem();
  else window.SomMercado.bipDesmarcar();

  renderizarTudo();
};

window.filtrarCorredor = function(corredor, botao) {
  appState.corredorAtivo = corredor;
  document.querySelectorAll('.corredor-pill').forEach(p => p.classList.remove('ativo'));
  if (botao) botao.classList.add('ativo');
  renderizarTelaCompras();
};

// ============================================================================
// GESTÃO DE LISTAS (SELECIONAR, CRIAR, EXCLUIR, REABRIR)
// ============================================================================
function renderizarTelaListas() {
  const container = document.getElementById('containerListas');
  if (!container) return;

  container.innerHTML = appState.listas.map(lista => {
    const t = calcularTotais(lista.id);
    const estaAtiva = lista.id === appState.listaAtivaId;
    const dataObj = new Date(lista.dataCriacao);

    return `
      <div class="item-card" style="margin-bottom: 12px; ${estaAtiva ? 'border: 2px solid var(--cor-azul);' : ''}">
        <div style="font-size: 32px; cursor: pointer;" onclick="selecionarLista('${lista.id}')">📋</div>
        
        <div class="item-info" onclick="selecionarLista('${lista.id}')">
          <div class="item-nome" style="font-size: 16px;">
            ${lista.nome} ${estaAtiva ? '<span style="font-size: 11px; color: var(--cor-azul); background: var(--cor-azul-light); padding: 2px 8px; border-radius: 10px;">ATIVA</span>' : ''}
          </div>
          <div class="item-categoria">
            Status: <strong style="color: ${lista.status === 'ABERTA' ? 'var(--cor-marca)' : 'var(--texto-suave)'}">${lista.status}</strong> • ${t.itensComprados}/${t.totalItens} no carrinho
          </div>
          <small style="color: var(--texto-suave); font-size: 11px;">📅 ${dataObj.toLocaleDateString('pt-BR')} às ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>
        </div>

        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <div style="font-size: 15px; font-weight: 800; color: var(--cor-marca);">${formatarMoeda(t.totalCarrinho)}</div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-qtd" style="width: auto; padding: 4px 10px; font-size: 11px; background: var(--cor-azul); color: #fff;" onclick="selecionarLista('${lista.id}')">
              Abrir
            </button>
            <button class="btn-excluir-item" onclick="excluirLista('${lista.id}')" title="Excluir lista">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.selecionarLista = function(idLista) {
  appState.listaAtivaId = idLista;
  window.SomMercado.bipItem();
  abrirTela('telaCompras', document.getElementById('navCompras'));
};

window.abrirModalNovaLista = function() {
  const modal = document.getElementById('modalNovaLista');
  if (modal) modal.classList.add('aberto');
};

window.fecharModalNovaLista = function() {
  const modal = document.getElementById('modalNovaLista');
  if (modal) modal.classList.remove('aberto');
};

window.salvarNovaLista = function() {
  const inputNome = document.getElementById('nomeNovaLista');
  const inputMeta = document.getElementById('metaNovaLista');
  const nome = inputNome?.value.trim() || 'Nova Compra';
  const meta = parseFloat(inputMeta?.value) || 300.00;

  const nova = {
    id: 'lst_' + Date.now(),
    nome: nome,
    status: 'ABERTA',
    dataCriacao: new Date().toISOString(),
    orcamentoMeta: meta
  };

  appState.listas.unshift(nova);
  appState.listaAtivaId = nova.id;

  if (inputNome) inputNome.value = '';
  window.SomMercado.bipItem();
  fecharModalNovaLista();
  abrirTela('telaCompras', document.getElementById('navCompras'));
};

window.excluirLista = function(idLista) {
  if (appState.listas.length <= 1) {
    alert('Você precisa manter pelo menos uma lista de compras.');
    return;
  }
  const lista = appState.listas.find(l => l.id === idLista);
  if (confirm(`Deseja excluir a lista "${lista?.nome}" e todos os seus itens?`)) {
    appState.listas = appState.listas.filter(l => l.id !== idLista);
    appState.itens = appState.itens.filter(i => i.idLista !== idLista);
    if (appState.listaAtivaId === idLista) {
      appState.listaAtivaId = appState.listas[0].id;
    }
    window.SomMercado.bipDesmarcar();
    renderizarTudo();
  }
};

window.reabrirListaAtual = function() {
  const lista = appState.listas.find(l => l.id === appState.listaAtivaId);
  if (!lista) return;

  lista.status = 'ABERTA';
  lista.dataFechamento = null;
  window.SomMercado.bipItem();
  renderizarTudo();
  alert(`🔄 A lista "${lista.nome}" foi reaberta!\nVocê pode continuar comprando e adicionar novos produtos.`);
};

// ============================================================================
// FINALIZAR COMPRAS (RECIBO + BIP)
// ============================================================================
let formaPagamentoEscolhida = '💳 Crédito';

window.abrirModalFinalizar = function() {
  const totais = calcularTotais();
  const modal = document.getElementById('modalRecibo');
  const totalDisplay = document.getElementById('reciboTotalVal');
  const qtdDisplay = document.getElementById('reciboQtdItens');

  if (totalDisplay) totalDisplay.textContent = formatarMoeda(totais.totalCarrinho);
  if (qtdDisplay) qtdDisplay.textContent = `${totais.itensComprados} itens comprados de ${totais.totalItens}`;

  if (modal) modal.classList.add('aberto');
};

window.fecharModalFinalizar = function() {
  document.getElementById('modalRecibo')?.classList.remove('aberto');
};

window.selecionarFormaPagto = function(forma, botao) {
  formaPagamentoEscolhida = forma;
  document.querySelectorAll('.opcao-pagto').forEach(b => b.classList.remove('selecionada'));
  if (botao) botao.classList.add('selecionada');
};

window.confirmarFinalizarCompraDefinitivo = function() {
  const totais = calcularTotais();
  const lista = appState.listas.find(l => l.id === appState.listaAtivaId);
  const usuario = appState.usuariosFamilia.find(u => u.id === appState.usuarioAtivoId) || appState.usuariosFamilia[0];

  window.SomMercado.bipFinalizarCompra();

  const compra = {
    id: 'compra_' + Date.now(),
    nomeLista: lista?.nome || 'Compras de Supermercado',
    data: new Date().toISOString(),
    total: totais.totalCarrinho,
    totalItens: totais.itensComprados,
    formaPagamento: formaPagamentoEscolhida,
    responsavel: usuario.nome,
    itens: appState.itens.filter(i => i.idLista === appState.listaAtivaId && i.comprado)
  };

  appState.historico.unshift(compra);
  if (lista) {
    lista.status = 'FECHADA';
    lista.dataFechamento = new Date().toISOString();
  }

  fecharModalFinalizar();
  renderizarTudo();

  alert(`🎉 Compras finalizadas com sucesso!\n\nResponsável: ${compra.responsavel}\nTotal: ${formatarMoeda(compra.total)}\nPagamento: ${compra.formaPagamento}\n\n💡 Dica: Se comprou algo a mais, basta tocar em "🔄 Reabrir Lista" no topo!`);
};

// ============================================================================
// PERFIL DA FAMÍLIA (ADMINISTRADOR FÁBIO)
// ============================================================================
window.abrirModalPerfil = function() {
  renderizarListaUsuariosFamilia();
  const modal = document.getElementById('modalPerfil');
  if (modal) modal.classList.add('aberto');
};

window.fecharModalPerfil = function() {
  document.getElementById('modalPerfil')?.classList.remove('aberto');
};

function renderizarListaUsuariosFamilia() {
  const container = document.getElementById('gradeUsuariosFamilia');
  if (!container) return;

  container.innerHTML = appState.usuariosFamilia.map(u => {
    const estaAtivo = u.id === appState.usuarioAtivoId;
    return `
      <div class="item-card" style="margin-bottom: 8px; ${estaAtivo ? 'border: 2px solid var(--cor-marca); background: var(--cor-marca-light);' : ''}">
        <div class="avatar-usuario" style="width: 38px; height: 38px; font-size: 20px;">
          ${u.fotoUrl ? `<img src="${u.fotoUrl}" />` : u.avatar}
        </div>
        
        <div class="item-info" onclick="selecionarUsuarioAtivo('${u.id}')">
          <div class="item-nome" style="font-size: 15px;">${u.nome} ${estaAtivo ? '✓' : ''}</div>
          <div class="item-categoria">${u.papel}</div>
        </div>

        <button class="btn-qtd" style="width: auto; padding: 4px 10px; font-size: 11px; ${estaAtivo ? 'background: var(--cor-marca); color: #fff;' : ''}" onclick="selecionarUsuarioAtivo('${u.id}')">
          ${estaAtivo ? 'Ativo' : 'Usar'}
        </button>

        ${u.id !== 'u_fabio' ? `
          <button class="btn-excluir-item" onclick="excluirMembroFamilia('${u.id}')" title="Remover membro">
            🗑️
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
}

window.selecionarUsuarioAtivo = function(idUsuario) {
  appState.usuarioAtivoId = idUsuario;
  salvarLocal();
  renderizarCabecalhoPerfil();
  renderizarListaUsuariosFamilia();
  window.SomMercado.bipItem();
};

window.adicionarNovoMembroFamilia = function() {
  const inputNome = document.getElementById('inputNovoMembroNome');
  const inputPapel = document.getElementById('inputNovoMembroPapel');
  const nome = inputNome?.value.trim();
  const papel = inputPapel?.value.trim() || 'Família';

  if (!nome) {
    alert('Informe o nome do membro da família.');
    return;
  }

  const novo = {
    id: 'u_' + Date.now(),
    nome: nome,
    papel: papel,
    avatar: '👤',
    fotoUrl: ''
  };

  appState.usuariosFamilia.push(novo);
  if (inputNome) inputNome.value = '';
  salvarLocal();
  renderizarListaUsuariosFamilia();
  window.SomMercado.bipItem();
};

window.excluirMembroFamilia = function(idUsuario) {
  if (confirm('Deseja remover este membro da família?')) {
    appState.usuariosFamilia = appState.usuariosFamilia.filter(u => u.id !== idUsuario);
    if (appState.usuarioAtivoId === idUsuario) {
      appState.usuarioAtivoId = 'u_fabio';
    }
    salvarLocal();
    renderizarCabecalhoPerfil();
    renderizarListaUsuariosFamilia();
    window.SomMercado.bipDesmarcar();
  }
};

window.carregarFotoAdminArquivo = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const usuario = appState.usuariosFamilia.find(u => u.id === appState.usuarioAtivoId) || appState.usuariosFamilia[0];
    usuario.fotoUrl = e.target.result;
    salvarLocal();
    renderizarCabecalhoPerfil();
    renderizarListaUsuariosFamilia();
  };
  reader.readAsDataURL(file);
};

// ============================================================================
// TECLADO MAQUININHA (DIGITAÇÃO RÁPIDA DE PREÇO)
// ============================================================================
window.abrirTecladoPreco = function(idItem) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  appState.itemSendoEditado = item;
  appState.valorTecladoBuffer = item.precoUnitario > 0 ? String(Math.round(item.precoUnitario * 100)) : '0';

  const drawer = document.getElementById('drawerTeclado');
  const nomeDisplay = document.getElementById('tecladoItemNome');
  if (nomeDisplay) nomeDisplay.textContent = `${item.produto} (${item.quantidade}x)`;

  atualizarDisplayTeclado();
  if (drawer) drawer.classList.add('aberto');
};

window.fecharTecladoPreco = function() {
  document.getElementById('drawerTeclado')?.classList.remove('aberto');
  appState.itemSendoEditado = null;
};

window.digitoTeclado = function(d) {
  if (appState.valorTecladoBuffer === '0') appState.valorTecladoBuffer = String(d);
  else if (appState.valorTecladoBuffer.length < 8) appState.valorTecladoBuffer += String(d);
  atualizarDisplayTeclado();
  window.SomMercado.bipItem();
};

window.apagarTeclado = function() {
  if (appState.valorTecladoBuffer.length > 1) appState.valorTecladoBuffer = appState.valorTecladoBuffer.slice(0, -1);
  else appState.valorTecladoBuffer = '0';
  atualizarDisplayTeclado();
};

window.confirmarTecladoPreco = function() {
  if (appState.itemSendoEditado) {
    const cents = parseInt(appState.valorTecladoBuffer, 10) || 0;
    appState.itemSendoEditado.precoUnitario = cents / 100;
    appState.itemSendoEditado.comprado = true;
    window.SomMercado.bipItem();
  }
  fecharTecladoPreco();
  renderizarTudo();
};

function atualizarDisplayTeclado() {
  const display = document.getElementById('tecladoValor');
  if (!display) return;
  const cents = parseInt(appState.valorTecladoBuffer, 10) || 0;
  display.textContent = formatarMoeda(cents / 100);
}

function formatarMoeda(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  carregarLocal();
  aplicarTema();
  renderizarTudo();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW:', err));
  }
});
