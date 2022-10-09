import thunk from "redux-thunk";

import { playlistReducer } from "./reducers/playlistReducer";
import {
  applyMiddleware,
  createStore,
  configureStore,
  combineReducers,
} from "redux";

const rootReducer = combineReducers({
  playlist: playlistReducer,
});

export default createStore(rootReducer, applyMiddleware(thunk));
