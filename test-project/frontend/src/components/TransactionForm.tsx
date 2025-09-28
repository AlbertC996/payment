import React, { useState } from "react";

type Method = "card" | "netbank" | "wallet";

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g, '$1 ').trim();

const TransactionForm: React.FC = () => {
  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    setError(null);
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return "Invalid amount";
    if (!wallet) return "Wallet address is required (where crypto will be sent)";
    if (method === "card") {
      const digits = card.replace(/\s/g, '');
      if (digits.length !== 16) return "Card number must be 16 digits";
      const m = parseInt(month,10);
      const y = parseInt(year,10);
      if (!m || m < 1 || m > 12) return "Invalid expiry month";
      if (!y || y < new Date().getFullYear() % 100) return "Invalid expiry year";
      if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3 or 4 digits";
    }
    if (method === "netbank" && !bank) return "Please select a bank";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Build convert request for ChangeNOW:
      // for demo we use simple mapping: from fiat -> to USDT (example)
      const payload = {
        from: "usd",          // placeholder: ChangeNOW expects crypto tickers; for demo backend can handle
        to: "usdt",          // target crypto
        amount: parseFloat(amount),
        address: wallet,
      };

      const res = await fetch('/changenow/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server ${res.status}: ${txt}`);
      }

      const data = await res.json();
      setResult(JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <label style={{ flex: 1 }}>
          Amount (fiat)
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1.00" />
        </label>
        <label style={{ flex: 1 }}>
          Wallet (crypto receive)
          <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="wallet address" />
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Method:
          <select value={method} onChange={(e) => setMethod(e.target.value as Method)} style={{ marginLeft: 8 }}>
            <option value="card">Card</option>
            <option value="netbank">NetBanking</option>
            <option value="wallet">Just Wallet (no fiat)</option>
          </select>
        </label>
      </div>

      {method === "card" && (
        <>
          <div className="form-row card-inputs">
            <input
              placeholder="Card number"
              value={card}
              onChange={(e) => setCard(formatCard(e.target.value))}
              maxLength={19}
            />
          </div>
          <div className="form-row">
            <input placeholder="MM" value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g,'').slice(0,2))} />
            <input placeholder="YY" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g,'').slice(0,2))} />
            <input placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} />
          </div>
        </>
      )}

      {method === "netbank" && (
        <div className="form-row">
          <select value={bank} onChange={(e) => setBank(e.target.value)}>
            <option value="">Select bank</option>
            <option value="boa">Bank Of America</option>
            <option value="jpm">JPMorgan Chase</option>
            <option value="wells">Wells Fargo</option>
            <option value="citi">Citigroup</option>
          </select>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Processing..." : "Start Test (mock)"}
      </button>

      {error && <div className="error">{error}</div>}
      {result && <div className="success-msg">Result: <pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre></div>}
    </form>
  );
};

export default TransactionForm;
