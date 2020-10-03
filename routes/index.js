var express = require('express');
const pgsql = require('../db');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Instruct' });
});

router.get('/feriados/:id/:data', async function(req, res) {
  const { id, data } = req.params;
  var cod_cidade;
  var cod_estado;
  var data_semano;
  var select  = ';'

  if(data.length > 5){
    data_semano = data.substring(5,data.length)
  }else{
    data_semano = data;
  }
  try{
    if(id.length > 2){
        cod_cidade = id;
        cod_estado = id.substring(0,2);
        tipo_feriado = 2;
        select = 'select nome_feriado from feriados where (data_feriado = $1 and (case when tipo_feriado = 0 then true else (cod_cidade = $2 or cod_estado = $3) end)) limit 1';
        values = [data_semano, cod_cidade, cod_estado];
    }else{
        cod_estado = id;
        cod_cidade = null;
        tipo_feriado = 1;
        select = 'select nome_feriado from feriados where (data_feriado = $1 and (case when tipo_feriado = 0 then true else cod_estado = $2 end)) limit 1';
        values = [data_semano, cod_estado];

    }
  

    const { rows } = await pgsql.query(select, values);
    
    if(rows.toString() == ''){
      res.status(404).send();
    }else{
      var feriado_nacional = rows[0].nome_feriado
      res.send({name: feriado_nacional});
    }
  }catch(ex){
    res.status(404).send();
  }

});

router.put('/feriados/:id/:data', async function(req, res) {
  const { id, data } = req.params;
  var cod_cidade;
  var cod_estado;
  var data_semano;
  var tipo_feriado = 0;
  var select  = ';'
  var messageCode =  200;

  var nome_feriado = req.query.name == null ? req.body.name : req.query.name;

  if(id.length > 2){
      cod_cidade = id;
      cod_estado = null;
      tipo_feriado = 2;
  }else{
      cod_estado = id;
      cod_cidade = null;
      tipo_feriado = 1;
  }

  if(new Date(data).valueOf()){
    if(data.length > 5){
      data_semano = data.substring(5,data.length)
    }else{
      data_semano = data;
    }
  }else{
    var ano = new Date().getFullYear();
    var dataFeriadoVariavel;
    data_semano = new Array();
    var i;
    for(i = 0; i < 2; i++){
      dataFeriadoVariavel = calculaFeriadoVariavel(data, parseInt(ano+i));
      data_semano.push( dataFeriadoVariavel[1]);
    }
    nome_feriado = dataFeriadoVariavel[0];

    if(nome_feriado == ''){
      res.status(404).send();
    }
  }

  try{
    if(Array.isArray(data_semano) && data_semano.length > 0){
      data_semano.forEach((val) => {
         insertFeriados(val, nome_feriado, tipo_feriado, cod_cidade, cod_estado)
                                    .then((val) => {messageCode = val});
      })
    }else{
      insertFeriados(data_semano, nome_feriado, tipo_feriado, cod_cidade, cod_estado)
                                  .then((val) => {messageCode = val});
    }
    // console.log({messageCode: messageCode});
    res.status(messageCode).send();

  }catch(e){
    pgsql.query('ROLLBACK');
    res.status(404).send();
  }

});

router.delete('/feriados/:id/:data', async function(req, res) {
  const { id, data } = req.params;
  var cod_cidade;
  var cod_estado;
  var data_semano;
  var tipo_feriado = 0;

  if(id.length > 2){
      cod_cidade = id;
      cod_estado = null;
      tipo_feriado = 2;
  }else{
      cod_estado = id;
      cod_cidade = null;
      tipo_feriado = 1;
  }

  if(new Date(data).valueOf()){
    if(data.length > 5){
      data_semano = data.substring(5,data.length)
    }else{
      data_semano = data;
    }
  }else{
    data_semano = new Array();
    var ano = new Date().getFullYear();
    var dataFeriadoVariavel = calculaFeriadoVariavel(data, ano);
    data_semano = dataFeriadoVariavel[1];
    nome_feriado = dataFeriadoVariavel[0];
  }

  try{
    console.log(dataFeriadoVariavel);
    const { rows } = await pgsql.query('select cod_feriados, tipo_feriado from feriados where (data_feriado = $1 and (cod_cidade = $2 or cod_estado = $3)) or (data_feriado = $1 and (cod_cidade is null or cod_estado is null)) limit 1', [data_semano, cod_cidade, cod_estado]);

    if(rows.toString() == ''){
      res.status(404).send();
    }else{
      if(rows[0].tipo_feriado == 0){
        res.status(403).send();

      }else if(rows[0].tipo_feriado == 1 && id.length > 2){
        res.status(403).send();
      }else{
        const sqlDelete = 'delete from feriados where cod_feriados = $1';
        const valuesDelete = [rows[0].cod_feriados];
        await pgsql.query(sqlDelete, valuesDelete);
        res.status(204).send();
      }
      pgsql.query('COMMIT');
    }
  }catch(e){
    pgsql.query('ROLLBACK');
    res.status(404).send();
  }

});


const calculaDataPascoa = (ano) =>{
  const ANO = ano;

  var a = ANO % 19;
  var b = parseInt(ANO / 100);
  var c = ANO % 100;
  var d = parseInt(b / 4);
  var e = b % 4;
  var f = parseInt((b + 8) / 25);
  var g = parseInt((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30;
  var i = parseInt(c / 4);
  var k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  var m = parseInt((a + 11 * h + 22 * L) / 451);
  const MES = parseInt((h + L - 7 * m + 114) / 31);
  const DIA = 1+ (h + L - 7 * m + 114) % 31;

  return String(ANO) + '-' + String(MES) + '-' + String(DIA);
}

const calculaFeriadoVariavel = (data, ano) =>{
  var dataPascoa = calculaDataPascoa(ano);
  var pascoa = new Date(dataPascoa);
  var dataAux;
  var nome_feriado = '';
  var dia;
  var mes;
  var data_semano = '';


  if(data.toLowerCase() == 'corpus-christi'){
    dataAux = new Date(pascoa.setDate(pascoa.getDate() + 60));
    nome_feriado = 'Corpus Christi';
    mes = String(dataAux.getMonth()+1)
    dia = String(dataAux.getDate());
    data_semano = (mes.length > 1 ? mes : '0'+mes) + '-' + (dia.length > 1 ? dia : '0'+dia);

  }else if(data.toLowerCase() == 'carnaval'){
    dataAux = new Date(pascoa.setDate(pascoa.getDate() - 47));
    nome_feriado = 'Carnaval';
    mes = String(dataAux.getMonth()+1)
    dia = String(dataAux.getDate());
    data_semano = (mes.length > 1 ? mes : '0'+mes) + '-' + (dia.length > 1 ? dia : '0'+dia);

  }else if(data.toLowerCase() == 'sexta-feira-santa'){
    dataAux = new Date(pascoa.setDate(pascoa.getDate() - 2));
    nome_feriado = 'Sexta-Feira Santa';
    mes = String(dataAux.getMonth()+1)
    dia = String(dataAux.getDate());
    data_semano = (mes.length > 1 ? mes : '0'+mes) + '-' + (dia.length > 1 ? dia : '0'+dia);

  }else if(data.toLowerCase() == 'pascoa'){
    nome_feriado = 'Páscoa';
    mes = String(pascoa.getMonth()+1)
    dia = String(pascoa.getDate());
    data_semano = (mes.length > 1 ? mes : '0'+mes) + '-' + (dia.length > 1 ? dia : '0'+dia);

  }

  return [nome_feriado, data_semano];
}

const insertFeriados = async (data_semano, nome_feriado, tipo_feriado, cod_cidade, cod_estado) => {
  const { rows } = await pgsql.query('select cod_feriados from feriados where (data_feriado = $1 and (cod_cidade = $2 or cod_estado = $3)) limit 1', [data_semano, cod_cidade, cod_estado]);

  if(rows.toString() == ''){

    const sqlInsert = 'insert into feriados(nome_feriado, tipo_feriado, data_feriado, cod_cidade, cod_estado) values($1, $2, $3, $4, $5)';
    const valuesInsert = [nome_feriado, tipo_feriado, data_semano, cod_cidade, cod_estado];

    await pgsql.query(sqlInsert, valuesInsert);
    pgsql.query('COMMIT');
    // res.status(200).send();
    return 200;
  }else{
    const sqlUpdate = 'update feriados set nome_feriado = $1 where cod_feriados = $2';
    const valuesUpdate = [nome_feriado, rows[0].cod_feriados];

    await pgsql.query(sqlUpdate, valuesUpdate);
    pgsql.query('COMMIT');
    // res.status(201).send();
    return 201;
  }
}

module.exports = router;
