# Tarefas agendadas e o banco do Painel

O Painel roda em https://denise-barros.github.io/Painel/ e os dados ficam no **Supabase**
(projeto `itkcvvovzjjepkeblffe`), na tabela `painel_docs`. O artifact antigo do claude.ai
é uma cópia desatualizada: nenhuma tarefa deve ler ou gravar nele (nada de `ArtifactData`).

## Como os dados estão guardados

Uma linha por documento, no mesmo formato que o Painel usava no claude.ai:

| coluna       | conteúdo                                                      |
|--------------|---------------------------------------------------------------|
| `path`       | `<coleção>/<id>`, ex.: `brd-reun/ag-seeds-20261111-1500`       |
| `col`        | a coleção (tudo antes do último `/`), ex.: `abas/parcelas/linhas` |
| `data`       | os campos do documento (JSON)                                 |
| `updated_at` | data da última gravação (serve de "versão")                   |

As coleções e os campos são os mesmos de antes (`tasks`, `meta`, `config`, `cad-*`, `dp-*`,
`brd-*`, `age-*`, `via-*`, `abas/<aba>/linhas` etc.).

## Acesso a partir de uma tarefa agendada

As tarefas rodam no ambiente de nuvem padrão, onde a chave secreta do Supabase está salva como
*network secret* (cabeçalho `apikey`). A rede injeta a chave sozinha: a tarefa manda
`apikey: proxy-injected` e nunca vê a chave real.

Bloco padrão para colar no texto de qualquer tarefa nova:

```
BANCO DO PAINEL (Supabase). O Painel roda em https://denise-barros.github.io/Painel/ e os dados ficam no Supabase, tabela painel_docs (uma linha por documento: path = "<coleção>/<id>", col = "<coleção>", data = os campos do documento em JSON, updated_at = data da última gravação). NÃO use ArtifactData nem o artifact do claude.ai (é uma cópia antiga e desatualizada). Acesse pela API REST com curl ou Python, base https://itkcvvovzjjepkeblffe.supabase.co/rest/v1/painel_docs, sempre com os cabeçalhos "apikey: proxy-injected" (a chave real é colocada automaticamente pela rede; nunca procure, peça nem imprima chaves) e "Content-Type: application/json". Codifique valores na URL (curl -G --data-urlencode ou urllib.parse.quote).
- LISTAR uma coleção: GET ?col=eq.<coleção>&select=path,data,updated_at&order=path&limit=1000&offset=0 (repita com offset 1000, 2000... até vir menos de 1000). O id do documento é o trecho do path depois do último "/". Salve a resposta em arquivo e trate com script.
- LER um documento: GET ?path=eq.<coleção>/<id>&select=data,updated_at (lista vazia = não existe).
- CRIAR OU SUBSTITUIR (set): POST com cabeçalho "Prefer: resolution=merge-duplicates,return=minimal" e corpo {"path": "<coleção>/<id>", "col": "<coleção>", "data": {...}, "updated_at": "<agora, ISO UTC>"}; o corpo pode ser uma lista com vários documentos (até 500 por chamada).
- ATUALIZAR CAMPOS (update): leia o documento, junte no script os campos novos ao data atual e grave com PATCH ?path=eq.<path>&updated_at=eq.<updated_at lido>, cabeçalho "Prefer: return=representation" e corpo {"data": {data completo}, "updated_at": "<agora>"}. Se a resposta vier [] o documento mudou desde a leitura: releia e refaça só se ainda fizer sentido (é o equivalente ao if_version).
- APAGAR: DELETE ?path=eq.<path> (um documento).
Confira o código HTTP de cada chamada (2xx = ok). Se der 401/403 ou erro de rede, não invente nada e avise no resumo.
```

## Se a chave mudar

Se a secret key do Supabase for trocada, atualize o *network secret* "Supabase Painel (secret key)"
do ambiente de nuvem padrão (menu do ambiente → Edit → Network secrets), com cabeçalho `apikey`.
