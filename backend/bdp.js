// Sistema de Armazenamento Universal para MedControl
class UniversalStorage {
    constructor() {
        this.storageType = this.detectStorageType();
        console.log(`📦 Usando armazenamento: ${this.storageType}`);
    }

    detectStorageType() {
        // Verificar se estamos no browser
        if (typeof window !== 'undefined') {
            if (typeof indexedDB !== 'undefined') {
                return 'indexedDB';
            } else if (typeof localStorage !== 'undefined') {
                return 'localStorage';
            }
        }
        // Verificar se estamos no Node.js
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            return 'nodejs';
        }
        return 'memory';
    }

    async setItem(key, value) {
        try {
            switch (this.storageType) {
                case 'indexedDB':
                    return await this.setIndexedDB(key, value);
                case 'localStorage':
                    return localStorage.setItem(key, JSON.stringify(value));
                case 'nodejs':
                    return await this.setNodeJS(key, value);
                default:
                    return this.setMemory(key, value);
            }
        } catch (error) {
            console.error(`❌ Erro ao salvar ${key}:`, error);
            // Fallback para memory
            return this.setMemory(key, value);
        }
    }

    async getItem(key) {
        try {
            switch (this.storageType) {
                case 'indexedDB':
                    return await this.getIndexedDB(key);
                case 'localStorage':
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                case 'nodejs':
                    return await this.getNodeJS(key);
                default:
                    return this.getMemory(key);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar ${key}:`, error);
            return this.getMemory(key);
        }
    }

    async removeItem(key) {
        try {
            switch (this.storageType) {
                case 'indexedDB':
                    return await this.removeIndexedDB(key);
                case 'localStorage':
                    return localStorage.removeItem(key);
                case 'nodejs':
                    return await this.removeNodeJS(key);
                default:
                    return this.removeMemory(key);
            }
        } catch (error) {
            console.error(`❌ Erro ao remover ${key}:`, error);
        }
    }

    // ========== INDEXEDDB ==========
    async setIndexedDB(key, value) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MedControlStorage', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['storage'], 'readwrite');
                const store = transaction.objectStore('storage');
                const putRequest = store.put({ key, value, timestamp: Date.now() });
                
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('storage')) {
                    db.createObjectStore('storage', { keyPath: 'key' });
                }
            };
        });
    }

    async getIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MedControlStorage', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['storage'], 'readonly');
                const store = transaction.objectStore('storage');
                const getRequest = store.get(key);
                
                getRequest.onsuccess = () => {
                    resolve(getRequest.result ? getRequest.result.value : null);
                };
                getRequest.onerror = () => reject(getRequest.error);
            };
        });
    }

    async removeIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MedControlStorage', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['storage'], 'readwrite');
                const store = transaction.objectStore('storage');
                const deleteRequest = store.delete(key);
                
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
            };
        });
    }

    // ========== NODE.JS ==========
    async setNodeJS(key, value) {
        const fs = require('fs').promises;
        const path = require('path');
        
        const dataDir = path.join(process.cwd(), '.medcontrol-data');
        const filePath = path.join(dataDir, `${key}.json`);
        
        try {
            await fs.mkdir(dataDir, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify({
                value,
                timestamp: Date.now()
            }, null, 2));
        } catch (error) {
            throw new Error(`Erro ao salvar no Node.js: ${error.message}`);
        }
    }

    async getNodeJS(key) {
        const fs = require('fs').promises;
        const path = require('path');
        
        const filePath = path.join(process.cwd(), '.medcontrol-data', `${key}.json`);
        
        try {
            const data = await fs.readFile(filePath, 'utf8');
            const parsed = JSON.parse(data);
            return parsed.value;
        } catch (error) {
            return null;
        }
    }

    async removeNodeJS(key) {
        const fs = require('fs').promises;
        const path = require('path');
        
        const filePath = path.join(process.cwd(), '.medcontrol-data', `${key}.json`);
        
        try {
            await fs.unlink(filePath);
        } catch (error) {
            // Arquivo não existe, tudo bem
        }
    }

    // ========== MEMORY (FALLBACK) ==========
    constructor() {
        this.storageType = this.detectStorageType();
        this.memoryStorage = new Map();
    }

    setMemory(key, value) {
        this.memoryStorage.set(key, value);
    }

    getMemory(key) {
        return this.memoryStorage.get(key) || null;
    }

    removeMemory(key) {
        this.memoryStorage.delete(key);
    }
}

// ========== BANCO DE DADOS SIMPLIFICADO ==========

class SimpleMedControlDB {
    constructor() {
        this.storage = new UniversalStorage();
        this.initialized = false;
    }

    async init() {
        console.log('🔄 Inicializando banco de dados simples...');
        this.initialized = true;
        
        // Verificar se já existem dados
        const existingData = await this.storage.getItem('medcontrol_initialized');
        if (!existingData) {
            console.log('📝 Populando dados iniciais...');
            await this.initializeDefaultData();
        }
        
        console.log('✅ Banco de dados simples pronto!');
    }

    async initializeDefaultData() {
        const defaultData = {
            medicamentos: getLocalMedicamentos(),
            teamMembers: [
                { id: 1, name: "Dra. Ana Silva", role: "Médica Plantonista", status: "present" },
                { id: 2, name: "Enf. Carlos Santos", role: "Enfermeiro Chefe", status: "present" },
                { id: 3, name: "Téc. Maria Oliveira", role: "Técnica de Enfermagem", status: "present" },
                { id: 4, name: "Téc. João Pereira", role: "Técnico de Enfermagem", status: "absent" }
            ],
            patients: [
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
            ],
            prontuarios: [],
            settings: {
                fontSize: 16,
                theme: 'light'
            }
        };

        for (const [key, value] of Object.entries(defaultData)) {
            await this.storage.setItem(`medcontrol_${key}`, value);
        }
        
        await this.storage.setItem('medcontrol_initialized', true);
    }

    // ========== OPERAÇÕES DE MEDICAMENTOS ==========
    async getAllMedicines() {
        return await this.storage.getItem('medcontrol_medicamentos') || {};
    }

    async saveAllMedicines(medicamentos) {
        await this.storage.setItem('medcontrol_medicamentos', medicamentos);
    }

    async updateMedicineQuantity(medicineName, newQuantity) {
        const medicamentos = await this.getAllMedicines();
        
        for (const category in medicamentos) {
            const medicineIndex = medicamentos[category].findIndex(m => m.nome === medicineName);
            if (medicineIndex !== -1) {
                medicamentos[category][medicineIndex].quantidade = newQuantity;
                
                // Atualizar status
                if (newQuantity === 0) {
                    medicamentos[category][medicineIndex].status = 'out-of-stock';
                } else if (newQuantity < 50) {
                    medicamentos[category][medicineIndex].status = 'low-stock';
                } else {
                    medicamentos[category][medicineIndex].status = 'in-stock';
                }
                
                break;
            }
        }
        
        await this.saveAllMedicines(medicamentos);
        return medicamentos;
    }

    // ========== OPERAÇÕES DE PRONTUÁRIOS ==========
    async getAllProntuarios() {
        return await this.storage.getItem('medcontrol_prontuarios') || [];
    }

    async saveProntuario(prontuario) {
        const prontuarios = await this.getAllProntuarios();
        const newProntuario = {
            ...prontuario,
            id: prontuario.id || Date.now()
        };
        
        prontuarios.unshift(newProntuario);
        await this.storage.setItem('medcontrol_prontuarios', prontuarios);
        return newProntuario.id;
    }

    async deleteProntuario(id) {
        const prontuarios = await this.getAllProntuarios();
        const filtered = prontuarios.filter(p => p.id !== id);
        await this.storage.setItem('medcontrol_prontuarios', filtered);
    }

    // ========== OPERAÇÕES DA EQUIPE ==========
    async getAllTeamMembers() {
        return await this.storage.getItem('medcontrol_teamMembers') || [];
    }

    async saveTeamMember(member) {
        const teamMembers = await this.getAllTeamMembers();
        const newMember = {
            ...member,
            id: member.id || Date.now()
        };
        
        teamMembers.push(newMember);
        await this.storage.setItem('medcontrol_teamMembers', teamMembers);
        return newMember.id;
    }

    async updateTeamMemberStatus(id, newStatus) {
        const teamMembers = await this.getAllTeamMembers();
        const memberIndex = teamMembers.findIndex(m => m.id === id);
        
        if (memberIndex !== -1) {
            teamMembers[memberIndex].status = newStatus;
            await this.storage.setItem('medcontrol_teamMembers', teamMembers);
        }
    }

    async deleteTeamMember(id) {
        const teamMembers = await this.getAllTeamMembers();
        const filtered = teamMembers.filter(m => m.id !== id);
        await this.storage.setItem('medcontrol_teamMembers', filtered);
    }

    // ========== OPERAÇÕES DE PACIENTES ==========
    async getAllPatients() {
        return await this.storage.getItem('medcontrol_patients') || [];
    }

    async savePatient(patient) {
        const patients = await this.getAllPatients();
        const newPatient = {
            ...patient,
            id: patient.id || Date.now()
        };
        
        patients.push(newPatient);
        await this.storage.setItem('medcontrol_patients', patients);
        return newPatient.id;
    }

    async deletePatient(id) {
        const patients = await this.getAllPatients();
        const filtered = patients.filter(p => p.id !== id);
        await this.storage.setItem('medcontrol_patients', filtered);
    }

    // ========== CONFIGURAÇÕES ==========
    async getSettings() {
        return await this.storage.getItem('medcontrol_settings') || {};
    }

    async saveSettings(settings) {
        await this.storage.setItem('medcontrol_settings', settings);
    }

    // ========== BACKUP E RESTAURAÇÃO ==========
    async exportAllData() {
        return {
            medicamentos: await this.getAllMedicines(),
            prontuarios: await this.getAllProntuarios(),
            teamMembers: await this.getAllTeamMembers(),
            patients: await this.getAllPatients(),
            settings: await this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    async importAllData(data) {
        if (data.medicamentos) await this.saveAllMedicines(data.medicamentos);
        if (data.prontuarios) await this.storage.setItem('medcontrol_prontuarios', data.prontuarios);
        if (data.teamMembers) await this.storage.setItem('medcontrol_teamMembers', data.teamMembers);
        if (data.patients) await this.storage.setItem('medcontrol_patients', data.patients);
        if (data.settings) await this.saveSettings(data.settings);
    }
}

// ========== VARIÁVEIS GLOBAIS E INICIALIZAÇÃO ==========

// Instância global do banco de dados
const medControlDB = new SimpleMedControlDB();

// Variáveis globais (serão preenchidas durante a inicialização)
let medicamentos = {};
let teamMembers = [];
let patients = [];
let prontuariosSalvos = [];

// Função para carregar todos os dados
async function loadAllDataFromDatabase() {
    console.log('🔄 Carregando todos os dados...');
    try {
        const [meds, team, pats, pronts] = await Promise.all([
            medControlDB.getAllMedicines(),
            medControlDB.getAllTeamMembers(),
            medControlDB.getAllPatients(),
            medControlDB.getAllProntuarios()
        ]);

        medicamentos = meds;
        teamMembers = team;
        patients = pats;
        prontuariosSalvos = pronts;

        console.log('✅ Dados carregados:', {
            medicamentos: Object.keys(medicamentos).length + ' categorias',
            teamMembers: teamMembers.length,
            patients: patients.length,
            prontuarios: prontuariosSalvos.length
        });

        return true;
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        
        // Dados de fallback
        medicamentos = getLocalMedicamentos();
        teamMembers = [];
        patients = [];
        prontuariosSalvos = [];
        
        return false;
    }
}

// ========== FUNÇÕES PRINCIPAIS ATUALIZADAS ==========

// Função fetchMedicamentos
async function fetchMedicamentos(callback) {
    console.log('🔄 Buscando medicamentos...');
    try {
        await loadAllDataFromDatabase();
        
        if (typeof callback === 'function') {
            callback();
        }
        
        // Tentar API se disponível (apenas no browser)
        if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
            try {
                const response = await fetch('/api/medicamentos');
                if (response.ok) {
                    const data = await response.json();
                    medicamentos = data;
                    await medControlDB.saveAllMedicines(data);
                    if (typeof callback === 'function') {
                        callback();
                    }
                    console.log('✅ Medicamentos atualizados da API');
                }
            } catch (apiError) {
                console.log('ℹ️  Usando dados locais');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar medicamentos:', error);
        if (typeof callback === 'function') {
            callback();
        }
    }
}

// Função salvarProntuario
async function salvarProntuario() {
    const patientNameInput = document.getElementById('patient-name');
    if (!patientNameInput) {
        showToast('Campo de nome do paciente não encontrado!', 'error');
        return;
    }
    
    const patientName = patientNameInput.value.trim();
    if (!patientName) {
        showToast('Preencha o nome do paciente antes de salvar!', 'error');
        return;
    }

    const prontuario = {
        paciente: {
            nome: patientName,
            info: (document.getElementById('patient-info')?.value || '').trim()
        },
        vitais: coletarSinaisVitais(),
        historico: (document.getElementById('current-illness')?.value || '').trim(),
        exameFisico: (document.getElementById('physical-exam')?.value || '').trim(),
        diagnostico: (document.getElementById('diagnosis')?.value || '').trim(),
        tratamento: (document.getElementById('treatment')?.value || '').trim(),
        evolucao: (document.getElementById('evolution')?.value || '').trim(),
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString()
    };

    try {
        await medControlDB.saveProntuario(prontuario);
        await loadAllDataFromDatabase();
        renderProntuariosSalvos();
        limparFormularioProntuario();
        navegarParaPagina('prontuarios-salvos');
        showToast('Prontuário salvo com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao salvar prontuário:', error);
        showToast('Erro ao salvar prontuário!', 'error');
    }
}

// Função deletarProntuario
async function deletarProntuario(id) {
    if (confirm('Tem certeza que deseja excluir este prontuário?')) {
        try {
            await medControlDB.deleteProntuario(id);
            await loadAllDataFromDatabase();
            renderProntuariosSalvos();
            showToast('Prontuário excluído com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao deletar prontuário:', error);
            showToast('Erro ao excluir prontuário!', 'error');
        }
    }
}

// Funções da equipe
async function addTeamMemberToDatabase(member) {
    try {
        await medControlDB.saveTeamMember(member);
        await loadAllDataFromDatabase();
        renderTeamMembers();
        showToast('Profissional adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao adicionar membro da equipe:', error);
        showToast('Erro ao adicionar profissional!', 'error');
    }
}

async function toggleMemberStatusInDatabase(id) {
    try {
        const member = teamMembers.find(m => m.id === id);
        if (member) {
            const newStatus = member.status === 'present' ? 'absent' : 'present';
            await medControlDB.updateTeamMemberStatus(id, newStatus);
            await loadAllDataFromDatabase();
            renderTeamMembers();
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar status do membro:', error);
    }
}

async function deleteTeamMemberFromDatabase(id) {
    try {
        await medControlDB.deleteTeamMember(id);
        await loadAllDataFromDatabase();
        renderTeamMembers();
        showToast('Profissional removido com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao remover membro da equipe:', error);
        showToast('Erro ao remover profissional!', 'error');
    }
}

// Funções de pacientes
async function addPatientToDatabase(patient) {
    try {
        await medControlDB.savePatient(patient);
        await loadAllDataFromDatabase();
        renderPatients();
        showToast('Paciente adicionado com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao adicionar paciente:', error);
        showToast('Erro ao adicionar paciente!', 'error');
    }
}

async function deletePatientFromDatabase(id) {
    try {
        await medControlDB.deletePatient(id);
        await loadAllDataFromDatabase();
        renderPatients();
        showToast('Paciente removido com sucesso!', 'success');
    } catch (error) {
        console.error('❌ Erro ao remover paciente:', error);
        showToast('Erro ao remover paciente!', 'error');
    }
}

// Função saveQuantity
async function saveQuantity() {
    const newQuantityInput = document.getElementById('new-quantity');
    if (!newQuantityInput) return;
    
    const newQuantity = parseInt(newQuantityInput.value);
    
    if (isNaN(newQuantity) || newQuantity < 0) {
        showToast('Por favor, insira uma quantidade válida!', 'error');
        return;
    }
    
    if (!currentMedicine || !currentMedicineElement) {
        showToast('Erro ao atualizar quantidade!', 'error');
        return;
    }
    
    try {
        await medControlDB.updateMedicineQuantity(currentMedicine.nome, newQuantity);
        await loadAllDataFromDatabase();
        
        // Atualizar a interface
        const quantityDisplay = currentMedicineElement.querySelector('.info-item:nth-child(2) span:last-child');
        const statusDisplay = currentMedicineElement.querySelector('.stock-status');
        
        if (quantityDisplay) quantityDisplay.textContent = `${newQuantity} unidades`;
        if (statusDisplay) {
            let status = 'in-stock';
            if (newQuantity === 0) {
                status = 'out-of-stock';
            } else if (newQuantity < 50) {
                status = 'low-stock';
            }
            statusDisplay.className = `stock-status ${status}`;
            statusDisplay.textContent = getStatusText(status);
        }
        
        showToast('Quantidade atualizada com sucesso!', 'success');
        
        const quantityModal = document.getElementById('quantityModal');
        if (quantityModal) quantityModal.style.display = 'none';
    } catch (error) {
        console.error('❌ Erro ao atualizar quantidade:', error);
        showToast('Erro ao atualizar quantidade!', 'error');
    }
}

// ========== INICIALIZAÇÃO ==========

// Variável global para controlar se o sistema está pronto
let systemReady = false;

async function initializeSystem() {
    console.log('🚀 Inicializando Sistema MedControl...');
    
    try {
        // Inicializar banco de dados
        await medControlDB.init();
        
        // Carregar todos os dados
        await loadAllDataFromDatabase();
        
        // Inicializar interface (apenas no browser)
        if (typeof window !== 'undefined') {
            adicionarMenuItemProntuariosSalvos();
            initializeEventListeners();
            renderMedicines();
            updateCurrentDate();
            initializeFontSizeControls();
            initializeThemeControls();
            initializeChecklistFunctionality();
        }
        
        systemReady = true;
        console.log('✅ Sistema MedControl inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização do sistema:', error);
        
        // Fallback para dados em memória
        medicamentos = getLocalMedicamentos();
        teamMembers = [];
        patients = [];
        prontuariosSalvos = [];
        
        if (typeof window !== 'undefined') {
            showToast('Sistema carregado em modo offline', 'warning');
        }
    }
}

// Inicializar o sistema quando o DOM estiver pronto (browser) ou imediatamente (Node.js)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    // Estamos no Node.js, inicializar imediatamente
    initializeSystem().catch(console.error);
}

// Função para verificar se o sistema está pronto
function isSystemReady() {
    return systemReady;
}
// ========== BANCO DE DADOS LOCAL PARA MEDICAMENTOS ==========

// Dados padrão dos medicamentos
function getLocalMedicamentos() {
    return {
        "analgesicos": [
            { nome: "Paracetamol IV", uso: "Dor leve a moderada, febre", quantidade: 150, status: "in-stock" },
            { nome: "Dipirona IV", uso: "Dor e febre", quantidade: 200, status: "in-stock" },
            { nome: "Morfina IV", uso: "Dor intensa", quantidade: 80, status: "in-stock" },
            { nome: "Fentanil IV", uso: "Dor intensa, analgesia em UTI", quantidade: 45, status: "low-stock" },
            { nome: "Tramadol IV", uso: "Dor moderada a intensa", quantidade: 120, status: "in-stock" },
            { nome: "Midazolam IV", uso: "Sedação, crises convulsivas", quantidade: 60, status: "low-stock" },
            { nome: "Propofol IV", uso: "Sedação profunda em UTI ou anestesia", quantidade: 30, status: "low-stock" }
        ],
        "antibioticos": [
            { nome: "Ceftriaxona IV", uso: "Infecções bacterianas graves", quantidade: 100, status: "in-stock" },
            { nome: "Cefepime IV", uso: "Infecções hospitalares, Pseudomonas", quantidade: 75, status: "in-stock" },
            { nome: "Meropenem IV", uso: "Infecções graves resistentes", quantidade: 40, status: "low-stock" },
            { nome: "Vancomicina IV", uso: "Infecções por MRSA", quantidade: 50, status: "low-stock" },
            { nome: "Piperacilina-tazobactam IV", uso: "Infecções graves, abrange gram-positivos e negativos", quantidade: 65, status: "in-stock" },
            { nome: "Amicacina IV", uso: "Infecções por gram-negativos resistentes", quantidade: 35, status: "low-stock" },
            { nome: "Metronidazol IV", uso: "Infecções anaeróbicas, intra-abdominais", quantidade: 90, status: "in-stock" }
        ],
        "cardiovasculares": [
            { nome: "Adrenalina (epinefrina) IV", uso: "Parada cardíaca, anafilaxia", quantidade: 25, status: "low-stock" },
            { nome: "Noradrenalina IV", uso: "Choque séptico", quantidade: 30, status: "low-stock" },
            { nome: "Dopamina IV", uso: "Suporte circulatório em choque", quantidade: 40, status: "low-stock" },
            { nome: "Dobutamina IV", uso: "Insuficiência cardíaca, choque cardiogênico", quantidade: 35, status: "low-stock" },
            { nome: "Atropina IV", uso: "Bradicardia grave", quantidade: 50, status: "in-stock" },
            { nome: "Lidocaína IV", uso: "Arritmias ventriculares", quantidade: 20, status: "low-stock" },
            { nome: "Amiodarona IV", uso: "Arritmias graves, fibrilação ventricular", quantidade: 15, status: "out-of-stock" }
        ],
        "solucoes": [
            { nome: "Soro fisiológico 0,9%", uso: "Reposição de líquidos, hidratação", quantidade: 500, status: "in-stock" },
            { nome: "Ringer lactato", uso: "Reposição de líquidos e eletrólitos", quantidade: 300, status: "in-stock" },
            { nome: "Cloreto de potássio IV", uso: "Hipocalemia, reposição eletrolítica", quantidade: 80, status: "in-stock" },
            { nome: "Bicarbonato de sódio IV", uso: "Acidose metabólica grave", quantidade: 60, status: "in-stock" },
            { nome: "Cloreto de cálcio IV", uso: "Hipocalcemia, paralisia por hipercalemia", quantidade: 40, status: "low-stock" },
            { nome: "Sulfato de magnésio IV", uso: "Pré-eclâmpsia, arritmias, broncoespasmo grave", quantidade: 35, status: "low-stock" }
        ],
        "anticoagulantes": [
            { nome: "Heparina IV", uso: "Prevenção e tratamento de tromboses", quantidade: 70, status: "in-stock" },
            { nome: "Ácido tranexâmico IV", uso: "Hemorragias graves", quantidade: 45, status: "low-stock" },
            { nome: "Clopidogrel IV", uso: "Em algumas situações de UTI ou cardiologia", quantidade: 25, status: "low-stock" }
        ],
        "anticonvulsivantes": [
            { nome: "Fenitoína IV", uso: "Convulsões prolongadas, epilepsia", quantidade: 55, status: "in-stock" },
            { nome: "Levetiracetam IV", uso: "Convulsões, alternativa moderna", quantidade: 40, status: "low-stock" },
            { nome: "Valproato de sódio IV", uso: "Crises convulsivas, status epilepticus", quantidade: 30, status: "low-stock" }
        ],
        "corticoides": [
            { nome: "Dexametasona IV", uso: "Alergias graves, choque séptico, inflamação", quantidade: 85, status: "in-stock" },
            { nome: "Metilprednisolona IV", uso: "Crises agudas, inflamação severa", quantidade: 60, status: "in-stock" },
            { nome: "Hidrocortisona IV", uso: "Insuficiência adrenal, choque séptico", quantidade: 45, status: "low-stock" }
        ],
        "antiemeticos": [
            { nome: "Ondansetrona IV", uso: "Náuseas e vômitos, quimioterapia", quantidade: 95, status: "in-stock" },
            { nome: "Metoclopramida IV", uso: "Náuseas e vômitos, gastroparesia", quantidade: 70, status: "in-stock" },
            { nome: "Dimenidrinato IV", uso: "Náuseas graves", quantidade: 50, status: "in-stock" }
        ],
        "outros": [
            { nome: "Insulina IV", uso: "Controle de hiperglicemia em UTI", quantidade: 110, status: "in-stock" },
            { nome: "Glucose 10% ou 25% IV", uso: "Hipoglicemia grave, nutrição", quantidade: 200, status: "in-stock" },
            { nome: "Furosemida IV", uso: "Edema, insuficiência cardíaca, diurético", quantidade: 65, status: "in-stock" },
            { nome: "Manitol IV", uso: "Edema cerebral, pressão intracraniana", quantidade: 30, status: "low-stock" },
            { nome: "Naloxona IV", uso: "Reversão de efeito de opioides", quantidade: 25, status: "low-stock" },
            { nome: "Flumazenil IV", uso: "Reversão de benzodiazepínicos", quantidade: 20, status: "low-stock" }
        ]
    };
}

// ========== SISTEMA DE ARMAZENAMENTO ==========

class MedicineDatabase {
    constructor() {
        this.storageKey = 'medcontrol_medicines_data';
        this.isInitialized = false;
    }

    // Inicializar o banco
    async init() {
        if (this.isInitialized) return;
        
        console.log('💊 Inicializando banco de dados de medicamentos...');
        
        // Verificar se já existem dados salvos
        const hasData = await this.hasSavedData();
        if (!hasData) {
            console.log('📝 Populando com dados iniciais...');
            await this.initializeDefaultData();
        }
        
        this.isInitialized = true;
        console.log('✅ Banco de medicamentos pronto!');
    }

    // Verificar se há dados salvos
    async hasSavedData() {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem(this.storageKey) !== null;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Popular dados iniciais
    async initializeDefaultData() {
        const defaultMedicines = getLocalMedicamentos();
        await this.saveAllMedicines(defaultMedicines);
    }

    // ========== OPERAÇÕES CRUD ==========

    // Buscar TODOS os medicamentos
    async getAllMedicines() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem(this.storageKey);
                if (stored) {
                    return JSON.parse(stored);
                }
            }
            return getLocalMedicamentos();
        } catch (error) {
            console.error('❌ Erro ao carregar medicamentos:', error);
            return getLocalMedicamentos();
        }
    }

    // Salvar TODOS os medicamentos
    async saveAllMedicines(medicamentos) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify(medicamentos));
            }
            console.log('💾 Todos os medicamentos salvos');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar medicamentos:', error);
            return false;
        }
    }

    // Buscar medicamento por nome
    async getMedicineByName(medicineName) {
        const medicamentos = await this.getAllMedicines();
        
        for (const category in medicamentos) {
            const medicine = medicamentos[category].find(m => m.nome === medicineName);
            if (medicine) {
                return {
                    ...medicine,
                    categoria: category
                };
            }
        }
        return null;
    }

    // Atualizar quantidade de um medicamento
    async updateMedicineQuantity(medicineName, newQuantity) {
        try {
            console.log(`🔧 Atualizando ${medicineName} para ${newQuantity} unidades`);
            
            const medicamentos = await this.getAllMedicines();
            let medicineUpdated = false;
            
            // Procurar em todas as categorias
            for (const category in medicamentos) {
                const medicineIndex = medicamentos[category].findIndex(m => m.nome === medicineName);
                if (medicineIndex !== -1) {
                    // Atualizar quantidade
                    medicamentos[category][medicineIndex].quantidade = newQuantity;
                    
                    // Atualizar status automaticamente
                    if (newQuantity === 0) {
                        medicamentos[category][medicineIndex].status = 'out-of-stock';
                    } else if (newQuantity < 50) {
                        medicamentos[category][medicineIndex].status = 'low-stock';
                    } else {
                        medicamentos[category][medicineIndex].status = 'in-stock';
                    }
                    
                    medicineUpdated = true;
                    console.log(`✅ ${medicineName} atualizado na categoria ${category}`);
                    break;
                }
            }
            
            if (medicineUpdated) {
                await this.saveAllMedicines(medicamentos);
                return medicamentos;
            } else {
                throw new Error(`Medicamento "${medicineName}" não encontrado`);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar quantidade:', error);
            throw error;
        }
    }

    // Buscar medicamentos por categoria
    async getMedicinesByCategory(category) {
        const medicamentos = await this.getAllMedicines();
        return medicamentos[category] || [];
    }

    // Buscar medicamentos com estoque baixo
    async getLowStockMedicines() {
        const medicamentos = await this.getAllMedicines();
        const lowStock = [];
        
        for (const category in medicamentos) {
            const lowStockInCategory = medicamentos[category].filter(m => 
                m.status === 'low-stock' || m.status === 'out-of-stock'
            );
            lowStock.push(...lowStockInCategory.map(med => ({
                ...med,
                categoria: category
            })));
        }
        
        return lowStock;
    }

    // Adicionar novo medicamento
    async addMedicine(category, medicineData) {
        const medicamentos = await this.getAllMedicines();
        
        if (!medicamentos[category]) {
            medicamentos[category] = [];
        }
        
        // Verificar se já existe
        const exists = medicamentos[category].some(m => m.nome === medicineData.nome);
        if (exists) {
            throw new Error(`Medicamento "${medicineData.nome}" já existe na categoria ${category}`);
        }
        
        // Adicionar status baseado na quantidade
        let status = 'in-stock';
        if (medicineData.quantidade === 0) {
            status = 'out-of-stock';
        } else if (medicineData.quantidade < 50) {
            status = 'low-stock';
        }
        
        const newMedicine = {
            ...medicineData,
            status: status
        };
        
        medicamentos[category].push(newMedicine);
        await this.saveAllMedicines(medicamentos);
        
        return newMedicine;
    }

    // Remover medicamento
    async removeMedicine(medicineName) {
        const medicamentos = await this.getAllMedicines();
        let removed = false;
        
        for (const category in medicamentos) {
            const initialLength = medicamentos[category].length;
            medicamentos[category] = medicamentos[category].filter(m => m.nome !== medicineName);
            
            if (medicamentos[category].length !== initialLength) {
                removed = true;
                break;
            }
        }
        
        if (removed) {
            await this.saveAllMedicines(medicamentos);
            return true;
        } else {
            throw new Error(`Medicamento "${medicineName}" não encontrado`);
        }
    }

    // Resetar para dados padrão
    async resetToDefault() {
        console.log('🔄 Resetando para dados padrão...');
        await this.initializeDefaultData();
        return await this.getAllMedicines();
    }

    // Estatísticas do estoque
    async getStockStatistics() {
        const medicamentos = await this.getAllMedicines();
        let totalMedicines = 0;
        let totalQuantity = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        
        for (const category in medicamentos) {
            totalMedicines += medicamentos[category].length;
            
            medicamentos[category].forEach(med => {
                totalQuantity += med.quantidade;
                if (med.status === 'low-stock') lowStockCount++;
                if (med.status === 'out-of-stock') outOfStockCount++;
            });
        }
        
        return {
            totalMedicines,
            totalQuantity,
            lowStockCount,
            outOfStockCount,
            categories: Object.keys(medicamentos).length
        };
    }

    // Backup dos dados
    async exportData() {
        const data = await this.getAllMedicines();
        return {
            data: data,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Restaurar dados
    async importData(backupData) {
        if (backupData && backupData.data) {
            await this.saveAllMedicines(backupData.data);
            return true;
        }
        throw new Error('Dados de backup inválidos');
    }
}

// ========== INSTÂNCIA GLOBAL ==========
const medicineDB = new MedicineDatabase();

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========
(async function() {
    await medicineDB.init();
    console.log('🏥 Sistema de medicamentos carregado!');
})();

// ========== FUNÇÕES DE UTILIDADE ==========

// Função para debug
async function debugMedicineDB() {
    console.log('🐛 DEBUG - Banco de Medicamentos:');
    
    const stats = await medicineDB.getStockStatistics();
    console.log('📊 Estatísticas:', stats);
    
    const lowStock = await medicineDB.getLowStockMedicines();
    console.log('⚠️  Estoque baixo:', lowStock.length, 'medicamentos');
    
    lowStock.forEach(med => {
        console.log(`   - ${med.nome}: ${med.quantidade} unidades (${med.categoria})`);
    });
}

// Exemplo de uso:
/*
// Buscar todos os medicamentos
const todosMedicamentos = await medicineDB.getAllMedicines();

// Atualizar quantidade
await medicineDB.updateMedicineQuantity("Paracetamol IV", 100);

// Buscar medicamentos de uma categoria
const analgesicos = await medicineDB.getMedicinesByCategory("analgesicos");

// Adicionar novo medicamento
await medicineDB.addMedicine("analgesicos", {
    nome: "Novo Analgésico",
    uso: "Dor geral",
    quantidade: 75
});

// Ver estatísticas
const stats = await medicineDB.getStockStatistics();
*/