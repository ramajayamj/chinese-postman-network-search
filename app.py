from flask import Flask, render_template, jsonify, request
import networkx as nx

app = Flask(__name__)


# --------------------------------------------------
# GRAPH DEFINITIONS
# --------------------------------------------------
# "mixed" is your original graph (2 odd-degree nodes: A, C).
# "even"  is a 5-cycle -> every node has degree 2 (all even),
#         so it is ALREADY Eulerian (no duplicated edges needed).
# "odd"   is K(3,3) (complete bipartite, {A,B,C} vs {D,E,F}) ->
#         every node has degree 3 (all odd). Note: a graph with
#         an ODD number of vertices can never have ALL odd
#         degrees (handshake lemma: sum of degrees is always
#         even), so this graph uses 6 nodes instead of 5.
# --------------------------------------------------

GRAPHS = {

    "mixed": {
        "label": "Mixed Graph (2 Odd-Degree Vertices)",
        # (node, node, weight)
        "edges": [
            ("A", "B", 4),
            ("B", "C", 3),
            ("C", "E", 5),
            ("E", "D", 2),
            ("D", "A", 6),
            ("A", "C", 7),
        ],
    },

    "even": {
        "label": "All Even-Degree Graph (Already Eulerian)",
        "edges": [
            ("A", "B", 3),
            ("B", "C", 4),
            ("C", "D", 2),
            ("D", "E", 5),
            ("E", "A", 6),
        ],
    },

    "odd": {
        "label": "All Odd-Degree Graph (K3,3)",
        "edges": [
            ("A", "D", 2), ("A", "E", 5), ("A", "F", 3),
            ("B", "D", 4), ("B", "E", 2), ("B", "F", 6),
            ("C", "D", 3), ("C", "E", 4), ("C", "F", 2),
        ],
    },

}


def build_graph(graph_id):
    edges = GRAPHS[graph_id]["edges"]
    G = nx.Graph()
    G.add_weighted_edges_from(edges)
    return G


# --------------------------------------------------
# CHINESE POSTMAN TOUR (same algorithm as before,
# generalized to accept any graph + start node)
# --------------------------------------------------

def chinese_postman_tour(G, start):

    odd_nodes = [
        node for node in G.nodes()
        if G.degree(node) % 2 == 1
    ]

    if len(odd_nodes) == 0:

        euler_graph = nx.MultiGraph(G)

    else:

        shortest_paths = dict(
            nx.all_pairs_dijkstra_path_length(G, weight="weight")
        )

        odd_graph = nx.Graph()

        for i in range(len(odd_nodes)):
            for j in range(i + 1, len(odd_nodes)):

                u = odd_nodes[i]
                v = odd_nodes[j]

                distance = shortest_paths[u][v]

                odd_graph.add_edge(u, v, weight=distance)

        matching = nx.min_weight_matching(
            odd_graph, weight="weight"
        )

        euler_graph = nx.MultiGraph(G)

        for u, v in matching:

            path = nx.shortest_path(
                G, source=u, target=v, weight="weight"
            )

            for k in range(len(path) - 1):

                a = path[k]
                b = path[k + 1]

                # Reuse the real edge weight for the duplicated
                # copy, instead of a flat placeholder, so the
                # total distance stays accurate.
                edge_weight = G[a][b]["weight"]

                euler_graph.add_edge(a, b, weight=edge_weight)

    circuit = list(
        nx.eulerian_circuit(euler_graph, source=start)
    )

    route = [circuit[0][0]]
    total_weight = 0

    for u, v in circuit:

        route.append(v)

        # euler_graph is a MultiGraph, so get_edge_data returns a
        # dict of parallel edges; any of them has the same weight
        # here (a duplicate always mirrors its original edge).
        edge_data = euler_graph.get_edge_data(u, v)
        total_weight += next(iter(edge_data.values()))["weight"]

    return route, odd_nodes, total_weight


# --------------------------------------------------
# HOME PAGE
# --------------------------------------------------

@app.route("/")
def home():
    graph_options = [
        {"id": gid, "label": g["label"]}
        for gid, g in GRAPHS.items()
    ]
    return render_template("index.html", graph_options=graph_options)


# --------------------------------------------------
# GRAPH DATA (nodes/edges/degrees for the picker)
# --------------------------------------------------

@app.route("/graph-data")
def graph_data():

    graph_id = request.args.get("graph", "mixed")
    if graph_id not in GRAPHS:
        graph_id = "mixed"

    G = build_graph(graph_id)

    nodes = sorted(G.nodes())
    edges = [[u, v, d["weight"]] for u, v, d in G.edges(data=True)]
    degrees = {n: G.degree(n) for n in nodes}

    return jsonify({
        "nodes": nodes,
        "edges": edges,
        "degrees": degrees,
        "label": GRAPHS[graph_id]["label"],
    })


# --------------------------------------------------
# CPT API
# --------------------------------------------------

@app.route("/generate-cpt")
def generate_cpt():

    graph_id = request.args.get("graph", "mixed")
    if graph_id not in GRAPHS:
        graph_id = "mixed"

    G = build_graph(graph_id)
    start = sorted(G.nodes())[0]

    route, odd_nodes, total_weight = chinese_postman_tour(G, start)

    return jsonify({
        "route": route,
        "odd_nodes": odd_nodes,
        "edge_count": len(route) - 1,
        "total_weight": total_weight,
    })


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True)