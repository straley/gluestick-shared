import thunk from "redux-thunk";
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import _gluestick from "./reducers";
import promiseMiddleware from "../lib/promiseMiddleware";

export default function (client, customRequire, customMiddleware, hotCallback, devMode) {
  const reducer = combineReducers(Object.assign({}, {_gluestick}, customRequire()));
  const middleware = [
    promiseMiddleware(client),
    thunk,
    ...customMiddleware
  ];

  // Include middleware that will warn when you mutate the state object
  // but only include it in dev mode
  if (devMode) {
    middleware.push(require("redux-immutable-state-invariant")());
  }


  const composeArgs = [
    applyMiddleware.apply(this, middleware),
    typeof window === "object" && typeof window.devToolsExtension !== "undefined" ? window.devToolsExtension() : f => f
  ];

  const finalCreateStore = compose.apply(null, composeArgs)(createStore);
  const store = finalCreateStore(reducer, typeof window !== "undefined" ? window.__INITIAL_STATE__ : {});

  if (hotCallback) {
    hotCallback(() => {
      const nextReducer = combineReducers(Object.assign({}, {_gluestick}, customRequire()));
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
