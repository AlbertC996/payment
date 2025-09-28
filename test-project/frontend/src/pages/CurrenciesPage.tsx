import { useEffect, useState } from "react";
import "../app.css";

interface Currency {
  ticker: string;
  name: string;
  image: string;
}

interface Props {
  goBack: () => void;
}

const CurrenciesPage: React.FC<Props> = ({ goBack }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch('/changenow/currencies');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Currency[] = await res.json();
        setCurrencies(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  if (loading) return <div className="page-container">Loading currencies...</div>;
  if (error) return <div className="page-container">Error: {error}</div>;

  return (
    <div className="page-container">
      <button onClick={goBack} className="back-button">Back</button>
      <h1>Available Currencies</h1>
      <ul className="currency-list">
        {currencies.map((currency) => (
          <li key={currency.ticker}>
            <img src={currency.image} alt={currency.name} width={32} height={32} />
            {currency.name} ({currency.ticker})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrenciesPage;
