const express = require("express");
const got = require("got")
const cors = require("cors")
const bodyParser = require("body-parser");
const btoa = require("btoa");
const atob = require("atob");

const app = express();

app.use(express.static("public"));
app.use(cors())
app.set("view engine", "pug");

app.use(express.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const path = require('path')


/************************************************************************************
                            TEMPLATE SECTION
*************************************************************************************/
// Consent Management SPA Demo
app.get('/consent-mgmt', (req, res) => {res.render('consent-mgmt/index.pug');});

// Utile
app.get('/utile', (req, res) => {res.render('utile/index.pug');});

// PA integrated SPA Demo
app.get('/spa', (req, res) => {res.render('spa/index.pug');});

// PF AuthN Widget - with flowId
app.get("/:releaseName/widget", (req, res) => { res.render("widget/index.pug", {pfBaseUrl: 'https://'+req.params.releaseName+'.ping-devops.com'});})

// PF AuthN Widget - Redirectless
app.get("/:releaseName/redirectless", (req, res) => { res.render("widget/redirectless.pug", {pfBaseUrl: 'https://'+req.params.releaseName+'.ping-devops.com'});})

// PA integrated SPA Demo
app.get('/:releaseName/redirectless2', (req, res) => {res.render('widget/redirectless2.pug', { releaseName: req.params.releaseName });}); 

app.post('/pingidtest', (req, res) => {
  res.redirect('/pingidtest')
})

// Retrieve the token needed to invoke a Widget flow
app.get("/getSkToken", (req, reply) => {
  getSkToken(skToken => {
    reply.send({
      skToken: skToken.access_token,
      companyId: process.env.skCompanyId
    });
  });
});

/*************
* P1 client CORS proxy
*************/
app.all("/pingauth/flows/:flowId", (req, reply) => {
  
  const p1AuthUrl = "https://auth.pingone.com/flows"+req.params.flowId
  
  got(p1AuthUrl, {
    headers: req.headers,
    method: req.method,
    body: req.body
  })
  .json()
  .then(data => reply.send(data))
  .catch(err => reply.send(err))
})

/***
* PingOne Risk - Evaluation request
***/
app.post("/getRiskDecision", (req, res) => {
  
  // Get P1 Worker Token
  getPingOneToken(pingOneToken => {
    
    // URL must match the Risk EnvID used to create the payload
    const url="https://api.pingone.com/v1/environments/"+process.env.riskEnvId+"/riskEvaluations"
    
    // Construct Risk headers
    const headers = {
        Authorization: "Bearer "+pingOneToken
      }
    
    // Construct Risk Eval body
    const body = {
      event: {
        "targetResource": { 
            "id": "Signals SDK demo",
            "name": "Signals SDK demo"
        },
        "ip": req.headers['x-forwarded-for'].split(",")[0], 
        "flow": { 
            "type": "AUTHENTICATION" 
        },
        "user": {
          "id": "facile-user", // if P1, send in the UserId
          "name": "facile-user", // This is displayed in Dashboard and Audit
          "type": "EXTERNAL"
        },
        "sdk": {
          "signals": {
            "data": req.headers.sdkpayload // Signals SDK payload from Client
          }
        },
        "sharingType": "PRIVATE", 
        "origin": "FACILE_DEMO" 
      },
      "riskPolicySet": {
        "id": "51f11de3-d6cb-0c8b-0b49-0e7e44ad6cf9" // This is the Policy your asking for a decision from
      }
    }
    
    // Make the call to PingOne Risk
    got(url, {
      headers: headers,
      method: "post",
      json: body
    })
      .json()
      .then(data => res.send(data))
      .catch(err => {console.log(err);res.send(err)}) 
  })
})

/************************************************************************************
                            SERVER SECTION
*************************************************************************************/
const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

function getPingOneToken(cb) {
  const url="https://auth.pingone.com/"+process.env.riskEnvId+"/as/token"
  const basicAuth=btoa(process.env.riskClientId+":"+process.env.riskClientSecret)
  
  // console.log(url)
  
  got.post(url, {
    headers: {
      Authorization: "Basic "+basicAuth
    },
    form: {
      grant_type: "client_credentials"
    }
  })
    .json()
    .then(data => cb(data.access_token))
    .catch(err => console.log("getPingOneToken Error: ", err))
}

// Get a Company sdkToken
function getSkToken(cb) {
   const url =
     "https://devapi.singularkey.com/v1/company/" +
     process.env.skCompanyId +
     "/sdkToken";

   got(url, {
     headers: {
       "X-SK-API-KEY": process.env.skApiKey
     },
     method: "GET"
   })
     .json()
     .then(data => cb(data))
     .catch(err => console.log("Error: ", err));
}

/*****************************************/
/* This route is used to receive a POST from a PF Reference ID Adapter
/****************************************/
app.post("/getDeviceId/:releaseName", function(req, res){
  //console.log("Request: ", req.body)
  
  // Perform Pickup
  const pfPickupUrl = "https://"+req.params.releaseName+".ping-devops.com/ext/ref/pickup?REF="+req.body.REF
  pfAgentlessPickup(pfPickupUrl, function(attribs){
    
    const params = {
      pfResumePath: "https://"+req.params.releaseName+".ping-devops.com"+req.body.resumePath,
      releaseName: req.params.releaseName
    }
    
    res.render("zerotrust/opswat.pug", params);
  })
})

/*****************************************/
/* This route is used to send a POST to a PF Reference ID Adapter
/****************************************/
app.post("/dropoff/:releaseName", function(req, res){
  
  console.log("Dropoff from Client: ", req.body)
  
  // Perform Dropoff
  const pfDropoffUrl = "https://"+req.params.releaseName+".ping-devops.com/ext/ref/dropoff"
  pfAgentlessDropoff(pfDropoffUrl, req.body, function(ref){
    
    // Drop User back to PF
    const pfDropoffURL = "https://"+req.params.releaseName+".ping-devops.com/ext/ref/dropoff"
    
    //pfAgentlessDropoff(pfDropoffURL, userSubject, function(ref){
      console.log("dropoffRef: ", ref)
    
      // Send in values from the Server to the Client
      res.status(200).send({dropoffRef: ref}) 
    //})
  })
})

/*****************************************/
/* Function that gets the Pickup data from PF
/* REF is supplied from initial POST to this app
/****************************************/
function pfAgentlessPickup(pfAgentlessUrl, cb){
  got(pfAgentlessUrl, {
    headers: {
      "Authorization": "Basic " + btoa(process.env.pfAdapterUser+":"+process.env.pfAdapterPwd),
      "ping-instanceId": "FacileReferenceID"
    },
    method: "get"
  })
  .json()
  .then(data => cb(data))
  .catch(err => console.log("Pickup failed: ", err) )
}


/*****************************************/
/* Function that does the Dropoff to the PF Agentless Adapter
/* PF Returns a REF to be sent with the resumePath
/****************************************/
function pfAgentlessDropoff(pfAgentlessUrl, dropoffData, cb){
  console.log("Dropoff Exchange data: ", dropoffData)
  got.post(pfAgentlessUrl, {
    headers: {"Authorization": "Basic " + btoa(process.env.pfAdapterUser+":"+process.env.pfAdapterPwd)},
    body: JSON.stringify({ dropoffData })
  })
  .json()
  .then(data => cb(data.REF))
  .catch(err => console.log("Dropoff failed: ", err))
}
/*****************************************/
/* End Agentless Demo
/****************************************/
