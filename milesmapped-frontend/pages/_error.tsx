type ErrorPageProps = {
  statusCode?: number;
};

function ErrorPage({ statusCode }: ErrorPageProps) {
  const title = statusCode ? `An error ${statusCode} occurred` : "An unexpected error occurred";

  return (
    <div style={{ padding: "3rem", fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <p style={{ textTransform: "uppercase", letterSpacing: "0.2em", color: "#38bdf8", fontSize: "0.75rem" }}>Error</p>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#0b1f3a", marginTop: "0.5rem" }}>{title}</h1>
      <p style={{ color: "#0b1f3a", opacity: 0.75, marginTop: "0.5rem" }}>
        Please try refreshing the page or return to the home screen.
      </p>
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1rem",
          padding: "0.65rem 1.5rem",
          borderRadius: "9999px",
          background: "#0b1f3a",
          color: "white",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 10px 25px -10px rgba(11, 31, 58, 0.4)"
        }}
      >
        Back to home
      </a>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: { statusCode?: number }; err?: { statusCode?: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
