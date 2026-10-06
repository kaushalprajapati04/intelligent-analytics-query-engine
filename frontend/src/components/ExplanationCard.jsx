import { Lightbulb } from "lucide-react";


function ExplanationCard({ explanation }) {
  if (!explanation) {
    return null;
  }

  return (
    <section className="explanation-card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon">
            <Lightbulb size={18} />
          </div>

          <div>
            <span className="card-label">
              Explanation
            </span>

            <h3>How the result was generated</h3>
          </div>
        </div>
      </div>

      <p className="explanation-text">
        {explanation}
      </p>
    </section>
  );
}


export default ExplanationCard;