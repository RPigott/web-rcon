
// Model

// View

function commandLineInput(e) {

	if (e.which == 13) {
		var command = this.value
		e.preventDefault()
		this.value = ""
		execCommand(command)
	}
}

// Control

function makeOutput(command, response) {
	var commandElement = document.createElement('span');
	commandElement.classList.add('command');
	var commandText = document.createTextNode(command);
	commandElement.appendChild(commandText);

	var responseElement = document.createElement('span');
	responseElement.classList.add('response');
	var responseText = document.createTextNode(response)
	responseElement.appendChild(responseText);

	var output = document.getElementById('output');
	output.appendChild(commandElement);
	// if (response != "") {
		output.appendChild(responseElement);
	// };
};

function execCommand(command) {
	var connection = document.forms["connection"];
	var data = {
		'host' : connection['host'].value,
		'port' : connection['port'].value,
		'password' : connection['password'].value,
		'command' : command,
	};
	$.post(
		'cgi-bin/send.py',
		data,
		function(response, status) { makeOutput(command, response.toString());}
	)
};

// App Start

$(document).ready(function() {

	document.getElementById('command-line').addEventListener('keydown', commandLineInput)

});