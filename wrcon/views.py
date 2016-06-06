#! usr/bin/env python

from wrcon import app
from flask import request, render_template

@app.route('/', methods = ['GET'])
def wrcon():
	return render_template('wrcon.html')

from wrcon.RCON import send_one_command
@app.route('/send', methods = ['POST'])
def send():
	# Get form data
	form = request.form
	host = form['host']
	port = int(form['port'])
	password = form['password']
	body = form['command']

	# Authenticate and send command to console
	success, response = send_one_command(host, port, password, body)

	# Respond
	return response, 200 if success else 500, []
