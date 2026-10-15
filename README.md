# Water Distribution Network Optimizer

A **network flow simulator** that models a city's water supply as a flow network. It computes the maximum water delivery from reservoirs to neighborhoods with **Edmonds-Karp** and **Ford-Fulkerson**, finds the **minimum cut**, identifies **bottleneck pipes** and suggests **capacity upgrades**.

> **Course:** BCSE204P - Design and Analysis of Algorithms (Lab)
> **Project:** Digital Assignment, Project 12 - Network Flows (Syllabus: Exp 8)
> **Live demo:** _add your GitHub Pages link here_

## Features

- Visual graph editor: add reservoirs, junctions and neighborhoods, lay one-way pipes, drag nodes, edit or delete pipes
- Multiple sources and multiple sinks (a super-source and super-sink with unlimited capacity are added internally)
- Edmonds-Karp (BFS) and Ford-Fulkerson (DFS) with step-by-step animation of each augmenting path
- Flow visualization: every pipe shows flow/capacity, colored from blue to red as it fills
- Minimum cut highlighted (dashed red pipes, shaded source side)
- Bottleneck report: per-pipe utilization and status (Bottleneck, Saturated, OK, Unused)
- Upgrade suggestions: tests +N units on each pipe, ranks them by gain in total flow, and applies a chosen upgrade
- **Min-cost max-flow:** every pipe has a pumping cost, and the cheapest-path routing delivers the same maximum water at the lowest total cost
- **Failure and vulnerability analysis:** removes each pipe, reservoir and junction in turn, ranks the damage, gives a resilience score, and simulates a burst on the map
- **Algorithm benchmark:** Ford-Fulkerson vs Edmonds-Karp vs Dinic on random networks up to 400 nodes, with a table and time chart
- Compares augmentation counts of the algorithms; light and dark theme

## How it works

1. **Model:** reservoirs are sources, neighborhoods are sinks, pipes are directed edges with capacities.
2. **Augment:** repeatedly find a path from source to sink that still has spare capacity (in the residual graph), push the bottleneck amount along it, and update the residual capacities.
3. **Stop** when no augmenting path exists. The total pushed is the maximum flow.
4. **Min cut:** the nodes still reachable from the source in the residual graph form one side of the cut. Pipes leaving that side are full, and their capacities add up to the maximum flow (max-flow min-cut theorem). These are the bottlenecks.
5. **Upgrades:** only pipes that belong to a minimum cut can raise the total flow, so each pipe is tested with extra capacity and the gain in maximum flow is reported.

| Algorithm | Path search | Time |
|---|---|---|
| Ford-Fulkerson | DFS (any path) | O(E · f), depends on the flow value f |
| Edmonds-Karp | BFS (shortest path) | O(V · E²), independent of capacities |
| Dinic | level graph + blocking flow | O(V² · E) |
| Min-cost max-flow | cheapest path (SPFA) | O(f · V · E) |

## Project structure

```
water-network-optimizer/
├── index.html
├── css/style.css
├── js/
│   ├── utils.js     DOM and theme helpers
│   ├── flow.js      max flow (EK, FF), min-cost flow, Dinic, min cut
│   ├── graph.js     network model and sample city
│   ├── render.js    canvas drawing
│   ├── editor.js    visual graph editor
│   ├── app.js       controls, animation, report and upgrades
│   └── analysis.js  failure analysis and algorithm benchmark
├── README.md
├── LICENSE
└── .gitignore
```

## Run locally

No installation or build step. Download or clone the repository and open `index.html` in a modern browser.

## Usage

1. Load the sample city, or build your own with the tool buttons.
2. Choose an algorithm and press **Run** (or **Step**, or **Finish**).
3. Read the progress log, the highlighted min cut and the analysis report. Apply a suggested upgrade and see the new maximum flow.

## Tech stack

HTML, CSS and vanilla JavaScript with the Canvas API. No libraries.

## Author

**Mounya** - VIT-AP University
GitHub: [@monya200727](https://github.com/monya200727)

## License

Released under the [MIT License](LICENSE).
