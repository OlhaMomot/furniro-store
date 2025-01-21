// import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
// import {useLoaderData, type MetaFunction} from '@remix-run/react';
// import {
//   getSelectedProductOptions,
//   Analytics,
//   useOptimisticVariant,
//   getProductOptions,
//   getAdjacentAndFirstAvailableVariants,
//   useSelectedOptionInUrlParam,
// } from '@shopify/hydrogen';
// import {ProductPrice} from '~/components/ProductPrice';
// import {ProductImage} from '~/components/ProductImage';
// import {ProductForm} from '~/components/ProductForm';

// export const meta: MetaFunction<typeof loader> = ({data}) => {
//   return [
//     {title: `Hydrogen | ${data?.product.title ?? ''}`},
//     {
//       rel: 'canonical',
//       href: `/products/${data?.product.handle}`,
//     },
//   ];
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
// async function loadCriticalData({
//   context,
//   params,
//   request,
// }: LoaderFunctionArgs) {
//   const {handle} = params;
//   const {storefront} = context;

//   if (!handle) {
//     throw new Error('Expected product handle to be defined');
//   }

//   const [{product}] = await Promise.all([
//     storefront.query(PRODUCT_QUERY, {
//       variables: {handle, selectedOptions: getSelectedProductOptions(request)},
//     }),
//     // Add other queries here, so that they are loaded in parallel
//   ]);

//   if (!product?.id) {
//     throw new Response(null, {status: 404});
//   }

//   return {
//     product,
//   };
// }

// /**
//  * Load data for rendering content below the fold. This data is deferred and will be
//  * fetched after the initial page load. If it's unavailable, the page should still 200.
//  * Make sure to not throw any errors here, as it will cause the page to 500.
//  */
// function loadDeferredData({context, params}: LoaderFunctionArgs) {
//   // Put any API calls that is not critical to be available on first page render
//   // For example: product reviews, product recommendations, social feeds.

//   return {};
// }

// export default function Product() {
//   const {product} = useLoaderData<typeof loader>();

//   // Optimistically selects a variant with given available variant information
//   const selectedVariant = useOptimisticVariant(
//     product.selectedOrFirstAvailableVariant,
//     getAdjacentAndFirstAvailableVariants(product),
//   );

//   // Sets the search param to the selected variant without navigation
//   // only when no search params are set in the url
//   useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

//   // Get the product options array
//   const productOptions = getProductOptions({
//     ...product,
//     selectedOrFirstAvailableVariant: selectedVariant,
//   });

//   const {title, descriptionHtml} = product;

//   return (
//     <div className="product">
//       <ProductImage image={selectedVariant?.image} />
//       <div className="product-main">
//         <h1>{title}</h1>
//         <ProductPrice
//           price={selectedVariant?.price}
//           compareAtPrice={selectedVariant?.compareAtPrice}
//         />
//         <br />
//         <ProductForm
//           productOptions={productOptions}
//           selectedVariant={selectedVariant}
//         />
//         <br />
//         <br />
//         <p>
//           <strong>Description</strong>
//         </p>
//         <br />
//         <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
//         <br />
//       </div>
//       <Analytics.ProductView
//         data={{
//           products: [
//             {
//               id: product.id,
//               title: product.title,
//               price: selectedVariant?.price.amount || '0',
//               vendor: product.vendor,
//               variantId: selectedVariant?.id || '',
//               variantTitle: selectedVariant?.title || '',
//               quantity: 1,
//             },
//           ],
//         }}
//       />
//     </div>
//   );
// }

// const PRODUCT_VARIANT_FRAGMENT = `#graphql
//   fragment ProductVariant on ProductVariant {
//     availableForSale
//     compareAtPrice {
//       amount
//       currencyCode
//     }
//     id
//     image {
//       __typename
//       id
//       url
//       altText
//       width
//       height
//     }
//     price {
//       amount
//       currencyCode
//     }
//     product {
//       title
//       handle
//     }
//     selectedOptions {
//       name
//       value
//     }
//     sku
//     title
//     unitPrice {
//       amount
//       currencyCode
//     }
//   }
// ` as const;

// const PRODUCT_FRAGMENT = `#graphql
//   fragment Product on Product {
//     id
//     title
//     vendor
//     handle
//     descriptionHtml
//     description
//     encodedVariantExistence
//     encodedVariantAvailability
//     options {
//       name
//       optionValues {
//         name
//         firstSelectableVariant {
//           ...ProductVariant
//         }
//         swatch {
//           color
//           image {
//             previewImage {
//               url
//             }
//           }
//         }
//       }
//     }
//     selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
//       ...ProductVariant
//     }
//     adjacentVariants (selectedOptions: $selectedOptions) {
//       ...ProductVariant
//     }
//     seo {
//       description
//       title
//     }
//   }
//   ${PRODUCT_VARIANT_FRAGMENT}
// ` as const;

// const PRODUCT_QUERY = `#graphql
//   query Product(
//     $country: CountryCode
//     $handle: String!
//     $language: LanguageCode
//     $selectedOptions: [SelectedOptionInput!]!
//   ) @inContext(country: $country, language: $language) {
//     product(handle: $handle) {
//       ...Product
//     }
//   }
//   ${PRODUCT_FRAGMENT}
// ` as const;

import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData} from '@remix-run/react';
import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {PortableText} from '@portabletext/react';
import type {SanityDocument} from '@sanity/client';
import {groq} from 'hydrogen-sanity/groq';
import React, {Suspense, useRef, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import '../assets/custom.css';
import {FreeMode, Navigation, Thumbs} from 'swiper/modules';
import { ProductForm } from '~/components/ProductForm';
import { getProductOptions, Money, useOptimisticVariant } from '@shopify/hydrogen';
import { getAdjacentAndFirstAvailableVariants } from '@shopify/hydrogen';
import { RecommendedProducts } from '~/components/RecommendedProducts';

export async function loader({
  params,
  context: {storefront, sanity},
}: LoaderFunctionArgs) {
  const {product} = await storefront.query<{product: Product}>(
    `#graphql
      query Product($handle: String!) {
        product(handle: $handle) { 
          id
          title
          images(first: 10) {
            edges {
              node {
                altText
                url
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
      }
    `,
    {variables: params},
  );

  const RECOMMENDED_PRODUCTS_BY_COLLECTION_QUERY = `#graphql
    query productRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 1) {
        nodes {
          id
          url
          altText
        }
      }
    }
  }
  ` as const;
  //   const RECOMMENDED_PRODUCTS_BY_COLLECTION_QUERY = `#graphql
//   query RecommendedProductsByCollection($id: ID!) {
//     product(id: $id) {
//       collections(first: 1) {
//         edges {
//           node {
//             products(first: 4) {
//               edges {
//                 node {
//                   id
//                   title
//                   handle
//                   priceRange {
//                     minVariantPrice {
//                       amount
//                       currencyCode
//                     }
//                   }
//                   images(first: 1) {
//                     nodes {
//                       id
//                       url
//                       altText
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   }
// ` as const;

  const recommendedProducts = await storefront.query(
    RECOMMENDED_PRODUCTS_BY_COLLECTION_QUERY,
    {variables: {productId: product.id}},
  );

  const query = groq`*[_type == "product" && store.slug.current == $handle][0]{
      body,
       relatedProduct->{
      "title": store.title,
      "url": "/products/" + store.slug.current
    },
      "image": store.previewImageUrl
  }`;
  const initial = await sanity.loadQuery<SanityDocument>(query, params);

  return json({product, initial, recommendedProducts});
}

export default function Page() {
  const {product, initial, recommendedProducts} = useLoaderData<typeof loader>();
  const page = initial.data;
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const variant = product.variants.edges[0].node;
  const selectedVariant = useOptimisticVariant(
    variant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  console.log("PRODUCT:", product);

  return (
    <>
      <div className="w-full px-[100px] py-[38px] bg-accent">
        <div className="max-w-[1440px] m-auto">
          <a href="/" className="after:content-['>'] after:mx-2 after:text-black text-[#9F9F9F] text-[16px]">Home</a>
          <a href="" className="after:content-['>'] after:mx-2 after:text-black text-[#9F9F9F] text-[16px]">Shop</a>
          <span className="text-[16px]">{product.title}</span>
        </div>
      </div>

      <div className="flex gap-[82px] max-w-[1440px] px-[100px] mx-auto mt-[32px]">
        <div className="flex flex-row-reverse gap-[30px]">
          <Swiper
            style={{
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#fff',
            }}
            loop={true}
            spaceBetween={10}
            navigation={false}
            thumbs={{swiper: thumbsSwiper}}
            modules={[FreeMode, Navigation, Thumbs]}
            direction="vertical"
            className="mySwiper2"
          >
            {product.images.edges.map((image) => (
              <SwiperSlide key={product.id} className="bg-accent rounded-xl">
                <img
                  alt={image.node.altText || product.title}
                  src={image.node.url}
                  className="object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <Swiper
            onSwiper={setThumbsSwiper}
            loop={true}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            direction="vertical"
            className="mySwiper"
          >
            {product.images.edges.map((image) => (
              <SwiperSlide key={image.node.url} className="bg-accent rounded-xl">
                <img
                  alt={image.node.altText || product.title}
                  src={image.node.url}
                  className="object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="">
          <h1 className="text-[42px] mb-[10px]">{product.title}</h1>

          {page?.body?.length > 0 ? <PortableText value={page.body} /> : null}

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
          <p>
            <Link to="/products">&larr; Back to All Products</Link>
          </p>
          {page.relatedProduct && (
            <p>
              <span>Complete your set:</span>
              <Link to={page.relatedProduct.url}>{page.relatedProduct.title}</Link>
            </p>
          )}
        </div>
      </div>

      <RecommendedProducts products={recommendedProducts.productRecommendations.slice(0, 4)} />
    </>
  );
}
