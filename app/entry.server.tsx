import type {EntryContext, AppLoadContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  context: AppLoadContext,
) {
  const projectId = context.env.SANITY_PROJECT_ID;
  const studioHostname = context.env.SANITY_STUDIO_HOSTNAME || 'http://localhost:3333';
  const isPreviewEnabled = context.sanity.preview?.enabled;
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // If your storefront and Studio are on separate domains...
    // ...allow Sanity assets loaded from the CDN to be loaded in your storefront
    defaultSrc: ['https://cdn.sanity.io'],
    // ...allow Studio to load your storefront in Presentation's iframe
    frameAncestors: isPreviewEnabled ? [studioHostname] : undefined,
    // ...allow client-side requests for Studio to do realtime collaboration
    connectSrc: [`https://${projectId}.api.sanity.io`, `wss://${projectId}.api.sanity.io`]
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
