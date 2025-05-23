function showUserCard(idToken){
  console.log(idToken)
  
  let _headerHtml="Welcome " + idToken.given_name
  //_headerHtml += '<span><a id=#myAcctBtn class="btn btn-outline-success btn-sm float-end"  href="https://apps.pingone.com/62f52603-fe86-46b5-8d87-a3450c83be84/myaccount/?login_hint='+idToken.preferred_username+'" target="_blank"/>'+idToken.preferred_username+'</a></span>'
  _headerHtml += '<span><a id=#myAcctBtn class="btn btn-outline-success btn-sm float-end" href="https://'+_releaseName+'.ping-devops.com/idp/startSLO.ping" />Logoff' 
  
  document.getElementById("userInfoHeader").innerHTML=_headerHtml
  
  let _userHtml = "This is a demonstration of the PingFederate Authentication Widget with an OIDC Redirectless integration"
  
  document.getElementById("userInfoDetails").innerHTML=_userHtml
  document.getElementById("idTokenBody").innerText=JSON.stringify(idToken, null, 2)
  document.getElementById("userAuthN").classList.remove("d-none")
}
