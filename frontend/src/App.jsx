import { useEffect, useRef, useState } from "react";
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";

import Header from "./components/Header";
import QueryInput from "./components/QueryInput";
import ExampleQueries from "./components/ExampleQueries";
import ResultTable from "./components/ResultTable";
import ConfidenceCard from "./components/ConfidenceCard";
import LogicCard from "./components/LogicCard";
import ExplanationCard from "./components/ExplanationCard";
import LoadingState from "./components/LoadingState";
import AnalyticsChart from "./components/AnalyticsChart";
import AnalysisInsights, { buildInsight } from "./components/AnalysisInsights";
import QueryHistory from "./components/QueryHistory";
import SavedAnalyses from "./components/SavedAnalyses";
import ReportActions from "./components/ReportActions";
import DashboardOverview from "./components/DashboardOverview";

import { getOverview, submitQuery } from "./services/api";
import {
  addQueryToHistory,
  clearQueryHistory,
  deleteHistoryItem,
  getQueryHistory,
  getSavedAnalyses,
  removeSavedAnalysis,
  saveAnalysis,
} from "./services/queryStorage";


function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [queryText, setQueryText] = useState("");
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(false);
  const [history, setHistory] = useState(() => getQueryHistory());
  const [savedAnalyses, setSavedAnalyses] = useState(() => getSavedAnalyses());
  const requestInFlight = useRef(false);

  useEffect(() => {
    setHistory(getQueryHistory());
    setSavedAnalyses(getSavedAnalyses());
    getOverview()
      .then(setOverview)
      .catch(() => setOverviewError(true))
      .finally(() => setOverviewLoading(false));
  }, []);

  const refreshHistoryState = () => {
    setHistory(getQueryHistory());
    setSavedAnalyses(getSavedAnalyses());
  };

  const handleQuery = async (query) => {
    const trimmedQuery = String(query || "").trim();

    if (!trimmedQuery || requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    setLastQuery(trimmedQuery);
    setHistory(addQueryToHistory(trimmedQuery));
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await submitQuery(trimmedQuery);
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to process the query.");
    } finally {
      requestInFlight.current = false;
      setLoading(false);
      refreshHistoryState();
    }
  };

  const handleExampleSelect = (query) => {
    setQueryText(query);
    handleQuery(query);
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  const handleToggleSave = (query) => {
    const trimmedQuery = String(query || "").trim();

    if (!trimmedQuery) {
      return;
    }

    const match = savedAnalyses.find(
      (entry) => entry.query.toLowerCase() === trimmedQuery.toLowerCase()
    );

    if (match) {
      const updated = removeSavedAnalysis(match.id);
      setSavedAnalyses(updated);
      return;
    }

    const updated = saveAnalysis(trimmedQuery);
    setSavedAnalyses(updated);
  };

  const handleDeleteHistoryItem = (id) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm("Clear all recent queries?");

    if (!confirmed) {
      return;
    }

    clearQueryHistory();
    setHistory([]);
  };

  const handleRemoveSavedAnalysis = (id) => {
    const updated = removeSavedAnalysis(id);
    setSavedAnalyses(updated);
  };

  const currentInsight = result ? buildInsight(result.query, result.result, result.generated_logic) : "";

  return (
    <div className="app-shell">
      <Header />

      <main className="main-container">
        <section className="hero-section">
          <div className="hero-badge">
            <BarChart3 size={15} />
            AI-powered business analytics
          </div>

          <h2>
            Ask questions.
            <br />
            <span>Get answers from your data.</span>
          </h2>

          <p>
            Turn natural-language business questions into
            validated, executable analytics without writing SQL.
          </p>
        </section>

        <QueryInput
          onSubmit={handleQuery}
          loading={loading}
          value={queryText}
          onChange={setQueryText}
        />

        <ExampleQueries
          onSelect={handleExampleSelect}
          loading={loading}
        />

        <DashboardOverview
          overview={overview}
          loading={overviewLoading}
          error={overviewError}
        />

        {loading && <LoadingState />}

        {error && (
          <section className="error-card">
            <div className="error-icon">
              <AlertCircle size={22} />
            </div>

            <div>
              <strong>
                Unable to process your query
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => handleQuery(lastQuery)}
              className="retry-button"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </section>
        )}

        {result && !loading && (
          <section className="results-container">
            <div className="result-query">
              <span>YOUR QUESTION</span>
              <p>{result.query}</p>
            </div>

            <div className="insight-grid">
              <ConfidenceCard
                confidence={
                  result.confidence_score
                }
              />

              <ExplanationCard
                explanation={
                  result.explanation
                }
              />
            </div>

            <LogicCard
              logic={result.generated_logic}
            />

            <AnalyticsChart
              result={result.result}
              logic={result.generated_logic}
            />

            <AnalysisInsights
              query={result.query}
              result={result.result}
              logic={result.generated_logic}
              onNextQuestion={handleQuery}
              insight={currentInsight}
            />

            <ResultTable
              result={result.result}
            />

            <ReportActions
              result={result}
              insight={currentInsight}
            />

            <button
              type="button"
              className="new-query-button"
              onClick={handleReset}
            >
              <RefreshCw size={17} />
              Ask another question
            </button>
          </section>
        )}

        <div className="history-sidebar">
          <QueryHistory
            history={history}
            savedAnalyses={savedAnalyses}
            onRerun={handleQuery}
            onSave={handleToggleSave}
            onDelete={handleDeleteHistoryItem}
            onClearAll={handleClearHistory}
          />

          <SavedAnalyses
            analyses={savedAnalyses}
            onRerun={handleQuery}
            onRemove={handleRemoveSavedAnalysis}
          />
        </div>
      </main>

      <footer className="app-footer">
        <span>
          SalesAnalyticsAI · Intelligent Analytics Query Engine
        </span>

        <span>
          Natural Language → Query Plan → Analytics
        </span>
      </footer>
    </div>
  );
}


export default App;