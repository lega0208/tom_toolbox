// @flow
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import rootReducer from '../reducers';
import rootSaga from '../sagas';

const history = createHashHistory();
const router = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

// Middleware registry
const middleware = [
  router,
  sagaMiddleware
];

const enhancer = applyMiddleware(...middleware);

function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);
  sagaMiddleware.run(rootSaga);
  return store;
}

export default { configureStore, history };
