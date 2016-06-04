#!usr/bin/env python

# Python implementation of the Valve Source RCON Protocol
import socket, struct

# IDs
DEFAULT_ID = 1
AUTH_ID = 2 # Not really necessary

# Types
SERVERDATA_AUTH = 3
SERVERDATA_AUTH_RESPONSE = 2
SERVERDATA_EXECCOMMAND = 2
SERVERDATA_RESPONSE_VALUE = 0

# Packets
class AuthenticationError(Exception):
	pass

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

def send_one_command(host, port, password, body):
	try:
		console = socket.socket()
		console.connect( (host, port) )
		authenticated = authenticate(console, password)

		if not authenticated:
			raise AuthenticationError

		command = make_rcon_packet(body)
		console.send(command)
		resp = console.recv(4096)
		body, ID, Type = read_rcon_packet(resp)
		response = body.decode('ascii')

		return True, response
	except OSError as err:
		return False, err.strerror
	except AuthenticationError as err:
		return False, "Password rejected by server"
	except Exception as err:
		return False, repr(err)