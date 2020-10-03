## Feriados

No Brasil existem feriados nacionais, estaduais e municipais. Além disso
alguns feriados não possuem uma data fixa, ou seja, cada ano esses feriados
caem em dias diferentes. Os _Feriados Móveis_ são: Carnaval, Sexta-Feira Santa,
Páscoa e Corpus Christi. Três desses feriados são determinados a partir da data
da Páscoa.

A sexta-feira santa é um feriado nacional, mas as regras do Carnaval e Corpus
Christi variam de acordo com o município.

Regras dos feriados móveis:
- A terça-feira de carnaval ocorre 47 dias antes do domingo de Páscoa
- corpus christi ocorre 60 dias após o domingo de Páscoa
- A sexta-feira santa ocorre 2 dias antes do domingo de Páscoa

A Páscoa é celebrada no primeiro domingo após a primeira lua cheia que ocorre
depois do equinócio de Outono (março). A data em que esse dia cai em um
determinado ano pode ser calculada com o [Algoritmo de Meeus](https://pt.wikipedia.org/wiki/C%C3%A1lculo_da_P%C3%A1scoa#Algoritmo_de_Meeus/Jones/Butcher).
O pseudo-código do algoritmo é o seguinte:
```
 a = ANO MOD 19
 b = ANO \ 100
 c = ANO MOD 100
 d = b \ 4
 e = b MOD 4
 f = (b + 8) \ 25
 g = (b - f + 1) \ 3
 h = (19 × a + b - d - g + 15) MOD 30
 i = c \ 4
 k = c MOD 4
 L = (32 + 2 × e + 2 × i - h - k) MOD 7
 m = (a + 11 × h + 22 × L) \ 451
 MÊS = (h + L - 7 × m + 114) \ 31
 DIA = 1+ (h + L - 7 × m + 114) MOD 31
```

Em que `\` é uma divisão de inteiro, ou seja, `7 \ 3 = 2`.

Os feriados nacionais com data fixa são:

- 01/01 Ano Novo
- 21/04 Tiradentes
- 01/05 Dia do Trabalhador
- 07/09 Independência
- 12/10 Nossa Senhora Aparecida
- 02/11 Finados
- 15/11 Proclamação da República
- 25/12 Natal

O dia da Consciência Negra também é outra exceção peculiar. É um "dia
comemorativo" nacional, mas não é considerado um feriado nacional; esse dia é
decretado feriado municipal em milhares de cidades e é feriado estadual em
alguns estados.

## Solução

O endpoint para consultar feriados deve seguir o seguinte formato:
```
/feriados/CODIGO-IBGE/ANO-MES-DIA/
```

Onde CODIGO-IBGE pode ser um número de dois dígitos, para representar um
feriado estadual ou um número com 7 dígitos para representar um feriado
municipal. Espera-se um ano com 4 números, mês com 2 números e dia também
com 2 números, ou seja, "AAAA-MM-DD".

Esse endpoint responde os seguintes verbos: GET, PUT e DELETE.

Para simplificar o problema, assum-se que pode haver no máximo 1 feriado por dia
em cada município, e que são feitas consultas apenas em dias de semana, de segunda a sexta.

O comportamento esperado do GET é que ele retorne status 200 e o nome do
feriado se existir um feriado no dia especificado.

Exemplo buscando o dia 20 de Novembro no estado do Rio de Janeiro:
```
GET /feriados/33/2020-11-20/
{
    "name": "Consciência Negra"
}
```

Se não houver um feriado no dia para o estado ou município consultado a API
deve retornar 404.

O cadastro de um feriado estadual ou municipal segue estrutura semelhante
à consulta, mas não contém o ano, apenas o mês e dia do feriado.

Exemplo de cadastro do aniversário de São Paulo SP no dia 25 de Janeiro:
```
PUT /feriados/3550308/01-25/
{
    "name": "Aniversário da cidade de São Paulo"
}
```

A API retorna o status 200 para indicar que a requisição foi bem
sucedida. Se já existir um feriado cadastrado neste dia para o estado
ou município especificado, o nome do feriado será atualizado.

Há também a opção de apagar um feriado.

Exemplo de remoção do aniversário de São Paulo:
```
DELETE /feriados/3550308/01-25/
```

O endpoint retorna 404 se esse feriado não existir ou 204 se a requisição
foi aceita e o feriado removido com sucesso.

Uma tentativa de remover um feriado estadual num município deve retornar 403.
Uma tentativa de remover um feriado nacional em um município ou em uma unidade
federativa também deve retornar 403.

O cadastro e remoção de feriados móveis deve tem uma assinatura diferente. No
lugar do dia, é passado o nome do feriado após o código do ibge.

Exemplos:
```
PUT /feriados/5108402/carnaval/
PUT /feriados/4312658/corpus-christi/
```
As requisições acima marcam que a terça-feira de carnaval é feriado em Várzea
Grande e corpus christi é feriado em Não-Me-Toque

No exemplo abaixo a terça-feira de carnaval deixa de ser considerado feriado
em Várzea Grande:
```
DELETE /feriados/5108402/carnaval/
```

## Códigos do IBGE

[No do site do IBGE](https://www.ibge.gov.br/explica/codigos-dos-municipios.php) é possível encontrar duas listas com os Códigos do IBGE para cada estado e município..

Note que os dois primeiros dígitos desse código do IBGE indica qual é o estado
do município. A seguir uma tabela com a relação estado/prefixo extraída
do site do IBGE:

|Prefixo|UF|
|-------|--|
|     12|AC|
|     27|AL|
|     16|AP|
|     13|AM|
|     29|BA|
|     23|CE|
|     53|DF|
|     32|ES|
|     52|GO|
|     21|MA|
|     51|MT|
|     50|MS|
|     31|MG|
|     15|PA|
|     25|PB|
|     41|PR|
|     26|PE|
|     22|PI|
|     33|RJ|
|     24|RN|
|     43|RS|
|     11|RO|
|     14|RR|
|     42|SC|
|     35|SP|
|     28|SE|
|     17|TO|


**Créditos: [Insctruct](https://github.com/instruct-br/teste-backend-remoto) **
