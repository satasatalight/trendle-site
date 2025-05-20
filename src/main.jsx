import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import GoogleTrends from "./GoogleTrends.jsx";
import { Sortable, Swap } from "sortablejs";
import confetti from "canvas-confetti";
import '../sass/styles.scss';

// mount swap plugin
Sortable.mount(new Swap());

let root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Main/>);

function Main(){
    let trendData = useRef(null);
    let sortableRef = useRef(null);
    let [shareable, setShareable] = useState(["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]);
    let [shareableSuffix, setShareableSuffix] = useState("d-none");
    let [googleData, setGoogleData] = useState([]);
    let [attempts, setAttempts] = useState(0);
    let [copyIcon, setCopyIcon] = useState("bi-copy");
    let [themeIcon, setThemeIcon] = useState("");
    let [displayData, setDisplayData] = useState(null);
    let [curWeek, setCurWeek] = useState({start: null, end: null});
    let [updateTime, setUpdateTime] = useState(new Date());

    // init
    useEffect(() => {
        // set page color scheme based on user's default theme
        setDefaultTheme(setThemeIcon);

        // setup sortable + swap plugin
        Sortable.create(sortableRef.current, {
            swap: true,
            animation: 150,
            onUpdate: (evt) => {onListUpdate(evt, setDisplayData)},
            ghostClass: "hover"
        });

        // fetch from server
        getData().then((response) => {
            console.log("Got data from: " + response.updateTime);

            trendData.current = response.data;
            setDisplayData(shuffle(JSON.parse(JSON.stringify(response.data))));
            setCurWeek({start: new Date(response.week.start), end: new Date(response.week.end)});
            setUpdateTime(new Date(response.updateTime));

            // setup google widget queries
            trendData.current.forEach((element) => 
                setGoogleData((prev) => [...prev, element.query]));
        });
        
    }, [setCurWeek, setUpdateTime, setDisplayData, setThemeIcon, setGoogleData]);

    // check completion
    function submit(){
        let allRight = true;
        setAttempts((prev) => ++prev);

        for(let i = 0; i < displayData.length; i++){
            if(displayData[i].extracted_value == trendData.current[i].extracted_value){
                // correct
                displayData[i].editClassSuffix("disabled correct");
                updateShareable("🟩", i);
            }
            else {
                // wrong
                displayData[i].editClassSuffix("wrong");
                updateShareable("🟥", i);
                allRight = false;
            }
        }

        if(allRight) win();
    }

    // win
    function win(){
        setShareableSuffix("shareable");
        displayData.forEach((element) => 
            element.editSubtitle(element.value));
        confetti();
    }

    // add emoji to row i
    function updateShareable(emoji, i){
        setShareable((prev) => {
            let array = [...prev];
            array[i] += emoji;
            return array;
        });
    }

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

        <p className="fw-light fst-italic">Most trending searches</p>
        <ul ref={sortableRef} className="list-group">
            <List data={displayData}/>
        </ul>
        <p className="fw-light fst-italic pt-2">Least trending searches</p>

        <div className="m-4">
            <button type="button" onClick={() => submit()} className="btn btn-primary me-2 w-100 fs-4 py-2">
                Submit!
            </button>
        </div>

        <p className="fs-6 text-secondary">
            Data is based on queries from the United States between 1/1/2004 and {dateToString(updateTime)}.<br/> 
            New Games are collected around 12 AM EST.
        </p>

        <div className={`rounded bg-secondary-subtle px-3 pt-3 my-3 mx-5 text-center ${shareableSuffix}`} onAnimationEnd={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})}>
            You got it in {attempts} tries!<br/>
            
            {shareable.map((line, i) => 
                <div key={i}>{line}<br/></div>)}

            <button className="btn btn-outline-info mt-3 px-3" onClick={() => copyShareable(shareable, setCopyIcon)}>
                Copy <i className={`bi ${copyIcon} ms-1`}/>
            </button>
            <hr/>

            <div className="mb-3 mx-3 rounded">
                <GoogleTrends type="TIMESERIES" keywords={googleData} start={curWeek.start} end={curWeek.end} url="https://ssl.gstatic.com/trends_nrtr/2051_RC11/embed_loader.js"/>
            </div>
        </div>
    </div>;
}

// create list jsx object
function List({data}){
    if(!data)
        return <div/>
    
    return <>
        {data.map((object) =>{
            // create dynamic elements
            let [classSuffix, editClassSuffix] = useState("");
            let [subtitle, editSubtitle] = useState("");

            // attach dynamic edit function to object
            object.editClassSuffix = editClassSuffix;
            object.editSubtitle = editSubtitle;

            // return list object
            return <li key={object.query} className={`list-group-item pt-4 pb-3 my-1 rounded border-2 fw-semibold ${classSuffix}`} style={{fontSize: "2vh"}} onAnimationEnd={() => {if(classSuffix != "disabled correct") editClassSuffix("")}}>
                    <div className="row">
                        <p className="text-start col-1 w-75">{object.query}</p>
                        <p className="fw-light fst-italic text-end col-2 w-25">{subtitle}</p>
                    </div>
            </li>
        }
    )}</>
}

// sync array w/ user sorting
function onListUpdate(evt, setArray){
    setArray((prev) => {
        let array = [...prev];

        let to = array[evt.newIndex];
        let from = array[evt.oldIndex];

        array[evt.newIndex] = from;
        array[evt.oldIndex] = to;

        return array;
    });
}

// shuffle initial array
function shuffle(array) {
    let shuffledArray = [];

    for (let i = array.length; i > 0; i--) {
        let randIndex = Math.floor(Math.random() * i);
        shuffledArray.push(array[randIndex]);
        array.splice(randIndex, 1);
    }

    return shuffledArray
}

// copy shareable to clipboard
function copyShareable(shareable, setIcon){
    let copy = "";
    shareable.forEach((line) => 
        copy += `${line}\n`);
    navigator.clipboard.writeText(copy);

    setIcon("bi-clipboard-check");
    setTimeout(() => setIcon("bi-copy"), 500);
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