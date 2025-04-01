// Elementos do tema
const themeToggle = document.getElementById('theme-toggle');
const icon = themeToggle.querySelector('i');

// Carrega o tema salvo ou detecta preferência do sistema
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
}

// Alterna entre temas claro/escuro
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

// Inicialização
loadTheme();
themeToggle.addEventListener('click', toggleTheme);

// Variável global para moeda selecionada
let moedaSelecionada = "USD";

// Configuração dos botões de moeda
document.querySelectorAll('.moeda-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove a classe 'active' de todos os botões
        document.querySelectorAll('.moeda-btn').forEach(b => b.classList.remove('active'));
        // Adiciona 'active' apenas ao botão clicado
        this.classList.add('active');
        // Atualiza a moeda selecionada
        moedaSelecionada = this.dataset.moeda;
    });
});

// Função principal de conversão
async function conversor() {
    // Obtém e valida o valor de entrada
    const inputValor = parseFloat(document.getElementById("valor").value);
    const resultadoElemento = document.getElementById("resultado");
    const converterBtn = document.querySelector('.converter-btn');
    
    // Validações
    if (!inputValor || isNaN(inputValor)) {
        resultadoElemento.innerHTML = "❌ Digite um valor válido";
        return;
    }
    
    if (inputValor <= 0) {
        resultadoElemento.innerHTML = "❌ Valor deve ser maior que zero";
        return;
    }

    // Feedback visual durante a conversão
    converterBtn.disabled = true;
    converterBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Convertendo...';
    resultadoElemento.innerHTML = "🔍 Calculando...";

    // Configuração das moedas
    const moedaOrigem = "BRL";
    const moedaDestino = moedaSelecionada;
    
    // Taxas de fallback (caso a API falhe)
    const taxasFallback = {
        USD: 0.18,  // 1 BRL = 0.18 USD (exemplo)
        EUR: 0.16   // 1 BRL = 0.16 EUR (exemplo)
    };

    try {
        // Tentativa de obter taxas atualizadas da API
        const resposta = await fetch(`https://api.exchangerate-api.com/v4/latest/${moedaOrigem}`);
        if (!resposta.ok) throw new Error("API offline");
        
        // Processamento dos dados da API
        const dados = await resposta.json();
        const taxa = dados.rates[moedaDestino] || taxasFallback[moedaDestino];
        const resultado = (inputValor * taxa).toFixed(2);
        
        // Formatação dos valores para exibição
        const formatacoes = {
            USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(resultado),
            EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(resultado)
        };
        
        // Formata o valor em BRL
        const valorBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inputValor);
        
        // Exibe o resultado formatado
        resultadoElemento.innerHTML = `💰 ${valorBRL} = ${formatacoes[moedaDestino]}`;
        
    } catch (error) {
        // Fallback em caso de erro na API
        console.error("Erro na API:", error);
        const taxa = taxasFallback[moedaDestino];
        const resultado = (inputValor * taxa).toFixed(2);
        resultadoElemento.innerHTML = `⚠️ Valor aproximado:<br>${inputValor.toLocaleString('pt-BR')} BRL ≈ ${resultado} ${moedaDestino}`;
    } finally {
        // Restaura o botão de conversão
        converterBtn.disabled = false;
        converterBtn.textContent = 'Bora converter!';
    }
}

// Permite converter pressionando Enter
document.getElementById("valor").addEventListener("keypress", function(event) {
    if (event.key === "Enter") conversor();
});