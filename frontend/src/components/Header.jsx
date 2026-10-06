import { Database } from "lucide-react";


function Header() {
  return (
    <header className="app-header">
      <div className="brand-section">
        <img
          src="/SalesAnalytics%20Growth%20Logo.png"
          alt="SalesAnalytics growth logo"
          className="brand-logo"
        />
        <span className="brand-ai-suffix" aria-hidden="true">AI</span>
        <h1 className="visually-hidden">SalesAnalyticsAI</h1>
      </div>

      <div className="header-status">
        <span className="status-dot" />

        <Database size={16} />

        <span>Analytics Ready</span>
      </div>
    </header>
  );
}

export default Header;