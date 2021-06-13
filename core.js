function generateHexString(length) {
  length = arguments.length == 0 ? 26 : length;
  var ret = '';
  while (ret.length < length) {
    ret += Math.random().toString(16).substring(2);
  }
  return ret.substring(0, length);
}

function getRandomInt(max, includeZero) {
  if (arguments.length < 2) includeZero = false;

  if (includeZero) {
    return Math.floor(Math.random() * max);
  } else {
    var min = 1;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
