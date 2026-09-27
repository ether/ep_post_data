import {expect, test} from '@playwright/test';
import {getPadBody, goToNewPad} from 'ep_etherpad-lite/tests/frontend-new/helper/padHelper';

test.beforeEach(async ({page}) => {
  await goToNewPad(page);
});

const getPadIdFromUrl = (url: string) => {
  const match = /\/p\/([^/?#]+)/.exec(url);
  if (!match) throw new Error(`Failed to parse pad id from URL: ${url}`);
  return match[1];
};

const absoluteUrl = (pageUrl: string, path: string) => new URL(path, pageUrl).toString();

test.describe('ep_post_data', () => {
  test('pad loads with plugin installed', async ({page}) => {
    const padBody = await getPadBody(page);
    await expect(padBody).toBeVisible();
  });

  test('PATCH /post appends text to an existing pad', async ({page}) => {
    const pageUrl = page.url();
    const padId = getPadIdFromUrl(pageUrl);
    const postUrl = absoluteUrl(pageUrl, '/post');

    const postResponse = await page.request.post(postUrl, {
      headers: {'X-PAD-ID': padId},
      data: 'first',
    });
    expect(postResponse.ok()).toBeTruthy();

    const patchResponse = await page.request.fetch(postUrl, {
      method: 'PATCH',
      headers: {'X-PAD-ID': padId},
      data: ' second',
    });
    expect(patchResponse.ok()).toBeTruthy();

    const txtResponse = await page.request.get(absoluteUrl(pageUrl, `/p/${padId}/export/txt`));
    expect(txtResponse.ok()).toBeTruthy();
    expect((await txtResponse.text()).trimEnd()).toBe('first second');
  });

  test('PATCH /post creates pad when it does not exist', async ({page}) => {
    const pageUrl = page.url();
    const padId = `ep-post-data-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const patchResponse = await page.request.fetch(absoluteUrl(pageUrl, '/post'), {
      method: 'PATCH',
      headers: {'X-PAD-ID': padId},
      data: 'created via patch',
    });
    expect(patchResponse.ok()).toBeTruthy();

    const txtResponse = await page.request.get(absoluteUrl(pageUrl, `/p/${padId}/export/txt`));
    expect(txtResponse.ok()).toBeTruthy();
    expect((await txtResponse.text()).trimEnd()).toBe('created via patch');
  });
});
