import React, { useState } from "react";

type CardData = {
  amount: string;
  currency: string;
  bank?: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
};

interface Props {
  currencies: { ticker: string; name: string }[];
  onSubmit: (data: CardData) => void;
}

const banks = [
  "Bank A",
  "Bank B",
  "Bank C",
  "Other"
];

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

const PaymentForm: React.FC<Props> = ({ currencies, onSubmit }) => {
  const [step, setStep] = useState<number>(1);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0]?.ticker || "");
  const [bank, setBank] = useState(banks[0]);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validateStep1 = () => {
    const e: Record<string,string> = {};
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) e.amount = "Enter a valid amount";
    if (!currency) e.currency = "Choose currency";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateCard = () => {
    const e: Record<string,string> = {};
    const digits = onlyDigits(cardNumber);
    if (digits.length !== 16) e.cardNumber = "Card number must be 16 digits";
    const mm = parseInt(expiryMonth, 10);
    const yy = parseInt(expiryYear, 10);
    if (!mm || mm < 1 || mm > 12) e.expiryMonth = "Invalid month";
    if (!yy || yy < new Date().getFullYear() % 100) {
      // if year less than current two-digit year -> invalid
      // allow equal or greater
      // Note: simple check
      e.expiryYear = "Invalid year";
    }
    if (!/^\d{3,4}$/.test(cvc)) e.cvc = "Invalid CVC";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmitCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;
    const payload: CardData = {
      amount,
      currency,
      bank,
      cardNumber: onlyDigits(cardNumber),
      expiryMonth,
      expiryYear,
      cvc
    };
    onSubmit(payload);
  };

  return (
    <div className="payment-form">
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); handleNextFromStep1(); }}>
          <h2 className="form-title">Payment — Step 1</h2>
          <label>
            Amount (fiat):
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 10.00"
            />
            {errors.amount && <div className="error">{errors.amount}</div>}
          </label>

          <label>
            Currency:
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {currencies.map(c => <option key={c.ticker} value={c.ticker}>{c.name} ({c.ticker})</option>)}
            </select>
            {errors.currency && <div className="error">{errors.currency}</div>}
          </label>

          <div style={{display: "flex", gap: 8}}>
            <button type="submit" className="submit-btn">Next</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
          <h2 className="form-title">Payment — Step 2 (Choose bank)</h2>
          <label>
            Bank (for card processing):
            <select value={bank} onChange={(e) => setBank(e.target.value)}>
              {banks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>

          <div style={{display: "flex", gap: 8}}>
            <button type="button" onClick={() => setStep(1)} className="back-btn">Back</button>
            <button type="submit" className="submit-btn">Next</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmitCard}>
          <h2 className="form-title">Payment — Step 3 (Card info)</h2>

          <label>
            Card number:
            <input
              value={formatCardNumber(cardNumber)}
              onChange={(e) => {
                const raw = onlyDigits(e.target.value).slice(0,16);
                setCardNumber(raw);
              }}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
            />
            {errors.cardNumber && <div className="error">{errors.cardNumber}</div>}
          </label>

          <div className="form-row">
            <div style={{flex:1}}>
              <label>
                Expiry month:
                <select value={expiryMonth} onChange={(e)=>setExpiryMonth(e.target.value)}>
                  <option value="">MM</option>
                  {Array.from({length:12},(_,i)=>i+1).map(m=>(
                    <option key={m} value={String(m).padStart(2,'0')}>{String(m).padStart(2,'0')}</option>
                  ))}
                </select>
                {errors.expiryMonth && <div className="error">{errors.expiryMonth}</div>}
              </label>
            </div>

            <div style={{flex:1}}>
              <label>
                Expiry year:
                <select value={expiryYear} onChange={(e)=>setExpiryYear(e.target.value)}>
                  <option value="">YY</option>
                  {Array.from({length:12},(_,i)=>i+new Date().getFullYear()%100).map(y=>(
                    <option key={y} value={String(y).padStart(2,'0')}>{String(y).padStart(2,'0')}</option>
                  ))}
                </select>
                {errors.expiryYear && <div className="error">{errors.expiryYear}</div>}
              </label>
            </div>
          </div>

          <label>
            CVC:
            <input
              value={cvc}
              onChange={(e)=>setCvc(onlyDigits(e.target.value).slice(0,4))}
              placeholder="123"
              inputMode="numeric"
            />
            {errors.cvc && <div className="error">{errors.cvc}</div>}
          </label>

          <div style={{display: "flex", gap: 8}}>
            <button type="button" onClick={() => setStep(2)} className="back-btn">Back</button>
            <button type="submit" className="submit-btn">Pay</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentForm;
