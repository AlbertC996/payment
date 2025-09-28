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
      <h1>Crypto Demo App</h1>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setPage("currencies")} style={{ marginRight: "10px" }}>
          View Currencies
        </button>
        <button onClick={() => setPage("transaction")}>
          Test Transaction
        </button>
      </div>
    </div>
  );
}

export default App;
