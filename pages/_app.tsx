import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

import FeedbackWidget from "@/components/FeedbackWidget";
import Footer from "@/components/Footer";
import { trackPageView } from "@/utils/analytics";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // первый заход
    trackPageView(router.asPath);

    // переходы внутри SPA
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, router.asPath]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Digital Focus</title>
      </Head>

      <Component {...pageProps} />

      <FeedbackWidget />
      <Footer />
    </>
  );
}
