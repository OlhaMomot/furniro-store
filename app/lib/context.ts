import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {createSanityContext} from 'hydrogen-sanity';

export async function createAppLoadContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    i18n: {language: 'EN', country: 'US'},
    cart: {
      queryFragment: CART_QUERY_FRAGMENT,
    },
  });

  // 1. Configure the Sanity Loader and preview mode
  const sanity = createSanityContext({
    request,

    // To use the Hydrogen cache for queries
    cache,
    waitUntil,

    // Sanity client configuration
    client: {
      projectId: env.SANITY_PROJECT_ID,
      dataset: env.SANITY_DATASET || 'production',
      apiVersion: env.SANITY_API_VERSION || 'v2024-08-08',
      useCdn: process.env.NODE_ENV === 'production',
    },
  });

  // 2. Make Sanity available to loaders and actions in the request context
  return {
    ...hydrogenContext,
    sanity,
  };
};
