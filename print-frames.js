var split         = require('split');
var through       = require('through');
var util          = require('./util.js');
var CapturedFrame = require('./captured_frame.js').CapturedFrame;

function printFrames() {
  return through(
    function write(line) {
      if (line.length === 0)
        return this.end();

      var extrasBuffer = new Buffer(0);
      var frameBuffer  = undefined;

      if (util.getIndexOfNotEscaped(line.toString(), ',') >= 0) {
        var frameStartIndex = util.getLastIndexOfNotEscaped(line.toString(), ',') + 1;
            extrasBuffer    = new Buffer(line.toString().substring(0, frameStartIndex));
            frameBuffer     = new Buffer(line.toString().substring(frameStartIndex), 'base64');
      }
      else
        frameBuffer = new Buffer(line, 'base64');

      try {

        this.emit('data', Buffer.concat([extrasBuffer, new Buffer(new CapturedFrame(frameBuffer).toString())]) + '\n');

      } catch (err) {
        process.stderr.write('caught error in stream: ' + err.stack + '\n');
      }
    }
  );
}

process.stdin.pipe(split())
             .pipe(printFrames())
             .pipe(process.stdout);