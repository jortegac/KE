
var currentGeolocation;
var currentCity = "";
var currentCountry = "";
var locationBoundS = "";
var locationBoundW = "";
var locationBoundN = "";
var locationBoundE = "";
var autocomplete;

$( document ).ready(function() {
	
	// Where the spinner animation will be placed 
	target = document.getElementById('modal');	
	initForm();
	initializeLocationAutocomplete();
});

function initForm() {

	$("#searchForm").submit(function( event ) {
		// Prevent default behaviour from the search button
		event.preventDefault();		
		submitForm();
	});

	initDisciplines();
	initDatePicker();	
	getDisciplines();
}

function submitForm() {

	// Flag for crudely checking if the needed info is in place
	var flag = true;
	var errorMessage = "";

	// Get selected disciplines
	var disciplines = $("#disciplinesDropDown").dropdownCheckbox("checked");
	
	// Build disciplines query string
	var disciplinesQueryString = "";	
	for (discipline in disciplines){
		disciplinesQueryString = disciplinesQueryString + "&ds=" + disciplines[discipline].id;
	}
	
	if (disciplinesQueryString == "") {
		errorMessage = "No disciplines selected. \n";
		flag = false;
	}
	
	// Build date query string
	var date = $("#date-event").val();	
	var dateQueryString = "";
	if (date != "") {
		dateQueryString = "&date=" + date;
	}
	
	// Build location query string
	var location = $("#locationTextField").val();
	var locationQueryString = "";	
	if (location != "" ){
		locationQueryString = "&location=" + location.substring(0, location.indexOf(","));
	}else{
		errorMessage = errorMessage + "No location selected. \n";
		flag = false;
	}
	
	// Build budget query string
	var budget = $("#budget").val();
	var budgetQueryString = "";	
	if (budget != "" ){
		budgetQueryString = "&budget=" + budget;
	}else{
		errorMessage = errorMessage + "No budget selected. \n";
		flag = false;
	}
	
	// Build visitors query string
	var visitors = $("#visitors").val();
	var visitorsQueryString = "";	
	if (visitors != "" ){
		visitorsQueryString = "&visitors=" + visitors;
	}else{
		errorMessage = errorMessage + "No visitors selected. \n";
		flag = false;
	}
	
	// Build skill rating query string
	//var skill = $("#skill").val();
	
	var skill = $('input:radio[name=skill]:checked').val();	
	var skillQueryString = "&skill=" + skill;	
	
	// Build quality rating query string
	var quality = $('input:radio[name=quality]:checked').val();
	var qualityQueryString = "&quality=" + quality;	
	
	// Build price rating query string
	var price = $('input:radio[name=price]:checked').val();
	var priceQueryString = "&price=" + price;	
	
	// Check if some data is missing
	if(!flag){
		BootstrapDialog.alert({title:"Information", message:errorMessage});
	}else{
		// Do stuff
		
		// Build full query string
		var endpoint = "/findSuppliers?" + disciplinesQueryString + dateQueryString + locationQueryString + budgetQueryString + visitorsQueryString + skillQueryString + qualityQueryString + priceQueryString;
	}
	
}

function initDisciplines() {
	$("#disciplinesDropDown").dropdownCheckbox({
			data: [{id:1, label: "Waiting for data..."}],
			title: "Select required disciplines",
			btnClass: "btn btn-primary",
			autosearch: true,
			hideHeader: false,
	});
}


// Initialize the date picking UI elements
function initDatePicker(){
	var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

	var eventDate = $('#date-event').datepicker({
		format:"yyyy-mm-dd",
		onRender: function(date) {
			return date.valueOf() < now.valueOf() ? 'disabled' : '';
		}
	}).on('changeDate', function(ev) {
		eventDate.hide();
		$('#dpd2')[0].focus();
	}).data('datepicker');
	
	
}

// Retrieves a list of genres from the RDF store
function getDisciplines(){
	var genres = [];
	var service = '/disciplines';

	$.getJSON(service).done(function(json) {
		
		$.each(json.disciplines, function(i, discipline) {			
			var name = discipline.discipline;			
			var item = {id: name, label: name}			
			genres.push(item)			
		});	
		
		$("#disciplinesDropDown").dropdownCheckbox("reset", genres);
	});
}

function initializeLocationAutocomplete(){
	// Code for the autocomplete location input text field
	var input = (document.getElementById('locationTextField'));
	
	// Limit the autocompletion to city names of the netherlands
	var autocompleOptions = {
		types: ['(cities)'],
		componentRestrictions: {country: 'nl'}
	};
	autocomplete = new google.maps.places.Autocomplete(input, autocompleOptions);
	google.maps.event.addListener(autocomplete, 'place_changed', function() {
		
		//reverseGeocodeLocation($("#locationTextField").val());
	});
}
