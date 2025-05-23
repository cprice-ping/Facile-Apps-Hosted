/* Things the page does */
displayViews(false);
document.getElementById("consoleLog").style.display = "none";
window.onload = paLogon();

document.getElementById("signInBtn").addEventListener(
  "click",
  function() {
    document.getElementById("signInView").style.display = "none";
    document.getElementById("authnwidget").style.display = "block";
    paLogon();
   },
  false
);

document.getElementById("refreshBtn").addEventListener(
  "click",
  function() {
    getConsentedInfo()
  }
)

document.getElementById("sessionExpired").addEventListener(
  "click",
  function() {
    paLogon()
  }
)

document.getElementById("consoleLogSwitch").addEventListener(
  "sl-change",
  function() {
    if(event.target.checked){
      document.getElementById("consoleLog").style.display = "block";
    } else {
      document.getElementById("consoleLog").style.display = "none";
    }
  }
)

const drawer = document.querySelector('.drawer-custom-size');
const openButton = drawer.nextElementSibling;
const closeButton = drawer.querySelector('sl-button[type="primary"]');

openButton.addEventListener('click', () => drawer.show());
closeButton.addEventListener('click', () => drawer.hide());

/* Fuctions used by the Page */
function displayViews(isAuthenticated) {
  let authnwidget = document.getElementById("authnwidget");
  let signInBtn = document.getElementById("signInBtn");
  let signOffBtn = document.getElementById("signOffBtn");

  if (isAuthenticated) {
    document.getElementById("authnwidget").style.display = "none";
    document.getElementById("signInBtn").style.display = "none";
    document.getElementById("signOffBtn").style.display = "block";
    document.getElementById("signOffBtn").href="/idp/startSLO.ping?TargetResource="+window.location.href
    document.getElementById("myAcctBtn").style.display = "block";
    document.getElementById("userAuthenticated").style.display = "block";
    //document.getElementById("paUserBtn").style.display = "block";
    document.getElementById("signInView").style.display = "none";
    document.getElementById("sessionExpired").style.display = "block";
    document.getElementById("userInfo").style.display = "inline";
  } else {
    document.getElementById("authnwidget").style.display = "none";
    document.getElementById("signInBtn").style.display = "block";
    document.getElementById("signOffBtn").style.display = "none";
    document.getElementById("userInfo").style.display = "none";
    document.getElementById("myAcctBtn").style.display = "none";
    document.getElementById("userAuthenticated").style.display = "none";
    document.getElementById("signInView").style.display = "block";
    document.getElementById("sessionExpired").style.display = "none";
  }
}

function paLogon() {
  //Get PF Widget config from PA
  callUrl("/consent-enforce/login", paResponse => {
    const pfBaseUrl = paResponse.authorizationUrl.split("/as")[0];
    const logo =
      "https://cdn.glitch.com/a766be66-dd8a-4fa9-adb0-382568f98cae%2FPingIdentity-logo.png?v=1619110029434";
    // Invoke the PF Widget
    var authnWidget = new PfAuthnWidget(pfBaseUrl, {
      divId: "authnwidget",
      logo: logo,
      deviceProfileScript:
        "/shared/scripts/pingone-risk-profiling-signals-sdk.js"
    });
    // Build the Widget config with the AuthN_Contect_Request object from PA
    var config = {
      onAuthorizationRequest: PfAuthnWidget.paOnAuthorizationRequest(
        paResponse
      ),
      onAuthorizationSuccess: PfAuthnWidget.paOnAuthorizationSuccess(
        paResponse,
        function(err, resp) {
          if (err) {
            console.log("PF Widget error: ", err);
            return;
          }
          //Get User Info from PA session (Virtual Response)
          callUrl("/consent-enforce/user", userInfo => {
            displayUserInfo(userInfo);
          });
          // Get initial data from PingAuthorize
          getConsentedInfo()
          // Switch the page elements                   
          displayViews(true);

        }
      )
    };
    authnWidget.initRedirectless(config);
  });
}

function callUrl(url, cb) {
  console.log("Calling: ", url);
  fetch(url)
    .then(res => {
      if(!res.ok){
        console.log("PA Session Expired")
        // document.getElementById("sessionExpired").classlist.remove("hidden")
      }
      return res.json()
    })
    .then(data => {
      consoleLog("PA URL: "+url+"\n\n"+JSON.stringify(data));
      cb(data);
    })
    .catch(err => {
      console.log("callUrl error: ", err)
      consoleLog("callUrl error: "+ err)
  });
}

function callUrlWithBearer(url, cb) {
  //Get Session token
  callUrl("/consent-enforce/token", token => {
    console.log("Calling: ", url);
    fetch(url, {
      headers: new Headers({
       'Authorization': 'Bearer '+token.token
      })
    })
      .then(res => res.json())
      .then(data => {
        consoleLog("PA URL: "+url+"\n\n"+ (data));
        cb(data);
      })
      .catch(err => {
        console.log("callUrlWithBearer error: ", err)
        consoleLog("callUrlWithBearer error: "+err)
    });
  })
}

function getConsentedInfo() {
    //Get initial data from PAZ
    let url="/paz/directory/v1/ou=people,dc=sampleCiam.com/subtree?searchScope=wholeSubtree&filter=uid pr"
    callUrlWithBearer(url, data => {
      
      let table = document.querySelector("table");
      table.innerHTML = ""
      let header = ["Name", "Communication Preferences"]
      
      generateTable(table, data._embedded.entries);
      generateTableHead(table, header);
      
      //document.getElementById("consentedUserInfo") = table
    })
}

function expiredLogin(){
  window.location.reload()
}

function displayUserInfo(userInfo) {
  let _html = "Welcome <b>" + userInfo.given_name + "</b>";
  document.getElementById("userWelcome").innerHTML = _html;
  document.getElementById("userInfoDrawer").innerHTML = jsonIntoHtmlTable(userInfo);
}

/**
 * Transform json content into html table element
 * @param json
 * @returns {string}
 */
function jsonIntoHtmlTable(json) {
  try {
    return (
      '\n<table class="table"><tr>' +
      //+ '<th class="text-left">Claim</th><th class="text-right">Value</th></tr>'
      addTableBody(json) +
      "\n</table>"
    );
  } catch (e) {
    throw new AuthException(
      "Unable to format json into HTML table:" + e.toString()
    );
  }
}

/**
 * Create table body from json object
 * @param jsonObject json object to create a table from
 * @returns {string|string}
 */
function addTableBody(jsonObject) {
  let htmlTableBody = "";
  for (let claim in jsonObject) {
    // In case that is a nested element like address modify its keys by adding '_' between parent and child keys(i.s parentKey_childKey)
    // for getting a proper claim description from the map
    if (isObject(jsonObject[claim])) {
      let renamedKeys = Object.keys(jsonObject[claim]).reduce(
        (acc, key) => ({
          ...acc,
          ...{ [claim + "_" + key]: jsonObject[claim][key] }
        }),
        {}
      );
      htmlTableBody = htmlTableBody + addTableBody(renamedKeys);
    } else {
      htmlTableBody =
        htmlTableBody +
        "\n<tr><td><b>" +
        claim +
        "</b></td><td>" +
        "</td><td>" +
        jsonObject[claim] +
        "</td></tr>";
    }
  }
  return htmlTableBody;
}

function isObject(value) {
  return value && typeof value === "object" && value.constructor === Object;
}


function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
    row.classList.add("border-gray-300")
  }
}

// This function used to present code info to the page
function consoleLog(log){
  document.getElementById("consoleLog").innerText = log
}