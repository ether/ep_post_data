var API = require('../../src/node/db/API.js');
var randomString = require('../../src/static/js/pad_utils').randomString;
// var bodyParser = require('body-parser');

exports.registerRoute = function (hook_name, args, callback) {
  args.app.post('/post', function(req, res) {
    var padId = randomString(8);
    var content = '';
    var fullUrl = req.protocol + '://' + req.get('host');

    req.on('data', function (data) {
      // Append data.
      content += data;
    });

    req.on('end', function () {
      API.createPad(padId, content, function(err, d){
        if(err){
          res.send("Error", err);
        }else{
          res.send("Pad Created: "+fullUrl+"/p/"+padId + " ");
        }
      });
    });

  });
}
