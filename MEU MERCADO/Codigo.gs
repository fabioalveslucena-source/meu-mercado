/**
 * ============================================================
 * 🛒 MEU MERCADO
 * BANCO DE DADOS — INICIALIZAÇÃO
 * ============================================================
 *
 * Este módulo:
 * - cria/configura as abas do banco;
 * - cria categorias e subcategorias;
 * - cria uma base inicial de produtos;
 * - aplica formatação;
 * - prepara a planilha para o Web App.
 *
 * IMPORTANTE:
 * Este código NÃO cria o aplicativo ainda.
 * Ele prepara somente o banco de dados.
 * ============================================================
 */

const MM = {
  ABAS: {
    CATEGORIAS: '🏷️ CATEGORIAS',
    PRODUTOS: '📦 PRODUTOS',
    LISTAS: '📋 LISTAS',
    ITENS: '🛒 ITENS_LISTA',
    COMPRAS: '🧾 COMPRAS',
    USUARIOS: '👨‍👩‍👧 USUARIOS',
    CONFIG: '⚙️ CONFIG'
  },

  CABECALHOS: {
    CATEGORIAS: [
      'ID_CATEGORIA',
      'CATEGORIA',
      'ID_SUBCATEGORIA',
      'SUBCATEGORIA',
      'ATIVO'
    ],

    PRODUTOS: [
      'ID_PRODUTO',
      'PRODUTO',
      'ID_CATEGORIA',
      'CATEGORIA',
      'ID_SUBCATEGORIA',
      'SUBCATEGORIA',
      'UNIDADE',
      'ATIVO'
    ],

    LISTAS: [
      'ID_LISTA',
      'NOME_LISTA',
      'TIPO',
      'DATA_CRIACAO',
      'DATA_FECHAMENTO',
      'STATUS',
      'USUARIO'
    ],

    ITENS: [
      'ID_ITEM',
      'ID_LISTA',
      'ID_PRODUTO',
      'PRODUTO',
      'QUANTIDADE',
      'UNIDADE',
      'PRECO_ESTIMADO',
      'COMPRADO',
      'DATA_COMPRA',
      'USUARIO'
    ],

    COMPRAS: [
      'ID_COMPRA',
      'ID_LISTA',
      'DATA',
      'PRODUTO',
      'QUANTIDADE',
      'PRECO_UNITARIO',
      'TOTAL',
      'USUARIO'
    ],

    USUARIOS: [
      'ID_USUARIO',
      'NOME',
      'EMAIL',
      'PERFIL',
      'ATIVO'
    ],

    CONFIG: [
      'PARAMETRO',
      'VALOR'
    ]
  }
};


/**
 * ============================================================
 * FUNÇÃO PRINCIPAL
 * ============================================================
 */
function inicializarMeuMercado() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  configurarAba(
    ss,
    MM.ABAS.CATEGORIAS,
    MM.CABECALHOS.CATEGORIAS
  );

  configurarAba(
    ss,
    MM.ABAS.PRODUTOS,
    MM.CABECALHOS.PRODUTOS
  );

  configurarAba(
    ss,
    MM.ABAS.LISTAS,
    MM.CABECALHOS.LISTAS
  );

  configurarAba(
    ss,
    MM.ABAS.ITENS,
    MM.CABECALHOS.ITENS
  );

  configurarAba(
    ss,
    MM.ABAS.COMPRAS,
    MM.CABECALHOS.COMPRAS
  );

  configurarAba(
    ss,
    MM.ABAS.USUARIOS,
    MM.CABECALHOS.USUARIOS
  );

  configurarAba(
    ss,
    MM.ABAS.CONFIG,
    MM.CABECALHOS.CONFIG
  );

  carregarCategorias();
  carregarProdutos();
  configurarSistema();

  SpreadsheetApp.flush();

  SpreadsheetApp.getUi().alert(
    '🛒 Meu Mercado',
    'Banco de dados inicializado com sucesso!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}


/**
 * ============================================================
 * CONFIGURAÇÃO DAS ABAS
 * ============================================================
 */
function configurarAba(ss, nome, cabecalhos) {

  let aba = ss.getSheetByName(nome);

  if (!aba) {
    aba = ss.insertSheet(nome);
  }

  const quantidadeColunas = cabecalhos.length;

  if (aba.getMaxColumns() < quantidadeColunas) {
    aba.insertColumnsAfter(
      aba.getMaxColumns(),
      quantidadeColunas - aba.getMaxColumns()
    );
  }

  aba.getRange(
    1,
    1,
    1,
    quantidadeColunas
  ).setValues([cabecalhos]);

  formatarCabecalho(aba, quantidadeColunas);

  aba.setFrozenRows(1);

  for (let i = 1; i <= quantidadeColunas; i++) {
    aba.autoResizeColumn(i);
  }
}

/**
 * =========================================================
 * 🛒 EXPANSÃO DO CATÁLOGO — MEU MERCADO
 * =========================================================
 *
 * Acrescenta produtos comuns de supermercado sem duplicar
 * os produtos já existentes.
 *
 * Pode ser executada novamente com segurança.
 * =========================================================
 */
function expandirCatalogoMeuMercado() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaCategorias =
    ss.getSheetByName(
      MM.ABAS.CATEGORIAS
    );

  const abaProdutos =
    ss.getSheetByName(
      MM.ABAS.PRODUTOS
    );

  if (!abaCategorias || !abaProdutos) {
    throw new Error(
      'As abas de categorias ou produtos não foram encontradas.'
    );
  }

  /*
   * =======================================================
   * CATEGORIAS E SUBCATEGORIAS
   * =======================================================
   */

  const estrutura = {

    'Alimentos': [
      'Arroz e Grãos',
      'Feijão e Leguminosas',
      'Massas',
      'Farinhas e Cereais',
      'Açúcar e Adoçantes',
      'Óleos e Gorduras',
      'Temperos e Condimentos',
      'Enlatados e Conservas',
      'Caldos e Sopas',
      'Molhos',
      'Café e Chá',
      'Biscoitos e Snacks',
      'Doces e Sobremesas'
    ],

    'Padaria': [
      'Pães',
      'Bolos e Tortas',
      'Torradas e Cereais'
    ],

    'Laticínios e Frios': [
      'Leites',
      'Iogurtes',
      'Queijos',
      'Manteigas e Margarinas',
      'Frios'
    ],

    'Carnes': [
      'Carne Bovina',
      'Carne Suína',
      'Frango',
      'Peixes e Frutos do Mar',
      'Embutidos'
    ],

    'Hortifruti': [
      'Frutas',
      'Verduras',
      'Legumes',
      'Tubérculos'
    ],

    'Bebidas': [
      'Água',
      'Refrigerantes',
      'Sucos',
      'Cafés e Bebidas Quentes',
      'Bebidas Esportivas'
    ],

    'Congelados': [
      'Pratos Congelados',
      'Batatas e Acompanhamentos',
      'Pizzas',
      'Sorvetes'
    ],

    'Limpeza': [
      'Lavanderia',
      'Limpeza Geral',
      'Louças',
      'Desinfecção',
      'Acessórios de Limpeza',
      'Sacos e Descartáveis'
    ],

    'Higiene Pessoal': [
      'Banho',
      'Cabelos',
      'Higiene Bucal',
      'Desodorantes',
      'Higiene Feminina',
      'Cuidados com a Pele'
    ],

    'Papel e Descartáveis': [
      'Papel Higiênico',
      'Papel Toalha',
      'Guardanapos',
      'Papel para Cozinha'
    ],

    'Casa e Cozinha': [
      'Utensílios',
      'Armazenamento',
      'Descartáveis',
      'Filtros e Acessórios'
    ],

    'Bebê': [
      'Fraldas',
      'Higiene do Bebê',
      'Alimentação do Bebê'
    ],

    'Pet': [
      'Cães',
      'Gatos',
      'Higiene Pet',
      'Acessórios Pet'
    ]
  };


  /*
   * =======================================================
   * PRODUTOS
   * =======================================================
   */

  const produtos = [

    // ALIMENTOS — ARROZ E GRÃOS

    ['Arroz branco 5kg','Alimentos','Arroz e Grãos','Pacote'],
    ['Arroz branco 1kg','Alimentos','Arroz e Grãos','Pacote'],
    ['Arroz integral 1kg','Alimentos','Arroz e Grãos','Pacote'],
    ['Arroz parboilizado 1kg','Alimentos','Arroz e Grãos','Pacote'],
    ['Arroz parboilizado 5kg','Alimentos','Arroz e Grãos','Pacote'],
    ['Arroz arbóreo 1kg','Alimentos','Arroz e Grãos','Pacote'],
    ['Aveia em flocos 500g','Alimentos','Farinhas e Cereais','Pacote'],
    ['Granola 500g','Alimentos','Farinhas e Cereais','Pacote'],

    // FEIJÃO

    ['Feijão carioca 1kg','Alimentos','Feijão e Leguminosas','Pacote'],
    ['Feijão preto 1kg','Alimentos','Feijão e Leguminosas','Pacote'],
    ['Feijão branco 500g','Alimentos','Feijão e Leguminosas','Pacote'],
    ['Lentilha 500g','Alimentos','Feijão e Leguminosas','Pacote'],
    ['Grão-de-bico 500g','Alimentos','Feijão e Leguminosas','Pacote'],

    // MASSAS

    ['Macarrão espaguete 500g','Alimentos','Massas','Pacote'],
    ['Macarrão parafuso 500g','Alimentos','Massas','Pacote'],
    ['Macarrão penne 500g','Alimentos','Massas','Pacote'],
    ['Macarrão talharim 500g','Alimentos','Massas','Pacote'],
    ['Lasanha massa 500g','Alimentos','Massas','Pacote'],

    // FARINHAS

    ['Farinha de trigo 1kg','Alimentos','Farinhas e Cereais','Pacote'],
    ['Farinha de mandioca 1kg','Alimentos','Farinhas e Cereais','Pacote'],
    ['Fubá 500g','Alimentos','Farinhas e Cereais','Pacote'],
    ['Farofa pronta 250g','Alimentos','Farinhas e Cereais','Pacote'],
    ['Amido de milho 500g','Alimentos','Farinhas e Cereais','Pacote'],

    // AÇÚCAR

    ['Açúcar refinado 1kg','Alimentos','Açúcar e Adoçantes','Pacote'],
    ['Açúcar cristal 2kg','Alimentos','Açúcar e Adoçantes','Pacote'],
    ['Adoçante líquido 100ml','Alimentos','Açúcar e Adoçantes','Frasco'],

    // ÓLEOS

    ['Óleo de soja 900ml','Alimentos','Óleos e Gorduras','Garrafa'],
    ['Óleo de milho 900ml','Alimentos','Óleos e Gorduras','Garrafa'],
    ['Azeite de oliva 500ml','Alimentos','Óleos e Gorduras','Garrafa'],
    ['Azeite de oliva extra virgem 500ml','Alimentos','Óleos e Gorduras','Garrafa'],

    // TEMPEROS

    ['Sal refinado 1kg','Alimentos','Temperos e Condimentos','Pacote'],
    ['Sal grosso 1kg','Alimentos','Temperos e Condimentos','Pacote'],
    ['Pimenta-do-reino 50g','Alimentos','Temperos e Condimentos','Frasco'],
    ['Orégano 20g','Alimentos','Temperos e Condimentos','Pacote'],
    ['Colorau 100g','Alimentos','Temperos e Condimentos','Pacote'],
    ['Cominho 50g','Alimentos','Temperos e Condimentos','Pacote'],
    ['Canela em pó 30g','Alimentos','Temperos e Condimentos','Pacote'],

    // MOLHOS

    ['Molho de tomate 300g','Alimentos','Molhos','Sachê'],
    ['Extrato de tomate 340g','Alimentos','Molhos','Lata'],
    ['Ketchup 400g','Alimentos','Molhos','Frasco'],
    ['Mostarda 200g','Alimentos','Molhos','Frasco'],
    ['Maionese 500g','Alimentos','Molhos','Pote'],
    ['Molho shoyu 150ml','Alimentos','Molhos','Frasco'],

    // ENLATADOS

    ['Milho verde 170g','Alimentos','Enlatados e Conservas','Lata'],
    ['Ervilha 170g','Alimentos','Enlatados e Conservas','Lata'],
    ['Atum sólido 170g','Alimentos','Enlatados e Conservas','Lata'],
    ['Sardinha 125g','Alimentos','Enlatados e Conservas','Lata'],
    ['Azeitona 200g','Alimentos','Enlatados e Conservas','Pote'],
    ['Palmito 300g','Alimentos','Enlatados e Conservas','Pote'],

    // CAFÉ E CHÁ

    ['Café torrado e moído 500g','Alimentos','Café e Chá','Pacote'],
    ['Café torrado e moído 250g','Alimentos','Café e Chá','Pacote'],
    ['Café solúvel 100g','Alimentos','Café e Chá','Frasco'],
    ['Chá de camomila','Alimentos','Café e Chá','Caixa'],
    ['Chá de erva-doce','Alimentos','Café e Chá','Caixa'],
    ['Chá preto','Alimentos','Café e Chá','Caixa'],

    // BISCOITOS

    ['Biscoito água e sal','Alimentos','Biscoitos e Snacks','Pacote'],
    ['Biscoito cream cracker','Alimentos','Biscoitos e Snacks','Pacote'],
    ['Biscoito recheado chocolate','Alimentos','Biscoitos e Snacks','Pacote'],
    ['Biscoito recheado morango','Alimentos','Biscoitos e Snacks','Pacote'],
    ['Biscoito maisena','Alimentos','Biscoitos e Snacks','Pacote'],
    ['Biscoito de polvilho','Alimentos','Biscoitos e Snacks','Pacote'],

    // OVOS — FINALMENTE 😄

    ['Ovos brancos 12 unidades','Laticínios e Frios','Leites','Bandeja'],
    ['Ovos brancos 20 unidades','Laticínios e Frios','Leites','Bandeja'],
    ['Ovos brancos 30 unidades','Laticínios e Frios','Leites','Bandeja'],
    ['Ovos vermelhos 12 unidades','Laticínios e Frios','Leites','Bandeja'],

    // PADARIA

    ['Pão francês','Padaria','Pães','Kg'],
    ['Pão de forma tradicional','Padaria','Pães','Pacote'],
    ['Pão de forma integral','Padaria','Pães','Pacote'],
    ['Pão de hambúrguer','Padaria','Pães','Pacote'],
    ['Pão de hot dog','Padaria','Pães','Pacote'],
    ['Pão de queijo','Padaria','Pães','Pacote'],
    ['Torrada tradicional','Padaria','Torradas e Cereais','Pacote'],
    ['Bolo de chocolate','Padaria','Bolos e Tortas','Unidade'],
    ['Bolo de cenoura','Padaria','Bolos e Tortas','Unidade'],

    // LATICÍNIOS

    ['Leite integral 1L','Laticínios e Frios','Leites','Caixa'],
    ['Leite desnatado 1L','Laticínios e Frios','Leites','Caixa'],
    ['Leite semidesnatado 1L','Laticínios e Frios','Leites','Caixa'],
    ['Leite sem lactose 1L','Laticínios e Frios','Leites','Caixa'],
    ['Leite em pó 400g','Laticínios e Frios','Leites','Lata'],
    ['Iogurte natural','Laticínios e Frios','Iogurtes','Pote'],
    ['Iogurte integral','Laticínios e Frios','Iogurtes','Pote'],
    ['Iogurte de morango','Laticínios e Frios','Iogurtes','Pote'],
    ['Queijo muçarela','Laticínios e Frios','Queijos','Kg'],
    ['Queijo prato','Laticínios e Frios','Queijos','Kg'],
    ['Queijo parmesão','Laticínios e Frios','Queijos','Kg'],
    ['Requeijão 200g','Laticínios e Frios','Queijos','Pote'],
    ['Manteiga 200g','Laticínios e Frios','Manteigas e Margarinas','Pote'],
    ['Margarina 500g','Laticínios e Frios','Manteigas e Margarinas','Pote'],
    ['Presunto','Laticínios e Frios','Frios','Kg'],
    ['Mortadela','Laticínios e Frios','Frios','Kg'],
    ['Peito de peru','Laticínios e Frios','Frios','Kg'],

    // CARNES

    ['Carne moída','Carnes','Carne Bovina','Kg'],
    ['Patinho','Carnes','Carne Bovina','Kg'],
    ['Alcatra','Carnes','Carne Bovina','Kg'],
    ['Contrafilé','Carnes','Carne Bovina','Kg'],
    ['Picanha','Carnes','Carne Bovina','Kg'],
    ['Acém','Carnes','Carne Bovina','Kg'],
    ['Costela bovina','Carnes','Carne Bovina','Kg'],
    ['Lombo suíno','Carnes','Carne Suína','Kg'],
    ['Costelinha suína','Carnes','Carne Suína','Kg'],
    ['Pernil suíno','Carnes','Carne Suína','Kg'],
    ['Peito de frango','Carnes','Frango','Kg'],
    ['Coxa de frango','Carnes','Frango','Kg'],
    ['Sobrecoxa de frango','Carnes','Frango','Kg'],
    ['Asa de frango','Carnes','Frango','Kg'],
    ['Filé de frango','Carnes','Frango','Kg'],
    ['Salmão','Carnes','Peixes e Frutos do Mar','Kg'],
    ['Tilápia','Carnes','Peixes e Frutos do Mar','Kg'],
    ['Merluza','Carnes','Peixes e Frutos do Mar','Kg'],
    ['Camarão','Carnes','Peixes e Frutos do Mar','Kg'],
    ['Linguiça toscana','Carnes','Embutidos','Kg'],
    ['Linguiça calabresa','Carnes','Embutidos','Kg'],
    ['Salsicha','Carnes','Embutidos','Pacote'],
    ['Bacon','Carnes','Embutidos','Kg'],

    // HORTIFRUTI — FRUTAS

    ['Banana prata','Hortifruti','Frutas','Kg'],
    ['Banana nanica','Hortifruti','Frutas','Kg'],
    ['Maçã','Hortifruti','Frutas','Kg'],
    ['Laranja','Hortifruti','Frutas','Kg'],
    ['Limão','Hortifruti','Frutas','Kg'],
    ['Tangerina','Hortifruti','Frutas','Kg'],
    ['Uva','Hortifruti','Frutas','Bandeja'],
    ['Mamão','Hortifruti','Frutas','Kg'],
    ['Melancia','Hortifruti','Frutas','Kg'],
    ['Abacaxi','Hortifruti','Frutas','Unidade'],
    ['Manga','Hortifruti','Frutas','Kg'],
    ['Morango','Hortifruti','Frutas','Bandeja'],
    ['Abacate','Hortifruti','Frutas','Kg'],
    ['Pera','Hortifruti','Frutas','Kg'],

    // VERDURAS

    ['Alface','Hortifruti','Verduras','Unidade'],
    ['Couve','Hortifruti','Verduras','Maço'],
    ['Espinafre','Hortifruti','Verduras','Maço'],
    ['Rúcula','Hortifruti','Verduras','Maço'],
    ['Agrião','Hortifruti','Verduras','Maço'],

    // LEGUMES

    ['Tomate','Hortifruti','Legumes','Kg'],
    ['Cebola','Hortifruti','Legumes','Kg'],
    ['Alho','Hortifruti','Legumes','Kg'],
    ['Cenoura','Hortifruti','Legumes','Kg'],
    ['Pepino','Hortifruti','Legumes','Kg'],
    ['Abobrinha','Hortifruti','Legumes','Kg'],
    ['Berinjela','Hortifruti','Legumes','Kg'],
    ['Pimentão','Hortifruti','Legumes','Kg'],
    ['Brócolis','Hortifruti','Legumes','Unidade'],
    ['Couve-flor','Hortifruti','Legumes','Unidade'],
    ['Milho verde espiga','Hortifruti','Legumes','Unidade'],

    // TUBÉRCULOS

    ['Batata inglesa','Hortifruti','Tubérculos','Kg'],
    ['Batata doce','Hortifruti','Tubérculos','Kg'],
    ['Mandioca','Hortifruti','Tubérculos','Kg'],
    ['Inhame','Hortifruti','Tubérculos','Kg'],

    // BEBIDAS

    ['Água mineral 500ml','Bebidas','Água','Garrafa'],
    ['Água mineral 1,5L','Bebidas','Água','Garrafa'],
    ['Água mineral 5L','Bebidas','Água','Garrafa'],
    ['Água com gás 500ml','Bebidas','Água','Garrafa'],
    ['Refrigerante cola 2L','Bebidas','Refrigerantes','Garrafa'],
    ['Refrigerante guaraná 2L','Bebidas','Refrigerantes','Garrafa'],
    ['Refrigerante laranja 2L','Bebidas','Refrigerantes','Garrafa'],
    ['Suco de laranja 1L','Bebidas','Sucos','Caixa'],
    ['Suco de uva 1L','Bebidas','Sucos','Caixa'],
    ['Suco de maracujá 1L','Bebidas','Sucos','Caixa'],
    ['Néctar de pêssego 1L','Bebidas','Sucos','Caixa'],
    ['Bebida isotônica 500ml','Bebidas','Bebidas Esportivas','Garrafa'],

    // LIMPEZA

    ['Detergente líquido 500ml','Limpeza','Louças','Frasco'],
    ['Detergente neutro 500ml','Limpeza','Louças','Frasco'],
    ['Sabão em pó 1kg','Limpeza','Lavanderia','Pacote'],
    ['Sabão líquido 3L','Limpeza','Lavanderia','Frasco'],
    ['Amaciante 2L','Limpeza','Lavanderia','Frasco'],
    ['Alvejante 2L','Limpeza','Lavanderia','Frasco'],
    ['Desinfetante 2L','Limpeza','Desinfecção','Frasco'],
    ['Água sanitária 2L','Limpeza','Desinfecção','Frasco'],
    ['Limpador multiuso 500ml','Limpeza','Limpeza Geral','Frasco'],
    ['Limpa-vidros 500ml','Limpeza','Limpeza Geral','Frasco'],
    ['Desengordurante 500ml','Limpeza','Limpeza Geral','Frasco'],
    ['Esponja de cozinha','Limpeza','Acessórios de Limpeza','Unidade'],
    ['Esponja de aço','Limpeza','Acessórios de Limpeza','Pacote'],
    ['Pano de chão','Limpeza','Acessórios de Limpeza','Unidade'],
    ['Flanela','Limpeza','Acessórios de Limpeza','Unidade'],
    ['Vassoura','Limpeza','Acessórios de Limpeza','Unidade'],
    ['Rodo','Limpeza','Acessórios de Limpeza','Unidade'],
    ['Saco de lixo 30L','Limpeza','Sacos e Descartáveis','Rolo'],
    ['Saco de lixo 50L','Limpeza','Sacos e Descartáveis','Rolo'],
    ['Saco de lixo 100L','Limpeza','Sacos e Descartáveis','Rolo'],

    // HIGIENE

    ['Sabonete','Higiene Pessoal','Banho','Unidade'],
    ['Shampoo','Higiene Pessoal','Cabelos','Frasco'],
    ['Condicionador','Higiene Pessoal','Cabelos','Frasco'],
    ['Creme dental','Higiene Pessoal','Higiene Bucal','Tubo'],
    ['Escova de dentes','Higiene Pessoal','Higiene Bucal','Unidade'],
    ['Fio dental','Higiene Pessoal','Higiene Bucal','Unidade'],
    ['Enxaguante bucal','Higiene Pessoal','Higiene Bucal','Frasco'],
    ['Desodorante aerosol','Higiene Pessoal','Desodorantes','Frasco'],
    ['Desodorante roll-on','Higiene Pessoal','Desodorantes','Frasco'],
    ['Absorvente','Higiene Pessoal','Higiene Feminina','Pacote'],
    ['Creme hidratante','Higiene Pessoal','Cuidados com a Pele','Frasco'],
    ['Protetor solar','Higiene Pessoal','Cuidados com a Pele','Frasco'],

    // PAPEL

    ['Papel higiênico 4 rolos','Papel e Descartáveis','Papel Higiênico','Pacote'],
    ['Papel higiênico 12 rolos','Papel e Descartáveis','Papel Higiênico','Pacote'],
    ['Papel higiênico 16 rolos','Papel e Descartáveis','Papel Higiênico','Pacote'],
    ['Papel toalha','Papel e Descartáveis','Papel Toalha','Pacote'],
    ['Guardanapo de papel','Papel e Descartáveis','Guardanapos','Pacote'],
    ['Papel alumínio','Papel e Descartáveis','Papel para Cozinha','Rolo'],
    ['Filme plástico','Papel e Descartáveis','Papel para Cozinha','Rolo'],

    // CASA

    ['Papel manteiga','Casa e Cozinha','Utensílios','Rolo'],
    ['Palitos de dente','Casa e Cozinha','Utensílios','Caixa'],
    ['Filtro de café 102','Casa e Cozinha','Filtros e Acessórios','Caixa'],
    ['Filtro de café 103','Casa e Cozinha','Filtros e Acessórios','Caixa'],
    ['Potes plásticos','Casa e Cozinha','Armazenamento','Kit'],
    ['Saco plástico para alimentos','Casa e Cozinha','Armazenamento','Pacote'],
    ['Copos descartáveis 200ml','Casa e Cozinha','Descartáveis','Pacote'],
    ['Pratos descartáveis','Casa e Cozinha','Descartáveis','Pacote'],
    ['Talheres descartáveis','Casa e Cozinha','Descartáveis','Pacote'],

    // BEBÊ

    ['Fralda infantil','Bebê','Fraldas','Pacote'],
    ['Lenço umedecido','Bebê','Higiene do Bebê','Pacote'],
    ['Sabonete infantil','Bebê','Higiene do Bebê','Unidade'],
    ['Shampoo infantil','Bebê','Higiene do Bebê','Frasco'],
    ['Mamadeira','Bebê','Alimentação do Bebê','Unidade'],
    ['Papinha infantil','Bebê','Alimentação do Bebê','Unidade'],

    // PET

    ['Ração para cachorro','Pet','Cães','Pacote'],
    ['Ração para gato','Pet','Gatos','Pacote'],
    ['Petisco para cachorro','Pet','Cães','Pacote'],
    ['Petisco para gato','Pet','Gatos','Pacote'],
    ['Areia para gatos','Pet','Gatos','Pacote'],
    ['Shampoo para cães','Pet','Higiene Pet','Frasco'],
    ['Tapete higiênico','Pet','Higiene Pet','Pacote'],
    ['Brinquedo para pet','Pet','Acessórios Pet','Unidade']
  ];


  /*
   * =======================================================
   * 1 — GARANTE CATEGORIAS E SUBCATEGORIAS
   * =======================================================
   */

  const ultimaLinhaCategoria =
    abaCategorias.getLastRow();

  const dadosCategorias =
    ultimaLinhaCategoria >= 2
      ? abaCategorias
          .getRange(
            2,
            1,
            ultimaLinhaCategoria - 1,
            5
          )
          .getValues()
      : [];

  const mapaCategorias = {};
  const mapaSubcategorias = {};

  dadosCategorias.forEach(function(linha) {

    const idCategoria =
      String(linha[0] || '');

    const categoria =
      String(linha[1] || '').trim();

    const idSubcategoria =
      String(linha[2] || '');

    const subcategoria =
      String(linha[3] || '').trim();

    if (categoria) {

      mapaCategorias[
        categoria.toLowerCase()
      ] = {
        id: idCategoria,
        nome: categoria
      };
    }

    if (
      categoria &&
      subcategoria
    ) {

      mapaSubcategorias[
        (
          categoria +
          '|' +
          subcategoria
        ).toLowerCase()
      ] = {
        id: idSubcategoria,
        nome: subcategoria
      };
    }
  });


  Object.keys(estrutura).forEach(
    function(nomeCategoria) {

      let categoria =
        mapaCategorias[
          nomeCategoria.toLowerCase()
        ];

      if (!categoria) {

        const idCategoria =
          'CAT-' +
          Utilities.getUuid();

        abaCategorias.appendRow([
          idCategoria,
          nomeCategoria,
          '',
          '',
          true
        ]);

        categoria = {
          id: idCategoria,
          nome: nomeCategoria
        };

        mapaCategorias[
          nomeCategoria.toLowerCase()
        ] = categoria;
      }

      estrutura[nomeCategoria].forEach(
        function(nomeSubcategoria) {

          const chave =
            (
              nomeCategoria +
              '|' +
              nomeSubcategoria
            ).toLowerCase();

          if (
            mapaSubcategorias[chave]
          ) {
            return;
          }

          const idSubcategoria =
            'SUB-' +
            Utilities.getUuid();

          abaCategorias.appendRow([
            categoria.id,
            nomeCategoria,
            idSubcategoria,
            nomeSubcategoria,
            true
          ]);

          mapaSubcategorias[chave] = {
            id: idSubcategoria,
            nome: nomeSubcategoria
          };
        }
      );
    }
  );


  /*
   * =======================================================
   * 2 — LÊ PRODUTOS EXISTENTES
   * =======================================================
   */

  const ultimaLinhaProduto =
    abaProdutos.getLastRow();

  const dadosProdutos =
    ultimaLinhaProduto >= 2
      ? abaProdutos
          .getRange(
            2,
            1,
            ultimaLinhaProduto - 1,
            8
          )
          .getValues()
      : [];

  const produtosExistentes = {};

  dadosProdutos.forEach(
    function(linha) {

      const nome =
        String(linha[1] || '')
          .trim()
          .toLowerCase();

      if (nome) {
        produtosExistentes[nome] = true;
      }
    }
  );


  /*
   * =======================================================
   * 3 — ADICIONA SOMENTE OS NOVOS
   * =======================================================
   */

  const novasLinhas = [];

  produtos.forEach(
    function(produto) {

      const nome =
        String(produto[0]).trim();

      const categoriaNome =
        String(produto[1]).trim();

      const subcategoriaNome =
        String(produto[2]).trim();

      const unidade =
        String(produto[3]).trim();

      const chaveProduto =
        nome.toLowerCase();

      if (
        produtosExistentes[
          chaveProduto
        ]
      ) {
        return;
      }

      const categoria =
        mapaCategorias[
          categoriaNome.toLowerCase()
        ];

      const subcategoria =
        mapaSubcategorias[
          (
            categoriaNome +
            '|' +
            subcategoriaNome
          ).toLowerCase()
        ];

      if (
        !categoria ||
        !subcategoria
      ) {
        return;
      }

      novasLinhas.push([
        'PROD-' +
          Utilities.getUuid(),

        nome,

        categoria.id,

        categoria.nome,

        subcategoria.id,

        subcategoria.nome,

        unidade,

        true
      ]);

      produtosExistentes[
        chaveProduto
      ] = true;
    }
  );


  if (novasLinhas.length) {

    abaProdutos
      .getRange(
        abaProdutos.getLastRow() + 1,
        1,
        novasLinhas.length,
        8
      )
      .setValues(
        novasLinhas
      );
  }

  SpreadsheetApp.flush();


  /*
   * =======================================================
   * RESULTADO
   * =======================================================
   */

  return {
    produtosAdicionados:
      novasLinhas.length,

    produtosExistentes:
      dadosProdutos.length,

    categorias:
      Object.keys(
        mapaCategorias
      ).length,

    subcategorias:
      Object.keys(
        mapaSubcategorias
      ).length
  };
}
/**
 * ============================================================
 * FORMATAÇÃO DOS CABEÇALHOS
 * ============================================================
 */
function formatarCabecalho(aba, quantidadeColunas) {

  aba.getRange(
    1,
    1,
    1,
    quantidadeColunas
  )
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#173F5F')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  aba.setRowHeight(1, 32);
}


/**
 * ============================================================
 * CATEGORIAS E SUBCATEGORIAS
 * ============================================================
 */
function carregarCategorias() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const aba = ss.getSheetByName(MM.ABAS.CATEGORIAS);

  const categorias = [

    ['CAT001', 'Alimentação', 'SUB001', 'Mercearia', true],
    ['CAT001', 'Alimentação', 'SUB002', 'Laticínios', true],
    ['CAT001', 'Alimentação', 'SUB003', 'Carnes', true],
    ['CAT001', 'Alimentação', 'SUB004', 'Frutas', true],
    ['CAT001', 'Alimentação', 'SUB005', 'Verduras e Legumes', true],
    ['CAT001', 'Alimentação', 'SUB006', 'Pães e Padaria', true],
    ['CAT001', 'Alimentação', 'SUB007', 'Frios e Embutidos', true],
    ['CAT001', 'Alimentação', 'SUB008', 'Congelados', true],
    ['CAT001', 'Alimentação', 'SUB009', 'Enlatados e Conservas', true],
    ['CAT001', 'Alimentação', 'SUB010', 'Doces e Sobremesas', true],

    ['CAT002', 'Bebidas', 'SUB011', 'Água', true],
    ['CAT002', 'Bebidas', 'SUB012', 'Refrigerantes', true],
    ['CAT002', 'Bebidas', 'SUB013', 'Sucos', true],
    ['CAT002', 'Bebidas', 'SUB014', 'Cafés', true],
    ['CAT002', 'Bebidas', 'SUB015', 'Chás', true],

    ['CAT003', 'Limpeza', 'SUB016', 'Cozinha', true],
    ['CAT003', 'Limpeza', 'SUB017', 'Lavanderia', true],
    ['CAT003', 'Limpeza', 'SUB018', 'Banheiro', true],
    ['CAT003', 'Limpeza', 'SUB019', 'Limpeza Geral', true],
    ['CAT003', 'Limpeza', 'SUB020', 'Descarte e Sacos', true],

    ['CAT004', 'Higiene Pessoal', 'SUB021', 'Banho', true],
    ['CAT004', 'Higiene Pessoal', 'SUB022', 'Cabelos', true],
    ['CAT004', 'Higiene Pessoal', 'SUB023', 'Higiene Bucal', true],
    ['CAT004', 'Higiene Pessoal', 'SUB024', 'Desodorantes', true],
    ['CAT004', 'Higiene Pessoal', 'SUB025', 'Papel Higiênico', true],

    ['CAT005', 'Casa e Cozinha', 'SUB026', 'Utensílios', true],
    ['CAT005', 'Casa e Cozinha', 'SUB027', 'Descartáveis', true],
    ['CAT005', 'Casa e Cozinha', 'SUB028', 'Papel e Filme', true],
    ['CAT005', 'Casa e Cozinha', 'SUB029', 'Organização', true],

    ['CAT006', 'Bebês', 'SUB030', 'Fraldas', true],
    ['CAT006', 'Bebês', 'SUB031', 'Higiene Infantil', true],
    ['CAT006', 'Bebês', 'SUB032', 'Alimentação Infantil', true],

    ['CAT007', 'Pets', 'SUB033', 'Cães', true],
    ['CAT007', 'Pets', 'SUB034', 'Gatos', true],
    ['CAT007', 'Pets', 'SUB035', 'Higiene Pet', true],

    ['CAT008', 'Farmácia', 'SUB036', 'Medicamentos', true],
    ['CAT008', 'Farmácia', 'SUB037', 'Primeiros Socorros', true],
    ['CAT008', 'Farmácia', 'SUB038', 'Cuidados Pessoais', true],

    ['CAT009', 'Churrasco', 'SUB039', 'Carnes', true],
    ['CAT009', 'Churrasco', 'SUB040', 'Carvão e Acendedores', true],
    ['CAT009', 'Churrasco', 'SUB041', 'Molhos e Temperos', true],

    ['CAT010', 'Festas', 'SUB042', 'Doces', true],
    ['CAT010', 'Festas', 'SUB043', 'Descartáveis', true],
    ['CAT010', 'Festas', 'SUB044', 'Bebidas', true],

    ['CAT011', 'Utilidades', 'SUB045', 'Pilhas e Baterias', true],
    ['CAT011', 'Utilidades', 'SUB046', 'Ferramentas', true],
    ['CAT011', 'Utilidades', 'SUB047', 'Diversos', true]
  ];

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha > 1) {
    aba.getRange(
      2,
      1,
      ultimaLinha - 1,
      5
    ).clearContent();
  }

  aba.getRange(
    2,
    1,
    categorias.length,
    5
  ).setValues(categorias);

  aba.getRange(
    2,
    5,
    categorias.length,
    1
  ).insertCheckboxes();

  aba.autoResizeColumns(1, 5);
}


/**
 * ============================================================
 * PRODUTOS — BASE INICIAL
 * ============================================================
 */
function carregarProdutos() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const aba = ss.getSheetByName(MM.ABAS.PRODUTOS);

  const produtos = [

    // MERCEARIA
    ['PROD001','Arroz branco 5 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD002','Arroz integral 1 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD003','Feijão carioca 1 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD004','Feijão preto 1 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD005','Macarrão espaguete 500 g','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD006','Farinha de trigo 1 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD007','Farinha de mandioca 1 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD008','Açúcar 1 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD009','Sal 1 kg','CAT001','Alimentação','SUB001','Mercearia','pct',true],
    ['PROD010','Óleo de soja 900 ml','CAT001','Alimentação','SUB001','Mercearia','un',true],
    ['PROD011','Azeite 500 ml','CAT001','Alimentação','SUB001','Mercearia','un',true],
    ['PROD012','Vinagre 750 ml','CAT001','Alimentação','SUB001','Mercearia','un',true],
    ['PROD013','Molho de tomate','CAT001','Alimentação','SUB001','Mercearia','un',true],
    ['PROD014','Maionese','CAT001','Alimentação','SUB001','Mercearia','un',true],
    ['PROD015','Ketchup','CAT001','Alimentação','SUB001','Mercearia','un',true],
    ['PROD016','Mostarda','CAT001','Alimentação','SUB001','Mercearia','un',true],
    ['PROD017','Milho verde','CAT001','Alimentação','SUB001','Mercearia','lata',true],
    ['PROD018','Ervilha','CAT001','Alimentação','SUB001','Mercearia','lata',true],
    ['PROD019','Atum','CAT001','Alimentação','SUB001','Mercearia','lata',true],
    ['PROD020','Sardinha','CAT001','Alimentação','SUB001','Mercearia','lata',true],

    // LATICÍNIOS
    ['PROD021','Leite integral 1 L','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD022','Leite desnatado 1 L','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD023','Creme de leite','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD024','Leite condensado','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD025','Manteiga','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD026','Margarina','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD027','Requeijão','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD028','Queijo muçarela','CAT001','Alimentação','SUB002','Laticínios','kg',true],
    ['PROD029','Queijo parmesão','CAT001','Alimentação','SUB002','Laticínios','un',true],
    ['PROD030','Iogurte','CAT001','Alimentação','SUB002','Laticínios','un',true],

    // CARNES
    ['PROD031','Carne bovina','CAT001','Alimentação','SUB003','Carnes','kg',true],
    ['PROD032','Carne moída','CAT001','Alimentação','SUB003','Carnes','kg',true],
    ['PROD033','Bife','CAT001','Alimentação','SUB003','Carnes','kg',true],
    ['PROD034','Frango inteiro','CAT001','Alimentação','SUB003','Carnes','kg',true],
    ['PROD035','Peito de frango','CAT001','Alimentação','SUB003','Carnes','kg',true],
    ['PROD036','Coxa e sobrecoxa','CAT001','Alimentação','SUB003','Carnes','kg',true],
    ['PROD037','Linguiça','CAT001','Alimentação','SUB003','Carnes','kg',true],
    ['PROD038','Bacon','CAT001','Alimentação','SUB003','Carnes','kg',true],

    // FRUTAS
    ['PROD039','Banana','CAT001','Alimentação','SUB004','Frutas','kg',true],
    ['PROD040','Maçã','CAT001','Alimentação','SUB004','Frutas','kg',true],
    ['PROD041','Laranja','CAT001','Alimentação','SUB004','Frutas','kg',true],
    ['PROD042','Mamão','CAT001','Alimentação','SUB004','Frutas','un',true],
    ['PROD043','Melancia','CAT001','Alimentação','SUB004','Frutas','un',true],
    ['PROD044','Uva','CAT001','Alimentação','SUB004','Frutas','kg',true],

    // VERDURAS
    ['PROD045','Tomate','CAT001','Alimentação','SUB005','Verduras e Legumes','kg',true],
    ['PROD046','Batata','CAT001','Alimentação','SUB005','Verduras e Legumes','kg',true],
    ['PROD047','Cenoura','CAT001','Alimentação','SUB005','Verduras e Legumes','kg',true],
    ['PROD048','Cebola','CAT001','Alimentação','SUB005','Verduras e Legumes','kg',true],
    ['PROD049','Alho','CAT001','Alimentação','SUB005','Verduras e Legumes','kg',true],
    ['PROD050','Alface','CAT001','Alimentação','SUB005','Verduras e Legumes','un',true],

    // PADARIA
    ['PROD051','Pão francês','CAT001','Alimentação','SUB006','Pães e Padaria','kg',true],
    ['PROD052','Pão de forma','CAT001','Alimentação','SUB006','Pães e Padaria','pct',true],
    ['PROD053','Pão de hambúrguer','CAT001','Alimentação','SUB006','Pães e Padaria','pct',true],
    ['PROD054','Torradas','CAT001','Alimentação','SUB006','Pães e Padaria','pct',true],

    // CONGELADOS
    ['PROD055','Pizza congelada','CAT001','Alimentação','SUB008','Congelados','un',true],
    ['PROD056','Batata frita congelada','CAT001','Alimentação','SUB008','Congelados','pct',true],
    ['PROD057','Hambúrguer congelado','CAT001','Alimentação','SUB008','Congelados','pct',true],
    ['PROD058','Legumes congelados','CAT001','Alimentação','SUB008','Congelados','pct',true],

    // BEBIDAS
    ['PROD059','Água mineral','CAT002','Bebidas','SUB011','Água','un',true],
    ['PROD060','Refrigerante','CAT002','Bebidas','SUB012','Refrigerantes','un',true],
    ['PROD061','Suco','CAT002','Bebidas','SUB013','Sucos','un',true],
    ['PROD062','Café','CAT002','Bebidas','SUB014','Cafés','pct',true],
    ['PROD063','Chá','CAT002','Bebidas','SUB015','Chás','cx',true],

    // LIMPEZA
    ['PROD064','Detergente','CAT003','Limpeza','SUB016','Cozinha','un',true],
    ['PROD065','Esponja','CAT003','Limpeza','SUB016','Cozinha','pct',true],
    ['PROD066','Sabão em pó','CAT003','Limpeza','SUB017','Lavanderia','un',true],
    ['PROD067','Sabão líquido','CAT003','Limpeza','SUB017','Lavanderia','un',true],
    ['PROD068','Amaciante','CAT003','Limpeza','SUB017','Lavanderia','un',true],
    ['PROD069','Água sanitária','CAT003','Limpeza','SUB019','Limpeza Geral','un',true],
    ['PROD070','Desinfetante','CAT003','Limpeza','SUB019','Limpeza Geral','un',true],
    ['PROD071','Limpador multiuso','CAT003','Limpeza','SUB019','Limpeza Geral','un',true],
    ['PROD072','Limpa-vidros','CAT003','Limpeza','SUB019','Limpeza Geral','un',true],
    ['PROD073','Saco para lixo','CAT003','Limpeza','SUB020','Descarte e Sacos','pct',true],

    // HIGIENE
    ['PROD074','Sabonete','CAT004','Higiene Pessoal','SUB021','Banho','un',true],
    ['PROD075','Shampoo','CAT004','Higiene Pessoal','SUB022','Cabelos','un',true],
    ['PROD076','Condicionador','CAT004','Higiene Pessoal','SUB022','Cabelos','un',true],
    ['PROD077','Creme dental','CAT004','Higiene Pessoal','SUB023','Higiene Bucal','un',true],
    ['PROD078','Escova de dentes','CAT004','Higiene Pessoal','SUB023','Higiene Bucal','un',true],
    ['PROD079','Fio dental','CAT004','Higiene Pessoal','SUB023','Higiene Bucal','un',true],
    ['PROD080','Desodorante','CAT004','Higiene Pessoal','SUB024','Desodorantes','un',true],
    ['PROD081','Papel higiênico','CAT004','Higiene Pessoal','SUB025','Papel Higiênico','pct',true],

    // CASA
    ['PROD082','Papel toalha','CAT005','Casa e Cozinha','SUB028','Papel e Filme','pct',true],
    ['PROD083','Papel alumínio','CAT005','Casa e Cozinha','SUB028','Papel e Filme','un',true],
    ['PROD084','Filme plástico','CAT005','Casa e Cozinha','SUB028','Papel e Filme','un',true],
    ['PROD085','Guardanapo','CAT005','Casa e Cozinha','SUB027','Descartáveis','pct',true],
    ['PROD086','Filtro de café','CAT005','Casa e Cozinha','SUB028','Papel e Filme','cx',true],

    // PETS
    ['PROD087','Ração para cães','CAT007','Pets','SUB033','Cães','pct',true],
    ['PROD088','Ração para gatos','CAT007','Pets','SUB034','Gatos','pct',true],
    ['PROD089','Areia para gatos','CAT007','Pets','SUB034','Gatos','pct',true],
    ['PROD090','Tapete higiênico','CAT007','Pets','SUB035','Higiene Pet','pct',true],

    // CHURRASCO
    ['PROD091','Carvão','CAT009','Churrasco','SUB040','Carvão e Acendedores','pct',true],
    ['PROD092','Sal grosso','CAT009','Churrasco','SUB041','Molhos e Temperos','pct',true],
    ['PROD093','Molho barbecue','CAT009','Churrasco','SUB041','Molhos e Temperos','un',true]

  ];

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha > 1) {
    aba.getRange(
      2,
      1,
      ultimaLinha - 1,
      8
    ).clearContent();
  }

  aba.getRange(
    2,
    1,
    produtos.length,
    8
  ).setValues(produtos);

  aba.getRange(
    2,
    8,
    produtos.length,
    1
  ).insertCheckboxes();

  aba.autoResizeColumns(1, 8);
}


/**
 * ============================================================
 * CONFIGURAÇÕES DO SISTEMA
 * ============================================================
 */
function configurarSistema() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const aba = ss.getSheetByName(MM.ABAS.CONFIG);

  const configuracoes = [

    ['NOME_APLICATIVO', 'Meu Mercado'],
    ['VERSAO', '1.0.0'],
    ['MOEDA', 'BRL'],
    ['IDIOMA', 'pt-BR'],
    ['LISTA_PADRAO', 'Lista da Casa'],
    ['MODO_COMPRAS', 'ATIVO'],
    ['SINCRONIZACAO', 'ATIVA'],
    ['CATALOGO_PADRAO', 'ATIVO']

  ];

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha > 1) {
    aba.getRange(
      2,
      1,
      ultimaLinha - 1,
      2
    ).clearContent();
  }

  aba.getRange(
    2,
    1,
    configuracoes.length,
    2
  ).setValues(configuracoes);

  aba.autoResizeColumns(1, 2);
}
function testarBancoMeuMercado() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const abas = [
    MM.ABAS.CATEGORIAS,
    MM.ABAS.PRODUTOS,
    MM.ABAS.LISTAS,
    MM.ABAS.ITENS,
    MM.ABAS.COMPRAS,
    MM.ABAS.USUARIOS,
    MM.ABAS.CONFIG
  ];

  const faltando = abas.filter(
    nome => !ss.getSheetByName(nome)
  );

  if (faltando.length) {
    throw new Error(
      'Abas não encontradas: ' + faltando.join(', ')
    );
  }

  const categorias =
    ss.getSheetByName(MM.ABAS.CATEGORIAS);

  const produtos =
    ss.getSheetByName(MM.ABAS.PRODUTOS);

  const totalCategorias =
    Math.max(0, categorias.getLastRow() - 1);

  const totalProdutos =
    Math.max(0, produtos.getLastRow() - 1);

  if (totalCategorias === 0) {
    throw new Error('Nenhuma categoria encontrada.');
  }

  if (totalProdutos === 0) {
    throw new Error('Nenhum produto encontrado.');
  }

  const produtosApp = obterProdutosApp();

  if (!Array.isArray(produtosApp)) {
    throw new Error(
      'obterProdutosApp() não retornou uma lista.'
    );
  }

  const resumo = obterResumoApp();

  SpreadsheetApp.getUi().alert(
    '✅ TESTE CONCLUÍDO!\n\n' +
    '📁 Abas verificadas: ' + abas.length + '\n' +
    '🏷️ Categorias: ' + totalCategorias + '\n' +
    '📦 Produtos: ' + totalProdutos + '\n' +
    '🟢 Produtos ativos: ' + produtosApp.length + '\n' +
    '🛒 Itens na lista: ' + resumo.total
  );

  return true;
}

/**
 * =========================================================
 * 📊 RESUMO DA LISTA ATUAL
 * Retorna contadores de itens totais, pendentes e comprados.
 * =========================================================
 */
function obterResumoApp(idLista) {
  try {
    const itens = obterListaAtualApp(idLista) || [];
    const total = itens.length;
    const comprados = itens.filter(function(item) {
      return item.comprado === true;
    }).length;
    const pendentes = total - comprados;

    return {
      total: total,
      pendentes: pendentes,
      comprados: comprados
    };
  } catch (erro) {
    Logger.log('Erro em obterResumoApp: ' + erro.message);
    return {
      total: 0,
      pendentes: 0,
      comprados: 0
    };
  }
}

/**
 * =========================================================
 * 🌐 BACKEND — MEU MERCADO
 * =========================================================
 */

function doGet(e) {
  // Sincronização e API com o Meu Financeiro
  if (e && e.parameter && (e.parameter.api === 'extrato' || e.parameter.api === 'compras')) {
    return responderApiMeuFinanceiro(e);
  }
  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Meu Mercado')
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}
/**
 * =========================================================
 * 👤 USUÁRIO ATUAL — MEU MERCADO
 * Identifica o usuário pelo e-mail da conta Google
 * =========================================================
 */
function obterUsuarioAtualApp() {

  const email =
    String(
      Session.getActiveUser().getEmail() || ''
    )
    .trim()
    .toLowerCase();

  if (!email) {
    return {
      autenticado: false,
      encontrado: false,
      nome: '',
      email: '',
      perfil: ''
    };
  }

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const aba =
    ss.getSheetByName(
      MM.ABAS.USUARIOS
    );

  if (!aba) {
    throw new Error(
      'A aba 👨‍👩‍👧 USUARIOS não foi encontrada.'
    );
  }

  const ultimaLinha =
    aba.getLastRow();

  if (ultimaLinha < 2) {
    return {
      autenticado: true,
      encontrado: false,
      nome: '',
      email: email,
      perfil: ''
    };
  }

  const dados =
    aba.getRange(
      2,
      1,
      ultimaLinha - 1,
      5
    )
    .getValues();

  for (let i = 0; i < dados.length; i++) {

    const nome =
      String(dados[i][1] || '').trim();

    const emailCadastro =
      String(dados[i][2] || '')
        .trim()
        .toLowerCase();

    const perfil =
      String(dados[i][3] || '').trim();

    const ativo =
      dados[i][4] === true ||
      String(dados[i][4])
        .toUpperCase() === 'TRUE';

    if (
      emailCadastro === email &&
      ativo
    ) {

      return {
        autenticado: true,
        encontrado: true,
        nome: nome,
        email: email,
        perfil: perfil
      };
    }
  }

  return {
    autenticado: true,
    encontrado: false,
    nome: '',
    email: email,
    perfil: ''
  };
}


function incluir(nomeArquivo) {
  return HtmlService
    .createHtmlOutputFromFile(nomeArquivo)
    .getContent();
}


/**
 * 📦 PRODUTOS
 */
function obterProdutosApp() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const aba = ss.getSheetByName(
    MM.ABAS.PRODUTOS
  );

  if (!aba) {
    throw new Error(
      'A aba 📦 PRODUTOS não foi encontrada.'
    );
  }

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha < 2) {
    return [];
  }

  const dados = aba
    .getRange(
      2,
      1,
      ultimaLinha - 1,
      8
    )
    .getValues();

  return dados

    .filter(linha =>
      linha[0] &&
      linha[1] &&
      linha[7] === true
    )

    .map(linha => ({
      id: String(linha[0]),
      nome: String(linha[1]),
      categoriaId: String(linha[2]),
      categoria: String(linha[3]),
      subcategoriaId: String(linha[4]),
      subcategoria: String(linha[5]),
      unidade: String(linha[6])
    }));
}


/**
 * 📋 LISTA ATUAL
 */
function obterListaAtualApp(idListaSelecionada) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaListas =
    ss.getSheetByName(MM.ABAS.LISTAS);

  const abaItens =
    ss.getSheetByName(MM.ABAS.ITENS);

  const abaProdutos =
    ss.getSheetByName(MM.ABAS.PRODUTOS);

  if (
    !abaListas ||
    !abaItens ||
    !abaProdutos
  ) {
    throw new Error(
      'As abas necessárias não foram encontradas.'
    );
  }

  const ultimaLinhaLista =
    abaListas.getLastRow();

  const ultimaLinhaItens =
    abaItens.getLastRow();

  const ultimaLinhaProdutos =
    abaProdutos.getLastRow();

  if (
    ultimaLinhaLista < 2 ||
    ultimaLinhaItens < 2
  ) {
    return [];
  }

  /*
   * ========================================================
   * 📋 LOCALIZA A LISTA ATUAL
   * ========================================================
   */

  const listas =
    abaListas
      .getRange(
        2,
        1,
        ultimaLinhaLista - 1,
        7
      )
      .getValues();

  let listaAtual = null;

listas.forEach(linha => {

  const idLista =
    String(linha[0] || '');

  const nome =
    linha[1];

  const status =
    linha[5];

  if (!idLista) {
    return;
  }

  // ======================================================
  // SE UMA LISTA FOI SELECIONADA, USA EXATAMENTE ELA
  // ======================================================

  if (
    idListaSelecionada &&
    idLista ===
      String(idListaSelecionada)
  ) {

    listaAtual = {
      id: idLista,
      nome: String(
        nome || 'Lista de compras'
      )
    };

    return;
  }

  // ======================================================
  // CASO NORMAL: USA A LISTA ATIVA
  // ======================================================

  if (
    !idListaSelecionada &&
    (
      status === 'ABERTA' ||
      status === 'ATIVA'
    )
  ) {

    listaAtual = {
      id: idLista,
      nome: String(
        nome || 'Lista da Casa'
      )
    };
  }
});

  if (!listaAtual) {
    return [];
  }

  /*
   * ========================================================
   * 📦 MAPA DE PRODUTOS
   * ========================================================
   *
   * PRODUTOS:
   * A = ID_PRODUTO
   * B = PRODUTO
   * C = ID_CATEGORIA
   * D = CATEGORIA
   * E = ID_SUBCATEGORIA
   * F = SUBCATEGORIA
   * G = UNIDADE
   * H = ATIVO
   */

  const mapaProdutos = {};

  if (ultimaLinhaProdutos >= 2) {

    const produtos =
      abaProdutos
        .getRange(
          2,
          1,
          ultimaLinhaProdutos - 1,
          8
        )
        .getValues();

    produtos.forEach(linha => {

      const idProduto =
        String(linha[0] || '');

      if (!idProduto) {
        return;
      }

      mapaProdutos[idProduto] = {

        categoria:
          String(linha[3] || ''),

        subcategoria:
          String(linha[5] || '')

      };

    });

  }

  /*
   * ========================================================
   * 🛒 ITENS DA LISTA
   * ========================================================
   */

  const itens =
    abaItens
      .getRange(
        2,
        1,
        ultimaLinhaItens - 1,
        10
      )
      .getValues();

  return itens

    .filter(linha =>
      String(linha[1]) === listaAtual.id
    )

    .map(linha => {

      const produtoId =
        String(linha[2] || '');

      const produto =
        mapaProdutos[produtoId] || {};

      return {

        id:
          String(linha[0]),

        listaId:
          String(linha[1]),

        produtoId:
          produtoId,

        produto:
          String(linha[3]),

        quantidade:
          Number(linha[4]) || 1,

        unidade:
          String(linha[5] || ''),

        precoEstimado:
          Number(linha[6]) || 0,

        comprado:
          linha[7] === true,

        dataCompra:
          linha[8]
            ? new Date(
                linha[8]
              ).toISOString()
            : null,

        usuario:
          String(linha[9] || ''),

        categoria:
          produto.categoria || '',

        subcategoria:
          produto.subcategoria || ''

      };

    });
}
/**
 * 🛒 CRIAR LISTA PADRÃO
 */
function criarListaPadraoApp() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const aba =
    ss.getSheetByName(
      MM.ABAS.LISTAS
    );

  if (!aba) {
    throw new Error(
      'A aba 📋 LISTAS não foi encontrada.'
    );
  }

  const ultimaLinha =
    aba.getLastRow();

  if (ultimaLinha >= 2) {

    const dados =
      aba.getRange(
        2,
        1,
        ultimaLinha - 1,
        7
      ).getValues();

    for (const linha of dados) {

      if (
        linha[0] &&
        (
          linha[5] === 'ABERTA' ||
          linha[5] === 'ATIVA'
        )
      ) {
        return String(linha[0]);
      }
    }
  }

  const idLista =
    'LISTA-' + Utilities.getUuid();

  aba.appendRow([
    idLista,
    'Lista da Casa',
    'MENSAL',
    new Date(),
    '',
    'ABERTA',
    ''
  ]);

  SpreadsheetApp.flush();

  return idLista;
}


/**
 * ➕ ADICIONAR PRODUTO
 */
function adicionarProdutoApp(
  idProduto,
  quantidade,
  idLista
) {

  if (!idProduto) {
    throw new Error(
      'Produto não informado.'
    );
  }

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaProdutos =
    ss.getSheetByName(
      MM.ABAS.PRODUTOS
    );

  const abaItens =
    ss.getSheetByName(
      MM.ABAS.ITENS
    );

  if (!abaProdutos || !abaItens) {
    throw new Error(
      'Abas do banco não encontradas.'
    );
  }

  const idListaDestino =
    (idLista && String(idLista).trim()) ||
    criarListaPadraoApp();

  const ultimaLinhaProduto =
    abaProdutos.getLastRow();

  if (ultimaLinhaProduto < 2) {
    throw new Error(
      'Não existem produtos cadastrados.'
    );
  }

  const produtos =
    abaProdutos
      .getRange(
        2,
        1,
        ultimaLinhaProduto - 1,
        8
      )
      .getValues();

  let produtoEncontrado = null;

  for (const linha of produtos) {

    if (
      String(linha[0]) ===
      String(idProduto)
    ) {

      produtoEncontrado = {
        id: String(linha[0]),
        nome: String(linha[1]),
        unidade: String(linha[6])
      };

      break;
    }
  }

  if (!produtoEncontrado) {
    throw new Error(
      'Produto não encontrado.'
    );
  }

  const ultimaLinhaItem =
    abaItens.getLastRow();

  if (ultimaLinhaItem >= 2) {

    const itens =
      abaItens
        .getRange(
          2,
          1,
          ultimaLinhaItem - 1,
          10
        )
        .getValues();

    for (
      let i = 0;
      i < itens.length;
      i++
    ) {

      if (
        String(itens[i][1]) ===
          String(idListaDestino) &&
        String(itens[i][2]) ===
          String(idProduto)
      ) {

        const linhaPlanilha =
          i + 2;

        const quantidadeAtual =
          Number(itens[i][4]) || 0;

        abaItens
          .getRange(
            linhaPlanilha,
            5
          )
          .setValue(
            quantidadeAtual +
            (Number(quantidade) || 1)
          );

        abaItens
          .getRange(
            linhaPlanilha,
            8
          )
          .setValue(false);

        abaItens
          .getRange(
            linhaPlanilha,
            9
          )
          .setValue('');

        SpreadsheetApp.flush();

        return obterListaAtualApp(idListaDestino);
      }
    }
  }

  const idItem =
    'ITEM-' + Utilities.getUuid();

  abaItens.appendRow([
    idItem,
    idListaDestino,
    produtoEncontrado.id,
    produtoEncontrado.nome,
    Number(quantidade) || 1,
    produtoEncontrado.unidade,
    0,
    false,
    '',
    ''
  ]);

  SpreadsheetApp.flush();

  return obterListaAtualApp(idListaDestino);
}
/**
 * 📋 OBTER TODAS AS LISTAS
 */
function obterListasApp() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaListas =
    ss.getSheetByName(MM.ABAS.LISTAS);

  const abaItens =
    ss.getSheetByName(MM.ABAS.ITENS);

  if (!abaListas || !abaItens) {
    throw new Error(
      'As abas de listas não foram encontradas.'
    );
  }

  const ultimaLinhaLista =
    abaListas.getLastRow();

  if (ultimaLinhaLista < 2) {
    return [];
  }

  const listas =
    abaListas
      .getRange(
        2,
        1,
        ultimaLinhaLista - 1,
        7
      )
      .getValues();

  const ultimaLinhaItem =
    abaItens.getLastRow();

  const itens =
    ultimaLinhaItem >= 2
      ? abaItens
          .getRange(
            2,
            1,
            ultimaLinhaItem - 1,
            10
          )
          .getValues()
      : [];

  return listas
    .filter(function(linha) {
      return linha[0];
    })
    .map(function(linha) {

      const idLista =
        String(linha[0]);

      const itensLista =
        itens.filter(function(item) {
          return String(item[1]) === idLista;
        });

      const comprados =
        itensLista.filter(function(item) {
          return item[7] === true;
        }).length;

      return {
        id: idLista,
        nome:
          String(
            linha[1] ||
            'Lista sem nome'
          ),
        tipo:
          String(linha[2] || ''),
        dataCriacao:
          linha[3]
            ? new Date(linha[3]).toISOString()
            : null,
        dataFechamento:
          linha[4]
            ? new Date(linha[4]).toISOString()
            : null,
        status:
          String(linha[5] || ''),
        usuario:
          String(linha[6] || ''),
        totalItens:
          itensLista.length,
        itensComprados:
          comprados,
        itensPendentes:
          itensLista.length - comprados
      };

    })
    .sort(function(a, b) {

      const dataA =
        a.dataCriacao
          ? new Date(a.dataCriacao).getTime()
          : 0;

      const dataB =
        b.dataCriacao
          ? new Date(b.dataCriacao).getTime()
          : 0;

      return dataB - dataA;
    });
}


/**
 * ➕ CRIAR NOVA LISTA
 */
function criarNovaListaApp(nomeLista) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const aba =
    ss.getSheetByName(
      MM.ABAS.LISTAS
    );

  if (!aba) {
    throw new Error(
      'A aba 📋 LISTAS não foi encontrada.'
    );
  }

  const nome =
    String(nomeLista || '')
      .trim();

  if (!nome) {
    throw new Error(
      'Informe um nome para a lista.'
    );
  }

  const ultimaLinha =
    aba.getLastRow();


  const idLista =
    'LISTA-' +
    Utilities.getUuid();

  aba.appendRow([
    idLista,
    nome,
    'MENSAL',
    new Date(),
    '',
    'ABERTA',
    ''
  ]);

  SpreadsheetApp.flush();

  return obterListasApp();
}

/**
 * =========================================================
 * 🛒 MARCAR / DESMARCAR COMPRADO
 * =========================================================
 *
 * Quando um item é marcado como comprado:
 * - atualiza ITENS_LISTA;
 * - registra a compra em 🧾 COMPRAS;
 * - mantém o histórico mesmo se o item for posteriormente
 *   desmarcado.
 *
 * Quando o item é desmarcado:
 * - apenas altera o estado da lista;
 * - não apaga o histórico já registrado.
 *
 * =========================================================
 */
function alternarItemCompradoApp(idItem, idLista) {

  if (!idItem) {
    throw new Error(
      'ID do item não informado.'
    );
  }

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaItens =
    ss.getSheetByName(
      MM.ABAS.ITENS
    );

  if (!abaItens) {
    throw new Error(
      'A aba 🛒 ITENS_LISTA não foi encontrada.'
    );
  }

  const ultimaLinha =
    abaItens.getLastRow();

  if (ultimaLinha < 2) {
    throw new Error(
      'Não existem itens na lista.'
    );
  }

  const dados =
    abaItens.getRange(
      2,
      1,
      ultimaLinha - 1,
      10
    ).getValues();

  for (let i = 0; i < dados.length; i++) {

    if (
      String(dados[i][0]) ===
      String(idItem)
    ) {

      const linhaPlanilha =
        i + 2;

      const estadoAtual =
        dados[i][7] === true;

      const novoEstado =
        !estadoAtual;

      const listaRetorno =
        idLista || dados[i][1];

      /*
       * -----------------------------------------------------
       * ATUALIZA ITEM DA LISTA
       * -----------------------------------------------------
       */

      abaItens
        .getRange(
          linhaPlanilha,
          8
        )
        .setValue(novoEstado);

      abaItens
        .getRange(
          linhaPlanilha,
          9
        )
        .setValue(
          novoEstado
            ? new Date()
            : ''
        );

      /*
       * -----------------------------------------------------
       * REGISTRA COMPRA NO HISTÓRICO
       * -----------------------------------------------------
       */

      if (novoEstado) {

        registrarCompraHistoricoApp({
          idItem: dados[i][0],
          idLista: dados[i][1],
          idProduto: dados[i][2],
          produto: dados[i][3],
          quantidade: dados[i][4],
          precoEstimado: dados[i][6],
          usuario: dados[i][9] || '',
          data: new Date()
        });
      }

      SpreadsheetApp.flush();

      return obterListaAtualApp(listaRetorno);
    }
  }

  throw new Error(
    'Item não encontrado: ' +
    idItem
  );
}

/**
 * =========================================================
 * 🗑️ REMOVER ITEM DA LISTA
 * =========================================================
 */
function removerItemListaApp(idItem, idLista) {

  if (!idItem) {
    throw new Error('ID do item não informado.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaItens = ss.getSheetByName(MM.ABAS.ITENS);

  if (!abaItens) {
    throw new Error('A aba 🛒 ITENS_LISTA não foi encontrada.');
  }

  const ultimaLinha = abaItens.getLastRow();

  if (ultimaLinha < 2) {
    return obterListaAtualApp(idLista);
  }

  const dados = abaItens.getRange(2, 1, ultimaLinha - 1, 2).getValues();
  let listaItem = idLista;

  for (let i = 0; i < dados.length; i++) {
    if (String(dados[i][0]) === String(idItem)) {
      if (!listaItem) {
        listaItem = dados[i][1];
      }
      abaItens.deleteRow(i + 2);
      SpreadsheetApp.flush();
      break;
    }
  }

  return obterListaAtualApp(listaItem);
}

/**
 * =========================================================
 * 🔢 ATUALIZAR QUANTIDADE DO ITEM
 * =========================================================
 */
function atualizarQuantidadeItemApp(idItem, novaQuantidade, idLista) {

  if (!idItem) {
    throw new Error('ID do item não informado.');
  }

  const qtd = Number(novaQuantidade);

  if (isNaN(qtd) || qtd <= 0) {
    return removerItemListaApp(idItem, idLista);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaItens = ss.getSheetByName(MM.ABAS.ITENS);

  if (!abaItens) {
    throw new Error('A aba 🛒 ITENS_LISTA não foi encontrada.');
  }

  const ultimaLinha = abaItens.getLastRow();

  if (ultimaLinha < 2) {
    return obterListaAtualApp(idLista);
  }

  const dados = abaItens.getRange(2, 1, ultimaLinha - 1, 2).getValues();
  let listaItem = idLista;

  for (let i = 0; i < dados.length; i++) {
    if (String(dados[i][0]) === String(idItem)) {
      if (!listaItem) {
        listaItem = dados[i][1];
      }
      abaItens.getRange(i + 2, 5).setValue(qtd);
      SpreadsheetApp.flush();
      break;
    }
  }

  return obterListaAtualApp(listaItem);
}

/**
 * =========================================================
 * 🏁 FINALIZAR / FECHAR LISTA
 * =========================================================
 */
function finalizarListaApp(idLista) {

  if (!idLista) {
    throw new Error('ID da lista não informado.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaListas = ss.getSheetByName(MM.ABAS.LISTAS);

  if (!abaListas) {
    throw new Error('A aba 📋 LISTAS não foi encontrada.');
  }

  const ultimaLinha = abaListas.getLastRow();

  if (ultimaLinha < 2) {
    return obterListasApp();
  }

  const dados = abaListas.getRange(2, 1, ultimaLinha - 1, 1).getValues();

  for (let i = 0; i < dados.length; i++) {
    if (String(dados[i][0]) === String(idLista)) {
      const linha = i + 2;
      abaListas.getRange(linha, 5).setValue(new Date()); // DATA_FECHAMENTO
      abaListas.getRange(linha, 6).setValue('FECHADA');  // STATUS
      SpreadsheetApp.flush();
      try { sincronizarListaComMeuFinanceiro(idLista); } catch(eSync) { console.warn('Sync Meu Financeiro:', eSync); }
      break;
    }
  }

  return obterListasApp();
}

/**
 * =========================================================
 * 🔓 REABRIR LISTA FECHADA
 * =========================================================
 */
function reabrirListaApp(idLista) {

  if (!idLista) {
    throw new Error('ID da lista não informado.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaListas = ss.getSheetByName(MM.ABAS.LISTAS);

  if (!abaListas) {
    throw new Error('A aba 📋 LISTAS não foi encontrada.');
  }

  const ultimaLinha = abaListas.getLastRow();

  if (ultimaLinha < 2) {
    return obterListasApp();
  }

  const dados = abaListas.getRange(2, 1, ultimaLinha - 1, 1).getValues();

  for (let i = 0; i < dados.length; i++) {
    if (String(dados[i][0]) === String(idLista)) {
      const linha = i + 2;
      abaListas.getRange(linha, 5).setValue('');         // Limpa DATA_FECHAMENTO
      abaListas.getRange(linha, 6).setValue('ABERTA');   // STATUS ABERTA
      SpreadsheetApp.flush();
      try { removerListaDoMeuFinanceiro(idLista); } catch(eRem) { console.warn('Rem Meu Financeiro:', eRem); }
      break;
    }
  }

  return obterListasApp();
}

/**
 * =========================================================
 * 📋 DUPLICAR / REUTILIZAR LISTA
 * =========================================================
 */
function duplicarListaApp(idListaOriginal, novoNome) {

  if (!idListaOriginal) {
    throw new Error('ID da lista de origem não informado.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaListas = ss.getSheetByName(MM.ABAS.LISTAS);
  const abaItens = ss.getSheetByName(MM.ABAS.ITENS);

  if (!abaListas || !abaItens) {
    throw new Error('Abas de listas ou itens não encontradas.');
  }

  const itensOriginais = obterListaAtualApp(idListaOriginal);
  const novoIdLista = 'LISTA-' + Utilities.getUuid();
  const nomeFinal = (novoNome && String(novoNome).trim()) || ('Cópia da Lista');

  abaListas.appendRow([
    novoIdLista,
    nomeFinal,
    'REUTILIZADA',
    new Date(),
    '',
    'ABERTA',
    ''
  ]);

  if (itensOriginais && itensOriginais.length) {
    const novosItens = itensOriginais.map(function(item) {
      return [
        'ITEM-' + Utilities.getUuid(),
        novoIdLista,
        item.produtoId,
        item.produto,
        item.quantidade || 1,
        item.unidade || '',
        item.precoEstimado || 0,
        false,
        '',
        ''
      ];
    });

    abaItens.getRange(abaItens.getLastRow() + 1, 1, novosItens.length, 10).setValues(novosItens);
  }

  SpreadsheetApp.flush();
  return obterListasApp();
}
/**
 * =========================================================
 * 🧾 REGISTRAR COMPRA NO HISTÓRICO
 * =========================================================
 */
function registrarCompraHistoricoApp(dados) {

  if (!dados) {
    throw new Error(
      'Dados da compra não informados.'
    );
  }

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaCompras =
    ss.getSheetByName(
      MM.ABAS.COMPRAS
    );

  if (!abaCompras) {
    throw new Error(
      'A aba 🧾 COMPRAS não foi encontrada.'
    );
  }

  /*
   * -------------------------------------------------------
   * EVITA DUPLICAÇÃO
   * -------------------------------------------------------
   *
   * Um mesmo item da lista não deve gerar duas compras
   * caso a função seja executada novamente.
   */

  const ultimaLinha =
    abaCompras.getLastRow();

  if (ultimaLinha >= 2) {

    const registros =
      abaCompras.getRange(
        2,
        1,
        ultimaLinha - 1,
        10
      ).getValues();

    const jaRegistrado =
      registros.some(linha =>
        String(linha[1]) ===
        String(dados.idLista) &&
        String(linha[3]) ===
        String(dados.produto) &&
        String(linha[0]) !== ''
      );

    /*
     * A estrutura atual de 🧾 COMPRAS não possui
     * ID_ITEM. Portanto, usamos a combinação
     * lista + produto para evitar duplicação.
     *
     * Se futuramente houver necessidade de comprar
     * o mesmo produto duas vezes na mesma lista,
     * poderemos aprimorar esse identificador.
     */

    if (jaRegistrado) {
      return;
    }
  }

  const idCompra =
    'COMPRA-' +
    Utilities.getUuid();

  const quantidade =
    Number(dados.quantidade) || 1;

  const dataCompra =
    dados.data || new Date();

  let precoUnitario = Number(dados.precoUnitario || dados.precoEstimado) || '';
  let total = '';

  if (precoUnitario === '' && ultimaLinha >= 2) {
    const historicoPrecos = abaCompras.getRange(2, 4, ultimaLinha - 1, 4).getValues();
    for (let r = historicoPrecos.length - 1; r >= 0; r--) {
      if (String(historicoPrecos[r][0]).toLowerCase().trim() === String(dados.produto).toLowerCase().trim()) {
        const p = Number(historicoPrecos[r][2]);
        if (!isNaN(p) && p > 0) {
          precoUnitario = p;
          break;
        }
      }
    }
  }

  if (precoUnitario !== '') {
    total = Math.round(quantidade * Number(precoUnitario) * 100) / 100;
  }

  abaCompras.appendRow([
    idCompra,
    dados.idLista || '',
    dataCompra,
    dados.produto || '',
    quantidade,
    precoUnitario,
    total,
    dados.usuario || ''
  ]);

  SpreadsheetApp.flush();
}
/**
 * =========================================================
 * 🧾 HISTÓRICO DE COMPRAS — V2
 * =========================================================
 *
 * Consolida o histórico por produto e calcula:
 *
 * - quantidade de compras;
 * - quantidade da última compra;
 * - quantidade média por compra;
 * - última compra;
 * - compra anterior;
 * - intervalo da última compra;
 * - intervalo médio;
 * - próxima compra estimada;
 *
 * =========================================================
 */
function obterHistoricoComprasApp() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const aba =
    ss.getSheetByName(
      MM.ABAS.COMPRAS
    );

  if (!aba) {
    throw new Error(
      'A aba 🧾 COMPRAS não foi encontrada.'
    );
  }

  const ultimaLinha =
    aba.getLastRow();

  if (ultimaLinha < 2) {
    return [];
  }

  const dados =
    aba.getRange(
      2,
      1,
      ultimaLinha - 1,
      8
    ).getValues();

  const mapa = {};

  dados.forEach(function(linha) {

    const produto =
      String(linha[3] || '').trim();

    const data =
      linha[2];

    const quantidade =
      Number(linha[4]) || 0;

    if (!produto || !data) {
      return;
    }

    const dataCompra =
      data instanceof Date
        ? new Date(data)
        : new Date(data);

    if (
      isNaN(
        dataCompra.getTime()
      )
    ) {
      return;
    }

    if (!mapa[produto]) {

      mapa[produto] = {
        produto: produto,
        compras: []
      };
    }

    mapa[produto].compras.push({

      data: dataCompra,

      quantidade:
        quantidade

    });
  });

  const resultado =
    Object.keys(mapa).map(function(nome) {

      const registro =
        mapa[nome];

      registro.compras.sort(
        function(a, b) {
          return a.data - b.data;
        }
      );

      const compras =
        registro.compras;

      const ultima =
        compras[
          compras.length - 1
        ];

      const anterior =
        compras.length >= 2
          ? compras[
              compras.length - 2
            ]
          : null;

      /*
       * -----------------------------------------------------
       * INTERVALO DA ÚLTIMA COMPRA
       * -----------------------------------------------------
       */

      let intervaloUltimo =
        null;

      if (anterior) {

        intervaloUltimo =
          calcularDiasEntreDatasApp(
            anterior.data,
            ultima.data
          );
      }

      /*
       * -----------------------------------------------------
       * INTERVALO MÉDIO
       * -----------------------------------------------------
       */

      let somaIntervalos = 0;

      let quantidadeIntervalos = 0;

      for (
        let i = 1;
        i < compras.length;
        i++
      ) {

        const intervalo =
          calcularDiasEntreDatasApp(
            compras[i - 1].data,
            compras[i].data
          );

        if (intervalo >= 0) {

          somaIntervalos +=
            intervalo;

          quantidadeIntervalos++;
        }
      }

      const mediaIntervalo =
        quantidadeIntervalos > 0
          ? Math.round(
              somaIntervalos /
              quantidadeIntervalos
            )
          : null;

      /*
       * -----------------------------------------------------
       * QUANTIDADE MÉDIA
       * -----------------------------------------------------
       */

      let somaQuantidades = 0;

      compras.forEach(
        function(compra) {

          somaQuantidades +=
            compra.quantidade;

        }
      );

      const quantidadeMedia =
        compras.length > 0
          ? somaQuantidades /
            compras.length
          : 0;

      /*
       * -----------------------------------------------------
       * PRÓXIMA COMPRA
       * -----------------------------------------------------
       */

      let proximaCompra =
        null;

      if (
        mediaIntervalo &&
        mediaIntervalo > 0
      ) {

        proximaCompra =
          new Date(
            ultima.data
          );

        proximaCompra.setDate(
          proximaCompra.getDate() +
          mediaIntervalo
        );
      }

      /*
       * -----------------------------------------------------
       * RESULTADO
       * -----------------------------------------------------
       */

      return {

        produto:
          registro.produto,

        quantidadeCompras:
          compras.length,

        quantidadeUltimaCompra:
          ultima.quantidade,

        quantidadeMedia:
          Math.round(
            quantidadeMedia * 10
          ) / 10,

        ultimaCompra:
          ultima.data.toISOString(),

        compraAnterior:
          anterior
            ? anterior.data.toISOString()
            : null,

        intervaloUltimo:
          intervaloUltimo,

        mediaIntervalo:
          mediaIntervalo,

        proximaCompra:
          proximaCompra
            ? proximaCompra.toISOString()
            : null
      };
    });

  /*
   * Produtos mais recentemente comprados
   * aparecem primeiro.
   */

  resultado.sort(
    function(a, b) {

      return (
        new Date(b.ultimaCompra) -
        new Date(a.ultimaCompra)
      );

    }
  );

  return resultado;
}

/**
 * =========================================================
 * 📊 EXTRATO DE COMPRAS E COMPARATIVO DE GASTOS
 * =========================================================
 * Retorna compras agrupadas por período, comparativo mês a mês
 * e histórico de evolução/variação de preços dos produtos.
 */
function obterExtratoComprasApp(filtroPeriodo) {
  filtroPeriodo = filtroPeriodo || 'mes_atual';

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName(MM.ABAS.COMPRAS);
  if (!aba) {
    throw new Error('A aba 🧾 COMPRAS não foi encontrada.');
  }

  const ultimaLinha = aba.getLastRow();
  if (ultimaLinha < 2) {
    return {
      filtro: filtroPeriodo,
      periodos: [],
      resumoGeral: { totalGasto: 0, totalItens: 0, totalIdas: 0 },
      comparativo: { mesAtual: 0, mesAnterior: 0, variacaoPercentual: 0 },
      evolucaoPrecos: []
    };
  }

  const dados = aba.getRange(2, 1, ultimaLinha - 1, 8).getValues();
  const hoje = new Date();
  const mesAtualNum = hoje.getMonth();
  const anoAtualNum = hoje.getFullYear();

  let dataInicioFiltro = null;
  let dataFimFiltro = null;

  if (filtroPeriodo === 'mes_atual') {
    dataInicioFiltro = new Date(anoAtualNum, mesAtualNum, 1);
    dataFimFiltro = new Date(anoAtualNum, mesAtualNum + 1, 0, 23, 59, 59);
  } else if (filtroPeriodo === 'mes_anterior') {
    dataInicioFiltro = new Date(anoAtualNum, mesAtualNum - 1, 1);
    dataFimFiltro = new Date(anoAtualNum, mesAtualNum, 0, 23, 59, 59);
  } else if (filtroPeriodo === 'trimestre') {
    dataInicioFiltro = new Date(anoAtualNum, mesAtualNum - 2, 1);
    dataFimFiltro = new Date(anoAtualNum, mesAtualNum + 1, 0, 23, 59, 59);
  } else if (filtroPeriodo === 'ano') {
    dataInicioFiltro = new Date(anoAtualNum, 0, 1);
    dataFimFiltro = new Date(anoAtualNum, 11, 31, 23, 59, 59);
  }

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const comprasFiltradas = [];
  const mapaPrecosProduto = {};

  let gastoMesAtual = 0;
  let gastoMesAnterior = 0;

  dados.forEach(function(linha) {
    const idCompra = String(linha[0] || '').trim();
    const idLista = String(linha[1] || '').trim();
    const dataRaw = linha[2];
    const produto = String(linha[3] || '').trim();
    const quantidade = Number(linha[4]) || 0;
    const precoUnitario = Number(linha[5]) || 0;
    const total = Number(linha[6]) || (quantidade * precoUnitario);
    const usuario = String(linha[7] || '').trim();

    if (!produto || !dataRaw) return;

    const dataObj = dataRaw instanceof Date ? dataRaw : new Date(dataRaw);
    if (isNaN(dataObj.getTime())) return;

    const registro = {
      id: idCompra,
      listaId: idLista,
      data: dataObj.toISOString(),
      dataObj: dataObj,
      produto: produto,
      quantidade: quantidade,
      precoUnitario: precoUnitario,
      total: total,
      usuario: usuario
    };

    if (precoUnitario > 0) {
      if (!mapaPrecosProduto[produto]) {
        mapaPrecosProduto[produto] = [];
      }
      mapaPrecosProduto[produto].push({
        data: dataObj,
        preco: precoUnitario,
        quantidade: quantidade
      });
    }

    if (dataObj.getFullYear() === anoAtualNum && dataObj.getMonth() === mesAtualNum) {
      gastoMesAtual += total;
    } else if (
      (mesAtualNum === 0 && dataObj.getFullYear() === anoAtualNum - 1 && dataObj.getMonth() === 11) ||
      (dataObj.getFullYear() === anoAtualNum && dataObj.getMonth() === mesAtualNum - 1)
    ) {
      gastoMesAnterior += total;
    }

    if (dataInicioFiltro && dataFimFiltro) {
      if (dataObj >= dataInicioFiltro && dataObj <= dataFimFiltro) {
        comprasFiltradas.push(registro);
      }
    } else {
      comprasFiltradas.push(registro);
    }
  });

  const gruposMes = {};
  comprasFiltradas.forEach(function(item) {
    const ano = item.dataObj.getFullYear();
    const mesIdx = item.dataObj.getMonth();
    const chaveMes = ano + '-' + String(mesIdx + 1).padStart(2, '0');
    const rotuloMes = nomesMeses[mesIdx] + ' de ' + ano;

    if (!gruposMes[chaveMes]) {
      gruposMes[chaveMes] = {
        chave: chaveMes,
        rotulo: rotuloMes,
        totalGasto: 0,
        totalItens: 0,
        diasComprados: {},
        itens: []
      };
    }

    gruposMes[chaveMes].totalGasto += item.total;
    gruposMes[chaveMes].totalItens += item.quantidade;
    
    const diaChave = item.data.split('T')[0] + (item.listaId ? '_' + item.listaId : '');
    gruposMes[chaveMes].diasComprados[diaChave] = true;

    gruposMes[chaveMes].itens.push({
      id: item.id,
      produto: item.produto,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      total: item.total,
      data: item.data,
      usuario: item.usuario
    });
  });

  const periodos = Object.keys(gruposMes)
    .sort()
    .reverse()
    .map(function(chave) {
      const g = gruposMes[chave];
      g.itens.sort(function(a, b) {
        return new Date(b.data) - new Date(a.data);
      });

      return {
        chave: g.chave,
        rotulo: g.rotulo,
        totalGasto: Math.round(g.totalGasto * 100) / 100,
        totalItens: Math.round(g.totalItens * 10) / 10,
        quantidadeIdas: Object.keys(g.diasComprados).length,
        itens: g.itens
      };
    });

  let variacaoPercentual = 0;
  if (gastoMesAnterior > 0) {
    variacaoPercentual = Math.round(((gastoMesAtual - gastoMesAnterior) / gastoMesAnterior) * 1000) / 10;
  }

  const evolucaoPrecos = [];
  Object.keys(mapaPrecosProduto).forEach(function(nomeProd) {
    const registros = mapaPrecosProduto[nomeProd];
    if (registros.length >= 2) {
      registros.sort(function(a, b) { return a.data - b.data; });
      const ultimo = registros[registros.length - 1];
      const penultimo = registros[registros.length - 2];

      if (ultimo.preco !== penultimo.preco) {
        const diff = ultimo.preco - penultimo.preco;
        const perc = Math.round((diff / penultimo.preco) * 1000) / 10;

        evolucaoPrecos.push({
          produto: nomeProd,
          precoAnterior: penultimo.preco,
          dataAnterior: penultimo.data.toISOString(),
          precoAtual: ultimo.preco,
          dataAtual: ultimo.data.toISOString(),
          variacaoReais: Math.round(diff * 100) / 100,
          variacaoPercentual: perc,
          tipo: diff > 0 ? 'aumento' : 'reducao'
        });
      }
    }
  });

  evolucaoPrecos.sort(function(a, b) {
    return b.variacaoPercentual - a.variacaoPercentual;
  });

  let totalGastoGeral = 0;
  let totalItensGeral = 0;
  let idasTotal = 0;
  periodos.forEach(function(p) {
    totalGastoGeral += p.totalGasto;
    totalItensGeral += p.totalItens;
    idasTotal += p.quantidadeIdas;
  });

  return {
    filtro: filtroPeriodo,
    periodos: periodos,
    resumoGeral: {
      totalGasto: Math.round(totalGastoGeral * 100) / 100,
      totalItens: Math.round(totalItensGeral * 10) / 10,
      totalIdas: idasTotal
    },
    comparativo: {
      mesAtual: Math.round(gastoMesAtual * 100) / 100,
      mesAnterior: Math.round(gastoMesAnterior * 100) / 100,
      variacaoPercentual: variacaoPercentual
    },
    evolucaoPrecos: evolucaoPrecos.slice(0, 15)
  };
}

/**
 * =========================================================
 * 🔔 COMPRAS PRÓXIMAS
 * Identifica produtos com previsão de nova compra.
 * Só considera produtos com pelo menos 2 compras.
 * =========================================================
 */
function obterComprasProximasApp() {

  const historico =
    obterHistoricoComprasApp();

  const hoje =
    new Date();

  hoje.setHours(
    0,
    0,
    0,
    0
  );

  return historico
    .filter(function(item) {

      return (
        item.quantidadeCompras >= 2 &&
        item.proximaCompra != null
      );

    })
    .map(function(item) {

      const dataPrevisao =
        new Date(
          item.proximaCompra
        );

      dataPrevisao.setHours(
        0,
        0,
        0,
        0
      );

      const diferenca =
        Math.round(
          (
            dataPrevisao.getTime() -
            hoje.getTime()
          ) /
          (1000 * 60 * 60 * 24)
        );

      let situacao =
        'futura';

      if (diferenca < 0) {
        situacao = 'atrasada';
      } else if (diferenca === 0) {
        situacao = 'hoje';
      } else if (diferenca <= 7) {
        situacao = 'proxima';
      }

      return {

        produto:
          item.produto,

        proximaCompra:
          item.proximaCompra,

        mediaIntervalo:
          item.mediaIntervalo,

        quantidadeUltimaCompra:
          item.quantidadeUltimaCompra,

        dias:
          diferenca,

        situacao:
          situacao
      };

    })
    .sort(function(a, b) {

      return a.dias - b.dias;

    });
}

/**
 * =========================================================
 * 📅 CALCULAR INTERVALO ENTRE DATAS
 * =========================================================
 */
function calcularDiasEntreDatasApp(
  dataInicial,
  dataFinal
) {

  const inicio =
    new Date(dataInicial);

  const fim =
    new Date(dataFinal);

  inicio.setHours(0, 0, 0, 0);
  fim.setHours(0, 0, 0, 0);

  const diferenca =
    fim.getTime() -
    inicio.getTime();

  return Math.round(
    diferenca /
    (1000 * 60 * 60 * 24)
  );
}
/**
 * ============================================================
 * 🏷️ OBTER CATEGORIAS E SUBCATEGORIAS
 * ============================================================
 */

function obterCategoriasApp() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const aba =
    ss.getSheetByName(
      MM.ABAS.CATEGORIAS
    );

  if (!aba) {
    throw new Error(
      'A aba 🏷️ CATEGORIAS não foi encontrada.'
    );
  }

  const ultimaLinha =
    aba.getLastRow();

  if (ultimaLinha < 2) {
    return [];
  }

  const dados =
    aba.getRange(
      2,
      1,
      ultimaLinha - 1,
      5
    ).getValues();

  return dados
    .filter(linha =>
      linha[0] &&
      linha[1] &&
      linha[2] &&
      linha[3] &&
      linha[4] === true
    )
    .map(linha => ({
      idCategoria: String(linha[0]),
      categoria: String(linha[1]),
      idSubcategoria: String(linha[2]),
      subcategoria: String(linha[3])
    }));

}

/**
 * ============================================================
 * 📦 CADASTRAR NOVO PRODUTO
 * ============================================================
 */

function cadastrarProdutoApp(dados) {

  if (!dados) {
    throw new Error(
      'Dados do produto não informados.'
    );
  }

  const nome =
    String(dados.nome || '')
      .trim();

  const categoriaId =
    String(dados.categoriaId || '')
      .trim();

  const subcategoriaId =
    String(dados.subcategoriaId || '')
      .trim();

  const unidade =
    String(dados.unidade || '')
      .trim();

  if (!nome) {
    throw new Error(
      'Informe o nome do produto.'
    );
  }

  if (!categoriaId) {
    throw new Error(
      'Selecione uma categoria.'
    );
  }

  if (!subcategoriaId) {
    throw new Error(
      'Selecione uma subcategoria.'
    );
  }

  if (!unidade) {
    throw new Error(
      'Informe a unidade do produto.'
    );
  }


  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaProdutos =
    ss.getSheetByName(
      MM.ABAS.PRODUTOS
    );

  const abaCategorias =
    ss.getSheetByName(
      MM.ABAS.CATEGORIAS
    );

  if (!abaProdutos || !abaCategorias) {
    throw new Error(
      'As abas necessárias não foram encontradas.'
    );
  }


  /*
   * Localiza categoria e subcategoria.
   */

  const ultimaLinhaCategoria =
    abaCategorias.getLastRow();

  if (ultimaLinhaCategoria < 2) {
    throw new Error(
      'Nenhuma categoria cadastrada.'
    );
  }

  const categorias =
    abaCategorias
      .getRange(
        2,
        1,
        ultimaLinhaCategoria - 1,
        5
      )
      .getValues();

  let categoriaEncontrada = null;

  for (const linha of categorias) {

    if (
      String(linha[0]) === categoriaId &&
      String(linha[2]) === subcategoriaId &&
      linha[4] === true
    ) {

      categoriaEncontrada = {
        categoriaId: String(linha[0]),
        categoria: String(linha[1]),
        subcategoriaId: String(linha[2]),
        subcategoria: String(linha[3])
      };

      break;

    }

  }

  if (!categoriaEncontrada) {
    throw new Error(
      'Categoria ou subcategoria inválida.'
    );
  }


  /*
   * Verifica produtos existentes.
   */

  const ultimaLinhaProduto =
    abaProdutos.getLastRow();

  if (ultimaLinhaProduto >= 2) {

    const produtos =
      abaProdutos
        .getRange(
          2,
          1,
          ultimaLinhaProduto - 1,
          8
        )
        .getValues();

    const nomeNormalizado =
      nome.toLowerCase();

    const duplicado =
      produtos.some(linha => {

        return (
          linha[0] &&
          String(linha[1] || '')
            .trim()
            .toLowerCase() ===
              nomeNormalizado
        );

      });

    if (duplicado) {
      throw new Error(
        'Já existe um produto cadastrado com esse nome.'
      );
    }

  }


  /*
   * Gera novo ID.
   */

  const idProduto =
    'PROD-' +
    Utilities.getUuid();


  /*
   * Grava o novo produto.
   */

  abaProdutos.appendRow([
    idProduto,
    nome,
    categoriaEncontrada.categoriaId,
    categoriaEncontrada.categoria,
    categoriaEncontrada.subcategoriaId,
    categoriaEncontrada.subcategoria,
    unidade,
    true
  ]);

  SpreadsheetApp.flush();


  return {
    id: idProduto,
    nome: nome,
    categoriaId:
      categoriaEncontrada.categoriaId,
    categoria:
      categoriaEncontrada.categoria,
    subcategoriaId:
      categoriaEncontrada.subcategoriaId,
    subcategoria:
      categoriaEncontrada.subcategoria,
    unidade: unidade
  };

}
function testarUsuarioAtual() {

  const resultado =
    obterUsuarioAtualApp();

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );
}
/**
 * =========================================================
 * 🛒 MODO MERCADO — COMPRA RÁPIDA
 * =========================================================
 */

/**
 * Procura produtos do catálogo pelo nome.
 */


function buscarProdutosPorNomeApp(termo) {

  const normalizar = function(texto) {
    return String(texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const busca = normalizar(termo);

  if (!busca) {
    return [];
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName(MM.ABAS.PRODUTOS);

  if (!aba) {
    throw new Error(
      'A aba 📦 PRODUTOS não foi encontrada.'
    );
  }

  const ultimaLinha = aba.getLastRow();

  if (ultimaLinha < 2) {
    return [];
  }

  const dados = aba.getRange(
    2, 1, ultimaLinha - 1, 8
  ).getValues();

  const palavras = busca.split(' ');

  const produtosAtivos = dados.filter(function(linha) {
    const nome = normalizar(linha[1]);
    const ativo =
      linha[7] === true ||
      String(linha[7]).toUpperCase() === 'TRUE';

    return ativo && nome;
  });

  const resultados = produtosAtivos
    .map(function(linha) {

      const nome = normalizar(linha[1]);
      const nomePalavras = nome.split(' ');

      // Para uma busca genérica por "leite",
      // prioriza leite líquido e evita derivados.
      if (busca === 'leite') {
        const derivado =
          /^creme de leite\b/.test(nome) ||
          /^leite condensado\b/.test(nome) ||
          /^leite em po\b/.test(nome);

        if (derivado) {
          return null;
        }
      }

      let pontuacao = 0;

      // Nome exatamente igual ao termo pesquisado.
      if (nome === busca) {
        pontuacao += 10000;
      }

      // Nome começa com a expressão completa.
      if (nome.startsWith(busca)) {
        pontuacao += 2000;
      }

      // Todos os termos precisam aparecer no nome.
      const todasPalavrasPresentes = palavras.every(
        function(palavra) {
          return nomePalavras.includes(palavra);
        }
      );

      if (todasPalavrasPresentes) {
        pontuacao += 1000;
      } else {
        return null;
      }

      // Premia a correspondência dos termos na ordem falada.
      let posicaoAnterior = -1;
      let termosEmOrdem = true;

      palavras.forEach(function(palavra) {
        const posicao = nomePalavras.indexOf(palavra);

        if (posicao <= posicaoAnterior) {
          termosEmOrdem = false;
        }

        posicaoAnterior = posicao;
      });

      if (termosEmOrdem) {
        pontuacao += 300;
      }

      // Prefere nomes mais curtos quando a correspondência
      // principal é igualmente boa.
      pontuacao -= Math.min(nomePalavras.length, 30);

      return {
        pontuacao: pontuacao,
        linha: linha
      };
    })
    .filter(function(item) {
      return item !== null;
    })
    .sort(function(a, b) {
      return b.pontuacao - a.pontuacao;
    })
    .slice(0, 10)
    .map(function(item) {

      const linha = item.linha;

      return {
        id: String(linha[0] || ''),
        nome: String(linha[1] || ''),
        categoria: String(linha[3] || ''),
        subcategoria: String(linha[5] || ''),
        unidade: String(linha[6] || '')
      };
    });

  return resultados;
}


function registrarCompraRapidaApp(dados) {

  if (!dados) {
    throw new Error(
      'Dados da compra não informados.'
    );
  }

  const idProduto =
    String(
      dados.idProduto || ''
    ).trim();

  const produto =
    String(
      dados.produto || ''
    ).trim();

  const quantidade =
    Number(dados.quantidade);

  const precoUnitario =
    Number(dados.precoUnitario);

  if (!idProduto) {
    throw new Error(
      'Produto não informado.'
    );
  }

  if (!produto) {
    throw new Error(
      'Nome do produto não informado.'
    );
  }

  if (
    !quantidade ||
    quantidade <= 0
  ) {
    throw new Error(
      'A quantidade deve ser maior que zero.'
    );
  }

  if (
    isNaN(precoUnitario) ||
    precoUnitario < 0
  ) {
    throw new Error(
      'Informe um preço válido.'
    );
  }

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const abaItens =
    ss.getSheetByName(
      MM.ABAS.ITENS
    );

  if (!abaItens) {
    throw new Error(
      'A aba 🛒 ITENS_LISTA não foi encontrada.'
    );
  }

  /*
   * Identifica o usuário conectado.
   */
  const usuarioAtual =
    obterUsuarioAtualApp();

  const nomeUsuario =
    usuarioAtual &&
    usuarioAtual.encontrado
      ? usuarioAtual.nome
      : '';

  /*
   * Lista atual.
   */
  const idLista =
    criarListaPadraoApp();

  const agora =
    new Date();

  const total =
    quantidade *
    precoUnitario;

  const ultimaLinha =
    abaItens.getLastRow();

  let linhaEncontrada = null;

  if (ultimaLinha >= 2) {

    const itens =
      abaItens.getRange(
        2,
        1,
        ultimaLinha - 1,
        10
      ).getValues();

    for (
      let i = 0;
      i < itens.length;
      i++
    ) {

      if (
        String(itens[i][1]) ===
          String(idLista) &&
        String(itens[i][2]) ===
          String(idProduto)
      ) {

        linhaEncontrada =
          i + 2;

        break;
      }
    }
  }

  /*
   * =======================================================
   * PRODUTO JÁ ESTÁ NA LISTA
   * =======================================================
   */

  if (linhaEncontrada) {

    abaItens
      .getRange(
        linhaEncontrada,
        5
      )
      .setValue(
        quantidade
      );

    abaItens
      .getRange(
        linhaEncontrada,
        7
      )
      .setValue(
        precoUnitario
      );

    abaItens
      .getRange(
        linhaEncontrada,
        8
      )
      .setValue(true);

    abaItens
      .getRange(
        linhaEncontrada,
        9
      )
      .setValue(agora);

    abaItens
      .getRange(
        linhaEncontrada,
        10
      )
      .setValue(nomeUsuario);

  }

  /*
   * =======================================================
   * PRODUTO NÃO ESTÁ NA LISTA
   * =======================================================
   */

  else {

    const idItem =
      'ITEM-' +
      Utilities.getUuid();

    const abaProdutos =
      ss.getSheetByName(
        MM.ABAS.PRODUTOS
      );

    let unidade =
      'Unidade';

    if (abaProdutos) {

      const ultimaLinhaProduto =
        abaProdutos.getLastRow();

      if (
        ultimaLinhaProduto >= 2
      ) {

        const produtos =
          abaProdutos
            .getRange(
              2,
              1,
              ultimaLinhaProduto - 1,
              8
            )
            .getValues();

        for (
          let i = 0;
          i < produtos.length;
          i++
        ) {

          if (
            String(produtos[i][0]) ===
            String(idProduto)
          ) {

            unidade =
              String(
                produtos[i][6] ||
                'Unidade'
              );

            break;
          }
        }
      }
    }

    abaItens.appendRow([
      idItem,
      idLista,
      idProduto,
      produto,
      quantidade,
      unidade,
      precoUnitario,
      true,
      agora,
      nomeUsuario
    ]);
  }

  /*
   * =======================================================
   * HISTÓRICO DA COMPRA
   * =======================================================
   */

  registrarCompraComPrecoApp({
    idLista:
      idLista,

    produto:
      produto,

    quantidade:
      quantidade,

    precoUnitario:
      precoUnitario,

    total:
      total,

    usuario:
      nomeUsuario,

    data:
      agora
  });

  SpreadsheetApp.flush();

  return {
    sucesso: true,

    produto:
      produto,

    quantidade:
      quantidade,

    precoUnitario:
      precoUnitario,

    total:
      total,

    usuario:
      nomeUsuario,

    listaId:
      idLista,

    itensLista:
      obterListaAtualApp()
  };
}

/**
 * Registra uma compra no histórico
 * sem bloquear compras repetidas.
 */
function registrarCompraComPrecoApp(dados) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const aba =
    ss.getSheetByName(
      MM.ABAS.COMPRAS
    );

  if (!aba) {
    throw new Error(
      'A aba 🧾 COMPRAS não foi encontrada.'
    );
  }

  const idCompra =
    'COMPRA-' +
    Utilities.getUuid();

  const quantidade =
    Number(
      dados.quantidade
    ) || 1;

  const precoUnitario =
    Number(
      dados.precoUnitario
    ) || 0;

  const total =
    Number(
      dados.total
    ) ||
    quantidade *
    precoUnitario;

  aba.appendRow([
    idCompra,
    dados.idLista || '',
    dados.data || new Date(),
    dados.produto || '',
    quantidade,
    precoUnitario,
    total,
    dados.usuario || ''
  ]);

  SpreadsheetApp.flush();

  return idCompra;
}
function testarBuscaCompraRapida() {

  const resultado =
    buscarProdutosPorNomeApp(
      'ovos'
    );

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );
}
function testarCompraRapida() {

  const produtos =
    buscarProdutosPorNomeApp(
      'ovos brancos 12'
    );

  if (!produtos.length) {
    throw new Error(
      'Produto de teste não encontrado.'
    );
  }

  const produto =
    produtos[0];

  const resultado =
    registrarCompraRapidaApp({

      idProduto:
        produto.id,

      produto:
        produto.nome,

      quantidade:
        1,

      precoUnitario:
        12.90
    });

  Logger.log(
    JSON.stringify(
      resultado,
      null,
      2
    )
  );
}