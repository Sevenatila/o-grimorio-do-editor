# Fontes locais

Não foram fornecidos arquivos de Cinzel ou Lora. Esta pasta é o primeiro local consultado pelo carregador `src/fonts.ts`, antes das fontes instaladas no sistema e do Google Fonts.

Para hospedar as fontes com o site, adicionar as versões variáveis oficiais, preservando as respectivas licenças:

- `cinzel-variable.woff2`: normal, pesos 400–900.
- `lora-variable.woff2`: normal, pesos 400–700.
- `lora-italic-variable.woff2`: itálica, pesos 400–700.

TTF, OTF e WOFF também são aceitos. Os nomes devem conter `cinzel` ou `lora`; a versão itálica deve conter `italic`. Reiniciar o Vite após adicionar arquivos. O build inclui as fontes locais automaticamente.

Diagnóstico no navegador: `document.documentElement.dataset.fontSource` retorna `local`, `google` ou `fallback`; verificar também as faces efetivamente carregadas em `document.fonts`. Sem arquivos locais nem acesso externo, o site continua em Georgia. Não confundir a família declarada no CSS com a fonte realmente disponível.
