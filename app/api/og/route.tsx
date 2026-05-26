import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const locale = searchParams.get("locale") === "en" ? "en" : "vi";
  const defaultSubtitle =
    locale === "en" ? "Experience map of Vietnam" : "Bản đồ trải nghiệm Việt Nam";
  const title = searchParams.get("title") ?? "VN Go";
  const subtitle = searchParams.get("subtitle") ?? defaultSubtitle;
  const cover = searchParams.get("cover");
  const tag = searchParams.get("tag"); // e.g. "Cafe · Hà Nội"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
          background: "#0f0f0f",
        }}
      >
        {/* Cover image with dark overlay */}
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.45,
            }}
          />
        )}

        {/* Gradient overlay bottom-to-top */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        {/* Top-left: logo badge */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 52,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#C62828",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            ⭐
          </div>
          <span style={{ color: "white", fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>
            VN Go
          </span>
        </div>

        {/* Bottom content */}
        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: 52,
            right: 52,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {tag && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  background: "#C62828",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 600,
                  padding: "5px 14px",
                  borderRadius: 999,
                  letterSpacing: "0.01em",
                }}
              >
                {tag}
              </span>
            </div>
          )}

          <div
            style={{
              color: "white",
              fontSize: title.length > 30 ? 52 : 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
