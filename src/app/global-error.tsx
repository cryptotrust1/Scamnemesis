"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif"
        }}>
          <h1>Niečo sa pokazilo</h1>
          <p>Ospravedlňujeme sa za nepríjemnosti. Chyba bola automaticky nahlásená.</p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Skúsiť znova
          </button>
        </div>
      </body>
    </html>
  );
}
