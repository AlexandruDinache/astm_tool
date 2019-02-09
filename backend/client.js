module.exports = {

    timeout: 30,                                            // agregar timeout
    clientSocket: '',
    messageLine: 0,
    messageLineCount: 0,
    frameNumber: 0,
    nackCount: 0,
    outMessage: '',
    inMessage: '',
    state: 'off',
    emitter: '',

    send: function(message, callback) {
      if(this.state=='idle') {
        // setup globals
        this.outMessage = message;
        this.messageLine = -1;
        this.messageLineCount = this.outMessage.length;
        this.frameNumber = 0;
        this.state = 'sending';
        // setup sending callback
        if(callback) this.emitter.on('sending', callback);
        // send <ENQ> to initiate connection
        const buf = Buffer.from([5]);
        this.clientSocket.write(buf);
        // true if available
        return true;
      }else{
        return false;
      }
    },

    connect: function(net, ip, port, connectedCallback, receiveCallback) {

      // create send and receive emmitter
      const EventEmitter = require('events');
      class MyEmitter extends EventEmitter {};
      this.emitter = new MyEmitter();

      // setup receiving callback
      if(receiveCallback) this.emitter.on('receiving', receiveCallback);

      this.clientSocket = net.createConnection(port, ip, () => {
        console.log('connected');
        this.state = 'idle';
        if(connectedCallback) connectedCallback();
      });

      // calculate checksum C1 & C2 characters
      calculateC1C2 = (inputFrame) => {
        var sum;
        var calculatedChecksum;
        var frame = inputFrame.toString('utf8');
        for(var i=0;i<frame.length;i++) {
          // if <STX> reset counter
          if(frame[i].charCodeAt(0) == 2) {
            sum = 0;
          }else{
            sum += frame.charCodeAt(i);
          }
          // if <ETX> or <ETB> end loop
          if(frame[i].charCodeAt(0) == 3 || frame[i].charCodeAt(0) == 23) break;
        }
        sum = sum % 256;
        return sum.toString(16).toUpperCase();
      };

      // verify checksum C1 & C2 characters
      checksum: (inputFrame) => {
    		// checksum = ( FN + text + <ETB>/<ETX> ) % 256
    		var sum;
    		var lastPosition;
    		var originalChecksum;
    		var calculatedChecksum;
    		var frame = inputFrame.toString('utf8');
    		for(var i=0;i<frame.length;i++) {
    			// if <STX> reset counter
    			if(frame[i].charCodeAt(0) == 2) {
    				sum = 0;
    			}else{
    				sum += frame.charCodeAt(i);
    			}
    			// if <ETX> or <ETB> end loop
    			if(frame[i].charCodeAt(0) == 3 || frame[i].charCodeAt(0) == 23) {
    				lastPosition = i;
    				break;
    			}
    		}
    		sum = sum % 256;
    		originalChecksum = parseInt(frame.charAt(lastPosition+1) + frame.charAt(lastPosition+2), 16);
    		calculatedChecksum = parseInt(sum.toString(16).toUpperCase(), 16);
    		if(originalChecksum == calculatedChecksum) {
    			return true;
    		}else{
    			console.log('Invalid checksum! (original: ' + originalChecksum + ' & calculated: ' + calculatedChecksum + ')');
    			return false;
    		}
    	},

      // create a frame form outMessage
      createFrame = () => {
        // send parsed message
        var outMessage = '';
        outMessage += String.fromCharCode(2);                    // <STX>
        outMessage += String.fromCharCode(48+this.frameNumber);  // frame frameNumber
        outMessage += this.outMessage[this.messageLine];            // text
        if(this.messageLine==this.messageLineCount) {
          outMessage += String.fromCharCode(3);                  // <ETX>
        }else{
          outMessage += String.fromCharCode(23);                 // <ETB>
        }
        outMessage += calculateC1C2(outMessage);                 // C1 & C2
        outMessage += String.fromCharCode(13);                   // <CR>
        outMessage += String.fromCharCode(10);                   // <LF>
        return outMessage;
      };

      // prettify message for console log
      prettifyMessage = (data) => {
    		var decoded = new String;
    		for(var i=0;i<data.length;i++) {
    			switch(data[i].charCodeAt(0)) {
    				case 2:
    					decoded += '<STX>';
    					break;
    				case 3:
    					decoded += '<ETX>';
    					break;
    				case 4:
    					decoded += '<EOT>';
    					break;
    				case 5:
    					decoded += '<ENQ>';
    					break;
    				case 10:
    					decoded += '<LF>\n';
    					break;
    				case 13:
    					decoded += '<CR>';
    					break;
    				case 21:
    					decoded += '<NAK>';
    					break;
    				case 23:
    					decoded += '<ETB>';
    					break;
    				default:
    					if(data[i].charCodeAt(0)>31) {
    						decoded += data[i];
    					}else{
    						decoded += '<UNKN:' + data[i].charCodeAt(0) + '>';
    					}
    			}
    		}
    		if(decoded[decoded.length-1]=='\n') {
    			return decoded.substring(0, decoded.length-1);
    		}else{
    			return decoded;
    		}
    	};

      this.clientSocket.on('data', (data) => {
        if(data) {
          switch(this.state) {

            case 'idle':
              // if receive <ENQ>, change to receiving state
    					if(data[0] == 5) {
    						console.log('<ENQ>');
    						this.state = 'receiving';
    						this.inMessage = '';
    						socket.write(Buffer.from([6]));                 // <ACK>
    					}else{
    						socket.write(Buffer.from([21]));    						  // <NACK>
    					}
              break;

            case 'receiving':
    					// if <STX> send <ACK> / <NAK> and add line to message
    					if(data[0] == 2) {
    						console.log('<STX>...');
    						if(checksum(data)) {
    							socket.write(Buffer.from([6]));               // <ACK>
    							this.inMessage += data;
    						}else{
    							socket.write(Buffer.from([21]));              // <NACK>
    						}
    					}
    					// if <EOT> process message
    					if(data[0] == 4) {
    						console.log('<EOT>');
    						this.state = 'idle';
    						// print message
    						if(this.inMessage) {
                  var prettyMessage = prettifyMessage(this.inMessage);
    							console.log('Received message: '+prettyMessage);
                  this.emitter.emit('receiving', prettyMessage);
    						}else{
    							// receive empty message
    							console.log('Received empty message. Maybe the instrument is running connection tests.');
    						}
    					}
    					// if not <STX> or <EOT> stop waiting for frames
    					if(data[0] != 2 && data[0] != 4) {
    						console.log('not <STX> or <EOT>');
    						this.state = 'idle';
    						socket.write(Buffer.from([21]));              // <NACK>
    					}
    				break;

            case 'sending':
              // if receive <ACK>, send new line
              if(data[0] == 6) {
                this.nackCount=0;
                this.messageLine++;
                this.frameNumber++;
                if(this.frameNumber==8) this.frameNumber=0;
                if((this.messageLine+1)>this.messageLineCount) {
                  // send <EOT>
                  const buf = Buffer.from([4]);
                  this.clientSocket.write(buf);
                  // end busy state
                  this.state = 'idle';
                  this.emitter.emit('sending', false);
                }else{
                  // send message frame
                  this.clientSocket.write(createFrame());
                }
              }
              // if receive <NACK>, resend line
              if(data[0] == 21) {
                if(this.nackCount>5) {
                  // end busy state after five <NACK>s
                  this.state = 'idle';
                  this.emitter.emit('sending', true);
                }else {
                  // re-send message frame
                  this.clientSocket.write(createFrame());
                  this.nackCount++;
                }
              }
              break;

          }
        }
      });

      this.clientSocket.on('end', function() {
        console.log('Closed');
        if(this.state=='sending') this.emitter.emit('sending', true);
        if(this.state=='receiving') this.emitter.emit('receiving', true);
        this.state = 'idle';
      });

      this.clientSocket.on('error', function(message) {
        this.state = 'idle';
        if(this.state=='sending') this.emitter.emit('sending', true);
        if(this.state=='receiving') this.emitter.emit('receiving', true);
        if(err.errno == 'ECONNRESET') {
    			console.log('Connection disconnected by peer.');
    		}
      });

    }

}
