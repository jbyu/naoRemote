
_GOODBYE_MESSAGE = u'Goodbye'

from naoqi import ALProxy
import math
import base64
import string
import Image
import StringIO
import logging

from time import localtime, strftime

robotIP = "nao.local"
robotIP = "127.0.0.1"
motion = ALProxy("ALMotion", robotIP, 9559)
motion.killAll()
#print motion.getSummary()

behavior = ALProxy("ALBehaviorManager", robotIP, 9559)
vision = "websocketCam"
camera = ALProxy("ALVideoDevice", robotIP, 9559)
camera.unsubscribeAllInstances(vision)
nameId = camera.subscribe(vision, 1, 11, 5)
# #camera.unsubscribe(nameId)

tts = ALProxy("ALTextToSpeech", robotIP, 9559)
tts.say('ready')
print 'ready'

def web_socket_do_extra_handshake(request):
	# This example handler accepts any request. See origin_check_wsh.py for how
	# to reject access from untrusted scripts based on origin value.
	print 'connected'
	pass  # Always accept.

def web_socket_passive_closing_handshake(request):
	print 'closed socket'
	motion.stopWalk()
	return request.ws_close_code, request.ws_close_reason

def web_socket_transfer_data(request):
	while True:
		line = request.ws_stream.receive_message()
		if line is None:
			web_socket_passive_closing_handshake(request)
			return
		if isinstance(line, unicode):
			#txt = strftime("%H:%M:%S,",localtime())+line
			#print txt
			#logging.debug(txt)
			if line == _GOODBYE_MESSAGE:
				web_socket_passive_closing_handshake(request)
				return
				
			token = line.encode('utf-8')
			list = string.split(token,':')
			if 'fi' == list[0]:
				naoImage = camera.getImageRemote(nameId)
				camera.releaseImage(nameId)
				width = naoImage[0]
				height= naoImage[1]
				array = naoImage[6]
				#print width,height
				output = StringIO.StringIO()
				im = Image.fromstring("RGB", (width, height), array)
				im.save(output,'JPEG')
				data = output.getvalue()
				request.ws_stream.send_message('pi:'+base64.b64encode(data), binary=False)
				output.close()
			elif 'dw' == list[0]:
				print 'stop walk'
				motion.stopWalk()
			elif 'ew' == list[0]:
				vec = string.split(list[1],',')
				x = float(vec[0])
				y = (float(vec[1])+0.5)*2
				if y > 1:
					y = 1
				elif y < -1:
					y = -1
				v = abs(y)
				motion.setWalkTargetVelocity(y, 0, x*-0.5, v)
			elif 'eh' == list[0]:
				vec = string.split(list[1],',')
				#HeadYaw 		-119.5 to 119.5 	-2.0857 to 2.0857
				#HeadPitch 		-38.5 to 29.5 		-0.6720 to 0.5149
				x = float(vec[0])*2
				y = float(vec[1])+0.5 #[-0.5~0.5]
				if x > 2:
					x = 2
				elif x < -2:
					x = -2
				if y > 0.5:
					y = 0.5
				elif y < -0.67:
					y = -0.67
				names = ["HeadYaw", "HeadPitch"]
				angles = [-x, y]
				motion.setAngles(names, angles, 0.25);
			elif 'S' == list[0]:
				tts.say(list[1])
			else:
				motion.walkInit()
				print token
				
			if 'F' == token:
				motion.post.walkTo(0.5, 0, 0)
			elif 'B' == token:
				motion.post.walkTo(-0.5, 0, 0)
			elif 'L' == token:
				motion.post.walkTo(0.3, 0, math.pi/2)
			elif 'R' == token:
				motion.post.walkTo(0.3, 0,-math.pi/2)
			elif (behavior.isBehaviorInstalled(token)):
					if (behavior.isBehaviorRunning(token)):
						behavior.stopBehavior(token)
					else:
						behavior.post.runBehavior(token)
			request.ws_stream.send_message(line, binary=False)
			


