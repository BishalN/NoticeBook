import { APP_TITLE } from "@/lib/constants";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: `Empower your groups with instant communication. ${APP_TITLE}—the ultimate digital noticeboard solution`,
};

function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <div className="h-20"></div>
      <Footer />
    </>
  );
}

export default LandingPageLayout;
