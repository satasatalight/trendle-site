import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
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
    let [displayData, setDisplayData] = useState(null);
    let [curWeek, setCurWeek] = useState({start: null, end: null});
    let [updateTime, setUpdateTime] = useState(new Date());

    // init
    useEffect(() => {
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
        });

    }, [setCurWeek, setUpdateTime, setDisplayData]);

    // check completion
    function submit(){
        let allRight = true;

        for(let i = 0; i < displayData.length; i++){
            if(displayData[i].extracted_value == trendData.current[i].extracted_value){
                // correct
                displayData[i].editClassSuffix("disabled correct");
                continue;
            }
            // wrong
            displayData[i].editClassSuffix("wrong");
            allRight = false;
        }

        if(allRight) win();
    }

    // win
    function win(){
        displayData.forEach((element) => 
            element.editSubtitle(element.value));
        confetti();
    }

    // main jsx
    return <div className="container mx-auto px-5 pt-4 fs-5" style={{width: 780}}>
        <h1 className="row">
            <p className="text-start col">Trendle!</p>
            <p className="text-end col">{dateToString(updateTime)}</p>
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
            return <li key={object.value.toString()} className={`list-group-item pt-3 pb-1 my-1 rounded border-2 fw-semibold ${classSuffix}`} style={{fontSize: "2vh"}} onAnimationEnd={() => {if(classSuffix != "disabled correct") editClassSuffix("")}}>
                    {object.query}<br/>
                    <p className="fw-light fst-italic">{subtitle}</p>
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

// shuffle inital array
function shuffle(array) {
    let shuffledArray = [];

    for (let i = array.length; i > 0; i--) {
        let randIndex = Math.floor(Math.random() * i);
        shuffledArray.push(array[randIndex]);
        array.splice(randIndex, 1);
    }

    return shuffledArray
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
            console.error("trendle-server not working, trying again:");
            console.error(response);
            // return await getData();
        }
    }

    catch {
        console.error("trendle-server not working, trying again:");
        console.error(response);
        // return await getData();  
    }

    return await response.json();
}