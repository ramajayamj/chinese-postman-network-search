# CPP-RCPT Network Search

An interactive Flask-based visualization of the **Chinese Postman Problem (CPP)** and **Random Chinese Postman Tour (RCPT)** for network search and cybersecurity applications.

## Overview

This project provides a practical visualization of how a network can be completely traversed using the Chinese Postman Problem and how the resulting Chinese Postman Tour can be used in the Random Chinese Postman Tour strategy.

The project is developed as a **cybersecurity interpretation and practical visualization of the Searcher–Hider model** discussed in the paper:

> Thomas Lidbetter, *On the Approximation Ratio of the Random Chinese Postman Tour for Network Search*, 2017.

The visualization represents a security monitoring agent searching a network for a hidden attacker.

## Key Concepts

### Chinese Postman Problem (CPP)

CPP finds a shortest closed route that traverses every edge of the network at least once.

In the demonstration:

1. The degree of every vertex is calculated.
2. Odd-degree vertices are identified.
3. The shortest paths between odd-degree vertices are determined.
4. Odd vertices are paired using minimum-weight matching.
5. The required edges/paths are duplicated.
6. The resulting graph becomes Eulerian.
7. An Eulerian circuit is generated as the Chinese Postman Tour (CPT).

### Random Chinese Postman Tour (RCPT)

RCPT randomly chooses between:

- The Chinese Postman Tour (CPT)
- The reverse of the CPT

with equal probability.

This provides a randomized search strategy when the location of the hidden target is unknown.

## Cybersecurity Interpretation

The project maps the Searcher–Hider model to a network-security scenario:

| Search Model | Cybersecurity Interpretation |
|---|---|
| Network | Computer network |
| Vertex | Computer/router/device |
| Edge | Communication link |
| Searcher | Security monitoring agent |
| Hider | Hidden attacker/compromised location |
| CPT | Complete network monitoring route |
| RCPT | Randomized CPT/reverse-CPT strategy |
| Search time | Detection time |

This is a practical interpretation of the mathematical search model rather than a claim that the original paper directly implements a computer-network security system.

## Features

- Interactive network visualization
- Identification of odd-degree vertices
- Visualization of CPP edge duplication
- Display of vertex degrees before and after CPP
- Generation of a Chinese Postman Tour
- Random selection between CPT and reverse CPT
- Simulated attacker hiding
- Search animation
- Flask-based local web application

## Technologies Used

- Python
- Flask
- NetworkX
- HTML
- CSS
- JavaScript

## Project Structure

```text
cpp-rcpt-network-search/
│
├── app.py
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/cpp-rcpt-network-search.git
```

Move into the project directory:

```bash
cd cpp-rcpt-network-search
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the required packages:

```bash
pip install flask networkx
```

## Running the Application

Run:

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## How the Demonstration Works

### Step 1 — Generate CPT

The application analyzes the network and identifies odd-degree vertices.

For the demonstration graph, vertices **A** and **C** have odd degree.

The shortest path between them is identified, and the required edge is duplicated.

This makes all vertex degrees even and allows an Eulerian circuit to be generated.

### Step 2 — Chinese Postman Tour

The Eulerian circuit produced after CPP becomes the CPT.

The CPT traverses every network edge while forming a complete closed route.

### Step 3 — Hide Attacker

The attacker is randomly placed at a network vertex.

The attacker represents a hidden location that the security monitoring agent needs to discover.

### Step 4 — Run RCPT

The application randomly selects:

```text
50% → CPT
50% → Reverse CPT
```

The selected route is then used to search the network.

## Theoretical Basis

The paper proves that the approximation ratio of RCPT is at most:

```text
4/3
```

This means the worst-case expected search time of RCPT is bounded by **4/3 times the optimal search value**.

The 4/3 value is a theoretical worst-case guarantee and should not be interpreted as meaning that RCPT always takes 33% more time.

## Reference

Lidbetter, T. (2017). *On the Approximation Ratio of the Random Chinese Postman Tour for Network Search*. arXiv:1512.07215.

## Disclaimer

This project is an educational implementation and visualization of CPP and RCPT concepts. The cybersecurity scenario is used to demonstrate how the Searcher–Hider network-search model can be interpreted as a security monitoring problem.

