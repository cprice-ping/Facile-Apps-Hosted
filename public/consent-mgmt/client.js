let consentDefId = 'Facile-TermsConditions'
let prefsDefId = 'Facile-MarketingPrefs'

function registerListeners(){
  //$('#logoffBtn').on('click',logoffUser);
  $('#consentAcceptBtn').on('click',postTermsConsent);
}

function callApi(url, cb){
  console.log("URL: ", url)
  fetch(url)
    .then(res => res.json())
    .then(data => {
      //console.log("callAPI Data: ", JSON.stringify(data))
      cb(data)
    })
    .catch(err => {
      document.getElementById("displayThings").innerText = "callApi: "+ err
      //cb(err)
      console.log("callAPI Error: ", err)
      //window.location = "/authorize";
    }) 
}  

function postApi(url, data, cb){
  fetch(url, {
    method: "post"
    })
    .then(res => res.json())
    .then(data => {
      //console.log("User Data: ", data)
      cb(data)
    })
    .catch(err => {
      cb(err)
    }) 
}  

function postTermsConsent(url, data, cb){
  // Grab the Consent Definition values
  let consentDefId = $('#consentDefId').text()
  let titleText = $('#consentTitle').text()
  let purposeText = $('#consentPurpose').text()
  let dataText = $('#consentData').text()
  let consentDefVersion = $('#consentDefVersion').text()
  let consentDefLocale = $('#consentDefLocale').text()
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({"status":"accepted","audience":"Facile","definition":{"id":consentDefId,"version":consentDefVersion,"locale":consentDefLocale},"titleText":titleText,"dataText":dataText,"purposeText":purposeText});
  console.log("Terms Raw: ", raw)
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw
  };

  fetch("/facile-api/consent/v1/consents", requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log('Consent Record created')
    
      // Swap the cards
      document.getElementById("displayConsentDef").classList.add("d-none");
      document.getElementById("displayAppInfo").classList.add("d-none");
    
      document.getElementById("userConsentRecord").classList.remove("d-none");
      document.getElementById("displayPrefsCard").classList.remove("d-none");
    
      getUserConsents(records => {
        displayConsents(records._embedded.consents)
        //document.getElementById("displayThings").innerText = "postTermsConsent: ", records
      })
    })
    .catch(error => console.log('error', error));
} 

function getUserInfo(){
  //let url = 'https://'+releaseName+'/authorize/user'
  let url = '/consent-mgmt/user'
  
  callApi(url, data => {
    let _html="Welcome " + data.given_name
    _html += '<span><button id="logoffBtn" class="btn btn-info btn-sm float-end" type="button" href="/idp/startSLO.ping?TargetResource='+window.location.href+'" />Logoff: '+data.preferred_username+'</span>'
    document.getElementById('userHeader').innerHTML = _html
    //document.getElementById('logoffBtn').href="/idp/startSLO.ping?TargetResource="+window.location.href

    
    // Check for Existing User Consents
    getUserConsents(records => {
      console.log("Consents Retrieved:", records.count)
      if(records.count !== 0){
        console.log("Displaying Consents")
        displayConsents(records._embedded.consents)
        var element = document.getElementById("displayConsentDef");
        element.classList.add("d-none");

        var element = document.getElementById("userConsentRecord");
        element.classList.remove("d-none");
        var element = document.getElementById("displayPrefsCard");
        element.classList.remove("d-none");
        
        getUserPrefsConsent()
        
      } else {
        console.log("Displaying Definition")
        // Get and Display T&Cs
        getDefTerms(consentDefId)
        // Create initial Prefs record
        postPrefsRecord()
      }
    })
  })
}

function logoff(){
  window.location.assign('/pa/oidc/logout')
}

function getUserConsents(cb) {

  //let url = 'https://'+releaseName+'/facile-api/consent/v1/consents'
  let url = '/facile-api/consent/v1/consents'
  
  callApi(url, records => {
    document.getElementById('displayConsentHeader').innerHTML = "Number of Consent Records: " + records.count
    //document.getElementById("displayThings").innerText = "getUserConsents: "+JSON.stringify(data)
    //displayConsents(records._embedded.consents)
    cb(records)
  })
}

function getAllConsentDefs(){
  let url = '/facile-api/consent/v1/definitions'
  
  callApi(url, data => {
    document.getElementById('consentDefs').innerHTML = JSON.stringify(data)
    return data
  })
}

function getUserPrefsConsent() {
  let url = '/facile-api/consent/v1/consents?definition=Facile-MarketingPrefs'
  callApi(url, data => {
    console.log("Marketing Record: ", data)
    document.getElementById("prefsRecordId").innerText = data._embedded.consents[0].id
    
    // Display the Record Prefs in the sliders
    document.getElementById('prefSwitchEmail').checked = data._embedded.consents[0].data.contactPreferences[0].allowed
    document.getElementById('prefSwitchText').checked = data._embedded.consents[0].data.contactPreferences[1].allowed
    document.getElementById('prefSwitchMail').checked = data._embedded.consents[0].data.contactPreferences[2].allowed
  })
}

function getDefTerms(consentDefId){

  let url = '/facile-api/consent/v1/definitions/'+consentDefId+'/localizations/us-EN'
  
  callApi(url, data => {
    document.getElementById('consentTitle').innerHTML = data.titleText
    document.getElementById('consentPurpose').innerHTML = data.purposeText
    document.getElementById('consentData').innerHTML = data.dataText
    document.getElementById('consentDefId').innerHTML = consentDefId
    document.getElementById('consentDefVersion').innerHTML = data.version
    document.getElementById('consentDefLocale').innerHTML = data.locale
    console.log(data)
    
    var element = document.getElementById("displayConsentDef");
    element.classList.remove("d-none");
    return data
  })
}

function getDefPrefs(defId, cb){
  let url = '/facile-api/consent/v1/definitions/'+defId+'/localizations/us-EN'
  
  callApi(url, data => {
    console.log("Prefs Def: ", data)
    
    cb(data)
  })
}

function postPrefsRecord(){
  
  getDefPrefs(prefsDefId, def => {
    // Grab the Consent Definition values
    let titleText = def.titleText
    let purposeText = def.purposeText
    let dataText = def.dataText
    let defVersion = def.version
    let defLocale = def.locale

    // Grab the Prefs status for the `data` element
    let prefs =[]
    
    prefs = [
      {type: 'email', allowed: document.getElementById('prefSwitchEmail').checked},
      {type: 'text', allowed: document.getElementById('prefSwitchText').checked},
      {type: 'mail', allowed: document.getElementById('prefSwitchMail').checked}
      ]
    
    // POST the initial Prefs Consent Record
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({"status":"accepted","audience":"Facile","collaborators":["Marketing"],"definition":{"id":prefsDefId,"version":defVersion,"locale":defLocale},"titleText":titleText,"dataText":dataText,"purposeText":purposeText, "data":{"contactPreferences": prefs}});
    //console.log(raw)
    //document.getElementById("displayThings").innerText = raw
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("/facile-api/consent/v1/consents", requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log('Prefs Record created: ', data)

        document.getElementById("prefsRecordId").innerText = data.id
      })
      .catch(error => {console.log('error', error); document.getElementById("displayThings").innerText = error});
  })
} 

function displayConsents(data) {
  //document.getElementById("displayThings").innerText = JSON.stringify(data)
  let _html = "<table class='table table-bordered'";
  _html += "<tr><th>Consent Title</th><th>Last Modified</th><th>Accepted?</tr>";
  var i;
  for (i = 0; i < Object.keys(data).length; i++) {
    _html += "<tr>";
    //_html += "<td><input type='hidden' name='consentRecId' id='consentRecId' value=" + Object.values(data)[i].id+" /><td>"
    _html += "<td><a onclick='displayConsentRecord(\""+Object.values(data)[i].id+"\")'><u>" + Object.values(data)[i].titleText+"</u></a></td>";
    _html += "<td>" + (Object.values(data)[i].updatedDate) + "</td>";
    
    // Set the Consent Status
    if(Object.values(data)[i].status == "accepted"){
      _html += '<td><div class="form-check form-switch">'
      _html += '<input class="form-check-input" type="checkbox" onclick="updateRecordStatus(this.value, \'revoked\')" id="consentStatus" value='+Object.values(data)[i].id+' checked></div></td>'
    } else {
      _html += '<td><div class="form-check form-switch"><input class="form-check-input" type="checkbox" onclick="updateRecordStatus(this.value, \'accepted\')" id="consentStatus" value='+Object.values(data)[i].id+'></div></td>'
    }
    _html += "</tr>";
  }
  _html += "</table>";
  document.getElementById('displayConsents').innerHTML = _html
}

function displayPrefs(){
  var prefs = [
    {type: 'Send me Email', id: 'Email', allowed: false},
    {type: 'Send me Text', id: 'Text', allowed: false},
    {type: 'Mail to my Home', id: 'Mail', allowed: false}
    ]
  
  let _html =''
  
  prefs.forEach(pref => {
    let check = ''
    if(pref.allowed){
      check = 'checked'
    }
    _html += '<div class="form-check form-switch">'
    _html += '<input class="form-check-input" type="checkbox" onclick="updatePrefConsent()" id="prefSwitch'+pref.id+'" '+check+'>'
    _html += '<label class="form-check-label" for="prefSwitch'+pref.type+'">'+pref.type+'</label>'
    _html += '</div>'
    //_html += '<ul>'+pref.type+'<span class="form-check form-switch"><input class="form-check-input" type="checkbox"></span></ul>'
  })  
  document.getElementById('displayPrefs').innerHTML = _html  
}

function updatePrefConsent(){
  let prefsRecordId = document.getElementById('prefsRecordId').innerText
  // get preferences
  let prefs =[]
   
  prefs = [
    {type: 'email', allowed: document.getElementById('prefSwitchEmail').checked},
    {type: 'text', allowed: document.getElementById('prefSwitchText').checked},
    {type: 'mail', allowed: document.getElementById('prefSwitchMail').checked}
    ]
  
  //var prefRefId = document.getElementById('prefsRecordId').innerHTML = 
  
  updateRecordDetails(prefsRecordId, prefs)
  
}

function updateRecordStatus(consentId, status) {
  //console.log(consentId, status)
  
  // Grab the Consent Definition values
  
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({"status":status});
  console.log(raw)
  var requestOptions = {
    method: 'PATCH',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("/facile-api/consent/v1/consents/"+consentId, requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log('Consent Record updated')

      getUserConsents(records => {
        displayConsents(records._embedded.consents)
      })
    })
    .catch(error => console.log('error', error));
} 

function updateRecordDetails(consentId, data) {
  console.log(consentId, status)
  //document.getElementById("displayThings").innerText = 'updateRecordDetails: '+consentId

  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({"data": {contactPreferences: data}});
  //console.log(raw)
  var requestOptions = {
    method: 'PATCH',
    headers: myHeaders,
    body: raw
  };

  fetch("/facile-api/consent/v1/consents/"+consentId, requestOptions)
    .then(response => response.json())
    .then(records => {
      console.log('Consent Record updated')
      //document.getElementById("displayThings").innerText = 'updateRecordDetails: '+JSON.stringify(records, null, '\t')
      getUserConsents(records => {
        displayConsents(records._embedded.consents)
      })
    })
    .catch(error => console.log('error', error));
} 

function displayConsentRecord(consentId){
  
  let url = '/facile-api/consent/v1/consents/'+consentId
  //document.getElementById('displayConsentTitle').innerText = 'consentUrl: '+url
  
  callApi(url, record => {
    document.getElementById('displayConsentTitle').innerText = record.titleText
    
    let _html = "<table class='table table-bordered shadow'>";
    _html += '<tr><td>Status</td><td>'+record.status+'</td></tr>'
    _html += '<tr><td>Subject DN</td><td>'+record.subjectDN+'</td></tr>'
    _html += '<tr><td>Actor DN</td><td>'+record.actorDN+'</td></tr>'
    _html += '<tr><td>Record Version</td><td>'+record.definition.version+'</td></tr>'
    _html += '<tr><td>Definition Version</td><td>'+record.definition.currentVersion+'</td></tr>'
    if(record.data){
      _html += '<tr><td>Data</td><td>'+JSON.stringify(record.data)+'</td></tr>'
    }
    
    document.getElementById('displayConsentRecord').innerHTML = _html
    document.getElementById('displayRawRecord').innerHTML = '<pre>'+JSON.stringify(record, null, 2)+'</pre>'
    
    document.getElementById('displayRecordCard').classList.remove("d-none");
    document.getElementById('displayRawCard').classList.remove("d-none");
    
  })
  
}