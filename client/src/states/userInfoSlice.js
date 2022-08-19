import { createSlice } from '@reduxjs/toolkit'

export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        username: "Steve"
    },
    reducers: {
        setUserName: (state, action) => {
            if (state.name !== action.payload) {
                state.name = action.payload
            }
        }
    }
})

export const { setUserName } = userInfoSlice.actions

export default userInfoSlice.reducer