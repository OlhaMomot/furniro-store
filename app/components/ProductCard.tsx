import {getAdjacentAndFirstAvailableVariants, getProductOptions, useOptimisticVariant} from '@shopify/hydrogen';
import {ProductForm} from './ProductForm';

export function ProductCard({product}) {
  console.log('PRODUCT COMING TO PRODUCT CARD:', product);
  const variant = product.variants[0];
  const selectedVariant = useOptimisticVariant(
    variant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  console.log('OPTIONS:', productOptions);
  console.log('SELECTED:', selectedVariant);
  return (
    <div className="flex flex-col relative group">
      <div className="opacity-0 group-hover:opacity-100 flex absolute top-0 bottom-0 left-0 right-0 z-[1] items-center justify-center transition-all">
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-[#3A3A3A] opacity-60"></div>
        <div className="relative z-10">
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
        </div>
      </div>

      <img src={product.featuredImage.url} alt={product.featuredImage.altText} />
      <div className="h-full flex flex-col justify-between bg-[#F4F5F7] p-[16px]">
        <h5 className="mb-[8px] color-[#3A3A3A] text-[24px] leading-[120%] font-semibold">
          {product.title}
        </h5>
        {product.metafield?.value && (
          <span className="block text-[#3A3A3A] text-[16px] leading-[120%] mb-[8px]">
            {product.metafield.value}
          </span>
        )}
        <div className="flex justify-between">
          <div className="flex gap-[4px] text-[20px] leading-[150%] font-semibold text-[#3A3A3A]">
            <span>{selectedVariant.price.amount}</span>
            <span>{selectedVariant.price.currencyCode}</span>
          </div>

          {selectedVariant.compareAtPrice?.amount > selectedVariant.price?.amount && (
            <div className="flex gap-[4px] text-[16px] leading-[150%] text-[#B0B0B0]">
              <span>{selectedVariant.compareAtPrice.amount}</span>
              <span>{selectedVariant.compareAtPrice.currencyCode}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
