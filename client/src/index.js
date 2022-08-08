import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'

import './index.css';

import App from './App';

/*
▒█░▒█ █▀▀ █░░█ ▒█▀▀█ █░░█ █▀▀▄ █▀▀▄ █░░█ ▄ 　 ▒█▀▀▀ █▀▀█ █▀▀█ █▀▀▄ ▀▀█▀▀ ░░ ▒█▀▀▀ █▀▀▄ █▀▀▄ 
▒█▀▀█ █▀▀ █▄▄█ ▒█▀▀▄ █░░█ █░░█ █░░█ █▄▄█ ░ 　 ▒█▀▀▀ █▄▄▀ █░░█ █░░█ ░░█░░ ▀▀ ▒█▀▀▀ █░░█ █░░█ 
▒█░▒█ ▀▀▀ ▄▄▄█ ▒█▄▄█ ░▀▀▀ ▀▀▀░ ▀▀▀░ ▄▄▄█ ▀ 　 ▒█░░░ ▀░▀▀ ▀▀▀▀ ▀░░▀ ░░▀░░ ░░ ▒█▄▄▄ ▀░░▀ ▀▀▀░

DEVELOPED AND DESIGNED BY JOHN SEONG. DEVELOPED USING CREATE-REACT-APP.
*/

const root = ReactDOM.createRoot(document.getElementById('root'));
// For React, use yarn command to start...

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);