import React from 'react';

import {BrowserRouter as Router, Switch,  Route, Link, Redirect  } from "react-router-dom";

import BMI from './bmi/bmi';
import BMR from './bmr/bmr1';
import TheBiggestLoser from './biggestLoser/TheBiggestLoser';
import GMdiet from "./GM diet/GMdiet";
import FatBurning from "./FatBurning/FatBuring";
import NotLossingWeight from "./NotLossingWeight/NotLossingWeight";
import Topbar from "./topbar/Topbar";
import WeightLossTips from "./WeightLossTips/WeightLossTips";
import Home from "./Home/Home";

function App() {
  return (
    <>
    <Router>
    <Topbar/>
    <Switch>
      <Route exact path="/"><Redirect to="/home"></Redirect></Route>
      <Route exact path="/home"><Home/></Route>
      <Route path="/bmi"><BMI/></Route>
      <Route path="/bmr"><BMR/></Route>
      <Route path="/gmdiet"><GMdiet/></Route>
      <Route path="/thebiggestloser"><TheBiggestLoser/></Route>
      <Route path="/fatburning"><FatBurning/></Route>
      <Route path="/notlossingweight"><NotLossingWeight/></Route>
      <Route path="/weightlosstips"><WeightLossTips/></Route>
      <Route path="*"><h1>404 Error</h1></Route>
 
    </Switch>
    </Router>
    </>
  );
}

export default App;
