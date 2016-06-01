
// Model

// View
function commandLineInput(e) {

	if (e.which == 13) {
		var command = this.value;
		e.preventDefault();
		this.value = "";
		makeOutput('command', command);
		execCommand(command);
	};
};

// Control
function makeOutput(cls, text) {
	var element = document.createElement('span');
	element.classList.add(cls);
	var textElement = document.createTextNode(text);
	element.appendChild(textElement);

	var output = document.getElementById('output');
	output.appendChild(element);
};

function showCommand(command, response) {
	var commandElement = document.createElement('span');
	commandElement.classList.add('command');
	var commandText = document.createTextNode(command);
	commandElement.appendChild(commandText);

	var output = document.getElementById('output');
	output.appendChild(commandElement);
};

function showResponse(response) {
	var responseElement = document.createElement('span');
	responseElement.classList.add('response');
	var responseText = document.createTextNode(response)
	responseElement.appendChild(responseText);

	var output = document.getElementById('output');
	output.appendChild(responseElement);
};

function validate(data) {
	if (!data['host']) {
		return [false, "Invalid host"];
	};

	if (!Number(data['port'])) {
		return [false, "Invalid Port"]
	};

	if (!data['password']) {
		return [false, "Invalid password"]
	}

	return [true, 'OK']
}

function execCommand(command) {
	var connection = document.forms["connection"];
	var data = {
		'host' : connection['host'].value,
		'port' : connection['port'].value || "",
		'password' : connection['password'].value,
		'command' : command,
	};

	var [validated, message] = validate(data);

	if (!validated) {
		makeOutput('error', "Error: " + message)
	} else {
	$.post(
		'cgi-bin/send.py',
		data,
		function(response, status) {
			makeOutput('response', response);
			console.log(status);
		}
	);
	};
};

// App Start

$(document).ready(function() {

	document.getElementById('command-line').addEventListener('keydown', commandLineInput)

});