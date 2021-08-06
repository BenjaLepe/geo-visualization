
const WIDTH = 600;
const HEIGHT = 500;
const MARGIN = {
  top: 20,
  left: 30,
  right: 20,
  bottom: 30,
};

const SCATTER_WIDTH = 500;
const SCATTER_HEIGHT = 300;
const SCATTER_MARGIN = {
  top: 20,
  left: 60,
  right: 20,
  bottom: 60,
};

tooltip = function (d) {
  return "Comuna: " + d.NOM_COMUNA +
  "\nRegión: " + d.REGION + "°" +
  "\nIndice de dependencia juvenil: " + d.IND_DEP_JU +
  "\nIndice de dependencia adulto mayor: " + d.IND_DEP_VE +
  "\nNúmero de hombres cada 100 mujeres: " + d.INDICE_MAS;
}

const scatter = d3.select("#scatter").append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .style('background-color', '#eaebdc')

const contenedorEjeY = scatter
  .append("g")
  .attr("transform", `translate(${SCATTER_MARGIN.left}, ${MARGIN.top})`);


const contenedorEjeX = scatter
  .append("g")
  .attr("transform", `translate(${SCATTER_MARGIN.left}, ${SCATTER_HEIGHT - SCATTER_MARGIN.bottom})`);

const contenedorBarras = scatter
  .append("g")
  .attr("transform", `translate(${SCATTER_MARGIN.left} ${MARGIN.top})`);

// text label for the x axis
scatter.append("text")             
.attr("transform",
      "translate(" + ((SCATTER_WIDTH/2) + 20) + " ," + 
                     (SCATTER_HEIGHT + MARGIN.top - 40) + ")")
.style("text-anchor", "middle")
.attr("font-size", 13)
.attr("font-family", "Arial, Helvetica, sans-serif")
.text("Número de hombres cada 100 mujeres");

// text label for the y axis
scatter.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 10)
.attr("x", 20 - (SCATTER_HEIGHT / 2))
.attr("dy", ".7em")
.style("text-anchor", "middle")
.attr("font-size", 13)
.attr("font-family", "Arial, Helvetica, sans-serif")
.text("Indice de dependencia juvenil");   

// contenedorEjeX
//       .transition()
//       .duration(300)
//       .attr("class", "axisDark")
//       .call(d3.axisBottom(d3.scaleLinear().domain([0, 30]).range([0, SCATTER_WIDTH-MARGIN.right-MARGIN.left-30])))
//       .selection()
//       .selectAll("text")
//       .attr("font-size", 11);

// contenedorEjeY
//       .transition()
//       .duration(300)
//       .attr("class", "axisDark")
//       .call(d3.axisLeft(d3.scaleLinear()
//       .domain([0, 20])
//       .range([SCATTER_HEIGHT - MARGIN.top - MARGIN.bottom - 30, 0])))

async function ScatterPlot(data, height, width, margin, fillScale) {

    // data = await data.slice().sort((a, b) => d3.descending(a.INDICE_DEP, b.INDICE_DEP));

    const x = await d3.scaleLinear()
    .domain([d3.min(data, d => (d.INDICE_MAS))-7, d3.max(data, d => (d.INDICE_MAS))])
    .range([0,  width - margin.right - margin.left]);

    const y = await d3.scaleLinear()
    .domain([d3.min(data, d => (d.IND_DEP_JU))-7, d3.max(data, d => (d.IND_DEP_JU))])
    .range([height - margin.top - margin.bottom, 0]);

    xAxis = d3.axisBottom(x)
      .ticks(8)
      .tickFormat(d3.format("d"));
    
    yAxis = d3.axisLeft(y)
      .ticks(8)
      .tickFormat(d3.format("d"));

    contenedorEjeX
      .transition()
      .duration(300)
      .attr("class", "axisDark")
      .call(xAxis)
      .selection()
      .selectAll("text")
      .attr("font-size", 11);

    contenedorEjeY
      .transition()
      .duration(300)
      .attr("class", "axisDark")
      .call(yAxis)
      

    const circles = contenedorBarras.selectAll("circle")
      .data(data)
      .join(
        (enter) =>
        enter
          .append("circle")
          .attr("fill", "white")
          .attr("opacity", 0.75)
          .transition()
          .duration(500)
          .attr("cx", (d) => x(d.INDICE_MAS))
          .attr("cy", (d) => y(d.IND_DEP_JU))
          .attr("r", 10)
          .attr("fill", (d) => fillScale(d.INDICE_DEP))
          .attr("stroke", "black")
          .attr("stroke-width", 0.5)
          .selection(),
        (update) =>
          update
            .attr("cx", (d) => x(d.INDICE_MAS))
            .attr("cy", (d) => y(d.IND_DEP_JU))
            .attr("fill", (d) => fillScale(d.INDICE_DEP))
            .selection(),
        (exit) =>
          exit
            .remove()
      )


      circles.selectAll("title").remove();

      circles.append("title")
        .text(tooltip)
}

const Chilegraph = async (height, width, margin) => {
  const svg = d3
    .select("#graph")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style('background-color', 'rgb(166, 212, 228)')

  const container = svg
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

  const states = container.append("g")

  const leyenda = await svg.append("g")
      .attr("transform", `translate(${margin.left -10}, ${height-120})`)
    
  leyenda.append("rect")
    .attr("fill", "#fff")
    .attr("x", -20)
    .attr("y", -30)
    .attr("height", 150)
    .attr("stroke", "black")
    .attr("width", 130);

  leyenda.append("text")
    .text("Indice de")
    .attr("y", -15)
    .attr("x", 20)
    .attr("font-size", 13)
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("width", "100%")
  leyenda.append("text")
    .text("Dependencia total")
    .attr("y", 0)
    .attr("x", -5)
    .attr("font-size", 13)
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("width", "100%")

  const geoData = await d3.json("./data/comunas.geojson")
  const censo = await d3.csv("./data/censo.csv", function(d) {
    return {
      INDICE_MAS: +d.INDICE_MAS,
      ID: +d.ID,
      REGION: d.REGION,
      NOM_COMUNA: d.NOM_COMUNA,
      INDICE_DEP: +d.INDICE_DEP,
      IND_DEP_JU: +d.IND_DEP_JU,
      IND_DEP_VE: +d.IND_DEP_VE,
      DENSIDAD: +d.DENSIDAD
    };
  })

  const legScale = await d3
  .scaleQuantize()
  .domain(d3.extent(censo, (d) =>  parseFloat(d.INDICE_DEP)))
  .range([1,2,3,4])

  var elems = {};
  var legend_vars = {1:[], 2:[], 3: [], 4:[]};
  for (var i = 0; i < censo.length; i++)
  {
      censo[i]["selected"] = false;
      elems[censo[i].ID] = censo[i];
      let num = legScale(censo[i].INDICE_DEP);
      legend_vars[num].push(censo[i].INDICE_DEP);
  }

  
  
  let max = await d3.max(censo, function(d) { return parseFloat(d.INDICE_DEP) });
  let min = await d3.min(censo, function(d) { return parseFloat(d.INDICE_DEP) });
  let variance = d3.variance(censo, function(d){return parseFloat(d.INDICE_DEP)});

  let range = parseInt((max - min)/4);
  let legend = [];
  let domain = [];

 
  legend.push([0, d3.max(legend_vars[1]) + 1]);
  legend.push([d3.max(legend_vars[1]) + 1, d3.max(legend_vars[2]) + 1]);
  legend.push([d3.max(legend_vars[2]) + 1, d3.max(legend_vars[3]) + 1]);
  legend.push([d3.max(legend_vars[3]) + 1, d3.max(legend_vars[4])]);

  // console.log(`max: ${max}`);

  const zoom = d3.zoom()
    .scaleExtent([1, 50])
    .translateExtent([
      [0, 0], [width - margin.left - margin.right, height - margin.top - margin.bottom],
    ])
    .on("zoom", (e) => container.attr("transform", e.transform));

  svg.call(zoom)

  const geoScale = d3
    .geoMercator()
    .fitSize(
      [width - margin.left - margin.right, height - margin.top - margin.bottom], 
      geoData
    );
    
  const fillScale = await d3
    .scaleQuantize()
    .domain(d3.extent(censo, (d) =>  parseFloat(d.INDICE_DEP)))
    .range(d3.schemeGreens[4])
    .nice()

  const geoPaths = d3.geoPath().projection(geoScale);

  leyenda.selectAll("mydotsleyend")
    .data(legend)
    .enter()
    .append("circle")
      .attr("cx", 0)
      .attr("cy", function(d,i){ return 30 + i*25 - 5}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("r", 10)
      .attr("fill", function(d){ return fillScale((d[1] + d[0])/2)})
      .attr("stroke", "black")
      .attr("stroke-width", .5)

  leyenda.selectAll("mytextleyend")
      .data(legend)
      .enter()
      .append("text")
        .attr("x", 20)
        .attr("y", (d, i) => 30 +  i*25)
        .text(function(d) {return `[${d[0]} - ${d[1]}[`})
        .attr("font-family", "Arial, Helvetica, sans-serif")
        .attr("font-size", 13)


  var selected_data = [];


  function clicked(event, d) {

    if (!elems[d.properties.id].selected){
      selected_data.push(elems[d.properties.id]);
      elems[d.properties.id].selected = true;
      ScatterPlot(selected_data, 300, 500, SCATTER_MARGIN, fillScale);
      d3.select(this)
        .attr("fill", "rgb(233, 233, 32)")  //0,02
    }
    else {
      for( var i = 0; i < selected_data.length; i++){ 
        if (selected_data[i].ID === d.properties.id) {
           selected_data.splice(i, 1);
        }
      }

      elems[d.properties.id].selected = false;
      d3.select(this)
      .attr("fill", (d) => fillScale(parseFloat(elems[d.properties.id].INDICE_DEP)))
      ScatterPlot(selected_data, 300, 500, SCATTER_MARGIN, fillScale);
    }

    
  } 


  var comunas = states
    .selectAll("path")
    .data(geoData.features, (d) => d.properties.NAME)
    .join("path")
      .attr("d", geoPaths)
      .attr("fill", (d) => fillScale(parseFloat(elems[d.properties.id].INDICE_DEP)))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.05) //0,02
      .selection()
    .on("click", clicked)

    comunas.append("title")
    .text((d) => elems[d.properties.id].NOM_COMUNA + 
    "\nIndice de dependencia total: "+ elems[d.properties.id].INDICE_DEP);

    ScatterPlot([], 300, 500, SCATTER_MARGIN, fillScale);
}



Chilegraph(HEIGHT, WIDTH, MARGIN)