import { createSlice } from '@reduxjs/toolkit'

export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        username: "Steve",
        email: "stevemakinson@gmail.com",
        goodToGo: false
    },
    reducers: {
        setUsername: (state, action) => {
            if (state.name !== action.payload) {
                return {...state, username: action.payload };
            }
        },
        setEmail: (state, action) => {
            if (state.email !== action.payload) {
                return {...state, email: action.payload };
            }
        },
        setGoodToGo: (state, action) => {
            if (state.goodToGo !== action.payload) {
                return {...state, goodToGo: action.payload };
            }
        }
    }
})

export const { setUsername, setEmail, setGoodToGo } = userInfoSlice.actions;

export default userInfoSlice.reducer;