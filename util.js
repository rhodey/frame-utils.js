var exec = require('child_process').exec;

function getBufferedUInt32(unsignedInt) {
  var uInt32 = new Buffer(4);

  uInt32[0] = (unsignedInt & 0xFF000000) >> 24;
  uInt32[1] = (unsignedInt & 0x00FF0000) >> 16;
  uInt32[2] = (unsignedInt & 0x0000FF00) >>  8;
  uInt32[3] = (unsignedInt & 0x000000FF) >>  0;

  return uInt32;
}

function getUInt32FromBuffer(bufferedUInt32) {
  var uInt = 0x00000000;

  uInt = uInt | (bufferedUInt32[0] << 24);
  uInt = uInt | (bufferedUInt32[1] << 16);
  uInt = uInt | (bufferedUInt32[2] <<  8);
  uInt = uInt | (bufferedUInt32[3] <<  0);

  return uInt;
}

function getUInt64FromBuffer(bufferedUInt64) {
  var uInt  = 0x0000000000000000;
  var shift = 56;

  for (var i = 0; i < 8; i++) {
    uInt  = uInt | ((0x0000000000000000 | bufferedUInt64[i]) << shift);
    shift = shift - 8;
  }

  return uInt;
}

function getIntFromTwosByte(signedTwosByte) {
  if ((signedTwosByte & 0x80) === 0x80)
    return ((~signedTwosByte & 0x7F) + 1) * -1;

  return signedTwosByte;
}

function getFormattedMacAddress(mac) {
  mac              = mac.toString('hex');
  var length       = mac.length + (mac.length / 2) - 1;
  var formattedMac = new Buffer(length);
  var offset       = 0;

  for (i = 0; i < mac.length; i++) {
    if (i > 0 && i % 2 === 0) {
      formattedMac.write(':', i + offset);
      offset++;
    }

    formattedMac.write(mac[i], i + offset);
  }

  return formattedMac;
}

function getUnique(a) {
  return a.sort().filter(function(item, pos) {
    return !pos || item != a[pos - 1];
  })
}

function getIndexOfNotEscaped(string, searchValue, start) {
      start   = (start === undefined) ? 0 : start;
  var indexOf = string.indexOf(searchValue, start);

  while (indexOf >= 0) {
    if (indexOf > 0 && (string[indexOf - 1] === '\\'))
      indexOf = string.indexOf(searchValue, indexOf + 1);
    else
      return indexOf;
  }

  return indexOf;
}

function getLastIndexOfNotEscaped(string, searchValue, start) {
  var indexOf     = getIndexOfNotEscaped(string, searchValue, start);
  var lastIndexOf = indexOf;

  while (indexOf >= 0) {
    lastIndexOf = indexOf;
    indexOf     = getIndexOfNotEscaped(string, searchValue, lastIndexOf + 1);
  }

  return lastIndexOf;
}

function getChannelSpaceForListOrRange(channelsArg, cb) {
  var channels = new Array();

  if (channelsArg.indexOf(',') > -1) {
    for(index in channelsArg.split(','))
      channels.push(parseInt(channelsArg.split(',')[index]));
  }
  else if (channelsArg.indexOf('-') > -1 && channelsArg.split('-').length === 2) {
    var start = parseInt(channelsArg.split('-')[0]);
    var end   = parseInt(channelsArg.split('-')[1]);
    for (i = start; i <= end; i++)
      channels.push(i);
  }
  else
    channels.push(parseInt(channelsArg));

  cb(channels);
}

function getChannelSpaceForDevice(device, cb) {
  exec(('iwlist ' + device + ' freq'), function (error, stdout, stderr) {
    var lines    = stdout.split('\n');
    var channels = '';
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(' Channel ') > -1) {
        var half = lines[i].split(' : ')[0];
        channels += half.split('Channel ')[1] + ',';
      }
    }

    getChannelSpaceForArg(channels.substring(0, (channels.length - 1)), cb);
  });
}

function getChannelSpaceForArg(arg, cb) {
  if (!isNaN(arg) || arg.indexOf('-') > -1 || arg.indexOf(',') > -1)
    getChannelSpaceForListOrRange(arg, cb);
  else
    getChannelSpaceForDevice(arg, cb);
}


exports.getBufferedUInt32        = getBufferedUInt32;
exports.getUInt32FromBuffer      = getUInt32FromBuffer;
exports.getUInt64FromBuffer      = getUInt64FromBuffer;
exports.getIntFromTwosByte       = getIntFromTwosByte;
exports.getFormattedMacAddress   = getFormattedMacAddress;
exports.getUnique                = getUnique;
exports.getIndexOfNotEscaped     = getIndexOfNotEscaped;
exports.getLastIndexOfNotEscaped = getLastIndexOfNotEscaped;
exports.getChannelSpaceForArg    = getChannelSpaceForArg;