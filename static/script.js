let currentGraphId = "mixed";
let currentPositions = {};   // node -> {x, y} pixel coords inside the SVG
let currentNodes = [];

const svgNS = "http://www.w3.org/2000/svg";


// --------------------------------------------------
// LAYOUT: arrange whatever nodes the selected graph
// has evenly around a circle, so this works no matter
// how many nodes a graph uses (5, 6, etc.)
// --------------------------------------------------

function computeLayout(nodes) {

    const centerX = 350;
    const centerY = 225;
    const radius = 160;

    const positions = {};

    nodes.forEach((node, i) => {

        const angle =
            (2 * Math.PI * i) / nodes.length - Math.PI / 2;

        positions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };

    });

    return positions;
}


// --------------------------------------------------
// LOAD SELECTED GRAPH AND DRAW IT
// --------------------------------------------------

async function loadGraph() {

    currentGraphId =
        document.getElementById("graphSelect").value;

    const response =
        await fetch("/graph-data?graph=" + currentGraphId);

    const data =
        await response.json();

    currentNodes = data.nodes;
    currentPositions = computeLayout(currentNodes);

    drawNetwork(data.nodes, data.edges, data.degrees);

    // Reset searcher / attacker for the new graph
    document.getElementById("attacker").style.display = "none";

    if (currentNodes.length > 0) {
        moveSearcher(currentNodes[0]);
    }

    document.getElementById("result").innerHTML =

        "<h3>" + data.label + "</h3>" +

        "<p><b>Nodes:</b> " + data.nodes.join(", ") + "</p>" +

        "<p><b>Degrees:</b> " +
        data.nodes.map(n => n + "=" + data.degrees[n]).join(", ") +
        "</p>";
}


// --------------------------------------------------
// DRAW NODES + EDGES INTO THE SVG
// --------------------------------------------------

function drawNetwork(nodes, edges, degrees) {

    const svg = document.getElementById("networkSvg");
    svg.innerHTML = "";

    // Edges first, so they sit under the nodes
    edges.forEach(([u, v, weight]) => {

        const p1 = currentPositions[u];
        const p2 = currentPositions[v];

        const line = document.createElementNS(svgNS, "line");

        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "graph-edge-line");

        // Set directly as attributes too, so the edge is always
        // visible even if the external stylesheet class doesn't
        // apply (SVG shapes default to stroke: none otherwise).
        line.setAttribute("stroke", "#555");
        line.setAttribute("stroke-width", "4");

        svg.appendChild(line);

        // Weight label at the edge's midpoint, on a small white
        // "badge" so it stays readable over the line.
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        const badge = document.createElementNS(svgNS, "circle");
        badge.setAttribute("cx", midX);
        badge.setAttribute("cy", midY);
        badge.setAttribute("r", 12);
        badge.setAttribute("fill", "white");
        badge.setAttribute("stroke", "#555");
        badge.setAttribute("stroke-width", "1.5");

        svg.appendChild(badge);

        const weightLabel = document.createElementNS(svgNS, "text");
        weightLabel.setAttribute("x", midX);
        weightLabel.setAttribute("y", midY);
        weightLabel.setAttribute("fill", "#2c3e50");
        weightLabel.setAttribute("font-weight", "bold");
        weightLabel.setAttribute("font-size", "13");
        weightLabel.setAttribute("text-anchor", "middle");
        weightLabel.setAttribute("dominant-baseline", "central");
        weightLabel.textContent = weight;

        svg.appendChild(weightLabel);
    });

    // Nodes on top (odd-degree nodes shown in orange)
    nodes.forEach(node => {

        const p = currentPositions[node];

        const circle = document.createElementNS(svgNS, "circle");

        circle.setAttribute("cx", p.x);
        circle.setAttribute("cy", p.y);
        circle.setAttribute("r", 27);
        circle.setAttribute("class", "graph-node-circle");

        const isOdd = degrees[node] % 2 === 1;

        circle.setAttribute("fill", isOdd ? "#e67e22" : "#3498db");
        circle.setAttribute("stroke", "#2c3e50");
        circle.setAttribute("stroke-width", "2");

        svg.appendChild(circle);

        const text = document.createElementNS(svgNS, "text");

        text.setAttribute("x", p.x);
        text.setAttribute("y", p.y);
        text.setAttribute("class", "graph-node-label");
        text.setAttribute("fill", "white");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("font-size", "18");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.textContent = node;

        svg.appendChild(text);
    });
}


// --------------------------------------------------
// MOVE SEARCHER
// --------------------------------------------------

function moveSearcher(node) {

    const searcher =
        document.getElementById("searcher");

    const p = currentPositions[node];

    searcher.style.left = (p.x - 22) + "px";
    searcher.style.top = (p.y - 22) + "px";
}


// --------------------------------------------------
// GENERATE CPT
// --------------------------------------------------

async function generateCPT() {

    const response =
        await fetch("/generate-cpt?graph=" + currentGraphId);

    const data =
        await response.json();

    const route =
        data.route.join(" → ");

    document.getElementById("result").innerHTML =

        "<h3>Chinese Postman Tour (CPT)</h3>" +

        "<p><b>Odd-degree nodes:</b> " +

        data.odd_nodes.join(", ") +

        "</p>" +

        "<p><b>CPT Route:</b> " +

        route +

        "</p>" +

        "<p><b>Total distance (sum of weights):</b> " +

        data.total_weight +

        "</p>" +

        "<p><b>Edges traveled:</b> " +

        data.edge_count +

        "</p>";

}


// --------------------------------------------------
// HIDE ATTACKER
// --------------------------------------------------

function hideAttacker() {

    const attacker =
        document.getElementById("attacker");

    const randomNode =
        currentNodes[Math.floor(Math.random() * currentNodes.length)];

    const p = currentPositions[randomNode];

    attacker.dataset.location =
        randomNode;

    attacker.style.left = (p.x - 22) + "px";
    attacker.style.top = (p.y - 22) + "px";

    attacker.style.display =
        "block";


    document.getElementById("result").innerHTML =

        "<h3>🔴 Hidden Attacker</h3>" +

        "<p>The attacker is hidden somewhere in the network.</p>" +

        "<p>Security agent must search the network.</p>";

}


// --------------------------------------------------
// RUN RCPT
// --------------------------------------------------

async function runRCPT() {

    const response =
        await fetch("/generate-cpt?graph=" + currentGraphId);

    const data =
        await response.json();

    let route =
        data.route;


    let random =
        Math.random();


    let selectedRoute;

    let routeType;


    if (random < 0.5) {

        selectedRoute =
            route;

        routeType =
            "CPT";

    }

    else {

        selectedRoute =
            [...route].reverse();

        routeType =
            "Reverse CPT";

    }


    document.getElementById("result").innerHTML =

        "<h3>🎲 RCPT Started</h3>" +

        "<p><b>Random choice:</b> " +

        routeType +

        "</p>" +

        "<p><b>Route:</b> " +

        selectedRoute.join(" → ") +

        "</p>" +

        "<p>Security agent is searching...</p>";


    await animateSearch(selectedRoute);
}


// --------------------------------------------------
// SEARCH ANIMATION
// --------------------------------------------------

async function animateSearch(route) {

    const attacker =
        document.getElementById("attacker");


    const attackerLocation =
        attacker.dataset.location;


    for (let node of route) {

        moveSearcher(node);


        await new Promise(
            resolve => setTimeout(resolve, 1000)
        );


        if (
            attacker.style.display !== "none" &&
            node === attackerLocation
        ) {

            document.getElementById("result").innerHTML =

                "<h2>🚨 ATTACKER DETECTED!</h2>" +

                "<p><b>Location:</b> " +

                node +

                "</p>" +

                "<p>The security agent found the hidden attacker.</p>";


            attacker.style.display =
                "block";


            return;
        }

    }


    document.getElementById("result").innerHTML =

        "<h3>Search Completed</h3>" +

        "<p>The entire CPT route was searched.</p>" +

        "<p>Attacker was not found on this route.</p>";

}