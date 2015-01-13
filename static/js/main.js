
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
	// Get selected disciplines
	var disciplines = $("#disciplinesDropDown").dropdownCheckbox("checked");
	
	// Get event date
	var date = $("#date-event").val();
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
			var name = discipline.name;			
			var item = {id: name, label: name}			
			genres.push(item)			
		});	
		
		$("#disciplinesDropDown").dropdownCheckbox("reset", genres);
	});
}
