import { createSlice } from '@reduxjs/toolkit'

export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        username: "",
        openaiApiKey: "",
        subredditName: "",
        chatHistory: [],
        isConnected: false,
    },
    reducers: {
        setUsername: (state, action) => {
            state.username = action.payload;
        },
        setOpenaiApiKey: (state, action) => {
            state.openaiApiKey = action.payload;
        },
        setSubredditName: (state, action) => {
            state.subredditName = action.payload;
        },
        setChatHistory: (state, action) => {
            state.chatHistory = action.payload;
        },
        addChatMessage: (state, action) => {
            state.chatHistory.push(action.payload);
        },
        setIsConnected: (state, action) => {
            state.isConnected = action.payload;
        },
        resetChat: (state) => {
            state.chatHistory = [];
            state.isConnected = false;
        },
    }
})

export const {
    setUsername,
    setOpenaiApiKey,
    setSubredditName,
    setChatHistory,
    addChatMessage,
    setIsConnected,
    resetChat,
} = userInfoSlice.actions;

export default userInfoSlice.reducer;
