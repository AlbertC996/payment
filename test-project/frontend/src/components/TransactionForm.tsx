import { useState } from "react";
import CurrencySelector from "./CurrencySelector";

interface Currency {
  ticker: string;
  name: string;
}

interface Props {
  currencies: Currency[];
}

const TransactionForm: React.FC<Props> = ({ currencies }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !amount) {
      setError("Please select currencies and enter amount");
      return;
    }
    if (from === to) {
      setError("From and To currencies cannot be the same");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    setTimeout(() => {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Invalid amount");
        setLoading(false);
        return;
      }
      const estimatedAmount = (amountNum * 0.98).toFixed(6); // 2% fee mock
      setResult(`Estimated received: ${estimatedAmount} ${to}`);
      setLoading(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CurrencySelector label="From" currencies={currencies} value={from} onChange={setFrom} />
      <CurrencySelector label="To" currencies={currencies} value={to} onChange={setTo} />
      <div style={{ marginBottom: "10px" }}>
        <label>
          Amount:
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Estimate Transaction"}
      </button>
      {error && <p className="error-msg">{error}</p>}
      {result && <p className="success-msg">{result}</p>}
    </form>
  );
};

export default TransactionForm;
