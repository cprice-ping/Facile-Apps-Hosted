# Purpose

This project contains tools that are used with Project Facile

### Project 'Facile' Apps

![facile qr](https://cdn.glitch.com/d73a8d8c-7227-47ee-8646-873dea902e5f%2Ffacile-qr.png?v=1613112549901)

1. Basic SPA

   This SPA demonstrates using PingAccess to handle authentication, session management and secret management for API calls.

2. Consent Management SPA

   This SPA demonstrates using the PD Consent API to store user intents. It's using PingAccess to handle sessions and token management with PA injecting the User Session `access_token` into the Consent API calls so that they are given the proper context.

3. Utile SPA

   Utile aims to be a simple yet powerful data management tool both useful as a demonstration of the power PingAccess SPA support and as a tool to look at and update data in PingDirectory without having to shell into containers and use the LDAP command-line tools.

4. PF Authentication Widget

   This app is used in conjunction with PingFederate to demonstrate both the Authentication API and the associated JS Widget:

   [Source - GitHub](https://github.com/pingidentity/pf-authn-js-widget)

5. Consent Enforcement SPA

   This SPA demostrates the PingAccess integration with the PF AuthN Widget for logon, and with PingAuthorize to enforce the Consent records created in the Consent Mangement SPA.

6. ZeroTrust

   This app is a PF Agentless integration that comes from PF and performs a call to Opswat to retrieve the local deviceId before returning to PF

## Contributors

- Chris Price - cprice@pingidentity.com
- Arnaud Lacour - arno@pingidentity.com

## Docker

To build and run this application in a Docker container:

```bash
docker build -t facile-apps .
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e riskEnvId=<your_riskEnvId> \
  -e riskClientId=<your_riskClientId> \
  -e riskClientSecret=<your_riskClientSecret> \
  -e skCompanyId=<your_skCompanyId> \
  -e skApiKey=<your_skApiKey> \
  -e pfAdapterUser=<your_pfAdapterUser> \
  -e pfAdapterPwd=<your_pfAdapterPwd> \
  facile-apps
```
