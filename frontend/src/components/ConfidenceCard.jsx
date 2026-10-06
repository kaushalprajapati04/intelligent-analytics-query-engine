import { ShieldCheck } from "lucide-react";


function ConfidenceCard({ confidence }) {
  if (confidence === null || confidence === undefined) {
    return null;
  }

  const normalizedConfidence = Number(confidence);

  if (!Number.isFinite(normalizedConfidence)) {
    return null;
  }

  const percentage = Math.round(
    Math.max(0, Math.min(1, normalizedConfidence)) * 100
  );

  let level = "Medium";

  if (normalizedConfidence >= 0.85) {
    level = "High";
  } else if (normalizedConfidence < 0.60) {
    level = "Low";
  }

  return (
    <section className="confidence-card" aria-label="Heuristic confidence estimate">
      <div className="confidence-icon">
        <ShieldCheck size={22} />
      </div>

      <div className="confidence-content">
        <div className="confidence-top">
          <div>
            <span className="card-label">
              Confidence
            </span>

            <h3>{level}</h3>
          </div>

          <strong>{percentage}%</strong>
        </div>

        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <p>
          Heuristic estimate based on interpretation, validation, and execution;
          it is not a guarantee of correctness.
        </p>
      </div>
    </section>
  );
}

export default ConfidenceCard;