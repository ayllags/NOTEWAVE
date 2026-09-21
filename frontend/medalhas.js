// Mapeamento de qual módulo desbloqueia qual medalha
const regrasMedalhas = {
    'Primeiros Passos': 'modulo1',
    'Ritmo e Pulsação': 'modulo2',
    'Leitura Avançada': 'modulo3'
};

function atualizarMedalhas() {
    // Busca o progresso atualizado que foi salvo no localStorage
    const dadosProgresso = JSON.parse(localStorage.getItem('progressoModulos')) || { modulo1: 0, modulo2: 0, modulo3: 0 };
    
    const cardsMedalhas = document.querySelectorAll('.card-medalha');
    
    cardsMedalhas.forEach(card => {
        const nomeMedalha = card.querySelector('h3').textContent;
        const moduloCorrespondente = rulesMedalhas[nomeMedalha] || regrasMedalhas[nomeMedalha];
        
        if (moduloCorrespondente) {
            const progressoDoModulo = dadosProgresso[moduloCorrespondente];
            const iconeContainer = card.querySelector('.icone-medalha');
            const statusTexto = card.querySelector('.status');
            
            // Se o módulo está 100% concluído, desbloqueia a medalha
            if (progressoDoModulo === 100) {
                card.classList.remove('bloqueada');
                card.classList.add('ativa');
                statusTexto.textContent = 'Desbloqueado';
                
                // Define um ícone musical específico caso estivesse com cadeado
                if (nomeMedalha === 'Ritmo e Pulsação') {
                    iconeContainer.innerHTML = '<i class="fa-solid fa-drum"></i>';
                } else if (nomeMedalha === 'Leitura Avançada') {
                    iconeContainer.innerHTML = '<i class="fa-solid fa-book-open-reader"></i>';
                }
            } else {
                // Garante que permaneça bloqueada caso não tenha atingido 100%
                card.classList.remove('ativa');
                card.classList.add('bloqueada');
                statusTexto.textContent = 'Bloqueado';
                iconeContainer.innerHTML = '<i class="fa-solid fa-lock"></i>';
            }
        }
    });
}

// Executa a verificação assim que a página de medalhas abre
document.addEventListener('DOMContentLoaded', atualizarMedalhas);