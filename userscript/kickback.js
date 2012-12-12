/**
 * @fileoverview Tools for managing your Kickstarted projects. www.kickreview.net
 */

root = "https://www.kickstarter.com/profile/transactions?page="
// htmldtd = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'

function grabPage(pagenum) {
  var request = new XMLHttpRequest;
  request.open("GET", root + String(pagenum), false);
  console.debug("Requesting Page " + String(pagenum));
  request.send();
  var doc = document.implementation.createHTMLDocument("example");
  doc.documentElement.innerHTML = request.response;
  console.debug("Received Page " + String(pagenum));

  return doc
}

//This is super fragile, as parsing goes, but they don't have CSS classes.
function project(row) {
  this.projectName = row.children[0].innerText;
  this.projectLink = row.children[0].href;
  this.status = row.children[1].children[0].innerText;
  this.endDate = row.children[2].innerText;
  this.pledge = Number(row.children[3].children[0].innerText.substr(1).replace(/,/, ''));
  this.currency = row.children[3].children[0].innerText.substr(0,1)
  if (isNaN(this.pledge)) {
    console.debug("Not a valid pledge amount: " + row.children[3].children[0].innerText.substr(1));
    this.pledge = 0;
  }
  this.pledgeDate = row.children[3].children[2].innerText;
  this.pledgeStatus = row.children[4].innerText;
  this.reward = row.children[5].innerText;
}

function isLastPage(page) {
  return page.getElementsByClassName("no-content").length == 1;
}

function totals() {
  var p = 1;
  total = 0;
  outstanding = 0;
  paid = 0;
  
  var page = grabPage(p)
  while (!isLastPage(page)) {
    
    backinglist = page.getElementsByClassName("backings")[0].children[1].children;
    console.debug("Page " + String(p) +" has " + String(backinglist.length) + " projects.");
    for (i = 0; i < backinglist.length; i++) {
      pj = new project(backinglist[i]);
      console.debug(total)
      if (pj.status == "In Progress") {
        outstanding = outstanding + pj.pledge;
      }
      if (pj.status == "FUNDED!") {
        paid = paid + pj.pledge;
      }
      total = total + pj.pledge;
    }
    p = p + 1;
    page = grabPage(p);
  }
  return total;
}

function parseProjects() {
  // Are we ready to go?
  if (this.readyState == this.DONE && this.status == 200) {
    var doc = document.implementation.createHTMLDocument("example");
    doc.documentElement.innerHTML = this.response;
    if (!isLastPage(doc)) {
      var backinglist = doc.getElementsByClassName("backings")[0].children[1].children;
      //For every row, parse as project and append to projects.
      for (i = 0; i < backinglist.length; i++) {
        projects[projects.length] = new project(backinglist[i]);
      }
    } else {
      //Logic for grabbing pages past what we expected.
      if (this.pagenum == (numpages - 1)) {
        var request = new XMLHttpRequest;
        request.pagenum = pagenum;
        request.onreadystatechange = parseProjects;
	      request.open("GET", root + String(pagenum), true);
    	  console.debug("Requesting Page " + String(pagenum));
	      request.send();
      }
    }
  }
}
      



function grabAllPages() {
  // There's two extra children - One is used up by < numpages (rather than <=), the other is requested 
  // so we know that there's no more pages to come.
  numpages = document.getElementsByClassName("pagination")[0].children.length;
  projects = []
  for (pagenum = 1; pagenum < numpages; pagenum++) {
    var request = new XMLHttpRequest;
    request.pagenum = pagenum;
    request.onreadystatechange = parseProjects;
	  request.open("GET", root + String(pagenum), true);
	  console.debug("Requesting Page " + String(pagenum));
	  request.send();
  }
}
    
    
  
