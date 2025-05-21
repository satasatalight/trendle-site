import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import '../sass/styles.scss';
import Game from "./components/Game.jsx";

let root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Main/>);

function Main(){
    let [trendData, setTrendData] = useState(null)
    let [themeIcon, setThemeIcon] = useState("");
    let [curWeek, setCurWeek] = useState({start: null, end: null});
    let [updateTime, setUpdateTime] = useState(new Date());

    // init
    useEffect(() => {
        // set page color scheme based on user's default theme
        setDefaultTheme(setThemeIcon);

        // fetch from server
        getData().then((response) => {
            console.log("Got data from: " + response.updateTime);

            setTrendData(response.data);
            setCurWeek({start: new Date(response.week.start), end: new Date(response.week.end)});
            setUpdateTime(new Date(response.updateTime));
        });
        
    }, [setCurWeek, setUpdateTime, setThemeIcon]);

    // main jsx
    return <div className="main container mx-auto px-5 pt-4" style={{width: "85vh"}}>
        <h1 className="row align-items-center">
            <p className="text-start col-7">Trendle!</p>

            <div className="col-auto mb-auto text-end ms-auto">
                <button type="button" className="btn btn-secondary rounded-circle me-3" onClick={() => switchTheme(setThemeIcon)}>
                    <i className={`bi ${themeIcon}`}/>
                </button>
                {dateToString(updateTime)}
            </div>
        </h1>
        <hr/>

        <p className="fw-medium">
            Rank the following trending Google Search queries in order of largest increase in search volume (top) to smallest increase in search volume (bottom).
        </p>

        <p className="my-4 alert alert-primary" role="alert">
            Today's search data is from the week of: <b>{dateToString(curWeek.start)}</b> to <b>{dateToString(curWeek.end)}</b>.
        </p>

        <Game data={trendData} curWeek={curWeek} updateTime={updateTime}/>
    </div>;
}

// get default color scheme of user's device
function setDefaultTheme(setIcon){
    let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    setIcon(isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill');
}

// switch color scheme
function switchTheme(setIcon){
    let isLight = (document.documentElement.getAttribute('data-bs-theme') == "light");
    document.documentElement.setAttribute('data-bs-theme', isLight ? 'dark' : 'light');
    setIcon(isLight ? 'bi-sun-fill' : 'bi-moon-stars-fill');
}

// convert date object to calendar string
function dateToString(date){
    return (date) ? `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}` : "--/--/----";
}

// fetch from server
async function getData() {
    let response;

    try {
        response = await fetch("https://trendle-server.vercel.app/api/getWeekData");

        if (!response) {
            console.error("server response:");
            console.error(response);
            alert("Couldn't reach server! Check console for details. Try refreshing (:");
        }
    }

    catch {
        console.error("server response:");
        console.error(response);
        alert("Couldn't reach server! Check console for details. Try refreshing (:");
    }

    return await response.json();
}