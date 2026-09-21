// js/atividades-nota.js

// 1. CAPTURAR O ID DA URL COM SEGURANÇA
const urlParams = new URLSearchParams(window.location.search);
const licaoId = parseInt(urlParams.get('id')) || 1; // Fallback automático para a lição 1

// 2. EXTRAIR OS DADOS DA LIÇÃO CORRESPONDENTE
const licaoAtual = licoesDeNotas.find(licao => licao.id === licaoId);
 
// Variáveis de estado globais e persistentes no LocalStorage
let correctCount = parseInt(localStorage.getItem('musical_correctCount')) || 0;
let wrongCount = parseInt(localStorage.getItem('musical_wrongCount')) || 0;
let answered = false;

// Variáveis locais para controlar o aproveitamento exclusivo desta tentativa na lição
let cliquesNestaLicao = 0;
let acertouDePrimeira = true;
 
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
 
// 4. LÓGICA DE VALIDAÇÃO MODIFICADA
function computarEscolha(botaoClicado, respostaSelecionada) {
    if (answered) return; 
    
    cliquesNestaLicao++; // Contabiliza mais uma tentativa

    const feedbackPanel = document.getElementById("feedbackPanel");
    const feedbackIcon = feedbackPanel.querySelector(".feedback-icon");
    const feedbackTitle = document.getElementById("feedbackTitle");
    const feedbackMessage = document.getElementById("feedbackMessage");
    const actionBtn = document.getElementById("actionBtn");
    const todosOsBotoes = document.querySelectorAll(".option-btn");
 
    feedbackPanel.style.display = "flex";
 
    if (respostaSelecionada === licaoAtual.notaCorreta) {
        answered = true; // Bloqueia novos cliques após acertar

        // Só soma nos acertos globais se não tiver histórico de conclusão anterior
        if (!localStorage.getItem(`status_concluido_licao_${licaoId}`)) {
            correctCount++;
            localStorage.setItem('musical_correctCount', correctCount);
        }
 
        document.getElementById('correctCount').innerText = correctCount;
 
        botaoClicado.id = 'correct-choice';
        botaoClicado.style.backgroundColor = "#2ecc71";
        botaoClicado.style.color = "#ffffff";
        botaoClicado.style.opacity = "1";

        // Desabilita os outros botões irrelevantes
        todosOsBotoes.forEach(btn => {
            if(btn !== botaoClicado) {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
            }
        });
 
        // Calcula o aproveitamento obtido nesta lição específica
        const aproveitamentoLicao = Math.round((1 / cliquesNestaLicao) * 100);

        feedbackPanel.className = "feedback-panel success";
        feedbackIcon.innerText = "✓";

        // VALIDAÇÃO DA MÉTRICA DE 50%
        if (aproveitamentoLicao > 50) {
            // Se o aproveitamento foi maior que 50%, salva o progresso real e avança
            localStorage.setItem(`status_concluido_licao_${licaoId}`, 'true');
            
            feedbackTitle.innerText = "Parabéns, você acertou! 🎉";
            feedbackMessage.innerText = `Muito bem! Aproveitamento de ${aproveitamentoLicao}%. Você dominou a nota ${licaoAtual.notaCorreta}!`;
            actionBtn.innerText = "Próxima Lição";
            
            actionBtn.onclick = () => {
                const proximoId = licaoId + 1;
                const proximaExiste = licoesDeNotas.some(l => l.id === proximoId);
                if (proximaExiste) {
                    window.location.href = `atividades-nota.html?id=${proximoId}`;
                } else {
                    alert("Parabéns! Você concluiu com excelência toda a trilha de Clave de Fá!");
                    feedbackPanel.style.display = "none";
                }
            };
        } else {
            // Se o aproveitamento for menor ou igual a 50%, obriga a refazer
            feedbackTitle.innerText = "Você passou, mas pode melhorar! 🔄";
            feedbackMessage.innerText = `Aproveitamento de ${aproveitamentoLicao}%. Como sua precisão foi de 50% ou menos, você deve refazer esta lição para prosseguir.`;
            actionBtn.innerText = "Refazer Lição";
            
            actionBtn.onclick = () => {
                window.location.href = `atividades-nota.html?id=${licaoId}`;
            };
        }
        
        atualizarProgressoGeral();
 
    } else {
        // LÓGICA DE ERRO ALTERADA: Não exibe a resposta correta imediatamente
        acertouDePrimeira = false;
        wrongCount++;
        localStorage.setItem('musical_wrongCount', wrongCount);
        document.getElementById('wrongCount').innerText = wrongCount;
 
        // Modifica apenas o botão que o usuário errou
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
            // O usuário continua na lição, os botões não errados continuam ativos
        };
    }
}
 
// 5. CÁLCULO DINÂMICO DO PROGRESSO GERAL (Apenas lições validadas com >50%)
function atualizarProgressoGeral() {
    const totalDeQuestoesDoCurso = licoesDeNotas.length;
    let questoesConcluidas = 0;
 
    for (let i = 1; i <= totalDeQuestoesDoCurso; i++) {
        if (localStorage.getItem(`status_concluido_licao_${i}`)) {
            questoesConcluidas++;
        }
    }
 
    const progressoCalculado = Math.round((questoesConcluidas / totalDeQuestoesDoCurso) * 100);
 
    document.getElementById('percentageValue').innerText = `${progressoCalculado}%`;
    document.getElementById('progressRing').style.setProperty('--percent', progressoCalculado);
}
 
function reiniciarTodoOProgresso() {
    if (confirm("Deseja realmente zerar todo o seu histórico e desempenho do curso?")) {
        localStorage.clear();
        correctCount = 0;
        wrongCount = 0;
        window.location.href = "atividades-nota.html?id=1"; 
    }
}
 
function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}
