// Carregar medicamentos da API
// Se quiser apontar para um backend específico, defina window.API_BASE_URL no HTML
// Ex: <script>window.API_BASE_URL = 'https://seu-dominio.com';</script>
var API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) ? window.API_BASE_URL : '';

function buildApiUrl(path) {
	// Se API_BASE_URL estiver definido, usa absoluto; senão usa caminho relativo
	return API_BASE_URL ? API_BASE_URL + path : path;
}

var medicamentos = {};

function fetchMedicamentos(callback) {
	const primaryUrl = buildApiUrl('/api/medicamentos');
	const fallbackUrl = 'http://localhost:3000/api/medicamentos';

	function processData(data) {
		// Corrigir caso venha com .default
		if (data && data.default) {
			medicamentos = data.default;
		} else {
			medicamentos = data || {};
		}
		
		// Normalizar status dos medicamentos do banco de dados
		for (const categoria in medicamentos) {
			if (Array.isArray(medicamentos[categoria])) {
				medicamentos[categoria] = medicamentos[categoria].map(med => ({
					...med,
					status: normalizeStatus(med.status)
				}));
			}
		}
		
		if (typeof callback === 'function') callback();
	}

	function fetchFrom(url, isFallback) {
		return fetch(url)
			.then(function(response) {
				if (response.ok) {
					return response.json();
				} else {
					console.error('Erro ao buscar medicamentos:', response.status, response.statusText, 'URL:', url);
					// Se não for fallback e existir URL de fallback diferente, tentar
					if (!isFallback && url !== fallbackUrl) {
						console.log('Tentando API de fallback em localhost...');
						return fetchFrom(fallbackUrl, true);
					}
					return {};
				}
			})
			.catch(function(error) {
				console.error('Erro de conexão com a API de medicamentos:', error, 'URL:', url);
				if (!isFallback && url !== fallbackUrl) {
					console.log('Tentando API de fallback em localhost após erro de conexão...');
					return fetchFrom(fallbackUrl, true);
				}
				return {};
			});
	}

	fetchFrom(primaryUrl, false).then(processData);
}

// Funções auxiliares
function getStatusText(status) {
    const statusTexts = {
        'in-stock': 'EM ESTOQUE',
        'low-stock': 'ESTOQUE BAIXO',
        'out-of-stock': 'FORA DE ESTOQUE'
    };
    return statusTexts[status] || 'DESCONHECIDO';
}

function getCategoryName(categoryKey) {
    const categoryNames = {
        'analgesicos': 'Analgésicos e Sedativos',
        'antibioticos': 'Antibióticos',
        'cardiovasculares': 'Cardiovasculares',
        'solucoes': 'Soluções e Eletrólitos',
        'anticoagulantes': 'Anticoagulantes',
        'anticonvulsivantes': 'Anticonvulsivantes',
        'corticoides': 'Corticoides',
        'antiemeticos': 'Antieméticos',
        'outros': 'Outros Essenciais'
    };
    return categoryNames[categoryKey] || 'Medicamento';
}

// Função para renderizar os medicamentos na tela
function renderMedicines(category = 'all', searchTerm = '') {
    console.log('Medicamentos carregados:', medicamentos);
    if (!window.medicinesContainer) {
        console.error('Container de medicamentos não encontrado');
        return;
    }
    
    window.medicinesContainer.innerHTML = '';
    
    // Verificar se há medicamentos
    if (!medicamentos || Object.keys(medicamentos).length === 0) {
        window.medicinesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-pills" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3>Nenhum medicamento encontrado</h3>
                <p>Os medicamentos serão exibidos aqui quando disponíveis.</p>
            </div>
        `;
        return;
    }
    
    let medicinesToShow = [];
    if (category === 'all') {
        for (const cat in medicamentos) {
            if (Array.isArray(medicamentos[cat])) {
                medicinesToShow = medicinesToShow.concat(medicamentos[cat]);
            }
        }
    } else {
        medicinesToShow = Array.isArray(medicamentos[category]) ? medicamentos[category] : [];
    }
    
    if (searchTerm) {
        medicinesToShow = medicinesToShow.filter(function(med) {
            return med.nome && med.nome.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }
    
    if (medicinesToShow.length === 0) {
        window.medicinesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3>Nenhum medicamento encontrado</h3>
                <p>Tente ajustar os filtros de busca ou categoria.</p>
            </div>
        `;
        return;
    }
    medicinesToShow.forEach(function(med) {
        var medicineCard = document.createElement('div');
        medicineCard.className = 'medicine-card';
        
        // Encontrar a categoria do medicamento
        let medCategory = category;
        if (category === 'all') {
            for (const cat in medicamentos) {
                if (medicamentos[cat].some(m => m.nome === med.nome)) {
                    medCategory = cat;
                    break;
                }
            }
        }
        
        medicineCard.innerHTML = `
            <div class="medicine-header">
                <h3 class="medicine-name">${med.nome}</h3>
                <span class="medicine-category">${category === 'all' ? '' : getCategoryName(category)}</span>
            </div>
            <div class="medicine-body">
                <div class="medicine-info">
                    <div class="info-item">
                        <span class="info-label">Uso:</span>
                        <span>${med.uso}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Quantidade:</span>
                        <span class="quantity-display">${med.quantidade} unidades</span>
                        <button class="btn btn-sm btn-edit-quantity" data-medicine='${JSON.stringify(med).replace(/'/g, "&#39;")}' data-category="${medCategory}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="stock-status ${med.status}">${getStatusText(med.status)}</span>
                    </div>
                </div>
            </div>
        `;
        window.medicinesContainer.appendChild(medicineCard);
        
        // Adicionar event listener ao botão de editar
        const editBtn = medicineCard.querySelector('.btn-edit-quantity');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                const medicineData = JSON.parse(this.getAttribute('data-medicine'));
                openQuantityModal(medicineData, medicineCard);
            });
        }
    });
}

// Inicialização dinâmica ao carregar medicamentos e navegação
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar variáveis do modal de quantidade
    quantityModal = document.getElementById('quantityModal');
    decreaseBtn = document.getElementById('decrease-btn');
    increaseBtn = document.getElementById('increase-btn');
    newQuantityInput = document.getElementById('new-quantity');
    currentQuantityDisplay = document.getElementById('current-quantity');
    stockStatusPreview = document.getElementById('stock-status-preview');
    quantityModalTitle = document.getElementById('quantityModalTitle');
    saveQuantityBtn = document.getElementById('saveQuantityBtn');
    cancelQuantityBtn = document.getElementById('cancelQuantityBtn');
    
    // Inicializar outras variáveis
    logoutModal = document.getElementById('logoutModal');
    toast = document.getElementById('toast');
    logoutBtn = document.getElementById('logout-btn');
    cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    clearFormBtn = document.getElementById('clear-form');
    saveProntuarioBtn = document.getElementById('save-prontuario');
    
    // Inicializar variáveis globais após DOM pronto
    window.medicinesContainer = document.getElementById('medicines-container');
    navLinks = document.querySelectorAll('.nav-link');
    pageContents = document.querySelectorAll('.page-content');
    pageTitle = document.getElementById('pageTitle');
    categoryButtons = document.querySelectorAll('.category-btn');
    searchInput = document.querySelector('.search-input');
    
    // Tornar pageTitles acessível globalmente
    window.pageTitles = pageTitles;

    fetchMedicamentos(function() {
        renderMedicines();
    });
    
    // Controles de quantidade no modal
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(newQuantityInput.value);
            if (currentValue > 0) {
                newQuantityInput.value = currentValue - 1;
                updateStockStatusPreview(newQuantityInput.value);
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', function() {
            const currentValue = parseInt(newQuantityInput.value);
            newQuantityInput.value = currentValue + 1;
            updateStockStatusPreview(newQuantityInput.value);
        });
    }

    if (newQuantityInput) {
        newQuantityInput.addEventListener('input', function() {
            updateStockStatusPreview(this.value);
        });
    }

    // Salvar quantidade
    if (saveQuantityBtn) {
        saveQuantityBtn.addEventListener('click', saveQuantity);
    }

    // Cancelar alteração de quantidade
    if (cancelQuantityBtn) {
        cancelQuantityBtn.addEventListener('click', function() {
            if (quantityModal) {
                quantityModal.style.display = 'none';
            }
        });
    }
    
    // Funcionalidade do botão Sair
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (logoutModal) {
                logoutModal.style.display = 'flex';
            }
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', function() {
            if (logoutModal) {
                logoutModal.style.display = 'none';
            }
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', function() {
            if (logoutModal) {
                logoutModal.style.display = 'none';
            }
            showToast('Saindo do sistema...', 'warning');
            
            setTimeout(() => {
                alert('Você foi desconectado do sistema. Redirecionando para a página de login...');
            }, 2000);
        });
    }

    // Limpar formulário
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todos os campos do prontuário?')) {
                limparFormularioProntuario();
                showToast('Formulário limpo!', 'success');
            }
        });
    }

    // Fechar modais
    const closeButtons = document.querySelectorAll('.close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Fechar modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
        if (event.target === quantityModal) {
            quantityModal.style.display = 'none';
        }
    });

    // Ativação dos botões de categoria
    if (categoryButtons && categoryButtons.length > 0) {
        categoryButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                categoryButtons.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-category');
                renderMedicines(currentCategory, searchInput ? searchInput.value : '');
            });
        });
    }

    // Ativação do filtro de busca
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var activeCategory = 'all';
            var activeBtn = document.querySelector('.category-btn.active');
            if (activeBtn) {
                activeCategory = activeBtn.getAttribute('data-category');
            }
            renderMedicines(activeCategory, searchInput.value);
        });
    }

    // Navegação entre páginas
    if (navLinks && navLinks.length > 0) {
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(event) {
                if (link.id === 'logout-btn') {
                    if (logoutModal) {
                        logoutModal.style.display = 'flex';
                    }
                    return;
                }

                event.preventDefault();
                var page = link.getAttribute('data-page');
                if (!page) return;

                navegarParaPagina(page);
            });
        });
    }
});
// Variáveis do modal de quantidade (serão inicializadas no DOMContentLoaded)
let decreaseBtn, increaseBtn, newQuantityInput, currentQuantityDisplay;
let stockStatusPreview, quantityModalTitle, quantityModal;
let saveQuantityBtn, cancelQuantityBtn;

// Variáveis globais
let currentCategory = 'all';
let currentMedicine = null;
let currentMedicineElement = null;
let navLinks, pageContents, pageTitle, categoryButtons, searchInput;

// Títulos das páginas
const pageTitles = {
    'estoque': 'Controle de Estoque - Medicamentos',
    'prontuario': 'Prontuário Eletrônico',
    'prontuarios-salvos': 'Prontuários Salvos',
    'checklist': 'Checklist de Plantão - Passagem',
    'configuracoes': 'Configurações do Sistema'
};

// Função para normalizar status do banco de dados
function normalizeStatus(status) {
    if (!status) return 'in-stock';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('estoque') && !statusLower.includes('baixo') && !statusLower.includes('fora')) {
        return 'in-stock';
    } else if (statusLower.includes('baixo')) {
        return 'low-stock';
    } else if (statusLower.includes('fora')) {
        return 'out-of-stock';
    }
    return 'in-stock';
}

// DADOS INICIAIS PARA DEMONSTRAÇÃO
let teamMembers = [
    { id: 1, name: "Dra. Ana Silva", role: "Médica Plantonista", status: "present" },
    { id: 2, name: "Enf. Carlos Santos", role: "Enfermeiro Chefe", status: "present" },
    { id: 3, name: "Téc. Maria Oliveira", role: "Técnica de Enfermagem", status: "present" },
    { id: 4, name: "Téc. João Pereira", role: "Técnico de Enfermagem", status: "absent" }
];

let patients = [
    { 
        id: 1, 
        name: "João da Silva", 
        bed: "Leito 201 - Enfermaria A", 
        diagnosis: "Pneumonia bacteriana com dificuldade respiratória - Monitorar SpO2 a cada 2h", 
        priority: "high" 
    },
    { 
        id: 2, 
        name: "Maria Santos", 
        bed: "Leito 205 - Enfermaria A", 
        diagnosis: "Pós-operatório de colecistectomia - Controle de dor e verificação de curativo", 
        priority: "medium" 
    },
    { 
        id: 3, 
        name: "Pedro Oliveira", 
        bed: "Leito 208 - Enfermaria A", 
        diagnosis: "Hipertensão arterial controlada - Medicações de rotina", 
        priority: "low" 
    },
    { 
        id: 4, 
        name: "Ana Costa", 
        bed: "Leito 210 - Enfermaria A", 
        diagnosis: "ICC descompensada - Restrição hídrica rigorosa, diurese horária", 
        priority: "high" 
    }
];

// ========== SISTEMA DE PRONTUÁRIOS SALVOS ==========

let prontuariosSalvos = JSON.parse(localStorage.getItem('prontuariosSalvos')) || [];

// Salvar prontuário
function salvarProntuario() {
    const patientName = document.getElementById('patient-name').value.trim();
    if (!patientName) {
        showToast('Preencha o nome do paciente antes de salvar!', 'error');
        return;
    }

    // Coletar dados do prontuário
    const prontuario = {
        id: Date.now(),
        paciente: {
            nome: patientName,
            info: document.getElementById('patient-info').value.trim()
        },
        vitais: coletarSinaisVitais(),
        historico: document.getElementById('current-illness').value.trim(),
        exameFisico: document.getElementById('physical-exam').value.trim(),
        diagnostico: document.getElementById('diagnosis').value.trim(),
        tratamento: document.getElementById('treatment').value.trim(),
        evolucao: document.getElementById('evolution').value.trim(),
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };

    // Adicionar à lista de prontuários salvos
    prontuariosSalvos.unshift(prontuario);
    
    // Salvar no localStorage
    localStorage.setItem('prontuariosSalvos', JSON.stringify(prontuariosSalvos));
    
    console.log('Prontuário salvo:', prontuario);
    console.log('Total de prontuários salvos:', prontuariosSalvos.length);
    
    // Limpar formulário
    limparFormularioProntuario();
    
    // Navegar para a página de prontuários salvos (isso já chama renderProntuariosSalvos)
    navegarParaPagina('prontuarios-salvos');
    
    // Garantir que a renderização aconteça após um pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
        renderProntuariosSalvos();
    }, 100);
    
    showToast('Prontuário salvo com sucesso!', 'success');
}

// Coletar sinais vitais
function coletarSinaisVitais() {
    const vitalInputs = document.querySelectorAll('.vital-input');
    const vitalLabels = document.querySelectorAll('.vital-label');
    const vitais = {};
    
    vitalInputs.forEach((input, index) => {
        const label = vitalLabels[index].textContent.toLowerCase().replace(' ', '_');
        vitais[label] = input.value.trim() || '--';
    });
    
    return vitais;
}

// Limpar formulário do prontuário
function limparFormularioProntuario() {
    const formInputs = document.querySelectorAll('#prontuario-page input, #prontuario-page textarea');
    formInputs.forEach(input => {
        input.value = '';
    });
}

// Renderizar prontuários salvos
function renderProntuariosSalvos(attempt = 0) {
    // Tenta encontrar os elementos
    const prontuariosGrid = document.getElementById('prontuarios-grid');
    const emptyState = document.getElementById('empty-prontuarios');
    const pageActive = document.querySelector('#prontuarios-salvos-page.active');
    
    // Verifica se a página está ativa e se os elementos existem
    if (!pageActive || !prontuariosGrid) {
        if (attempt < 10) { // Tenta até 10 vezes com intervalo de 100ms
            console.log(`Aguardando carregamento da página de prontuários... (tentativa ${attempt + 1})`);
            setTimeout(() => renderProntuariosSalvos(attempt + 1), 100);
            return;
        } else {
            console.error('Elemento prontuarios-grid não encontrado no DOM após várias tentativas');
            return;
        }
    }
    
    // Recarregar do localStorage para garantir que temos os dados mais recentes
    const prontuariosSalvosAtualizados = JSON.parse(localStorage.getItem('prontuariosSalvos')) || [];
    prontuariosSalvos = prontuariosSalvosAtualizados;
    
    console.log('Renderizando prontuários. Total:', prontuariosSalvos.length);
    
    prontuariosGrid.innerHTML = '';
    
    if (prontuariosSalvos.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    prontuariosSalvos.forEach((prontuario, index) => {
        const prontuarioCard = document.createElement('div');
        prontuarioCard.className = 'prontuario-card';
        
        // Função auxiliar para escapar HTML
        const escapeHtml = (text) => {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        const nomePaciente = escapeHtml(prontuario.paciente?.nome || 'Sem nome');
        const infoPaciente = escapeHtml(prontuario.paciente?.info || 'Sem informações adicionais');
        const dataFormatada = formatarData(prontuario.dataCriacao);
        const historico = prontuario.historico ? escapeHtml(prontuario.historico.substring(0, 100)) + (prontuario.historico.length > 100 ? '...' : '') : 'Sem histórico registrado';
        const diagnostico = prontuario.diagnostico ? escapeHtml(prontuario.diagnostico.substring(0, 80)) + (prontuario.diagnostico.length > 80 ? '...' : '') : '';
        
        prontuarioCard.innerHTML = `
            <div class="prontuario-header">
                <div class="prontuario-paciente">
                    <div class="prontuario-nome">${nomePaciente}</div>
                    <div class="prontuario-info">${infoPaciente}</div>
                </div>
                <div class="prontuario-data">${dataFormatada}</div>
            </div>
            
            <div class="prontuario-content">
                <div class="prontuario-resumo">${historico}</div>
                ${diagnostico ? `
                    <div class="prontuario-diagnostico">
                        <strong>Diagnóstico:</strong> ${diagnostico}
                    </div>
                ` : ''}
            </div>
            
            <div class="prontuario-actions">
                <button class="btn btn-sm btn-view" onclick="visualizarProntuario(${prontuario.id})">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn btn-sm btn-primary" onclick="imprimirProntuarioSalvo(${prontuario.id})">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button class="btn btn-sm btn-delete" onclick="deletarProntuario(${prontuario.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        prontuariosGrid.appendChild(prontuarioCard);
        
        console.log(`Prontuário ${index + 1} renderizado:`, prontuario.paciente?.nome);
    });
    
    console.log(`Total de ${prontuariosSalvos.length} prontuário(s) renderizado(s)`);
}

// Visualizar prontuário
function visualizarProntuario(id) {
    const prontuario = prontuariosSalvos.find(p => p.id === id);
    if (!prontuario) return;
    
    // Criar modal de visualização
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content prontuario-modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Prontuário - ${prontuario.paciente.nome}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="prontuario-modal-body">
                <div class="prontuario-view">
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Dados do Paciente</h4>
                        <div class="prontuario-view-content">
                            <p><strong>Nome:</strong> ${prontuario.paciente.nome}</p>
                            <p><strong>Informações:</strong> ${prontuario.paciente.info || 'Não informado'}</p>
                            <p><strong>Data do Atendimento:</strong> ${formatarDataCompleta(prontuario.dataCriacao)}</p>
                        </div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Sinais Vitais</h4>
                        <div class="vitais-grid">
                            ${Object.entries(prontuario.vitais).map(([key, value]) => `
                                <div class="vital-view-item">
                                    <div class="vital-value">${value}</div>
                                    <div class="vital-label">${formatarLabelVital(key)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">História da Doença Atual</h4>
                        <div class="prontuario-view-content">${prontuario.historico || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Exame Físico</h4>
                        <div class="prontuario-view-content">${prontuario.exameFisico || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Diagnóstico</h4>
                        <div class="prontuario-view-content">${prontuario.diagnostico || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Conduta e Prescrições</h4>
                        <div class="prontuario-view-content">${prontuario.tratamento || 'Não informado'}</div>
                    </div>
                    
                    <div class="prontuario-view-section">
                        <h4 class="prontuario-view-title">Evolução</h4>
                        <div class="prontuario-view-content">${prontuario.evolucao || 'Não informado'}</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Fechar</button>
                <button class="btn btn-primary" onclick="imprimirProntuarioSalvo(${prontuario.id})">
                    <i class="fas fa-print"></i> Imprimir
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Deletar prontuário
function deletarProntuario(id) {
    if (confirm('Tem certeza que deseja excluir este prontuário?')) {
        prontuariosSalvos = prontuariosSalvos.filter(p => p.id !== id);
        localStorage.setItem('prontuariosSalvos', JSON.stringify(prontuariosSalvos));
        renderProntuariosSalvos();
        showToast('Prontuário excluído com sucesso!', 'success');
    }
}

// Imprimir prontuário salvo
function imprimirProntuarioSalvo(id) {
    const prontuario = prontuariosSalvos.find(p => p.id === id);
    if (!prontuario) return;
    
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Construir o conteúdo HTML para impressão
    const vitaisHTML = Object.entries(prontuario.vitais).map(([key, value]) => `
        <div style="flex: 1; text-align: center; padding: 10px; border: 1px solid #ddd; margin: 5px; border-radius: 5px;">
            <div style="font-weight: bold; color: #2c7fb8;">${formatarLabelVital(key)}</div>
            <div style="font-size: 1.2em; margin-top: 5px;">${value}</div>
        </div>
    `).join('');
    
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prontuário - ${prontuario.paciente.nome}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #2c7fb8;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .header h1 {
                color: #2c7fb8;
                margin-bottom: 5px;
                font-size: 24px;
            }
            
            .section {
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            
            .section-title {
                color: #2c7fb8;
                border-bottom: 2px solid #2c7fb8;
                padding-bottom: 8px;
                margin-bottom: 15px;
                font-size: 18px;
                font-weight: bold;
            }
            
            .patient-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #2c7fb8;
            }
            
            .vital-signs {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin: 15px 0;
                justify-content: space-between;
            }
            
            .content-box {
                background: #fafafa;
                border: 1px solid #e0e0e0;
                padding: 15px;
                border-radius: 5px;
                min-height: 80px;
                white-space: pre-wrap;
                line-height: 1.5;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
            
            .signature-area {
                margin-top: 60px;
                text-align: center;
            }
            
            .signature-line {
                border-top: 1px solid #000;
                width: 300px;
                margin: 40px auto 10px auto;
                padding-top: 10px;
            }
            
            @media print {
                body { margin: 0; padding: 15px; font-size: 14px; }
                .no-print { display: none !important; }
                .section { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>PRONTUÁRIO MÉDICO</h1>
            <p><strong>Hospital MedControl</strong></p>
            <p>${formatarDataCompleta(prontuario.dataCriacao)}</p>
        </div>
        
        <div class="section">
            <h2 class="section-title">DADOS DO PACIENTE</h2>
            <div class="patient-info">
                <p><strong>Nome:</strong> ${prontuario.paciente.nome}</p>
                <p><strong>Informações:</strong> ${prontuario.paciente.info || 'Não informado'}</p>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">SINAIS VITAIS</h2>
            <div class="vital-signs">${vitaisHTML}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">HISTÓRIA DA DOENÇA ATUAL</h2>
            <div class="content-box">${prontuario.historico || 'Não informado'}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">EXAME FÍSICO</h2>
            <div class="content-box">${prontuario.exameFisico || 'Não informado'}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">DIAGNÓSTICO</h2>
            <div class="content-box">${prontuario.diagnostico || 'Não informado'}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">CONDUTA E PRESCRIÇÕES</h2>
            <div class="content-box">${prontuario.tratamento || 'Não informado'}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">EVOLUÇÃO</h2>
            <div class="content-box">${prontuario.evolucao || 'Não informado'}</div>
        </div>
        
        <div class="signature-area">
            <div class="signature-line"></div>
            <p><strong>Dr(a). karol</strong></p>
            <p>Médica Plantonista | CRM: XX/XXXXX</p>
        </div>
        
        <div class="footer">
            <p>Documento gerado automaticamente pelo Sistema MedControl</p>
            <p>Data de emissão: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2c7fb8; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🖨️ Imprimir Documento
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                ❌ Fechar
            </button>
        </div>
    </body>
    </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    showToast('Abrindo visualização de impressão...', 'success');
}

// Funções auxiliares
function formatarData(dataISO) {
    return new Date(dataISO).toLocaleDateString('pt-BR');
}

function formatarDataCompleta(dataISO) {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatarLabelVital(key) {
    const labels = {
        'peso': 'Peso',
        'altura': 'Altura',
        'imc': 'IMC',
        'pressão': 'Pressão',
        'freq._cardíaca': 'Freq. Cardíaca',
        'temperatura': 'Temperatura'
    };
    return labels[key] || key;
}

// ========== FUNCIONALIDADE DE IMPRESSÃO DO PRONTUÁRIO ATUAL ==========

function printProntuario() {
    const patientName = document.getElementById('patient-name').value;
    if (!patientName) {
        showToast('Preencha o nome do paciente antes de imprimir!', 'error');
        return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const patientInfo = document.getElementById('patient-info').value || 'Não informado';
    const currentIllness = document.getElementById('current-illness').value || 'Não informado';
    const physicalExam = document.getElementById('physical-exam').value || 'Não informado';
    const diagnosis = document.getElementById('diagnosis').value || 'Não informado';
    const treatment = document.getElementById('treatment').value || 'Não informado';
    const evolution = document.getElementById('evolution').value || 'Não informado';
    
    const vitalInputs = document.querySelectorAll('.vital-input');
    const vitalLabels = document.querySelectorAll('.vital-label');
    let vitaisHTML = '';
    
    vitalInputs.forEach((input, index) => {
        const valor = input.value || '--';
        const label = vitalLabels[index].textContent;
        vitaisHTML += `
            <div style="flex: 1; text-align: center; padding: 10px; border: 1px solid #ddd; margin: 5px; border-radius: 5px;">
                <div style="font-weight: bold; color: #2c7fb8;">${label}</div>
                <div style="font-size: 1.2em; margin-top: 5px;">${valor}</div>
            </div>
        `;
    });

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prontuário - ${patientName}</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 3px solid #2c7fb8; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #2c7fb8; margin-bottom: 5px; font-size: 24px; }
            .section { margin-bottom: 25px; page-break-inside: avoid; }
            .section-title { color: #2c7fb8; border-bottom: 2px solid #2c7fb8; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px; font-weight: bold; }
            .patient-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2c7fb8; }
            .vital-signs { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; justify-content: space-between; }
            .content-box { background: #fafafa; border: 1px solid #e0e0e0; padding: 15px; border-radius: 5px; min-height: 80px; white-space: pre-wrap; line-height: 1.5; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            .signature-area { margin-top: 60px; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 300px; margin: 40px auto 10px auto; padding-top: 10px; }
            @media print { body { margin: 0; padding: 15px; font-size: 14px; } .no-print { display: none !important; } .section { page-break-inside: avoid; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>PRONTUÁRIO MÉDICO</h1>
            <p><strong>Hospital MedControl</strong></p>
            <p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="section">
            <h2 class="section-title">DADOS DO PACIENTE</h2>
            <div class="patient-info">
                <p><strong>Nome:</strong> ${patientName}</p>
                <p><strong>Informações:</strong> ${patientInfo}</p>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">SINAIS VITAIS</h2>
            <div class="vital-signs">${vitaisHTML}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">HISTÓRIA DA DOENÇA ATUAL</h2>
            <div class="content-box">${currentIllness}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">EXAME FÍSICO</h2>
            <div class="content-box">${physicalExam}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">DIAGNÓSTICO</h2>
            <div class="content-box">${diagnosis}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">CONDUTA E PRESCRIÇÕES</h2>
            <div class="content-box">${treatment}</div>
        </div>
        
        <div class="section">
            <h2 class="section-title">EVOLUÇÃO</h2>
            <div class="content-box">${evolution}</div>
        </div>
        
        <div class="signature-area">
            <div class="signature-line"></div>
            <p><strong>Dr(a). karol</strong></p>
            <p>Médica Plantonista | CRM: XX/XXXXX</p>
        </div>
        
        <div class="footer">
            <p>Documento gerado automaticamente pelo Sistema MedControl</p>
            <p>Data de emissão: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2c7fb8; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🖨️ Imprimir Documento
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                ❌ Fechar
            </button>
        </div>
    </body>
    </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    showToast('Abrindo visualização de impressão...', 'success');
}

// ========== FUNÇÕES PARA CONTROLE DE TAMANHO DA FONTE ==========

function applyFontSize(size) {
    document.documentElement.style.setProperty('--base-font-size', size + 'px');
    localStorage.setItem('fontSize', size.toString());
    updateFontSizeControls(size);
}

function updateFontSizeControls(currentSize) {
    const slider = document.getElementById('fontSizeSlider');
    const valueDisplay = document.getElementById('fontSizeValue');
    const presetButtons = document.querySelectorAll('.font-size-btn');
    
    if (slider) slider.value = currentSize;
    if (valueDisplay) valueDisplay.textContent = currentSize + 'px';
    
    presetButtons.forEach(btn => {
        btn.classList.remove('active');
        const btnSize = parseInt(btn.getAttribute('data-size'));
        if (btnSize === currentSize) btn.classList.add('active');
    });
}

function loadSavedFontSize() {
    const savedSize = localStorage.getItem('fontSize');
    applyFontSize(savedSize ? parseInt(savedSize) : 16);
}

function initializeFontSizeControls() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizePresets = document.querySelectorAll('.font-size-btn');
    
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', function() {
            applyFontSize(parseInt(this.value));
        });
    }
    
    fontSizePresets.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = parseInt(this.getAttribute('data-size'));
            applyFontSize(size);
            showToast(`Tamanho da fonte alterado para ${this.textContent.toLowerCase()}`, 'success');
        });
    });
    
    loadSavedFontSize();
}

// ========== FUNÇÕES PARA CONTROLE DE TEMA ==========

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    updateThemePreviews(savedTheme);
}

function updateThemePreviews(activeTheme) {
    const themePreviews = document.querySelectorAll('.theme-preview');
    themePreviews.forEach(preview => {
        preview.classList.remove('active');
        if (preview.getAttribute('data-theme') === activeTheme) {
            preview.classList.add('active');
        }
    });
}

function initializeThemeControls() {
    const themePreviews = document.querySelectorAll('.theme-preview');
    
    themePreviews.forEach(preview => {
        preview.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            applyTheme(theme);
            updateThemePreviews(theme);
            showToast(`Tema ${theme === 'dark' ? 'escuro' : 'claro'} aplicado!`, 'success');
        });
    });
    
    loadSavedTheme();
}

// ========== FUNÇÃO PARA REDEFINIR CONFIGURAÇÕES ==========

function resetAppearanceSettings() {
    if (confirm('Tem certeza que deseja redefinir todas as configurações de aparência para os padrões?')) {
        localStorage.removeItem('fontSize');
        applyFontSize(16);
        localStorage.removeItem('theme');
        applyTheme('light');
        showToast('Configurações de aparência redefinidas para os padrões!', 'success');
    }
}

// ========== FUNÇÕES EXISTENTES DO SISTEMA ==========

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('pt-BR', options);
    }
}

function loadMedicines(category = 'all', searchTerm = '') {
    // Usar a mesma função renderMedicines para manter consistência
    renderMedicines(category, searchTerm);
}


function openQuantityModal(medicine, medicineElement) {
    if (!quantityModal || !quantityModalTitle || !currentQuantityDisplay || !newQuantityInput) {
        console.error('Modal de quantidade não está inicializado');
        return;
    }
    
    currentMedicine = medicine;
    currentMedicineElement = medicineElement;
    
    quantityModalTitle.textContent = `Alterar Quantidade - ${medicine.nome}`;
    currentQuantityDisplay.textContent = `${medicine.quantidade} unidades`;
    newQuantityInput.value = medicine.quantidade;
    
    updateStockStatusPreview(medicine.quantidade);
    
    quantityModal.style.display = 'flex';
}

function updateStockStatusPreview(quantity) {
    if (!stockStatusPreview) return;
    
    let status, text;
    
    if (quantity === 0) {
        status = 'out-of-stock';
        text = 'FORA DE ESTOQUE';
    } else if (quantity < 50) {
        status = 'low-stock';
        text = 'ESTOQUE BAIXO';
    } else {
        status = 'in-stock';
        text = 'EM ESTOQUE';
    }
    
    stockStatusPreview.className = `stock-status ${status}`;
    stockStatusPreview.textContent = text;
}

function saveQuantity() {
    if (!newQuantityInput || !currentMedicine) {
        console.error('Elementos necessários não estão disponíveis');
        return;
    }
    
    const newQuantity = parseInt(newQuantityInput.value);
    
    if (isNaN(newQuantity) || newQuantity < 0) {
        showToast('Por favor, insira uma quantidade válida!', 'error');
        return;
    }
    
    // Atualizar no backend
    console.log('Enviando atualização:', { nome: currentMedicine.nome, quantidade: newQuantity });
    
    fetch(buildApiUrl('/api/medicamentos/quantidade'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            nome: currentMedicine.nome, 
            quantidade: newQuantity 
        })
    })
    .then(res => {
        console.log('Resposta do servidor:', res.status);
        if (!res.ok) {
            return res.json().then(err => Promise.reject(err));
        }
        return res.json();
    })
    .then(data => {
        console.log('Dados recebidos:', data);
        if (data.success) {
            // Atualizar localmente no objeto medicamentos
            const categoriaEncontrada = Object.keys(medicamentos).find(cat => 
                medicamentos[cat] && medicamentos[cat].some(m => m.nome === currentMedicine.nome)
            );
            
            if (categoriaEncontrada) {
                const medIndex = medicamentos[categoriaEncontrada].findIndex(m => m.nome === currentMedicine.nome);
                if (medIndex !== -1) {
                    medicamentos[categoriaEncontrada][medIndex].quantidade = newQuantity;
                    
                    // Atualizar status
                    if (newQuantity === 0) {
                        medicamentos[categoriaEncontrada][medIndex].status = 'out-of-stock';
                    } else if (newQuantity < 50) {
                        medicamentos[categoriaEncontrada][medIndex].status = 'low-stock';
                    } else {
                        medicamentos[categoriaEncontrada][medIndex].status = 'in-stock';
                    }
                }
            }
            
            // Atualizar no objeto currentMedicine
            currentMedicine.quantidade = newQuantity;
            if (newQuantity === 0) {
                currentMedicine.status = 'out-of-stock';
            } else if (newQuantity < 50) {
                currentMedicine.status = 'low-stock';
            } else {
                currentMedicine.status = 'in-stock';
            }
            
            // Atualizar na interface
            const quantityDisplay = currentMedicineElement.querySelector('.quantity-display');
            const statusDisplay = currentMedicineElement.querySelector('.stock-status');
            
            if (quantityDisplay) {
                quantityDisplay.textContent = `${newQuantity} unidades`;
            }
            if (statusDisplay) {
                statusDisplay.className = `stock-status ${currentMedicine.status}`;
                statusDisplay.textContent = getStatusText(currentMedicine.status);
            }
            
            showToast('Quantidade atualizada com sucesso no banco de dados!', 'success');
            quantityModal.style.display = 'none';
        } else {
            showToast(data.error || 'Erro ao atualizar quantidade. Tente novamente.', 'error');
        }
    })
    .catch(error => {
        console.error('Erro ao atualizar quantidade:', error);
        const errorMessage = error.error || error.message || 'Erro ao atualizar quantidade. Tente novamente.';
        showToast(errorMessage, 'error');
    });
}

// Navegação entre páginas
function navegarParaPagina(pagina) {
    if (!navLinks || !pageContents || !pageTitle) {
        console.error('Variáveis de navegação não inicializadas');
        return;
    }
    
    // Remove active de todos os links e páginas
    navLinks.forEach(l => l.classList.remove('active'));
    pageContents.forEach(page => page.classList.remove('active'));
    
    // Encontra e ativa o link correspondente
    const linkAtivo = Array.from(navLinks).find(link => link.getAttribute('data-page') === pagina);
    if (linkAtivo) {
        linkAtivo.classList.add('active');
    }
    
    // Mostra a página correspondente
    const pageDiv = document.getElementById(`${pagina}-page`);
    if (pageDiv) {
        pageDiv.classList.add('active');
    }
    
    // Atualiza o título da página
    if (pageTitles[pagina]) {
        pageTitle.textContent = pageTitles[pagina];
    }
    
    // Se for a página de prontuários salvos, renderiza os prontuários
    if (pagina === 'prontuarios-salvos') {
        // Pequeno delay para garantir que o DOM está pronto
        setTimeout(() => {
            renderProntuariosSalvos();
        }, 50);
    }
    
    if (toast) {
        showToast(`Acessando ${pageTitles[pagina] || pagina}`, 'success');
    }
}

// Adiciona item de menu para Prontuários Salvos
function adicionarMenuItemProntuariosSalvos() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    const itemChecklist = document.querySelector('.nav-item [data-page="checklist"]');
    if (!itemChecklist) return;
    
    const itemChecklistParent = itemChecklist.closest('.nav-item');
    if (!itemChecklistParent) return;
    
    // Verificar se o item já existe
    const existingItem = document.querySelector('.nav-item [data-page="prontuarios-salvos"]');
    if (existingItem) return;
    
    const novoItem = document.createElement('li');
    novoItem.className = 'nav-item';
    novoItem.innerHTML = `
        <a class="nav-link" data-page="prontuarios-salvos">
            <i class="fas fa-archive"></i>
            <span>Prontuários Salvos</span>
        </a>
    `;
    
    navMenu.insertBefore(novoItem, itemChecklistParent.nextSibling);
    
    // Adiciona event listener ao novo item
    const novoLink = novoItem.querySelector('.nav-link');
    if (novoLink) {
        novoLink.addEventListener('click', function() {
            navegarParaPagina('prontuarios-salvos');
        });
    }
}

// Variáveis adicionais que serão inicializadas no DOMContentLoaded
let logoutModal, toast, logoutBtn, cancelLogoutBtn, confirmLogoutBtn;
let clearFormBtn, saveProntuarioBtn;

// Função para mostrar notificações toast
function showToast(message, type = 'success') {
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast';
    
    if (type === 'error') {
        toast.style.background = 'var(--danger)';
    } else if (type === 'warning') {
        toast.style.background = 'var(--warning)';
        toast.style.color = 'var(--dark)';
    } else {
        toast.style.background = 'var(--success)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


// Funcionalidade do prontuário
const startConsultationBtn = document.getElementById('startConsultationBtn');
let consultationStarted = false;
let consultationTimer;
let consultationSeconds = 0;

if (startConsultationBtn) {
    startConsultationBtn.addEventListener('click', function() {
        if (!consultationStarted) {
            consultationStarted = true;
            this.innerHTML = '<i class="fas fa-pause"></i> Pausar Atendimento';
            this.style.background = '#ffc107';
            this.style.color = '#333';
            
            consultationTimer = setInterval(() => {
                consultationSeconds++;
                const hours = Math.floor(consultationSeconds / 3600);
                const minutes = Math.floor((consultationSeconds % 3600) / 60);
                const seconds = consultationSeconds % 60;
                
                document.querySelector('.duration-time').textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
            
            showToast('Atendimento iniciado!', 'success');
        } else {
            consultationStarted = false;
            this.innerHTML = '<i class="fas fa-play"></i> Retomar Atendimento';
            this.style.background = 'var(--secondary)';
            this.style.color = 'var(--dark)';
            
            clearInterval(consultationTimer);
            showToast('Atendimento pausado!', 'warning');
        }
    });
}

// FUNCIONALIDADES PARA ADIÇÃO DE PROFISSIONAIS E PACIENTES
function initializeChecklistFunctionality() {
    const toggleTeamFormBtn = document.getElementById('toggleTeamForm');
    const teamForm = document.getElementById('teamForm');
    const cancelTeamFormBtn = document.getElementById('cancelTeamForm');
    const addTeamMemberBtn = document.getElementById('addTeamMember');
    const teamMembersList = document.getElementById('teamMembersList');

    const togglePatientFormBtn = document.getElementById('togglePatientForm');
    const patientForm = document.getElementById('patientForm');
    const cancelPatientFormBtn = document.getElementById('cancelPatientForm');
    const addPatientBtn = document.getElementById('addPatient');
    const patientsList = document.getElementById('patientsList');

    if (!toggleTeamFormBtn) return;

    // Carregar dados iniciais
    renderTeamMembers();
    renderPatients();

    // Toggle formulário de profissionais
    toggleTeamFormBtn.addEventListener('click', function() {
        teamForm.style.display = teamForm.style.display === 'none' ? 'block' : 'none';
    });

    // Cancelar formulário de profissionais
    cancelTeamFormBtn.addEventListener('click', function() {
        teamForm.style.display = 'none';
        clearTeamForm();
    });

    // Adicionar profissional
    addTeamMemberBtn.addEventListener('click', function() {
        const name = document.getElementById('teamMemberName').value.trim();
        const role = document.getElementById('teamMemberRole').value.trim();
        const status = document.getElementById('teamMemberStatus').value;

        if (!name || !role) {
            showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        const newMember = {
            id: Date.now(),
            name: name,
            role: role,
            status: status
        };

        teamMembers.push(newMember);
        renderTeamMembers();
        teamForm.style.display = 'none';
        clearTeamForm();
        showToast('Profissional adicionado com sucesso!', 'success');
    });

    // Toggle formulário de pacientes
    togglePatientFormBtn.addEventListener('click', function() {
        patientForm.style.display = patientForm.style.display === 'none' ? 'block' : 'none';
    });

    // Cancelar formulário de pacientes
    cancelPatientFormBtn.addEventListener('click', function() {
        patientForm.style.display = 'none';
        clearPatientForm();
    });

    // Adicionar paciente
    addPatientBtn.addEventListener('click', function() {
        const name = document.getElementById('patientName').value.trim();
        const bed = document.getElementById('patientBed').value.trim();
        const diagnosis = document.getElementById('patientDiagnosis').value.trim();
        const priority = document.getElementById('patientPriority').value;

        if (!name || !bed || !diagnosis) {
            showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        const newPatient = {
            id: Date.now(),
            name: name,
            bed: bed,
            diagnosis: diagnosis,
            priority: priority
        };

        patients.push(newPatient);
        renderPatients();
        patientForm.style.display = 'none';
        clearPatientForm();
        showToast('Paciente adicionado com sucesso!', 'success');
    });

    // Renderizar lista de profissionais
    function renderTeamMembers() {
        if (!teamMembersList) return;
        
        teamMembersList.innerHTML = '';

        if (teamMembers.length === 0) {
            teamMembersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>Nenhum profissional adicionado</h4>
                    <p>Clique em "Adicionar Profissional" para começar</p>
                </div>
            `;
            return;
        }

        teamMembers.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = `team-member ${member.status}`;
            memberElement.innerHTML = `
                <div class="member-name">${member.name}</div>
                <div class="member-role">${member.role}</div>
                <span class="status-badge status-${member.status}">
                    ${member.status === 'present' ? 'PRESENTE' : 'AUSENTE'}
                </span>
                <button class="delete-btn" data-id="${member.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            teamMembersList.appendChild(memberElement);

            // Adicionar evento de clique para alternar status
            memberElement.addEventListener('click', function(e) {
                if (!e.target.closest('.delete-btn')) {
                    toggleMemberStatus(member.id);
                }
            });

            // Adicionar evento para deletar
            const deleteBtn = memberElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteTeamMember(member.id);
            });
        });
    }

    // Renderizar lista de pacientes
    function renderPatients() {
        if (!patientsList) return;
        
        patientsList.innerHTML = '';

        if (patients.length === 0) {
            patientsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-procedures"></i>
                    <h4>Nenhum paciente adicionado</h4>
                    <p>Clique em "Adicionar Paciente" para começar</p>
                </div>
            `;
            return;
        }

        patients.forEach(patient => {
            const patientElement = document.createElement('div');
            patientElement.className = `patient-item priority-${patient.priority}`;
            patientElement.innerHTML = `
                <div class="patient-name">${patient.name}</div>
                <div class="patient-bed">${patient.bed}</div>
                <div class="patient-diagnosis">${patient.diagnosis}</div>
                <button class="delete-btn" data-id="${patient.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            patientsList.appendChild(patientElement);

            // Adicionar evento para deletar
            const deleteBtn = patientElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                deletePatient(patient.id);
            });
        });
    }

    // Alternar status do profissional
    function toggleMemberStatus(id) {
        teamMembers = teamMembers.map(member => {
            if (member.id === id) {
                return {
                    ...member,
                    status: member.status === 'present' ? 'absent' : 'present'
                };
            }
            return member;
        });
        renderTeamMembers();
    }

    // Deletar profissional
    function deleteTeamMember(id) {
        if (confirm('Tem certeza que deseja remover este profissional?')) {
            teamMembers = teamMembers.filter(member => member.id !== id);
            renderTeamMembers();
            showToast('Profissional removido com sucesso!', 'success');
        }
    }

    // Deletar paciente
    function deletePatient(id) {
        if (confirm('Tem certeza que deseja remover este paciente?')) {
            patients = patients.filter(patient => patient.id !== id);
            renderPatients();
            showToast('Paciente removido com sucesso!', 'success');
        }
    }

    // Limpar formulário de profissionais
    function clearTeamForm() {
        document.getElementById('teamMemberName').value = '';
        document.getElementById('teamMemberRole').value = '';
        document.getElementById('teamMemberStatus').value = 'present';
    }

    // Limpar formulário de pacientes
    function clearPatientForm() {
        document.getElementById('patientName').value = '';
        document.getElementById('patientBed').value = '';
        document.getElementById('patientDiagnosis').value = '';
        document.getElementById('patientPriority').value = 'high';
    }
}

// ========== INICIALIZAÇÃO GERAL ==========

document.addEventListener('DOMContentLoaded', function() {
    // Adicionar item de menu para Prontuários Salvos
    adicionarMenuItemProntuariosSalvos();
    
    // Carregar prontuários salvos do localStorage
    prontuariosSalvos = JSON.parse(localStorage.getItem('prontuariosSalvos')) || [];
    
    // Se estiver na página de prontuários salvos, renderizar
    const prontuariosPage = document.getElementById('prontuarios-salvos-page');
    if (prontuariosPage && prontuariosPage.classList.contains('active')) {
        renderProntuariosSalvos();
    }
    
    // Adicionar funcionalidade de busca para prontuários salvos
    const searchProntuariosInput = document.getElementById('search-prontuarios');
    if (searchProntuariosInput) {
        searchProntuariosInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const prontuariosGrid = document.getElementById('prontuarios-grid');
            const emptyState = document.getElementById('empty-prontuarios');
            
            if (!prontuariosGrid) return;
            
            if (!searchTerm) {
                renderProntuariosSalvos();
                return;
            }
            
            const prontuariosFiltrados = prontuariosSalvos.filter(prontuario => {
                const nome = (prontuario.paciente?.nome || '').toLowerCase();
                const info = (prontuario.paciente?.info || '').toLowerCase();
                const historico = (prontuario.historico || '').toLowerCase();
                const diagnostico = (prontuario.diagnostico || '').toLowerCase();
                
                return nome.includes(searchTerm) || 
                       info.includes(searchTerm) || 
                       historico.includes(searchTerm) || 
                       diagnostico.includes(searchTerm);
            });
            
            prontuariosGrid.innerHTML = '';
            
            if (prontuariosFiltrados.length === 0) {
                if (emptyState) {
                    emptyState.style.display = 'block';
                    emptyState.innerHTML = `
                        <i class="fas fa-search"></i>
                        <h3>Nenhum prontuário encontrado</h3>
                        <p>Nenhum prontuário corresponde à busca "${searchTerm}"</p>
                    `;
                }
                return;
            }
            
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Renderizar prontuários filtrados
            prontuariosFiltrados.forEach((prontuario, index) => {
                const prontuarioCard = document.createElement('div');
                prontuarioCard.className = 'prontuario-card';
                
                const escapeHtml = (text) => {
                    if (!text) return '';
                    const div = document.createElement('div');
                    div.textContent = text;
                    return div.innerHTML;
                };
                
                const nomePaciente = escapeHtml(prontuario.paciente?.nome || 'Sem nome');
                const infoPaciente = escapeHtml(prontuario.paciente?.info || 'Sem informações adicionais');
                const dataFormatada = formatarData(prontuario.dataCriacao);
                const historico = prontuario.historico ? escapeHtml(prontuario.historico.substring(0, 100)) + (prontuario.historico.length > 100 ? '...' : '') : 'Sem histórico registrado';
                const diagnostico = prontuario.diagnostico ? escapeHtml(prontuario.diagnostico.substring(0, 80)) + (prontuario.diagnostico.length > 80 ? '...' : '') : '';
                
                prontuarioCard.innerHTML = `
                    <div class="prontuario-header">
                        <div class="prontuario-paciente">
                            <div class="prontuario-nome">${nomePaciente}</div>
                            <div class="prontuario-info">${infoPaciente}</div>
                        </div>
                        <div class="prontuario-data">${dataFormatada}</div>
                    </div>
                    
                    <div class="prontuario-content">
                        <div class="prontuario-resumo">${historico}</div>
                        ${diagnostico ? `
                            <div class="prontuario-diagnostico">
                                <strong>Diagnóstico:</strong> ${diagnostico}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="prontuario-actions">
                        <button class="btn btn-sm btn-view" onclick="visualizarProntuario(${prontuario.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="imprimirProntuarioSalvo(${prontuario.id})">
                            <i class="fas fa-print"></i> Imprimir
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="deletarProntuario(${prontuario.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                `;
                prontuariosGrid.appendChild(prontuarioCard);
            });
        });
    }
    
    // Inicializar funcionalidades básicas
    updateCurrentDate();
    loadMedicines();
    
    // Inicializar controles de aparência
    initializeFontSizeControls();
    initializeThemeControls();
    
    // Inicializar funcionalidades do checklist
    initializeChecklistFunctionality();
    
    // Conectar botão de redefinir aparência
    const resetBtn = document.getElementById('resetAppearanceBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAppearanceSettings);
    }
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', limparFormularioProntuario);
    }

    if (saveProntuarioBtn) {
        saveProntuarioBtn.addEventListener('click', salvarProntuario);
    }

    // Configurações: Modal de edição de perfil
    const editProfileBtn = document.getElementById('openProfileModalBtn');
    const profileModal = document.getElementById('profileModal');
    const profileModalFields = {
        name: document.getElementById('profile-name'),
        role: document.getElementById('profile-role'),
        email: document.getElementById('profile-email'),
        phone: document.getElementById('profile-phone'),
        statsPatients: document.getElementById('profile-stats-patients'),
        statsRecords: document.getElementById('profile-stats-records'),
        statsActivity: document.getElementById('profile-stats-activity')
    };

    if (editProfileBtn && profileModal && Object.values(profileModalFields).every(Boolean)) {
        editProfileBtn.addEventListener('click', () => {
            const currentProfile = {
                name: document.querySelector('.profile-info h3')?.textContent.trim(),
                role: document.querySelector('.profile-info p')?.textContent.trim(),
                email: profileModalFields.email.value,
                phone: profileModalFields.phone.value,
                statsPatients: document.querySelector('.profile-stats .stat-item:nth-child(1) .stat-value')?.textContent.trim(),
                statsRecords: document.querySelector('.profile-stats .stat-item:nth-child(2) .stat-value')?.textContent.trim(),
                statsActivity: document.querySelector('.profile-stats .stat-item:nth-child(3) .stat-value')?.textContent.trim()
            };

            profileModalFields.name.value = currentProfile.name || '';
            profileModalFields.role.value = currentProfile.role || '';
            profileModalFields.email.value = currentProfile.email || '';
            profileModalFields.phone.value = currentProfile.phone || '';
            profileModalFields.statsPatients.value = currentProfile.statsPatients || '';
            profileModalFields.statsRecords.value = currentProfile.statsRecords || '';
            profileModalFields.statsActivity.value = currentProfile.statsActivity || '';

            profileModal.style.display = 'flex';
        });

        const closeProfileModal = () => {
            profileModal.style.display = 'none';
        };

        profileModal.addEventListener('click', (event) => {
            if (event.target === profileModal || event.target.classList.contains('close-btn')) {
                closeProfileModal();
            }
        });

        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                const profileNameEl = document.querySelector('.profile-info h3');
                const profileRoleEl = document.querySelector('.profile-info p');
                const statValues = document.querySelectorAll('.profile-stats .stat-item .stat-value');

                if (profileNameEl) profileNameEl.textContent = profileModalFields.name.value;
                if (profileRoleEl) profileRoleEl.textContent = profileModalFields.role.value;
                if (statValues[0]) statValues[0].textContent = profileModalFields.statsPatients.value || '0';
                if (statValues[1]) statValues[1].textContent = profileModalFields.statsRecords.value || '0';
                if (statValues[2]) statValues[2].textContent = profileModalFields.statsActivity.value || '0%';

                showToast('Perfil atualizado com sucesso!', 'success');
                closeProfileModal();
            });
        }
    }
    
    // Conectar botão de imprimir prontuário atual
    const printBtn = document.getElementById('print-prontuario');
    if (printBtn) {
        printBtn.addEventListener('click', printProntuario);
    }
    
    // Funcionalidade dos switches
    const switches = document.querySelectorAll('.switch input');
    switches.forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const label = this.parentElement.querySelector('.option-label').textContent;
            const status = this.checked ? 'ativado' : 'desativado';
            showToast(`${label} ${status}`, 'success');
        });
    });
    
    // Botões de ação
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('Configurações salvas com sucesso!', 'success');
        });
    });
    
    console.log('Sistema MedControl inicializado com sucesso!');
});