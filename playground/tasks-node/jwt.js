config = {}
config.apiKey = 'AIzaSyCsp7H3rxxsDAyfEAZ7uA22o5E6SBRJHV0';
config.scopes = 'https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile';
config.clientId = '511830453680.apps.googleusercontent.com';

// dependencies
var Assert = require('assert')
  , GoogleApis = require('googleapis')
  , authData = require("./authData")
  ;

// output
console.log("Auth data is: ", authData);

// set jwt data
var jwt = new GoogleApis.auth.JWT(
    authData.email
  , authData.keyFile
  , authData.key
  , authData.scopes // my scopes
  , "ionica.bizau@example.com"
);

// authorize
jwt.authorize(function (err, data) {

    // output error
    if (err) {
        console.log("Error: ", err);
        return;
    }

    /* run authorized requests */
});
