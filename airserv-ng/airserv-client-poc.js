function handleShowUsage() {
  process.stderr.write('node airserv-client-poc.js <ip-address>:<port> <command> <arguments>');
  process.stderr.write('commands:\n'                      +
                       '  listen <channels> <interval>\n' +
                       '  get_chan\n'                     +
                       '  set_chan <channel>\n'           +
                       '  write <data>\n'                 +
                       '  get_mac\n'                      +
                       '  get_monitor\n'                  +
                       '  get_rate\n'                     +
                       '  set_rate <rate>\n');
}

if (process.argv.length < 4 || process.argv[2].split(':').length != 2) {
  handleShowUsage();
  process.exit(1);
}

var airserv_api = require('./airserv_api.js');
var util        = require('../util.js');
var net         = require('net');
var through     = require('through');
var Readable    = require('stream').Readable;

var airservClient            = new net.Socket();
var commandStream            = new Readable;
var commandsAwaitingResponse = new Array();
var listening                = false;
var jumpInterval             = 1000;
var channelIndex             = 0;
var channelJumpTimer         = null;

function handleScanChannels(channelSpace) {
  var nextChannel  = channelSpace[channelIndex];
      channelIndex = ((channelIndex + 1) < channelSpace.length) ? channelIndex + 1 : 0;

  commandStream.queue(
    new airserv_api.Command(airserv_api.commands.SET_CHAN, util.getBufferedUInt32(nextChannel))
  );

  if (channelJumpTimer === null && channelSpace.length > 1)
    channelJumpTimer = setInterval(function () { handleScanChannels(channelSpace) }, jumpInterval);
};

function handleShowUsageAndExit() {
  handleShowUsage();
  process.exit(1);
}

function handleCommandLineArguments() {
  switch (process.argv[3]) {
    case 'listen':
      if (process.argv.length < 6)
        handleShowUsageAndExit();

      listening    = true;
      jumpInterval = parseInt(process.argv[5]);
      util.getChannelSpaceForArg(process.argv[4], handleScanChannels);
      break;

    case 'get_chan':
      commandStream.queue(
        new airserv_api.Command(airserv_api.commands.GET_CHAN)
      );
      break;

    case 'set_chan':
      if (process.argv.length < 5)
        handleShowUsageAndExit();

      channel = util.getBufferedUInt32(parseInt(process.argv[4]));
      commandStream.queue(
        new airserv_api.Command(airserv_api.commands.SET_CHAN, channel)
      );
      break;

    case 'write':
      if (process.argv.length < 5)
        handleShowUsageAndExit();

      data = new Buffer(process.argv[4]);
      commandStream.queue(
        new airserv_api.Command(airserv_api.commands.WRITE, data)
      );
      break;

    case 'get_mac':
      commandStream.queue(
        new airserv_api.Command(airserv_api.commands.GET_MAC)
      );
      break;

    case 'get_monitor':
      commandStream.queue(
        new airserv_api.Command(airserv_api.commands.GET_MONITOR)
      );
      break;

    case 'get_rate':
      commandStream.queue(
        new airserv_api.Command(airserv_api.commands.GET_RATE)
      );
      break;

    case 'set_rate':
      if (process.argv.length < 5)
        handleShowUsageAndExit();

      rate = util.getBufferedUInt32(parseInt(process.argv[4]));
      commandStream.queue(
        new airserv_api.Command(airserv_api.commands.SET_RATE, rate)
      );
      break;

    default:
      handleShowUsage();
      process.exit();
  }
}

commandStream.commandsAwaitingSend = new Array();
commandStream._read = function () {
  var nextCommand = this.commandsAwaitingSend.shift();
  if (nextCommand === undefined) {
    if (!listening)
      commandStream.push(null);
    return;
  }

  commandsAwaitingResponse.push(nextCommand);
  commandStream.push(nextCommand.getAsBuffer());
};
commandStream.queue = function (buffer) {
  this.commandsAwaitingSend.push(buffer);
  this._read();
};

function formatCommandResponse(response) {
  var lastCommandSent = commandsAwaitingResponse.shift();
  if (lastCommandSent === undefined) {
    process.stderr.write('received response before sending a command >> ' + response.toString('hex') + '\n');
    process.exit(1);
  }
  else if (!lastCommandSent.isResponseValid(response)) {
    process.stderr.write('received invalid response >> ' + response.toString('hex') + '\n' +
                         'for command               >> ' + lastCommandSent.getAsBuffer().toString('hex') + '\n');
    process.exit(1);
  }
  else {
    var formattedResponse = lastCommandSent.getFormattedResponse(response);
    if (formattedResponse != null)
      return formattedResponse.toString() + '\n';
  }
};

function formatResponse() {
  return through(
    function write(response) {
      if (response[0] === airserv_api.responses.PACKET) {
        if (!listening)
          return;

        this.emit(
          'data',
          airserv_api.getCapturedFrameFromResponse(response).toString() + '\n'
        );
      }
      else {
        var formattedResponse = formatCommandResponse(response);
        if (formattedResponse != undefined)
          this.emit('data', formattedResponse);
      }

      if (!listening && commandsAwaitingResponse.length === 0)
        this.end();
    }
  );
}

function onStreamErrorCallback(err) {
  process.stderr.write('caught error in stream: ' + err.stack + '\n');
  process.exit(1);
}

airservClient.connect(process.argv[2].split(':')[1], process.argv[2].split(':')[0], function() {
  handleCommandLineArguments();

  commandStream.pipe(airservClient)
    .pipe(airserv_api.splitResponses(onStreamErrorCallback))
    .pipe(formatResponse())
    .pipe(through(
      function write(buff) { this.emit('data', buff) },
      function end()       { airservClient.destroy() }
    ))
    .pipe(process.stdout);
});