import {defer, json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import { ProductCard } from '~/components/ProductCard';
import { PageBanner } from '~/components/PageBanner';
import { groq } from 'hydrogen-sanity/groq';
import { SanityDocument } from 'hydrogen-sanity';
import { Product } from '@shopify/hydrogen/storefront-api-types';
import { InfoBlocks } from '~/components/InfoBlocks';
import { CollectionFilter } from '~/components/CollectionFilter';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return json({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
// async function loadCriticalData({
//   context,
//   params,
//   request,
// }: LoaderFunctionArgs) {
//   const {handle} = params;
//   const {sanity, storefront} = context;
//   const paginationVariables = getPaginationVariables(request, {
//     pageBy: 4,
//   });

//   if (!handle) {
//     throw redirect('/collections');
//   }

//   const [{collection}] = await Promise.all([
//     storefront.query(COLLECTION_QUERY, {
//       variables: {handle, ...paginationVariables},
//       // Add other queries here, so that they are loaded in parallel
//     }),
//   ]);

//   if (!collection) {
//     throw new Response(`Collection ${handle} not found`, {
//       status: 404,
//     });
//   }

//   const sanityQuery = groq`
//     *[_type == "collection" && store.slug.current == $handle][0]{
//         hero {
//           title,
//           "imageUrl": image.asset ->url
//         }
//     }
//   `;

//   const initial = await sanity.loadQuery<SanityDocument>(sanityQuery, params);

//   return {
//     collection,
//     initial,
//   };
// }

async function loadCriticalData({context, params, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {sanity, storefront} = context;
  const paginationVariables = getPaginationVariables(request, {pageBy: 8});
  const url = new URL(request.url);
  const sortKey = url.searchParams.get('sortkey');
  const sortReverse = url.searchParams.get('reverse') == 'true' ? true : false;

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables, sortKey, sortReverse},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, { status: 404 });
  }

  const SHOPIFY_PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      vendor
      descriptionHtml
      description
      metafield(namespace: "custom", key: "short_description") {
        value
        type
      }
      options {
        name
        optionValues {
          name
          swatch {
            color
            image {
              previewImage {
                url
              }
            }
          }
        }
      }
      featuredImage {
        url
        altText
      }
      variants(first: 1) {
        edges {
          node {
            availableForSale
            compareAtPrice {
              amount
              currencyCode
            }
            id
            image {
              __typename
              id
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
            }
            selectedOptions {
              name
              value
            }
            sku
            title
            unitPrice {
              amount
              currencyCode
            }
          }
        }
      }
      seo {
        description
        title
      }
    }
  }
  `;

  const productsWithTransformedVariants = await Promise.all(
    collection.products.nodes.map(async (product) => {
      try {
        const {productByHandle} = await storefront.query(
          SHOPIFY_PRODUCT_QUERY,
          {
            variables: {
              handle: product.handle,
            },
        });
        return {
          ...product,
          variants: productByHandle.variants?.edges.map((edge) => edge.node),
        };
      } catch (error) {
        console.error(`Error fetching variants for product ${product.handle}:`, error);
        return product; // Return the product without transformation if there's an error
      }
    }),
  );

  const sanityQuery = groq`
    *[_type == "collection" && store.slug.current == $handle][0]{
        hero {
          title,
          "imageUrl": image.asset ->url
        },
        "infoBlocks": info[] {
          title,
          subtitle,
          "imageUrl": icon.asset ->url,
        }
    }
  `;

  const initial = await sanity.loadQuery<SanityDocument>(sanityQuery, params);

  return {
    collection: {
      ...collection,
      products: {
        ...collection.products,
        nodes: productsWithTransformedVariants,
      },
    },
    initial,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Collection() {
  const {collection, initial} = useLoaderData<typeof loader>();
  console.log('Products to render:', collection.products);

  return (
    <div className="collection">
      <PageBanner content={initial.data} title={collection.title} />
      <CollectionFilter />
      <PaginatedResourceSection
        connection={collection.products}
        resourcesClassName="grid grid-cols-4 gap-y-[40px] gap-x-[32px] mx-[100px] my-[40px]"
      >
        {({node: product, index}) => <ProductCard product={product} />}
      </PaginatedResourceSection>
      <InfoBlocks blocks={initial.data.infoBlocks} />
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4>{product.title}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    metafield(namespace: "custom", key: "short_description") {
      value
      type
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variants(first: 1) {
        edges {
          node {
            availableForSale
            compareAtPrice {
              amount
              currencyCode
            }
            id
            image {
              __typename
              id
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
            }
            selectedOptions {
              name
              value
            }
            sku
            title
            unitPrice {
              amount
              currencyCode
            }
          }
        }
      }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $sortReverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: $sortKey,
        reverse: $sortReverse
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
