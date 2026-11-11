/**
 * ============================================================================
 * 🧾 LEITOR DE CUPOM FISCAL ULTRA-RÁPIDO (GEMINI VISION REST v1beta)
 * ============================================================================
 * - Prioridade estrita de modelos rápidos:
 *   1) gemini-3.5-flash-lite
 *   2) gemini-3.5-flash
 *   3) gemini-flash-lite-latest
 *   4) gemini-flash-latest
 * - Compressão via <canvas> (máx 1600px, JPEG 0.85)
 * - Timeout de 20s via AbortController
 * - Suporte a chaves AQ... e AIzaSy... com validação em tempo real + fallback VITE_GEMINI_API_KEY
 * - Tela de Conferência Prévia item a item com seletor de categorias pesquisável
 */
(function() {
  'use strict';

  const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
  const GEMINI_MODELOS_PRIORIDADE = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-flash-latest'
  ];
  const GEMINI_MODELOS_BLOQUEADOS = new Set([
    'gemini-1.5-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite'
  ]);
  const TIMEOUT_VISAO_MS = 20000;
  const MAX_DIMENSAO_IMAGEM = 1600;
  const QUALIDADE_JPEG = 0.85;
  const STORAGE_KEY_GEMINI = (typeof CONFIG !== 'undefined' ? CONFIG.STORAGE_PREFIX : 'meu_mercado_v2_4_') + 'gemini_api_key';

  const CATEGORIAS_CUPOM = [
    { id: '🥫 Mercearia', icone: '🥫', nome: 'Mercearia', grupo: 'Alimentos', palavras: 'arroz feijao oleo macarrao cafe acucar sal farinha molho extrato milho atum' },
    { id: '🧀 Laticínios', icone: '🧀', nome: 'Laticínios & Frios', grupo: 'Alimentos', palavras: 'leite queijo mucarela manteiga requeijao iogurte creme presunto' },
    { id: '🥩 Carnes', icone: '🥩', nome: 'Carnes & Peixes', grupo: 'Alimentos', palavras: 'carne frango boi porco peixe linguica bacon bife alcatra patinho peito' },
    { id: '🥬 Hortifrúti', icone: '🥬', nome: 'Hortifrúti', grupo: 'Alimentos', palavras: 'tomate cebola alho batata cenoura banana maca laranja alface fruta verdura legume' },
    { id: '🥖 Padaria', icone: '🥖', nome: 'Padaria & Lanches', grupo: 'Alimentos', palavras: 'pao bolo biscoito bolacha torrada queijo doce salgado' },
    { id: '🥤 Bebidas', icone: '🥤', nome: 'Bebidas', grupo: 'Bebidas', palavras: 'agua suco refrigerante cerveja vinho energetico cha cafe' },
    { id: '🧼 Limpeza', icone: '🧼', nome: 'Limpeza', grupo: 'Casa', palavras: 'sabao detergente amaciante desinfetante agua sanitaria esponja papel toalha alvejante' },
    { id: '🧴 Higiene', icone: '🧴', nome: 'Higiene Pessoal', grupo: 'Casa', palavras: 'papel higienico sabonete shampoo condicionador creme dental escova desodorante' },
    { id: '📦 Outros', icone: '📦', nome: 'Outros', grupo: 'Geral', palavras: 'diversos geral pet utilidades' }
  ];

  let cupomConferenciaState = null;
  let itemEditandoCategoriaIdx = null;
  let abortControllerAtivo = null;
  let arquivoCupomPendente = null;

  // ============================================================================
  // UTILITÁRIOS DE SEGURANÇA, FORMATAÇÃO E CATEGORIA
  // ============================================================================
  function escaparHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function dataHojeIso() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dia}`;
  }

  function formatarDataCurtaBr(isoDate) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}/.test(isoDate)) {
      return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
    const [y, m, d] = isoDate.slice(0, 10).split('-');
    return `${d}/${m}`;
  }

  function parseNumeroSegura(val, fallback = 0) {
    if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
    if (typeof val !== 'string') return fallback;
    const limpo = val.replace(/R\$/gi, '').trim();
    const normalizado = limpo.includes(',') && limpo.includes('.')
      ? limpo.replace(/\./g, '').replace(',', '.')
      : limpo.replace(',', '.');
    const num = parseFloat(normalizado);
    return Number.isFinite(num) ? num : fallback;
  }

  function normalizarCategoriaCupom(catRaw, nomeProduto) {
    const textoCat = String(catRaw || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchDireto = CATEGORIAS_CUPOM.find(c => {
      const cid = c.id.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cnome = c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return textoCat && (cid.includes(textoCat) || textoCat.includes(cnome) || textoCat.includes(cid.replace(/^[^\w]+/, '').trim()));
    });
    if (matchDireto) return matchDireto.id;

    if (typeof buscarNoCatalogo === 'function' && nomeProduto) {
      const catCatalogo = buscarNoCatalogo(nomeProduto)?.categoria;
      if (catCatalogo && CATEGORIAS_CUPOM.some(c => c.id === catCatalogo)) {
        return catCatalogo;
      }
    }

    const textoNorm = `${textoCat} ${String(nomeProduto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
    if (/leite|queijo|iogurte|manteiga|requeijao|creme|frios|presunto|mucarela|mussarela/.test(textoNorm)) return '🧀 Laticínios';
    if (/carne|frango|bife|peito|linguica|bacon|bov|suino|peixe|file|patinho|acem|coxao/.test(textoNorm)) return '🥩 Carnes';
    if (/tomate|cebola|alho|batata|cenoura|banana|maca|laranja|alface|fruta|verdura|legume|hortifruti|limao|mamao/.test(textoNorm)) return '🥬 Hortifrúti';
    if (/pao|bisnaga|bolo|biscoito|bolacha|torrada|padaria|croissant|panetone/.test(textoNorm)) return '🥖 Padaria';
    if (/suco|refrig|coca|guarana|cerveja|vinho|agua mineral|energetico|bebida|chopp/.test(textoNorm)) return '🥤 Bebidas';
    if (/sabao|detergente|amaciante|desinfetante|esponja|limpeza|alvejante|cloro|agua sanitaria|multiuso|papel toalha/.test(textoNorm)) return '🧼 Limpeza';
    if (/papel hig|sabonete|shampoo|condicionador|creme dental|escova|desodorante|higiene|absorvente|fralda/.test(textoNorm)) return '🧴 Higiene';
    if (/arroz|feijao|oleo|azeite|molho|extrato|cafe|acucar|sal|farinha|macarrao|espaguete|milho|atum|aveia|mercearia/.test(textoNorm)) return '🥫 Mercearia';
    return '📦 Outros';
  }

  // ============================================================================
  // GERENCIAMENTO DA CHAVE GEMINI (AQ... e AIzaSy... + VITE_GEMINI_API_KEY)
  // ============================================================================
  window.obterChaveGemini = function() {
    const doEstado = (typeof appState !== 'undefined' && appState?.geminiApiKey) ? String(appState.geminiApiKey).trim() : '';
    if (doEstado) return doEstado;

    try {
      const doStorage = (localStorage.getItem(STORAGE_KEY_GEMINI) || '').trim();
      if (doStorage) return doStorage;
    } catch (_) {}

    const doEnv = (
      (typeof window !== 'undefined' && (window.VITE_GEMINI_API_KEY || window.__ENV__?.VITE_GEMINI_API_KEY)) ||
      (typeof globalThis !== 'undefined' && globalThis.VITE_GEMINI_API_KEY) ||
      ''
    );
    return String(doEnv || '').trim();
  };

  function persistirChaveGemini(chaveLimpa, sincronizarPerfilNuvem = true) {
    try {
      localStorage.setItem(STORAGE_KEY_GEMINI, chaveLimpa);
    } catch (_) {}
    if (typeof appState !== 'undefined') {
      appState.geminiApiKey = chaveLimpa;
    }
    if (typeof salvarLocal === 'function') {
      salvarLocal();
    }
    if (sincronizarPerfilNuvem) {
      salvarChaveGeminiPerfilNuvem(chaveLimpa);
    }
  }

  async function buscarChaveGeminiPerfilNuvem() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return '';
    const projectId = (typeof CONFIG !== 'undefined' && CONFIG.FIREBASE_PROJECT_ID) ? CONFIG.FIREBASE_PROJECT_ID : 'meu-financeiro-39138';
    const userId = (typeof CONFIG !== 'undefined' && CONFIG.USER_ID) ? CONFIG.USER_ID : 'fabio-master-uid';
    let chaveEncontrada = '';

    // 1. Tenta via SDK Firestore (se inicializado em app.js)
    try {
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        const snap = await dbFirestore.collection('usuarios').doc(userId).collection('perfil').doc('dados').get();
        if (snap.exists) {
          const data = snap.data() || {};
          if (typeof data.geminiApiKey === 'string' && data.geminiApiKey.trim()) {
            chaveEncontrada = data.geminiApiKey.trim();
          }
        }
      }
    } catch (e) {
      console.warn('Falha ao buscar chave Gemini no perfil via SDK:', e);
    }

    // 2. Fallback via REST API do Firestore (mesmo projeto/usuário do Meu Financeiro)
    if (!chaveEncontrada) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/usuarios/${userId}/perfil/dados`;
        const res = await fetch(url, { method: 'GET', signal: controller.signal });
        if (res.ok) {
          const doc = await res.json();
          const val = doc?.fields?.geminiApiKey?.stringValue;
          if (typeof val === 'string' && val.trim()) {
            chaveEncontrada = val.trim();
          }
        }
      } catch (e) {
        console.warn('Falha ao buscar chave Gemini no perfil via REST:', e);
      } finally {
        clearTimeout(timer);
      }
    }

    if (chaveEncontrada) {
      persistirChaveGemini(chaveEncontrada, false);
      window.atualizarUIChaveGemini?.();
    }
    return chaveEncontrada;
  }

  async function salvarChaveGeminiPerfilNuvem(chaveLimpa) {
    if (!chaveLimpa || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
    const projectId = (typeof CONFIG !== 'undefined' && CONFIG.FIREBASE_PROJECT_ID) ? CONFIG.FIREBASE_PROJECT_ID : 'meu-financeiro-39138';
    const userId = (typeof CONFIG !== 'undefined' && CONFIG.USER_ID) ? CONFIG.USER_ID : 'fabio-master-uid';

    try {
      if (typeof dbFirestore !== 'undefined' && dbFirestore) {
        await dbFirestore.collection('usuarios').doc(userId).collection('perfil').doc('dados').set({
          geminiApiKey: chaveLimpa,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
        return;
      }
    } catch (e) {
      console.warn('Falha ao gravar chave no perfil via SDK, tentando REST:', e);
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/usuarios/${userId}/perfil/dados?updateMask.fieldPaths=geminiApiKey&updateMask.fieldPaths=atualizadoEm`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            geminiApiKey: { stringValue: chaveLimpa },
            atualizadoEm: { stringValue: new Date().toISOString() }
          }
        })
      });
    } catch (e) {
      console.warn('Falha ao gravar chave no perfil via REST:', e);
    }
  }

  async function validarChaveNaApiGemini(chaveLimpa, signalExterno) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const onAbortExterno = () => controller.abort();
    if (signalExterno) signalExterno.addEventListener('abort', onAbortExterno, { once: true });

    try {
      const url = `${GEMINI_API_BASE}/models?key=${encodeURIComponent(chaveLimpa)}`;
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msgErro = data?.error?.message || `Erro HTTP ${res.status} ao validar a chave.`;
        throw new Error(msgErro);
      }

      const modelos = Array.isArray(data?.models) ? data.models : [];
      return modelos;
    } finally {
      clearTimeout(timer);
      if (signalExterno) signalExterno.removeEventListener('abort', onAbortExterno);
    }
  }

  window.atualizarUIChaveGemini = function() {
    const chave = window.obterChaveGemini();
    const temChave = Boolean(chave);
    const mascarada = temChave && chave.length > 10
      ? `${chave.slice(0, 6)}••••${chave.slice(-4)}`
      : (temChave ? '••••••' : '');

    // Atualiza painel dentro do Modal de Perfil
    const badgePerfil = document.getElementById('statusChaveGeminiPerfil');
    const inputPerfil = document.getElementById('inputChaveGeminiPerfil');
    if (badgePerfil) {
      badgePerfil.textContent = temChave ? `✓ Conectada (${mascarada})` : 'Não configurada';
      badgePerfil.className = `cupom-status-chave ${temChave ? 'ok' : 'pendente'}`;
    }
    if (inputPerfil && !inputPerfil.value && temChave) {
      inputPerfil.value = chave;
    }

    // Atualiza painel dentro do Modal de Cupom Fiscal
    const boxConfigScanner = document.getElementById('cupomBoxConfigChave');
    const badgeScanner = document.getElementById('cupomStatusChaveInline');
    const inputScanner = document.getElementById('inputChaveGeminiScanner');
    if (badgeScanner) {
      badgeScanner.textContent = temChave ? `Chave ativa (${mascarada})` : 'Configure sua chave da API';
    }
    if (inputScanner && !inputScanner.value && temChave) {
      inputScanner.value = chave;
    }
    if (boxConfigScanner) {
      boxConfigScanner.style.display = temChave ? 'none' : 'block';
    }
  };

  window.alternarConfigChaveScanner = function() {
    const box = document.getElementById('cupomBoxConfigChave');
    if (!box) return;
    const visivel = box.style.display !== 'none';
    box.style.display = visivel ? 'none' : 'block';
    if (!visivel) {
      const input = document.getElementById('inputChaveGeminiScanner');
      if (input) input.value = window.obterChaveGemini();
    }
  };

  window.salvarChaveGemini = async function(origem = 'scanner') {
    const inputId = origem === 'perfil' ? 'inputChaveGeminiPerfil' : 'inputChaveGeminiScanner';
    const btnId = origem === 'perfil' ? 'btnSalvarChaveGeminiPerfil' : 'btnSalvarChaveGeminiScanner';
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);

    const chave = String(input?.value || '').trim();
    if (!chave) {
      window.mostrarToastMercado?.('Cole sua chave da API do Google AI Studio (AQ... ou AIzaSy...).', 'alerta');
      input?.focus();
      return;
    }

    // Aceita diretamente chaves AQ. e AIzaSy... sem qualquer popup "Deseja salvar mesmo assim?"
    const textoOriginal = btn?.textContent || 'Validar e Salvar';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Validando...';
    }

    try {
      await validarChaveNaApiGemini(chave);
      persistirChaveGemini(chave, true);
      window.atualizarUIChaveGemini();
      window.SomMercado?.bipItem?.();
      window.mostrarToastMercado?.('✅ Chave validada em tempo real e salva na nuvem!', 'sucesso', 3500);

      if (origem === 'scanner' && arquivoCupomPendente) {
        const pendente = arquivoCupomPendente;
        arquivoCupomPendente = null;
        await processarArquivoObjetoCupom(pendente);
      }
    } catch (err) {
      console.warn('Falha ao validar chave Gemini:', err);
      const msg = err?.name === 'AbortError'
        ? 'Tempo esgotado ao validar a chave. Verifique sua conexão.'
        : `Chave recusada pela API: ${err?.message || 'verifique o valor colado.'}`;
      window.mostrarToastMercado?.(msg, 'erro', 5000);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = textoOriginal;
      }
    }
  };

  // ============================================================================
  // COMPRESSÃO DE IMAGEM VIA <canvas> (MÁX 1600px, JPEG 0.85)
  // ============================================================================
  function comprimirImagemCupom(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Selecione um arquivo de imagem válido (foto ou print).'));
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        try {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (!w || !h) {
            throw new Error('Não foi possível ler as dimensões da imagem.');
          }

          const maiorLado = Math.max(w, h);
          if (maiorLado > MAX_DIMENSAO_IMAGEM) {
            const escala = MAX_DIMENSAO_IMAGEM / maiorLado;
            w = Math.round(w * escala);
            h = Math.round(h * escala);
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D indisponível neste navegador.');
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          const dataUrl = canvas.toDataURL('image/jpeg', QUALIDADE_JPEG);
          const base64 = dataUrl.split(',')[1] || '';
          if (!base64) {
            throw new Error('Falha ao comprimir imagem para JPEG.');
          }

          resolve({ dataUrl, base64, mimeType: 'image/jpeg', width: w, height: h });
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Não foi possível carregar a imagem selecionada.'));
      };

      img.src = objectUrl;
    });
  }

  // ============================================================================
  // MOTOR GEMINI VISION REST v1beta (DISCOVERY + FALLBACK RÁPIDO + 20s ABORT)
  // ============================================================================
  function selecionarModeloPrioritario(modelosApi) {
    const elegiveis = (modelosApi || [])
      .filter(m => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => String(m.name || '').replace(/^models\//, '').trim())
      .filter(nome => nome && !GEMINI_MODELOS_BLOQUEADOS.has(nome));

    for (const alvo of GEMINI_MODELOS_PRIORIDADE) {
      const exato = elegiveis.find(n => n === alvo);
      if (exato) return exato;
      const prefixo = elegiveis.find(n => n.startsWith(alvo));
      if (prefixo && !GEMINI_MODELOS_BLOQUEADOS.has(prefixo)) return prefixo;
    }

    return GEMINI_MODELOS_PRIORIDADE[0];
  }

  function extrairTextoPrimeiroPart(respostaJson) {
    const parts = respostaJson?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return '';
    const partTexto = parts.find(p => typeof p?.text === 'string' && p.text.trim().length > 0);
    return partTexto ? partTexto.text : '';
  }

  function parseJsonResiliente(textoBruto) {
    const texto = String(textoBruto || '').trim();
    if (!texto) {
      throw new Error('A IA retornou uma resposta vazia.');
    }

    try {
      return JSON.parse(texto);
    } catch (_) {}

    const semMarkdown = texto
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      return JSON.parse(semMarkdown);
    } catch (_) {}

    const inicio = texto.indexOf('{');
    const fim = texto.lastIndexOf('}');
    if (inicio !== -1 && fim > inicio) {
      const trecho = texto.slice(inicio, fim + 1);
      return JSON.parse(trecho);
    }

    throw new Error('Não foi possível interpretar o JSON retornado pelo leitor.');
  }

  const PROMPT_CUPOM_FISCAL = `Você é um leitor especialista em cupons fiscais e prints da SEFAZ (NFC-e / SAT) de supermercados brasileiros.
Analise a imagem enviada e extraia TODOS os dados da compra em JSON puro, sem texto adicional.

Regras obrigatórias:
1. Extraia CADA UM dos produtos listados na nota fiscal, sem omitir nem agrupar itens diferentes.
2. Em "nome": limpe abreviações típicas de PDV/cupom fiscal deixando legível em português (ex: "LT INT PIRACANJUBA" -> "Leite Integral Piracanjuba", "ARR BR T1 5KG" -> "Arroz Branco 5kg", "TOMATE ITAL KG" -> "Tomate Italiano (kg)").
3. Em "quantidade": número decimal (ex: 1, 2, 0.75 para kg).
4. Em "precoUnitario" e "precoTotal": valores numéricos em reais (use ponto decimal, ex: 5.70). Se só houver preço total do item, calcule precoUnitario = precoTotal / quantidade.
5. Em "categoria": escolha EXATAMENTE UMA das opções abaixo:
   - "🥫 Mercearia"
   - "🧀 Laticínios"
   - "🥩 Carnes"
   - "🥬 Hortifrúti"
   - "🥖 Padaria"
   - "🥤 Bebidas"
   - "🧼 Limpeza"
   - "🧴 Higiene"
   - "📦 Outros"
6. Extraia "supermercado" (nome fantasia limpo), "dataCompra" no formato "YYYY-MM-DD", "desconto" (0 se não houver) e "valorTotal" (total pago na nota).

Formato JSON obrigatório:
{
  "supermercado": "Nome do Supermercado",
  "dataCompra": "YYYY-MM-DD",
  "desconto": 0.00,
  "valorTotal": 0.00,
  "itens": [
    {
      "nome": "Nome limpo do produto",
      "quantidade": 1,
      "precoUnitario": 0.00,
      "precoTotal": 0.00,
      "categoria": "🥫 Mercearia"
    }
  ]
}`;

  async function chamarGenerateContent(modelo, apiKey, imagemBase64, signal) {
    const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(modelo)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [
        {
          parts: [
            { text: PROMPT_CUPOM_FISCAL },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imagemBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || `HTTP ${res.status}`;
      const erro = new Error(msg);
      erro.status = res.status;
      throw erro;
    }

    const texto = extrairTextoPrimeiroPart(data);
    return parseJsonResiliente(texto);
  }

  async function analisarCupomComGemini(imagemBase64) {
    const apiKey = window.obterChaveGemini();
    if (!apiKey) {
      throw new Error('Configure sua chave da API do Google AI Studio antes de ler o cupom.');
    }

    if (abortControllerAtivo) {
      try { abortControllerAtivo.abort(); } catch (_) {}
    }
    const controller = new AbortController();
    abortControllerAtivo = controller;
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_VISAO_MS);

    try {
      let modeloEscolhido = GEMINI_MODELOS_PRIORIDADE[0];
      try {
        const modelosDisponiveis = await validarChaveNaApiGemini(apiKey, controller.signal);
        modeloEscolhido = selecionarModeloPrioritario(modelosDisponiveis);
      } catch (errDiscovery) {
        if (errDiscovery?.name === 'AbortError') throw errDiscovery;
        console.warn('Discovery /v1beta/models falhou, tentando prioridade direta:', errDiscovery);
      }

      const candidatos = [
        modeloEscolhido,
        ...GEMINI_MODELOS_PRIORIDADE.filter(m => m !== modeloEscolhido)
      ].filter(m => !GEMINI_MODELOS_BLOQUEADOS.has(m));

      let ultimoErro = null;
      for (const modelo of candidatos) {
        try {
          return await chamarGenerateContent(modelo, apiKey, imagemBase64, controller.signal);
        } catch (errGen) {
          if (errGen?.name === 'AbortError') throw errGen;
          ultimoErro = errGen;
          const podeTentarProximo = errGen?.status === 404 || errGen?.status === 429 || errGen?.status === 503;
          if (!podeTentarProximo) throw errGen;
        }
      }
      throw ultimoErro || new Error('Nenhum modelo rápido respondeu ao processamento do cupom.');
    } finally {
      clearTimeout(timeoutId);
      if (abortControllerAtivo === controller) {
        abortControllerAtivo = null;
      }
    }
  }

  function normalizarDadosCupom(bruto) {
    const supermercado = String(bruto?.supermercado || '').trim() || 'Supermercado';
    const dataRaw = String(bruto?.dataCompra || '').trim();
    const dataCompra = /^\d{4}-\d{2}-\d{2}$/.test(dataRaw) ? dataRaw : dataHojeIso();
    const desconto = Math.max(0, parseNumeroSegura(bruto?.desconto, 0));

    const itensBrutos = Array.isArray(bruto?.itens) ? bruto.itens : [];
    const itens = itensBrutos
      .map((it) => {
        const nome = String(it?.nome || it?.produto || '').replace(/\s+/g, ' ').trim();
        if (!nome) return null;

        let qtd = parseNumeroSegura(it?.quantidade, 1);
        if (!(qtd > 0)) qtd = 1;
        qtd = Math.round(qtd * 1000) / 1000;

        let unit = Math.max(0, parseNumeroSegura(it?.precoUnitario, 0));
        let total = Math.max(0, parseNumeroSegura(it?.precoTotal, 0));

        if (unit === 0 && total > 0) {
          unit = Math.round((total / qtd) * 100) / 100;
        } else if (total === 0 && unit > 0) {
          total = Math.round((unit * qtd) * 100) / 100;
        } else if (unit > 0 && total > 0) {
          total = Math.round(total * 100) / 100;
        }

        return {
          selecionado: true,
          nome,
          quantidade: qtd,
          precoUnitario: unit,
          precoTotal: total,
          categoria: normalizarCategoriaCupom(it?.categoria, nome)
        };
      })
      .filter(Boolean);

    const somaItens = itens.reduce((acc, it) => acc + it.precoTotal, 0);
    let valorTotal = Math.max(0, parseNumeroSegura(bruto?.valorTotal, 0));
    if (valorTotal === 0 && somaItens > 0) {
      valorTotal = Math.max(0, Math.round((somaItens - desconto) * 100) / 100);
    }

    return {
      supermercado,
      dataCompra,
      desconto,
      valorTotal,
      itens
    };
  }

  // ============================================================================
  // FLUXO DO MODAL DE CAPTURA (CÂMERA / GALERIA / PRINT SEFAZ)
  // ============================================================================
  window.abrirModalCupomFiscal = function() {
    const modal = document.getElementById('modalCupomFiscal');
    if (!modal) return;
    arquivoCupomPendente = null;
    definirCarregandoCupom(false);
    const inputCam = document.getElementById('inputFotoCupomCamera');
    const inputGal = document.getElementById('inputFotoCupomGaleria');
    if (inputCam) inputCam.value = '';
    if (inputGal) inputGal.value = '';

    window.atualizarUIChaveGemini();
    modal.classList.add('aberto');

    if (!window.obterChaveGemini()) {
      buscarChaveGeminiPerfilNuvem();
    }
  };

  window.fecharModalCupomFiscal = function() {
    if (abortControllerAtivo) {
      try { abortControllerAtivo.abort(); } catch (_) {}
      abortControllerAtivo = null;
    }
    arquivoCupomPendente = null;
    definirCarregandoCupom(false);
    document.getElementById('modalCupomFiscal')?.classList.remove('aberto');
  };

  function definirCarregandoCupom(ativo, texto = 'Lendo produtos do cupom...') {
    const loader = document.getElementById('cupomLoadingBox');
    const textoEl = document.getElementById('cupomLoadingTexto');
    const areaUpload = document.getElementById('cupomAreaUpload');
    if (loader) loader.style.display = ativo ? 'flex' : 'none';
    if (textoEl) textoEl.textContent = texto;
    if (areaUpload) areaUpload.style.display = ativo ? 'none' : 'flex';
  }

  async function processarArquivoObjetoCupom(file) {
    if (!file) return;

    let chave = window.obterChaveGemini();
    if (!chave) {
      definirCarregandoCupom(true, 'Verificando sua chave salva na nuvem...');
      chave = await buscarChaveGeminiPerfilNuvem();
    }

    if (!chave) {
      arquivoCupomPendente = file;
      definirCarregandoCupom(false);
      window.atualizarUIChaveGemini();
      const box = document.getElementById('cupomBoxConfigChave');
      if (box) box.style.display = 'block';
      window.mostrarToastMercado?.('📸 Foto pronta! Cole e valide sua chave abaixo para ler imediatamente.', 'alerta', 4500);
      document.getElementById('inputChaveGeminiScanner')?.focus();
      return;
    }

    definirCarregandoCupom(true, 'Otimizando imagem do cupom...');

    try {
      const imgComprimida = await comprimirImagemCupom(file);
      definirCarregandoCupom(true, 'Extraindo itens da nota fiscal...');

      const jsonExtraido = await analisarCupomComGemini(imgComprimida.base64);
      const dadosNormalizados = normalizarDadosCupom(jsonExtraido);

      if (dadosNormalizados.itens.length === 0) {
        throw new Error('Nenhum produto foi identificado nessa imagem. Tente uma foto mais nítida ou um print completo da SEFAZ.');
      }

      arquivoCupomPendente = null;
      window.SomMercado?.bipItem?.();
      window.fecharModalCupomFiscal();
      abrirModalConferenciaCupom(dadosNormalizados);
    } catch (err) {
      console.error('Erro ao processar cupom fiscal:', err);
      const msg = err?.name === 'AbortError'
        ? 'Tempo limite de 20s atingido. Tente novamente com uma foto mais próxima e bem iluminada.'
        : (err?.message || 'Não foi possível ler o cupom fiscal.');
      window.mostrarToastMercado?.(msg, 'erro', 5000);
      definirCarregandoCupom(false);
    }
  }

  window.processarArquivoCupom = async function(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    try {
      await processarArquivoObjetoCupom(file);
    } finally {
      if (event?.target) event.target.value = '';
    }
  };

  // ============================================================================
  // TELA DE CONFERÊNCIA PRÉVIA ITEM A ITEM
  // ============================================================================
  function abrirModalConferenciaCupom(dados) {
    const listaAtiva = (typeof appState !== 'undefined' && Array.isArray(appState.listas))
      ? appState.listas.find(l => l.id === appState.listaAtivaId)
      : null;

    cupomConferenciaState = {
      supermercado: dados.supermercado,
      dataCompra: dados.dataCompra,
      desconto: dados.desconto,
      valorTotalNota: dados.valorTotal,
      itens: dados.itens,
      destino: 'ativa', // 'ativa' | 'nova'
      nomeNovaLista: `Cupom ${dados.supermercado} (${formatarDataCurtaBr(dados.dataCompra)})`
    };

    const inputMercado = document.getElementById('confCupomSupermercado');
    const inputData = document.getElementById('confCupomData');
    const inputDesconto = document.getElementById('confCupomDesconto');
    const inputTotalNota = document.getElementById('confCupomTotalNota');
    const inputNovaLista = document.getElementById('confCupomNomeNovaLista');
    const labelListaAtiva = document.getElementById('confLabelListaAtiva');

    if (inputMercado) inputMercado.value = cupomConferenciaState.supermercado;
    if (inputData) inputData.value = cupomConferenciaState.dataCompra;
    if (inputDesconto) inputDesconto.value = cupomConferenciaState.desconto.toFixed(2);
    if (inputTotalNota) inputTotalNota.value = cupomConferenciaState.valorTotalNota.toFixed(2);
    if (inputNovaLista) inputNovaLista.value = cupomConferenciaState.nomeNovaLista;
    if (labelListaAtiva) {
      labelListaAtiva.textContent = listaAtiva ? `Lista Ativa (${listaAtiva.nome})` : 'Lista Ativa';
    }

    window.selecionarDestinoCupom('ativa');
    renderizarListaConferenciaCupom();
    document.getElementById('modalConferenciaCupom')?.classList.add('aberto');
  }

  window.fecharModalConferenciaCupom = function() {
    fecharModalCategoriaCupom();
    document.getElementById('modalConferenciaCupom')?.classList.remove('aberto');
  };

  window.selecionarDestinoCupom = function(destino) {
    if (!cupomConferenciaState) return;
    cupomConferenciaState.destino = destino === 'nova' ? 'nova' : 'ativa';

    const btnAtiva = document.getElementById('btnDestinoListaAtiva');
    const btnNova = document.getElementById('btnDestinoNovaLista');
    const boxNova = document.getElementById('boxNomeNovaListaCupom');

    if (btnAtiva) btnAtiva.classList.toggle('ativo', cupomConferenciaState.destino === 'ativa');
    if (btnNova) btnNova.classList.toggle('ativo', cupomConferenciaState.destino === 'nova');
    if (boxNova) boxNova.style.display = cupomConferenciaState.destino === 'nova' ? 'block' : 'none';
  };

  window.atualizarCabecalhoCupom = function() {
    if (!cupomConferenciaState) return;
    cupomConferenciaState.supermercado = document.getElementById('confCupomSupermercado')?.value.trim() || 'Supermercado';
    cupomConferenciaState.dataCompra = document.getElementById('confCupomData')?.value || dataHojeIso();
    cupomConferenciaState.desconto = Math.max(0, parseNumeroSegura(document.getElementById('confCupomDesconto')?.value, 0));
    cupomConferenciaState.valorTotalNota = Math.max(0, parseNumeroSegura(document.getElementById('confCupomTotalNota')?.value, 0));
    cupomConferenciaState.nomeNovaLista = document.getElementById('confCupomNomeNovaLista')?.value.trim() || `Cupom ${cupomConferenciaState.supermercado}`;
    atualizarResumoConferenciaCupom();
  };

  function atualizarResumoConferenciaCupom() {
    if (!cupomConferenciaState) return;
    const itens = cupomConferenciaState.itens;
    const selecionados = itens.filter(i => i.selecionado);
    const somaSelecionados = selecionados.reduce((acc, it) => acc + (Number(it.precoTotal) || 0), 0);

    const contEl = document.getElementById('confContadorSelecionados');
    const somaEl = document.getElementById('confSomaSelecionados');
    const checkTodos = document.getElementById('confCheckTodos');

    if (contEl) contEl.textContent = `${selecionados.length} de ${itens.length} selecionados`;
    if (somaEl) {
      const fmt = typeof formatarMoeda === 'function' ? formatarMoeda(somaSelecionados) : `R$ ${somaSelecionados.toFixed(2)}`;
      somaEl.textContent = fmt;
    }
    if (checkTodos) {
      checkTodos.checked = itens.length > 0 && selecionados.length === itens.length;
      checkTodos.indeterminate = selecionados.length > 0 && selecionados.length < itens.length;
    }
  }

  function renderizarListaConferenciaCupom() {
    const container = document.getElementById('confListaItensContainer');
    if (!container || !cupomConferenciaState) return;

    if (cupomConferenciaState.itens.length === 0) {
      container.innerHTML = `
        <div class="cupom-vazio-aviso">
          Nenhum item na conferência. Use "+ Adicionar item" ou leia outro cupom.
        </div>
      `;
      atualizarResumoConferenciaCupom();
      return;
    }

    container.innerHTML = cupomConferenciaState.itens.map((item, idx) => `
      <div class="cupom-item-card ${item.selecionado ? 'selecionado' : 'desmarcado'}" data-idx="${idx}">
        <div class="cupom-item-linha-topo">
          <label class="cupom-item-check-wrap" title="Marcar / desmarcar produto">
            <input type="checkbox" class="cupom-item-checkbox" ${item.selecionado ? 'checked' : ''} onchange="alternarItemCupom(${idx}, this.checked)" />
          </label>
          <input
            type="text"
            class="cupom-input-nome campo-input-custom"
            value="${escaparHtml(item.nome)}"
            placeholder="Nome do produto"
            oninput="editarCampoItemCupom(${idx}, 'nome', this.value)"
          />
          <button type="button" class="btn-excluir-item" onclick="removerItemConferenciaCupom(${idx})" title="Remover item">🗑️</button>
        </div>

        <div class="cupom-item-linha-valores">
          <div class="cupom-campo-grupo cupom-campo-qtd">
            <label>Qtd</label>
            <input
              type="number"
              step="any"
              min="0.001"
              class="cupom-input-num campo-input-custom"
              value="${item.quantidade}"
              oninput="editarCampoItemCupom(${idx}, 'quantidade', this.value)"
            />
          </div>

          <div class="cupom-campo-grupo">
            <label>Unitário</label>
            <div class="cupom-input-moeda">
              <span class="cupom-moeda-prefixo">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                class="cupom-input-num-flex"
                value="${Number(item.precoUnitario || 0).toFixed(2)}"
                oninput="editarCampoItemCupom(${idx}, 'precoUnitario', this.value)"
              />
            </div>
          </div>

          <div class="cupom-campo-grupo">
            <label>Total</label>
            <div class="cupom-input-moeda">
              <span class="cupom-moeda-prefixo">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                class="cupom-input-num-flex"
                id="confItemTotal_${idx}"
                value="${Number(item.precoTotal || 0).toFixed(2)}"
                oninput="editarCampoItemCupom(${idx}, 'precoTotal', this.value)"
              />
            </div>
          </div>
        </div>

        <div class="cupom-item-linha-cat">
          <button type="button" class="cupom-btn-categoria" onclick="abrirModalCategoriaCupom(${idx})">
            <span>${escaparHtml(item.categoria)}</span>
            <span class="cupom-cat-seta">▾ Alterar</span>
          </button>
        </div>
      </div>
    `).join('');

    atualizarResumoConferenciaCupom();
  }

  window.alternarTodosItensCupom = function(marcar) {
    if (!cupomConferenciaState) return;
    cupomConferenciaState.itens.forEach(it => { it.selecionado = Boolean(marcar); });
    renderizarListaConferenciaCupom();
  };

  window.alternarItemCupom = function(idx, checked) {
    if (!cupomConferenciaState || !cupomConferenciaState.itens[idx]) return;
    cupomConferenciaState.itens[idx].selecionado = Boolean(checked);
    const card = document.querySelector(`.cupom-item-card[data-idx="${idx}"]`);
    if (card) {
      card.classList.toggle('selecionado', Boolean(checked));
      card.classList.toggle('desmarcado', !checked);
    }
    atualizarResumoConferenciaCupom();
  };

  window.editarCampoItemCupom = function(idx, campo, valor) {
    const item = cupomConferenciaState?.itens?.[idx];
    if (!item) return;

    if (campo === 'nome') {
      item.nome = valor;
      return;
    }

    const num = Math.max(0, parseNumeroSegura(valor, 0));
    if (campo === 'quantidade') {
      item.quantidade = num > 0 ? num : 1;
      item.precoTotal = Math.round(item.quantidade * item.precoUnitario * 100) / 100;
      const totalEl = document.getElementById(`confItemTotal_${idx}`);
      if (totalEl) totalEl.value = item.precoTotal.toFixed(2);
    } else if (campo === 'precoUnitario') {
      item.precoUnitario = num;
      item.precoTotal = Math.round(item.quantidade * item.precoUnitario * 100) / 100;
      const totalEl = document.getElementById(`confItemTotal_${idx}`);
      if (totalEl) totalEl.value = item.precoTotal.toFixed(2);
    } else if (campo === 'precoTotal') {
      item.precoTotal = num;
      if (item.quantidade > 0) {
        item.precoUnitario = Math.round((num / item.quantidade) * 100) / 100;
      }
    }
    atualizarResumoConferenciaCupom();
  };

  window.removerItemConferenciaCupom = function(idx) {
    if (!cupomConferenciaState) return;
    cupomConferenciaState.itens.splice(idx, 1);
    renderizarListaConferenciaCupom();
  };

  window.adicionarItemManualConferenciaCupom = function() {
    if (!cupomConferenciaState) return;
    cupomConferenciaState.itens.push({
      selecionado: true,
      nome: '',
      quantidade: 1,
      precoUnitario: 0,
      precoTotal: 0,
      categoria: '🥫 Mercearia'
    });
    renderizarListaConferenciaCupom();
    const container = document.getElementById('confListaItensContainer');
    if (container) container.scrollTop = container.scrollHeight;
  };

  // ============================================================================
  // SELETOR DE CATEGORIAS PESQUISÁVEL E ORGANIZADO
  // ============================================================================
  window.abrirModalCategoriaCupom = function(idx) {
    if (!cupomConferenciaState || !cupomConferenciaState.itens[idx]) return;
    itemEditandoCategoriaIdx = idx;

    const item = cupomConferenciaState.itens[idx];
    const tituloEl = document.getElementById('catCupomItemNome');
    const buscaEl = document.getElementById('inputBuscaCategoriaCupom');
    if (tituloEl) tituloEl.textContent = item.nome || 'Selecionar categoria';
    if (buscaEl) buscaEl.value = '';

    window.filtrarCategoriasCupom('');
    document.getElementById('modalCategoriaCupom')?.classList.add('aberto');
    setTimeout(() => buscaEl?.focus(), 80);
  };

  window.fecharModalCategoriaCupom = function() {
    itemEditandoCategoriaIdx = null;
    document.getElementById('modalCategoriaCupom')?.classList.remove('aberto');
  };

  window.filtrarCategoriasCupom = function(termo) {
    const listaEl = document.getElementById('listaCategoriasCupomOrganizada');
    if (!listaEl) return;

    const q = String(termo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const catAtual = (itemEditandoCategoriaIdx !== null && cupomConferenciaState?.itens?.[itemEditandoCategoriaIdx])
      ? cupomConferenciaState.itens[itemEditandoCategoriaIdx].categoria
      : '';

    const filtradas = CATEGORIAS_CUPOM.filter(c => {
      if (!q) return true;
      const texto = `${c.nome} ${c.grupo} ${c.palavras}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return texto.includes(q);
    });

    if (filtradas.length === 0) {
      listaEl.innerHTML = `<div class="cupom-vazio-aviso">Nenhuma categoria encontrada para "${escaparHtml(termo)}".</div>`;
      return;
    }

    const grupos = {};
    filtradas.forEach(c => {
      if (!grupos[c.grupo]) grupos[c.grupo] = [];
      grupos[c.grupo].push(c);
    });

    listaEl.innerHTML = Object.entries(grupos).map(([grupo, itens]) => `
      <div class="cupom-cat-grupo">
        <div class="cupom-cat-grupo-titulo">${escaparHtml(grupo)}</div>
        <div class="cupom-cat-grade">
          ${itens.map(c => `
            <button
              type="button"
              class="cupom-cat-opcao ${c.id === catAtual ? 'ativa' : ''}"
              onclick="selecionarCategoriaItemCupom('${escaparHtml(c.id)}')"
            >
              <span class="cupom-cat-icone">${c.icone}</span>
              <span class="cupom-cat-nome">${escaparHtml(c.nome)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  };

  window.selecionarCategoriaItemCupom = function(categoriaId) {
    if (itemEditandoCategoriaIdx === null || !cupomConferenciaState?.itens?.[itemEditandoCategoriaIdx]) return;
    cupomConferenciaState.itens[itemEditandoCategoriaIdx].categoria = categoriaId;
    fecharModalCategoriaCupom();
    renderizarListaConferenciaCupom();
  };

  // ============================================================================
  // CONFIRMAÇÃO E LANÇAMENTO NO MEU MERCADO (+ SINCRONIZAÇÃO NUVEM)
  // ============================================================================
  window.confirmarLancamentoCupom = function() {
    if (!cupomConferenciaState || typeof appState === 'undefined') return;
    window.atualizarCabecalhoCupom();

    const selecionados = cupomConferenciaState.itens.filter(i => i.selecionado && String(i.nome || '').trim().length > 0);
    if (selecionados.length === 0) {
      window.mostrarToastMercado?.('Marque ao menos 1 produto válido para lançar na lista.', 'alerta');
      return;
    }

    let targetListaId = appState.listaAtivaId;
    let nomeListaDestino = '';

    if (cupomConferenciaState.destino === 'nova' || !appState.listas.some(l => l.id === targetListaId)) {
      const novoId = 'lst_' + Date.now();
      const nomeNovo = cupomConferenciaState.nomeNovaLista || `Cupom ${cupomConferenciaState.supermercado}`;
      const somaSelecionados = selecionados.reduce((acc, it) => acc + (Number(it.precoTotal) || 0), 0);
      const metaSugerida = Math.max(somaSelecionados, cupomConferenciaState.valorTotalNota || 0, 100);

      appState.listas.unshift({
        id: novoId,
        nome: nomeNovo,
        status: 'ABERTA',
        dataCriacao: new Date().toISOString(),
        orcamentoMeta: Math.round(metaSugerida * 100) / 100
      });
      appState.listaAtivaId = novoId;
      targetListaId = novoId;
      nomeListaDestino = nomeNovo;
    } else {
      const lista = appState.listas.find(l => l.id === targetListaId);
      if (lista && lista.status === 'FECHADA') {
        lista.status = 'ABERTA';
        lista.dataFechamento = null;
      }
      nomeListaDestino = lista?.nome || 'Lista Ativa';
    }

    const baseTs = Date.now();
    selecionados.forEach((item, idx) => {
      const qtd = Number(item.quantidade) > 0 ? Number(item.quantidade) : 1;
      const unit = Number(item.precoUnitario) > 0
        ? Number(item.precoUnitario)
        : (Number(item.precoTotal) > 0 ? Math.round((Number(item.precoTotal) / qtd) * 100) / 100 : 0);

      appState.itens.push({
        id: `item_${baseTs}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        idLista: targetListaId,
        produto: item.nome.trim(),
        categoria: item.categoria || '📦 Outros',
        quantidade: qtd,
        precoUnitario: unit,
        comprado: true
      });
    });

    window.SomMercado?.bipFinalizarCompra?.();
    window.fecharModalConferenciaCupom();

    if (typeof abrirTela === 'function') {
      abrirTela('telaCompras', document.getElementById('navCompras'));
    } else if (typeof renderizarTudo === 'function') {
      renderizarTudo();
    }

    window.mostrarToastMercado?.(
      `✅ ${selecionados.length} produto(s) de "${cupomConferenciaState.supermercado}" lançados em "${nomeListaDestino}"!`,
      'sucesso',
      4500
    );
    cupomConferenciaState = null;
  };

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!window.obterChaveGemini()) {
        buscarChaveGeminiPerfilNuvem();
      } else {
        window.atualizarUIChaveGemini?.();
      }
    }, 300);
  });
})();
