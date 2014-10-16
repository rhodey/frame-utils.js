function handleShowUsage() {
  process.stderr.write('node airserv-frames.js <ip-address>:<port> <channels> <interval>\n');
}

if (process.argv.length < 5|| process.argv[2].split(':').length != 2) {
  handleShowUsage();
  process.exit(1);
}

var airserv_api = require('./airserv_api.js');
var util        = require('../util.js');
var through     = require('through');
var net         = require('net');
var Readable    = require('stream').Readable;

var airservClient            = new net.Socket();
var commandStream            = new Readable;
var commandsAwaitingResponse = new Array();
var channelIndex             = 0;
var jumpInterval             = undefined;
var channelJumpTimer         = undefined;

commandStream.commandsAwaitingSend = new Array();
commandStream._read = function () {
  var nextCommand = this.commandsAwaitingSend.shift();
  if (nextCommand === undefined)
    return;

  commandsAwaitingResponse.push(nextCommand);
  commandStream.push(nextCommand.getAsBuffer());
};
commandStream.queue = function (buffer) {
  this.commandsAwaitingSend.push(buffer);
  this._read();
};

function handleScanChannels(channelSpace) {
  jumpInterval = (jumpInterval === undefined) ? parseInt(process.argv[4]) : jumpInterval;

  var nextChannel  = channelSpace[channelIndex];
      channelIndex = ((channelIndex + 1) < channelSpace.length) ? channelIndex + 1 : 0;

  commandStream.queue(
    new airserv_api.Command(airserv_api.commands.SET_CHAN, util.getBufferedUInt32(nextChannel))
  );

  if (channelJumpTimer === undefined && channelSpace.length > 1)
    channelJumpTimer = setInterval(function () { handleScanChannels(channelSpace) }, jumpInterval);
};


function handleStreamErrror(err) {
  process.stderr.write('caught error in stream: ' + err.stack + '\n');
}

function handleCheckCommandResponse(response) {
  var lastCommandSent = commandsAwaitingResponse.shift();
  if (lastCommandSent === undefined)
    throw new Error('received response before sending a command >> ' + response.toString('hex'));
  else if (!lastCommandSent.isResponseValid(response)) {
    throw new Error('received invalid response >> ' + response.toString('hex') + '\n' +
                    'for command               >> ' + lastCommandSent.getAsBuffer().toString('hex'));
  }
};

function decodeFrames() {
  return through(
    function write(response) {
      if (response[0] === airserv_api.responses.PACKET) {
        this.emit(
          'data',
          airserv_api.getCapturedFrameFromResponse(response).data.toString('base64') + '\n'
        );
      }
      else
        handleCheckCommandResponse(response);
    }
  );
}

airservClient.connect(process.argv[2].split(':')[1], process.argv[2].split(':')[0], function() {
  util.getChannelSpaceForArg(process.argv[3], handleScanChannels);

  commandStream.pipe(airservClient)
    .pipe(airserv_api.splitResponses(handleStreamErrror))
    .pipe(decodeFrames())
    .pipe(process.stdout);

});

airservClient.on('end', function() {
  process.stderr.write('airserv-ng client disconnected\n');
  process.exit(0);
});