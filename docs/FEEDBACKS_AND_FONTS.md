# Revisão dos feedbacks e da tipografia

## Feedbacks

Os 15 arquivos originais de `public/assets/testimonials/` agora aparecem na seção Feedbacks dos Clientes, entre o Grimório e o Epílogo. Não foram recortados nem convertidos em depoimentos inventados. A interface mostra uma, duas ou três capturas por vez conforme a largura, com rolagem horizontal, controles anterior/próximo e ampliação por clique. O modal fecha por botão, clique no fundo ou Escape e devolve o foco ao controle que o abriu.

Não foram inventados nomes, empresas ou notas. Identificação e comentários permanecem como registrados nos prints.

## Fonte efetivamente disponível

A suspeita foi confirmada: o CSS anterior declarava Cinzel e Lora, mas as capturas anteriores usavam Georgia. Declarar uma família não comprova que ela foi carregada.

Busca realizada no projeto, nas fontes instaladas do Windows e do usuário e por arquivos Cinzel/Lora na pasta Eagle Media: nenhum arquivo dessas famílias foi encontrado. O acesso direto ao Google Fonts retornou bloqueio de rede. Uma tentativa de obter os arquivos do repositório público Google Fonts pelo conector GitHub não baixou nada, pois a conexão exigiu reautenticação; nenhum repositório foi modificado.

O carregador `src/fonts.ts` agora prioriza arquivos locais de `src/assets/fonts/`, depois fontes instaladas e somente então Google Fonts. Sem as famílias disponíveis, mantém Georgia e registra explicitamente `data-font-source="fallback"` no HTML. Não foi feita substituição disfarçada de fonte.

Para concluir a tipografia correta, adicionar Cinzel normal variável, Lora normal variável e Lora itálica variável (WOFF2 ou TTF) à pasta `src/assets/fonts/`, conforme seu README, junto às respectivas licenças. O build passa a incluí-las automaticamente; o Vite deve ser reiniciado após adicionar os arquivos.

Verificações desta revisão: `npm run build` e `npm run qa`. Evidências de feedbacks nas três larguras em `docs/screenshots/feedbacks-390.png`, `feedbacks-768.png` e `feedbacks-1440.png`; diagnóstico de fonte efetiva em `docs/screenshots/results.json`.
