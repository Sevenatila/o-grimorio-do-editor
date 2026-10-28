# Primeira auditoria — 28/10/2026

## Renovação visual: players e quatro artes geradas — 28/10/2026

- Quatro imagens criadas com a ferramenta integrada `image_gen`: capa do editor no scriptorium, gravura da cidade para a Jornada, mesa com livros e vela para o Epílogo e textura de pergaminho. Originais PNG em `artwork/generated/`; prompts finais e proveniência em `artwork/GENERATION.md`; WebP e variantes menores para celular em `public/assets/art/`. Referências e SVGs anteriores preservados.
- Os Shorts agora usam 9:16 também no destaque principal, mantendo `9FwdP60SSpc`. Botão SVG de play em bordô e dourado, moldura com contraste adequado, capa ilustrada no destaque e miniaturas oficiais de maior resolução no acervo. No tablet e desktop, o acervo apresenta vídeo e título em duas colunas dentro de um painel escuro.
- `npm run build`: aprovado. `npm run qa`: aprovado em 390, 768 e 1440px. Sem overflow horizontal nem exceções JavaScript; sete habilidades, capitulares e ordem das seções preservadas. Conferidos seis destinos do YouTube, CTA do destaque, teclado, foco, navegação do acervo, feedbacks e contato.
- A ação “Voltar à capa” desmonta o iframe e restaura o foco ao play; ao iniciar outro vídeo, o player anterior é interrompido. A animação suave das capas não é aplicada com reduced-motion.
- As capturas finais das três larguras foram abertas e comparadas com a referência. As novas cenas respeitam proporções 5:3 e 2:1 no celular; a altura responsiva foi corrigida para impedir recortes acidentais. Textos e botões permanecem em HTML/React. A textura tem contraste baixo para manter a leitura.
- Evidências atuais em `docs/screenshots/visual-refresh/`, incluindo página completa, recortes do destaque/acervo e `results.json`. As capturas da revisão anterior permanecem separadas. Uma tentativa de sobrescrever uma captura anterior falhou na abertura do arquivo no Windows; a execução final em diretório separado foi concluída.
- Limites: o QA responsivo bloqueia HTTPS externo deliberadamente e usa fontes em fallback. Os controles internos, anúncios e opções do YouTube permanecem sob responsabilidade do serviço; o acabamento do site é aplicado à capa, moldura, layout e ações externas. As artes são decorativas e não representam retrato real de Marcos nem novos trabalhos de clientes.

## Atualização: seis vídeos do YouTube — 28/10/2026

- Os seis links enviados substituem os slots demonstrativos. O destaque inicial usa `9FwdP60SSpc`, por escolha do usuário; o acervo conserva os seis vídeos na ordem recebida. Títulos e miniaturas confirmados no oEmbed oficial do YouTube.
- `npm run build`: aprovado. `npm run qa`: aprovado em 390, 768 e 1440px, sem overflow horizontal nem erros JavaScript. O teste cobre os seis destinos, CTA do destaque, foco do iframe, miniaturas locais, navegação circular, filtro Shorts, proporção 9:16 do acervo e interrupção do player anterior.
- Teste adicional com acesso real ao YouTube: reprodução iniciada com sucesso no destaque e em cada um dos seis itens do acervo, confirmando avanço de `currentTime`, `paused: false` e `readyState: 4`. Evidência em `docs/screenshots/youtube-playback.json`. Esse teste confirma início da reprodução, não visualização integral dos vídeos.
- As três capturas completas foram abertas e comparadas com a referência. A moldura do destaque permanece horizontal; o player do acervo é vertical e centralizado. Capitulares, sete habilidades e ordem dos feedbacks permanecem corretos.
- O QA responsivo continua bloqueando HTTPS externo e usando fontes em fallback deliberadamente. A reprodução real foi verificada separadamente. Reprodução futura e legendas dependem da disponibilidade e permissões dos vídeos no YouTube; cada item possui link para abrir o original.
- As seções abaixo registram versões anteriores. Pendências antigas de vídeos demonstrativos e testes de upload sintético não descrevem os atuais players do YouTube. O player HTML5 continua disponível para fontes diretas, mas o teste de upload sintético anterior não foi reexecutado nesta revisão.

## Revalidação para envio ao GitHub — 28/10/2026

- `npm run build`: aprovado (TypeScript e build de produção Vite).
- `npm run qa`: aprovado em 390, 768 e 1440px, incluindo navegação, feedbacks, ausência de overflow e upload/reprodução de vídeo sintético exclusivo do teste.
- Capturas atualizadas em `docs/screenshots/`. As limitações de fontes em fallback e de conteúdo/mídia final descritas abaixo continuam aplicáveis; o QA bloqueia HTTPS externo deliberadamente.

## Revisão posterior: feedbacks e fontes

Os 15 prints locais substituem o card pendente. O teste foi ampliado para decodificar todas as imagens, navegar no carrossel, abrir a última captura, fechar por Escape e por botão e verificar a restauração de foco. A fonte efetiva continua em fallback por ausência de Cinzel/Lora locais e bloqueio externo; agora o carregador prioriza arquivos locais e expõe o diagnóstico real. Detalhes em `docs/FEEDBACKS_AND_FONTS.md`. As observações abaixo descrevem a primeira versão; screenshots e results.json são atualizados pela revisão mais recente.

## Verificações executadas

- `npm run build`: TypeScript sem erros e build Vite de produção concluído. Bundle JS aproximado: 163 kB (53 kB gzip), CSS: 15 kB (4 kB gzip).
- Servidor Vite em `http://127.0.0.1:5173/`, resposta HTTP 200 verificada.
- Playwright 1.50.1, Microsoft Edge headless instalado na máquina. A primeira tentativa com o Chromium disponível foi substituída por Edge para obter execução estável.
- Capturas completas em 390, 768 e 1440px, abertas e examinadas visualmente. Comparação com o mockup local já examinado.
- Largura do documento igual à largura da viewport nas três resoluções: sem overflow horizontal.
- Ordem das seções verificada: hero, Jornada, Acervo, Grimório, Feedbacks, Epílogo.
- Títulos completos verificados por `textContent`, incluindo `De`, `Acervo`, `O meu`, `Feedbacks` e `Vamos`, sem letras duplicadas.
- Sete habilidades presentes. Descrições integrais, grid em duas colunas no mobile e última habilidade em linha completa.
- Vídeo antes do texto no hero a 390 e 768px. Composição editorial em duas colunas no desktop.
- Menu mobile abre e fecha; Escape fecha e devolve foco ao botão.
- Navegação ao próximo projeto e filtro Comercial funcionam; retorno a Todos restaura o primeiro slot.
- CTA sem telefone configurado abre e fecha o aviso de disponibilidade futura, sem criar link fictício.
- Vídeo WebM sintético gravado via canvas exclusivamente para QA, carregado pelo input local, reproduzido e pausado no player HTML5. Overlay de mídia pendente removido após seleção. Nenhum vídeo sintético foi publicado no acervo.
- Nenhuma exceção JavaScript de página nos testes das três larguras.

Evidências: `docs/screenshots/viewport-390.png`, `docs/screenshots/viewport-768.png`, `docs/screenshots/viewport-1440.png` e `docs/screenshots/results.json`. Script reproduzível: `npm run qa` com servidor ativo.

## Revisão visual e ajustes

Hero mantém o contraste escuro do mockup, com bordas douradas finas e player prioritário. Seções claras usam pergaminho, títulos bordô e capitulares reais. O acervo tem área ampla no desktop e moldura compacta no mobile. Feedback fica entre habilidades e contato; o card é um bloco próprio, sem empilhamento absoluto. A primeira revisão aumentou o corpo dos cards mobile para 13px, corrigiu o espaço semântico após o O do arsenal e reduziu a mensagem de feedback pendente.

A composição e as cores seguem a referência. A fidelidade das gravuras, textura e ornamentação ainda depende de assets finais: os SVGs são placeholders simples e não reproduzem o detalhamento pictórico do mockup. A referência mostra uma biografia menor; o protótipo mantém a continuação integral do PDF, portanto a seção é mais longa.

## Limitações verificadas

- Registro npm inacessível (`EACCES`); dependências disponíveis foram copiadas de instalações locais para `node_modules`. Nenhum projeto de origem foi modificado. GSAP não estava entre elas.
- QA bloqueia deliberadamente requisições HTTPS externas para testar funcionamento offline. As capturas usam fallback serifado; `loadedFontFaces` registra as fontes efetivamente carregadas. `document.fonts.check` isoladamente não comprova download de fonte.
- Cinzel/Lora via Google Fonts e reveals GSAP/ScrollTrigger via CDN não foram validados com rede. Sem eles a página permanece funcional e estática. Para fechar a entrega definitiva, hospedar fontes e GSAP localmente e revisar novamente a tipografia/motion.
- O teste do contato confirma apenas o estado sem número; não houve envio de mensagem nem validação de um número real.
- Vídeos reais, posters finais, legendas e identificação dos depoimentos permanecem pendentes. Os 15 prints foram preservados e alguns foram inspecionados; contexto ambíguo não foi convertido em atribuição pública.
- As duas skills locais tiveram a estrutura de frontmatter verificada. O validador Python oficial foi tentado, mas não executou a validação por falta do módulo PyYAML.
- Não foi feita auditoria automatizada completa WCAG nem teste em dispositivos físicos.
