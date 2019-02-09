module.exports = {

    timeout: 30,
    clientSocket: '',
    messageLine: 0,
    messageLineCount: 0,
    frameNumber: 0,
    nackCount: 0,
    message: '',
    isBusy: false,
    emitter: '',

    send: function(message, callback) {
      if(!this.isBusy) {
        // setup globals
        this.message = message;
        this.messageLine = -1;
        this.messageLineCount = this.message.length;
        this.frameNumber = 0;
        this.isBusy = true;
        // setup callback
        if(callback) this.emitter.on('event', callback);
        // send <ENQ> to initiate connection
        const buf = Buffer.from([5]);
        this.clientSocket.write(buf);
        // true if available
        return true;
      }else{
        return false;
      }
    },

    connect: function(net, ip, port, callback) {

      const EventEmitter = require('events');
      class MyEmitter extends EventEmitter {};
      this.emitter = new MyEmitter();

      this.clientSocket = net.createConnection(port, ip, () => {
        console.log('connected');
        if(callback) callback();
      });

      this.clientSocket.on('data', (data) => {
        if(data) {

          checksum = (inputFrame) => {
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
          },

          createFrame = () => {
            // send parsed message
            var outMessage = '';
            outMessage += String.fromCharCode(2);                    // <STX>
            outMessage += String.fromCharCode(48+this.frameNumber);  // frame frameNumber
            outMessage += this.message[this.messageLine];            // text
            if(this.messageLine==this.messageLineCount) {
              outMessage += String.fromCharCode(3);                  // <ETX>
            }else{
              outMessage += String.fromCharCode(23);                 // <ETB>
            }
            outMessage += checksum(outMessage);                      // C1 & C2
            outMessage += String.fromCharCode(13);                   // <CR>
            outMessage += String.fromCharCode(10);                   // <LF>
            return outMessage;
          }

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
              this.isBusy = false;
              this.emitter.emit('event', false);
            }else{
              // send message frame
              this.clientSocket.write(createFrame());
            }

          }

          // if receive <NACK>, resend line
          if(data[0] == 21) {
            if(this.nackCount>5) {
              // end busy state after five <NACK>s
              this.isBusy = false;
              this.emitter.emit('event', true);
            }else {
              // re-send message frame
              this.clientSocket.write(createFrame());
              this.nackCount++;
            }
          }

        }
      });

      this.clientSocket.on('end', function() {
        console.log('Closed');
        // end busy if connection closed
        this.isBusy = false;
        this.emitter.emit('event', true);
      });

      this.clientSocket.on('error', function(message) {
        console.log(message);
        this.isBusy = false;
        this.emitter.emit('event', true);
      });

    }

}
