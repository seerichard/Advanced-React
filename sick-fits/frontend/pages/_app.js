// Custom App.js. Next makes one automatically but can be overridden with this custom file
import App, { Container } from 'next/app';
import Page from '../components/Page'
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

class MyApp extends App {
  // Special Next.js function. Will run before first render
  // ctx = context
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    // Every single page that we have, will crawl for any queries or mutations
    // that need to be fetched and resolve them before the page renders
    // This is NOT necessary for client side rendered apps, only for server side (Next)
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    };

    // Exposes the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }

  render () {
    const { Component, apollo, pageProps } = this.props;

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} /> {/* Pass fetched pageProps down to entire app */}
          </Page>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withData(MyApp);