/**
 * ============================================================================
 * 🛒 MOTOR DA APLICAÇÃO — MEU MERCADO (PWA 2026 v2.1)
 * ============================================================================
 * Atualizações Críticas:
 * - 👤 Perfil do Usuário com Foto e Nome no Cabeçalho (Estilo App de Banco)
 * - 🌙 Modo Noturno e Diurno (Tema Escuro / Claro)
 * - 🎙️ Comando de Voz Ajustado:
 *    1) Microfone Direto no Item para Falar Preço ("5,70" -> salva e bip!)
 *    2) Microfone Geral com Parser Inteligente (separa nome e valor)
 * - 📋 Minhas Listas: Abrir Lista ao Clicar + Criar Nova Lista
 * - 🏪 Modo Mercado Descomplicado com 1 mão só
 * - 🔊 Bip Web Audio API ao marcar item e ao finalizar compra
 */

const CONFIG = {
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyVzn-uiAsqoXOxDGDqeVTTr3pFWPEc6SfqmiTH8j3YTAnr4MPrKRAXtQjbPI7VHp3x9w/exec',
  FINANCEIRO_URL: 'https://meu-financeiro-39138.web.app',
  STORAGE_PREFIX: 'meu_mercado_v2_'
};

// ============================================================================
// DADOS INICIAIS
// ============================================================================
const PRODUTOS_PADRAO = [
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
];

// ============================================================================
// ESTADO GLOBAL
// ============================================================================
let appState = {
  perfil: {
    nome: 'Fábio Lucena',
    papel: 'Administrador',
    avatar: '👨‍💼', // emoji ou URL de foto data:image
    fotoUrl: ''
  },
  tema: 'claro', // 'claro' ou 'escuro'
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
    { id: 'i1', idLista: 'lst_1', produto: 'Arroz Tipo 1 5kg', categoria: '🥫 Mercearia', quantidade: 1, precoUnitario: 28.50, comprado: true },
    { id: 'i2', idLista: 'lst_1', produto: 'Feijão Preto 1kg', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 8.90, comprado: true },
    { id: 'i3', idLista: 'lst_1', produto: 'Leite Integral 1L', categoria: '🧀 Laticínios', quantidade: 6, precoUnitario: 5.70, comprado: false },
    { id: 'i4', idLista: 'lst_1', produto: 'Café Torrado 500g', categoria: '🥫 Mercearia', quantidade: 2, precoUnitario: 18.90, comprado: false },
    { id: 'i5', idLista: 'lst_1', produto: 'Tomate Italiano (kg)', categoria: '🥬 Hortifrúti', quantidade: 1.5, precoUnitario: 8.90, comprado: false },
    { id: 'i6', idLista: 'lst_1', produto: 'Detergente Líquido', categoria: '🧼 Limpeza', quantidade: 3, precoUnitario: 2.50, comprado: false }
  ],
  produtos: PRODUTOS_PADRAO,
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
    console.warn('Erro ao salvar no localStorage:', e);
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
    console.warn('Erro ao carregar do localStorage:', e);
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

function aplicarTemaInicial() {
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

  // Atualiza botões da barra inferior
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('ativo'));
  if (botaoNav) {
    botaoNav.classList.add('ativo');
  } else {
    // Sincroniza o botão pelo id da tela
    if (idTela === 'telaInicio') document.getElementById('navInicio')?.classList.add('ativo');
    if (idTela === 'telaCompras') document.getElementById('navCompras')?.classList.add('ativo');
    if (idTela === 'telaModoMercado') document.getElementById('navModoMercado')?.classList.add('ativo');
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
    nomeLista: lista?.nome || 'Lista Ativa'
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
  renderizarTelaModoMercado();
  renderizarTelaListas();
  salvarLocal();
}

function renderizarCabecalhoPerfil() {
  const nomeDisplay = document.getElementById('topoNomeUsuario');
  const papelDisplay = document.getElementById('topoPapelUsuario');
  const avatarContainer = document.getElementById('avatarUsuario');

  if (nomeDisplay) nomeDisplay.textContent = appState.perfil.nome;
  if (papelDisplay) papelDisplay.textContent = appState.perfil.papel;

  if (avatarContainer) {
    if (appState.perfil.fotoUrl) {
      avatarContainer.innerHTML = `<img src="${appState.perfil.fotoUrl}" alt="Foto de perfil" />`;
    } else {
      avatarContainer.textContent = appState.perfil.avatar || '👨‍💼';
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
    const sugestoes = appState.produtos.filter(p => !nomesNaLista.includes(p.nome.toLowerCase())).slice(0, 6);

    containerSugestoes.innerHTML = sugestoes.map(p => `
      <div class="chip-sugestao" onclick="adicionarProdutoRapido('${p.id}')">
        <span>+</span> ${p.nome}
      </div>
    `).join('');
  }
}

function renderizarTelaCompras() {
  const container = document.getElementById('listaItensCompras');
  if (!container) return;

  let itens = appState.itens.filter(i => i.idLista === appState.listaAtivaId);
  if (appState.corredorAtivo !== 'todos') {
    itens = itens.filter(i => i.categoria.includes(appState.corredorAtivo));
  }

  if (itens.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--texto-secundario);">
        <div style="font-size: 38px; margin-bottom: 8px;">🛒</div>
        <strong>Nenhum item nesta seção</strong>
        <p style="font-size: 13px; margin-top: 4px;">Adicione novos produtos ou toque em "Todos" acima.</p>
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

      <!-- Microfone no Item para falar o preço -->
      <button class="btn-mic-item" id="mic_${item.id}" onclick="ouvirPrecoDoItem('${item.id}', this)" title="Falar preço deste item">
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
    </div>
  `).join('');
}

function renderizarTelaModoMercado() {
  const container = document.getElementById('listaModoMercado');
  if (!container) return;

  const itens = appState.itens.filter(i => i.idLista === appState.listaAtivaId);
  const pendentes = itens.filter(i => !i.comprado);
  const comprados = itens.filter(i => i.comprado);

  container.innerHTML = `
    <div style="margin-bottom: 12px; font-weight: 800; font-size: 13px; color: var(--texto-secundario); display: flex; justify-content: space-between;">
      <span>PENDENTES NO CORREDOR (${pendentes.length})</span>
      <small style="color: var(--cor-marca);">Toque no 🎙️ para falar o valor</small>
    </div>
    
    <div class="lista-itens" style="margin-bottom: 24px;">
      ${pendentes.length === 0 ? '<div style="color: var(--cor-marca); font-weight: 700; padding: 12px 0;">🎉 Maravilha! Todos os produtos foram pegos!</div>' : pendentes.map(item => `
        <div class="item-card" style="padding: 16px;">
          <div class="item-checkbox" onclick="alternarItem('${item.id}')"></div>
          <div class="item-info" onclick="alternarItem('${item.id}')">
            <div class="item-nome" style="font-size: 16px;">${item.produto}</div>
            <div class="item-categoria">${item.categoria} • ${item.quantidade} un</div>
          </div>
          
          <!-- Microfone direto para falar o valor no corredor -->
          <button class="btn-mic-item" id="mic_modo_${item.id}" onclick="ouvirPrecoDoItem('${item.id}', this)" title="Falar preço deste item">
            🎙️
          </button>

          <div class="item-preco-tag ${item.precoUnitario > 0 ? 'com-preco' : ''}" style="font-size: 15px;" onclick="abrirTecladoPreco('${item.id}')">
            ${item.precoUnitario > 0 ? formatarMoeda(item.precoUnitario) : '+ Preço'}
          </div>
        </div>
      `).join('')}
    </div>

    ${comprados.length > 0 ? `
      <div style="margin-bottom: 12px; font-weight: 800; font-size: 13px; color: var(--cor-marca);">
        JÁ NO CARRINHO (${comprados.length})
      </div>
      <div class="lista-itens">
        ${comprados.map(item => `
          <div class="item-card comprado">
            <div class="item-checkbox" onclick="alternarItem('${item.id}')">✓</div>
            <div class="item-info" onclick="alternarItem('${item.id}')">
              <div class="item-nome">${item.produto}</div>
              <div class="item-categoria">${item.quantidade} un x ${formatarMoeda(item.precoUnitario)}</div>
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

// 4. Renderiza a Tela Minhas Listas (Com Abrir Lista e Ações)
function renderizarTelaListas() {
  const container = document.getElementById('containerListas');
  if (!container) return;

  container.innerHTML = appState.listas.map(lista => {
    const t = calcularTotais(lista.id);
    const estaAtiva = lista.id === appState.listaAtivaId;

    return `
      <div class="item-card" style="margin-bottom: 12px; ${estaAtiva ? 'border: 2px solid var(--cor-azul);' : ''}">
        <div style="font-size: 30px; cursor: pointer;" onclick="selecionarLista('${lista.id}')">📋</div>
        
        <div class="item-info" onclick="selecionarLista('${lista.id}')">
          <div class="item-nome" style="font-size: 16px;">
            ${lista.nome} ${estaAtiva ? '<span style="font-size: 11px; color: var(--cor-azul); background: var(--cor-azul-light); padding: 2px 8px; border-radius: 10px;">ATIVA</span>' : ''}
          </div>
          <div class="item-categoria">
            Status: <strong style="color: ${lista.status === 'ABERTA' ? 'var(--cor-marca)' : 'var(--texto-suave)'}">${lista.status}</strong> • ${t.itensComprados}/${t.totalItens} no carrinho
          </div>
        </div>

        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
          <div style="font-size: 15px; font-weight: 800; color: var(--cor-marca);">${formatarMoeda(t.totalCarrinho)}</div>
          <button class="btn-qtd" style="width: auto; padding: 4px 10px; font-size: 11px; background: var(--cor-azul); color: #fff;" onclick="selecionarLista('${lista.id}')">
            Abrir
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// AÇÕES DE LISTA
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

// ============================================================================
// MICROFONE NO ITEM (FALAR PREÇO DE UM PRODUTO)
// ============================================================================
window.ouvirPrecoDoItem = function(idItem, botao) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Reconhecimento de voz não suportado neste navegador.');
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
    console.log(`Preço falado para "${item.produto}":`, fala);

    const preco = extrairPrecoDaFala(fala);
    if (preco !== null && preco > 0) {
      item.precoUnitario = preco;
      item.comprado = true; // Já marca como pego no carrinho!
      window.SomMercado.bipItem();
      renderizarTudo();
    } else {
      alert(`Não entendi o valor "${fala}". Tente dizer apenas o número (ex: "cinco e setenta" ou "5,70").`);
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

function extrairPrecoDaFala(texto) {
  let limpo = texto.toLowerCase()
    .replace(/reais?/g, '')
    .replace(/centavos?/g, '')
    .replace(/cada/g, '')
    .replace(/por/g, '')
    .trim();

  // Ex: "5,70" ou "5.70"
  const regexNum = /(\d+)[,\.]?(\d{0,2})/;
  const match = limpo.match(regexNum);
  if (match) {
    const inteiros = match[1];
    let centavos = match[2] || '0';
    if (centavos.length === 1) centavos += '0';
    return parseFloat(`${inteiros}.${centavos}`);
  }

  // Conversão de números por extenso básicos
  const mapa = {
    'um': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4,
    'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9, 'dez': 10,
    'quinze': 15, 'vinte': 20, 'trinta': 30, 'cinquenta': 50
  };

  const partes = limpo.split(/\s+e\s+|\s+/);
  if (partes.length >= 1 && mapa[partes[0]]) {
    const inteiros = mapa[partes[0]];
    let centavos = 0;
    if (partes.length >= 2 && mapa[partes[1]]) centavos = mapa[partes[1]];
    return inteiros + (centavos / 100);
  }

  return null;
}

// ============================================================================
// MICROFONE GERAL DO TOPO (COM PARSER INTELIGENTE)
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

  // Verifica se há preço no final: "leite integral 5,70 cada" ou "tomate 8 reais"
  const regex = /^(.*?)(?:por\s+|\s+)(\d+(?:[,\.]\d{1,2})?)\s*(?:reais|real)?(?:\s*cada)?$/i;
  const match = limpo.match(regex);

  let nome = limpo;
  let preco = 0;

  if (match && match[1].trim().length > 1) {
    nome = match[1].trim();
    preco = parseFloat(match[2].replace(',', '.')) || 0;
  }

  // Remove repetições acidentais e formata
  nome = nome.charAt(0).toUpperCase() + nome.slice(1);

  appState.itens.push({
    id: 'voz_' + Date.now(),
    idLista: appState.listaAtivaId,
    produto: nome,
    categoria: '📦 Outros',
    quantidade: 1,
    precoUnitario: preco,
    comprado: preco > 0
  });

  window.SomMercado.bipItem();
  renderizarTudo();
  alert(`🎙️ Produto adicionado:\n${nome}${preco > 0 ? ' • R$ ' + preco.toFixed(2) : ''}`);
}

// ============================================================================
// MODAL DE PERFIL (FOTO E NOME - ESTILO BANCO)
// ============================================================================
window.abrirModalPerfil = function() {
  const modal = document.getElementById('modalPerfil');
  const inputNome = document.getElementById('inputNomePerfil');
  if (inputNome) inputNome.value = appState.perfil.nome;
  if (modal) modal.classList.add('aberto');
};

window.fecharModalPerfil = function() {
  const modal = document.getElementById('modalPerfil');
  if (modal) modal.classList.remove('aberto');
};

window.trocarPerfilPredefinido = function(nome, papel, avatar) {
  appState.perfil.nome = nome;
  appState.perfil.papel = papel;
  appState.perfil.avatar = avatar;
  appState.perfil.fotoUrl = '';
  salvarLocal();
  renderizarCabecalhoPerfil();
  fecharModalPerfil();
  window.SomMercado.bipItem();
};

window.salvarPerfilCustomizado = function() {
  const inputNome = document.getElementById('inputNomePerfil');
  if (inputNome && inputNome.value.trim()) {
    appState.perfil.nome = inputNome.value.trim();
  }
  salvarLocal();
  renderizarCabecalhoPerfil();
  fecharModalPerfil();
  window.SomMercado.bipItem();
};

window.carregarFotoPerfilArquivo = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    appState.perfil.fotoUrl = e.target.result;
    salvarLocal();
    renderizarCabecalhoPerfil();
  };
  reader.readAsDataURL(file);
};

// ============================================================================
// DEMAIS AÇÕES DE ITENS & TECLADO
// ============================================================================
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
    if (confirm(`Remover "${item.produto}" da lista?`)) {
      appState.itens = appState.itens.filter(i => i.id !== idItem);
      window.SomMercado.bipDesmarcar();
    }
  } else {
    item.quantidade = Math.round(nova * 10) / 10;
  }
  renderizarTudo();
};

window.adicionarProdutoRapido = function(idProduto) {
  const p = appState.produtos.find(prod => prod.id === idProduto);
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

window.filtrarCorredor = function(corredor, botao) {
  appState.corredorAtivo = corredor;
  document.querySelectorAll('.corredor-pill').forEach(p => p.classList.remove('ativo'));
  if (botao) botao.classList.add('ativo');
  renderizarTelaCompras();
};

// Teclado Maquininha
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

// Modal Finalizar Compras com Bip
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

  // 🔔 Toca sinal sonoro de sucesso triunfal
  window.SomMercado.bipFinalizarCompra();

  const compra = {
    id: 'compra_' + Date.now(),
    nomeLista: lista?.nome || 'Compras de Supermercado',
    data: new Date().toISOString(),
    total: totais.totalCarrinho,
    totalItens: totais.itensComprados,
    formaPagamento: formaPagamentoEscolhida,
    responsavel: appState.perfil.nome,
    itens: appState.itens.filter(i => i.idLista === appState.listaAtivaId && i.comprado)
  };

  appState.historico.unshift(compra);
  if (lista) {
    lista.status = 'FECHADA';
    lista.dataFechamento = new Date().toISOString();
  }

  // Cria nova lista limpa
  const novaId = 'lst_' + Date.now();
  appState.listas.unshift({
    id: novaId,
    nome: 'Próxima Compra',
    status: 'ABERTA',
    dataCriacao: new Date().toISOString(),
    orcamentoMeta: lista?.orcamentoMeta || 350.00
  });
  appState.listaAtivaId = novaId;

  fecharModalFinalizar();
  renderizarTudo();

  alert(`🎉 Compras finalizadas com sucesso!\n\nResponsável: ${compra.responsavel}\nTotal: ${formatarMoeda(compra.total)}\nPagamento: ${compra.formaPagamento}\n\nDados salvos e integrados ao Meu Financeiro!`);
};

function formatarMoeda(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  carregarLocal();
  aplicarTemaInicial();
  renderizarTudo();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW:', err));
  }
});
