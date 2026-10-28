# Painel de administração

Acesso: `/admin`. Esta versão foi solicitada sem senha; o painel e as operações de edição não exigem autenticação.

## Editar e salvar

1. Escolha uma aba: Textos do site, Vídeos, Feedbacks ou Aparência.
2. Faça as alterações e confira a prévia. O rascunho é recuperado neste navegador após recarregar a página.
3. Clique em **Salvar alterações** para publicar. A confirmação só é apresentada após o servidor confirmar o salvamento.

A prévia fica separada do conteúdo publicado. O site lê o conteúdo salvo pela API, inclusive em outros navegadores. Abas abertas no mesmo navegador recebem uma notificação de atualização; ao voltar para o site, uma nova leitura busca a versão mais recente.

## Vídeos

- Adicionar vídeo cria um novo formulário com link, título, categoria, descrição, formato e capa.
- São aceitos links do YouTube, Shorts, youtu.be e arquivos diretos MP4, WebM e OGG.
- A capa pode ser uma URL, imagem enviada ou miniatura do YouTube quando o campo estiver vazio.
- Os controles de subir, descer e remover alteram a ordem do acervo.
- O destaque principal pode usar um item do acervo ou um link independente. Se ele estiver vinculado a um item, editar o link desse item atualiza também o destaque.
- O acervo aceita até 100 vídeos. Sem itens, o site exibe a mensagem configurada para a lista vazia.

## Feedbacks

- Adicionar feedback abre os campos de imagem, descrição acessível, texto, nome e identificação.
- É necessário informar uma imagem ou um texto. Nome e identificação são opcionais.
- O envio aceita JPG, PNG e WebP de até 3 MB, mantendo os bytes da imagem. O link retornado fica no rascunho até salvar o conteúdo.
- Subir, descer e remover organizam a lista. Remover um registro não apaga o arquivo original nem a mídia armazenada, permitindo recuperação por backup.
- A lista aceita até 200 feedbacks. Sem itens, o site exibe a mensagem configurada.

## Demais configurações

É possível editar identidade, títulos, descrições, parágrafos da Jornada, as sete habilidades, contato, WhatsApp, rodapé, textos do menu, imagens, textura, fontes, cores e exibição das seções. As capitulares são calculadas a partir da primeira letra do título editado.

A aba Backup exporta o rascunho em JSON e importa um arquivo válido para revisão. A importação só vai ao site depois de salvar. Recarregar conteúdo salvo descarta o rascunho após confirmação.

## Persistência

- Os valores originais continuam em `src/data/content.ts`, como `defaultContent`.
- Em produção, `api/content.ts` lê e grava JSON no Vercel Blob; `api/media.ts` recebe as imagens. O armazenamento foi criado e vinculado ao projeto da Vercel.
- `BLOB_READ_WRITE_TOKEN` fica exclusivamente no servidor, injetado pela integração da Vercel. Não deve usar prefixo `VITE_`.
- Leituras usam `useCache: false`; a API retorna `Cache-Control: no-store`. A revisão/ETag impede sobrescrever uma edição mais recente sem recarregar.
- O namespace é separado por `VERCEL_ENV` (production, preview ou development).
- Sem token em desenvolvimento local, o conteúdo é gravado em `.tools/admin/content.json` e imagens em `public/uploads/`. Essas pastas são ignoradas pelo Git.
- Em produção, ausência ou falha de armazenamento gera erro explícito no painel. Não é apresentada uma confirmação falsa de publicação nem usado armazenamento temporário da função.

Referência: [SDK oficial do Vercel Blob](https://vercel.com/docs/vercel-blob/using-blob-sdk).

## Validação

`npm run build` verifica frontend e backend. `npm run qa:admin` testa rascunho, prévia, salvamento por botão, outro navegador, cadastros, upload, reordenação, backup, aparência, conflitos e listas vazias. O teste de mutação é restrito a localhost e restaura o conteúdo original no final.

Por padrão, os testes usam o servidor local. `QA_BASE_URL` permite indicar outra porta; os testes de mutação recusam endereços de produção. As evidências ficam em `docs/screenshots/admin/`.
