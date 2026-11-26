"""Write tree-data.json for the interactive tree and the step histogram on the 60714 page.

Run from anywhere with:  /usr/bin/python3 60714/build_tree_data.py
Standard library only. Everything is recomputed from the rule:
  sort the five digits descending as A >= B >= C >= D >= E, form ADCBE and DEACB,
  take the absolute difference, pad to five digits, repeat.

The layout matches tree.py in the Kaprekar-60714 repo (audit_2026-11/video_60714/), which drew tree.svg:
angle shared out by leaf count (bigger branches first), radius R * (depth / max depth) ** 0.8 on a
1000 x 1000 square with 60714's collection at the center.

Each node is one collection of five digits (order does not matter, because every step sorts first).
"steps" counts steps to reach the integer 60714 itself, so 60714 is 0 steps and its other
arrangements (41607, 76410, ...) are 1 step.
"""
import itertools
import json
import math
import os
import sys
from collections import defaultdict

D = 5
P = (0, 3, 2, 1, 4)        # ADCBE
Q = (3, 4, 0, 2, 1)        # DEACB
TARGET = 60714
W, R = 1000, 455


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


def main():
    sys.setrecursionlimit(10000)
    states = [s for s in itertools.combinations_with_replacement(range(9, -1, -1), D) if s[0] != s[-1]]
    repdigits = [s for s in itertools.combinations_with_replacement(range(9, -1, -1), D) if s[0] == s[-1]]
    assert len(states) == 1992, len(states)
    for s in repdigits:
        assert step_value(s) == 0
    out = {s: step_value(s) for s in states}          # the number each collection turns into
    nxt = {s: collection_of(out[s]) for s in states}
    root = collection_of(TARGET)
    assert out[root] == TARGET and nxt[root] == root

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
    assert len(order) == len(states), "not every non-repdigit collection reaches 60714"

    size = {}
    for s in reversed(order):
        size[s] = arrangements(s) + sum(size[k] for k in kids[s])
    assert size[root] == 99990, size[root]
    assert sum(arrangements(s) for s in states) == 99990

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

    # Steps to the integer 60714. Every string in a collection turns into the same number out[s].
    steps_of_number = {}

    def steps_num(n):
        if n == TARGET:
            return 0
        if n not in steps_of_number:
            steps_of_number[n] = 1 + steps_num(out[collection_of(n)])
        return steps_of_number[n]

    node_steps = {s: (0 if s == root else 1 + steps_num(out[s])) for s in states}

    # Histogram: how many of the 99,990 strings need exactly k steps.
    hist = defaultdict(int)
    for s in states:
        if s == root:
            hist[0] += 1                              # 60714 itself
            hist[1] += arrangements(s) - 1            # its other 119 arrangements
        else:
            hist[node_steps[s]] += arrangements(s)
    max_steps = max(hist)
    counts = [hist.get(k, 0) for k in range(max_steps + 1)]
    assert sum(counts) == 99990, sum(counts)
    assert max_steps == 30, max_steps
    assert counts[0] == 1

    # Brute-force cross-check of every one of the 100,000 strings.
    brute = defaultdict(int)
    for n in range(100000):
        if collection_of(n)[0] == collection_of(n)[-1]:
            continue
        k, m = 0, n
        while m != TARGET:
            m = step_value(collection_of(m))
            k += 1
            assert k <= 40, n
        brute[k] += 1
    assert [brute.get(k, 0) for k in range(max_steps + 1)] == counts

    # Nodes in drawing order: deepest rings first, root last (as in tree.py).
    ordered = sorted(states, key=lambda s: (-depth[s], order.index(s)))
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

    data = {
        "rule": "ADCBE - DEACB",
        "target": "60714",
        "strings": 99990,
        "collections": len(states),
        "maxDepth": DM,
        "maxSteps": max_steps,
        "stepCounts": counts,
        "nodes": nodes,
    }
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "tree-data.json"), "w") as f:
        json.dump(data, f, separators=(",", ":"))
        f.write("\n")

    total, half = 0, None
    for k, c in enumerate(counts):
        total += c
        if half is None and total >= 99990 / 2:
            half = k
    print("collections:", len(states), " links:", len(states) - 1, " strings:", size[root])
    print("max tree depth:", DM, " max steps to 60714:", max_steps)
    print("step counts:", counts)
    print("median steps:", half)
    print("ALL ASSERTIONS PASS")


if __name__ == "__main__":
    main()
