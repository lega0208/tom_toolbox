import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import App from 'containers/App';
import Loadable from 'components/Loadable';

export default class extends Component {
  render() {
  	const AsyncReferences = Loadable({ loader: () => import('./components/References') });
		const AsyncHome = Loadable({ loader: () => import('./containers/HomePage') });
    return (
      <App>
        <Switch>
          <Route exact path="/" component={AsyncHome} />
          <Route path="/references" component={AsyncReferences} />
          <Route component={() => <Redirect to="/" />} />
        </Switch>
      </App>
    );
  }
}
