import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Sortable, Swap } from "sortablejs";

// mount swap plugin
Sortable.mount(new Swap());

export default function ReactSortable({data, dispatch}){
    let sortableRef = useRef(null);

    // setup sortable + swap plugin
    useEffect(() => {
        Sortable.create(sortableRef.current, {
            swap: true,
            animation: 150,
            onUpdate: (evt) => {dispatch({type: "swap", evt: evt})},
            ghostClass: "hover"
        });
    }, [dispatch]);

    // create list jsx object
    function List(){
        return <>
            {data.map((object, i) =>{
                return <li key={object.query} className={`list-group-item pt-4 pb-3 my-1 rounded border-2 fw-semibold ${object.classSuffix}`} style={{fontSize: "2vh"}} onAnimationEnd={() => {if(object.classSuffix != "disabled correct") dispatch({type: "animate", class: "", index: i})}}>
                        <div className="row">
                            <p className="text-start col-1 w-75">{object.query}</p>
                            <p className="fw-light fst-italic text-end col-2 w-25">{object.subtitle}</p>
                        </div>
                </li>
            })}
        </>
    }

    return <ul ref={sortableRef} className="list-group">
        <List/>
    </ul>
}

export function sortableReducer(sortableDraft, action){
    switch(action.type){
        case "swap": {
            let to = sortableDraft[action.evt.newIndex];
            let from = sortableDraft[action.evt.oldIndex];

            sortableDraft[action.evt.newIndex] = from;
            sortableDraft[action.evt.oldIndex] = to;
            break;
        }

        case "animate":{
            sortableDraft[action.index].classSuffix = action.class;
            break;
        }

        case "win": {
            sortableDraft.forEach(element => 
                element.subtitle = element.value
            );
            break;
        }

        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}