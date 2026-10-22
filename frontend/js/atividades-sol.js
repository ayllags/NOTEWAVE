// 1. CAPTURAR O ID DA URL COM SEGURANÇA
const urlParams = new URLSearchParams(window.location.search);
const licaoId = parseInt(urlParams.get('id')) || 1; // Fallback automático para a lição 1

// 2. EXTRAIR OS DADOS DA LIÇÃO CORRESPONDENTE (CLAVE DE SOL)
const licaoAtual = licoesDeNotasSol.find(licao => licao.id === licaoId);

// Variáveis de estado globais e persistentes no LocalStorage (Exclusivas para Clave de Sol)
let correctCount = parseInt(localStorage.getItem('musical_sol_correctCount')) || 0;
let wrongCount = parseInt(localStorage.getItem('musical_sol_wrongCount')) || 0;
let answered = false;

// Variável local para controlar se a lição atual foi resolvida sem nenhum erro prévio
let acertouDePrimeira = true;
// Erros cometidos especificamente nesta lição
let tentativasErradasNestaLicao = 0;

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

// 4. LÓGICA DE VALIDAÇÃO COM FILTRO DE ACERTO DE PRIMEIRA
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
        answered = true; // Trava novos cliques nesta tentativa após achar a resposta certa

        // SÓ ENTRA NO PROGRESSO GERAL E NOS ACERTOS SE NUNCA ERROU NESSA LIÇÃO ANTES
        if (acertouDePrimeira && !localStorage.getItem(`status_sol_concluido_licao_${licaoId}`)) {
            correctCount++;
            localStorage.setItem('musical_sol_correctCount', correctCount);
            localStorage.setItem(`status_sol_concluido_licao_${licaoId}`, 'true');
        }

        document.getElementById('correctCount').innerText = correctCount;

        botaoClicado.id = 'correct-choice';
        botaoClicado.style.backgroundColor = "#2ecc71";
        botaoClicado.style.color = "#ffffff";
        botaoClicado.style.opacity = "1";

        // Desabilita os outros botões para finalizar o exercício
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
        
        // Personaliza a mensagem se ele precisou tentar mais de uma vez
        if (acertouDePrimeira) {
            feedbackMessage.innerText = `Excelente! Você acertou de primeira a nota ${licaoAtual.notaCorreta}! Seu progresso subiu.`;
        } else {
            feedbackMessage.innerText = `Você encontrou a nota ${licaoAtual.notaCorreta}. Como precisou de mais tentativas, seu progresso geral não subiu nesta lição.`;
        }

        actionBtn.innerText = "Próxima Lição";
        
        actionBtn.onclick = () => {
            const proximoId = licaoId + 1;
        
            const proximaExiste = licoesDeNotasSol.some(
                l => l.id === proximoId
            );
        
            if (proximaExiste) {
                window.location.href =
                    `atividades_sol.html?id=${proximoId}`;
            } else {
                abrirConclusaoFinal();
            }
        };
        
        // Atualiza a barra/anel de aproveitamento
        atualizarProgressoGeral();

    } else {
        // Marcador muda para falso: ele não vai pontuar no progresso geral ao acertar depois
        acertouDePrimeira = false;
        tentativasErradasNestaLicao++;

        wrongCount++;
        localStorage.setItem('musical_sol_wrongCount', wrongCount);
        document.getElementById('wrongCount').innerText = wrongCount;

        // Pinta e bloqueia apenas o botão que ele errou
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

// 5. CÁLCULO DINÂMICO DE PROGRESSO (Apenas lições salvas como acerto de primeira)
function atualizarProgressoGeral() {
    const totalDeQuestoesDoCurso = licoesDeNotasSol.length;
    let questoesConcluidas = 0;

    for (let i = 1; i <= totalDeQuestoesDoCurso; i++) {
        if (localStorage.getItem(`status_sol_concluido_licao_${i}`)) {
            questoesConcluidas++;
        }
    }

    const progressoCalculado = Math.round((questoesConcluidas / totalDeQuestoesDoCurso) * 100) || 0;

    document.getElementById('percentageValue').innerText = `${progressoCalculado}%`;
    document.getElementById('progressRing').style.setProperty('--percent', progressoCalculado);
}

// 6. REINICIAR PROGRESSO SEGURO
function reiniciarTodoOProgresso() {
    if (confirm("Deseja realmente zerar todo o seu histórico e desempenho da Clave de Sol?")) {
        localStorage.removeItem('musical_sol_correctCount');
        localStorage.removeItem('musical_sol_wrongCount');

        licoesDeNotasSol.forEach(licao => {
            localStorage.removeItem(`status_sol_concluido_licao_${licao.id}`);
        });

        correctCount = 0;
        wrongCount = 0;
        window.location.href = "atividades_sol.html?id=1"; 
    }
}

// 7. FORMATADOR DE TEMPO
function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
}

/* =====================================================
   NOTEWAVE — ANIMAÇÃO DE CONCLUSÃO DA TRILHA
   ===================================================== */

   function abrirConclusaoFinal() {
    const telaFinal = document.getElementById("finalOcean");

    if (!telaFinal) {
        alert("Parabéns! Você concluiu a trilha de Clave de Sol!");
        return;
    }

    // Calcula o aproveitamento desta lição.
    // Cada resposta errada conta como uma tentativa adicional.
    const totalTentativas = tentativasErradasNestaLicao + 1;

    const porcentagem = Math.round(
        (1 / totalTentativas) * 100
    );

    // Define a quantidade de estrelas conquistadas.
    let estrelas = 0;

    if (porcentagem >= 80) {
        estrelas = 3;
    } else if (porcentagem >= 50) {
        estrelas = 2;
    } else if (porcentagem >= 25) {
        estrelas = 1;
    }

    // Elementos da tela final
    const porcentagemEl = document.getElementById("finalPercentage");
    const mensagemEl = document.getElementById("starResultMessage");
    const tituloEl = document.getElementById("oceanResultTitle");
    const mensagemPrincipal = document.getElementById("oceanResultMessage");

    const retryBtn = document.getElementById("retryLessonBtn");
    const skipBtn = document.getElementById("skipLessonBtn");
    const medalBtn = document.getElementById("receiveMedalBtn");

    const skipConfirmation = document.getElementById("skipConfirmation");
    const medalReveal = document.getElementById("medalReveal");

    const resultStars = document.getElementById("resultStars");
    const beachStars = document.getElementById("beachStars");

    // Atualiza a porcentagem
    porcentagemEl.textContent = `${porcentagem}%`;

    // Configura as estrelas do painel
    const estrelasDoPainel = resultStars.querySelectorAll(".result-star");

    estrelasDoPainel.forEach((estrela, index) => {
        estrela.classList.toggle("is-earned", index < estrelas);
        estrela.style.setProperty("--star-index", index);
    });

    resultStars.setAttribute(
        "aria-label",
        `${estrelas} ${estrelas === 1 ? "estrela conquistada" : "estrelas conquistadas"}`
    );

    // Mensagens e botões por faixa de aproveitamento
    retryBtn.hidden = true;
    skipBtn.hidden = true;
    medalBtn.hidden = true;
    skipConfirmation.hidden = true;
    medalReveal.hidden = true;
    medalReveal.classList.remove("is-earned");

    if (porcentagem <= 24) {
        tituloEl.textContent = "Vamos tentar de novo! ";
        mensagemPrincipal.textContent =
            "Toda jornada musical tem suas ondas. Você pode tentar novamente!";
        mensagemEl.textContent =
            "Ainda não conquistou estrelas. Refaça a lição e continue praticando.";

        retryBtn.hidden = false;

    } else if (porcentagem <= 49) {
        tituloEl.textContent = "Você encontrou uma estrela! ⭐";
        mensagemPrincipal.textContent =
            "Uma pequena conquista também faz parte da sua jornada!";
        mensagemEl.textContent =
            "Você conquistou uma estrela. Que tal tentar de novo para ganhar mais?";

        retryBtn.hidden = false;

    } else if (porcentagem <= 79) {
        tituloEl.textContent = "Duas estrelas na areia! ⭐⭐";
        mensagemPrincipal.textContent =
            "Você está chegando lá! Mais um pouco de prática pode render sua medalha.";
        mensagemEl.textContent =
            "Você conquistou duas estrelas. Quer tentar melhorar seu resultado ou pular?";

        retryBtn.hidden = false;
        skipBtn.hidden = false;

    } else {
        tituloEl.textContent = "Você arrasou nas ondas! ";
        mensagemPrincipal.textContent =
            "Seu desempenho foi incrível. Você conquistou as três estrelas!";
        mensagemEl.textContent =
            "Sua medalha está esperando por você. Celebre essa conquista!";

        medalBtn.hidden = false;
    }

   
    // Reinicia as animações ao abrir novamente a tela.
    telaFinal.classList.remove("is-active", "is-closing");
    void telaFinal.offsetWidth;

    telaFinal.setAttribute("aria-hidden", "false");
    telaFinal.classList.add("is-active");

    // Impede que o painel anterior cubra a experiência final.
    document.getElementById("feedbackPanel").style.display = "none";
}

/* =====================================================
   BOTÃO REFAZER
   Reinicia a mesma lição desde o início.
   ===================================================== */

document.getElementById("retryLessonBtn")?.addEventListener("click", () => {
    window.location.href = `atividades_sol.html?id=${licaoId}`;
});

/* =====================================================
   BOTÃO PULAR E CONFIRMAÇÃO
   ===================================================== */

document.getElementById("skipLessonBtn")?.addEventListener("click", () => {
    document.getElementById("skipConfirmation").hidden = false;
});

document.getElementById("cancelSkipBtn")?.addEventListener("click", () => {
    document.getElementById("skipConfirmation").hidden = true;
});

document.getElementById("confirmSkipBtn")?.addEventListener("click", () => {
    window.location.href = "../html/trilha_de_aulas.html";
});

/* =====================================================

 /* =====================================================
   BOTÃO RECEBER MEDALHA (FLUXO GAMIFICADO MARINHO)
   ===================================================== */
document.getElementById("receiveMedalBtn")?.addEventListener("click", () => {
    // Esconde a tela final com a onda
    document.getElementById("finalOcean").style.display = "none";

    // Calcula as estrelas baseado nos erros da lição atual
    const totalTentativas = tentativasErradasNestaLicao + 1;
    const porcentagem = Math.round((1 / totalTentativas) * 100);
    let estrelasConquistadas = 0;

    if (porcentagem >= 80) estrelasConquistadas = 3;
    else if (porcentagem >= 50) estrelasConquistadas = 2;
    else if (porcentagem >= 25) estrelasConquistadas = 1;
 
    // Injeta as estrelas-do-mar animadas (Sempre injeta 3 para não quebrar o CSS)
    const containerEstrelas = document.getElementById("duoEstrelasAnimadas");
    containerEstrelas.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        // Se a posição atual for menor que as estrelas ganhas, ela fica ativa.
        const estaPreenchida = i < estrelasConquistadas;
        
        // Cores quentes baseadas na imagem da Estrela-do-mar
        const corPreenchimento = estaPreenchida ? "#023e8a" : "rgba(255, 224, 204, 0.3)"; 
        const corContorno = estaPreenchida ? "#0077b6" : "rgba(176, 190, 197, 0.4)";
        const corBolinhas = estaPreenchida ? "#ffe0cc" : "transparent";
        const opacidadeVazada = estaPreenchida ? "1" : "0.4";

        // Novo SVG com curvas orgânicas gordinhas idênticas à imagem enviada
        const svgEstrelaDoMar = `
            <svg class="duo-estrela-anim" viewBox="0 0 500 500" xmlns="http://w3.org" style="opacity: ${opacidadeVazada};">
                <!-- Corpo Arredondado da Estrela -->
                <path d="M 250,30 
                         C 285,130 330,150 430,170 
                         C 490,182 480,240 410,290 
                         C 345,335 340,360 370,460 
                         C 388,520 330,520 250,450 
                         C 170,520 112,520 130,460 
                         C 160,360 155,335 90,290 
                         C 20,240 10,182 70,170 
                         C 170,150 215,130 250,30 Z" 
                      fill="${corPreenchimento}" 
                      stroke="${corContorno}" 
                      stroke-width="14" 
                      stroke-linejoin="round"/>
                
                <!-- Texturas de bolinhas nas pontas estilo cartoon -->
                <circle cx="250" cy="120" r="12" fill="${corBolinhas}" opacity="0.8"/>
                <circle cx="370" cy="220" r="12" fill="${corBolinhas}" opacity="0.8"/>
                <circle cx="325" cy="380" r="12" fill="${corBolinhas}" opacity="0.8"/>
                <circle cx="175" cy="380" r="12" fill="${corBolinhas}" opacity="0.8"/>
                <circle cx="130" cy="220" r="12" fill="${corBolinhas}" opacity="0.8"/>
            </svg>
        `;

        containerEstrelas.innerHTML += svgEstrelaDoMar;
    }
 
    // Mostra a Tela 1: Estrelas
    const telaEstrelas = document.getElementById("telaEstrelas");
    telaEstrelas.style.display = "flex";
 
  // Ação: Botão Continuar -> Animação da Onda -> Tela da Medalha

  document.getElementById("btnProximoEstrelas").onclick = () => {

    // 1. Cria a onda dinamicamente e joga na tela

    let onda = document.createElement("div");

    onda.className = "onda-transicao";

    document.body.appendChild(onda);

    // 2. Dispara a animação da onda

    // Um pequeno delay ajuda o navegador a renderizar o CSS primeiro

    setTimeout(() => {

        onda.classList.add("animar");

    }, 10);

    // 3. O momento mágico: Exatamente no meio da animação (quando a onda cobre tudo), trocamos a tela por trás!

    setTimeout(() => {

        telaEstrelas.style.display = "none";

        document.getElementById("telaMedalha").style.display = "flex";

    }, 800); // 800ms é metade da animação (1.6s)

    // 4. Limpeza: Remove a onda do HTML depois que ela for embora

    setTimeout(() => {

        onda.remove();

    }, 1700);

};

 
    // Ação: Botão Final -> Salvar e Redirecionar
    document.getElementById("btnIrParaMedalhas").onclick = () => {
        // 1. Salva a chave exata da Clave de Sol para liberar na página de medalhas
        localStorage.setItem("medalha_clave_sol", "true");

        // 2. Redireciona com o título exato para a página piscar a medalha correta
        window.location.href = "../html/medalhas.html?recompensa=true&titulo=Clave de Sol";
    };
});
