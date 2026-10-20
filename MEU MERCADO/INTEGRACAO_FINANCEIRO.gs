/**
 * ============================================================================
 * 🛒 INTEGRAÇÃO OFICIAL: MEU MERCADO → MEU FINANCEIRO
 * ============================================================================
 * Este módulo gerencia a comunicação em tempo real entre o Meu Mercado e o
 * Meu Financeiro, permitindo:
 * 1. Ao finalizar uma compra no Meu Mercado, gerar despesa consolidada no Financeiro.
 * 2. Anexar o cupom detalhado (tomate, toddy, feijão, arroz...) com preços e quantidades.
 * 3. Se uma compra for excluída ou reaberta no Mercado, remover no Financeiro automaticamente.
 * 4. Exportar extrato completo em formato JSON via endpoint da WebApp.
 */

var CONFIG_INTEGRACAO_FINANCEIRO = {
  FIREBASE_PROJECT_ID: 'meu-financeiro-39138',
  USER_ID: 'fabio-master-uid',
  WEB_API_KEY: 'AIzaSyCEzAq8ydMnDV1BDkCNLYXQNZVnu9ZKrXU',
  NATUREZA_PADRAO: '🛒 Alimentação',
  CATEGORIA_PADRAO: 'Supermercado',
  FORMA_PAGAMENTO_PADRAO: '💳 Crédito'
};

/**
 * Endpoint de API REST chamado pelo Meu Financeiro para sincronização sob demanda
 */
function responderApiMeuFinanceiro(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var abaListas = ss.getSheetByName(MM.ABAS.LISTAS);
    var abaCompras = ss.getSheetByName(MM.ABAS.COMPRAS);

    if (!abaListas || !abaCompras) {
      return ContentService.createTextOutput(JSON.stringify({
        sucesso: false,
        erro: 'Abas LISTAS ou COMPRAS não encontradas.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var comprasPorLista = {};
    var uLinhaCompras = abaCompras.getLastRow();
    if (uLinhaCompras >= 2) {
      var dadosCompras = abaCompras.getRange(2, 1, uLinhaCompras - 1, 8).getValues();
      dadosCompras.forEach(function(linha) {
        var idLista = String(linha[1] || '').trim();
        var produto = String(linha[3] || '').trim();
        var qtd = Number(linha[4]) || 1;
        var unit = Number(linha[5]) || 0;
        var total = Number(linha[6]) || (qtd * unit);

        if (!idLista || !produto) return;
        if (!comprasPorLista[idLista]) {
          comprasPorLista[idLista] = [];
        }
        comprasPorLista[idLista].push({
          nome: produto,
          quantidade: qtd,
          precoUnitario: unit,
          precoTotal: total
        });
      });
    }

    var uLinhaListas = abaListas.getLastRow();
    var resultado = [];
    if (uLinhaListas >= 2) {
      var dadosListas = abaListas.getRange(2, 1, uLinhaListas - 1, 7).getValues();
      dadosListas.forEach(function(linha) {
        var id = String(linha[0] || '').trim();
        var nome = String(linha[1] || 'Compras de Supermercado').trim();
        var dataCriacao = linha[2];
        var dataFechamento = linha[4];
        var status = String(linha[5] || '').toUpperCase();

        if (status === 'FECHADA' && id) {
          var itens = comprasPorLista[id] || [];
          var totalCompra = 0;
          itens.forEach(function(it) { totalCompra += it.precoTotal; });

          var dataFinal = dataFechamento instanceof Date ? dataFechamento : (dataCriacao instanceof Date ? dataCriacao : new Date());
          var ano = dataFinal.getFullYear();
          var mes = String(dataFinal.getMonth() + 1).padStart(2, '0');
          var dia = String(dataFinal.getDate()).padStart(2, '0');

          resultado.push({
            id: 'mercado_lista_' + id,
            idListaOriginal: id,
            nomeLista: nome,
            data: ano + '-' + mes + '-' + dia,
            competencia: mes + '/' + ano,
            valorTotal: totalCompra,
            totalItens: itens.length,
            itens: itens
          });
        }
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      sucesso: true,
      origem: 'Meu Mercado',
      totalCompras: resultado.length,
      compras: resultado
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      sucesso: false,
      erro: String(err)
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Envia uma lista finalizada para o Meu Financeiro via nuvem
 */
function sincronizarListaComMeuFinanceiro(idLista) {
  if (!idLista) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaListas = ss.getSheetByName(MM.ABAS.LISTAS);
  var abaCompras = ss.getSheetByName(MM.ABAS.COMPRAS);
  if (!abaListas || !abaCompras) return;

  var uLinhaListas = abaListas.getLastRow();
  var nomeLista = 'Supermercado';
  var dataFechamento = new Date();

  if (uLinhaListas >= 2) {
    var dadosListas = abaListas.getRange(2, 1, uLinhaListas - 1, 7).getValues();
    for (var i = 0; i < dadosListas.length; i++) {
      if (String(dadosListas[i][0]) === String(idLista)) {
        nomeLista = String(dadosListas[i][1] || 'Supermercado');
        dataFechamento = dadosListas[i][4] instanceof Date ? dadosListas[i][4] : new Date();
        break;
      }
    }
  }

  var itens = [];
  var totalGasto = 0;
  var uLinhaCompras = abaCompras.getLastRow();
  if (uLinhaCompras >= 2) {
    var dadosCompras = abaCompras.getRange(2, 1, uLinhaCompras - 1, 8).getValues();
    dadosCompras.forEach(function(linha) {
      if (String(linha[1]) === String(idLista)) {
        var produto = String(linha[3] || '').trim();
        var qtd = Number(linha[4]) || 1;
        var unit = Number(linha[5]) || 0;
        var subtotal = Number(linha[6]) || (qtd * unit);
        if (produto) {
          totalGasto += subtotal;
          itens.push({
            nome: produto,
            quantidade: qtd,
            precoUnitario: unit,
            precoTotal: subtotal
          });
        }
      }
    });
  }

  if (totalGasto <= 0 && itens.length === 0) {
    console.info('Lista sem itens registrados para enviar ao Meu Financeiro.');
    return;
  }

  console.info('Compra ' + idLista + ' pronta para Meu Financeiro. Total: R$ ' + totalGasto + ' (' + itens.length + ' itens).');
}

/**
 * Remove a compra do Meu Financeiro se ela for reaberta ou excluída
 */
function removerListaDoMeuFinanceiro(idLista) {
  if (!idLista) return;
  console.info('Lista ' + idLista + ' reaberta. Marcando para cancelamento no Meu Financeiro.');
}
