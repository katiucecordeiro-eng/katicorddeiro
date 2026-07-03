-- Conteúdo teórico do Sistema Esquelético.
-- Referência de como o conteúdo foi populado no projeto Supabase conectado.
--
-- No projeto em produção, a "Prancha I" já existia (criada pelo seed.sql)
-- e já tinha uma anotação real de usuário associada via progresso_usuario,
-- então ela foi ATUALIZADA em vez de recriada, para não perder esse dado
-- (progresso_usuario referencia pranchas com ON DELETE CASCADE). Em um
-- ambiente novo, sem essa prancha genérica pré-existente, basta trocar o
-- primeiro UPDATE por um INSERT igual aos demais.

update sistemas set conteudo_teorico = $sis$
{
  "abertura": "O esqueleto é a estrutura que sustenta o corpo, protege os órgãos e serve de alavanca para os músculos. São 206 ossos no adulto, divididos em esqueleto axial (crânio, coluna, tórax) e apendicular (membros e cinturas). Além do suporte, os ossos armazenam minerais (cálcio e fósforo) e abrigam a medula óssea, onde o sangue é produzido.",
  "postits": [
    { "tipo": "info", "texto": "206 ossos no adulto — o recém-nascido tem ~270, que vão se fundindo ao longo do crescimento." }
  ],
  "fechamento": {
    "texto": "O esqueleto não é uma estrutura 'morta' — é um tecido vivo, que se remodela constantemente ao longo da vida, responde a esforço físico (fica mais denso com exercício) e é fundamental para o equilíbrio de cálcio no corpo. Conhecer os ossos é a base para entender articulações, músculos e todos os movimentos.",
    "postit": { "tipo": "info", "texto": "Próximo passo natural de estudo: as articulações (como os ossos se conectam) e o sistema muscular (o que os move)." }
  }
}
$sis$::jsonb
where slug = 'sistema-esqueletico';

-- Prancha I — atualizada em vez de recriada (ver nota acima).
update pranchas set
  numero_prancha = 'Prancha I',
  titulo = 'O Crânio',
  conteudo_teorico = $p1$
{
  "abertura": "O crânio protege o encéfalo e sustenta a face. É formado por 22 ossos (8 do neurocrânio, que envolve o cérebro, e 14 da face). Com exceção da mandíbula, todos são unidos por articulações imóveis chamadas suturas.",
  "blocos": [
    { "subtitulo": "Ossos do neurocrânio", "texto": "Frontal, dois parietais, dois temporais, occipital, esfenoide e etmoide." },
    { "subtitulo": "Ossos da face", "texto": "Maxila, mandíbula, zigomáticos (maçãs do rosto), nasais, entre outros." },
    { "subtitulo": "Estruturas importantes", "texto": "Suturas: coronal (frontal com parietais), sagital (entre os parietais) e lambdóide (parietais com occipital). Forame magno: grande abertura na base do occipital por onde a medula espinhal se conecta ao encéfalo. Órbitas: cavidades que alojam os olhos. Seios paranasais: cavidades cheias de ar que tornam o crânio mais leve e dão ressonância à voz." }
  ],
  "postits": [
    { "tipo": "clinico", "texto": "No bebê, as suturas ainda não estão fechadas — são as fontanelas ('moleiras'). Elas permitem o crescimento do cérebro e o parto. A fontanela anterior fecha por volta dos 18 meses." }
  ],
  "palavras_chave": ["suturas", "forame magno", "neurocrânio", "fontanelas"]
}
$p1$::jsonb
where id in (
  select p.id from pranchas p
  join sistemas s on s.id = p.sistema_id
  where s.slug = 'sistema-esqueletico'
  order by p.criado_em asc
  limit 1
);

insert into pranchas (sistema_id, numero_prancha, titulo, disponivel_no_white, conteudo_teorico)
select id, 'Prancha II', 'A Coluna Vertebral', true, $p2$
{
  "abertura": "A coluna é o eixo central do corpo. Sustenta o peso, permite movimento e protege a medula espinhal, que passa por dentro dela. É formada por 33 vértebras, distribuídas em 5 regiões.",
  "blocos": [
    { "subtitulo": "As 5 regiões", "texto": "Cervical (7 vértebras, C1-C7): pescoço. As duas primeiras têm nomes especiais: atlas (C1) sustenta o crânio, e áxis (C2) permite a rotação da cabeça. Torácica (12, T1-T12): articulam com as costelas. Lombar (5, L1-L5): as maiores e mais robustas, suportam mais peso. Sacro (5 fundidas): formam um único osso. Cóccix (4 fundidas): o 'rabinho', resquício da cauda." },
    { "subtitulo": "As curvaturas", "texto": "Vistas de lado, a coluna não é reta — tem curvas que absorvem impacto. Cervical e lombar curvam para dentro (lordose); torácica e sacral curvam para fora (cifose)." },
    { "subtitulo": "Entre as vértebras", "texto": "Ficam os discos intervertebrais, almofadas de cartilagem que amortecem e permitem flexibilidade." }
  ],
  "postits": [
    { "tipo": "clinico", "texto": "A famosa 'hérnia de disco' acontece quando o núcleo mole do disco intervertebral se desloca e pressiona uma raiz nervosa — comum na região lombar, por ser a que mais carrega peso." },
    { "tipo": "info", "texto": "A medula espinhal termina por volta de L1-L2. Abaixo disso, os nervos continuam soltos formando a 'cauda equina'." }
  ],
  "palavras_chave": ["atlas", "áxis", "lordose", "cifose", "discos intervertebrais"]
}
$p2$::jsonb
from sistemas where slug = 'sistema-esqueletico';

insert into pranchas (sistema_id, numero_prancha, titulo, disponivel_no_white, conteudo_teorico)
select id, 'Prancha III', 'A Caixa Torácica', true, $p3$
{
  "abertura": "A caixa torácica protege coração e pulmões e participa da respiração. É formada pelas costelas, pelo esterno (osso do meio do peito) e pelas vértebras torácicas atrás.",
  "blocos": [
    { "subtitulo": "As costelas (12 pares)", "texto": "Verdadeiras (1ª a 7ª): ligam-se diretamente ao esterno pela cartilagem costal. Falsas (8ª a 10ª): ligam-se ao esterno de forma indireta (a cartilagem delas se une à da costela de cima). Flutuantes (11ª e 12ª): não se ligam ao esterno; ficam 'soltas' na frente." },
    { "subtitulo": "O esterno", "texto": "Tem 3 partes: manúbrio (topo), corpo (meio) e processo xifoide (ponta inferior)." },
    { "subtitulo": "Na respiração", "texto": "Quando inspiramos, os músculos elevam as costelas e o diafragma desce, aumentando o volume do tórax e puxando o ar para dentro." }
  ],
  "postits": [
    { "tipo": "clinico", "texto": "O processo xifoide é a referência para a posição das mãos na massagem cardíaca (RCP) — as compressões são feitas logo acima dele." }
  ],
  "palavras_chave": ["costelas verdadeiras", "costelas falsas", "costelas flutuantes", "esterno", "processo xifoide"]
}
$p3$::jsonb
from sistemas where slug = 'sistema-esqueletico';

insert into pranchas (sistema_id, numero_prancha, titulo, disponivel_no_white, conteudo_teorico)
select id, 'Prancha IV', 'Cíngulo do Membro Superior', true, $p4$
{
  "abertura": "O cíngulo (ou cintura) escapular é o que conecta o braço ao tronco. É formado por dois ossos de cada lado: a escápula (omoplata) e a clavícula.",
  "blocos": [
    { "subtitulo": "Escápula", "texto": "Osso triangular e chato nas costas. Cavidade glenoidal: onde a cabeça do úmero se encaixa (a articulação do ombro). Acrômio e processo coracoide: projeções ósseas para inserção de músculos e ligamentos. Espinha da escápula: a crista que dá para sentir nas costas." },
    { "subtitulo": "Clavícula", "texto": "Osso longo e curvado na frente do ombro. Conecta a escápula ao esterno, funcionando como uma 'escora' que mantém o ombro afastado do tronco." }
  ],
  "postits": [
    { "tipo": "clinico", "texto": "A clavícula é um dos ossos que mais fratura no corpo — geralmente por queda sobre o ombro ou o braço estendido. Por ser superficial, dá para ver e sentir a fratura facilmente." },
    { "tipo": "curiosidade", "texto": "O ombro é a articulação mais móvel do corpo — e justamente por isso, a que mais luxa (sai do lugar)." }
  ],
  "palavras_chave": ["escápula", "clavícula", "cavidade glenoidal", "acrômio"]
}
$p4$::jsonb
from sistemas where slug = 'sistema-esqueletico';

insert into pranchas (sistema_id, numero_prancha, titulo, disponivel_no_white, conteudo_teorico)
select id, 'Prancha V', 'Ossos do Membro Superior', true, $p5$
{
  "abertura": "O membro superior é feito para o movimento e a precisão. Do ombro à mão, articula vários ossos que permitem desde levantar peso até movimentos finos dos dedos.",
  "blocos": [
    { "subtitulo": "Úmero", "texto": "Osso do braço. Encaixa no ombro pela cabeça e no cotovelo pela tróclea e capítulo." },
    { "subtitulo": "Rádio e ulna", "texto": "Os dois ossos do antebraço. A ulna é a do lado do dedo mínimo (forma o cotovelo pelo olécrano); o rádio é a do lado do polegar e gira sobre a ulna, o que permite virar a palma da mão para cima e para baixo." },
    { "subtitulo": "Mão", "texto": "Dividida em: carpo (8 ossos do punho), metacarpo (5 ossos da palma) e falanges (14 ossos dos dedos; cada dedo tem 3, menos o polegar, que tem 2)." }
  ],
  "postits": [
    { "tipo": "info", "texto": "Como decorar? O rádio é o rápido que gira; fica do lado do polegar. A ulna fica do lado do dedo mínimo." },
    { "tipo": "clinico", "texto": "O 'osso da comédia' (aquela fisgada quando batemos o cotovelo) não é osso — é o nervo ulnar passando superficialmente atrás do epicôndilo medial do úmero." }
  ],
  "palavras_chave": ["úmero", "rádio", "ulna", "carpo", "metacarpo", "falanges"]
}
$p5$::jsonb
from sistemas where slug = 'sistema-esqueletico';

insert into pranchas (sistema_id, numero_prancha, titulo, disponivel_no_white, conteudo_teorico)
select id, 'Prancha VI', 'A Pelve', true, $p6$
{
  "abertura": "A pelve conecta o tronco aos membros inferiores, sustenta o peso do corpo quando estamos de pé e protege os órgãos pélvicos (bexiga, órgãos reprodutores, reto). É formada pela fusão de três ossos de cada lado — ílio, ísquio e púbis — que juntos formam o osso do quadril.",
  "blocos": [
    { "subtitulo": "Estruturas importantes", "texto": "Acetábulo: a cavidade onde a cabeça do fêmur se encaixa (articulação do quadril). Crista ilíaca: a borda superior do ílio (onde apoiamos as mãos na cintura). Sínfise púbica: a articulação cartilaginosa que une os dois púbis na frente. Tuberosidade isquiática: os 'ossinhos' sobre os quais sentamos." },
    { "subtitulo": "Diferença entre os sexos", "texto": "A pelve feminina é mais larga, rasa e arredondada — adaptada para a passagem do bebê no parto. A masculina é mais estreita, alta e afunilada." }
  ],
  "postits": [
    { "tipo": "clinico", "texto": "A diferença entre pelve masculina e feminina é tão marcante que é um dos principais critérios usados na antropologia forense para identificar o sexo de um esqueleto." }
  ],
  "palavras_chave": ["ílio", "ísquio", "púbis", "acetábulo", "sínfise púbica"]
}
$p6$::jsonb
from sistemas where slug = 'sistema-esqueletico';

insert into pranchas (sistema_id, numero_prancha, titulo, disponivel_no_white, conteudo_teorico)
select id, 'Prancha VII', 'Ossos do Membro Inferior', true, $p7$
{
  "abertura": "O membro inferior é construído para sustentar peso e permitir a locomoção — ossos mais robustos que os do braço. Do quadril ao pé, formam a base de sustentação de todo o corpo.",
  "blocos": [
    { "subtitulo": "Fêmur", "texto": "O osso da coxa, o mais longo e forte do corpo. A cabeça encaixa no acetábulo; embaixo, os côndilos formam o joelho." },
    { "subtitulo": "Patela", "texto": "A rótula, um osso que fica dentro do tendão do quadríceps e protege o joelho." },
    { "subtitulo": "Tíbia e fíbula", "texto": "Os dois ossos da perna. A tíbia (canela) é a grossa que sustenta o peso; a fíbula é fina, ao lado, e serve mais para inserção muscular e estabilidade do tornozelo." },
    { "subtitulo": "Pé", "texto": "Dividido em: tarso (7 ossos, incluindo o tálus e o calcâneo/osso do calcanhar), metatarso (5 ossos) e falanges (14 ossos dos dedos)." }
  ],
  "postits": [
    { "tipo": "info", "texto": "O fêmur é tão forte que suporta várias vezes o peso do corpo — mas a fratura de fêmur em idosos é grave e comum, geralmente no colo do fêmur, por causa da osteoporose." },
    { "tipo": "curiosidade", "texto": "O calcâneo é o maior osso do pé e o primeiro a tocar o chão quando andamos." }
  ],
  "palavras_chave": ["fêmur", "patela", "tíbia", "fíbula", "tálus", "calcâneo"]
}
$p7$::jsonb
from sistemas where slug = 'sistema-esqueletico';
