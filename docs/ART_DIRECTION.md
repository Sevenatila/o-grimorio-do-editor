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
| Vídeo | Shorts em 9:16, moldura escura e ouro fosco com cantos SVG |

Cinzel e Lora são carregadas primeiro de `src/assets/fonts/`, depois das fontes instaladas e por último do Google Fonts com `display=swap`. Sem arquivos nem rede, Georgia garante leitura. A validação confirmou que as famílias desejadas não estão disponíveis nesta máquina; a tipografia definitiva requer seus arquivos WOFF2/TTF. Nenhum título está embutido em imagem; os prints de feedback preservam as conversas originais fornecidas pelo usuário.

## Composição e responsividade

- Mobile: vídeo antes de h1 e CTA; biografia antes da gravura; acervo amplo; habilidades em duas colunas com a última ocupando toda a linha; feedback e contato em sequência.
- Tablet: mantém a leitura vertical, amplia margens e corpo dos cards.
- A partir de 1050px: header com navegação exposta; hero editorial em duas colunas; Jornada com texto e gravura; habilidades em três colunas; contato com cena lateral. Área máxima: 1320px.
- Capitulares D/A/O/F/V em caixas bordô de 68–84px; primeira letra real da frase. O título do arsenal inclui espaço após o O. Sem marcadores romanos.
- Ornamentos restritos aos cantos, capitulares e divisórias. Textura SVG suave, sem moldura grande que ocupe a área dos vídeos.
- Setas de CTAs, links e navegação são SVGs de traço fino com `currentColor`, em vez de caracteres que possam receber aparência de emoji no sistema.

## Mídia e conteúdo

As três cenas e a textura de pergaminho foram geradas com `image_gen` a pedido do usuário, seguindo a referência visual original. São ilustrações decorativas: não representam um retrato de Marcos, clientes ou resultados. Os PNGs gerados estão preservados em `artwork/generated/`, com prompts finais em `artwork/GENERATION.md`. O site usa arquivos WebP em `public/assets/art/`, incluindo variantes menores para a Jornada e o Epílogo no celular. Os antigos SVGs e as referências permanecem preservados.

Os 15 prints recebidos em `public/assets/testimonials/` são exibidos no carrossel de feedbacks, com ampliação dos originais. Não se deduzem nomes, empresas ou notas a partir de contexto ambíguo. A inclusão dos prints foi solicitada explicitamente pelo usuário.

O acervo agora contém os seis Shorts enviados pelo usuário, na ordem recebida. O vídeo `9FwdP60SSpc` é o destaque inicial por escolha explícita. Títulos e miniaturas foram consultados no oEmbed oficial do YouTube em 28/10/2026; miniaturas preservadas em `public/assets/videos/`. Categoria factual: Shorts. Não foram criados clientes, resultados nem descrições adicionais a partir dos títulos.

O destaque e o acervo respeitam a proporção vertical 9:16. A capa principal usa a nova ilustração do editor em um scriptorium; o vídeo continua sendo `9FwdP60SSpc`. As capas do acervo são miniaturas oficiais em alta resolução, preservando os arquivos anteriores. Molduras, botão circular de play e acabamento em bordô e ouro são CSS/SVG; no desktop, a descrição do acervo ocupa uma segunda coluna em um painel escuro. Microanimações respeitam reduced-motion.

O iframe do destaque é preparado por trás da capa; o do acervo usa `loading="lazy"`. Ambos iniciam com `autoplay=0`. A API oficial do YouTube mantém o player pronto e `playVideo()` é enviado no clique/toque do usuário. Um clique ocorrido antes de `onReady` é lembrado e executado quando o player fica pronto. Não há reprodução na abertura da página nem silenciamento automático. Integração conforme a [documentação oficial da IFrame API](https://developers.google.com/youtube/iframe_api_reference).

Abrir outro vídeo chama `stopVideo()` no anterior e restaura sua capa. “Voltar à capa” interrompe o player e devolve o foco ao play. A troca de projeto destrói o player anterior e cancela pedidos pendentes. Cada item mantém link direto para o YouTube, em dourado sobre fundo escuro. Controles internos e tela cheia permanecem os do YouTube. Falha de conexão e bloqueio de reprodução pelo navegador têm mensagem explícita e link alternativo; configurações restritivas do navegador não são contornadas.

Players HTML5 continuam disponíveis para fontes MP4/WebM, com poster, controles nativos, preload none, carregamento de arquivo local sem upload e erro legível. Configurar mídias em `src/data/content.ts`. Adicionar legendas WebVTT pelo campo `captions` quando usar arquivos diretos; no YouTube, as legendas dependem do vídeo original.

WhatsApp depende de `VITE_WHATSAPP_NUMBER`. Sem número, o CTA apresenta aviso de disponibilidade futura. Não há número fictício.

## Engenharia e movimento

React, Vite, TypeScript, componentes sem biblioteca de UI. Dados centralizados em `src/data/content.ts`. Build estático em `dist/`.

GSAP 3.12.5 e ScrollTrigger são carregados sob demanda via CDN, com tratamento de falha e conteúdo inicialmente visível. A rede do executor bloqueou npm e não havia GSAP local; essa dependência está declarada, mas a cópia local ainda não foi instalada. Em ambiente conectado, instalar GSAP e preferir imports locais para remover dependência do CDN. Sem rede ou com reduced-motion, a página permanece estática e funcional. Os reveals só afetam blocos introdutórios, com 14px / 650ms e execução única.

Dependências do build foram copiadas de instalações locais existentes, sem alterar os projetos de origem. `scripts/prepare-offline.py` registra esse procedimento específico desta máquina; instalação portátil é `npm install`. Sem lockfile gerado enquanto o registro npm estiver inacessível.

## Referências externas

Consultado o [acervo de manuscritos do Metropolitan Museum](https://www.metmuseum.org/art/collection/search?department=Medieval+Art+and+The+Cloisters&material=Manuscripts), como contexto de pigmentos, iniciais e composição. Nenhuma obra externa foi copiada. Behance retornou bloqueio 403/indisponibilidade e Awwwards não respondeu; não foram usados como fontes visuais verificadas.
