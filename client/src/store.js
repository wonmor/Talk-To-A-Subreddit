import { configureStore } from '@reduxjs/toolkit'

import userInfoReducer from './states/userInfoSlice'

/*
╔═══╦═══╦═══╦═══╦════╗─╔═══╦═══╦═══╦╗─╔╦═╗╔═╗╔═══╦═══╦═══╦╗─╔╦═══╦═══╦═══╦═══╗
║╔═╗║╔══╣╔═╗║╔═╗║╔╗╔╗║─║╔═╗║╔══╩╗╔╗║║─║╠╗╚╝╔╝║╔═╗║╔══╩╗╔╗║║─║║╔═╗║╔══╣╔═╗║╔═╗║
║╚═╝║╚══╣║─║║║─╚╩╝║║╚╝─║╚═╝║╚══╗║║║║║─║║╚╗╔╝─║╚═╝║╚══╗║║║║║─║║║─╚╣╚══╣╚═╝║╚══╗
║╔╗╔╣╔══╣╚═╝║║─╔╗─║║╔══╣╔╗╔╣╔══╝║║║║║─║║╔╝╚╗─║╔╗╔╣╔══╝║║║║║─║║║─╔╣╔══╣╔╗╔╩══╗║
║║║╚╣╚══╣╔═╗║╚═╝║─║║╚══╣║║╚╣╚══╦╝╚╝║╚═╝╠╝╔╗╚╗║║║╚╣╚══╦╝╚╝║╚═╝║╚═╝║╚══╣║║╚╣╚═╝║
╚╝╚═╩═══╩╝─╚╩═══╝─╚╝───╚╝╚═╩═══╩═══╩═══╩═╝╚═╝╚╝╚═╩═══╩═══╩═══╩═══╩═══╩╝╚═╩═══╝
*/

export default configureStore({
    /*
    This function dictates the behaviour of a React-Redux reducer,
    which takes an action and the previous state of the application and returns the new state;
    essentially manipulating globally defined states

    Parameters
    ----------
    None

    Returns
    -------
    None
    */
    reducer: {
        userInfo: userInfoReducer
    },
})