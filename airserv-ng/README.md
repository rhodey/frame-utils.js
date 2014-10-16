airserv-ng.js
===============

A library for interacting with the airserv-ng TCP API, POC to showcase all functionality, and
utilty for streaming newline separated, base64 encoded 80211 frames with radiotap headers from
airserv-ng.

Dependencies
---------------------------
`# apt-get install aircrack-ng iw nodejs nodejs-legacy npm`  
`$ npm install through`

Setup
---------------------------
Start airmon-ng on the target device:  
`# airmon-ng start wlan1`

Allow airserv-ng to manage this device:  
`# airserv-ng -d wlan1 -v 3`

Figure out which channels your device supports (optional):  
`$ iwlist wlan1 freq`

Usage airserv-client-poc.js
---------------------------
`node airserv-client-poc.js <ip-address>:<port> <command> <arguments>`
  + \<ip-address\> ip of the airserv-ng server (likely 127.0.0.1)
  + \<port\> port of the airserv-ng server (666 by default)

commands:
  + listen \<channels\> \<interval\>
  + get_chan
  + set_chan \<channel\>
  + write \<data\>
  + get_mac
  + get_monitor
  + get_rate
  + set_rate \<rate\>

`listen` arguments breakdown:
  + \<channels\> a comma-separated list, range, or device name to pull channels from
  + \<interval\> number of milliseconds to wait before jumping to the next channel

Usage read-frames.js
---------------------------
Provides a newline separated stream of base64 encoded 80211 frames with radiotap headers.  
`node read-frames.js <ip-address>:<port> <channels> <interval>`
  + \<ip-address\> ip of the airserv-ng server (likely 127.0.0.1)
  + \<port\> port of the airserv-ng server (666 by default)
  + \<channels\> a comma-separated list, range, or device name to pull channels from
  + \<interval\> number of milliseconds to wait before jumping to the next channel

License
---------------------------

Copyright 2014 rhodey orbits  

Licensed under GPLv3: http://www.gnu.org/licenses/gpl-3.0.html