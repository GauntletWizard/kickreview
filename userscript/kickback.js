/**
 * @fileoverview Description of this file.
 */

root = "https://www.kickstarter.com/profile/transactions?page="
htmldtd = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
backinglist = document.getElementsByClassName("backings")[0].children[1]

function grabPage(pagenum) {
  var request = new XMLHttpRequest;
  request.open("GET", root + String(pagenum));
  request.send();
  var doc = document.implementation.createHTMLDocument("example");
  doc.documentElement.innerHTML = request.response;

  return doc
}
