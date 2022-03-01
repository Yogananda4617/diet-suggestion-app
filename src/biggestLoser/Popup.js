import React from "react";
import "./Popup.css";
import { MdClose } from "react-icons/md";

function Popup(props){
    return (props.trigger)?(
        <div className="popup">
            <div className="popup-inner">
                <button className="close-btn" onClick={() => props.setTrigger(false)}>< h2 className="close"><MdClose/></h2></button>
                {props.childern}
            </div>
        </div>
    ): "";
} export default Popup 