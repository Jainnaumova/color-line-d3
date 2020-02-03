import React, { useEffect, useState, Fragment } from "react";
import "./App.css";
import * as d3 from "d3";
import moment from "moment";
import _ from "lodash";
import { data } from "./data";
import Banner from "./Banner";

const BANNER_WIDTH = 201;

const getMax = data => {
  let max = 0;
  data.forEach(el => {
    if (el.balance > max) {
      max = el.balance;
    }
    if (el.balance_upper > max) {
      max = el.balance_upper;
    }
  });
  return max;
};

const App = ({ dimensions }) => {
//   const dimensionsForBan = dimensions ? dimensions : null
// console.log('dimensions ', dimensionsForBan)

  const [red, setRed] = useState(false);
  const [green, setGreen] = useState(false);
  const [black, setBlack] = useState(false);
  const [x, setX] = useState();
  const [y, setY] = useState();
  // const chart = useRef();
  // const svg = useRef();
  const dots = [];

  const toggleRed = () => {
    setRed(!red);
    setGreen(false);
    setBlack(false);
  }

  const toggleGreen = () => {
    setRed(false);
    setGreen(!green);
    setBlack(false);
  }

  const toggleBlack = () => {
    setRed(false);
    setGreen(false);
    setBlack(!black);
  }

  useEffect(() => {
    getLines();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  },[[red, green, black]])

  const mapData = () => {
    const mappedData = [];
    const rawData = data.series;
    for (let i = 0; i < rawData.length - 1; i++) {
      const segment = {
        start: rawData[i],
        end: rawData[i + 1],
        id: i + 1,
        type: getType(rawData[i], rawData[i + 1])
      };
      mappedData.push(segment);
    }

    return mappedData;
  }

  const getType = (val1, val2) => {
    // is in bounds, only green
    if (!isOutOfBounds(val1) && !isOutOfBounds(val2)) {
      return 0;
    }
    // is out of bounds, only red
    if (
      (isAboveBounds(val1) && isAboveBounds(val2)) ||
      (isBelowBounds(val1) && isBelowBounds(val2))
    ) {
      return 1;
    }
    // goes down, direction: in bounds, from red to green
    if (isAboveBounds(val1) && !isOutOfBounds(val2)) {
      return 2;
    }
    // goes down, direction: out bounds, from green to red
    if (!isOutOfBounds(val1) && isBelowBounds(val2)) {
      return 3;
    }
    // goes up, direction: in bounds, from red to green
    if (isBelowBounds(val1) && !isOutOfBounds(val2)) {
      return 4;
    }
    // goes up, direction: out bounds, from green to red
    if (!isOutOfBounds(val1) && isAboveBounds(val2)) {
      return 5;
    }
    // goes from below to above, red - green - red
    if (isBelowBounds(val1) && isAboveBounds(val2)) {
      return 6;
    }
    // goes from above to below, red - green - red
    if (isAboveBounds(val1) && isBelowBounds(val2)) {
      return 7;
    }
  }



  const isBelowBounds = val => {
    return val.balance < val.balance_low;
  }

  const isAboveBounds = val => {
    return val.balance > val.balance_upper;
  }

  const isOutOfBounds = val => {
    return isBelowBounds(val) || isAboveBounds(val);
  }

  const handleResize = () => {
    getLines();
  }

  let xScale, yScale;

  // const width = chart.current.clientWidth - margin.left - margin.right;
  // const height = chart.current.clientHeight - margin.top - margin.bottom;

  const getLines = () => {
    // begining


      // width = 660 - margin.left - margin.right,
      // height = 600 - margin.top - margin.bottom;
      // width = chart.current.clientWidth - margin.left - margin.right,
      // height = chart.current.clientHeight - margin.top - margin.bottom;
    d3.select("#svg").remove();
    const svg = d3.select('.svg');
    const dimensions = svg.node().getBoundingClientRect(); // define window size
    const svgWidth = dimensions.width;
    const svgHeight = dimensions.height;
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    // append the svg object to the body of the page
    // d3.select("#chart")
    d3.select(".svg")
      .append("svg")
      .attr("id", "svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    xScale = d3
      .scaleTime()
      .domain([moment(data.series[0].date), moment(_.last(data.series).date)])
      .range([0, width]);
    yScale = d3
      .scaleLinear()
      .domain([0, getMax(data.series) * 1.05])
      .range([height, 0]);

    updateChart();
  }

  const mappedData = mapData();

  const updateChart = () => {
    const svg = d3.select("#svg");

    //draw axises here !!!!!!!!!!!

    // const xScale = this.xScale;
    // const yScale = this.yScale;
    d3.selectAll(".path").remove();
    mappedData.forEach(segment => {
      drawUpperLineSegments(svg, segment, xScale, yScale);
      drawLowLineSegments(svg, segment, xScale, yScale);
      if (segment.type < 2) {
        drawRegularBalancePath(svg, segment, xScale, yScale);
      } else {
        drawTransparentPath(svg, segment, xScale, yScale);
        // update array with pathes to, from and between intersections
        updateIntersection(svg, segment);
      }
    });

    dots.forEach(segment => {
      drawOutboundBalancePath(svg, segment);
    });
    drawBannerLine(svg, xScale, yScale);
  }

  const drawUpperLineSegments = (svg, data, xScale, yScale) => {
    svg
      .append("line")
      .datum(data)
      .attr("x1", d => xScale(moment(data.start.date)))
      .attr("y1", d => yScale(data.start.balance_upper))
      .attr("x2", d => xScale(moment(data.end.date)))
      .attr("y2", d => yScale(data.end.balance_upper))
      .attr("class", "path")
      .attr("id", `upper-line-${data.id}`)
      .attr("stroke", "blue");
  }

  const drawLowLineSegments = (svg, data, xScale, yScale) => {
    svg
      .append("line")
      .datum(data)
      .attr("x1", d => xScale(moment(data.start.date)))
      .attr("y1", d => yScale(data.start.balance_low))
      .attr("x2", d => xScale(moment(data.end.date)))
      .attr("y2", d => yScale(data.end.balance_low))
      .attr("class", "path")
      .attr("id", `low-line-${data.id}`)
      .attr("stroke", "black");
  }

  // draw segments that are completely in bounds or out bounds
  const drawRegularBalancePath = (svg, data, xScale, yScale) => {
    const strokeWidth = data.type === 0 ? 1 : red ? 2 : 1;
    const color = green
      ? "green"
      : black
      ? "transparent"
      : data.type === 0
      ? "green"
      : "red";
    svg
      .append("line")
      .datum(data)
      .attr("x1", d => xScale(moment(data.start.date)))
      .attr("y1", d => yScale(data.start.balance))
      .attr("x2", d => xScale(moment(data.end.date)))
      .attr("y2", d => yScale(data.end.balance))
      .attr("hover", d => (data.type === 0 ? "green" : "red"))
      .attr("class", "path")
      .attr("stroke-width", strokeWidth)
      .attr("id", `path-balance-${data.id}`)
      .attr("stroke", color);
  }

  // to draw transparent path in order to get intersection coords
  const drawTransparentPath = (svg, data, xScale, yScale) => {
    svg
      .append("line")
      .datum(data)
      .attr("x1", d => xScale(moment(data.start.date)))
      .attr("y1", d => yScale(data.start.balance))
      .attr("x2", d => xScale(moment(data.end.date)))
      .attr("y2", d => yScale(data.end.balance))
      .attr("class", "path")
      .attr("id", `transparent-${data.id}`)
      .attr("stroke", "transparent");
  }

  const updateIntersection = (svg, segment) => {
    const intersections = findIntersections(svg, segment.id);
    const balanceLine = svg.select(`#transparent-${segment.id}`);
    const balanceLineCoords = {
      x1: +balanceLine.attr("x1"),
      y1: +balanceLine.attr("y1"),
      x2: +balanceLine.attr("x2"),
      y2: +balanceLine.attr("y2")
    };
    let one, two, three;
    // [{}, {}] - crosses upper and low lines
    if (
      typeof intersections[0] === "object" &&
      typeof intersections[1] === "object"
    ) {
      if (segment.type === 6) {
        one = createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[1].x,
          intersections[1].y,
          1
        );
        dots.push(one);
        two = createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          intersections[0].x,
          intersections[0].y,
          0
        );
        dots.push(two);
        three = createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        dots.push(three);
      }
      if (segment.type === 7) {
        one = createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[0].x,
          intersections[0].y,
          1
        );
        dots.push(one);
        two = createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          intersections[1].x,
          intersections[1].y,
          0
        );
        dots.push(two);
        three = createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        dots.push(three);
      }
    }
    // [{}, '...'] - crosses upper line, types: 2, 5
    if (typeof intersections[0] === "object") {
      if (segment.type === 2) {
        one = createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[0].x,
          intersections[0].y,
          1
        );
        dots.push(one);
        two = createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          0
        );
        dots.push(two);
      }
      if (segment.type === 5) {
        one = createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[0].x,
          intersections[0].y,
          0
        );
        dots.push(one);
        two = createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        dots.push(two);
      }
    }
    // ['...', {}] - crosses low line, types: 3, 4
    if (typeof intersections[1] === "object") {
      if (segment.type === 3) {
        one = createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[1].x,
          intersections[1].y,
          0
        );
        dots.push(one);
        two = createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        dots.push(two);
      }
      if (segment.type === 4) {
        one = createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[1].x,
          intersections[1].y,
          1
        );
        dots.push(one);
        two = createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          0
        );
        dots.push(two);
      }
    }
  }

  const findIntersections = (svg, id) => {
    const upperLine = svg.select(`#upper-line-${id}`);
    const lowLine = svg.select(`#low-line-${id}`);
    const balanceLine = svg.select(`#transparent-${id}`);
    const upperLineCoords = {
      x1: +upperLine.attr("x1"),
      y1: +upperLine.attr("y1"),
      x2: +upperLine.attr("x2"),
      y2: +upperLine.attr("y2")
    };
    const lowLineCoords = {
      x1: +lowLine.attr("x1"),
      y1: +lowLine.attr("y1"),
      x2: +lowLine.attr("x2"),
      y2: +lowLine.attr("y2")
    };
    const balanceLineCoords = {
      x1: +balanceLine.attr("x1"),
      y1: +balanceLine.attr("y1"),
      x2: +balanceLine.attr("x2"),
      y2: +balanceLine.attr("y2")
    };

    const intersectionWithUpper = getIntersectionCoord(
      upperLineCoords,
      balanceLineCoords
    );
    const intersectionWithLow = getIntersectionCoord(
      lowLineCoords,
      balanceLineCoords
    );
    return [intersectionWithUpper, intersectionWithLow];
  }

  const getIntersectionCoord = (line1, line2) => {
    const x1 = Math.floor(line1.x1),
      x2 = Math.floor(line1.x2),
      x3 = Math.floor(line2.x1),
      x4 = Math.floor(line2.x2);
    const y1 = Math.floor(line1.y1),
      y2 = Math.floor(line1.y2),
      y3 = Math.floor(line2.y1),
      y4 = Math.floor(line2.y2);
    const pt_denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const pt_x_num =
      (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
    const pt_y_num =
      (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
    if (pt_denom === 0) {
      return "parallel";
    } else {
      const pt = {
        x: Math.floor(pt_x_num / pt_denom),
        y: Math.floor(pt_y_num / pt_denom)
      };
      if (
        isBetween(pt.x, x1, x2) &&
        isBetween(pt.y, y1, y2) &&
        isBetween(pt.x, x3, x4) &&
        isBetween(pt.y, y3, y4)
      ) {
        return pt;
      } else {
        return "not in range";
      }
    }
  }

  const createPathWithIntersections = (x1, y1, x2, y2, type) => {
    return {
      start: {
        x: x1,
        y: y1
      },
      end: {
        x: x2,
        y: y2
      },
      type: type
    };
  }

  const isBetween = (a, b1, b2) => {
    if (a >= b1 && a <= b2) return true;
    if (a >= b2 && a <= b1) return true;
    return false;
  }

  // draw segments that change color, need to find intersectionWithLow
  const drawOutboundBalancePath = (svg, data) => {
    const strokeWidth = data.type === 0 ? 1 : red ? 2 : 1;
    const color = green
      ? "green"
      : black
      ? "transparent"
      : data.type === 0
      ? "green"
      : "red";
    svg
      .append("line")
      .datum(data)
      .attr("x1", d => data.start.x)
      .attr("y1", d => data.start.y)
      .attr("x2", d => data.end.x)
      .attr("y2", d => data.end.y)
      .attr("hover", d => (data.type === 0 ? "green" : "red"))
      .attr("class", "path")
      .attr("stroke-width", strokeWidth)
      .attr("stroke", color);
  }

  const getLastDateData = () => {
    // const data
    // console.log("data ", data.series[data.series.length - 1]);
    return data.series[data.series.length - 1];
  }

  const drawBannerLine = (svg, xScale, yScale) => {
    // const margin = { top: 10, right: 30, bottom: 30, left: 60 };
      // height = 600 - margin.top - margin.bottom;

    const lastDateData = [getLastDateData()];
    // console.log("lastDateData ", lastDateData);
    svg
      .append("line")
      .datum(lastDateData)
      .attr("x1", d => xScale(moment(lastDateData[0].date)))
      .attr("y1", d => yScale(20))
      .attr("x2", d => xScale(moment(lastDateData[0].date)))
      .attr("y2", d => yScale(50))
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("id", "bannerLine")
      .attr("position", "relative");
    getBanner(svg, lastDateData, xScale, yScale);
  }

  const getBanner = (svg, lastDateData, xScale, yScale) => {
    // const lastDateData = [this.getLastDateData()];
    // console.log("lastDateData ", lastDateData);
    // console.log("dddd ", svg.select("#bannerLine").datum(lastDateData));
    svg
      // .select("#bannerLine")
      .append("rect")
      .attr("id", "banner")
      .datum(lastDateData)
      // .append("div")
      // .attr("x", xScale(50))
      // .attr("y", yScale(50))
      .attr("x", d => xScale(moment(lastDateData[0].date)) - BANNER_WIDTH + dimensions.offsetLeft)
      .attr("y", d => yScale(50))
      .attr("stroke", "transparent")
      // .attr("fill", "white")
      // .attr("position", "absolute")
      // .attr("top", "40px")
      .attr("width", "1px")
      .attr("height", "1px")
      .on("mouseover", handleTest(svg, xScale, yScale));
    // .append("span")
    // .text(d => d[0].balance)
    // .html(() => <Banner bannerData={bannerData} />);

    // .attr("left", "-50px")
    // .attr("border", "1px solid red");
    // handleTest(svg, xScale, yScale)
  }

  const addHighlighting = () => {
    d3.select('#svg').selectAll('[hover=red').attr('stroke-width', 2);
    d3.select('#svg').selectAll('[hover=green').attr('stroke', 'transparent');
  }

  const removeHighlighting = () => {
    d3.select('#svg').selectAll('[hover=red').attr('stroke-width', 1);
    d3.select('#svg').selectAll('[hover=green').attr('stroke', 'green');
  }

  const handleTest = (svg, xScale, yScale) => {
    // const svgWidth = svg.node().clientWidth;
    // const a = (window.innerWidth - svg.node().clientWidth) / 2;
    // console.log("AAA", a);
    // console.log(svg.select("#banner").node().clientHeight);
    const x = svg.select("#banner").attr("x");
    // console.log("XXX", x);
    const y = svg.select("#banner").attr("y");
    // console.log("XXX", y);
    // const x = window.innerWidth - 100;
    // this.setState({ x: xScale(x), y: yScale(y) });
    setX(x);
    setY(y);
    // this.setState({ x: +x + +a, y });
    // if resize function is in parent need to put this function to useEffect
    // useEffect(() => {
    //   handleTest(...)
    // }, [])
  }
//   const dimensionsForBan = dimensions ? dimensions : null
// console.log('dimensions ', dimensionsForBan)

  return (
    <Fragment>
      <div style={{width: `${dimensions && dimensions.width}px`, height: `${dimensions && dimensions.height}px`}} >
        <div id="chart">
          <div className='svg'/>
        </div>
      </div>
      <div onClick={toggleRed}>red</div>
      <div onClick={toggleGreen}>green</div>
      <div onClick={toggleBlack}>black</div>
      <div
        onMouseOver={addHighlighting}
        onMouseOut={removeHighlighting}
        >
        XXXXXXXX
      </div>
      <Banner bannerWidth={BANNER_WIDTH} bannerData={data} left={x} top={y} />
    </Fragment>
  );

}

export default App;
