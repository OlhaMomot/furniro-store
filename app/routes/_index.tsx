// import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
// import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
// import {Suspense} from 'react';
// import {Image, Money} from '@shopify/hydrogen';
// import type {
//   FeaturedCollectionFragment,
//   RecommendedProductsQuery,
// } from 'storefrontapi.generated';

// export const meta: MetaFunction = () => {
//   return [{title: 'Hydrogen | Home'}];
// };

// export async function loader(args: LoaderFunctionArgs) {
//   // Start fetching non-critical data without blocking time to first byte
//   const deferredData = loadDeferredData(args);

//   // Await the critical data required to render initial state of the page
//   const criticalData = await loadCriticalData(args);

//   return defer({...deferredData, ...criticalData});
// }

// /**
//  * Load data necessary for rendering content above the fold. This is the critical data
//  * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
//  */
// async function loadCriticalData({context}: LoaderFunctionArgs) {
//   const [{collections}] = await Promise.all([
//     context.storefront.query(FEATURED_COLLECTION_QUERY),
//     // Add other queries here, so that they are loaded in parallel
//   ]);

//   return {
//     featuredCollection: collections.nodes[0],
//   };
// }

// /**
//  * Load data for rendering content below the fold. This data is deferred and will be
//  * fetched after the initial page load. If it's unavailable, the page should still 200.
//  * Make sure to not throw any errors here, as it will cause the page to 500.
//  */
// function loadDeferredData({context}: LoaderFunctionArgs) {
//   const recommendedProducts = context.storefront
//     .query(RECOMMENDED_PRODUCTS_QUERY)
//     .catch((error) => {
//       // Log query errors, but don't throw them so the page can still render
//       console.error(error);
//       return null;
//     });

//   return {
//     recommendedProducts,
//   };
// }

// export default function Homepage() {
//   const data = useLoaderData<typeof loader>();
//   return (
//     <div className="home">
//       <FeaturedCollection collection={data.featuredCollection} />
//       <RecommendedProducts products={data.recommendedProducts} />
//     </div>
//   );
// }

// function FeaturedCollection({
//   collection,
// }: {
//   collection: FeaturedCollectionFragment;
// }) {
//   if (!collection) return null;
//   const image = collection?.image;
//   return (
//     <Link
//       className="featured-collection"
//       to={`/collections/${collection.handle}`}
//     >
//       {image && (
//         <div className="featured-collection-image">
//           <Image data={image} sizes="100vw" />
//         </div>
//       )}
//       <h1>{collection.title}</h1>
//     </Link>
//   );
// }

// function RecommendedProducts({
//   products,
// }: {
//   products: Promise<RecommendedProductsQuery | null>;
// }) {
//   return (
//     <div className="recommended-products">
//       <h2>Recommended Products</h2>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Await resolve={products}>
//           {(response) => (
//             <div className="recommended-products-grid">
//               {response
//                 ? response.products.nodes.map((product) => (
//                     <Link
//                       key={product.id}
//                       className="recommended-product"
//                       to={`/products/${product.handle}`}
//                     >
//                       <Image
//                         data={product.images.nodes[0]}
//                         aspectRatio="1/1"
//                         sizes="(min-width: 45em) 20vw, 50vw"
//                       />
//                       <h4>{product.title}</h4>
//                       <small>
//                         <Money data={product.priceRange.minVariantPrice} />
//                       </small>
//                     </Link>
//                   ))
//                 : null}
//             </div>
//           )}
//         </Await>
//       </Suspense>
//       <br />
//     </div>
//   );
// }

// const FEATURED_COLLECTION_QUERY = `#graphql
//   fragment FeaturedCollection on Collection {
//     id
//     title
//     image {
//       id
//       url
//       altText
//       width
//       height
//     }
//     handle
//   }
//   query FeaturedCollection($country: CountryCode, $language: LanguageCode)
//     @inContext(country: $country, language: $language) {
//     collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
//       nodes {
//         ...FeaturedCollection
//       }
//     }
//   }
// ` as const;

// const RECOMMENDED_PRODUCTS_QUERY = `#graphql
//   fragment RecommendedProduct on Product {
//     id
//     title
//     handle
//     priceRange {
//       minVariantPrice {
//         amount
//         currencyCode
//       }
//     }
//     images(first: 1) {
//       nodes {
//         id
//         url
//         altText
//         width
//         height
//       }
//     }
//   }
//   query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
//     @inContext(country: $country, language: $language) {
//     products(first: 4, sortKey: UPDATED_AT, reverse: true) {
//       nodes {
//         ...RecommendedProduct
//       }
//     }
//   }
// ` as const;

import { Link, useLoaderData } from "@remix-run/react";
import { json, type LoaderFunctionArgs } from "@remix-run/server-runtime";
import { Product } from "@shopify/hydrogen/storefront-api-types";
import { type SanityDocument } from "hydrogen-sanity";
import { groq } from "hydrogen-sanity/groq";
import { Grid } from "~/components/Grid";
import { HeroComponent } from "~/components/HeroComponent";
import { ProductsGrid } from "~/components/ProductsGrid";

export async function loader({
  params,
  context: {sanity, storefront},
}: LoaderFunctionArgs) {
  const sanityQuery = groq`
    *[_type == "home"][0]{
      hero {
        title,
        description,
        link,
        "imageUrl": image.asset->url,
      },
      collectionGrid {
        title,
        description,
        content[] {
          "imageUrl": image.asset -> url,
          link
        }
      },
      products[]->
    }
  `;

  const initial = await sanity.loadQuery<SanityDocument>(sanityQuery, params);

  const productHandles =
    initial?.data.products?.map((product) => product.store?.slug?.current) || [];

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

  const shopifyProducts = await Promise.all(
    productHandles.map(async (handle) => {
      try {
        const { productByHandle } = await storefront.query<{ productByHandle: Product }>(
          SHOPIFY_PRODUCT_QUERY,
          { variables: { handle } }
        );

        // Transform the product data to match the expected structure.
        return {
          ...productByHandle,
          variants: productByHandle.variants?.edges?.map((edge) => edge.node),
        };
      } catch (error) {
        console.error(`Error fetching product with handle ${handle}:`, error);
        return null;
      }
    }),
  );

  return json({initial, productHandles, shopifyProducts});
}

export default function Index() {
  const {initial, productHandles, shopifyProducts} = useLoaderData<typeof loader>();

  const heroSection = initial?.data?.hero;
  const gridItems = initial?.data?.collectionGrid;

  return (
    <div className="prose prose-xl prose-a:text-blue-500">
      <h1 className="text-3xl font-bold">Home</h1>
      <p>
        <Link className="text-blue-500 underline" to="/products">
          All Products
        </Link>
      </p>

      {heroSection && <HeroComponent hero={heroSection} />}
      {gridItems && <Grid grid={gridItems} />}
      {shopifyProducts && <ProductsGrid products={shopifyProducts} />}
    </div>
  );
}
