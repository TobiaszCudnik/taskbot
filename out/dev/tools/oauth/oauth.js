System.register("../../../../dev/tools/oauth/oauth", [], function() {
  "use strict";
  var __moduleName = "../../../../dev/tools/oauth/oauth";
  var readline = require('readline');
  var google = require('googleapis');
  var OAuth2Client = google.auth.OAuth2;
  var plus = google.plus('v1');
  var CLIENT_ID = "900809192866-270pemf710e7me8l9aaptsirjmkvit66.apps.googleusercontent.com";
  var CLIENT_SECRET = "TohSI-VXNRKKNq0cYTkS72S6";
  var REDIRECT_URL = 'https://alaihi-macuca.codio.io/oauth2callback';
  var SCOPES = ['https://www.googleapis.com/auth/tasks'];
  var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Visit the url: ', url + "&approval_prompt=force");
  rl.question('Enter the code here:', function(code) {
    oauth2Client.getToken(code, function(err, tokens) {
      console.log(tokens);
      oauth2Client.setCredentials(tokens);
    });
  });
  return {};
});
System.get("../../../../dev/tools/oauth/oauth" + '');
