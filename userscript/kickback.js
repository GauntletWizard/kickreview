/**
 * @fileoverview Tools for managing your Kickstarted projects. www.kickreview.net
 */

root = "https://www.kickstarter.com/profile/transactions?page=";
dataPrefix = "ProjectStatus:";
content = "<table class='backings'><thead><tr><th>Project Statistics</th><th></th></tr></thead>"

//This is super fragile, as parsing goes, but they don't have CSS classes.
function Project(row) {
  this.projectName = row.children[0].innerText;
  this.projectLink = console.debug(row.children[0].href);

//  console.debug(this.projectLink);
  try {
    //this.projectID = 
    console.debug(this.projectLink.match("^(https?://www.kickstarter.com/projects/)?(.*)")[2]);
  } catch(TypeError) {
    console.debug("Typeerror on " + this.projectLink);
    console.debug(row);
  }
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
  var rewardCost = Number(this.reward.match(/[\$|£]([\d\.]*) -/)[1]);
  this.overage = this.pledge - rewardCost;
}

function isLastPage(page) {
  return page.getElementsByClassName("no-content").length == 1;
}

function totals() {
  total = 0;
  outstanding = 0;
  paid = 0;
  
    for (var i = 0; i < projects.length; i++) {
      pj = projects[i];
      console.debug(total)
      if (pj.status == "In Progress") {
        outstanding = outstanding + pj.pledge;
      }
      if (pj.status == "FUNDED!") {
        paid = paid + pj.pledge;
      }
      total = total + pj.pledge;
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
      for (var i = 0; i < backinglist.length; i++) {
        projects[projects.length] = new Project(backinglist[i]);
      }
    } else {
      //Logic for grabbing pages past what we expected.
      if (this.pagenum == (numpages - 1)) {
        var request = new XMLHttpRequest;
        request.pagenum = this.pagenum + 1;
        request.onreadystatechange = parseProjects;
	      request.open("GET", root + String(this.pagenum + 1), true);
    	  console.debug("Requesting Page " + String(this.pagenum + 1));
	      request.send();
      }
    }
  }
}
      

function showRewardStatus() {
  var backings = document.getElementsByClassName("backings")[0];
  var header = backings.children[0].children[0];
  var status = document.createElement("th");
  status.innerHTML = "Reward Status";
  header.appendChild(status);

  var pjs = backings.children[1].children;
  pageProjects = [];
  for (i = 0; i < pjs.length; i++) {
    var pj = new Project(pjs[i]);
      var status = document.createElement("td");
      status.id= pj.projectID;
    if (pj.pledgeStatus.search("Collected") != -1) {
      status.innerHTML = '<span><input type="radio" name="' + pj.projectName +
          '" onclick="console.log(this)" value="received">Received</span>' +
          "";
      pageProjects.push(dataPrefix + pj.projectLink);
    } else if (pj.status.search("Unsuccessful") != -1) {
      status.innerHTML = "Unfunded";
    } else {
      status.innerHTML = "Funding";
    }
    pjs[i].appendChild(status);
    myStorage.get(pageProjects, statusCallback);
  }
}

function statusCallback(items) {
  // console.log(items);
  for (project in items) {
    console.log(project, items[project]);
  }
}

function grabAllPages() {
  // There's two extra children - One is used up by < numpages (rather than <=), the other is requested 
  // so we know that there's no more pages to come.
  numpages = document.getElementsByClassName("pagination")[0].children.length;
  projects = []
  for (var pagenum = 1; pagenum < numpages - 1; pagenum++) {
    var request = new XMLHttpRequest;
    request.pagenum = pagenum;
    request.onreadystatechange = parseProjects;
	  request.open("GET", root + String(pagenum), true);
	  console.debug("Requesting Page " + String(pagenum));
	  request.send();
  }
}

function loaded() {
  grabAllPages();
  showRewardStatus();
}

myStorage = chrome.storage.local;  //Testing
// myStorage = chrome.storage.sync;  //Live

document.onload = loaded();
