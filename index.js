var API = require('ep_etherpad-lite/node/db/API.js');
var randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

exports.registerRoute = function (hook_name, args, callback) {
  args.app.post('/post', function(req, res) {
    var padId = req.headers['x-pad-id'];
    if (padId == undefined) {
      padId = randomString(8);
    }
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
