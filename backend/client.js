module.exports = {

    timeout: 30,
    clientSocket: '',
    messageLine: -1,
    messageLineCount: 0,
    nackCount: 0,

    connect: function(net, ip, port, message) {

      this.messageLineCount = message.length;

      this.clientSocket = net.createConnection(port, ip, () => {

        console.log('connected');

        // send <ENQ> to initiate connection
        const buf = Buffer.from([5]);
				this.clientSocket.write(buf);

      });

      this.clientSocket.on('data', (data) => {
        if(data) {
          console.log(data);

          // if receive <ACK>, send new line
          if(data[0] == 6) {
            this.messageLine++;
            if(this.messageLine>this.messageLineCount) {
              // send <EOT> and end transmission
              const buf = Buffer.from([5]);
              this.clientSocket.write(buf);
              setInterval(() => {
                console.log('end transmission');
                this.clientSocket.destroy();
              }, 1000);
            }else{
              // send parsed message
              const buf = Buffer.from([2]);
              this.clientSocket.write(buf);
            }
          }

          // if receive <NACK>, resend line
          if(data[0] == 21) {
            if(this.nackCount>5) {
              // end connection
              this.clientSocket.destroy();
            }else {
              const buf = Buffer.from([2]);
              this.clientSocket.write(buf);
              this.nackCount++;
            }
          }

        }
      });

      this.clientSocket.on('end', function() {
        console.log('Closed');
      });

      this.clientSocket.on('error', function(message) {
        console.log(message);
      });

    }

}
