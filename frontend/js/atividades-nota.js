// 1. CAPTURAR O ID DA URL COM SEGURANÇA

const urlParams = new URLSearchParams(window.location.search);

const licaoId = parseInt(urlParams.get('id')) || 1;
 
// 2. EXTRAIR OS DADOS DA LIÇÃO CORRESPONDENTE (CLAVE DE FÁ)

const licaoAtual = licoesDeNotasFa.find(licao => licao.id === licaoId);
 
// Variáveis de estado globais e persistentemente salvas no LocalStorage (Atualizado para Fá)

let correctCount = parseInt(localStorage.getItem('musical_fa_correctCount')) || 0;

let wrongCount = parseInt(localStorage.getItem('musical_fa_wrongCount')) || 0;

let answered = false;

let acertouDePrimeira = true;
 
// 3. EXECUÇÃO INICIAL

if (licaoAtual) {

    carregarEstruturaDinamica();

    atualizarProgressoGeral();

} else {

    document.body.innerHTML = "<h1 style='text-align:center; margin-top:50px; font-family:sans-serif;'>⚠️ Lição não encontrada!</h1>";

}
 
function carregarEstruturaDinamica() {

    document.getElementById("lessonNumber").innerText = `Lição ${licaoAtual.id}`;

    document.getElementById("lessonTitle").innerText = licaoAtual.titulo;

    document.getElementById("helpText").innerText = licaoAtual.dica;
 
    const audioTrack = document.getElementById("audioTrack");

    audioTrack.src = licaoAtual.audioSrc;
 
    const noteElement = document.getElementById("noteElement");

    noteElement.className = "note " + licaoAtual.classePosicao;
 
    document.getElementById('correctCount').innerText = correctCount;

    document.getElementById('wrongCount').innerText = wrongCount;
 
    const btnHelp = document.getElementById("btnHelp");

    const helpBox = document.getElementById("helpBox");
 
    btnHelp.onclick = () => {

        helpBox.style.display = helpBox.style.display === "none" ? "block" : "none";

    };
 
    const playBtn = document.getElementById("playBtn");

    const audioTime = document.getElementById("audioTime");
 
    playBtn.onclick = () => {

        if (audioTrack.paused) {

            audioTrack.play();

            playBtn.innerHTML = "<span class='play-icon'>⏸</span>";

        } else {

            audioTrack.pause();

            playBtn.innerHTML = "<span class='play-icon'>▶</span>";

        }

    };
 
    audioTrack.onloadedmetadata = () => {

        const total = formatarTempo(audioTrack.duration);

        audioTime.innerText = `0:00 / ${total}`;

    };
 
    audioTrack.ontimeupdate = () => {

        if (!isNaN(audioTrack.duration)) {

            const atual = formatarTempo(audioTrack.currentTime);

            const total = formatarTempo(audioTrack.duration);

            audioTime.innerText = `${atual} / ${total}`;

        }

    };
 
    audioTrack.onended = () => {

        playBtn.innerHTML = "<span class='play-icon'>▶</span>";

    };
 
    const botoesDoHtml = document.querySelectorAll(".option-btn");

    botoesDoHtml.forEach((botao, index) => {

        if (licaoAtual.opcoes[index]) {

            botao.innerText = licaoAtual.opcoes[index];

            botao.onclick = () => computarEscolha(botao, licaoAtual.opcoes[index]);

        }

    });
 
    document.getElementById("resetBtn").onclick = reiniciarTodoOProgresso;

}
 
// 4. LÓGICA DE VALIDAÇÃO

function computarEscolha(botaoClicado, respostaSelecionada) {

    if (answered) return;
 
    const feedbackPanel = document.getElementById("feedbackPanel");

    const feedbackIcon = feedbackPanel.querySelector(".feedback-icon");

    const feedbackTitle = document.getElementById("feedbackTitle");

    const feedbackMessage = document.getElementById("feedbackMessage");

    const actionBtn = document.getElementById("actionBtn");

    const todosOsBotoes = document.querySelectorAll(".option-btn");
 
    feedbackPanel.style.display = "flex";
 
    if (respostaSelecionada === licaoAtual.notaCorreta) {

        answered = true;
 
        if (acertouDePrimeira && !localStorage.getItem(`status_fa_concluido_licao_${licaoId}`)) {

            correctCount++;

            localStorage.setItem('musical_fa_correctCount', correctCount);

            localStorage.setItem(`status_fa_concluido_licao_${licaoId}`, 'true');

        }
 
        document.getElementById('correctCount').innerText = correctCount;
 
        botaoClicado.id = 'correct-choice';

        botaoClicado.style.backgroundColor = "#2ecc71";

        botaoClicado.style.color = "#ffffff";

        botaoClicado.style.opacity = "1";
 
        todosOsBotoes.forEach(btn => {

            if (btn !== botaoClicado) {

                btn.disabled = true;

                btn.style.opacity = "0.5";

                btn.style.cursor = "not-allowed";

            }

        });
 
        feedbackPanel.className = "feedback-panel success";

        feedbackIcon.innerText = "✓";

        feedbackTitle.innerText = "Parabéns, você acertou! 🎉";
 
        if (acertouDePrimeira) {

            feedbackMessage.innerText = `Excelente! Você acertou de primeira a nota ${licaoAtual.notaCorreta}! Seu progresso subiu.`;

        } else {

            feedbackMessage.innerText = `Você encontrou a nota ${licaoAtual.notaCorreta}. Como errou antes, seu progresso geral não subiu nesta lição.`;

        }
 
        actionBtn.innerText = "Próxima Lição";
 
        actionBtn.onclick = () => {

            const proximoId = licaoId + 1;

            const proximaExiste = licoesDeNotasFa.some(l => l.id === proximoId);
 
            if (proximaExiste) {

                window.location.href = window.location.pathname + `?id=${proximoId}`;

            } else {

                feedbackPanel.style.display = "none";

                dispararEncerramentoMaritimo();

            }

        };
 
        atualizarProgressoGeral();
 
    } else {

        acertouDePrimeira = false;

        wrongCount++;

        localStorage.setItem('musical_fa_wrongCount', wrongCount);

        document.getElementById('wrongCount').innerText = wrongCount;
 
        botaoClicado.disabled = true;

        botaoClicado.style.backgroundColor = "#e74c3c";

        botaoClicado.style.color = "#ffffff";

        botaoClicado.style.opacity = "0.7";

        botaoClicado.style.cursor = "not-allowed";
 
        feedbackPanel.className = "feedback-panel danger";

        feedbackIcon.innerText = "❌";

        feedbackTitle.innerText = "Resposta incorreta! 🤔";

        feedbackMessage.innerText = "Essa não é a nota certa. Analise a pauta novamente e tente outra alternativa!";

        actionBtn.innerText = "Tentar novamente";
 
        actionBtn.onclick = () => {

            feedbackPanel.style.display = "none";

        };

    }

}
 
// 5. CÁLCULO DINÂMICO DE PROGRESSO

function atualizarProgressoGeral() {

    const totalDeQuestoesDoCurso = licoesDeNotasFa.length;

    let questoesConcluidas = 0;
 
    for (let i = 1; i <= totalDeQuestoesDoCurso; i++) {

        if (localStorage.getItem(`status_fa_concluido_licao_${i}`)) {

            questoesConcluidas++;

        }

    }
 
    const progressoCalculado = Math.round((questoesConcluidas / totalDeQuestoesDoCurso) * 100) || 0;

    document.getElementById('percentageValue').innerText = `${progressoCalculado}%`;

    document.getElementById('progressRing').style.setProperty('--percent', progressoCalculado);

}
 
// 6. LÓGICA DO PROTOCOLO FINAL

function dispararEncerramentoMaritimo() {

    // 1. Esconder a área do quiz

    document.querySelector(".app-container").style.display = "none";
 
    // 2. Mostrar a tela final do oceano

    const telaFinal = document.getElementById("finalOcean");

    telaFinal.style.display = "flex"; // Usa flex por causa da reestilização da tela nova
 
    // 3. Calcular a porcentagem de acertos

    const totalDeQuestoesDoCurso = licoesDeNotasFa.length;

    let questoesConcluidas = 0;
 
    for (let i = 1; i <= totalDeQuestoesDoCurso; i++) {

        if (localStorage.getItem(`status_fa_concluido_licao_${i}`)) {

            questoesConcluidas++;

        }

    }
 
    const pct = Math.round((questoesConcluidas / totalDeQuestoesDoCurso) * 100) || 0;

    document.getElementById("finalPercentage").innerText = `${pct}% de aproveitamento`;
 
    // 4. Lógica de botões e mensagens baseada no desempenho

    const retryBtn = document.getElementById("retryLessonBtn");

    const skipBtn = document.getElementById("skipLessonBtn");

    const medalBtn = document.getElementById("receiveMedalBtn");

    const resultMessage = document.getElementById("starResultMessage");

    const resultStars = document.getElementById("resultStars");
 
    // Limpar estrelas padrão

    resultStars.innerHTML = "";
 
    if (pct >= 80) { // 3 Estrelas

        resultStars.innerHTML = `<span class="result-star">⭐</span><span class="result-star">⭐</span><span class="result-star">⭐</span>`;

        resultMessage.innerText = "Incrível! Você dominou a pauta musical e pegou a onda perfeita!";

        if(medalBtn) medalBtn.hidden = false;

        if(retryBtn) retryBtn.hidden = true;

    } else if (pct >= 50) { // 2 Estrelas

        resultStars.innerHTML = `<span class="result-star">⭐</span><span class="result-star">⭐</span>`;

        resultMessage.innerText = "Muito bom! Você está pegando o jeito, falta pouco para a medalha.";

        if(skipBtn) skipBtn.hidden = false;

    } else { // 1 ou 0 Estrelas

        const qtd = pct >= 25 ? 1 : 0;

        resultStars.innerHTML = qtd === 1 ? `<span class="result-star">⭐</span>` : `🐚 Nenhuma estrela desta vez.`;

        resultMessage.innerText = "Continue praticando! Cada tentativa faz parte da aprendizagem.";

    }
 
    // 5. Configurar ações dos botões primários

    if(retryBtn) retryBtn.onclick = reiniciarTodoOProgressoSemConfirmar;

    if(skipBtn) skipBtn.onclick = () => alert("Você pulou para o próximo nível!");
 
    // =====================================================================

    // FLUXO GAMIFICADO (Mascote -> Onda -> Estrelas -> Onda -> Medalha)

    // =====================================================================
 
    // Função auxiliar para chamar a onda orgânica em qualquer transição

    function dispararOndaDeTransicao(acaoNoMeioDaOnda) {

         let onda = document.createElement("div");

         onda.className = "onda-transicao";

         document.body.appendChild(onda);

         setTimeout(() => { onda.classList.add("animar"); }, 10);

         // Exatamente quando a tela está azul (metade da animação), roda a ação

         setTimeout(() => { acaoNoMeioDaOnda(); }, 800);

         setTimeout(() => { onda.remove(); }, 1700);

    }
 
    // Configurar fluxo da gamificação ao clicar em Receber Medalha

    if (medalBtn) {

        medalBtn.onclick = () => {

            // A onda sobe e esconde a tela inicial (finalOcean com o Mascote)

            dispararOndaDeTransicao(() => {

                document.getElementById("finalOcean").style.display = "none";

                // Prepara as estrelas animadas com base no progresso real

                const containerEstrelas = document.getElementById("duoEstrelasAnimadas");

                containerEstrelas.innerHTML = "";

                let qtdEstrelasAnimadas = pct >= 80 ? 3 : (pct >= 50 ? 2 : (pct >= 25 ? 1 : 0));

                for (let i = 0; i < qtdEstrelasAnimadas; i++) {

                    containerEstrelas.innerHTML += `<div class="duo-estrela-anim">⭐</div>`;

                }
 
                // A onda desce, revelando a tela de estrelas!

                document.getElementById("telaEstrelas").style.display = "flex";

            });

        };
 
        // Evento do botão "Continuar" da tela de estrelas com a SEGUNDA onda

        document.getElementById("btnProximoEstrelas").onclick = () => {

            dispararOndaDeTransicao(() => {

                document.getElementById("telaEstrelas").style.display = "none";

                document.getElementById("telaMedalha").style.display = "flex";

            });

        };
 
        // Evento do botão final "Continuar" da tela da medalha

        document.getElementById("btnIrParaMedalhas").onclick = () => {

            // 1. Salva no navegador que a medalha foi liberada

            localStorage.setItem("medalha_clave_fa", "true");

            // 2. Redireciona para a página de medalhas enviando os parâmetros

            window.location.href = "../html/medalhas.html?recompensa=true&titulo=Clave de Fá";

        };

    }

} // <- O fechamento exato da função principal está garantido aqui
 
// 7. REINICIAR PROGRESSO SEGURO

function reiniciarTodoOProgresso() {

    if (confirm("Deseja realmente zerar todo o seu histórico e desempenho da Clave de Fá?")) {

        reiniciarTodoOProgressoSemConfirmar();

    }

}
 
function reiniciarTodoOProgressoSemConfirmar() {

    localStorage.removeItem('musical_fa_correctCount');

    localStorage.removeItem('musical_fa_wrongCount');
 
    licoesDeNotasFa.forEach(licao => {

        localStorage.removeItem(`status_fa_concluido_licao_${licao.id}`);

    });
 
    window.location.href = window.location.pathname + "?id=1";

}
 
// 8. FORMATADOR DE TEMPO

function formatarTempo(segundos) {

    if (isNaN(segundos)) return "0:00";

    const min = Math.floor(segundos / 60);

    const seg = Math.floor(segundos % 60);

    return `${min}:${seg < 10 ? '0' : ''}${seg}`;

}
 