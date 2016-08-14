/* globals $SCRIPT_ROOT, $SEND_URL */

const ENTER = 13;
const ESC   = 27;
const UP    = 38;
const DOWN  = 40;

function direction(dir) {
	return 39 - dir;
};

$(document).ready( function() {

var Console = {

	'helpMsg' : 'No help message yet, sorry.',

	'init' : function () {
		this.history = [];
		this.historyIndex = 0;
		this.commandLine = document.getElementById('command-line');
		this.output = document.getElementById('output');

		this.specialCommands = {
			'!clear' : this.doClear.bind(this),
			'!help'  : this.doHelp.bind(this),
		};

		this.bindEvents();
	},

	'bindEvents' : function () {
		this.commandLine.addEventListener('keydown', this.commandLineInput.bind(this));
	},

	'commandLineInput' : function (e) {
		if (e.which === ENTER && !e.shiftKey) {
			e.preventDefault()
			this.submitCommand()
		} else if (e.which === ESC) {
			this.commandLine.value = "";
			this.historyIndex = 0;
		} else if (e.which === UP || e.which === DOWN) {
			this.navigateHistory(direction(e.which));
		}
	},

	'getConnectionData' : function () {
		var connection = document.forms["connection"];
		var data = {
			'host' : connection['host'].value,
			'port' : connection['port'].value,
			'password' : connection['password'].value,
		};
		return data;
	},

	'validateConnectionData' : function (data) {
		if (!data['host']) {
			return [false, "Invalid host"];
		};

		if (!Number(data['port'])) {
			return [false, "Invalid Port"];
		};

		return [true, 'OK'];
	},

	'submitCommand' : function () {
		var command = this.commandLine.value;
		this.history.push(command);
		this.commandLine.value = "";
		this.historyIndex = 0;

		if (command in this.specialCommands) {
			var handler = this.specialCommands[command];
			handler(command);
		} else {
			this.doRCON(command);
		};

	},

	'navigateHistory' : function (direction) {
		var nextIndex = this.historyIndex + direction;
		if (0 < nextIndex && nextIndex <= this.history.length) {
			var item = this.history[this.history.length - nextIndex];
			this.commandLine.value = item;
			this.historyIndex = nextIndex;
		} else if (nextIndex == 0) {
			this.commandLine.value = "";
			this.historyIndex = nextIndex;
		};
	},

	'clearHistory' : function () {
		this.history = [];
		this.historyIndex = 0;
	},

	'clearOutput' : function () {
		var child = this.output.lastChild
		while (child) {
			this.output.removeChild(child)
			child = this.output.lastChild
		}
	},

	'makeElement' : function (cls, text) {
		var element = document.createElement('span');
		if (cls) {	
			element.classList.add(cls);
		};
		var textElement = document.createTextNode(text);
		element.appendChild(textElement); 

		return element;
	},

	'scrollDown' : function () {
		this.output.scrollTop = this.output.scrollHeight;
	},

	'showElement' : function (node) {
		this.output.appendChild(node)
	},

	'doClear' : function (command) {
		this.clearHistory();
		this.clearOutput();
	},

	'doHelp' : function (command) {
		var commandElement = this.makeElement('command', command);
		this.showElement(commandElement);
		var responseElement = this.makeElement('response', this.helpMsg);
		this.showElement(responseElement);

		this.scrollDown();
	},

	'doRCON' : function (command) {
		var commandElement = this.makeElement('command', command);
		this.showElement(commandElement);

		this.scrollDown();

		var responseElement = this.makeElement('', '');
		this.showElement(responseElement);

		var data = this.getConnectionData();
		data.command = command;
		var [validated, msg] = this.validateConnectionData(data);

		if (!validated) {
			responseElement.classList.add('error');
			var responseText = document.createTextNode('Error: ' + msg);
			responseElement.appendChild(responseText);
			this.scrollDown();
		} else {
			var me = this;
			$.ajax({
				'type' : 'POST',
				'url': $SEND_URL,
				'data' : data,
				'success' : function(response, status, xhr) {
					if (response != "") {
						var responseText = document.createTextNode(response);
						responseElement.classList.add('response');
						responseElement.appendChild(responseText);
					}
				},
				'error': function(xhr, status, errorThrown) {
					var responseText = document.createTextNode('Error: ' + xhr.responseText);
					responseElement.classList.add('error');
					responseElement.appendChild(responseText);
				},
				'complete': function(xhr, status) {
					me.scrollDown();
				},
			});	
		}
	},

}

Console.init();

});
