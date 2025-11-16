// Carregar medicamentos da API
var medicamentos = {};

function fetchMedicamentos(callback) {
    fetch('/api/medicamentos')
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else {
                console.error('Erro ao buscar medicamentos:', response.statusText);
                return {};
            }
        })
        .then(function(data) {
            medicamentos = data;
            if (typeof callback === 'function') callback();
        })
        .catch(function(error) {
            console.error('Erro de conexão com a API de medicamentos:', error);
        });
}

// Função para renderizar os medicamentos na tela
function renderMedicines(category = 'all', searchTerm = '') {
    if (!medicinesContainer) return;
    medicinesContainer.innerHTML = '';
    let medicinesToShow = [];
    if (category === 'all') {
        for (const cat in medicamentos) {
            medicinesToShow = medicinesToShow.concat(medicamentos[cat]);
        }
    } else {
        medicinesToShow = medicamentos[category] || [];
    }
    if (searchTerm) {
        medicinesToShow = medicinesToShow.filter(function(med) {
            return med.nome.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }
    medicinesToShow.forEach(function(med) {
        var medicineCard = document.createElement('div');
        medicineCard.className = 'medicine-card';
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
                        <span>${med.quantidade} unidades</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span>${med.status}</span>
                    </div>
                </div>
            </div>
        `;
        medicinesContainer.appendChild(medicineCard);
    });
}

// Inicialização dinâmica ao carregar medicamentos e navegação
document.addEventListener('DOMContentLoaded', function() {
    fetchMedicamentos(function() {
        renderMedicines();
    });

    // Ativação dos botões de categoria
    document.querySelectorAll('.category-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var category = btn.getAttribute('data-category');
            renderMedicines(category);
        });
    });

    // Ativação do filtro de busca
    var searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
            renderMedicines(activeCategory, searchInput.value);
        });
    }

    // Navegação entre páginas
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            if (link.id === 'logout-btn') {
                document.getElementById('logoutModal').style.display = 'flex';
                return;
            }
            var page = link.getAttribute('data-page');
            document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
            link.classList.add('active');
            document.querySelectorAll('.page-content').forEach(function(content) { content.classList.remove('active'); });
            var pageDiv = document.getElementById(page + '-page');
            if (pageDiv) {
                pageDiv.classList.add('active');
                var pageTitle = document.getElementById('pageTitle');
                if (pageTitle && window.pageTitles && window.pageTitles[page]) {
                    pageTitle.textContent = window.pageTitles[page];
                }
            }
        });
    });
});
const decreaseBtn = document.getElementById('decrease-btn');
const increaseBtn = document.getElementById('increase-btn');
const newQuantityInput = document.getElementById('new-quantity');
const currentQuantityDisplay = document.getElementById('current-quantity');
const stockStatusPreview = document.getElementById('stock-status-preview');
const quantityModalTitle = document.getElementById('quantityModalTitle');

// Variáveis globais
let currentCategory = 'all';
let currentMedicine = null;
let currentMedicineElement = null;

// Títulos das páginas
const pageTitles = {
    'estoque': 'Controle de Estoque - Medicamentos',
    'prontuario': 'Prontuário Eletrônico',
    'prontuarios-salvos': 'Prontuários Salvos',
    'checklist': 'Checklist de Plantão - Passagem',
    'configuracoes': 'Configurações do Sistema'
};

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
    
    // Atualizar a lista de prontuários salvos
    renderProntuariosSalvos();
    
    // Limpar formulário
    limparFormularioProntuario();
    
    // Navegar para a página de prontuários salvos
    navegarParaPagina('prontuarios-salvos');
    
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
function renderProntuariosSalvos() {
    const prontuariosGrid = document.getElementById('prontuarios-grid');
    const emptyState = document.getElementById('empty-prontuarios');
    
    if (!prontuariosGrid) return;
    
    prontuariosGrid.innerHTML = '';
    
    if (prontuariosSalvos.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    prontuariosSalvos.forEach(prontuario => {
        const prontuarioCard = document.createElement('div');
        prontuarioCard.className = 'prontuario-card';
        prontuarioCard.innerHTML = `
            <div class="prontuario-header">
                <div class="prontuario-paciente">
                    <div class="prontuario-nome">${prontuario.paciente.nome}</div>
                    <div class="prontuario-info">${prontuario.paciente.info || 'Sem informações adicionais'}</div>
                </div>
                <div class="prontuario-data">${formatarData(prontuario.dataCriacao)}</div>
            </div>
            
            <div class="prontuario-content">
                <div class="prontuario-resumo">
                    ${prontuario.historico ? (prontuario.historico.substring(0, 100) + '...') : 'Sem histórico registrado'}
                </div>
                ${prontuario.diagnostico ? `
                    <div class="prontuario-diagnostico">
                        <strong>Diagnóstico:</strong> ${prontuario.diagnostico.substring(0, 80)}${prontuario.diagnostico.length > 80 ? '...' : ''}
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
    if (!medicinesContainer) return;
    
    medicinesContainer.innerHTML = '';
    
    let medicinesToShow = [];
    
    if (category === 'all') {
        for (const cat in medicamentos) {
            medicinesToShow = medicinesToShow.concat(medicamentos[cat]);
        }
    } else {
        medicinesToShow = medicamentos[category] || [];
    }
    
    if (searchTerm) {
        medicinesToShow = medicinesToShow.filter(med => 
            med.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    medicinesToShow.forEach(med => {
        const medicineCard = document.createElement('div');
        medicineCard.className = 'medicine-card';
        medicineCard.innerHTML = `
            <div class="medicine-header">
                <h3 class="medicine-name">${med.nome}</h3>
                <span class="medicine-category">${getCategoryName(category)}</span>
            </div>
            <div class="medicine-body">
                <div class="medicine-info">
                    <div class="info-item">
                        <span class="info-label">Uso:</span>
                        <span>${med.uso}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Quantidade:</span>
                        <span>${med.quantidade} unidades</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="stock-status ${med.status}">${getStatusText(med.status)}</span>
                    </div>
                </div>
                <div class="medicine-actions">
                    <button class="btn btn-primary edit-quantity" data-medicine='${JSON.stringify(med)}'>
                        <i class="fas fa-edit"></i>
                        Alterar Quantidade
                    </button>
                </div>
            </div>
        `;
        medicinesContainer.appendChild(medicineCard);
    });
    
    document.querySelectorAll('.edit-quantity').forEach(btn => {
        btn.addEventListener('click', function() {
            const medicineData = JSON.parse(this.getAttribute('data-medicine'));
            openQuantityModal(medicineData, this.closest('.medicine-card'));
        });
    });
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

function getStatusText(status) {
    const statusTexts = {
        'in-stock': 'EM ESTOQUE',
        'low-stock': 'ESTOQUE BAIXO',
        'out-of-stock': 'FORA DE ESTOQUE'
    };
    return statusTexts[status] || 'DESCONHECIDO';
}

function openQuantityModal(medicine, medicineElement) {
    currentMedicine = medicine;
    currentMedicineElement = medicineElement;
    
    quantityModalTitle.textContent = `Alterar Quantidade - ${medicine.nome}`;
    currentQuantityDisplay.textContent = `${medicine.quantidade} unidades`;
    newQuantityInput.value = medicine.quantidade;
    
    updateStockStatusPreview(medicine.quantidade);
    
    quantityModal.style.display = 'flex';
}

function updateStockStatusPreview(quantity) {
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
    const newQuantity = parseInt(newQuantityInput.value);
    
    if (isNaN(newQuantity) || newQuantity < 0) {
        showToast('Por favor, insira uma quantidade válida!', 'error');
        return;
    }
    
    currentMedicine.quantidade = newQuantity;
    
    if (newQuantity === 0) {
        currentMedicine.status = 'out-of-stock';
    } else if (newQuantity < 50) {
        currentMedicine.status = 'low-stock';
    } else {
        currentMedicine.status = 'in-stock';
    }
    
    const quantityDisplay = currentMedicineElement.querySelector('.info-item:nth-child(2) span:last-child');
    const statusDisplay = currentMedicineElement.querySelector('.stock-status');
    
    quantityDisplay.textContent = `${newQuantity} unidades`;
    statusDisplay.className = `stock-status ${currentMedicine.status}`;
    statusDisplay.textContent = getStatusText(currentMedicine.status);
    
    showToast('Quantidade atualizada com sucesso!', 'success');
    quantityModal.style.display = 'none';
}

// Navegação entre páginas
function navegarParaPagina(pagina) {
    // Remove active de todos os links e páginas
    navLinks.forEach(l => l.classList.remove('active'));
    pageContents.forEach(page => page.classList.remove('active'));
    
    // Encontra e ativa o link correspondente
    const linkAtivo = Array.from(navLinks).find(link => link.getAttribute('data-page') === pagina);
    if (linkAtivo) {
        linkAtivo.classList.add('active');
    }
    
    // Mostra a página correspondente
    document.getElementById(`${pagina}-page`).classList.add('active');
    
    // Atualiza o título da página
    pageTitle.textContent = pageTitles[pagina];
    
    // Se for a página de prontuários salvos, renderiza os prontuários
    if (pagina === 'prontuarios-salvos') {
        renderProntuariosSalvos();
    }
    
    showToast(`Acessando ${pageTitles[pagina]}`, 'success');
}

// Adiciona event listeners de navegação
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        if (this.id === 'logout-btn') {
            logoutModal.style.display = 'flex';
            return;
        }
        
        const pageId = this.getAttribute('data-page');
        navegarParaPagina(pageId);
    });
});

// Adiciona item de menu para Prontuários Salvos
function adicionarMenuItemProntuariosSalvos() {
    const navMenu = document.querySelector('.nav-menu');
    const itemChecklist = document.querySelector('.nav-item [data-page="checklist"]').closest('.nav-item');
    
    const novoItem = document.createElement('li');
    novoItem.className = 'nav-item';
    novoItem.innerHTML = `
        <a class="nav-link" data-page="prontuarios-salvos">
            <i class="fas fa-archive"></i>
            <span>Prontuários Salvos</span>
        </a>
    `;
    
    navMenu.insertBefore(novoItem, itemChecklist.nextSibling);
    
    // Adiciona event listener ao novo item
    novoItem.querySelector('.nav-link').addEventListener('click', function() {
        navegarParaPagina('prontuarios-salvos');
    });
}

// Filtros de categoria
categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        currentCategory = this.getAttribute('data-category');
        loadMedicines(currentCategory, searchInput.value);
    });
});

// Pesquisa
if (searchInput) {
    searchInput.addEventListener('input', function() {
        loadMedicines(currentCategory, this.value);
    });
}

// Controles de quantidade no modal
decreaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(newQuantityInput.value);
    if (currentValue > 0) {
        newQuantityInput.value = currentValue - 1;
        updateStockStatusPreview(newQuantityInput.value);
    }
});

increaseBtn.addEventListener('click', function() {
    const currentValue = parseInt(newQuantityInput.value);
    newQuantityInput.value = currentValue + 1;
    updateStockStatusPreview(newQuantityInput.value);
});

newQuantityInput.addEventListener('input', function() {
    updateStockStatusPreview(this.value);
});

// Salvar quantidade
saveQuantityBtn.addEventListener('click', saveQuantity);

// Cancelar alteração de quantidade
cancelQuantityBtn.addEventListener('click', function() {
    quantityModal.style.display = 'none';
});

// Funcionalidade do botão Sair
logoutBtn.addEventListener('click', function() {
    logoutModal.style.display = 'flex';
});

cancelLogoutBtn.addEventListener('click', function() {
    logoutModal.style.display = 'none';
});

confirmLogoutBtn.addEventListener('click', function() {
    logoutModal.style.display = 'none';
    showToast('Saindo do sistema...', 'warning');
    
    setTimeout(() => {
        alert('Você foi desconectado do sistema. Redirecionando para a página de login...');
    }, 2000);
});

// Limpar formulário
clearFormBtn.addEventListener('click', function() {
    if (confirm('Tem certeza que deseja limpar todos os campos do prontuário?')) {
        limparFormularioProntuario();
        showToast('Formulário limpo!', 'success');
    }
});

// Fechar modais
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        logoutModal.style.display = 'none';
        quantityModal.style.display = 'none';
    });
});

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

// Fechar modal ao clicar fora dele
window.addEventListener('click', function(event) {
    if (event.target === logoutModal) {
        logoutModal.style.display = 'none';
    }
    if (event.target === quantityModal) {
        quantityModal.style.display = 'none';
    }
});

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
    
    // Conectar botão de salvar prontuário
    if (saveProntuarioBtn) {
        saveProntuarioBtn.addEventListener('click', salvarProntuario);
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
