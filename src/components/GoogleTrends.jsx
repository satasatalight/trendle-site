// edited from https://stackoverflow.com/a/59997566

import React, { useRef } from "react";
import ReactDOM from "react-dom";
import Script from "react-load-script"

export default function GoogleTrends({ type, keywords, url, start, end }) {
  if(!start || !end || keywords.length == 0) return;

  let ref = useRef(null);
  let comparisonItem = [];
  let time = `${dateToString(start)} ${dateToString(end)}`;

  keywords.forEach(keyword => {
    comparisonItem.push({
      keyword,
      geo: "US", 
      time
    })
  });

  const handleScriptLoad = _ => {
    window.trends.embed.renderExploreWidgetTo(
      ref.current,
      type,
      {
        comparisonItem: comparisonItem,
        category: 0,
        property: ""
      },
      {
        exploreQuery: `q=${encodeURI(keywords.join(","))}&geo=US&date=${encodeURI(time)}`,
        guestPath: "https://trends.google.com:443/trends/embed/"
      }
    );
  };

  const renderGoogleTrend = _ => {
    return <Script url={url} onLoad={handleScriptLoad}/>;
  };

  return <div ref={ref} className="googleTrend">{renderGoogleTrend()}</div>;
}

function dateToString(date){
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}