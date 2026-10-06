const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";


async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data.detail === "string"
        ? data.detail
        : data.detail?.message ||
          "Something went wrong while processing the request.";

    throw new Error(message);
  }

  return data;
}


export async function submitQuery(query) {
  const response = await fetch(
    `${API_BASE_URL}/api/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    }
  );

  return handleResponse(response);
}


export async function getMetadata() {
  const response = await fetch(
    `${API_BASE_URL}/api/metadata`
  );

  return handleResponse(response);
}

export async function getOverview() {
  const response = await fetch(`${API_BASE_URL}/api/overview`);
  return handleResponse(response);
}


export async function getHealth() {
  const response = await fetch(
    `${API_BASE_URL}/api/health`
  );

  return handleResponse(response);
}