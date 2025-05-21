import React, { useReducer, useState } from "react";
import ReactDOM from "react-dom";
import confetti from "canvas-confetti";
import Shareable from "./Shareable";
import ReactSortable, { sortableReducer } from "./Sortable";
import { useImmerReducer } from "use-immer";

export default function Game({ data, curWeek }){
    if(!data) return <div/>
    
    let [attempts, setAttempts] = useState(0);
    let [sortableData, sortableDispatch] = useImmerReducer(sortableReducer, shuffle(data));
    let [shareableArray, setShareableArray] = useState(["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"]);
    let [shareableSuffix, setShareableSuffix] = useState("d-none");

    // check completion
    function submit(){
        let allRight = true;
        setAttempts((prev) => ++prev);

        for(let i = 0; i < sortableData.length; i++){
            if(sortableData[i].extracted_value == data[i].extracted_value){
                // correct
                sortableDispatch({type: "animate", class: "disabled correct", index: i});
                updateShareable("🟩", i);
            }
            else {
                // wrong
                sortableDispatch({type: "animate", class: "wrong", index: i});
                updateShareable("🟥", i);
                allRight = false;
            }
        }

        if(allRight) win();
    }

    // win
    function win(){
        setShareableSuffix("cropIn");
        sortableDispatch({type: "win"});
        confetti();
    }

    // add emoji to row i
    function updateShareable(emoji, i){
        setShareableArray((prev) => {
            let array = [...prev];
            array[i] += emoji;
            return array;
        });
    }

    // shuffle initial array
    function shuffle(raw) {
        let array = JSON.parse(JSON.stringify(raw));
        let shuffledArray = [];

        for (let i = array.length; i > 0; i--) {
            let randIndex = Math.floor(Math.random() * i);
            shuffledArray.push(array[randIndex]);
            array.splice(randIndex, 1);
        }

        return shuffledArray
    }

    return <>
        <p className="fw-light fst-italic">Most trending searches</p>
        <ReactSortable data={sortableData} dispatch={sortableDispatch}/>
        <p className="fw-light fst-italic pt-2">Least trending searches</p>

        <div className="m-4">
            <button type="button" onClick={() => submit()} className="btn btn-primary me-2 w-100 fs-4 py-2">
                Submit!
            </button>
        </div>

        <p className="fs-6 text-secondary">
            Data is based on queries from the United States after 1/1/2004.<br/> 
            New Games are collected around 12 AM EST.
        </p>

        <div className={`rounded bg-secondary-subtle px-3 pt-3 my-3 mx-5 text-center ${shareableSuffix}`} onAnimationEnd={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})}>
            <Shareable data={data} curWeek={curWeek} attempts={attempts} shareableArray={shareableArray} shareableSuffix={shareableSuffix} />
        </div>
    </>
}