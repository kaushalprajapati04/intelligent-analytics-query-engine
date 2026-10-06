import { LoaderCircle } from "lucide-react";


function LoadingState() {
  return (
    <section className="loading-state">
      <div className="loading-icon">
        <LoaderCircle
          size={28}
          className="loading-spinner"
        />
      </div>

      <div>
        <div className="loading-title">
          SalesAnalyticsAI is analyzing your question…
        </div>

        <p>
          Understanding the request, generating analytical
          logic, and calculating the result.
        </p>
      </div>
    </section>
  );
}


export default LoadingState;