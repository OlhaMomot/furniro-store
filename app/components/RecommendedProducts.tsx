import { Link } from "@remix-run/react";
import { Image, Money } from "@shopify/hydrogen";
import { ProductCard } from "./ProductCard";

export function RecommendedProducts({products}) {
  return (
    <div className="recommended-products max-w-[1440px] m-auto px-[100px]">
      <h2 className="text-[36px] text-center mb-[26px]">Related Products</h2>
      <div className="recommended-products-grid">
        {products.map((product) => (
          // <ProductCard key={product.id} product={product} />
          <Link
            key={product.id}
            className="recommended-product"
            to={`/products/${product.handle}`}
          >
            <Image
              data={product.images.nodes[0]}
              aspectRatio="1/1"
              sizes="(min-width: 45em) 20vw, 50vw"
            />
            <div className="bg-[#F4F5F7] p-4">
              <h4>{product.title}</h4>
              <small>
                <Money data={product.priceRange.minVariantPrice} />
              </small>
            </div>
          </Link>
        ))}
      </div>
      <br />
    </div>
  );
}
