#!usr/bin/env python

# CGI env
import cgi, cgitb
cgitb.enable()

# RCON protocol
import socket, struct

# ID
DEFAULT_ID = 1
AUTH_ID = 2 # Not really necessary

# Types
SERVERDATA_AUTH = 3
SERVERDATA_AUTH_RESPONSE = 2
SERVERDATA_EXECCOMMAND = 2
SERVERDATA_RESPONSE_VALUE = 0

# Packets
def make_rcon_packet(body = '', ID = DEFAULT_ID, Type = SERVERDATA_EXECCOMMAND):
	body = body.encode('ascii') + b'\x00'
	size = len(body) + 9
	return struct.pack('<iii', size, ID, Type) + body + b'\x00'

def read_rcon_packet(packet):
	size, = struct.unpack('<i', packet[:4])
	ID, = struct.unpack('<i', packet[4:8])
	Type, = struct.unpack('<i', packet[8:12])
	body = packet[12:-2]
	return body, ID, Type

def authenticate(sock, password):
	auth = make_rcon_packet(password, ID = AUTH_ID, Type = SERVERDATA_AUTH)

	sock.sendall(auth)
	resp = sock.recv(1024)
	body, ID, Type = read_rcon_packet(resp)
	return ID == AUTH_ID

# Header
print("Content-Type: text/html")
print()

# Form data
try:
	form = cgi.FieldStorage()
	host = form['host'].value
	port = int(form['port'].value)
	password = form['password'].value
	body = form['command'].value
except KeyError as e:
	key = e.args[0]
	print("Oops! You need to provide a {}!".format(key))
	exit(0)

# Response
with socket.socket() as console:
	console.connect( (host, port) )
	authenticated = authenticate(console, password)

	if not authenticated:
		print('Password rejected by server')
		exit(0)

	command = make_rcon_packet(body)
	console.send(command)
	resp = console.recv(1024)
	body, ID, Type = read_rcon_packet(resp)
	response = body.decode('ascii')

	print(response)