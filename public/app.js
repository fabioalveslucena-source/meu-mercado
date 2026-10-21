/**
 * ============================================================================
 * 🛒 MOTOR DA APLICAÇÃO — MEU MERCADO (PWA 2026)
 * ============================================================================
 * Integração completa:
 * - Layout oficial do Drive D com cores azul petróleo (#092A42 -> #287EA5)
 * - Som sintetizado Web Audio API (Bip de item + Bip de caixa registradora ao finalizar)
 * - 5 Superpoderes: Teclado Maquininha, Termômetro de Orçamento, Corredores, Sugestões e Recibo Digital
 * - Sincronização com Google Sheets e com o Meu Financeiro
 */

const CONFIG = {
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyVzn-uiAsqoXOxDGDqeVTTr3pFWPEc6SfqmiTH8j3YTAnr4MPrKRAXtQjbPI7VHp3x9w/exec',
  FINANCEIRO_URL: 'https://meu-financeiro-39138.web.app',
  STORAGE_PREFIX: 'meu_mercado_v2_'
};

// ============================================================================
// DADOS INICIAIS / PADRÃO
// ============================================================================
const CATEGORIAS_PADRAO = [
  { id: 'hortifruti', nome: '🥬 Hortifrúti' },
  { id: 'carnes', nome: '🥩 Carnes & Frios' },
  { id: 'laticinios', nome: '🧀 Laticínios' },
  { id: 'mercearia', nome: '🥫 Mercearia' },
  { id: 'padaria', nome: '🍞 Padaria' },
  { id: 'bebidas', nome: '🥤 Bebidas' },
  { id: 'higiene', nome: '🧴 Higiene' },
  { id: 'limpeza', nome: '🧼 Limpeza' },
  { id: 'outros', nome: '📦 Outros' }
];

const PRODUTOS_PADRAO = [
  { id: 'p1', nome: 'Arroz Tipo 1 5kg', categoria: '🥫 Mercearia', precoMedio: 28.50, frequenciaDias: 30 },
  { id: 'p2', nome: 'Feijão Preto 1kg', categoria: '🥫 Mercearia', precoMedio: 8.90, frequenciaDias: 15 },
  { id: 'p3', nome: 'Leite Integral 1L', categoria: '🧀 Laticínios', precoMedio: 5.20, frequenciaDias: 7 },
  { id: 'p4', nome: 'Café Torrado 500g', categoria: '🥫 Mercearia', precoMedio: 18.90, frequenciaDias: 15 },
  { id: 'p5', nome: 'Açúcar Refinado 1kg', categoria: '🥫 Mercearia', precoMedio: 4.80, frequenciaDias: 30 },
  { id: 'p6', nome: 'Óleo de Soja 900ml', categoria: '🥫 Mercearia', precoMedio: 6.90, frequenciaDias: 20 },
  { id: 'p7', nome: 'Banana Prata (kg)', categoria: '🥬 Hortifrúti', precoMedio: 7.50, frequenciaDias: 7 },
  { id: 'p8', nome: 'Tomate Italiano (kg)', categoria: '🥬 Hortifrúti', precoMedio: 8.90, frequenciaDias: 7 },
  { id: 'p9', nome: 'Cebola (kg)', categoria: '🥬 Hortifrúti', precoMedio: 5.80, frequenciaDias: 15 },
  { id: 'p10', nome: 'Peito de Frango (kg)', categoria: '🥩 Carnes & Frios', precoMedio: 19.90, frequenciaDias: 10 },
  { id: 'p11', nome: 'Queijo Mussarela (kg)', categoria: '🧀 Laticínios', precoMedio: 44.90, frequenciaDias: 15 },
  { id: 'p12', nome: 'Detergente Líquido', categoria: '🧼 Limpeza', precoMedio: 2.50, frequenciaDias: 15 },
  { id: 'p13', nome: 'Sabão em Pó 1.6kg', categoria: '🧼 Limpeza', precoMedio: 18.50, frequenciaDias: 30 },
  { id: 'p14', nome: 'Papel Higiênico 12un', categoria: '🧴 Higiene', precoMedio: 22.90, frequenciaDias: 25 },
  { id: 'p15', nome: 'Pão de Forma', categoria: '🍞 Padaria', precoMedio: 8.50, frequenciaDias: 7 }
];

// ============================================================================
// ESTADO GLOBAL DA APLICAÇÃO
// ============================================================================
let appState = {
  usuario: 'Fábio Lucena',
  listaAtivaId: 'lst_atual',
  listas: [
    {
      id: 'lst_atual',
      nome: 'Compras do Mês',
      status: 'ABERTA',
      dataCriacao: new Date().toISOString(),
      orcamentoMeta: 350.00
    }
  ],
  itens: [
    { id: 'i1', idLista: 'lst_atual', produto: 'Arroz Tipo 1 5kg', categoria: '🥫 Mercearia', quantidade: 1, precoUnitario: 28.50, comprado: true },
    { id: 'i2', idLista: 'lst_atual', produto: 'Feijão Preto 1kg', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 8.90, comprado: true },
    { id: 'i3', idLista: 'lst_atual', produto: 'Leite Integral 1L', categoria: '🧀 Laticínios', quantidade: 6, precoUnitario: 5.20, comprado: false },
    { id: 'i4', idLista: 'lst_atual', produto: 'Café Torrado 500g', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 18.90, comprado: false },
    { id: 'i5', idLista: 'lst_atual', produto: 'Banana Prata (kg)', categoria: '🥬 Hortifrúti', quantidade: 1.5, precoUnitario: 7.50, comprado: false },
    { id: 'i6', idLista: 'lst_atual', produto: 'Tomate Italiano (kg)', categoria: '🥬 Hortifrúti', quantidade: 1.2, precoUnitario: 8.90, comprado: false },
    { id: 'i7', idLista: 'lst_atual', produto: 'Detergente Líquido', categoria: '🧼 Limpeza', quantidade: 3, precoUnitario: 2.50, comprado: false }
  ],
  produtos: PRODUTOS_PADRAO,
  historico: [],
  corredorAtivo: 'todos',
  itemSendoEditado: null,
  valorTecladoBuffer: '0'
};

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
    const dados = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'state');
    if (dados) {
      const parsed = JSON.parse(dados);
      appState = { ...appState, ...parsed };
    }
  } catch (e) {
    console.warn('Erro ao carregar local:', e);
  }
}

// ============================================================================
// NAVEGAÇÃO ENTRE TELAS
// ============================================================================
window.abrirTela = function(idTela, botaoNav) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  const telaAlvo = document.getElementById(idTela);
  if (telaAlvo) {
    telaAlvo.classList.add('ativa');
  }

  if (botaoNav) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('ativo'));
    botaoNav.classList.add('ativo');
  }

  renderizarTudo();
};

// ============================================================================
// CÁLCULOS & TOTAIS
// ============================================================================
function calcularTotaisLista(idLista = appState.listaAtivaId) {
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
    percMeta
  };
}

// ============================================================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================================================
function renderizarTudo() {
  renderizarTermometro();
  renderizarTelaInicio();
  renderizarTelaCompras();
  renderizarTelaModoMercado();
  renderizarTelaListas();
  renderizarTelaProdutos();
  salvarLocal();
}

// 1. Renderiza o Termômetro de Orçamento
function renderizarTermometro() {
  const totais = calcularTotaisLista();
  const elementoGasto = document.getElementById('termometroGasto');
  const elementoMeta = document.getElementById('termometroMeta');
  const barra = document.getElementById('termometroBarra');
  const badgePerc = document.getElementById('termometroPerc');

  if (elementoGasto) elementoGasto.textContent = formatarMoeda(totais.totalCarrinho);
  if (elementoMeta) elementoMeta.textContent = `Meta: ${formatarMoeda(totais.meta)}`;
  if (badgePerc) badgePerc.textContent = `${totais.percMeta}%`;

  if (barra) {
    barra.style.width = `${totais.percMeta}%`;
    barra.className = 'termometro-barra-progresso';
    if (totais.percMeta >= 95) {
      barra.classList.add('perigo');
    } else if (totais.percMeta >= 80) {
      barra.classList.add('alerta');
    }
  }
}

// 2. Renderiza a Tela Inicial
function renderizarTelaInicio() {
  const totais = calcularTotaisLista();
  const subCompras = document.getElementById('inicioSubCompras');
  if (subCompras) {
    subCompras.textContent = `${totais.itensComprados} de ${totais.totalItens} itens no carrinho (${formatarMoeda(totais.totalCarrinho)})`;
  }

  // Sugestões inteligentes de reposição
  const containerSugestoes = document.getElementById('chipsSugestoes');
  if (containerSugestoes) {
    // Filtra produtos padrão que não estão na lista ativa
    const nomesNaLista = appState.itens.filter(i => i.idLista === appState.listaAtivaId).map(i => i.produto.toLowerCase());
    const sugestoes = appState.produtos.filter(p => !nomesNaLista.includes(p.nome.toLowerCase())).slice(0, 6);

    containerSugestoes.innerHTML = sugestoes.map(p => `
      <div class="chip-sugestao" onclick="adicionarProdutoRapido('${p.id}')">
        <span>+</span> ${p.nome}
      </div>
    `).join('');
  }
}

// 3. Renderiza a Tela de Compras (com agrupamento por corredor)
function renderizarTelaCompras() {
  const container = document.getElementById('listaItensCompras');
  if (!container) return;

  let itens = appState.itens.filter(i => i.idLista === appState.listaAtivaId);

  // Filtro por corredor
  if (appState.corredorAtivo !== 'todos') {
    itens = itens.filter(i => i.categoria.includes(appState.corredorAtivo));
  }

  if (itens.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--texto-secundario);">
        <div style="font-size: 40px; margin-bottom: 10px;">🛒</div>
        <strong style="font-size: 16px; color: var(--texto-principal);">Nenhum item nesta seção</strong>
        <p style="font-size: 13px; margin-top: 4px;">Adicione produtos ou escolha outra categoria acima.</p>
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

      <div class="item-qtd-controle">
        <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', -1)">-</button>
        <span class="qtd-valor">${item.quantidade}</span>
        <button class="btn-qtd" onclick="alterarQuantidade('${item.id}', 1)">+</button>
      </div>

      <div class="item-preco-tag ${item.precoUnitario > 0 ? 'com-preco' : ''}" onclick="abrirTecladoPreco('${item.id}')">
        ${item.precoUnitario > 0 ? formatarMoeda(item.precoUnitario * item.quantidade) : 'R$ Preço'}
      </div>
    </div>
  `).join('');
}

// 4. Renderiza o Modo Mercado
function renderizarTelaModoMercado() {
  const container = document.getElementById('listaModoMercado');
  if (!container) return;

  const itens = appState.itens.filter(i => i.idLista === appState.listaAtivaId);
  const pendentes = itens.filter(i => !i.comprado);
  const comprados = itens.filter(i => i.comprado);

  container.innerHTML = `
    <div style="margin-bottom: 14px; font-weight: 800; font-size: 14px; color: var(--texto-secundario);">
      PENDENTES NO CORREDOR (${pendentes.length})
    </div>
    <div class="lista-itens" style="margin-bottom: 24px;">
      ${pendentes.length === 0 ? '<div style="color: var(--cor-marca); font-weight: 700; padding: 12px 0;">🎉 Todos os itens foram pegos!</div>' : pendentes.map(item => `
        <div class="item-card" style="padding: 16px;">
          <div class="item-checkbox" onclick="alternarItem('${item.id}')"></div>
          <div class="item-info" onclick="alternarItem('${item.id}')">
            <div class="item-nome" style="font-size: 16px;">${item.produto}</div>
            <div class="item-categoria">${item.categoria} • Qtd: ${item.quantidade}</div>
          </div>
          <div class="item-preco-tag ${item.precoUnitario > 0 ? 'com-preco' : ''}" style="font-size: 16px;" onclick="abrirTecladoPreco('${item.id}')">
            ${item.precoUnitario > 0 ? formatarMoeda(item.precoUnitario) : '+ Preço'}
          </div>
        </div>
      `).join('')}
    </div>

    ${comprados.length > 0 ? `
      <div style="margin-bottom: 14px; font-weight: 800; font-size: 14px; color: var(--cor-marca);">
        JÁ NO CARRINHO (${comprados.length})
      </div>
      <div class="lista-itens">
        ${comprados.map(item => `
          <div class="item-card comprado">
            <div class="item-checkbox" onclick="alternarItem('${item.id}')">✓</div>
            <div class="item-info" onclick="alternarItem('${item.id}')">
              <div class="item-nome">${item.produto}</div>
              <div class="item-categoria">${item.quantidade} x ${formatarMoeda(item.precoUnitario)}</div>
            </div>
            <div class="item-preco-tag com-preco">
              ${formatarMoeda(item.quantidade * item.precoUnitario)}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// 5. Renderiza a Tela de Listas
function renderizarTelaListas() {
  const container = document.getElementById('containerListas');
  if (!container) return;

  container.innerHTML = appState.listas.map(lista => {
    const t = calcularTotaisLista(lista.id);
    return `
      <div class="item-card" style="margin-bottom: 12px; cursor: pointer;" onclick="selecionarLista('${lista.id}')">
        <div style="font-size: 28px;">📋</div>
        <div class="item-info">
          <div class="item-nome" style="font-size: 16px;">${lista.nome}</div>
          <div class="item-categoria">
            Status: <strong style="color: ${lista.status === 'ABERTA' ? 'var(--cor-marca)' : 'var(--texto-suave)'}">${lista.status}</strong> • ${t.totalItens} itens
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 15px; font-weight: 800; color: var(--cor-marca);">${formatarMoeda(t.totalCarrinho)}</div>
          <small style="color: var(--texto-suave); font-size: 11px;">${new Date(lista.dataCriacao).toLocaleDateString('pt-BR')}</small>
        </div>
      </div>
    `;
  }).join('');
}

// 6. Renderiza a Tela de Produtos
function renderizarTelaProdutos() {
  const container = document.getElementById('containerCatalogoProdutos');
  if (!container) return;

  container.innerHTML = appState.produtos.map(p => `
    <div class="item-card" style="margin-bottom: 8px;">
      <div class="item-info">
        <div class="item-nome">${p.nome}</div>
        <div class="item-categoria">${p.categoria} • Médio: ${formatarMoeda(p.precoMedio)}</div>
      </div>
      <button class="btn-qtd" style="width: auto; padding: 6px 12px;" onclick="adicionarProdutoRapido('${p.id}')">
        + Adicionar
      </button>
    </div>
  `).join('');
}

// ============================================================================
// AÇÕES DO USUÁRIO & REGRAS DE NEGÓCIO
// ============================================================================

// Alternar item comprado com Som de Bip
window.alternarItem = function(idItem) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  item.comprado = !item.comprado;

  // Som & Vibração
  if (item.comprado) {
    window.SomMercado.bipItem();
  } else {
    window.SomMercado.bipDesmarcar();
  }

  renderizarTudo();
};

// Alterar quantidade
window.alterarQuantidade = function(idItem, delta) {
  const item = appState.itens.find(i => i.id === idItem);
  if (!item) return;

  const novaQtd = (Number(item.quantidade) || 1) + delta;
  if (novaQtd <= 0) {
    if (confirm(`Remover "${item.produto}" da lista?`)) {
      appState.itens = appState.itens.filter(i => i.id !== idItem);
      window.SomMercado.bipDesmarcar();
    }
  } else {
    item.quantidade = Math.round(novaQtd * 10) / 10;
  }
  renderizarTudo();
};

// Adicionar produto rápido
window.adicionarProdutoRapido = function(idProduto) {
  const p = appState.produtos.find(prod => prod.id === idProduto);
  if (!p) return;

  // Se já existe na lista ativa, incrementa quantidade
  const existente = appState.itens.find(i => i.idLista === appState.listaAtivaId && i.produto.toLowerCase() === p.nome.toLowerCase());
  if (existente) {
    existente.quantidade += 1;
  } else {
    appState.itens.push({
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
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

// Filtro de Corredor
window.filtrarCorredor = function(corredor, botao) {
  appState.corredorAtivo = corredor;
  document.querySelectorAll('.corredor-pill').forEach(p => p.classList.remove('ativo'));
  if (botao) botao.classList.add('ativo');
  renderizarTelaCompras();
};

// ============================================================================
// TECLADO NUMÉRICO RÁPIDO (MAQUININHA)
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
  const drawer = document.getElementById('drawerTeclado');
  if (drawer) drawer.classList.remove('aberto');
  appState.itemSendoEditado = null;
};

window.digitoTeclado = function(digito) {
  if (appState.valorTecladoBuffer === '0') {
    appState.valorTecladoBuffer = String(digito);
  } else if (appState.valorTecladoBuffer.length < 8) {
    appState.valorTecladoBuffer += String(digito);
  }
  atualizarDisplayTeclado();
  window.SomMercado.bipItem();
};

window.apagarTeclado = function() {
  if (appState.valorTecladoBuffer.length > 1) {
    appState.valorTecladoBuffer = appState.valorTecladoBuffer.slice(0, -1);
  } else {
    appState.valorTecladoBuffer = '0';
  }
  atualizarDisplayTeclado();
};

window.confirmarTecladoPreco = function() {
  if (appState.itemSendoEditado) {
    const valorCentavos = parseInt(appState.valorTecladoBuffer, 10) || 0;
    appState.itemSendoEditado.precoUnitario = valorCentavos / 100;
    appState.itemSendoEditado.comprado = true; // Ao digitar o preço, já marca como no carrinho!
    window.SomMercado.bipItem();
  }
  fecharTecladoPreco();
  renderizarTudo();
};

function atualizarDisplayTeclado() {
  const display = document.getElementById('tecladoValor');
  if (!display) return;
  const centavos = parseInt(appState.valorTecladoBuffer, 10) || 0;
  display.textContent = formatarMoeda(centavos / 100);
}

// ============================================================================
// 🏁 MODAL FINALIZAR COMPRA COM SINAL SONORO (BIP CAIXA REGISTRADORA)
// ============================================================================
let formaPagamentoEscolhida = '💳 Crédito';

window.abrirModalFinalizar = function() {
  const totais = calcularTotaisLista();
  const modal = document.getElementById('modalRecibo');
  const totalDisplay = document.getElementById('reciboTotalVal');
  const qtdDisplay = document.getElementById('reciboQtdItens');

  if (totalDisplay) totalDisplay.textContent = formatarMoeda(totais.totalCarrinho);
  if (qtdDisplay) qtdDisplay.textContent = `${totais.itensComprados} itens comprados de ${totais.totalItens}`;

  if (modal) modal.classList.add('aberto');
};

window.fecharModalFinalizar = function() {
  const modal = document.getElementById('modalRecibo');
  if (modal) modal.classList.remove('aberto');
};

window.selecionarFormaPagto = function(forma, botao) {
  formaPagamentoEscolhida = forma;
  document.querySelectorAll('.opcao-pagto').forEach(b => b.classList.remove('selecionada'));
  if (botao) botao.classList.add('selecionada');
};

window.confirmarFinalizarCompraDefinitivo = function() {
  const totais = calcularTotaisLista();
  const lista = appState.listas.find(l => l.id === appState.listaAtivaId);

  // 1. 🔔 TOCA O SINAL SONORO TRIUNFAL / BIP COMEMORATIVO
  window.SomMercado.bipFinalizarCompra();

  // 2. Arquiva a lista atual no histórico
  const compraFinalizada = {
    id: 'compra_' + Date.now(),
    nomeLista: lista?.nome || 'Compras de Supermercado',
    data: new Date().toISOString(),
    total: totais.totalCarrinho,
    totalItens: totais.itensComprados,
    formaPagamento: formaPagamentoEscolhida,
    itens: appState.itens.filter(i => i.idLista === appState.listaAtivaId && i.comprado)
  };

  appState.historico.unshift(compraFinalizada);
  if (lista) {
    lista.status = 'FECHADA';
    lista.dataFechamento = new Date().toISOString();
  }

  // 3. Sincroniza em segundo plano com o Google Apps Script & Meu Financeiro
  sincronizarComBackend(compraFinalizada);

  // 4. Cria uma nova lista limpa para a próxima compra
  const novaListaId = 'lst_' + Date.now();
  appState.listas.unshift({
    id: novaListaId,
    nome: 'Próxima Compra',
    status: 'ABERTA',
    dataCriacao: new Date().toISOString(),
    orcamentoMeta: lista?.orcamentoMeta || 350.00
  });
  appState.listaAtivaId = novaListaId;

  fecharModalFinalizar();
  renderizarTudo();

  alert(`🎉 Compras finalizadas com sucesso!\n\nTotal: ${formatarMoeda(compraFinalizada.total)}\nForma: ${compraFinalizada.formaPagamento}\n\nOs dados foram arquivados e enviados para o seu ecossistema!`);
};

// Sincronização em segundo plano com Google Apps Script
async function sincronizarComBackend(compra) {
  try {
    console.log('Sincronizando compra com Google Sheets & Financeiro...', compra);
    // Dispara webhook se configurado
    if (CONFIG.GAS_WEBAPP_URL) {
      fetch(`${CONFIG.GAS_WEBAPP_URL}?api=sincronizar`, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compra)
      }).catch(err => console.log('Sync offline:', err));
    }
  } catch (e) {
    console.log('Sincronização em background finalizada:', e);
  }
}

// ============================================================================
// COMANDO DE VOZ INTEGRADO (NATIVO)
// ============================================================================
window.iniciarVozNativa = function() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Comando de voz não suportado neste navegador. Use o Chrome no celular.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;

  window.SomMercado.bipItem();
  const btn = document.getElementById('btnVozTopo');
  if (btn) btn.style.background = '#ef4444';

  recognition.onresult = function(event) {
    const texto = event.results[0][0].transcript;
    processarVoz(texto);
  };

  recognition.onend = function() {
    if (btn) btn.style.background = '';
  };

  recognition.start();
};

function processarVoz(frase) {
  console.log('Comando de voz capturado:', frase);
  // Adiciona o produto falado diretamente à lista
  appState.itens.push({
    id: 'voz_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: frase.charAt(0).toUpperCase() + frase.slice(1),
    categoria: '📦 Outros',
    quantidade: 1,
    precoUnitario: 0,
    comprado: false
  });
  window.SomMercado.bipItem();
  renderizarTudo();
  alert(`🎙️ Item adicionado via voz: "${frase}"`);
}

// ============================================================================
// FORMATADORES
// ============================================================================
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);
}

// ============================================================================
// INICIALIZAÇÃO AO CARREGAR
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  carregarLocal();
  renderizarTudo();

  // Registrar Service Worker para PWA Offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW:', err));
  }
});
