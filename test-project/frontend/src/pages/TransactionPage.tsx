import React from "react";
import TransactionForm from "../components/TransactionForm";

interface Props { goBack: () => void }

const TransactionPage: React.FC<Props> = ({ goBack }) => {
  return (
    <div className="page-container">
      <button className="back-btn" onClick={goBack}>← Back</button>
      <h2>Test Transaction</h2>
      <p style={{ color: "#bbb" }}>Fill mock fiat fields (for demo) and wallet address for crypto payout.</p>
      <TransactionForm />
    </div>
  );
};

export default TransactionPage;
