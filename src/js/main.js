const app = function () {
	const API_BASE = 'https://script.google.com/macros/s/AKfycbzfcFWq9-9MZmDeZKdFa0dEg9a7JEV0PJ-NR7xboZtRRtr9FUM/exec';
	const API_KEY = 'eventosfusca';
	const CATEGORIES = ['Agilidade', 'Blockchain', 'CIO/Executivos', 'Cloud', 'Desenvolvimento', 'e-Comerce', 'Geral', 'IA/Inteligência Cognitiva', 'Inovação', 'IOT', 'Lean', 'Liderança', 'PMI/PMP', 'Produtos', 'RH', 'Robótica', 'Segurança', 'UX/CX/PX'];

	const state = {activePage: 1, activeCategory: null};
	const page = {};
	function init () {
		page.notice = document.getElementById('notice');
		page.filter = document.getElementById('filter');
		page.container = document.getElementById('container');

		//_buildFilter();
		_getEvents();
	}

	function _getEvents () {
		const novaTabela = document.createElement('div');
		novaTabela.innerHTML = `
			<table class="table" id="tabela">
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
			  <tbody>
			`   ;
				
		page.container.appendChild(novaTabela);
		_getJson();
		novaTabela.innerHtml = '</tbody></table>';
		page.container.appendChild(novaTabela);
	}

	function _getJson () {
			fetch(_buildApiUrl(state.activePage, state.activeCategory))
			.then((response) => response.json())
			.then((json) => {
				if (json.status !== 'success') {
					_setNotice(json.message);
				}

				_renderEvents(json.data);
			})
			.catch((error) => {
				_setNotice('Unexpected error loading posts');
				alert(error);
			})
	}

	function _buildFilter () {
	    page.filter.appendChild(_buildFilterLink('no filter', true));

	    //CATEGORIES.forEach(function (category) {
	    	//page.filter.appendChild(_buildFilterLink(category, false));
	    //});
	}

	function _buildFilterLink (label, isSelected) {
		const link = document.createElement('button');
	  	link.innerHTML = _capitalize(label);
	  	link.classList = isSelected ? 'selected' : '';
	  	link.onclick = function (event) {
	  		let category = label === 'no filter' ? null : label.toLowerCase();

			_setActiveCategory(category);
	  		//_getNewEvents();
	  	};

	  	return link;
	}

	function _buildApiUrl (page, category) {
		let url = API_BASE;
		url += '?key=' + API_KEY;
		//url += '&page=' + page;
		//url += category !== null ? '&category=' + category : '';
		//alert(url);
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
				  <td> <a href="${post.site}" target="_blank">${_formatString(post.site)}</a> </td>
				  	
			`;	
			document.getElementById('tabela').appendChild(linha);
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
		
		const label = category === null ? 'no filter' : category;
		Array.from(page.filter.children).forEach(function (element) {
  			element.classList = label === element.innerHTML.toLowerCase() ? 'selected' : '';
  		});
	}

	return {
		init: init
 	};
}();
