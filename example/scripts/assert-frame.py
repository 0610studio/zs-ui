#!/usr/bin/env python3
"""Maestro hierarchy 에서 resource-id 요소의 프레임(폭·위치)을 확인한다 — Maestro 플로우는 크기·위치를 단언할 수 없다.
값은 hierarchy 단위 그대로다(iOS pt, Android px).

usage: python3 assert-frame.py <udid> <resource-id> [--width W] [--left X] [--min-left X] [--max-right X] [--right-of ID] [--min-height H] [--square] [--above ID] [--tolerance T]
  --width·--left 는 ±tolerance(기본 1), --min-left·--max-right 는 경계(접힘선 한쪽 절반 안에 있는지 등),
  --right-of 는 다른 요소와 오른쪽 끝이 같은지(앵커에 맞춘 PopOver 등), --min-height 는 높이 하한(창 높이를 따르는 시트 등)
  --square 는 정사각형, --above 는 다른 요소 위에 완전히 놓이는지 확인한다.
"""
import argparse
import json
import os
import subprocess
import sys


def find(node, rid):
    if node.get('attributes', {}).get('resource-id') == rid:
        return node
    for child in node.get('children', []):
        hit = find(child, rid)
        if hit:
            return hit
    return None


def parse(bounds):
    return [tuple(map(int, part.split(','))) for part in bounds.strip('[]').split('][')]


def main():
    parser = argparse.ArgumentParser(usage=__doc__)
    parser.add_argument('udid')
    parser.add_argument('rid')
    parser.add_argument('--width', type=float)
    parser.add_argument('--left', type=float)
    parser.add_argument('--min-left', type=float)
    parser.add_argument('--max-right', type=float)
    parser.add_argument('--right-of')
    parser.add_argument('--min-height', type=float)
    parser.add_argument('--square', action='store_true')
    parser.add_argument('--above')
    parser.add_argument('--tolerance', type=float, default=1.0)
    args = parser.parse_args()

    maestro = os.path.expanduser('~/.maestro/bin/maestro')
    out = subprocess.run([maestro, '--udid', args.udid, 'hierarchy'], capture_output=True, text=True, check=True).stdout
    tree = json.loads(out[out.index('{'):])
    node = find(tree, args.rid)
    if not node:
        print(f'FAIL {args.rid}: not found')
        sys.exit(1)
    bounds = node['attributes']['bounds']  # "[x1,y1][x2,y2]"
    (x1, y1), (x2, y2) = parse(bounds)
    width = x2 - x1
    height = y2 - y1

    checks = []
    if args.width is not None:
        checks.append((f'width {width} ≈ {args.width:g}', abs(width - args.width) <= args.tolerance))
    if args.left is not None:
        checks.append((f'left {x1} ≈ {args.left:g}', abs(x1 - args.left) <= args.tolerance))
    if args.min_left is not None:
        checks.append((f'left {x1} ≥ {args.min_left:g}', x1 >= args.min_left - args.tolerance))
    if args.max_right is not None:
        checks.append((f'right {x2} ≤ {args.max_right:g}', x2 <= args.max_right + args.tolerance))
    if args.right_of is not None:
        other = find(tree, args.right_of)
        if not other:
            print(f'FAIL {args.right_of}: not found')
            sys.exit(1)
        (_, _), (other_x2, _) = parse(other['attributes']['bounds'])
        checks.append((f'right {x2} = {args.right_of} right {other_x2}', abs(x2 - other_x2) <= args.tolerance))
    if args.min_height is not None:
        checks.append((f'height {height} ≥ {args.min_height:g}', height >= args.min_height - args.tolerance))

    if args.square:
        checks.append((f'square {width} × {height}', width > 0 and height > 0 and abs(width - height) <= args.tolerance))
    if args.above:
        other = find(tree, args.above)
        if not other:
            print(f'FAIL {args.above}: not found')
            sys.exit(1)
        (_, top), _ = parse(other['attributes']['bounds'])
        checks.append((f'bottom {y2} ≤ {args.above} top {top}', y2 <= top + args.tolerance))

    ok = all(passed for _, passed in checks)
    detail = ', '.join(f"{label}{'' if passed else ' ✗'}" for label, passed in checks) or 'found'
    print(f"{'PASS' if ok else 'FAIL'} {args.rid}: {detail} bounds {bounds}")
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
