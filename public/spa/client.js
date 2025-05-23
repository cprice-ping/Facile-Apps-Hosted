function registerListeners() {
  $("#btnLogin").on("click", loginUser);
  setInterval(getWeather, 60000);
}

function getUser() {
  console.log("Retrieving User info");

  let url = "/spa/user";
  $.get(url, function(data) {
    return data;
  })
    .done(function(data) {
      console.log("User: ", JSON.stringify(data));
      let _html =
        '<button id="btnExtendSession" class="btn btn-info btn-sm float-left">Refresh Session Info<span id="sessionStatus"></span><button id="btnLogoff" class="btn btn-secondary btn-sm float-right">Logout';
      $("#cardHeader").html(_html);
      displayUser(data);
      getWeather();
      $("#btnExtendSession").on("click", refreshUser);
      $("#btnLogoff").on("click", logoffUser);
    })
    .fail(function(err) {
      console.log("Session Expired");
    });
}

function refreshUser() {
  console.log("Refreshing User info");
  let url = "/spa/user";
  $.get(url, function(data) {
    return data;
  })
    .done(function(data) {
      console.log("User: ", JSON.stringify(data));

      let _html =
        '<button id="btnExtendSession" class="btn btn-info btn-sm float-left">Refresh Session Info<span id="sessionStatus"></span><button id="btnLogoff" class="btn btn-secondary btn-sm float-right">Logout';
      $("#cardHeader").html(_html);
      displayUser(data);
      $("#btnExtendSession").on("click", refreshUser);
      $("#btnLogoff").on("click", logoffUser);
    })
    .fail(function(err) {
      let _html =
        '<button id="btnExtendSession" class="btn btn-danger btn-sm float-left">Session Expired';
      $("#cardHeader").html(_html);
      console.log("Session Expired");
    });
}

function logoffUser() {
  window.location.replace("/pa/oidc/logout");
}

function loginUser() {
  let url = "/spa/user";
  $.get(url, function(data) {
    console.log("Login User pressed");
  })
    .done(function() {
      console.log("User Logged in");
      getUser();
      getWeather();
    })
    .fail(function(err) {
      console.log("User not logged in");
      window.location = "/spa/login";
    });
  return true;
}

function displayUser(data) {
  let _html = "<table class='table table-bordered shadow'";
  _html += "<tr><th>Key</th><th>Value</th></tr>";
  var i;
  for (i = 0; i < Object.keys(data).length; i++) {
    _html += "<tr>";
    _html += "<td>" + Object.keys(data)[i] + "</td>";

    if (Object.keys(data)[i].match(/^(exp|iat|pi.pa.rat|pi.pa.attr_exp)$/)) {
      let tempDate = new Date(Object.values(data)[i] * 1000);
      _html += "<td>" + Object.values(data)[i] + " (" + tempDate + ")</td>";
    } else {
      _html += "<td>" + Object.values(data)[i] + "</td>";
    }
    _html += "</tr>";
  }
  _html += "</table>";
  $("#userDetails").html(_html);
}

function getWeather() {
  console.log("Calling Weather API");
  //api.openweathermap.org/data/2.5/forecast/daily?q={city name}&cnt={cnt}&appid={API key}
  //let url='/daily/forecast/daily?q=napa&cnt=3'
  let url = "/weather?q=napa&units=imperial";
  $.get(url, function(data) {
    return data;
  })
    .done(function(data) {
      console.log(JSON.stringify(data));
      let _headerHtml =
        "Current weather for: " + data.name + ", " + data.sys.country;
      _headerHtml += " (Updated: " + currentTime() + ")";
      $("#weatherCardHeader").html(_headerHtml);

      let weatherIcon =
        "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png";

      let _topHtml =
        "<div class='card-body' id='displayWeatherSummary'><div><table class='table table-bordered shadow'>";
      _topHtml += "<tr>";
      _topHtml += "<td>" + data.weather[0].description + "</td>";
      _topHtml += '<td><img src="' + weatherIcon + '"</td>';
      _topHtml += "</tr></div>";
      _topHtml += "</table></div>";
      $("#displayWeatherSummary").html(_topHtml);
      // Build top of Weather Table
      let _html =
        "<div class='card-body'><table class='table table-bordered shadow'>";
      _html += "<thead>Current Details (Imperial):</thead>";

      var i;
      for (i = 0; i < Object.keys(data.main).length; i++) {
        _html += "<tr>";
        _html += "<td>" + Object.keys(data.main)[i] + "</td>";
        _html += "<td>" + Math.round(Object.values(data.main)[i]) + "</td>";
        _html += "</tr>";
      }
      _html += "</table></div>";
      //console.log("Weather Data: ", data)
      $("#displayWeatherMain").html(_html);
    })
    .fail(function(err) {
      $("#weatherCard").html("<p style='color:red'>getWeather request failed");
    });
}

function currentTime() {
  var dt = new Date();
  var hours = dt.getHours(); // gives the value in 24 hours format
  var AmOrPm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  var minutes = (dt.getMinutes() < 10 ? "0" : "") + dt.getMinutes();
  var finalTime = hours + ":" + minutes + " " + AmOrPm;
  return finalTime;
}
