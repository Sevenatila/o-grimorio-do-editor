# O Grimório do Editor

Protótipo React + Vite + TypeScript na pasta original do projeto.

```sh
npm ci
npm run dev
npm run build
```

Acesse o endereço exibido pelo Vite (padrão http://127.0.0.1:5173). O build estático fica em `dist/`.

Conteúdo e projetos: `src/data/content.ts`. Os seis Shorts enviados estão em `selectedVideos`, com títulos oficiais e miniaturas locais em `public/assets/videos/`. O destaque inicial usa `9FwdP60SSpc`, conforme a seleção do usuário. O player do YouTube é preparado por trás da capa, sem reprodução automática, e o botão envia `playVideo()` no próprio clique/toque. O acervo usa carregamento do iframe sob demanda. Há controles, tela cheia e link para abrir o vídeo no YouTube. A ordem enviada e a proporção vertical 9:16 são preservadas.

Configure `.env` a partir de `.env.example`: `VITE_WHATSAPP_NUMBER` com DDI/DDD e, opcionalmente, `VITE_DEMOREEL_URL` com arquivo local público ou URL direta de vídeo para substituir o YouTube no destaque inicial. Para novos projetos, use `youtubeId` para vídeos YouTube, ou `src` para MP4/WebM, `poster` e, quando disponível, `captions` com WebVTT. Sem fonte configurada, o player HTML5 continua permitindo experimentar um arquivo local sem upload.

Painel de administração: `/admin`, sem senha nesta versão. Edite textos, vídeos, feedbacks, imagens, aparência e contato; confira a prévia e use **Salvar alterações** para publicar. O conteúdo salvo persiste no Vercel Blob e aparece para os visitantes. Os valores originais continuam em `src/data/content.ts`. Instruções e limites em `docs/ADMIN.md`.

A composição de computador usa artes próprias, mantendo as imagens anteriores no celular. Cenário da abertura e imagem de contato do computador são editáveis na aba Aparência. `npm run qa:desktop` valida sete larguras, carregamento responsivo das imagens, menu, miniaturas por mouse/teclado e compatibilidade com conteúdo antigo. Execute com o servidor local ativo e `QA_BASE_URL` apontando para ele; as evidências ficam em `docs/screenshots/desktop/`.

O projeto agora inclui `package-lock.json`; use `npm ci` para uma instalação reproduzível. Em desenvolvimento sem token do Blob, o painel salva em `.tools/admin/content.json`; na Vercel, utiliza a credencial do servidor vinculada ao projeto. Fontes Google e GSAP/ScrollTrigger via CDN exigem conexão; sem ela, a página mantém fontes serifadas de fallback e conteúdo estático.

Artes geradas: originais em `artwork/generated/`, arquivos usados no site em `public/assets/art/` e prompts finais em `artwork/GENERATION.md`. Caminhos e textos alternativos das cenas estão em `src/data/content.ts`. A nova capa ilustrada do destaque mantém o vídeo principal selecionado; as capas do acervo são as miniaturas oficiais em alta resolução.

QA: execute o servidor e `npm run qa`. O script utiliza Playwright e Edge nesta máquina; em outra, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE` apontando para seu Chromium. Capturas atuais ficam em `docs/screenshots/one-click/layout/`; as revisões anteriores permanecem separadas. `npm run qa:youtube` exige acesso ao YouTube e confirma reprodução com som após um único clique/toque, sem acionar o play interno nem chamar métodos de reprodução pelo teste. Evidência em `docs/screenshots/one-click/playback.json`. Use `QA_BASE_URL` para testar outro endereço.

Veja `docs/ART_DIRECTION.md`, `docs/IMAGE_PROMPTS.md` e `docs/QA.md`. As skills específicas deste projeto estão em `skills/`; não foram instaladas globalmente.

Teste do painel: com o servidor ativo, execute `npm run qa:admin` usando `QA_BASE_URL` se necessário. Os cadastros usados no teste são locais e o conteúdo original é restaurado ao final; o script recusa um domínio público.
