import Sortable from 'sortablejs';
import '../sass/styles.scss';

// get list element
let list = document.getElementById("list");

// get api data
let data = await getData();
console.log("Got data from: " + data.updateTime);

// build sortable
Sortable.create(list, {
    animation: 150
});

async function getData() {
    let response;

    try {
        response = await fetch("https://trendle-server.vercel.app/api/getWeekData");

        if (!response) {
            console.error("trendle-server not working, trying again:");
            console.error(response);
            return await getData();
        }
    }

    catch {
        console.error("trendle-server not working, trying again:");
        console.error(response);
        return await getData();
    }

    return response.json();
}