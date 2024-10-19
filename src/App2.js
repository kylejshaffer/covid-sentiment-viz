import { useEffect, useRef, useState } from "react";
import * as topojson from "topojson-client";
import * as d3 from "d3";
import * as Plot from  "@observablehq/plot";
import tweetData from "./data/tweet_sentiment_geo.csv";

function App() {
  const containerRef = useRef();
  const [sentData, setSentData] = useState();

  async function getGeoData() {
    const response = await fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json");
    const respData = await response.json();
    const nation = topojson.feature(respData, respData.objects.nation);
    const statemap = new Map(topojson.feature(respData, respData.objects.states).features.map(d => [d.id, d]));
    const countymap = new Map(topojson.feature(respData, respData.objects.counties).features.map(d => [d.id, d]));

    console.log(nation);
    console.log(statemap);
    console.log(countymap);
    return {'nation': nation, 'statemap': statemap, 'countymap': countymap};
  }

  async function getSentimentData() {
    const formattedData = await d3.csv(tweetData, function(d) {
      return {
        date: new Date(d.date),
        sentiment: Number(d.sentiment),
        metro_area: d.metro_area,
        county_code: d.county_code,
      }
    });

    // console.log(formattedData);
    return formattedData;
  }

  useEffect(() => {
    d3.csv(tweetData, function(d) {
      return {
        date: new Date(d.date),
        sentiment: Number(d.sentiment),
        metro_area: d.metro_area,
        county_code: d.county_code,
      }
    }).then(setSentData)
  }, []);

  useEffect(() => {
    if (!sentData) return;
    const plot = Plot({
      marginLeft: 50,
      width: 928,
      y: {
        grid: true,
        label: "Sentiment Index"
      },
      marks: [
        Plot.areaY(sentData, {x: "date", y: "sentiment", fill: "metro_area", title: "metro_area"}),
        Plot.ruleY([0])
      ]
    });
    containerRef.current.append(plot);
    return () => plot.remove();
  }, [sentData]);

  return (
    <div ref={containerRef}>
    </div>
  );
}

export default App;

