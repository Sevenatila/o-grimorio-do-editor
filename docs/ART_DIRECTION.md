# O Grimório do Editor — direção de arte

## Fontes e prioridades

O prompt mais recente rege capitulares e ordem das seções. Conteúdo factual extraído de `references/Portfolio Layout  (1).pdf` com o script `scripts/extract-briefing.py`; transcrição em `docs/BRIEFING_EXTRACTED.txt`. Referência visual examinada: `references/Portfólio do Grimório do Editor.png` (duas colunas representando a continuação de uma página mobile). Não há referência desktop independente.

O mockup orienta hero escuro, papel ocre, capitulares bordô e molduras douradas. O PDF é preservado integralmente na biografia, introdução do arsenal e sete descrições. A alteração aprovada substitui os números romanos por capitulares que completam o texto do título. Os títulos são texto HTML e os SVGs ornamentais têm `aria-hidden`.

## Tokens

| Função | Valor |
| --- | --- |
| Pergaminho | #E8D7B3 |
| Tinta | #39291E |
| Ouro fosco | #A3874F |
| Bordô | #722C32 |
| Preto quente | #120C09 |
| Títulos | Cinzel, Georgia, serif |
| Corpo | Lora, Georgia, serif |
| Espaço lateral | clamp(24px, 5vw, 72px) |
| Espaço entre seções | 34px mobile, 50px tablet/desktop |
| Corpo | 16px; descrições compactas em grid: 13px mobile |
| Vídeo | 16:9, borda fina com cantos SVG sobrepostos |

Cinzel e Lora são carregadas primeiro de `src/assets/fonts/`, depois das fontes instaladas e por último do Google Fonts com `display=swap`. Sem arquivos nem rede, Georgia garante leitura. A validação confirmou que as famílias desejadas não estão disponíveis nesta máquina; a tipografia definitiva requer seus arquivos WOFF2/TTF. Nenhum título está embutido em imagem; os prints de feedback preservam as conversas originais fornecidas pelo usuário.

## Composição e responsividade

- Mobile: vídeo antes de h1 e CTA; biografia antes da gravura; acervo amplo; habilidades em duas colunas com a última ocupando toda a linha; feedback e contato em sequência.
- Tablet: mantém a leitura vertical, amplia margens e corpo dos cards.
- A partir de 1050px: header com navegação exposta; hero editorial em duas colunas; Jornada com texto e gravura; habilidades em três colunas; contato com cena lateral. Área máxima: 1320px.
- Capitulares D/A/O/F/V em caixas bordô de 68–84px; primeira letra real da frase. O título do arsenal inclui espaço após o O. Sem marcadores romanos.
- Ornamentos restritos aos cantos, capitulares e divisórias. Textura SVG suave, sem moldura grande que ocupe a área dos vídeos.

## Mídia e conteúdo

SVGs locais são ilustrações provisórias, não imagens finais do cliente. Os 15 prints recebidos em `public/assets/testimonials/` são exibidos no carrossel de feedbacks, com ampliação dos originais. Não se deduzem nomes, empresas ou notas a partir de contexto ambíguo. A inclusão dos prints foi solicitada explicitamente pelo usuário. O acervo de três slots é demonstrativo; categorias refletem os slots, não trabalhos confirmados. Não foi possível extrair os vídeos do canal por bloqueio de rede.

Players HTML5 com poster, controles nativos, preload none, carregamento de arquivo local sem upload, erro legível e pausa de outros players. Configurar fontes em `src/data/content.ts`. Adicionar legendas WebVTT aos vídeos definitivos pelo campo `captions`.

WhatsApp depende de `VITE_WHATSAPP_NUMBER`. Sem número, o CTA apresenta aviso de disponibilidade futura. Não há número fictício.

## Engenharia e movimento

React, Vite, TypeScript, componentes sem biblioteca de UI. Dados centralizados em `src/data/content.ts`. Build estático em `dist/`.

GSAP 3.12.5 e ScrollTrigger são carregados sob demanda via CDN, com tratamento de falha e conteúdo inicialmente visível. A rede do executor bloqueou npm e não havia GSAP local; essa dependência está declarada, mas a cópia local ainda não foi instalada. Em ambiente conectado, instalar GSAP e preferir imports locais para remover dependência do CDN. Sem rede ou com reduced-motion, a página permanece estática e funcional. Os reveals só afetam blocos introdutórios, com 14px / 650ms e execução única.

Dependências do build foram copiadas de instalações locais existentes, sem alterar os projetos de origem. `scripts/prepare-offline.py` registra esse procedimento específico desta máquina; instalação portátil é `npm install`. Sem lockfile gerado enquanto o registro npm estiver inacessível.

## Referências externas

Consultado o [acervo de manuscritos do Metropolitan Museum](https://www.metmuseum.org/art/collection/search?department=Medieval+Art+and+The+Cloisters&material=Manuscripts), como contexto de pigmentos, iniciais e composição. Nenhuma obra externa foi copiada. Behance retornou bloqueio 403/indisponibilidade e Awwwards não respondeu; não foram usados como fontes visuais verificadas.
