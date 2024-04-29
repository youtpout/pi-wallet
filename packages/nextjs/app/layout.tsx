import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import BodyApp from "~~/components/Body";
import { Passphrase } from "~~/components/Passphrase";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;
const imageUrl = `${baseUrl}/thumbnail.jpg`;

const title = "PI Wallet";
const titleTemplate = "%s | PI Wallet";
const description = "Keep your privacy on scroll";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: titleTemplate,
  },
  description,
  openGraph: {
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    images: [
      {
        url: imageUrl,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [imageUrl],
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {

  return (
    <html suppressHydrationWarning>
      <body id="modal-root">
        <div className="body-background">
        </div>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            <BodyApp>
              {children}
            </BodyApp>
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html >
  );
};

export default ScaffoldEthApp;
