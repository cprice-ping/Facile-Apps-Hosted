# PingAccess Managed SPA

PingAccess can be used to remove all Identity related complexity from the SPA itself and into a managed configuration.

## PingAccess SPA Features
Things that PingAccess can provide for the SPA:
* Unauthenticated access to SPA (assets \ css \ js \ etc)
* Resource specific 401 response
  * OIDC Logon via XHR request
    (Redirect location response)
  * Session protected APIs
    (JSON response)
* API Secret Injection
  * API Key \ Basic \ Bearer

## Sample SPA
This SPA demonstrates the above with a couple of endpoints in PingAccess using a single WebSession:

### SPA Files
| File | Purpose |
| --- | --- |
| `/views/pingaccess.pug` | HTML Template file |
| `/public/spa/pingaccess.js` | SPA client code |
| `/public/spa/pingaccess.md` | This file |

### SPA Endpoints

| Endpoint | Purpose | Target Site | WebSession |
| --- | --- | --- | --- |
| `/spa` | Entrypoint to the SPA | `https://decoder.pingidentity.cloud/spa` | Sample Session - SPA |
| `/weather` | Proxied to OpenWeather API | `https://api.openweathermap.org/data/2.5` | Sample Session - SPA |

### Web Session Configuration
The `Sample-SPA` WebSession is configured for this demostration to show what happens when the session state changes
between Un-Authenticated \ Authenticated \ Idle \ Max, along with additional integrations with PingFederate.

| Session Attribute | Value | Purpose |
| --- | --- | --- |
| Client ID | PingLogon | OIDC Client on PingFederate for AuthN \ SSO |
| Idle Timeout | 3m | How long session lasts with no input |
| Max Timeout | 5m | Total time of session |
| Validate Session | Yes | Check PingFed Session on each call |
| Refresh User Attributes | Yes - 30s | Update Identity Data |

### Endpoint Protection
Some of the endpoints \ resources are protected:

| Endpoint | Purpose | Protected? |
| --- | --- | --- |
| `/spa` | Assets \ CSS \ HTML \ JS | No | 
| `/spa/users` | Identity Virtual API | Yes |
| `/spa/login` | Login OIDC Redirect | Yes |
||||
| `/weather` | OpenWeather API | Yes |

### Authentication Request Policies
The protected endpoints have Authentication Request Policies to send back custom messages for unauthorized calls:

| Endpoint | AuthN Request Policy | 
| --- | --- |
| `/spa/users`| Unauthorized JSON |
| `/spa/login`| OIDC Authentication Request Redirect (PingFed) |
| `/weather` | Unauthorized JSON |

### Weather API - URL Rewrite
The connection to OpenWeather API includes a URL rewrite rule that adds the necessary API Key to the request. The API Key is held in PingAccess, not in the SPA.

| Incoming Call | Outgoing Call |
| --- | --- |
| `/weather?q=napa&units=imperial` | `api.openweathermap.org/data/2.5/weather?q=napa&units=imperial&appid={API key}` |
