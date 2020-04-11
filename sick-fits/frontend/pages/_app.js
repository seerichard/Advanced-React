// Custom App.js. Next makes  one automatically but can be overridden with this custom file
import App, { Container } from 'next/app';
import Page from '../components/Page'

class MyApp extends App {
  render () {
    const { Component } = this.props;

    return (
      <Container>
        <Page>
          <Component />
        </Page>
      </Container>
    )
  }
}

export default MyApp;