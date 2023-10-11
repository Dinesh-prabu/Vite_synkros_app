import { combineReducers } from 'redux';
import sessionDilog from './sessiondilog.reducer';
import keyAction from './key.reducer';


const rootReducer = combineReducers({
    sessionDilog,
    keyAction
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;