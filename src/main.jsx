import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { ReactSortable } from "react-sortablejs";
import '../sass/styles.scss';

let root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Main/>);

function Main(){
    let [trendData, setTrendData] = useState(null);
    let [curWeek, setCurWeek] = useState({start: null, end: null});
    let [updateTime, setUpdateTime] = useState(new Date());

    // fetch from server
    useEffect(() => {
        getData().then((response) =>{
            console.log("Got data from: " + response.updateTime);
            setTrendData(response.data);
            setCurWeek({
                start: new Date(response.week.start),
                end: new Date(response.week.end)
            });
            setUpdateTime(new Date(response.updateTime));
        })
    }, [setTrendData, setCurWeek, setUpdateTime]);

    return <div className="container mx-auto p-5 w-50">
        <h1 className="row">
            <p className="text-start col">Trendle!</p>
            <p className="text-end col">{dateToString(updateTime)}</p>
        </h1>
        <hr/>

        Rank the following Google Search queries in order of most search volume (top) to least search volume (bottom).<br/>

        <div className="my-4 alert alert-primary">
            Today's search data is from the week of: {dateToString(curWeek.start)} to {dateToString(curWeek.end)}.
        </div>

        <ul id="list" className="list-group">
            <List data={trendData} editData={setTrendData}/>
        </ul>

        <div className="my-4">
            <button type="button" className="btn btn-primary me-2">Submit</button>
        </div>
    </div>;
}

function List({data, editData}){
    if(!data)
        return <div/>
    
    return <ReactSortable list={data} setList={editData}>
        {data.map((query) => {
            return <li key={query.value.toString()} className="list-group-item">{query.name}</li>
        })}
    </ReactSortable>
}

function dateToString(date){
    return (date) ? `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}` : "--/--/----";
}

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

    return JSON.parse(await response.json());
}