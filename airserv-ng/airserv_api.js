var util           = require('../util.js');
var captured_frame = require('../captured_frame.js');
var CapturedFrame  = require('../captured_frame.js').CapturedFrame;
var through        = require('through');

var RESPONSE_HEADER_LENGTH = 5;
var RX_INFO_LENGTH         = captured_frame.RADIO_TAP_LENGTH;
var TX_INFO_BUFFER         = new Buffer(
  [0x00, 0x00, 0x00, 0x00]
);

var responses = {
  RC     : 1,
  PACKET : 5,
  MAC    : 7
}

var commands = {
  GET_CHAN    : { tx : 02, rx : responses.RC  },
  SET_CHAN    : { tx : 03, rx : responses.RC  },
  WRITE       : { tx : 04, rx : responses.RC  },
  GET_MAC     : { tx : 06, rx : responses.MAC },
  GET_MONITOR : { tx : 08, rx : responses.RC  },
  GET_RATE    : { tx : 09, rx : responses.RC  },
  SET_RATE    : { tx : 10, rx : responses.RC  }
};

function getResponseDataLength(response) {
  return util.getUInt32FromBuffer(response.slice(1, RESPONSE_HEADER_LENGTH));
}

function streamResponsesFromBuffer(stream, buffer) {
  if (buffer.length < RESPONSE_HEADER_LENGTH)
    throw new Error('response length less than RESPONSE_HEADER_LENGTH');

  var expectedLength = RESPONSE_HEADER_LENGTH + getResponseDataLength(buffer);
  if (buffer.length < expectedLength)
    throw new Error('response length less than expected');

  var response = buffer.slice(0, expectedLength);
  stream.emit('data', response);

  if (buffer.length > expectedLength)
    streamResponsesFromBuffer(stream, buffer.slice(expectedLength, buffer.length));
}

function splitResponses(errorCallback) {
  return through(
    function write(responses) {
      try {
        streamResponsesFromBuffer(this, responses);
      } catch (err) {
        errorCallback(err);
      }
    }
  );
}

function Command(command, arguments) {
  this.command   = command;
  this.arguments = (arguments === undefined) ? new Buffer(0) : arguments;

  if (command === commands.WRITE)
    this.arguments = Buffer.concat([TX_INFO_BUFFER, arguments]);
};

Command.prototype.getAsBuffer = function() {
  var header = Buffer.concat(
    [new Buffer([this.command.tx]), util.getBufferedUInt32(this.arguments.length)]
  );

  return Buffer.concat([header, this.arguments]);
};

Command.prototype.isResponseValid = function(response) {
  if (response.length < 1 || response[0] != this.command.rx)
    return false;

  if (this.command.rx === responses.RC) {
    switch (this.command) {
      case commands.SET_CHAN:
      case commands.SET_RATE:
        return response.length === 9 && response[4] === 0x04 && response[8] === 0x00;

      case commands.WRITE:
        if (response.length != 9 || response[4] != 0x04)
          return false;

        return util.getUInt32FromBuffer(response.slice(RESPONSE_HEADER_LENGTH)) === (this.arguments.length - TX_INFO_BUFFER.length);

      default:
        return response.length === 9 && response[4] === 0x04;
    }
  }

  else if (this.command.rx === responses.MAC)
    return (response.length - RESPONSE_HEADER_LENGTH) === getResponseDataLength(response);

  return false;
};

Command.prototype.getFormattedResponse = function(response) {
  switch (this.command) {
    case commands.GET_CHAN:
      return util.getUInt32FromBuffer(response.slice(RESPONSE_HEADER_LENGTH)).toString();

    case commands.GET_MAC:
      return util.getFormattedMacAddress(response.slice(RESPONSE_HEADER_LENGTH));

    case commands.GET_MONITOR:
      return new Buffer("i don't yet understand this, sorry");

    case commands.GET_RATE:
      return util.getUInt32FromBuffer(response.slice(RESPONSE_HEADER_LENGTH)).toString();

    case commands.SET_CHAN:
    case commands.WRITE:
    case commands.SET_RATE:
    default:
      return null;
  }
};

function getCapturedFrameFromResponse(response) {
  var hackFix = Buffer.concat([
     response.slice(RESPONSE_HEADER_LENGTH),
     new Buffer([0x00, 0x00, 0x00, 0x00]) // TODO: airserv-ng does not give us FCS, should calc real fcs
  ]);

  // airserv-ng has kinda swapped 80211 type and subtype fields
  hackFix[RX_INFO_LENGTH] = (hackFix[RX_INFO_LENGTH] >> 4) || (hackFix[RX_INFO_LENGTH] << 2);

  return new CapturedFrame(hackFix);
}


exports.responses                    = responses;
exports.commands                     = commands;
exports.splitResponses               = splitResponses;
exports.Command                      = Command;
exports.getCapturedFrameFromResponse = getCapturedFrameFromResponse;