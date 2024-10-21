import { useEffect, useRef, useState } from "react";
import * as topojson from "topojson-client";
import * as d3 from "d3";
import * as Plot from  "@observablehq/plot";
import tweetData from "./data/tweet_sentiment_geo.csv";

function App() {
  const containerRef = useRef();
  const mapRef = useRef();
  const [sentData, setSentData] = useState();
  const [mapData, setMapData] = useState();

  useEffect(() => {
    d3.csv(tweetData, function(d) {
      return {
        date: new Date(d.date),
        sentiment: Number(d.sentiment),
        metro_area: d.metro_area,
        county_code: String(d.county_code),
      }
    }).then(setSentData)
  }, []);

  useEffect(() => {
    function processGeoData(geoData) {
      if (!sentData) return;
      const countySet = new Set(sentData.map((d) => d.county_code));
      const newGeoData = Object.create(geoData);
      newGeoData.objects.states = {
        type: "GeometryCollection",
        geometries: newGeoData.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")
      }
      newGeoData.objects.counties.geometries = geoData.objects.counties.geometries.filter((county) => countySet.has(county.id));
      return newGeoData;
    }

    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json")
      .then(jsonData => jsonData.json())
      .then(processGeoData)
      .then(setMapData);
  }, [sentData]);

  /* useEffect(() => {
    if (!mapData) return;
    const nation = topojson.feature(mapData, mapData.objects.nation);
    const countymap = new Map(topojson.feature(mapData, mapData.objects.counties).features.map(d => [d.id, d]));
    const statemesh = topojson.mesh(mapData, mapData.objects.states, (a, b) => a !== b)
    console.log(countymap);

    if (!sentData) return;
    console.log(sentData);

    console.log("Trying lookup...");
    console.log(countymap.get(sentData[0].county_code));

    const mapPlot = Plot.plot({
      marginLeft: 50,
      width: 975,
      projection: "identity",
      r: {range: [0, 50]},
      marks: [
        Plot.geo(nation, { fill: "#ddd" }),
        Plot.geo(statemesh, {stroke: "white"}),
        Plot.dot(sentData, Plot.centroid({
          r: (d) => +d.sentiment,
          fill: "brown",
          fillOpacity: 0.5,
          stroke: "#fff",
          strokeOpacity: 0.5,
          geometry: (d) => countymap.get(d.county_code),
          channels: {
            county: (d) => countymap.get(d.county_code).properties.name,
            // state: ({ state }) => statemap.get(state)?.properties.name
          },
          tip: true
        }))
      ]
    });
    mapRef.current.append(mapPlot);
    return () => mapPlot.remove();
  }, [mapData]);

  useEffect(() => {
    if (!sentData) return;
    const plot = Plot.plot({
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
  }, [sentData]); */

  

  return (
    <>
      <div ref={mapRef}></div>
      <div ref={containerRef}></div>
    </>
  );
}

export default App;
