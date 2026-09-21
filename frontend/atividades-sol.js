// 1. CAPTURAR O ID DA URL COM SEGURANÇA
const urlParams = new URLSearchParams(window.location.search);
const licaoId = parseInt(urlParams.get('id')) || 1; // Fallback automático para a lição 1

// 2. EXTRAIR OS DADOS DA LIÇÃO CORRESPONDENTE (CLAVE DE SOL)
const licaoAtual = licoesDeNotasSol.find(licao => licao.id === licaoId);

// Variáveis de estado globais e persistentes no LocalStorage (Exclusivas para Clave de Sol)
let correctCount = parseInt(localStorage.getItem('musical_sol_correctCount')) || 0;
let wrongCount = parseInt(localStorage.getItem('musical_sol_wrongCount')) || 0;
let answered = false;

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

    // Previne que o tempo apareça como "NaN" antes do MP3 carregar
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

    // Sincroniza dinamicamente as alternativas e eventos de clique
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
    answered = true;

    const feedbackPanel = document.getElementById("feedbackPanel");
    const feedbackIcon = feedbackPanel.querySelector(".feedback-icon");
    const feedbackTitle = document.getElementById("feedbackTitle");
    const feedbackMessage = document.getElementById("feedbackMessage");
    const actionBtn = document.getElementById("actionBtn");

    const todosOsBotoes = document.querySelectorAll(".option-btn");
    todosOsBotoes.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
    });

    feedbackPanel.style.display = "flex";

    if (respostaSelecionada === licaoAtual.notaCorreta) {
        if (!localStorage.getItem(`status_sol_concluido_licao_${licaoId}`)) {
            correctCount++;
            localStorage.setItem('musical_sol_correctCount', correctCount);
            localStorage.setItem(`status_sol_concluido_licao_${licaoId}`, 'true');
        }

        document.getElementById('correctCount').innerText = correctCount;

        botaoClicado.id = 'correct-choice';
        botaoClicado.style.backgroundColor = "#2ecc71";
        botaoClicado.style.color = "#ffffff";
        botaoClicado.style.opacity = "1";

        feedbackPanel.className = "feedback-panel success";
        feedbackIcon.innerText = "✓";
        feedbackTitle.innerText = "Parabéns, você acertou! 🎉";
        feedbackMessage.innerText = `Muito bem! Essa é a nota ${licaoAtual.notaCorreta} na clave de sol.`;

        actionBtn.innerText = "Próxima";

        actionBtn.onclick = () => {
            const proximoId = licaoId + 1;
            const proximaExiste = licoesDeNotasSol.some(l => l.id === proximoId);

            if (proximaExiste) {
                window.location.href = `atividades_sol.html?id=${proximoId}`;
            } else {
                alert("Parabéns! Você concluiu com excelência toda a trilha de Clave de Sol!");
                feedbackPanel.style.display = "none";
            }
        };

    } else {
        wrongCount++;
        localStorage.setItem('musical_sol_wrongCount', wrongCount);
        document.getElementById('wrongCount').innerText = wrongCount;

        botaoClicado.id = 'wrong-choice';
        botaoClicado.style.backgroundColor = "#e74c3c";
        botaoClicado.style.color = "#ffffff";
        botaoClicado.style.opacity = "1";

        const botaoCerto = [...todosOsBotoes].find(btn => btn.innerText === licaoAtual.notaCorreta);
        if (botaoCerto) {
            botaoCerto.id = 'correct-choice';
            botaoCerto.style.backgroundColor = "#2ecc71";
            botaoCerto.style.color = "#ffffff";
            botaoCerto.style.opacity = "1";
        }

        feedbackPanel.className = "feedback-panel danger";
        feedbackIcon.innerText = "❌";
        feedbackTitle.innerText = "Não desista! 💪";
        feedbackMessage.innerText = "Tente novamente! Analise a posição da nota e use a dica.";

        actionBtn.innerText = "Tentar novamente";

        actionBtn.onclick = () => {
            feedbackPanel.style.display = "none";
            answered = false;
            todosOsBotoes.forEach(btn => {
                btn.disabled = false;
                btn.removeAttribute("style");
                btn.removeAttribute("id");
            });
        };
    }

    atualizarProgressoGeral();
}

// 5. CÁLCULO DINÂMICO DE PROGRESSO
function atualizarProgressoGeral() {
    const totalDeQuestoesDoCurso = licoesDeNotasSol.length;
    let questoesConcluidas = 0;

    for (let i = 1; i <= totalDeQuestoesDoCurso; i++) {
        if (localStorage.getItem(`status_sol_concluido_licao_${i}`)) {
            questoesConcluidas++;
        }
    }

    const progressoCalculado = Math.round((questoesConcluidas / totalDeQuestoesDoCurso) * 100);

    document.getElementById('percentageValue').innerText = `${progressoCalculado}%`;
    document.getElementById('progressRing').style.setProperty('--percent', progressoCalculado);
}

function reiniciarTodoOProgresso() {

    if (confirm("Deseja realmente zerar todo o seu histórico e desempenho da Clave de Sol?")) {

        localStorage.clear();

        correctCount = 0;

        wrongCount = 0;

        window.location.href = "atividades_sol.html?id=1"; 

    }

}


function formatarTempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}