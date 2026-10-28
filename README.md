# O Grimório do Editor

Protótipo React + Vite + TypeScript na pasta original do projeto.

```sh
npm install
npm run dev
npm run build
```

Acesse o endereço exibido pelo Vite (padrão http://127.0.0.1:5173). O build estático fica em `dist/`.

Conteúdo e projetos: `src/data/content.ts`. Configure `.env` a partir de `.env.example`: `VITE_WHATSAPP_NUMBER` com DDI/DDD e `VITE_DEMOREEL_URL` com arquivo local público ou URL de vídeo direta. URLs de páginas YouTube não são fontes HTML5 Video; forneça um MP4/WebM autorizado. Para cada projeto, preencha `src`, `poster` e, quando disponível, `captions` com WebVTT. Os seletores de arquivo permitem experimentar os players localmente sem enviar mídia ao servidor.

Fontes Google e GSAP/ScrollTrigger via CDN exigem conexão; sem ela, a página mantém fontes serifadas de fallback e conteúdo estático. GSAP deve passar para import local depois de instalado em um ambiente com acesso ao npm. As dependências do build desta execução foram recuperadas de instalações locais, pois a rede foi bloqueada; não foi possível gerar lockfile pelo registro.

QA: execute o servidor e `npm run qa`. O script utiliza Playwright e Edge nesta máquina; em outra, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE` apontando para seu Chromium. Screenshots e evidências ficam em `docs/screenshots/`.

Veja `docs/ART_DIRECTION.md`, `docs/IMAGE_PROMPTS.md` e `docs/QA.md`. As skills específicas deste projeto estão em `skills/`; não foram instaladas globalmente.
