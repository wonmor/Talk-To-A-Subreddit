import React from "react";

import { Routes, Route } from "react-router-dom";

import './App.css';

import Base from './components/Base';

const NotFound = React.lazy(() => import('./components/pages/NotFound'));
const Home = React.lazy(() => import('./components/pages/Home'));
const Chat = React.lazy(() => import('./components/pages/Chat'));

/*
██████╗░░█████╗░██╗░░░██╗████████╗███████╗██████╗░░██████╗
██╔══██╗██╔══██╗██║░░░██║╚══██╔══╝██╔════╝██╔══██╗██╔════╝
██████╔╝██║░░██║██║░░░██║░░░██║░░░█████╗░░██████╔╝╚█████╗░
██╔══██╗██║░░██║██║░░░██║░░░██║░░░██╔══╝░░██╔══██╗░╚═══██╗
██║░░██║╚█████╔╝╚██████╔╝░░░██║░░░███████╗██║░░██║██████╔╝
╚═╝░░╚═╝░╚════╝░░╚═════╝░░░░╚═╝░░░╚══════╝╚═╝░░╚═╝╚═════╝░

TIPS & TRICKS

1. BEST WAY TO CONDUCT CODE SPLITTING DUE TO MASSIVE JS SIZE:
https://www.velotio.com/engineering-blog/optimize-react-app-performance-by-code-splitting
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
        <Route path="*" element={<Base content={NotFound} />} />
        <Route exact path="/" element={<Base content={Home} />} />
        <Route path="/chat" element={<Base content={Chat} />} />
      </Routes>
    </div>
  );
}