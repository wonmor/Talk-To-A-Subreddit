import React from "react";

import { Routes, Route } from "react-router-dom";

import './App.css';

import NotFound from './components/NotFound';
import Base from './components/Base';

import Home from './components/pages/Home';
import Chat from './components/pages/Chat';

/*
██████╗░░█████╗░██╗░░░██╗████████╗███████╗██████╗░░██████╗
██╔══██╗██╔══██╗██║░░░██║╚══██╔══╝██╔════╝██╔══██╗██╔════╝
██████╔╝██║░░██║██║░░░██║░░░██║░░░█████╗░░██████╔╝╚█████╗░
██╔══██╗██║░░██║██║░░░██║░░░██║░░░██╔══╝░░██╔══██╗░╚═══██╗
██║░░██║╚█████╔╝╚██████╔╝░░░██║░░░███████╗██║░░██║██████╔╝
╚═╝░░╚═╝░╚════╝░░╚═════╝░░░░╚═╝░░░╚══════╝╚═╝░░╚═╝╚═════╝░
*/

export default function App() {
  /*
  This is a component function in JSX that contains the HTML markup
  that represent each graphical element on the webpage;
  This specific function handles React's client-side routing feature

  Parameters
  ----------
  None

  Returns
  -------
  DOM File
    A HTML markup that contains graphical elements
  */

  return (
    <div>
      <Routes>
        <Route path="*" element={<Base component={NotFound} />} />
        <Route exact path="/" element={<Base component={Home} />} />
        <Route path="/chat" element={<Base component={Chat} />} />
      </Routes>
    </div>
  );
}