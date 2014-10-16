frame-utils.js
================

A collection of utilities for processing streams of 80211 frames and radiotap headers.

Dependencies
---------------------------
`# apt-get install nodejs nodejs-legacy npm`  
`$ npm install split through`

Usage print-frames.js
---------------------------
Transforms a stream of newline separated, base64 encoded 80211 frames with radiotap headers into a
stream of comma-separated values. All non-separating commas are doubly escaped (`\\,`) and the
base64 encoded frames may optionally be prefixed by plain-text comma-separated values given that
they are also doubly escaped.  
  
Examples:  
  + `cat frames.base64 | node print-frames.js`  
  + `node airserv-ng/read-frames.js 127.0.0.1:666 wlan1 400 | node print-frames.js`

Usage filter-frames.js
---------------------------
TODO!! Filters a stream of newline separated, base64 encoded 80211 frames with radiotap headers
according to a filter rule.  
  
Examples:  
  + `cat frames.base64 | node filter-frames.js <filter rule> | node print-frames.js`  
  + `node airserv-ng/read-frames.js 127.0.0.1:666 wlan1 400 | node filter-frames.js <filter rule> | node print-frames.js`

License
---------------------------

Copyright 2014 rhodey orbits  

Licensed under GPLv3: http://www.gnu.org/licenses/gpl-3.0.html