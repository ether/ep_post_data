'use strict';

const API = require('ep_etherpad-lite/node/db/API.js');
const randomString = require('ep_etherpad-lite/static/js/pad_utils').randomString;

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

exports.registerRoute = (hookName, args, callback) => {
  args.app.post('/post', (req, res) => {
    let padId = req.headers['x-pad-id'];
    if (padId === undefined) {
      padId = randomString(8);
    }
    let content = '';
    let aborted = false;

    req.on('data', (data) => {
      content += data;
      if (content.length > MAX_BODY_SIZE) {
        aborted = true;
        res.status(413).send('Request body too large');
        req.destroy();
      }
    });
    req.on('end', async () => {
      if (aborted) return;
      let padExists = true;
      try {
        padExists = await API.getText(padId, 0);
        if (padExists && padExists.text) {
          padExists = true;
        }
      } catch (e) {
        padExists = false;
      }

      // Pad does not exist so creating a new pad.
      if (!padExists) {
        try {
          console.debug('ep_post_data: Creating new pad', padId);
          await API.createPad(padId, content);
          res.send('Success creating new pad');
        } catch (e) {
          console.error('ep_post_data: Error creating pad', padId, e);
          res.send('Error creating pad');
        }
      }

      // Pad already exists so updating an existing pad.
      if (padExists) {
        try {
          console.debug('ep_post_data: Setting text!', padId, content);
          await API.setText(padId, content);
          res.send('Success updating pad');
        } catch (e) {
          console.error('ep_post_data: Error updating pad', padId, e);
          res.send('Error updating pad');
        }
      }
    });
  });
  callback();
};
