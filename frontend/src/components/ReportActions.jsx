import { Download, Printer } from "lucide-react";
import { useState } from "react";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return new Intl.NumberFormat("en-US").format(value);
    }

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "N/A";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return "N/A";
    }
  }

  return String(value);
}

function formatReportTimestamp() {
  const date = new Date();
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function buildLogicRows(logic) {
  if (!logic || typeof logic !== "object") {
    return `<tr><td colspan="2">No generated logic available.</td></tr>`;
  }

  return Object.entries(logic)
    .map(([key, value]) => {
      const label = key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

      return `
        <tr>
          <th>${escapeHtml(label)}</th>
          <td>${escapeHtml(formatDisplayValue(value))}</td>
        </tr>
      `;
    })
    .join("");
}

function buildResultTable(columns, rows) {
  if (!Array.isArray(columns) || columns.length === 0) {
    return `<div class="report-empty">No analytical result columns were returned.</div>`;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return `<div class="report-empty">No analytical results were returned for this query.</div>`;
  }

  const headers = columns
    .map(
      (column) =>
        `<th>${escapeHtml(
          String(column)
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        )}</th>`
    )
    .join("");

  const body = rows
    .map((row, rowIndex) => {
      const cells = columns
        .map((column) => {
          const value = row && Object.prototype.hasOwnProperty.call(row, column)
            ? row[column]
            : "N/A";
          return `<td>${escapeHtml(formatDisplayValue(value))}</td>`;
        })
        .join("");

      return `<tr data-row="${rowIndex}">${cells}</tr>`;
    })
    .join("");

  return `
    <div class="report-table-wrap">
      <table class="report-table">
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function buildReportHtml({ result, insight }) {
  const query = result?.query || "No question provided";
  const explanation = result?.explanation || "No explanation available.";
  const confidence = result?.confidence_score ?? "N/A";
  const logic = result?.generated_logic || {};
  const reportResult = result?.result || {};
  const columns = Array.isArray(reportResult.columns) ? reportResult.columns : [];
  const rows = Array.isArray(reportResult.rows) ? reportResult.rows : [];
  const reportTimestamp = formatReportTimestamp();
  const note = rows.length
    ? "This report contains the displayed results for the current analysis."
    : "This report reflects the current analysis result state.";

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>SalesAnalyticsAI Report</title>
      <style>
        :root {
          --navy: #172033;
          --muted: #667085;
          --border: #e5e7eb;
          --panel: #ffffff;
          --soft: #f6f8fb;
          --accent: #6366f1;
        }

        * { box-sizing: border-box; }

        body {
          margin: 0;
          padding: 32px 20px 48px;
          background: #f5f7fb;
          color: var(--navy);
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.5;
        }

        .report-page {
          max-width: 1100px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(23, 32, 51, 0.04);
          overflow: hidden;
        }

        .report-header {
          padding: 28px 32px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
        }

        .report-brand {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 700;
          margin-bottom: 8px;
        }

        .report-title {
          margin: 0;
          font-size: 32px;
          color: var(--navy);
        }

        .report-subtitle {
          margin-top: 6px;
          color: var(--muted);
          font-size: 14px;
        }

        .report-timestamp {
          margin-top: 16px;
          color: var(--muted);
          font-size: 12px;
        }

        .report-body {
          padding: 24px 32px 8px;
        }

        .report-section {
          margin-bottom: 26px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--panel);
          padding: 18px 20px;
        }

        .report-section h2 {
          margin: 0 0 12px;
          font-size: 15px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .report-section h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: var(--navy);
        }

        .report-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .report-stat {
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--soft);
        }

        .report-stat-label {
          display: block;
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }

        .report-stat-value {
          font-size: 15px;
          font-weight: 700;
          color: var(--navy);
          word-break: break-word;
        }

        .report-case {
          margin: 0;
          color: var(--navy);
          font-size: 16px;
          line-height: 1.7;
          word-break: break-word;
        }

        .report-text {
          margin: 0;
          color: #39455d;
          font-size: 14px;
          line-height: 1.7;
          word-break: break-word;
        }

        .report-table-wrap {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: white;
        }

        .report-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 500px;
        }

        .report-table th,
        .report-table td {
          padding: 11px 12px;
          border-bottom: 1px solid #edf0f5;
          text-align: left;
          vertical-align: top;
          font-size: 12px;
        }

        .report-table th {
          background: #fafbfc;
          color: #6a7383;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .report-table tbody tr:last-child td,
        .report-table tbody tr:last-child th {
          border-bottom: 0;
        }

        .report-empty {
          color: var(--muted);
          font-size: 14px;
          padding: 8px 0;
        }

        .report-footer {
          padding: 18px 32px 28px;
          border-top: 1px solid var(--border);
          color: var(--muted);
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 700px) {
          body { padding: 16px 12px 28px; }
          .report-header, .report-body, .report-footer { padding-left: 18px; padding-right: 18px; }
          .report-title { font-size: 26px; }
          .report-section { padding: 16px 14px; }
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }

          .report-page {
            border: 0;
            box-shadow: none;
            border-radius: 0;
            max-width: 100%;
          }

          .report-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .report-table-wrap {
            overflow: visible;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-page">
        <header class="report-header">
          <div class="report-brand">SalesAnalyticsAI</div>
          <h1 class="report-title">Intelligent Analytics Query Engine</h1>
          <div class="report-subtitle">Professional report export</div>
          <div class="report-timestamp">Generated: ${escapeHtml(reportTimestamp)}</div>
        </header>

        <main class="report-body">
          <section class="report-section">
            <h2>Query Summary</h2>
            <div class="report-summary-grid">
              <div class="report-stat">
                <span class="report-stat-label">Question</span>
                <div class="report-stat-value">${escapeHtml(query)}</div>
              </div>
              <div class="report-stat">
                <span class="report-stat-label">Confidence</span>
                <div class="report-stat-value">${escapeHtml(formatDisplayValue(confidence))}</div>
              </div>
            </div>
            <div style="margin-top: 16px;">
              <h3>Explanation</h3>
              <p class="report-text">${escapeHtml(explanation)}</p>
            </div>
          </section>

          <section class="report-section">
            <h2>Key Insight</h2>
            <p class="report-text">${escapeHtml(insight || "No key insight available for this analysis.")}</p>
          </section>

          <section class="report-section">
            <h2>Generated Logic</h2>
            <div class="report-table-wrap">
              <table class="report-table">
                <tbody>
                  ${buildLogicRows(logic)}
                </tbody>
              </table>
            </div>
          </section>

          <section class="report-section">
            <h2>Analytical Results</h2>
            <p class="report-text" style="margin-bottom: 12px;">${escapeHtml(note)}</p>
            ${buildResultTable(columns, rows)}
          </section>
        </main>

        <footer class="report-footer">
          <span>Generated by SalesAnalyticsAI</span>
          <span>Report date: ${escapeHtml(reportTimestamp)}</span>
        </footer>
      </div>
    </body>
  </html>`;
}

function ReportActions({ result, insight }) {
  const [notice, setNotice] = useState("");

  const handleDownload = () => {
    if (!result) {
      return;
    }

    const reportHtml = buildReportHtml({ result, insight });
    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "salesanalyticsai-report.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!result) {
      return;
    }

    const reportHtml = buildReportHtml({ result, insight });
    const printWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printWindow) {
      setNotice("Popup blocked. Please allow pop-ups and try again.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      try {
        printWindow.print();
      } catch (error) {
        setNotice("The print dialog could not be opened. Please try again.");
      }
    }, 250);
  };

  if (!result) {
    return null;
  }

  return (
    <section className="report-actions">
      <div className="report-actions-header">
        <div className="section-label">
          <Download size={16} />
          Report actions
        </div>
      </div>

      <div className="report-actions-row">
        <button type="button" className="report-action-button" onClick={handleDownload}>
          <Download size={16} />
          Download Report
        </button>

        <button type="button" className="report-action-button secondary" onClick={handlePrint}>
          <Printer size={16} />
          Print Report
        </button>
      </div>

      {notice && <div className="report-action-notice">{notice}</div>}
    </section>
  );
}

export default ReportActions;
