import { createSlice } from '@reduxjs/toolkit'

export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        username: "Steve",
        email: "stevemakinson@gmail.com",
        goodToGo: false,
        isSocketChannelOpen: false,
        chatHistory: "",
        buildHistory: "",
        selectedSubRedditName: ""
    },
    reducers: {
        setUsername: (state, action) => {
            if (state.username !== action.payload) {
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
        },
        setIsSocketChannelOpen: (state, action) => {
            if (state.isSocketChannelOpen !== action.payload) {
                return {...state, isSocketChannelOpen: action.payload };
            }
        },
        setChatHistory: (state, action) => {
            if (state.setChatHistory !== action.payload) {
                return {...state, chatHistory: action.payload };
            }
        },
        setBuildHistory: (state, action) => {
            if (state.setBuildHistory !== action.payload) {
                return {...state, buildHistory: action.payload };
            }
        },
        setSelectedSubRedditName: (state, action) => {
            if (state.setSelectedSubRedditName !== action.payload) {
                return {...state, selectedSubRedditName: action.payload };
            }
        }
    }
})

export const { setUsername, setEmail, setGoodToGo, setIsSocketChannelOpen, setChatHistory, setBuildHistory, setSelectedSubRedditName } = userInfoSlice.actions;

export default userInfoSlice.reducer;