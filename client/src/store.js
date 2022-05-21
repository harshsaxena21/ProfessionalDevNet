import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import setAuthToken from './utils/setAuthToken';

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

// setting up store subscription listner to use localstorage for storing token
let currentState = store.getState();

store.subscribe(()=> {
	let previousState = currentState;   // prev state and new state for comparison
	currentState = store.getState();

	if(previousState.auth.token !== currentState.auth.token) {
		const token = currentState.auth.token
		setAuthToken(token)
	}

});

export default store;