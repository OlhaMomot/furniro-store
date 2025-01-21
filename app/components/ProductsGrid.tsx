import { ProductCard } from "./ProductCard";

export function ProductsGrid({products}) {
  return (
    <div className="mb-[64px]">
      <h4 className="mb-[32px] color-[#3A3A3A] text-[40px] leading-[120%] font-bold text-center">Our Products</h4>
      <div className="mx-[100px] mb-[32px] grid grid-cols-4 gap-[32px]">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <a
        href="/collections/furniture"
        className="h-[48px] w-[245px] m-auto flex items-center justify-center text-[16px] font-semibold text-[#B88E2F] border border-solid border-[#B88E2F]"
      >
        Show more
      </a>
    </div>
  );
}
