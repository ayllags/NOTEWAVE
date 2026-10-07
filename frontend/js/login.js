// ================================
// TROCAR ENTRE LOGIN E CADASTRO
// ================================
function switchTab(tabName) {
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => tab.classList.remove("active"));
    contents.forEach(content => content.classList.remove("active"));

    if (tabName === "login") {
        tabs[0].classList.add("active");
        document.getElementById("loginTab").classList.add("active");
    } else {
        tabs[1].classList.add("active");
        document.getElementById("registerTab").classList.add("active");
    }
}

// ================================
// MOSTRAR / OCULTAR SENHA
// ================================
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Ocultar senha" : "Mostrar senha");
    const icon = button.querySelector("i");
    icon.classList.toggle("ph-eye", !visible);
    icon.classList.toggle("ph-eye-slash", visible);
}

// ================================
// MODAL RECUPERAR SENHA
// ================================
function openForgotModal(event) {
    event.preventDefault();
    document.getElementById("forgotModal").classList.add("active");
}

function closeForgotModal() {
    document.getElementById("forgotModal").classList.remove("active");
}

// ================================
// CHECAR "LEMBRAR DE MIM" AO CARREGAR
// ================================
document.addEventListener("DOMContentLoaded", () => {
    // Limpa a senha salva por versões antigas (senha nunca deve ficar no navegador)
    localStorage.removeItem("remember_pass");

    const savedEmail = localStorage.getItem("remember_email");

    if (savedEmail) {
        document.getElementById("loginEmail").value = savedEmail;
        document.getElementById("rememberMe").checked = true;
    }
});

// ================================
// CADASTRO (NOVO USUÁRIO)
// ================================
document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("regUser").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const acceptTerms = document.getElementById("regTerms").checked;

    if (!acceptTerms) {
        alert("Você precisa aceitar os Termos de Uso e a Política de Privacidade!");
        return;
    }

    try {
        const response = await fetch(`${window.NOTEWAVE_API}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || data.error);
            return;
        }

       // Dentro da função de cadastro do login.js:
       localStorage.setItem("noteWave_user", username);
        alert("Conta criada com sucesso!");
        
        // Vai direto para o perfil
        window.location.href = "perfil.html";

    } catch (error) {
        console.error(error);
        alert("Não foi possível conectar ao servidor. Verifique se o backend está rodando!");
    }
});

// ================================
// LOGIN (USUÁRIO JÁ CADASTRADO)
// ================================
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    try {
        const response = await fetch(`${window.NOTEWAVE_API}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || data.error);
            return;
        }

        if (rememberMe) {
            localStorage.setItem("remember_email", email);
        } else {
            localStorage.removeItem("remember_email");
        }

        localStorage.setItem("noteWave_user", data.username || data.user?.username);

        alert("Login realizado com sucesso!");
        window.location.href = "perfil.html";

    } catch (error) {
        console.error(error);
        alert("Não foi possível conectar ao servidor.");
    }
});

// ================================
// RECUPERAÇÃO DE SENHA
// ================================
document.getElementById("forgotForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // A recuperação de senha ainda não tem endpoint no backend.
    // Quando for implementada, deve enviar um link com token expirável por e-mail
    // e nunca devolver a senha na resposta.
    alert("A recuperação de senha ainda está em desenvolvimento. Em breve você poderá redefinir sua senha por e-mail.");
    closeForgotModal();
});
