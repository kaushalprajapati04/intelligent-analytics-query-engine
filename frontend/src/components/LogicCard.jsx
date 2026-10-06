import { Braces, CheckCircle2 } from "lucide-react";


function formatValue(value) {
  if (value === null || value === undefined) {
    return "null";
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.join(", ")
      : "None";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}


function LogicCard({ logic }) {
  if (!logic) {
    return null;
  }

  const entries = Object.entries(logic);


  return (
    <section className="logic-card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <Braces size={18} />
          </div>

          <div>
            <span className="card-label">
              Generated logic
            </span>

            <h3>How the query was interpreted</h3>
          </div>
        </div>

        <CheckCircle2
          size={20}
          className="success-icon"
        />
      </div>

      <div className="logic-grid">
        {entries.map(([key, value]) => (
          <div
            className="logic-item"
            key={key}
          >
            <span>
              {key
                .replaceAll("_", " ")
                .replace(/\b\w/g, (letter) =>
                  letter.toUpperCase()
                )}
            </span>

            <strong>
              {formatValue(value)}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}


export default LogicCard;