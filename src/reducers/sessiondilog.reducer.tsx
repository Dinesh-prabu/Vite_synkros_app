import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SessionDilogState {
    data: {
        display: string;
        visible: boolean;
        message: string;
    };
}

const initialState: SessionDilogState = {
    data: {
        display: 'none',
        visible: false,
        message: ''
    }
};

export const sessionDilog = createSlice({
    name: "sessionDilog",
    initialState,
    reducers: {
        sessionDilogReducer: (state, action: PayloadAction<SessionDilogState["data"]>) => {
            state.data = action.payload;
        }
    }
});

export const { sessionDilogReducer } = sessionDilog.actions;

export default sessionDilog.reducer;
