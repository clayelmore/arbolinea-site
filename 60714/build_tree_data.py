"""Write the data for the interactive tree and the step histogram on the 60714 page.

Run from anywhere with:  /usr/bin/python3 60714/build_tree_data.py
Standard library only. It writes two files, both recomputed from their rules:

  tree-data.json          60714 at five digits. Sort the five digits descending as
                          A >= B >= C >= D >= E, form ADCBE and DEACB, take the absolute
                          difference, pad to five digits, repeat.
  tree-data-146070.json   146070 at six digits. Sort the six digits descending as
                          A >= ... >= F, form BFADCE and CBDEAF, subtract the same way,
                          pad to six digits, repeat.

The layout matches tree.py in the Kaprekar-60714 repo (audit_2026-11/video_60714/), which drew tree.svg:
angle shared out by leaf count (bigger branches first), radius R * (depth / max depth) ** 0.8 on a
1000 x 1000 square with the target's collection at the center.

Each node is one collection of digits (order does not matter, because every step sorts first).
"steps" counts steps to reach the target integer itself, so 60714 is 0 steps and its other
arrangements (41607, 76410, ...) are 1 step. The same holds for 146070.
"""
import itertools
import json
import math
import os
import sys
from collections import defaultdict

W, R = 1000, 455

TREES = [
    {
        "file": "tree-data.json",
        "digits": 5,
        "rule": "ADCBE - DEACB",
        "P": (0, 3, 2, 1, 4),          # ADCBE
        "Q": (3, 4, 0, 2, 1),          # DEACB
        "target": 60714,
        "collections": 1992,
        "strings": 99990,
        "max_steps": 30,
        "example": (58196, 3),
    },
    {
        "file": "tree-data-146070.json",
        "digits": 6,
        "rule": "BFADCE - CBDEAF",
        "P": (1, 5, 0, 3, 2, 4),       # BFADCE
        "Q": (2, 1, 3, 4, 0, 5),       # CBDEAF
        "target": 146070,
        "collections": 4995,
        "strings": 999990,
        "max_steps": 29,
        "example": (124598, 3),
    },
]


def build(cfg):
    D, P, Q, TARGET, N = cfg["digits"], cfg["P"], cfg["Q"], cfg["target"], cfg["strings"]

    def key(digits):
        return "".join(str(x) for x in digits)

    def collection_of(n):
        return tuple(sorted((int(c) for c in str(n).zfill(D)), reverse=True))

    def step_value(s):
        p = int("".join(str(s[i]) for i in P))
        q = int("".join(str(s[i]) for i in Q))
        return abs(p - q)

    def arrangements(s):
        return math.factorial(D) // math.prod(math.factorial(s.count(x)) for x in set(s))

    every = list(itertools.combinations_with_replacement(range(9, -1, -1), D))
    states = [s for s in every if s[0] != s[-1]]
    repdigits = [s for s in every if s[0] == s[-1]]
    assert len(states) == cfg["collections"], len(states)
    for s in repdigits:
        assert step_value(s) == 0
    out = {s: step_value(s) for s in states}          # the number each collection turns into
    nxt = {s: collection_of(out[s]) for s in states}
    root = collection_of(TARGET)
    assert out[root] == TARGET and nxt[root] == root
    assert all(out[s] != 0 for s in states), "a non-repdigit collection goes to 0"

    kids = defaultdict(list)
    for s, t in nxt.items():
        if s != root:
            kids[t].append(s)
    depth, order, stack = {root: 0}, [], [root]
    while stack:
        s = stack.pop()
        order.append(s)
        for k in kids[s]:
            depth[k] = depth[s] + 1
            stack.append(k)
    assert len(order) == len(states), "not every non-repdigit collection reaches %d" % TARGET
    where = {s: i for i, s in enumerate(order)}

    size = {}
    for s in reversed(order):
        size[s] = arrangements(s) + sum(size[k] for k in kids[s])
    assert size[root] == N, size[root]
    assert sum(arrangements(s) for s in states) == N

    leaves = {}
    for s in reversed(order):
        leaves[s] = max(1, sum(leaves[k] for k in kids[s]))
    ang = {}

    def lay(s, a0, a1):
        ang[s] = (a0 + a1) / 2
        a = a0
        for k in sorted(kids[s], key=lambda k: -size[k]):
            w = (a1 - a0) * leaves[k] / leaves[s]
            lay(k, a, a + w)
            a += w
    lay(root, -math.pi / 2, 3 * math.pi / 2)
    DM = max(depth.values())

    def xy(s):
        r = R * (depth[s] / DM) ** 0.8
        return W / 2 + r * math.cos(ang[s]), W / 2 + r * math.sin(ang[s])

    # Steps to the target integer. Every string in a collection turns into the same number out[s].
    steps_of_number = {}

    def steps_num(n):
        if n == TARGET:
            return 0
        if n not in steps_of_number:
            steps_of_number[n] = 1 + steps_num(out[collection_of(n)])
        return steps_of_number[n]

    node_steps = {s: (0 if s == root else 1 + steps_num(out[s])) for s in states}

    # Histogram: how many of the strings need exactly k steps.
    hist = defaultdict(int)
    for s in states:
        if s == root:
            hist[0] += 1                              # the target itself
            hist[1] += arrangements(s) - 1            # its other arrangements
        else:
            hist[node_steps[s]] += arrangements(s)
    max_steps = max(hist)
    counts = [hist.get(k, 0) for k in range(max_steps + 1)]
    assert sum(counts) == N, sum(counts)
    assert max_steps == cfg["max_steps"], max_steps
    assert counts[0] == 1

    # Brute-force cross-check of every string of D digits. Each string is stepped by the rule
    # itself, not through the tree; numbers already followed are remembered so the run stays quick.
    brute = defaultdict(int)
    memo = {TARGET: 0}
    for n in range(10 ** D):
        c = collection_of(n)
        if c[0] == c[-1]:
            continue
        path, m = [], n
        while m not in memo:
            path.append(m)
            m = step_value(collection_of(m))
            assert m != 0 and len(path) <= 60, n
        k = memo[m]
        for x in reversed(path):
            k += 1
            memo[x] = k
        brute[memo[n]] += 1
    assert [brute.get(k, 0) for k in range(max_steps + 1)] == counts
    ex, ex_steps = cfg["example"]
    assert memo[ex] == ex_steps, (ex, memo[ex])

    total, half = 0, None
    for k, c in enumerate(counts):
        total += c
        if half is None and total >= N / 2:
            half = k

    # Nodes in drawing order: deepest rings first, root last (as in tree.py).
    ordered = sorted(states, key=lambda s: (-depth[s], where[s]))
    nodes = []
    for s in ordered:
        x, y = xy(s)
        nodes.append({
            "d": key(s),
            "x": round(x, 2),
            "y": round(y, 2),
            "depth": depth[s],
            "steps": node_steps[s],
            "strings": arrangements(s),
            "through": size[s],
            "next": str(out[s]).zfill(D),
            "parent": None if s == root else key(nxt[s]),
        })
    links = sum(1 for n in nodes if n["parent"] is not None)
    assert links == len(states) - 1

    data = {
        "rule": cfg["rule"],
        "target": str(TARGET),
        "strings": N,
        "collections": len(states),
        "maxDepth": DM,
        "maxSteps": max_steps,
        "medianSteps": half,
        "stepCounts": counts,
        "nodes": nodes,
    }
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, cfg["file"]), "w") as f:
        json.dump(data, f, separators=(",", ":"))
        f.write("\n")

    print("== %d at %d digits (%s) -> %s" % (TARGET, D, cfg["rule"], cfg["file"]))
    print("collections (nodes):", len(states), " links:", links, " strings:", size[root])
    print("max tree depth:", DM, " max steps to %d:" % TARGET, max_steps)
    print("step counts:", counts)
    print("median steps:", half)


def main():
    sys.setrecursionlimit(10000)
    for cfg in TREES:
        build(cfg)
    print("ALL ASSERTIONS PASS")


if __name__ == "__main__":
    main()
