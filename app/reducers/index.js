import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import home from './home';
//import tomViewer from './tom-viewer';
import validator from './validator';


const rootReducer = combineReducers({
	home,
	//tomViewer,
	validator,
  router,
});

export default rootReducer;
