var fedBracket 	= [0, 45916, 91831, 142353, 202800];
var fedRate		= [0.15, 0.205, 0.26, 0.29, 0.33];

var provBracket = [[0, 38898, 77797, 89320, 108460]];
var provRate 	= [[0.0506, 0.077, 0.105, 0.1229, 0.147]];

var provSelection		= 0;
var bracketCount		= 5;
var highestFedBracket 	= 0;
var highestProvBracket 	= 0;

var income = 0;
var employmentIncome = 0;
var projectedEmploymentIncome = 0;
var monthsWorked = 12;
var deductions = 0;
var capGains = 0;
var dividends = 0;
var totalIncome = 0;
var taxableIncome = 0;
var taxed = 0;

// function appendScrollCancellationToInputs() {
// 	for (let input of document.getElementsByTagName("input")) {
// 		input.setAttribute("onfocus", "window.scrollTo(0, 0);");
// 	}
// }

//Formats money with commas and periods
Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

//Helper function to simplify code
function $(id) {
	return document.getElementById(id);
}

//Reads in new values from the form
function update() {
	taxed = 0;
	employmentIncome = $("income").value;
	monthsWorked = $("months_worked").value;
	deductions = $("deductions").value;
	capGains = $("capital_gains").value;
	dividends = $("dividends").value;
	adjustIncomeForMonthsWorked();
	taxableIncome = projectedEmploymentIncome - deductions;
	income = +employmentIncome + +capGains;
	calculateFed();
	calculateProv();
	calculateCapGains();
	calculateDividends();
	console.log("income: " + income);
	calculateAndDisplayNetIncome();
}

//Calculates the federal tax breakdown
function calculateFed() {
	highestFedBracket = 0;
	for (var index = 0; index < bracketCount; index++) {
		var removed = 0;
		if (index < 4 && taxableIncome >= fedBracket[index + 1]) {
			removed = (fedBracket[index + 1] - fedBracket[index]) * fedRate[index];
			highestFedBracket = index;
		} else if (taxableIncome > fedBracket[index]) {
			removed = (taxableIncome - fedBracket[index]) * fedRate[index];
			highestFedBracket = index;
		}
		
		$("fed_data").children[index].children[0].value = "$" + removed.formatMoney();
		taxed += removed;
	}
}

//Calculates the provincial tax breakdown
function calculateProv() {
	highestProvBracket = 0;
	for (var index = 0; index < bracketCount; index++) {
		var removed = 0;
		if (index < 4 && taxableIncome >= provBracket[provSelection][index + 1]) {
			removed = (provBracket[provSelection][index + 1] - provBracket[provSelection][index]) * provRate[provSelection][index];
			highestProvBracket = index;
		} else if (taxableIncome > provBracket[provSelection][index]) {
			removed = (taxableIncome - provBracket[provSelection][index]) * provRate[provSelection][index];
			highestProvBracket = index;
		}
		
		$("prov_data").children[index].children[0].value = "$" + removed.formatMoney();
		taxed += removed;
	}
}

function adjustIncomeForMonthsWorked() {
	projectedEmploymentIncome = employmentIncome * 12 / monthsWorked;
}

//Calculates capital gains tax
function calculateCapGains() {
	var removed = 0;
	removed = (capGains / 2) * (fedRate[highestFedBracket] + provRate[provSelection][highestProvBracket]);
	$("cap_gains_tax").value = "$" + removed.formatMoney();
	taxed += removed;
}

//Calculates dividends tax
function calculateDividends() {
	
}

function calculateAndDisplayNetIncome() {
	console.log('taxed: ' + taxed);
	taxed *= monthsWorked / 12;
	console.log("employment: " + employmentIncome + "\nprojected: " + projectedEmploymentIncome + "\ntaxed: " + taxed);
	$("net_income").value = "$" + (income - taxed).formatMoney(2);
}
