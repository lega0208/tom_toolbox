import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import App from 'containers/App';
import Loadable from 'components/Loadable';

export default function routes() {
	const AsyncReferences = Loadable({ loader: () => import('./components/References') });
	const AsyncHome = Loadable({ loader: () => import('./containers/HomePage') });
	// const AsyncTOMViewer = Loadable({ loader: () => import('./containers/TOMViewer') });
	const AsyncValidator = Loadable({ loader: () => import('./containers/Validator') });

	return (
		<App>
			<Switch>
				<Route exact path="/" component={AsyncHome} />
				<Route path="/references" component={AsyncReferences} />
				<Route path="/validator" component={AsyncValidator} />
				<Route component={() => <Redirect to="/" />} />
			</Switch>
		</App>
	);
}
