import { GetAllPODS, GetAllRaw, GetAllUnlocks, GetFilteredRaw } from "./inmemoryDB"
import { Request, Response } from 'express';

interface Node {
    id: string
    name: string
    image: string
}

interface Edge {
    source: number
    target: number
}



const generateGraphDataStructure = async (sid: string | undefined) => {
    const semaphoretoIdMap = new Map<string, number>();
    const getId = (sid: string) => {
        if (semaphoretoIdMap.has(sid)) {
            return semaphoretoIdMap.get(sid)
        }
        const id = semaphoretoIdMap.size;
        semaphoretoIdMap.set(sid, id);
        return id;
    }
    const allEntries = sid == undefined ? await GetAllRaw() : await GetFilteredRaw(sid);
    const nodes = allEntries.map((pod, index) => {
        return { id: getId(pod.attendeeSemaphoreId), name: pod.title, image: pod.url }
    })
    // only unlocks where both sIDs are in the allEntries are valid
    const validUnlocks = await GetAllUnlocks().filter(unlock => allEntries.some(entry => entry.attendeeSemaphoreId === unlock.sid_a) && allEntries.some(entry => entry.attendeeSemaphoreId === unlock.sid_b));

    const edges = validUnlocks.map((edge, index) => {

        return { source: getId(edge.sid_a), target: getId(edge.sid_b) }
    })


    return { nodes, edges }
}

export const graphBuilder = async (req: Request, res: Response) => {
    // check if we have sid query parameter
    const queryParams = req.query;
    var sid = queryParams.sid as string | undefined;

    const data = await generateGraphDataStructure(sid);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Graph Visualization</title>
        <style>
            body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f0f0f0;
            }
            svg {
                width: 100%;
                height: 100%;
                border: 1px solid black;
            }
            .node-image {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-size: cover;
                background-position: center;
            }
            .glow {
                stroke: #7393B3;
                stroke-width: 2;
                filter: url(#glow);
                animation: glowPulse 2s infinite;
            }
            @keyframes glowPulse {
                0% {
                    stroke-opacity: 0.1;
                }
                50% {
                    stroke-opacity: 0.3;
                }
                100% {
                    stroke-opacity: 0.1;
                }
            }
        </style>
    </head>
    <body>
        <svg></svg>
        <script src="https://d3js.org/d3.v6.min.js"></script>
        <script>
            const data = ${JSON.stringify(data)};
            
            const width = 928;
            const height = 680;
            
            const color = d3.scaleOrdinal(d3.schemeCategory10);

            const links = data.edges.map(d => ({...d}));
            const nodes = data.nodes.map(d => ({...d}));

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(100))
                .force("charge", d3.forceManyBody().strength(-150))
                .force("x", d3.forceX())
                .force("y", d3.forceY());

            const svg = d3.select("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .attr("style", "max-width: 100%; height: auto;");

                // Add SVG filter for glow effect
                svg.append("defs").append("filter")
                    .attr("id", "glow")
                    .append("feGaussianBlur")
                    .attr("stdDeviation", "2.5")
                    .attr("result", "coloredBlur");
    
                const feMerge = svg.select("filter")
                    .append("feMerge");
    
                feMerge.append("feMergeNode")
                    .attr("in", "coloredBlur");
                feMerge.append("feMergeNode")
                    .attr("in", "SourceGraphic");

            const link = svg.append("g")
                .attr("stroke", "#33333")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", 2)
                .attr("class", "glow"); // Apply the glow class

            const node = svg.append("g")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .selectAll("g")
                .data(nodes)
                .enter()
                .append("g");

            node.append("foreignObject")
                .attr("width", 40)
                .attr("height", 40)
                .attr("x", -20)
                .attr("y", -20)
                .append("xhtml:div")
                .attr("class", "node-image")
                .style("background-image", d => \`url(\${d.image})\`);

            node.append("title")
                .text(d => d.name);

            node.call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node.attr("transform", d => \`translate(\${d.x},\${d.y})\`);
            });

            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
        </script>
    </body>
    </html>
  `;
    res.send(htmlContent);
}

