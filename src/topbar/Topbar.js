import React from "react";
import { Link } from "react-router-dom";
import "./topbar.css";


 export default function Topbar(){
     return(
         <div className="top">
            <ul>
              <li className="active"><Link to="/home">Home</Link></li>
              <li>Diet Plans
              <div className="sub-menu-1">
                    <ul>
                      <li><Link to="/gmdiet">GM Diet</Link></li>
                      <li><Link to="/thebiggestloser">The Biggest Loser</Link></li>
                    </ul>
              </div></li>
              <li>Know your numbers
              <div className="sub-menu-1">
                    <ul>
                      <li><Link to="/bmi">BMI Calculator</Link></li>
                      <li><Link to="/bmr">Calorie Calculator</Link></li>
                    </ul>
              </div>
              </li>
              <li>Explore
              <div className="sub-menu-1">
                    <ul>
                      <li><Link to="/weightlosstips">Weight Loss Tips</Link></li>
                      <li><Link to="/fatburning">Food For Fat Burning</Link></li>
                      <li><Link to="/notlossingweight">Why I'm Not Losing Weight</Link></li>
                    </ul>
              </div>
              </li>
              {/* <li>logout</li> */}
            </ul>
         </div>
     )
 }

// import React, { Component } from 'react';
// import { Nav, Dropdown } from 'bootstrap-4-react';
// import BMR from '../bmr/bmr1';

// export default class App extends Component {
//   render() {
//     return (
//       <Nav pills flex="column sm-row">
//         <Nav.ItemLink active href="#">Active</Nav.ItemLink>
//         <Nav.Item dropdown>
//           <Nav.Link href="#" dropdownToggle>Dropdown</Nav.Link>
//           <Dropdown.Menu>
//             <Dropdown.Item href="<BMR/>">Action</Dropdown.Item>
//             <Dropdown.Item href="#">Another action</Dropdown.Item>
//             <Dropdown.Item href="#">Something else here</Dropdown.Item>
//             <Dropdown.Divider />
//             <Dropdown.Item href="#">Separated link</Dropdown.Item>
//           </Dropdown.Menu>
//         </Nav.Item>
//         <Nav.ItemLink href="#">Link</Nav.ItemLink>
//         <Nav.ItemLink href="#" disabled>Disabled</Nav.ItemLink>
//       </Nav>
      
//     )
//   }
// }