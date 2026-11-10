'use strict';

import {strict as assert} from 'assert';

const common = require('ep_etherpad-lite/tests/backend/common');
const padManager = require('ep_etherpad-lite/node/db/PadManager');
const {randomString} = require('ep_etherpad-lite/static/js/pad_utils');

describe(__filename, function () {
  let agent: any;

  const post = (padId: string, text: string) => agent.post('/post')
      .set('x-pad-id', padId)
      .set('Content-Type', 'text/plain')
      .send(text)
      .expect(200);

  const padText = async (padId: string) => {
    padManager.unloadPad(padId);
    return (await padManager.getPad(padId)).text();
  };

  before(async function () {
    agent = await common.init();
  });

  it('creates a pad, then replaces its text', async function () {
    const padId = `ep_post_data_${randomString(10)}`;
    await post(padId, 'first post').expect('Success creating new pad');
    assert.equal(await padText(padId), 'first post\n');
    await post(padId, 'second post').expect('Success updating pad');
    assert.equal(await padText(padId), 'second post\n');
  });

  it('imports a .etherpad export of a browser-made pad into a posted pad', async function () {
    // A browser-made pad: its first revision is written by a real author.
    const srcPadId = `ep_post_data_src_${randomString(10)}`;
    const browserAuthor = `a.${randomString(16)}`;
    await padManager.getPad(srcPadId, 'from the browser', browserAuthor);
    const exported = await agent.get(`/p/${srcPadId}/export/etherpad`)
        .set('authorization', await common.generateJWTToken())
        .buffer(true).parse((res: any, cb: any) => {
          let body = '';
          res.on('data', (chunk: string) => { body += chunk; });
          res.on('end', () => cb(null, body));
        })
        .expect(200);
    assert.match(exported.body, /from the browser/);

    // ep_post_data creates the pad through the HTTP API, so its creator is the system author.
    const padId = `ep_post_data_${randomString(10)}`;
    await post(padId, 'posted').expect('Success creating new pad');
    padManager.unloadPad(padId);
    const creator = await (await padManager.getPad(padId)).getRevisionAuthor(0);

    await agent.post(`/p/${padId}/import`)
        .set('authorization', await common.generateJWTToken())
        .attach('file', Buffer.from(exported.body), {
          filename: '/backup.etherpad',
          contentType: 'application/etherpad',
        })
        .expect(200)
        .expect((res: any) => assert.equal(res.body.message, 'ok', JSON.stringify(res.body)));

    padManager.unloadPad(padId);
    const pad = await padManager.getPad(padId);
    assert.equal(pad.text(), 'from the browser\n');
    assert.equal(await pad.getRevisionAuthor(0), creator);
  });
});
