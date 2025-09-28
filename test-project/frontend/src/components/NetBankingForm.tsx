import React, { useState } from "react";

interface Props {
  currencies?: { ticker: string; name: string }[];
  onSelect: (data: { amount: string; currency: string; bank: string; accountName: string }) => void;
}

const sampleBanks = ["Bank A", "Bank B", "Bank C"];

const NetBankingForm: React.FC<Props> = ({ currencies = [{ticker:"USD",name:"USD"}], onSelect }) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0].ticker);
  const [bank, setBank] = useState(sampleBanks[0]);
  const [accountName, setAccountName] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter valid amount";
    if (!accountName) e.accountName = "Account name required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    onSelect({ amount, currency, bank, accountName });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">NetBanking</h2>

      <label>
        Amount:
        <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 10.00"/>
        {errors.amount && <div className="error">{errors.amount}</div>}
      </label>

      <label>
        Currency:
        <select value={currency} onChange={e=>setCurrency(e.target.value)}>
          {currencies.map(c => <option key={c.ticker} value={c.ticker}>{c.name} ({c.ticker})</option>)}
        </select>
      </label>

      <label>
        Bank:
        <select value={bank} onChange={e=>setBank(e.target.value)}>
          {sampleBanks.map(b=> <option key={b} value={b}>{b}</option>)}
        </select>
      </label>

      <label>
        Account / Cardholder name:
        <input value={accountName} onChange={e=>setAccountName(e.target.value)} placeholder="Full name"/>
        {errors.accountName && <div className="error">{errors.accountName}</div>}
      </label>

      <div style={{display:"flex", gap:8}}>
        <button type="submit" className="submit-btn">Continue</button>
      </div>
    </form>
  );
};

export default NetBankingForm;
