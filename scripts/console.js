
// Model

// View
function commandLineInput(e) {

	if (e.which == 13) {
		var command = this.value;
		e.preventDefault();
		this.value = "";
		makeOutput('command', command);
		var responseElement = makeOutput('response', '')
		execCommand(command, responseElement);
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
	output.scrollTop = output.scrollHeight;
	return element;
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

function execCommand(command, responseElement) {
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
			var responseText = document.createTextNode(response)
			responseElement.appendChild(responseText);
			output.scrollTop = output.scrollHeight;
			console.log(status);
		}
	);
	};
};

// App Start

$(document).ready(function() {

	document.getElementById('command-line').addEventListener('keydown', commandLineInput)

});