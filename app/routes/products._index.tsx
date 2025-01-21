import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData} from '@remix-run/react';
import type {Product} from '@shopify/hydrogen/storefront-api-types';

export async function loader({context: {storefront}}: LoaderFunctionArgs) {
  const {products} = await storefront.query<{products: {nodes: Product[]}}>(
    `#graphql
      query Products {
        products(first: 40) {
          nodes { id title handle }
        }
      }
    `,
  );

  if (!products.nodes.length) {
    throw new Response('Not found', {status: 404});
  }

  return json({products: products.nodes});
}

export default function Index() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto p-12 prose prose-xl prose-a:text-blue-500">
      <h1 className="text-3xl font-bold">All Products</h1>
      {products.map((product) => (
        <p key={product.id}>
          <Link to={`/products/${product.handle}`}>{product.title}</Link>
        </p>
      ))}
    </div>
  );
}
