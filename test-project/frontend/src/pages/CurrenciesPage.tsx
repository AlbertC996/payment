import React, { useEffect, useState } from "react";

interface Currency {
  ticker: string;
  name: string;
  image?: string;
}

interface Props { goBack: () => void }

const CurrenciesPage: React.FC<Props> = ({ goBack }) => {
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch('/changenow/currencies');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();
        setCurrencies(data);
      } catch (err: any) {
        setError(err.message || String(err));
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
      <button className="back-btn" onClick={goBack}>← Back</button>
      <h2>Available Currencies</h2>
      <ul className="currency-list">
        {currencies && currencies.map(c => (
          <li key={c.ticker}>
            {c.image && <img src={c.image} alt={c.name} width={32} height={32} />}
            {c.name} ({c.ticker})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CurrenciesPage;
