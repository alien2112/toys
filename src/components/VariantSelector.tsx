import React from 'react';

interface VariantOption {
  id: number;
  variant_type_id: number;
  value: string;
  slug: string;
  type_name: string;
}

interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
  variant_options: VariantOption[];
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantSelect,
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  // Group variants by their options for easier selection
  const getVariantGroups = () => {
    const groups: { [key: string]: ProductVariant[] } = {};
    
    variants.forEach(variant => {
      const key = variant.variant_options
        .map(opt => `${opt.type_name}:${opt.value}`)
        .sort()
        .join(' | ');
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(variant);
    });

    return groups;
  };

  const variantGroups = getVariantGroups();
  const activeVariants = variants.filter(v => v.is_active);

  if (activeVariants.length === 0) {
    return (
      <div className="variant-selector">
        <div className="text-red-600 text-sm">
          لا توجد متغيرات متاحة حالياً
        </div>
      </div>
    );
  }

  // Get unique variant types
  const variantTypes = Array.from(
    new Set(
      activeVariants.flatMap(v => v.variant_options.map(opt => opt.type_name))
    )
  );

  const getOptionsForType = (typeName: string) => {
    const options = Array.from(
      new Set(
        activeVariants
          .flatMap(v => v.variant_options)
          .filter(opt => opt.type_name === typeName)
          .map(opt => opt.value)
      )
    );
    return options;
  };

  const findVariantByOptions = (selectedOptions: { [key: string]: string }) => {
    return activeVariants.find(variant => {
      const variantOptions = variant.variant_options.reduce((acc, opt) => {
        acc[opt.type_name] = opt.value;
        return acc;
      }, {} as { [key: string]: string });

      return Object.entries(selectedOptions).every(
        ([type, value]) => variantOptions[type] === value
      );
    });
  };

  const handleOptionChange = (typeName: string, value: string) => {
    // Get current selected options
    const currentOptions: { [key: string]: string } = {};
    
    // This would need to be managed in parent component state
    // For now, let's find a variant that matches this option
    const matchingVariant = activeVariants.find(v => 
      v.variant_options.some(opt => opt.type_name === typeName && opt.value === value)
    );

    if (matchingVariant) {
      onVariantSelect(matchingVariant);
    }
  };

  return (
    <div className="variant-selector space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">اختر المتغير:</h3>
      
      {variantTypes.map(typeName => (
        <div key={typeName} className="variant-type">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {typeName}
          </label>
          <div className="flex flex-wrap gap-2">
            {getOptionsForType(typeName).map(value => {
              const isOptionSelected = selectedVariant?.variant_options.some(
                opt => opt.type_name === typeName && opt.value === value
              );
              const isOptionAvailable = activeVariants.some(v =>
                v.variant_options.some(opt => opt.type_name === typeName && opt.value === value)
              );

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOptionChange(typeName, value)}
                  disabled={!isOptionAvailable}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isOptionSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : isOptionAvailable
                      ? 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedVariant && (
        <div className="selected-variant-info mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-600">SKU: {selectedVariant.sku}</div>
              <div className="text-sm text-gray-600">
                الخصائص: {selectedVariant.variant_options
                  .map(opt => `${opt.type_name}: ${opt.value}`)
                  .join(', ')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {selectedVariant.price} د.ك
              </div>
              <div className={`text-sm ${
                selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedVariant.stock > 0 
                  ? `متوفر (${selectedVariant.stock} قطعة)` 
                  : 'غير متوفر'
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
