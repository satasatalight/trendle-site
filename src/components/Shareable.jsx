import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import GoogleTrends from "./GoogleTrends.jsx";

export default function Shareable({data, attempts, shareableArray, curWeek}){
    let [copyIcon, setCopyIcon] = useState("bi-copy");
    let [googleData, setGoogleData] = useState([]);

    // setup google widget queries
    useEffect(() => {
        data.forEach((element) => 
            setGoogleData((prev) => [...prev, element.query]));
    }, [setGoogleData]);

    // copy shareable to clipboard
    function copyShareable(){
        let copy = "";
        shareableArray.forEach((line) => copy += `${line}\n`);
        navigator.clipboard.writeText(copy);

        setCopyIcon("bi-clipboard-check");
        setTimeout(() => setCopyIcon("bi-copy"), 500);
    }

    return <>
        You got it in {attempts} tries!<br/>
        
        {shareableArray.map((line, i) => 
            <div key={i}>{line}<br/></div>)}

        <button className="btn btn-outline-info mt-3 px-3" onClick={() => copyShareable()}>
            Copy <i className={`bi ${copyIcon} ms-1`}/>
        </button>
        <hr/>

        <div className="mb-3 mx-3 rounded">
            <GoogleTrends type="TIMESERIES" keywords={googleData} start={curWeek.start} end={curWeek.end} url="https://ssl.gstatic.com/trends_nrtr/2051_RC11/embed_loader.js"/>
        </div>
    </>
}