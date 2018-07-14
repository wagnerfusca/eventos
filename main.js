const app = function () {
	const API_BASE = 'https://script.google.com/macros/s/AKfycbzfcFWq9-9MZmDeZKdFa0dEg9a7JEV0PJ-NR7xboZtRRtr9FUM/exec';
	const API_KEY = 'eventosfusca';
	const CATEGORIES = ['Agilidade', 'Blockchain', 'CIO/Executivos', 'Cloud', 'Desenvolvimento', 'Ecommerce', 'Geral', 'IA-Inteligencia_Cognitiva', 'Inovacao', 'IOT', 'Lean', 'Lideranca', 'PMI-PMP', 'Produtos', 'RH', 'Robotica', 'Seguranca', 'UX-CX-PX'];
	

	const state = {activeCategory: null};
	const page = {};
	function init () {
		page.notice = document.getElementById('notice');
		page.filter = document.getElementById('filter');
		page.container = document.getElementById('container');
		page.alert = document.getElementById('alert');
		_buildFilter();
		_getEvents();
	}

	function _setDataAtualizacao(cabecalho) {
		page.alert.innerHTML = '<div class="alert alert-info" role="alert"> Atualizado em: <b>'+cabecalho[13]+'</b></div>';
	}
	function _getEvents () {
		page.container.innerHTML = '';
		const novaTabela = document.createElement('div');
		novaTabela.innerHTML = `
			<table class="table table-striped" id="tabela">
			  <thead>
				<tr>
				  <th scope="col">Nome</th>
				  <th scope="col">Categoria</th>
				  <th scope="col">UF ou Pais</th>
				  <th scope="col">Cidade</th>
				  <th scope="col">Mes/ano</th>
				  <th scope="col">Data Inicio</th>
				  <th scope="col">Data Fim</th>
				  <th scope="col">Call4Papers</th>
				  <th scope="col">Site</th>
				</tr>
			  </thead>
			  <tbody id="table-body">
			  </tbody>
			</table>
			`   ;
				
		page.container.appendChild(novaTabela);
		_getJson();
	}

	function _getJson () {
			fetch(_buildApiUrl(state.activeCategory))
			.then((response) => response.json())
			.then((json) => {
				if (json.status !== 'success') {
					_setNotice(json.message);
				}
				_setDataAtualizacao(json.cabecalho)
				_renderEvents(json.data);
			})
			.catch((error) => {
				_setNotice('Unexpected error loading posts');
				alert(error);
			})
	}

	function _buildFilter () {

	    page.filter.appendChild(_buildFilterLink('Sem Filtro', true));
		
	    CATEGORIES.forEach(function (category) {
	    	page.filter.appendChild(_buildFilterLink(category, false));
	    });
	}

	function _buildFilterLink (label, isSelected) {
		const link = document.createElement('button');
	  	link.innerHTML = _capitalize(label);
	  	link.classList = isSelected ? 'selected btn btn-primary hidden-xs' : 'btn btn-outline-primary hidden-xs';
	  	link.onclick = function (event) {
	  		let category = label === 'Sem Filtro' ? null : label.toLowerCase();

			_setActiveCategory(category);
			_getEvents();
	  	};

	  	return link;
	}

	function _buildApiUrl (category) {
		let url = API_BASE;
		url += '?key=' + API_KEY;
		url += category !== null ? '&category=' + category : '';
		return url;
	}

	function _setNotice (label) {
		page.notice.innerHTML = label;
	}

	function _renderEvents (posts) {
		posts.forEach(function (post) {
			const linha = document.createElement('tr');
			linha.innerHTML = `
				  <th scope="row"> ${post.nome} </th>
				  <td> ${post.categoria} </td>
				  <td> ${post.uf} </td>
				  <td> ${post.local} </td>
				  <td> ${_formatDateMMYYYY(post.mesano)} </td>
				  <td> ${_formatDateDDMMYYYY(post.inicio)} </td>
				  <td> ${_formatDateDDMMYYYY(post.fim)} </td>
				  <td> ${_formatString(post.call4papers)} </td>
				  <td> <a href="${post.site}" target="_blank">${_formatLink(post.site)}</a> </td>
				  	
			`;	
			document.getElementById('table-body').appendChild(linha);
		});
	}

	function _formatString (string) {
		if(string == ''){
			return '';
		}
		return string;
	}
	function _formatLink (string) {
		if(string == ''){
			return '';
		}
		return 'Acesse o site';
	}

	function _formatDateMMYYYY (string) {
		if(string == ''){
			return '';
		}
		var options = { year: 'numeric', month: 'numeric' };
		return new Date(string).toLocaleDateString('en-GB', options);
	}

	function _formatDateDDMMYYYY (string) {
		if(string == ''){
			return '';
		}
		return new Date(string).toLocaleDateString('en-GB');
	}

	function _capitalize (label) {
		return label.slice(0, 1).toUpperCase() + label.slice(1).toLowerCase();
	}

	
	function _setActiveCategory (category) {
		state.activeCategory = category;
		
		const label = category === null ? 'Sem Filtro' : category;
		Array.from(page.filter.children).forEach(function (element) {
  			element.classList = label === element.innerHTML.toLowerCase() ? 'selected btn btn-primary hidden-xs' : 'btn btn-outline-primary hidden-xs';
  		});
	}

	return {
		init: init
 	};
}();
