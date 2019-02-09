var express = require('express');
var cors = require('cors');
var net = require('net');

var rest = require('./rest');
var client = require('./client');

rest.listen(express, cors, 8000);

client.connect(net, '127.0.0.1',  6000, [
  'H|\^&|||Alinity ci-series^2.5^SCM02096|||||||P|LIS2-A2|20190103162106-0300',
  'P|1',
  'O|1|12311/1000|12311/1000^M3480^4^1^17|^^^565^Syphilis^UNDILUTED|R||||||||||||||||||||F',
  'R|1|^^^565^Syphilis^UNDILUTED^F|0.04|S/CO||||F||Admin^Admin||20190103142834|Ai01814',
  'M|1|INV|565|CA||20190106124236|20181207124236|87225LI00',
  'M|2|INV|565-1|SR|03753|20190307||87225LI00',
  'R|2|^^^565^Syphilis^UNDILUTED^I|Nonreactive|||||F||Admin^Admin||20190103142834|Ai01814',
  'R|3|^^^565^Syphilis^UNDILUTED^P|534|RLU||||F||Admin^Admin||20190103142834|Ai01814',
  'R|4|^^^565^Syphilis^UNDILUTED^G|56fd5a98-38a1-4eb0-94b3-2819e2db9967|||||F||Admin^Admin||20190103142834|Ai01814',
  'L|1'
]);
