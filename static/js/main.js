
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
		
		executeQuery(endpoint);
	}
	
}

function executeQuery(endpoint){

	startLoadingAnimation();
	
	console.log(endpoint);
	
	$.getJSON(endpoint).done(function(json) {
		console.log(json);
		var groups = json.groups;
		var text = [];
		if (groups.length != 0){
			
			
			for( group in groups ){
				suppliers = groups[group];
				var tmp = "";
				tmp = tmp + "<p><h3>Total Cost: " + suppliers[0]['total_price']  + "</h3></p>";
				tmp = tmp + "<table class='my_table'><tr>";
				
				for( i=1; i < suppliers.length; i++){
					// Do something here with the data
					if((i-1) > 0 && (i-1) % 4 == 0) {
						tmp = tmp + "</tr><tr>"
					}
					tmp = tmp + "<td><p><strong>" + suppliers[i].name + "</strong></br>";
					tmp = tmp + "<i>" + suppliers[i].discipline + "</i></br><small>";
					
					if(suppliers[i].contact != null) {
						tmp = tmp + "Contact: " + suppliers[i].contact + "</br>";
					}
					
					if(suppliers[i].phone != null){
						tmp = tmp + "Phone: " + suppliers[i].phone + "</br>";
					}
					
					if(suppliers[i].email != null){
						tmp = tmp + "Email: " + suppliers[i].email + "</br>";
					}
					
					if(suppliers[i].times_hired != null){
						tmp = tmp + "Times hired: " + suppliers[i].times_hired + "</br>";
					}
					
					if(suppliers[i].location != null){
						tmp = tmp + "Location: " + suppliers[i].location + "</br>";
					}
					
					if(suppliers[i].experience_rating != null){
						tmp = tmp + "Experience Rating: " + suppliers[i].experience_rating + "</br>";
					}
					
					if(suppliers[i].quality_rating != null){
						tmp = tmp + "Quality Rating: " + suppliers[i].quality_rating + "</br>";
					}
					
					if(suppliers[i].price_rating != null){
						tmp = tmp + "Price Rating: " + suppliers[i].price_rating;
					}
					
					tmp = tmp + "</small></p></td>";
					
								
				}		
				
				tmp = tmp + "</tr></table>"
				
				
				
				console.log(tmp);
				
				text.push(tmp);
			}
			
			
			
			BootstrapDialog.show({
            title: 'Possible groupings',
            message: text[0],
			size: BootstrapDialog.SIZE_WIDE,
            buttons: [{
                label: 'Option 1',
                action: function(dialog) {
                    dialog.setMessage(text[0]);
                }
            }, {
                label: 'Option 2',
                action: function(dialog) {
                    dialog.setMessage(text[1]);
                }
            }, {
                label: 'Option 3',
                action: function(dialog) {
                    dialog.setMessage(text[2]);
                }
            }]
        });
		
		} else {
			// No info to display
			BootstrapDialog.alert({title:"Information", message:"No results found. Try a different combination"});
		}
		
		stopLoadingAnimation();
	});
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
	var endpoint = '/disciplines';

	$.getJSON(endpoint).done(function(json) {
		
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
