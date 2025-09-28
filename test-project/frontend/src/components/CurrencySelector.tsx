interface CurrencySelectorProps {
  label: string;
  currencies: { ticker: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ label, currencies, value, onChange }) => {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>
        {label}:
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select currency</option>
          {currencies.map((cur) => (
            <option key={cur.ticker} value={cur.ticker}>
              {cur.name} ({cur.ticker})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default CurrencySelector;
