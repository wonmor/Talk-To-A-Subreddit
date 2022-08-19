import { createSlice } from '@reduxjs/toolkit'

export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        username: "Steve",
        email: "stevemakinson@gmail.com"
    },
    reducers: {
        setUsername: (state, action) => {
            if (state.name !== action.payload) {
                state.name = action.payload
            }
        },
        setEmail: (state, action) => {
            if (state.email !== action.payload) {
                state.email = action.payload
            }
        }
    }
})

export const { setUsername, setEmail } = userInfoSlice.actions

export default userInfoSlice.reducer