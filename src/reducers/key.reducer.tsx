import { createSlice } from "@reduxjs/toolkit";     
       console.log("her")


export const keyAction = createSlice({
    name: "setkey",
    initialState: {
        data: null
    },
    reducers: {
        keyReducer: (state, action) => {
            state.data = action.payload;
        }
    }
});

export const { keyReducer } = keyAction.actions;

export default keyAction.reducer;