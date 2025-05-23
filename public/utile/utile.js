var baseURL;

function registerListeners(){
  $('#searchButton').on('click',search);
  $('#entryButton').on('click',updateEntry);
  $('#stateButton').on('click',updateState);  
  $('#deleteButton').on('click',deleteEntry);
  $('#newEntryButton').on('click',createEntry);
}

function init(){
  registerListeners();
  let _releaseName=$('#releaseName').val();
  let _userName=$('#userName').val();
  let _userPassword = $('#userPassword').val();
  baseURL = '/pd-api/directory/v1';
    
  if ( !$('#baseDN').val() || 0 === $('#baseDN').val().length ) {
    // get the base DN
    issueSearchRequest(baseURL)
      .then(data => {
        // console.log(data);
        $('#baseDN').val(data['publicBaseDNs'][0]);
      })
    .catch(err => {console.log("Exception caught");console.log(err);});
    
    issueSearchRequest(baseURL+'/me',{includeAttributes: 'displayName'}).then(
      data =>{
        setTimeout(function(){ $('#headTitle').addClass('d-none'); }, 30000);
      }).catch(console.log);
    
    // get the full version and connections
    issueSearchRequest(baseURL+'/'+'cn=monitor')
      .then(data => {
        // console.log(data);
        $('#productName').text(data['productVersion']);
        let _max=data['maxConnections'];
        let _current=data['currentConnections'];
        let _conn = Math.floor(_current * 100 / _max);
        setProgressBarValue('#connGauge',_conn);
        $('#connectionCard').addClass('d-none');
        $('#healthCard').removeClass('d-none');
        $('#dataCard').removeClass('d-none');
      })
      .then(moot => {
        // get memory usage
        issueSearchRequest(baseURL+'/'+'cn=Gauge JVM Memory Usage (Percent) for JVM Memory Usage,cn=monitor')
          .then(data => {
            // console.log(data);
            setProgressBarValue('#memGauge', parseInt(data['value'],10));
            });

        // get disk usage
        issueSearchRequest(baseURL+'/'+'cn=Disk Space Usage,cn=monitor')
          .then(data => {
            // console.log(data);
            let _usage = Math.floor(100 - data['disk-space-consumer-usable-percent-1']);
            setProgressBarValue('#diskGauge', _usage);
            });
        }).catch(console.log);  
    }
}

function search(){
  let _baseDN=$('#baseDN').val();
  issueSearchRequest(baseURL+'/'+_baseDN+'/subtree',
    {
      filter: $('#searchFilter').val(),
      searchScope: $('#searchScope').val(),
      excludeAttributes: '*'
    }).then(data => handleSearcResults(data));
}

function getEntry(dn){
  issueSearchRequest(baseURL+'/'+dn, {includeAttributes: '*'})
    .then(data => {
      $('#entryDN').val(dn);
      displayResultUser(data);
    });
  getOperationalAttributes(dn);
  getPasswordPolicyState(dn);
}
function displayAlert(message){
  $('#alertBlock').html('<strong>Error</strong>'+message+'<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>');
  $('#alertBlock').removeClass('d-none');
  $('#alertBlock').removeClass('show');
}

function updateEntry(){
  let _jsonData = $('#entryJSON').val();
  let _dn = $('#entryDN').val();
  issueUpdateRequest(baseURL+'/'+_dn,_jsonData)
    .then(data => {getEntry(_dn);})
    .catch(err => {displayAlert(err)});
}

function updateState(){
  let _jsonData = $('#entryState').val();
  let _dn = $('#entryDN').val();
  issueUpdateRequest(baseURL+'/'+_dn, _jsonData)
    .then(data => {getEntry(_dn);})
    .catch(err => {displayAlert(err)});  
}

function deleteEntry(){
  let _dn = $('#entryDN').val();
  issueDeleteRequest(baseURL+'/'+_dn)
    .then(data => {
        $('#entryCard').addClass('d-none');      
        $('#entryJSON').val('');
        $('#entryOperational').val('');
      })
    .catch(console.log);
}

function createEntry(){
  let _dn = $('#newEntryDN').val();
  let _payload= JSON.parse($('#newEntryJSON').val());
  _payload['_dn']=_dn;
  issueAddRequest(baseURL, null, JSON.stringify(_payload))
    .then(data => { getEntry(_dn); })
    .catch(console.log);
}

function isEmpty(obj){
  return ( obj && Object.keys(obj).length === 0 && obj.constructor === Object );
}

function getOperationalAttributes(dn){
  issueSearchRequest(baseURL+'/'+dn, {includeAttributes: '_operationalAttributes', excludeAttributes: 'aci,ds-pwp-modifiable-state-json'})
    .then(data => displayResultOperational(data))
    .catch(console.log);  
}

function getPasswordPolicyState(dn){
  issueSearchRequest(baseURL+'/'+dn, {includeAttributes: 'ds-pwp-modifiable-state-json,aci'})
    .then(data => displayPasswordPolicyState(data))
    .catch(console.log);    
}

function displayPasswordPolicyState(data){
  let entryContents = data;
  delete entryContents['_links'];
  delete entryContents['_dn'];
  if (isEmpty(entryContents)){
    console.log('no password policy data');
    $('#stateInputGroup').addClass('d-none');
  } else {
    //console.log('displaying password policy data');
    $('#stateInputGroup').removeClass('d-none');
    $('#entryState').val(myStringify(Object.fromEntries(Object.entries(entryContents).sort())));      
  }
}

function displayResultOperational(data){
  let entryContents = data;
  delete entryContents['_links'];
  delete entryContents['_dn'];
  $('#entryOperational').val(myStringify(Object.fromEntries(Object.entries(entryContents).sort())));
}

function displayResultUser(data){
  let entryContents = data;
  delete entryContents['_links'];
  delete entryContents['_dn'];
  $('#entryJSON').val(myStringify(Object.fromEntries(Object.entries(entryContents).sort())));
  $('#entryCard').removeClass('d-none');      
}

function handleSearcResults(data){
  if (data && data['_embedded'] && data['_embedded']['entries']){
    if (data['_embedded']['entries'].length === 1){
      $('#searchResultTable').html('');
      getEntry(data['_embedded']['entries'][0]['_dn']);
    } else {
      $('#searchResultTable').html(data['_embedded']['entries'].map(handleSearchResultEntry));      
    }
  }
}

function handleSearchResultEntry(entry){
  return '<tr><td><a onclick=\'getEntry("'+entry['_dn']+'");\'>'+entry['_dn']+'</a></td></tr>';
}

function setProgressBarValue(id,value){
  let _v = value+'%';
  $(id).text(_v);
  $(id).css('width',_v);
  $(id).attr('aria-valuenow',value);
  if (value > 90){
    $(id).addClass('bg-danger');
  } else if (value > 80){
    $(id).addClass('bg-warning');    
  } else if (value < 50 ){
    $(id).addClass('bg-success');
  }
}

function myStringify(jsonObject){
  // return JSON.stringify(jsonObject, function(key,value){
  //   if (value && value instanceof Array && 1===value.length){
  //     return "["+value[0]+"]";
  //   } else {
  //     return value;
  //   }
  // },4);
  return JSON.stringify(jsonObject, null, 4);
}

async function issueSearchRequest(url, params){
  return issueRequest('get',url, params);
}

async function issueUpdateRequest(url, data){
  return issueRequest('put',url, null, data);
}

async function issueDeleteRequest(url, params){
  return issueRequest('delete', url, params);
}

async function issueAddRequest(url, params, data){
  return issueRequest('post', url, params, data);
}

async function issueRequest(type, url, params, data){
  return $.ajax({
      type: type,
      url: url+(params?'?'+new URLSearchParams(params).toString():''),
      dataType: 'json',
      contentType: 'application/json',
      timeout: 3000,
      data: data
    });
}