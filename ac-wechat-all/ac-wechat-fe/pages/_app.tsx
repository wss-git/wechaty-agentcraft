import { useState, useEffect } from 'react';
import { AppProps } from "next/app";
import { ModalsProvider } from '@mantine/modals';
import Head from "next/head";
import { MantineProvider, createTheme } from '@mantine/core';
import { getSystemConfig } from 'store/overview';
import { Shell } from 'layouts/shell';
const theme = createTheme({

});

import '@mantine/core/styles.css';
import '../styles/global.scss';


export default function App(props: AppProps) {
  const { Component, pageProps } = props;
  const [render, setRender] = useState(false);
  useEffect(() => {
    getSystemConfig().then(res => {
      setRender(true);
    });
  }, []);
  return (
    <>
      <Head>
        <title>AgentCraft Wechat</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        {render ?
          <ModalsProvider>
            <Shell >
              <Component {...pageProps} />
            </Shell>
          </ModalsProvider> : null}
      </MantineProvider>

    </>
  );
}
