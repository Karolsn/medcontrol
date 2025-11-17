// Inicializa Supabase e exporta helpers simples.

(function (global) {
	// Checar variáveis definidas no HTML
	const SUPABASE_URL = (global && global.SUPABASE_URL) || '';
	const SUPABASE_ANON_KEY = (global && global.SUPABASE_ANON_KEY) || '';

	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		console.warn('Supabase não configurado: defina window.SUPABASE_URL e window.SUPABASE_ANON_KEY em principal.html');
	}

	// cria cliente (usa objeto global supabase vindo do UMD)
	const supabase = (typeof supabase !== 'undefined' && supabase.createClient)
		? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
		: null;

	// Funções exportadas
	async function signIn(email, password) {
		if (!supabase) throw new Error('Supabase não inicializado');
		return supabase.auth.signInWithPassword({ email, password });
	}

	async function signOut() {
		if (!supabase) throw new Error('Supabase não inicializado');
		return supabase.auth.signOut();
	}

	async function getUser() {
		if (!supabase) throw new Error('Supabase não inicializado');
		const { data } = await supabase.auth.getUser();
		return data?.user || null;
	}

	// Buscar medicamentos diretamente da tabela 'medicamentos'
	// Ajuste os campos selecionados conforme seu schema no Supabase
	async function fetchMedicinesSupabase() {
		if (!supabase) throw new Error('Supabase não inicializado');
		const { data, error } = await supabase
			.from('medicamentos')
			.select('*');
		if (error) throw error;
		return data || [];
	}

	// Atualizar quantidade: tenta atualizar por id (prefere id) ou por nome
	// medicine: { id?, nome, quantidade? }
	async function updateMedicineQuantitySupabase(medicine, newQuantity) {
		if (!supabase) throw new Error('Supabase não inicializado');
		if (!medicine) throw new Error('medicine é obrigatório');
		// preferir id
		if (medicine.id) {
			const { data, error } = await supabase
				.from('medicamentos')
				.update({ quantidade: newQuantity })
				.eq('id', medicine.id)
				.select()
				.single();
			if (error) throw error;
			return data;
		}
		// fallback por nome
		const { data, error } = await supabase
			.from('medicamentos')
			.update({ quantidade: newQuantity })
			.eq('nome', medicine.nome)
			.select();
		if (error) throw error;
		return data;
	}

	// expõe API global simples para uso pelo script principal
	global.SUPABASE_CLIENT = {
		supabase,
		signIn,
		signOut,
		getUser,
		fetchMedicinesSupabase,
		updateMedicineQuantitySupabase
	};
})(window);
