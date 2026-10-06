import { Download, Rows3 } from "lucide-react";


function formatValue(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  }

  return String(value);
}


function ResultTable({ result }) {
  if (!result) {
    return null;
  }

  const columns = result.columns || [];
  const rows = result.rows || [];


  const downloadCSV = () => {
    if (!rows.length) {
      return;
    }

    const header = columns.join(",");

    const csvRows = rows.map((row) =>
      columns
        .map((column) => {
          const value = row[column] ?? "";

          return `"${String(value).replaceAll(
            '"',
            '""'
          )}"`;
        })
        .join(",")
    );

    const csvContent = [
      header,
      ...csvRows,
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "analytics-result.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };


  return (
    <section className="result-section">
      <div className="result-header">
        <div>
          <div className="section-label">
            <Rows3 size={16} />
            Query result
          </div>

          <h3>
            {result.row_count || rows.length} result
            {(
              result.row_count || rows.length
            ) !== 1
              ? "s"
              : ""}
          </h3>
        </div>

        {rows.length > 0 && (
          <button
            type="button"
            className="download-button"
            onClick={downloadCSV}
          >
            <Download size={16} />
            Export CSV
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="empty-result">
          No results were found for this query.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="result-table" aria-label="Analytics query results">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
                    {column
                      .replaceAll("_", " ")
                      .replace(/\b\w/g, (letter) =>
                        letter.toUpperCase()
                      )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`}>
                      {formatValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


export default ResultTable;