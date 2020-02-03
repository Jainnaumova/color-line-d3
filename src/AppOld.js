import React, { Component } from "react";
import "./App.css";
import * as d3 from "d3";
import moment from "moment";
import _ from "lodash";
import { data } from "./data";
import Banner from "./Banner";

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

class AppOld extends Component {
  constructor(props) {
    super(props);
    this.state = {
      red: false,
      green: false,
      black: false
    };
    this.toggleRed = this.toggleRed.bind(this);
    this.toggleGreen = this.toggleGreen.bind(this);
    this.toggleBlack = this.toggleBlack.bind(this);
    this.addHighlighting = this.addHighlighting.bind(this);
    this.removeHighlighting = this.removeHighlighting.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    this.mappedData = this.mapData();
    this.dots = [];
    this.getLines();
    window.addEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.getLines();
  }

  toggleRed() {
    this.setState(
      prevState => ({ red: !prevState.red, green: false, black: false }),
      () => this.updateChart()
    );
  }

  handleTest(svg, xScale, yScale) {
    // console.log(svg.node().clientWidth);
    console.log(svg.node().clientWidth);
    console.log(svg.node().clientHeight);
    const a = (window.innerWidth - svg.node().clientWidth) / 2;
    console.log("AAA", a);
    // console.log(svg.select("#banner").node().clientHeight);
    const x = svg.select("#banner").attr("x");
    console.log("XXX", x);
    const y = svg.select("#banner").attr("y");
    console.log("XXX", y);
    // const x = window.innerWidth - 100;
    // this.setState({ x: xScale(x), y: yScale(y) });
    this.setState({ x: +x + +a, y });
    // if resize function is in parent need to put this function to useEffect
    // useEffect(() => {
    //   handleTest(...)
    // }, [])
  }

  toggleGreen() {
    this.setState(
      prevState => ({ green: !prevState.green, red: false, black: false }),
      () => this.updateChart()
    );
  }

  toggleBlack() {
    this.setState(
      prevState => ({ black: !prevState.black, red: false, green: false }),
      () => this.updateChart()
    );
  }

  addHighlighting() {
    d3.select("#svg")
      .selectAll("[hover=red")
      .attr("stroke-width", 2);
    d3.select("#svg")
      .selectAll("[hover=green")
      .attr("stroke", "transparent");
  }

  removeHighlighting() {
    d3.select("#svg")
      .selectAll("[hover=red")
      .attr("stroke-width", 1);
    d3.select("#svg")
      .selectAll("[hover=green")
      .attr("stroke", "green");
  }

  isBetween(a, b1, b2) {
    if (a >= b1 && a <= b2) return true;
    if (a >= b2 && a <= b1) return true;
    return false;
  }

  getIntersectionCoord(line1, line2) {
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
        this.isBetween(pt.x, x1, x2) &&
        this.isBetween(pt.y, y1, y2) &&
        this.isBetween(pt.x, x3, x4) &&
        this.isBetween(pt.y, y3, y4)
      ) {
        return pt;
      } else {
        return "not in range";
      }
    }
  }

  getLines() {
    // begining
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 660 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    d3.select("#chart")
      .append("svg")
      .attr("id", "svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.xScale = d3
      .scaleTime()
      .domain([moment(data.series[0].date), moment(_.last(data.series).date)])
      .range([0, width]);
    this.yScale = d3
      .scaleLinear()
      .domain([0, getMax(data.series) * 1.05])
      .range([height, 0]);

    this.updateChart();
  }

  getLastDateData() {
    // const data
    // console.log("data ", data.series[data.series.length - 1]);
    return data.series[data.series.length - 1];
  }

  drawBannerLine(svg, xScale, yScale) {
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      height = 600 - margin.top - margin.bottom;

    const lastDateData = [this.getLastDateData()];
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
    this.getBanner(svg, lastDateData, xScale, yScale);
  }

  getBanner(svg, lastDateData, xScale, yScale) {
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
      .attr("x", d => xScale(moment(lastDateData[0].date)))
      .attr("y", d => yScale(30))
      .attr("stroke", "transparent")
      .attr("fill", "white")
      // .attr("position", "absolute")
      // .attr("top", "40px")
      .attr("width", "80px")
      .attr("height", "50px")
      .on("mouseover", this.handleTest(svg, xScale, yScale));
    // .append("span")
    // .text(d => d[0].balance)
    // .html(() => <Banner bannerData={bannerData} />);

    // .attr("left", "-50px")
    // .attr("border", "1px solid red");
  }

  getBanner2(svg, bannerData) {
    const getBanner = () => {
      return <Banner bannerData={bannerData} />;
    };
    const bannerLine = svg
      .select("#bannerLine")
      .insert("div")
      .attr("width", "100px")
      .attr("height", "50px")
      .attr("position", "absolute")
      .attr("top", "40px")
      .attr("left", "-50px")
      .attr("border", "1px solid red")
      .attr("color", "black")
      .text("fdf");
    // .html(() => <Banner bannerData={bannerData} />);
    // .html(getBanner());
    // .text(getBanner());
    // console.log("bannerLine ", bannerLine);
  }

  updateChart() {
    const svg = d3.select("#svg");
    const xScale = this.xScale;
    const yScale = this.yScale;
    d3.selectAll(".path").remove();
    this.mappedData.forEach(segment => {
      this.drawUpperLineSegments(svg, segment, xScale, yScale);
      this.drawLowLineSegments(svg, segment, xScale, yScale);
      if (segment.type < 2) {
        this.drawRegularBalancePath(svg, segment, xScale, yScale);
      } else {
        this.drawTransparentPath(svg, segment, xScale, yScale);
        // update array with pathes to, from and between intersections
        this.updateIntersection(svg, segment);
      }
    });

    this.dots.forEach(segment => {
      this.drawOutboundBalancePath(svg, segment);
    });
    this.drawBannerLine(svg, xScale, yScale);
  }

  updateIntersection(svg, segment) {
    const intersections = this.findIntersections(svg, segment.id);
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
        one = this.createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[1].x,
          intersections[1].y,
          1
        );
        this.dots.push(one);
        two = this.createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          intersections[0].x,
          intersections[0].y,
          0
        );
        this.dots.push(two);
        three = this.createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        this.dots.push(three);
      }
      if (segment.type === 7) {
        one = this.createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[0].x,
          intersections[0].y,
          1
        );
        this.dots.push(one);
        two = this.createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          intersections[1].x,
          intersections[1].y,
          0
        );
        this.dots.push(two);
        three = this.createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        this.dots.push(three);
      }
    }
    // [{}, '...'] - crosses upper line, types: 2, 5
    if (typeof intersections[0] === "object") {
      if (segment.type === 2) {
        one = this.createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[0].x,
          intersections[0].y,
          1
        );
        this.dots.push(one);
        two = this.createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          0
        );
        this.dots.push(two);
      }
      if (segment.type === 5) {
        one = this.createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[0].x,
          intersections[0].y,
          0
        );
        this.dots.push(one);
        two = this.createPathWithIntersections(
          intersections[0].x,
          intersections[0].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        this.dots.push(two);
      }
    }
    // ['...', {}] - crosses low line, types: 3, 4
    if (typeof intersections[1] === "object") {
      if (segment.type === 3) {
        one = this.createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[1].x,
          intersections[1].y,
          0
        );
        this.dots.push(one);
        two = this.createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          1
        );
        this.dots.push(two);
      }
      if (segment.type === 4) {
        one = this.createPathWithIntersections(
          balanceLineCoords.x1,
          balanceLineCoords.y1,
          intersections[1].x,
          intersections[1].y,
          1
        );
        this.dots.push(one);
        two = this.createPathWithIntersections(
          intersections[1].x,
          intersections[1].y,
          balanceLineCoords.x2,
          balanceLineCoords.y2,
          0
        );
        this.dots.push(two);
      }
    }
  }

  createPathWithIntersections(x1, y1, x2, y2, type) {
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

  findIntersections(svg, id) {
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

    const intersectionWithUpper = this.getIntersectionCoord(
      upperLineCoords,
      balanceLineCoords
    );
    const intersectionWithLow = this.getIntersectionCoord(
      lowLineCoords,
      balanceLineCoords
    );
    return [intersectionWithUpper, intersectionWithLow];
  }

  // to draw transparent path in order to get intersection coords
  drawTransparentPath(svg, data, xScale, yScale) {
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

  drawUpperLineSegments(svg, data, xScale, yScale) {
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

  drawLowLineSegments(svg, data, xScale, yScale) {
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
  drawRegularBalancePath(svg, data, xScale, yScale) {
    const strokeWidth = data.type === 0 ? 1 : this.state.red ? 2 : 1;
    const color = this.state.green
      ? "green"
      : this.state.black
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

  // draw segments that change color, need to find intersectionWithLow
  drawOutboundBalancePath(svg, data) {
    const strokeWidth = data.type === 0 ? 1 : this.state.red ? 2 : 1;
    const color = this.state.green
      ? "green"
      : this.state.black
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

  getType(val1, val2) {
    // is in bounds, only green
    if (!this.isOutOfBounds(val1) && !this.isOutOfBounds(val2)) {
      return 0;
    }
    // is out of bounds, only red
    if (
      (this.isAboveBounds(val1) && this.isAboveBounds(val2)) ||
      (this.isBelowBounds(val1) && this.isBelowBounds(val2))
    ) {
      return 1;
    }
    // goes down, direction: in bounds, from red to green
    if (this.isAboveBounds(val1) && !this.isOutOfBounds(val2)) {
      return 2;
    }
    // goes down, direction: out bounds, from green to red
    if (!this.isOutOfBounds(val1) && this.isBelowBounds(val2)) {
      return 3;
    }
    // goes up, direction: in bounds, from red to green
    if (this.isBelowBounds(val1) && !this.isOutOfBounds(val2)) {
      return 4;
    }
    // goes up, direction: out bounds, from green to red
    if (!this.isOutOfBounds(val1) && this.isAboveBounds(val2)) {
      return 5;
    }
    // goes from below to above, red - green - red
    if (this.isBelowBounds(val1) && this.isAboveBounds(val2)) {
      return 6;
    }
    // goes from above to below, red - green - red
    if (this.isAboveBounds(val1) && this.isBelowBounds(val2)) {
      return 7;
    }
  }

  mapData() {
    const mappedData = [];
    const rawData = data.series;
    for (let i = 0; i < rawData.length - 1; i++) {
      const segment = {
        start: rawData[i],
        end: rawData[i + 1],
        id: i + 1,
        type: this.getType(rawData[i], rawData[i + 1])
      };
      mappedData.push(segment);
    }
    // console.log(mappedData);
    return mappedData;
  }

  isBelowBounds(val) {
    return val.balance < val.balance_low;
  }

  isAboveBounds(val) {
    return val.balance > val.balance_upper;
  }

  isOutOfBounds(val) {
    return this.isBelowBounds(val) || this.isAboveBounds(val);
  }

  render() {
    return (
      <div className="App">
        <div id="chart" />
        <div onClick={this.toggleRed}>red</div>
        <div onClick={this.toggleGreen}>green</div>
        <div onClick={this.toggleBlack}>black</div>
        <div
          onMouseOver={this.addHighlighting}
          onMouseOut={this.removeHighlighting}
        >
          XXXXXXXX
        </div>
        <Banner bannerData={data} left={this.state.x} top={this.state.y} />
      </div>
    );
  }
}
export default AppOld;

{
  /* <Banner bannerData={data} /> */
}
//   render() {
//     return (
//       <div className="App">
//         <ParentComponent />
//         <div id="chart" />
//       </div>
//     );
//   }
// }

// export default App;
