import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import FeedbackWidget from "@/components/FeedbackWidget";
import Footer from "@/components/Footer"; 

export default function App({ Component, pageProps }: AppProps) {
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
