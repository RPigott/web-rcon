from wrcon import app

import sys

port = int(sys.argv[1])

if __name__ == '__main__':
	app.run(debug = True, port = port)