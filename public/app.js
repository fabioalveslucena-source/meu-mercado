/**
 * ============================================================================
 * 🛒 MOTOR DA APLICAÇÃO — MEU MERCADO (PWA 2026 v2.2)
 * ============================================================================
 * Implementação Completa:
 * - 👨‍👩‍👧 Perfil da Família: Fábio (Administrador) + Adicionar/Gerenciar Membros com Foto
 * - 🛒 Experiência Unificada de Compras:
 *    • Microfone direto no item (fala preço ou quantidade + preço, padrão 1 un)
 *    • Botão lixeira 🗑️ para excluir itens com 1 clique
 *    • Botão 🏁 Finalizar Compras com bip de caixa registradora
 *    • Botão 🔄 Reabrir Lista / Continuar Comprando caso precise adicionar mais itens
 * - 📋 Gerenciador com múltiplas listas (Compras do Mês, Feira, Churrasco...)
 * - 🌙 Modo Noturno e Diurno (☀️ / 🌙)
 * - 🔊 Som Sintetizado Web Audio API
 */

const CONFIG = {
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyVzn-uiAsqoXOxDGDqeVTTr3pFWPEc6SfqmiTH8j3YTAnr4MPrKRAXtQjbPI7VHp3x9w/exec',
  FINANCEIRO_URL: 'https://meu-financeiro-39138.web.app',
  STORAGE_PREFIX: 'meu_mercado_v2_2_'
};

// ============================================================================
// DICIONÁRIO DE PALAVRAS E NÚMEROS DO DRIVE D
// ============================================================================
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
    {
      id: 'u_fabio',
      nome: 'Fábio Lucena',
      papel: 'Administrador 👑',
      avatar: '👨‍💼',
      fotoUrl: ''
    },
    {
      id: 'u_esposa',
      nome: 'Esposa',
      papel: 'Família',
      avatar: '👩‍💼',
      fotoUrl: ''
    },
    {
      id: 'u_secretaria',
      nome: 'Secretária',
      papel: 'Compras',
      avatar: '👩‍🍳',
      fotoUrl: ''
    }
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
    },
    {
      id: 'lst_2',
      nome: 'Feira da Semana',
      status: 'FECHADA',
      dataCriacao: new Date(Date.now() - 86400000 * 5).toISOString(),
      orcamentoMeta: 120.00
    }
  ],
  itens: [
    { id: 'i1', idLista: 'lst_1', produto: 'Arroz Tipo 1 5kg', categoria: '🥫 Mercearia', quantidade: 1, precoUnitario: 28.50, comprado: true },
    { id: 'i2', idLista: 'lst_1', produto: 'Feijão Preto 1kg', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 8.90, comprado: true },
    { id: 'i3', idLista: 'lst_1', produto: 'Leite Integral 1L', categoria: '🧀 Laticínios', quantidade: 6, precoUnitario: 5.70, comprado: false },
    { id: 'i4', idLista: 'lst_1', produto: 'Café Torrado 500g', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 18.90, comprado: false },
    { id: 'i5', idLista: 'lst_1', produto: 'Tomate Italiano (kg)', categoria: '🥬 Hortifrúti', quantidade: 1.5, precoUnitario: 8.90, comprado: false },
    { id: 'i6', idLista: 'lst_1', produto: 'Detergente Líquido', categoria: '🧼 Limpeza', quantidade: 3, precoUnitario: 2.50, comprado: false }
  ],
  produtosPadrao: [
    { id: 'p1', nome: 'Arroz Tipo 1 5kg', categoria: '🥫 Mercearia', precoMedio: 28.50 },
    { id: 'p2', nome: 'Feijão Preto 1kg', categoria: '🥫 Mercearia', precoMedio: 8.90 },
    { id: 'p3', nome: 'Leite Integral 1L', categoria: '🧀 Laticínios', precoMedio: 5.70 },
    { id: 'p4', nome: 'Café Torrado 500g', categoria: '🥫 Mercearia', precoMedio: 18.90 },
    { id: 'p5', nome: 'Açúcar Refinado 1kg', categoria: '🥫 Mercearia', precoMedio: 4.80 },
    { id: 'p6', nome: 'Banana Prata (kg)', categoria: '🥬 Hortifrúti', precoMedio: 7.50 },
    { id: 'p7', nome: 'Tomate Italiano (kg)', categoria: '🥬 Hortifrúti', precoMedio: 8.90 },
    { id: 'p8', nome: 'Peito de Frango (kg)', categoria: '🥩 Carnes', precoMedio: 19.90 },
    { id: 'p9', nome: 'Detergente Líquido', categoria: '🧼 Limpeza', precoMedio: 2.50 },
    { id: 'p10', nome: 'Papel Higiênico 12un', categoria: '🧴 Higiene', precoMedio: 22.90 }
  ],
  historico: [],
  corredorAtivo: 'todos',
  itemSendoEditado: null,
  valorTecladoBuffer: '0'
};

// ============================================================================
// PERSISTÊNCIA
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

// ============================================================================
// TEMA NOTURNO / DIURNO
// ============================================================================
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
    statusLista: lista?.status || 'ABERTA'
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
    const sugestoes = appState.produtosPadrao.filter(p => !nomesNaLista.includes(p.nome.toLowerCase())).slice(0, 6);

    containerSugestoes.innerHTML = sugestoes.map(p => `
      <div class="chip-sugestao" onclick="adicionarProdutoRapido('${p.id}')">
        <span>+</span> ${p.nome}
      </div>
    `).join('');
  }
}

// Renderiza a lista de compras principal com todas as funcionalidades integradas
function renderizarTelaCompras() {
  const container = document.getElementById('listaItensCompras');
  const tituloLista = document.getElementById('tituloListaAtiva');
  const bannerFechada = document.getElementById('bannerListaFechada');
  const barraRodape = document.getElementById('barraFinalizarCompras');

  const totais = calcularTotais();

  if (tituloLista) {
    tituloLista.textContent = totais.nomeLista;
  }

  // Se a lista estiver fechada, exibe banner para reativar/continuar comprando
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
      <!-- Checkbox de pegar no carrinho -->
      <div class="item-checkbox" onclick="alternarItem('${item.id}')">
        ${item.comprado ? '✓' : ''}
      </div>

      <!-- Nome e Categoria -->
      <div class="item-info" onclick="alternarItem('${item.id}')">
        <div class="item-nome">${item.produto}</div>
        <div class="item-categoria">${item.categoria}</div>
      </div>

      <!-- Microfone do item: falar preço ou quantidade + preço -->
      <button class="btn-mic-item" id="mic_${item.id}" onclick="ouvirPrecoDoItem('${item.id}', this)" title="Falar preço deste item (Ex: '5,70' ou '3 por 10 reais')">
        🎙️
      </button>

      <!-- Controle de quantidade -->
      <div class="item-qtd-controle">
        <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', -1)">-</button>
        <span class="qtd-valor">${item.quantidade}</span>
        <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', 1)">+</button>
      </div>

      <!-- Preço unitário com clique para maquininha -->
      <div class="item-preco-tag ${item.precoUnitario > 0 ? 'com-preco' : ''}" onclick="abrirTecladoPreco('${item.id}')">
        ${item.precoUnitario > 0 ? formatarMoeda(item.precoUnitario * item.quantidade) : 'R$ Preço'}
      </div>

      <!-- Botão de Excluir / Cancelar o item da lista -->
      <button class="btn-excluir-item" onclick="excluirItem('${item.id}')" title="Excluir este item da lista">
        🗑️
      </button>
    </div>
  `).join('');
}

// Renderiza a tela de gerenciamento de listas
function renderizarTelaListas() {
  const container = document.getElementById('containerListas');
  if (!container) return;

  container.innerHTML = appState.listas.map(lista => {
    const t = calcularTotais(lista.id);
    const estaAtiva = lista.id === appState.listaAtivaId;

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

// ============================================================================
// MICROFONE NO ITEM (PARSER COMPLETO DO DRIVE D)
// ============================================================================
window.ouvirPrecoDoItem = function(idItem, botao) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Comando de voz não suportado neste navegador. Utilize o Chrome no celular.');
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
    console.log(`🎙️ Voz para o item "${item.produto}":`, fala);

    const resultado = interpretarVozItem(fala);
    if (resultado.preco > 0) {
      item.precoUnitario = resultado.preco;
      // Se informou quantidade explícita (ex: "3 caixas a 5,70"), atualiza quantidade; se não, mantém ou define como 1
      if (resultado.quantidade !== null && resultado.quantidade > 0) {
        item.quantidade = resultado.quantidade;
      } else if (!item.quantidade) {
        item.quantidade = 1;
      }
      item.comprado = true; // Já marca como pego no carrinho!
      window.SomMercado.bipItem();
      renderizarTudo();
    } else {
      alert(`Não identifiquei o valor em "${fala}". Fale algo como "5,70", "cinco e setenta" ou "3 a 8,90".`);
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
 * Interpreta fala no item:
 * - "5,70" -> preco: 5.70, qtd: null (padrão 1)
 * - "cinco e setenta" -> preco: 5.70, qtd: null
 * - "3 a 5,70" -> qtd: 3, preco: 5.70
 * - "2 por 15 reais" -> qtd: 2, preco: 7.50
 * - "dez reais" -> preco: 10.00, qtd: null
 */
function interpretarVozItem(texto) {
  let frase = String(texto || '').toLowerCase().replace(/[.!?]/g, ' ').trim();

  let quantidade = null;
  let preco = 0;

  // 1. Verifica padrão de quantidade e preço: "3 a 5,70" ou "3 por 10" ou "2 caixas 5,70"
  const regexQtdEPreco = /\b(\d+)\s*(?:unidades?|un|caixas?|pacotes?|latas?|kg|quilos?)?\s*(?:a|por|de)?\s*(\d+(?:[,\.]\d{1,2})?)\s*(?:reais?)?(?:\s*cada)?\b/i;
  const matchQtd = frase.match(regexQtdEPreco);

  if (matchQtd) {
    quantidade = Number(matchQtd[1]);
    let valor = Number(matchQtd[2].replace(',', '.'));
    // Se falou "por 15 no total", divide
    if (/no total|ao todo/i.test(frase) && quantidade > 1) {
      preco = valor / quantidade;
    } else {
      preco = valor;
    }
    return { quantidade, preco };
  }

  // 2. Verifica preço numérico simples: "5,70" ou "5.70" ou "12 reais"
  const regexNum = /(\d{1,4})[,\.]?(\d{0,2})?\s*(?:reais?|real)?/i;
  const matchNum = frase.match(regexNum);
  if (matchNum) {
    const inteiros = matchNum[1];
    let centavos = matchNum[2] || '0';
    if (centavos.length === 1) centavos += '0';
    preco = parseFloat(`${inteiros}.${centavos}`);
    return { quantidade: 1, preco };
  }

  // 3. Verifica número por extenso básico ("cinco e setenta", "oito e noventa")
  const partes = frase.split(/\s+e\s+|\s+/);
  if (partes.length >= 1 && PALAVRAS_NUMEROS[partes[0]] !== undefined) {
    const p1 = PALAVRAS_NUMEROS[partes[0]];
    let centavos = 0;
    if (partes.length >= 2 && PALAVRAS_NUMEROS[partes[1]] !== undefined) {
      centavos = PALAVRAS_NUMEROS[partes[1]];
    }
    preco = p1 + (centavos / 100);
    return { quantidade: 1, preco };
  }

  return { quantidade: 1, preco: 0 };
}

// ============================================================================
// MICROFONE GERAL DO TOPO (ADICIONAR PRODUTO EXTRA)
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
    processarAdicaoVoz(fala);
  };

  recognition.onend = function() {
    if (btn) btn.style.background = '';
  };

  recognition.start();
};

function processarAdicaoVoz(frase) {
  let limpo = frase.toLowerCase().replace(/^(adicionar|coloque|comprar|colocar)\s+/i, '').trim();

  // Verifica se falou preço no final: "leite integral 5,70 cada"
  const regex = /^(.*?)(?:por\s+|\s+)(\d+(?:[,\.]\d{1,2})?)\s*(?:reais|real)?(?:\s*cada)?$/i;
  const match = limpo.match(regex);

  let nome = limpo;
  let preco = 0;

  if (match && match[1].trim().length > 1) {
    nome = match[1].trim();
    preco = parseFloat(match[2].replace(',', '.')) || 0;
  }

  nome = nome.charAt(0).toUpperCase() + nome.slice(1);

  appState.itens.push({
    id: 'item_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: nome,
    categoria: '📦 Outros',
    quantidade: 1,
    precoUnitario: preco,
    comprado: preco > 0
  });

  window.SomMercado.bipItem();
  renderizarTudo();
  alert(`🎙️ Produto adicionado à lista:\n${nome}${preco > 0 ? ' • R$ ' + preco.toFixed(2) : ''}`);
}

// Adicionar produto digitando no campo rápido
window.adicionarProdutoManual = function(e) {
  if (e && e.key && e.key !== 'Enter') return;
  const input = document.getElementById('inputAdicionarManual');
  const nome = input?.value.trim();
  if (!nome) return;

  appState.itens.push({
    id: 'item_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: nome,
    categoria: '📦 Outros',
    quantidade: 1,
    precoUnitario: 0,
    comprado: false
  });

  input.value = '';
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

window.adicionarProdutoRapido = function(idProduto) {
  const p = appState.produtosPadrao.find(prod => prod.id === idProduto);
  if (!p) return;

  const existente = appState.itens.find(i => i.idLista === appState.listaAtivaId && i.produto.toLowerCase() === p.nome.toLowerCase());
  if (existente) {
    existente.quantidade += 1;
  } else {
    appState.itens.push({
      id: 'item_' + Date.now(),
      idLista: appState.listaAtivaId,
      produto: p.nome,
      categoria: p.categoria,
      quantidade: 1,
      precoUnitario: p.precoMedio || 0,
      comprado: false
    });
  }
  window.SomMercado.bipItem();
  renderizarTudo();
};

// ============================================================================
// GESTÃO DE LISTAS (SELECIONAR, CRIAR, EXCLUIR, REABRIR)
// ============================================================================
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

// 🔄 Reabrir lista fechada para acrescentar mais itens
window.reabrirListaAtual = function() {
  const lista = appState.listas.find(l => l.id === appState.listaAtivaId);
  if (!lista) return;

  lista.status = 'ABERTA';
  lista.dataFechamento = null;
  window.SomMercado.bipItem();
  renderizarTudo();
  alert(`🔄 A lista "${lista.nome}" foi reaberta!\nVocê pode adicionar mais itens normalmente e finalizar quando terminar.`);
};

// ============================================================================
// FINALIZAR COMPRAS (RECIBO + BIP TRIUNFAL)
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

  // 🔔 Toca o sinal sonoro de caixa registradora / sucesso
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

  alert(`🎉 Compras finalizadas com sucesso!\n\nResponsável: ${compra.responsavel}\nTotal: ${formatarMoeda(compra.total)}\nPagamento: ${compra.formaPagamento}\n\n💡 Dica: Se precisar comprar mais algo, basta clicar em "🔄 Reabrir Lista" no topo!`);
};

// ============================================================================
// PERFIL DA FAMÍLIA (ADMINISTRADOR FÁBIO + ADICIONAR MEMBROS)
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
