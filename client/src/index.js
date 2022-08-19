import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'

import './index.css';

import App from './App';
import store from './store'

/*
TALK TO A SUBREDDIT: FRONT-END
DEVELOPED AND DESIGNED BY JOHN SEONG. DEVELOPED USING CREATE-REACT-APP.
*/

const root = ReactDOM.createRoot(document.getElementById('root'));
// For React, use yarn command to start...

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);