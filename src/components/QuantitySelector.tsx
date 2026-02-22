// src/components/QuantitySelector.tsx

interface QuantitySelectorProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export const QuantitySelector = ({ value, max, onChange }: QuantitySelectorProps) => {
  const handleDecrement = () => {
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="quantity-selector">
      <button
        className="quantity-selector__button"
        onClick={handleDecrement}
        disabled={value <= 1}
        aria-label="تقليل الكمية"
      >
        -
      </button>
      <input
        type="number"
        className="quantity-selector__input"
        value={value}
        onChange={handleInputChange}
        min={1}
        max={max}
        aria-label="الكمية"
      />
      <button
        className="quantity-selector__button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="زيادة الكمية"
      >
        +
      </button>
    </div>
  );
};
