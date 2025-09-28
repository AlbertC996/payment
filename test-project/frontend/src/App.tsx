import { useState } from "react";
import CurrenciesPage from "./pages/CurrenciesPage";
import TransactionPage from "./pages/TransactionPage";
import "./app.css";

function App() {
  const [page, setPage] = useState<"home" | "currencies" | "transaction">("home");

  if (page === "currencies") return <CurrenciesPage goBack={() => setPage("home")} />;
  if (page === "transaction") return <TransactionPage goBack={() => setPage("home")} />;

  return (
    <div className="page-container">
      <h1>Payment demo</h1>
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setPage("currencies")} className="btn">View Currencies</button>
        <button onClick={() => setPage("transaction")} className="btn" style={{ marginLeft: 12 }}>Test Transaction</button>
      </div>
    </div>
  );
}

export default App;
