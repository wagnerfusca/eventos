const app = function () {
	const API_BASE = 'https://script.google.com/macros/s/AKfycbzfcFWq9-9MZmDeZKdFa0dEg9a7JEV0PJ-NR7xboZtRRtr9FUM/exec';
	const API_KEY = 'eventosfusca';
	const YEAR_FILTER_LENGHT = 3;
	const CATEGORIES = {
		'Todos': {name: 'Todos', color: '#000'},
		'Agilidade': {name: 'Agilidade', color: '#bfa719'},
		'CIO/Executivos': {name: 'CIO/Executivos', color: '#3b987d'},
		'Desenvolvimento': {name: 'Desenvolvimento', color: '#a14360'},
		'Geral': {name: 'Geral', color: '#613176'},
		'Hackathon': {name: 'Hackathon', color: '#8B4513'}, 
		'Inovação': {name: 'Inovação', color: '#d02a15'},
		'Liderança': {name: 'Liderança', color: '#5a83de'},
		'Produtos': {name: 'Produtos', color: '#02b820'},
		'RH': {name: 'RH', color: '#e90f95'},
		'Segurança': {name: 'Segurança', color: '#7ec26b'},
		'Testes': {name: 'Testes', color: '#D7DF01'},
	};
	const MONTH_NAMES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
	 	'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
	];

	var novosDetalhesDoEvento = '';

	const state = {activeCategory: null, initialized: false};
	const page = {};
	function init () {
		page.notice = document.getElementById('notice');
		page.filter = document.getElementById('category-list');
		page.container = document.getElementById('container');
		page.alert = document.getElementById('alert');
		_buildFilter();
		_buildDateFilters();
		_getJson();
	}

	function _setDataAtualizacao(cabecalho) {
		page.alert.innerHTML = '<div> Atualizado em: <b>'+cabecalho[13]+'</b></div>';
	}

	function _getJson () {
			$('.loading').toggle();
			fetch(_buildApiUrl(state.activeCategory))
			.then((response) => response.json())
			.then((json) => {
				if (json.status !== 'success') {
					_setNotice(json.message);
				}
				_setDataAtualizacao(json.cabecalho);
				_initDateFilters();
				localStorage.setItem('eventos', JSON.stringify(json));
				_renderEvents(json.data);
				if(!state.initialized){
					_setQtyBadges(json.data);
					state.initialized = true;
				}
				$('.loading').toggle();
			})
			.catch((error) => {
				_setNotice('Unexpected error loading events');
			})
	}

	function _initDateFilters() {
		document.getElementById("month-select").selectedIndex = 0;
		
		yearSelect = document.getElementById("year-select");
		yearSelect.selectedIndex = 0;
		
	}

	function _buildDateFilters () {
		monthSelect = document.getElementById("month-select");
		yearSelect = document.getElementById("year-select");

		if (yearSelect.length = 1)
		{
			for (i = 0; i < YEAR_FILTER_LENGHT; i++)
			{
				var opt = document.createElement('option');
				opt.value = opt.innerHTML = new Date().getFullYear() + i;
				yearSelect.appendChild(opt);
			}
		}

		monthSelect.onchange = yearSelect.onchange = function () {
			_filterDate(monthSelect.value, yearSelect.value);
		};
	}

	function _filterDate(month, year) {
		let eventos = JSON.parse(localStorage.getItem('eventos'));
		eventos.data = eventos.data.filter(function (evento){
												if (month == 0 && year == 0) return evento;
												if (year == 0) return new Date(evento.inicio).getMonth() == month -1;
												if (month == 0) return new Date(evento.inicio).getFullYear() == year;
												return new Date(evento.inicio).getFullYear() == year && new Date(evento.inicio).getMonth() == month -1;
											});
		_renderEvents(eventos.data);
	}

	function _setQtyBadges (events) {
		var categories = [];
		categories['Todos'] = events.length;
		events.forEach(function(event){
			const category = _getCategoryByName(event.categoria);
			if(!categories[event.categoria])
				categories[event.categoria] = 0;
			if(
				event.categoria === category.name ||
				event.categoria === category.index
			){

				categories[event.categoria] += 1;
			}
		});

		var filters = document.querySelectorAll('[data-category]');
		filters.forEach(function(filterElement){
			var cat = _getCategoryByName(filterElement.dataset.category);
			filterElement.innerHTML += `
				<span style="background-color: ${cat.color}" class="float-right badge round">
				${categories[filterElement.dataset.category] || 0}
				</span>
			`;
		});
	}
	function _buildFilter () {
		for(var prop in CATEGORIES) {
			page.filter.appendChild(_buildFilterLink(CATEGORIES[prop].name, prop, false));
		}
	}

	function _buildFilterLink (element, key, isSelected) {
		const categoryListElement = document.createElement('a');
		  categoryListElement.innerHTML = _capitalize(element);
		  categoryListElement.setAttribute('data-category', key);
		  categoryListElement.href = '#';
		  categoryListElement.classList = isSelected ? 'list-group-item active' : 'list-group-item';
		  categoryListElement.onclick = function (event) {
		  	let category = key === 'Todos' ? null : key.toLowerCase();

			_setActiveCategory(category);
			_getJson();
		  };
		  return categoryListElement;
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


	function _setNovosDetalhesDoEvento(label){
			novosDetalhesDoEvento = '';
			if (label == 'NEW') {
				novosDetalhesDoEvento = '<img src = "img/new.png"/> </h2>';
			}
	}

	function _renderEvents (eventsData) {
		let eventListElement = document.getElementById('event-list');
		eventListElement.innerHTML = '';
		eventsData.forEach(function (event) {
			let linha = document.createElement('li');
			const category = _getCategoryByName(event.categoria);
			_setNovosDetalhesDoEvento(event.novo);

			linha.innerHTML = `
				${_renderTime(event)}
				<div class="info">
					<div class="category" style="background-color: ${category.color}">${category.name}</div>
					
					<div class="row">
						<div class="col-sm-10">
							<h2 class="title">${event.nome} ${novosDetalhesDoEvento}

						</div>
					</div>
					<div class="d-flex">
						<div class="col-xs-12 col-sm-6">
							<div class="row">
								<div class="col-sm-3 font-weight-bold">Início:</div>
								<div class="col-sm-9">${_formatDateDDMMYYYY(event.inicio)}</div>
							</div>
							<div class="row">
								<div class="col-sm-3 font-weight-bold">Fim:</div>
								<div class="col-sm-9">${_formatDateDDMMYYYY(event.fim)}</div>
							</div>
							
						</div>
						<div class="col-xs-12 col-sm-6">
							<div class="row">
								<div class="col-sm-3 font-weight-bold">Local:</div>
								<div class="col-sm-9">${event.local} - ${event.uf}</div>
							</div>
							<div class="row">
								<div class="col-sm-3 font-weight-bold">Call4Papers:</div>
								<div class="col-sm-9">${_formatString(event.call4papers)}</div>
							</div>
						</div>
					</div>
					<div class="links mt-3">
						<a href="${event.site}" target="_blank">
							<span>Site do Evento</span>
							<i class="fa fa-arrow-circle-right"></i>
						</a>
					</div>
				</div>`;
			eventListElement.appendChild(linha);
		});
	}

	function _getCategoryByName (category) {
		const categoryIndex = Object.keys(CATEGORIES).filter(function(index){
			return CATEGORIES[index].name === category 
					|| index === category;
		});
		CATEGORIES[categoryIndex].index = categoryIndex[0];
		return CATEGORIES[categoryIndex];
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
	function _renderTime (event) {
		var date = new Date(event.inicio);
		const category = _getCategoryByName(event.categoria);
		if(event.inicio){
			return `
				<time datetime="${_formatDateDDMMYYYY(event.inicio)}" style="background-color: ${category.color}">
					<span class="day">${date.getDate()}</span>
					<span class="month">${ MONTH_NAMES[date.getMonth()] }</span>
					<span class="year">${ date.getFullYear() }</span>
				</time>
			`;
		}
		var date = new Date(event.mesano);
		return `
			<time datetime="${_formatDateDDMMYYYY(event.mesano)}" style="background-color: ${category.color}"">
				<span class="month">${ MONTH_NAMES[date.getMonth()] }</span>
				<span class="year">${ date.getFullYear() }</span>
			</time>
		`;
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
		$('#collapseAside').removeClass('show');
		state.activeCategory = category;
		
		const label = category === null ? 'Todos' : category;
		Array.from(page.filter.children).forEach(function (element) {
			element.classList = label === element.innerHTML.toLowerCase() ? 'list-group-item active' : 'list-group-item';
	  	});
	}

	return {
		init: init
	 };
}();
