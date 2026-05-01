// TICKET-005
'use strict';

function generarPin(longitud = 6) {
  const min = Math.pow(10, longitud - 1);
  const max = Math.pow(10, longitud) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

module.exports = { generarPin };
