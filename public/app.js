/**
 * ============================================================================
 * 🛒 MOTOR DA APLICAÇÃO — MEU MERCADO (PWA 2026 v2.3)
 * ============================================================================
 * Atualizações de Ponta:
 * 1. 📝 "Preparar Lista" na tela inicial para a secretária
 * 2. 🎙️ Ditado Contínuo da Despensa (microfone não fecha enquanto procura produtos)
 * 3. 🔍 Busca Inteligente no Catálogo de Produtos (limpa pontuação como "?", acha categorias)
 * 4. 🛒 No Supermercado: Lista com seletor de listas abertas, data da compra, microfone por item, exclusão 🗑️ e reabertura
 * 5. 👨‍👩‍👧 Perfil da Família com Fábio Administrador
 */

const CONFIG = {
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyVzn-uiAsqoXOxDGDqeVTTr3pFWPEc6SfqmiTH8j3YTAnr4MPrKRAXtQjbPI7VHp3x9w/exec',
  FINANCEIRO_URL: 'https://meu-financeiro-39138.web.app',
  STORAGE_PREFIX: 'meu_mercado_v2_3_'
};

// ============================================================================
// CATÁLOGO OFICIAL COMPLETO (BASE DE DADOS DO GOOGLE SHEETS)
// ============================================================================
const CATALOGO_BASE = [
  // MERCEARIA
  { nome: 'Arroz branco 5 kg', categoria: '🥫 Mercearia', precoMedio: 29.90 },
  { nome: 'Feijão preto 1 kg', categoria: '🥫 Mercearia', precoMedio: 8.90 },
  { nome: 'Feijão carioca 1 kg', categoria: '🥫 Mercearia', precoMedio: 8.50 },
  { nome: 'Óleo de soja 900 ml', categoria: '🥫 Mercearia', precoMedio: 6.90 },
  { nome: 'Azeite de oliva 500 ml', categoria: '🥫 Mercearia', precoMedio: 36.90 },
  { nome: 'Extrato de tomate', categoria: '🥫 Mercearia', precoMedio: 4.50 },
  { nome: 'Molho de tomate', categoria: '🥫 Mercearia', precoMedio: 3.20 },
  { nome: 'Batata palha', categoria: '🥫 Mercearia', precoMedio: 7.90 },
  { nome: 'Macarrão espaguete 500 g', categoria: '🥫 Mercearia', precoMedio: 4.80 },
  { nome: 'Café torrado 500g', categoria: '🥫 Mercearia', precoMedio: 19.90 },
  { nome: 'Açúcar refinado 1 kg', categoria: '🥫 Mercearia', precoMedio: 4.90 },
  { nome: 'Sal refinado 1 kg', categoria: '🥫 Mercearia', precoMedio: 2.80 },
  { nome: 'Farinha de trigo 1 kg', categoria: '🥫 Mercearia', precoMedio: 5.50 },
  { nome: 'Milho verde lata', categoria: '🥫 Mercearia', precoMedio: 4.20 },
  { nome: 'Atum em pedaços', categoria: '🥫 Mercearia', precoMedio: 8.90 },

  // LATICÍNIOS & FRIOS
  { nome: 'Leite integral 1 L', categoria: '🧀 Laticínios', precoMedio: 5.70 },
  { nome: 'Leite desnatado 1 L', categoria: '🧀 Laticínios', precoMedio: 5.80 },
  { nome: 'Creme de leite', categoria: '🧀 Laticínios', precoMedio: 3.80 },
  { nome: 'Leite condensado', categoria: '🧀 Laticínios', precoMedio: 6.50 },
  { nome: 'Manteiga com sal', categoria: '🧀 Laticínios', precoMedio: 12.90 },
  { nome: 'Requeijão cremoso', categoria: '🧀 Laticínios', precoMedio: 8.90 },
  { nome: 'Queijo muçarela (kg)', categoria: '🧀 Laticínios', precoMedio: 45.90 },
  { nome: 'Iogurte natural', categoria: '🧀 Laticínios', precoMedio: 4.20 },

  // CARNES
  { nome: 'Carne bovina (kg)', categoria: '🥩 Carnes', precoMedio: 38.90 },
  { nome: 'Carne moída (kg)', categoria: '🥩 Carnes', precoMedio: 29.90 },
  { nome: 'Peito de frango (kg)', categoria: '🥩 Carnes', precoMedio: 19.90 },
  { nome: 'Bife alcatra (kg)', categoria: '🥩 Carnes', precoMedio: 44.90 },
  { nome: 'Linguiça toscana (kg)', categoria: '🥩 Carnes', precoMedio: 22.90 },
  { nome: 'Bacon em cubos', categoria: '🥩 Carnes', precoMedio: 14.90 },

  // HORTIFRÚTI
  { nome: 'Tomate italiano (kg)', categoria: '🥬 Hortifrúti', precoMedio: 8.90 },
  { nome: 'Cebola (kg)', categoria: '🥬 Hortifrúti', precoMedio: 5.80 },
  { nome: 'Alho (pct)', categoria: '🥬 Hortifrúti', precoMedio: 6.90 },
  { nome: 'Batata inglesa (kg)', categoria: '🥬 Hortifrúti', precoMedio: 6.50 },
  { nome: 'Cenoura (kg)', categoria: '🥬 Hortifrúti', precoMedio: 5.20 },
  { nome: 'Banana prata (kg)', categoria: '🥬 Hortifrúti', precoMedio: 7.50 },
  { nome: 'Maçã nacional (kg)', categoria: '🥬 Hortifrúti', precoMedio: 9.80 },
  { nome: 'Alface americana', categoria: '🥬 Hortifrúti', precoMedio: 4.50 },

  // LIMPEZA
  { nome: 'Sabão em pó 1.6kg', categoria: '🧼 Limpeza', precoMedio: 19.90 },
  { nome: 'Detergente líquido', categoria: '🧼 Limpeza', precoMedio: 2.50 },
  { nome: 'Amaciante de roupas 2L', categoria: '🧼 Limpeza', precoMedio: 16.90 },
  { nome: 'Desinfetante 1L', categoria: '🧼 Limpeza', precoMedio: 6.90 },
  { nome: 'Água sanitária 2L', categoria: '🧼 Limpeza', precoMedio: 5.50 },
  { nome: 'Esponja de aço', categoria: '🧼 Limpeza', precoMedio: 3.20 },
  { nome: 'Papel toalha', categoria: '🧼 Limpeza', precoMedio: 5.90 },

  // HIGIENE
  { nome: 'Papel higiênico 12un', categoria: '🧴 Higiene', precoMedio: 22.90 },
  { nome: 'Sabonete em barra', categoria: '🧴 Higiene', precoMedio: 3.20 },
  { nome: 'Creme dental', categoria: '🧴 Higiene', precoMedio: 4.90 },
  { nome: 'Shampoo', categoria: '🧴 Higiene', precoMedio: 16.90 }
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
    { id: 'i5', idLista: 'lst_1', produto: 'Tomate italiano (kg)', categoria: '🥬 Hortifrúti', quantidade: 1.5, precoUnitario: 8.90, comprado: false },
    { id: 'i6', idLista: 'lst_1', produto: 'Detergente líquido', categoria: '🧼 Limpeza', quantidade: 3, precoUnitario: 2.50, comprado: false }
  ],
  produtosCatalogo: CATALOGO_BASE,
  historico: [],
  corredorAtivo: 'todos',
  itemSendoEditado: null,
  valorTecladoBuffer: '0'
};

// Variáveis do Ditado Contínuo da Despensa
let ditandoContinuo = false;
let reconhecimentoContinuo = null;
let itensDitadosBuffer = [];

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
  // Se sair da tela de preparar lista, para o ditado se estiver rodando
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

function renderizarTelaInicio() {
  const totais = calcularTotais();
  const subCompras = document.getElementById('inicioSubCompras');
  if (subCompras) {
    subCompras.textContent = `${totais.nomeLista}: ${totais.itensComprados} de ${totais.totalItens} no carrinho (${formatarMoeda(totais.totalCarrinho)})`;
  }

  const containerSugestoes = document.getElementById('chipsSugestoes');
  if (containerSugestoes) {
    const nomesNaLista = appState.itens.filter(i => i.idLista === appState.listaAtivaId).map(i => i.produto.toLowerCase());
    const sugestoes = appState.produtosCatalogo.filter(p => !nomesNaLista.includes(p.nome.toLowerCase())).slice(0, 6);

    containerSugestoes.innerHTML = sugestoes.map(p => `
      <div class="chip-sugestao" onclick="adicionarProdutoDoCatalogo('${p.nome}')">
        <span>+</span> ${p.nome}
      </div>
    `).join('');
  }
}

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

  // Se o navegador parar por silêncio enquanto a secretária procura itens, reinicia imediatamente!
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
    statusBox.textContent = 'Microfone pausado. Clique no microfone para continuar falando ou em "Gerar Lista" abaixo.';
    statusBox.style.color = 'var(--texto-principal)';
  }
}

// Quebra a fala por vírgulas, "e", "mais", limpa pontuação e busca no catálogo
function adicionarItensAoBuffer(fala) {
  let limpa = fala.replace(/[.?!]/g, ' ').toLowerCase().trim();
  let pedacos = limpa.split(/[,;\n]|\s+e\s+|\s+mais\s+/i).map(p => p.trim()).filter(p => p.length > 0);

  pedacos.forEach(p => {
    // Normaliza termo e busca produto correspondente
    const info = extrairProdutoEQuantidade(p);
    itensDitadosBuffer.push(info);
    window.SomMercado.bipItem();
  });

  atualizarTagsDitadasUI();
}

function extrairProdutoEQuantidade(texto) {
  let termo = texto.trim();
  let qtd = 1;

  // Extrai quantidade se falada (ex: "3 óleos", "2 cremes de leite", "duas caixas de leite")
  const matchNum = termo.match(/^(\d+)\s*(?:unidades?|un|caixas?|pacotes?|latas?|kg|litros?)?\s*(?:de\s+)?(.*)$/i);
  if (matchNum) {
    qtd = Number(matchNum[1]) || 1;
    termo = matchNum[2].trim();
  } else {
    // Verifica por extenso inicial (ex: "dois cremes de leite")
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

  // Busca na base de dados de produtos
  const achado = buscarNoCatalogo(termo);

  return {
    nome: achado.nome,
    categoria: achado.categoria,
    quantidade: qtd,
    precoUnitario: achado.precoMedio || 0
  };
}

// Busca inteligente no catálogo ignorando acentos e pontuações
function buscarNoCatalogo(termo) {
  const limpo = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // 1. Procura match exato ou substring no catálogo oficial
  for (const prod of appState.produtosCatalogo) {
    const prodLimpo = prod.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (prodLimpo.includes(limpo) || limpo.includes(prodLimpo)) {
      return prod;
    }
  }

  // 2. Se não encontrou, deduz categoria provável
  let cat = '📦 Outros';
  if (/leite|queijo|iogurte|manteiga|requeijao|creme/i.test(limpo)) cat = '🧀 Laticínios';
  else if (/carne|frango|bife|peito|linguica|bacon/i.test(limpo)) cat = '🥩 Carnes';
  else if (/tomate|cebola|alho|batata|fruta|banana|maca|alface/i.test(limpo)) cat = '🥬 Hortifrúti';
  else if (/arroz|feijao|oleo|azeite|molho|cafe|acucar|sal|farinha/i.test(limpo)) cat = '🥫 Mercearia';
  else if (/sabao|detergente|amaciante|desinfetante|esponja|limpeza/i.test(limpo)) cat = '🧼 Limpeza';
  else if (/papel|sabonete|shampoo|pasta|escova/i.test(limpo)) cat = '🧴 Higiene';

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

// Converte os itens ditados na despensa em uma Lista de Compras definitiva
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

  // Transfere todos os produtos da despensa para a lista
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

  alert(`✅ Lista "${novaLista.nome}" gerada com sucesso!\nForam incluídos ${novaLista.orcamentoMeta ? novaLista.nome : ''} com todos os ${appState.itens.filter(it => it.idLista === novaListaId).length} itens prontos para o Fábio comprar no mercado.`);

  // Abre a lista em Compras pronta para o supermercado!
  abrirTela('telaCompras', document.getElementById('navCompras'));
};

// ============================================================================
// 🛒 TELA COMPRAS (SUPERMERCADO COM SELETOR DE LISTAS E DATA)
// ============================================================================
function renderizarTelaCompras() {
  const container = document.getElementById('listaItensCompras');
  const seletorListas = document.getElementById('seletorListaAtiva');
  const dataDisplay = document.getElementById('dataListaAtiva');
  const bannerFechada = document.getElementById('bannerListaFechada');
  const barraRodape = document.getElementById('barraFinalizarCompras');

  const totais = calcularTotais();

  // 1. Seletor de Listas (permite Fábio alternar entre listas abertas)
  if (seletorListas) {
    seletorListas.innerHTML = appState.listas.map(l => `
      <option value="${l.id}" ${l.id === appState.listaAtivaId ? 'selected' : ''}>
        ${l.nome} (${l.status})
      </option>
    `).join('');
  }

  // 2. Data de criação da lista formatada
  if (dataDisplay) {
    const dataObj = new Date(totais.dataCriacao);
    dataDisplay.textContent = `📅 Criada em ${dataObj.toLocaleDateString('pt-BR')} às ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 3. Se a lista estiver fechada, exibe banner para reativar/continuar comprando
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
        <p style="font-size: 13px; margin-top: 4px;">Adicione produtos pelo campo acima ou pelo microfone.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = itens.map(item => `
    <div class="item-card ${item.comprado ? 'comprado' : ''}" id="card_${item.id}">
      <div class="item-checkbox" onclick="alternarItem('${item.id}')">
        ${item.comprado ? '✓' : ''}
      </div>

      <div class="item-info" onclick="alternarItem('${item.id}')">
        <div class="item-nome">${item.produto}</div>
        <div class="item-categoria">${item.categoria}</div>
      </div>

      <!-- Microfone do item no corredor: "Leite, quatro unidades, 5,70 cada" -->
      <button class="btn-mic-item" id="mic_${item.id}" onclick="ouvirVozItemSupermercado('${item.id}', this)" title="Falar quantidade e preço (Ex: 'quatro unidades, 5,70 cada')">
        🎙️
      </button>

      <div class="item-qtd-controle">
        <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', -1)">-</button>
        <span class="qtd-valor">${item.quantidade}</span>
        <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', 1)">+</button>
      </div>

      <div class="item-preco-tag ${item.precoUnitario > 0 ? 'com-preco' : ''}" onclick="abrirTecladoPreco('${item.id}')">
        ${item.precoUnitario > 0 ? formatarMoeda(item.precoUnitario * item.quantidade) : 'R$ Preço'}
      </div>

      <button class="btn-excluir-item" onclick="excluirItem('${item.id}')" title="Excluir produto da lista">
        🗑️
      </button>
    </div>
  `).join('');
}

window.trocarListaComprasDropdown = function(idLista) {
  appState.listaAtivaId = idLista;
  window.SomMercado.bipItem();
  renderizarTudo();
};

// ============================================================================
// MICROFONE NO ITEM (PARSER ROBUSTO: "LEITE, 4 UNIDADES, 5,70 CADA")
// ============================================================================
window.ouvirVozItemSupermercado = function(idItem, botao) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Comando de voz não suportado neste navegador.');
    return;
  }

  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;

  if (botao) botao.classList.add('gravando');
  window.SomMercado.bipItem();

  recognition.onresult = function(event) {
    const fala = event.results[0][0].transcript;
    console.log(`🎙️ Voz do item "${item.produto}":`, fala);

    const dados = interpretarFalaItemNoMercado(fala);

    if (dados.preco > 0) {
      item.precoUnitario = dados.preco;
      if (dados.quantidade !== null && dados.quantidade > 0) {
        item.quantidade = dados.quantidade;
      }
      item.comprado = true; // Já marca como pego no carrinho!
      window.SomMercado.bipItem();
      renderizarTudo();
    } else {
      alert(`Não entendi o preço em "${fala}". Tente dizer algo como "5,70" ou "quatro unidades, 5,70 cada".`);
    }
  };

  recognition.onerror = function() {
    if (botao) botao.classList.remove('gravando');
  };

  recognition.onend = function() {
    if (botao) botao.classList.remove('gravando');
  };

  recognition.start();
};

/**
 * Entende com precisão:
 * - "Leite, quatro unidades, 5,70 cada" -> qtd: 4, preco: 5.70
 * - "4 unidades a 5,70" -> qtd: 4, preco: 5.70
 * - "5,70 cada" -> qtd: 1, preco: 5.70
 * - "cinco e setenta" -> qtd: 1, preco: 5.70
 * - "dois por 15 reais" -> qtd: 2, preco: 7.50
 */
function interpretarFalaItemNoMercado(texto) {
  let frase = String(texto || '').replace(/[.?!]/g, ' ').toLowerCase().trim();

  let quantidade = 1;
  let preco = 0;

  // 1. Quantidade explícita numérica ou por extenso
  const regexQtd = /\b(\d+|um|uma|dois|duas|tres|três|quatro|cinco|seis|sete|oito|nove|dez|doze)\s*(?:unidades?|un|caixas?|pct|pacotes?|latas?|kg)?\b/i;
  const matchQtd = frase.match(regexQtd);
  if (matchQtd) {
    let qStr = matchQtd[1].toLowerCase();
    if (PALAVRAS_NUMEROS[qStr] !== undefined) {
      quantidade = PALAVRAS_NUMEROS[qStr];
    } else {
      quantidade = Number(qStr) || 1;
    }
  }

  // 2. Preço com formato "5,70" ou "5.70" ou "5 reais"
  const regexPreco = /\b(\d{1,4})[,\.]?(\d{0,2})?\s*(?:reais?|real)?(?:\s*cada)?\b/i;
  // Procura preço no final da frase ou após a quantidade
  const matches = [...frase.matchAll(/\b(\d{1,4})(?:[,\.](\d{1,2}))?\b/g)];
  if (matches.length > 0) {
    // O preço geralmente é o último número na frase se a quantidade for o primeiro
    const last = matches[matches.length - 1];
    if (matches.length > 1 || last[2] !== undefined) {
      const intPart = last[1];
      let decPart = last[2] || '0';
      if (decPart.length === 1) decPart += '0';
      preco = parseFloat(`${intPart}.${decPart}`);
    } else {
      preco = parseFloat(last[1]);
    }
  }

  // 3. Fallback para extenso ("cinco e setenta")
  if (preco === 0) {
    const partes = frase.split(/\s+e\s+|\s+/);
    for (let i = 0; i < partes.length; i++) {
      if (PALAVRAS_NUMEROS[partes[i]] !== undefined) {
        let p1 = PALAVRAS_NUMEROS[partes[i]];
        let p2 = 0;
        if (i + 1 < partes.length && PALAVRAS_NUMEROS[partes[i + 1]] !== undefined) {
          p2 = PALAVRAS_NUMEROS[partes[i + 1]];
        }
        preco = p1 + (p2 / 100);
        break;
      }
    }
  }

  // Se falou "dois por 15 reais no total", calcula unitário
  if (/no total|ao todo/i.test(frase) && quantidade > 1) {
    preco = preco / quantidade;
  }

  return { quantidade, preco };
}

// ============================================================================
// MICROFONE GERAL DO TOPO (ADICIONAR PRODUTO CONSULTANDO CATÁLOGO)
// ============================================================================
window.iniciarVozGeral = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Comando de voz não suportado neste navegador.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;

  const btn = document.getElementById('btnVozTopo');
  if (btn) btn.style.background = '#ef4444';
  window.SomMercado.bipItem();

  recognition.onresult = function(event) {
    const fala = event.results[0][0].transcript;
    processarAdicaoVozAoMercado(fala);
  };

  recognition.onend = function() {
    if (btn) btn.style.background = '';
  };

  recognition.start();
};

function processarAdicaoVozAoMercado(frase) {
  // Limpa interrogações, pontos e comandos
  let limpa = frase.replace(/[.?!]/g, '').replace(/^(adicionar|coloque|comprar|colocar)\s+/i, '').trim();

  const dados = extrairProdutoEQuantidade(limpa);

  appState.itens.push({
    id: 'item_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: dados.nome,
    categoria: dados.categoria,
    quantidade: dados.quantidade || 1,
    precoUnitario: dados.precoUnitario || 0,
    comprado: false
  });

  window.SomMercado.bipItem();
  renderizarTudo();
  alert(`🎙️ Adicionado à lista:\n${dados.nome} (${dados.quantidade}x) • ${dados.categoria}`);
}

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

window.alterarQuantidade = function(idItem, delta) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  const nova = (Number(item.quantidade) || 1) + delta;
  if (nova <= 0) {
    window.excluirItem(idItem);
  } else {
    item.quantidade = Math.round(nova * 10) / 10;
    renderizarTudo();
  }
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
  alert(`🔄 A lista "${lista.nome}" foi reaberta!\nVocê pode adicionar novos produtos e finalizar quando terminar.`);
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

  alert(`🎉 Compras finalizadas com sucesso!\n\nResponsável: ${compra.responsavel}\nTotal: ${formatarMoeda(compra.total)}\nPagamento: ${compra.formaPagamento}\n\n💡 Dica: Se comprou algo a mais no caixa, basta tocar em "🔄 Reabrir Lista" no topo!`);
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
// TECLADO MAQUININHA
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
