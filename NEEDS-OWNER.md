# Decisões que dependem do autor

Itens que não foram alterados neste PR porque a resposta certa depende de você.

## 1. Áudios das lições sem arquivo correspondente

A pasta `frontend/audio/` tem apenas `c4, d4, e4, f4, g4, a4, b4, c5, d5, e5` (.mp3).
As lições apontavam para arquivos `nota-*.mp3` que não existem.

**O que foi corrigido** (nota e oitava sem dúvida, considerando que o nome do arquivo segue a notação científica, ex.: `c4` = Dó central):

| Arquivo | Lição | Nota | Antes | Depois |
|---|---|---|---|---|
| licoes-sol-data.js | 1 · A Linha Especial Inferior | Dó (C4) | `nota-DoCentral.mp3` | `c4.mp3` |
| licoes-sol-data.js | 2 · Abaixo da Base | Ré (D4) | `nota-Re1.mp3` | `d4.mp3` |
| licoes-sol-data.js | 3 · Clave de Sol - Linha 1 | Mi (E4) | `nota-Mi1.mp3` | `e4.mp3` |
| licoes-sol-data.js | 4 · Clave de Sol - Espaço 1 | Fá (F4) | `nota-Fa1.mp3` | `f4.mp3` |
| licoes-sol-data.js | 5 · A Linha de Referência | Sol (G4) | `nota-Sol1.mp3` | `g4.mp3` |
| licoes-sol-data.js | 6 · Clave de Sol - Espaço 2 | Lá (A4) | `nota-La1.mp3` | `a4.mp3` |
| licoes-sol-data.js | 7 · Clave de Sol - Linha 3 | Si (B4) | `nota-Si1.mp3` | `b4.mp3` |
| licoes-sol-data.js | 8 · Clave de Sol - Espaço 3 | Dó (C5) | `nota-Do2.mp3` | `c5.mp3` |
| licoes-sol-data.js | 9 · Clave de Sol - Linha 4 | Ré (D5) | `nota-Re2.mp3` | `d5.mp3` |
| licoes-sol-data.js | 10 · Clave de Sol - Espaço 4 | Mi (E5) | `nota-Mi2.mp3` | `e5.mp3` |
| licoes-data.js | 11 · A Linha Especial Superior | Dó central (C4) | `nota-DoCentral.mp3` | `c4.mp3` |
| licoes-data.js | 6 · Clave de Fá - Espaço 3 | Mi (E3) | `nota-Mi2.mp4` | `nota-Mi2.mp3` (só a extensão; o arquivo continua faltando) |

**O que ficou pendente**: não existe áudio na oitava certa. Sugestão: gravar ou baixar os arquivos com os nomes abaixo e atualizar o `audioSrc`, ou decidir se pode tocar a mesma nota em outra oitava.

| Arquivo | Lição | Nota | `audioSrc` atual | Arquivo sugerido |
|---|---|---|---|---|
| licoes-sol-data.js | 11 · Clave de Sol - Linha 5 | Fá (F5) | `nota-Fa2.mp3` | `f5.mp3` |
| licoes-sol-data.js | 12 · Clave de Sol - Acima do Topo | Sol (G5) | `nota-Sol2.mp3` | `g5.mp3` |
| licoes-sol-data.js | 13 · Linha Suplementar Superior | Lá (A5) | `nota-La2.mp3` | `a5.mp3` |
| licoes-sol-data.js | 14 · O Topo Extremo | Si (B5) | `nota-Si2.mp3` | `b5.mp3` |
| licoes-data.js | 1 · Clave de Fá - Linha 1 | Sol (G2) | `nota-Sol1.mp3` | `g2.mp3` |
| licoes-data.js | 2 · Clave de Fá - Espaço 1 | Lá (A2) | `nota-La1.mp3` | `a2.mp3` |
| licoes-data.js | 3 · Clave de Fá - Linha 2 | Si (B2) | `nota-Si1.mp3` | `b2.mp3` |
| licoes-data.js | 4 · Clave de Fá - Espaço 2 | Dó (C3) | `nota-Do2.mp3` | `c3.mp3` |
| licoes-data.js | 5 · Clave de Fá - Linha 3 | Ré (D3) | `nota-Re2.mp3` | `d3.mp3` |
| licoes-data.js | 6 · Clave de Fá - Espaço 3 | Mi (E3) | `nota-Mi2.mp3` | `e3.mp3` |
| licoes-data.js | 7 · A Linha de Referência | Fá (F3) | `nota-Fa2.mp3` | `f3.mp3` |
| licoes-data.js | 8 · Clave de Fá - Espaço 4 | Sol (G3) | `nota-Sol2.mp3` | `g3.mp3` |
| licoes-data.js | 9 · Clave de Fá - Linha 5 | Lá (A3) | `nota-La2.mp3` | `a3.mp3` |
| licoes-data.js | 10 · Clave de Fá - Acima do Topo | Si (B3) | `nota-Si2.mp3` | `b3.mp3` |
| licoes-data.js | 12 · Clave de Fá - Abaixo da Base | Fá (F2) | `nota-Fa1.mp3` | `f2.mp3` |
| licoes-data.js | 13 · Linha Suplementar Inferior | Mi (E2) | `nota-Mi1.mp3` | `e2.mp3` |
| licoes-data.js | 14 · O Fundo do Pentagrama | Ré (D2) | `nota-Re1.mp3` | `d2.mp3` |

Observação: os nomes antigos (`nota-Sol1`, `nota-Re1`...) eram os mesmos nas duas claves, mas representam notas diferentes (ex.: `nota-Sol1` é G2 na clave de Fá e G4 na clave de Sol). Usar a notação científica (`g2`, `g4`) evita essa confusão.

## 2. Página de Termos de Uso

Não existe uma página própria de Termos de Uso. No cadastro (`login.html`), o link "Termos de Uso" estava em `#` e agora aponta provisoriamente para `privacidade.html`, igual ao link da Política de Privacidade.

Decisão: criar uma `termos.html` com os termos do NoteWave e trocar o link, ou juntar os dois conteúdos em uma página só e deixar assim.
