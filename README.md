# O Grimório do Editor

Protótipo React + Vite + TypeScript na pasta original do projeto.

```sh
npm install
npm run dev
npm run build
```

Acesse o endereço exibido pelo Vite (padrão http://127.0.0.1:5173). O build estático fica em `dist/`.

Conteúdo e projetos: `src/data/content.ts`. Os seis Shorts enviados estão em `selectedVideos`, com títulos oficiais e miniaturas locais em `public/assets/videos/`. O destaque inicial usa `9FwdP60SSpc`, conforme a seleção do usuário. O YouTube é carregado ao clicar, com controles e tela cheia; há também um link para abrir o vídeo no YouTube. O acervo preserva a ordem enviada e usa proporção vertical 9:16.

Configure `.env` a partir de `.env.example`: `VITE_WHATSAPP_NUMBER` com DDI/DDD e, opcionalmente, `VITE_DEMOREEL_URL` com arquivo local público ou URL direta de vídeo para substituir o YouTube no destaque inicial. Para novos projetos, use `youtubeId` para vídeos YouTube, ou `src` para MP4/WebM, `poster` e, quando disponível, `captions` com WebVTT. Sem fonte configurada, o player HTML5 continua permitindo experimentar um arquivo local sem upload.

Fontes Google e GSAP/ScrollTrigger via CDN exigem conexão; sem ela, a página mantém fontes serifadas de fallback e conteúdo estático. GSAP deve passar para import local depois de instalado em um ambiente com acesso ao npm. As dependências do build desta execução foram recuperadas de instalações locais, pois a rede foi bloqueada; não foi possível gerar lockfile pelo registro.

QA: execute o servidor e `npm run qa`. O script utiliza Playwright e Edge nesta máquina; em outra, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE` apontando para seu Chromium. Screenshots e evidências ficam em `docs/screenshots/`.

Veja `docs/ART_DIRECTION.md`, `docs/IMAGE_PROMPTS.md` e `docs/QA.md`. As skills específicas deste projeto estão em `skills/`; não foram instaladas globalmente.
