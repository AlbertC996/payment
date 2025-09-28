import React, { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import PaymentForm from "../components/PaymentForm";
import NetBankingForm from "../components/NetBankingForm";

interface Props {
  goBack: () => void;
}

type Method = "crypto" | "card" | "netbanking";

const TransactionPage: React.FC<Props> = ({ goBack }) => {
  const [method, setMethod] = useState<Method>("crypto");
  const [result, setResult] = useState<any>(null);

  const currencies = [
    { ticker: "BTC", name: "Bitcoin" },
    { ticker: "ETH", name: "Ethereum" },
    { ticker: "USDT", name: "Tether" },
    { ticker: "XRP", name: "Ripple" }
  ];

  const handleSubmit = (data: any) => {
    console.log("Submitted:", data);
    setResult(data);
  };

  return (
    <div className="page-container">
      <button onClick={goBack} className="back-btn">Back</button>
      <h1>Test Transaction</h1>

      <div className="payment-methods">
        <button className={method === "crypto" ? "active" : ""} onClick={() => setMethod("crypto")}>Crypto</button>
        <button className={method === "card" ? "active" : ""} onClick={() => setMethod("card")}>Card</button>
        <button className={method === "netbanking" ? "active" : ""} onClick={() => setMethod("netbanking")}>NetBanking</button>
      </div>

      <div className="transaction-container">
        {method === "crypto" && <TransactionForm currencies={currencies} />}
        {method === "card" && <PaymentForm currencies={currencies} onSubmit={handleSubmit} />}
        {method === "netbanking" && <NetBankingForm currencies={currencies} onSelect={handleSubmit} />}
      </div>

      {result && (
        <div className="success-msg">
          <h3>Submitted Data</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
