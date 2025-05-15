import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { Sortable, Swap } from "sortablejs";
import '../sass/styles.scss';

// mount swap plugin
Sortable.mount(new Swap());

let root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Main/>);

function Main(){
    let sortableElement = useRef(null);
    let trendData = useRef(null);
    let [displayData, setDisplayData] = useState(null);
    let [curWeek, setCurWeek] = useState({start: null, end: null});
    let [updateTime, setUpdateTime] = useState(new Date());

    // init
    useEffect(() => {
        // setup sortable + swap plugin
        Sortable.create(sortableElement.current, {
            swap: true,
            animation: 150,
            onUpdate: (evt) => {onListUpdate(evt, setDisplayData)}
        });

        // fetch from server
        getData().then((response) =>{
            console.log("Got data from: " + response.updateTime);

            trendData.current = response.data;
            setDisplayData(shuffle(JSON.parse(JSON.stringify(response.data))));
            setCurWeek({start: new Date(response.week.start), end: new Date(response.week.end)});
            setUpdateTime(new Date(response.updateTime));
        });

    }, [setCurWeek, setUpdateTime, setDisplayData]);

    // main jsx
    return <div className="container mx-auto p-5 fs-5" style={{width: 780}}>
        <h1 className="row">
            <p className="text-start col">Trendle!</p>
            <p className="text-end col">{dateToString(updateTime)}</p>
        </h1>
        <hr/>

        Rank the following trending Google Search queries in order of largest increase in search volume (top) to smallest increase in search volume (bottom).<br/>

        <div className="my-4 alert alert-primary">
            Today's search data is from the week of: <b>{dateToString(curWeek.start)}</b> to <b>{dateToString(curWeek.end)}</b>.
        </div>

        <ul ref={sortableElement} className="list-group">
            <List data={displayData}/>
        </ul>

        <div className="my-4">
            <button type="button" onClick={() => submit(displayData, trendData)} className="btn btn-primary me-2">
                Submit
            </button>
        </div>
    </div>;
}

// create list jsx object
function List({data}){
    if(!data)
        return <div/>
    
    return <>
        {data.map((query) =>{
            let [classSuffix, editClassSuffix] = useState("");
            query.editClassSuffix = editClassSuffix;

            return <li key={query.value.toString()} className={`list-group-item py-4 rounded ${classSuffix}`} style={{fontSize: "2vh"}} onAnimationEnd={() => {if(classSuffix != "disabled correct") editClassSuffix("")}}>
                    {query.name}
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

// check completion
function submit(submission, solution){
    for(let i = 0; i < submission.length; i++){
        if(submission[i].name == solution.current[i].name){
            // correct
            console.log(`CORRECT: "${submission[i].name}" is equal to "${solution.current[i].name}" at index ${i}`);
            submission[i].editClassSuffix("disabled correct");
            continue;
        }
        // wrong
        console.log(`WRONG: "${submission[i].name}" is not equal to "${solution.current[i].name}" at index ${i}`);
        submission[i].editClassSuffix("wrong");
    }
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