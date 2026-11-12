#!/usr/bin/env python3
"""Verify the portable static review assets on Windows, macOS or Linux.

Run: py integrity.py
After intentionally adding/replacing reviewed files: py integrity.py --refresh
Refreshing records hashes; it does not approve artwork or authorize generation.
"""
from pathlib import Path
import argparse
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "assets-manifest.json"
SHOT_NAMES = ["door-ajar", "door-open", "private-club", "mask-crossing",
              "vampire-castle", "coastal-reflection", "athlete-house",
              "helmet-crossing", "midnight-garage", "mirror-crossing",
              "elven-court", "map-crossing", "roommates", "reserved-place"]
SCENES = ["private-club", "vampire-castle", "athlete-house",
          "midnight-garage", "elven-court", "roommates"]
EXPECTED = [(f"keyframes-r2/{i:02d}-{name}.png", "current static candidate")
            for i, name in enumerate(SHOT_NAMES, 1)]
EXPECTED += [(f"references/{name}.png", "original identity reference") for name in SCENES]
EXPECTED += [("brand/pisco-r5.svg", "exact supplied current logo")]
SUPPORT = [("brand/inria-serif-400.ttf", "local font"),
           ("brand/inria-serif-OFL.txt", "font license")]


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def entry(rel, role):
    path = ROOT / rel
    item = {"path": rel, "role": role, "present": path.is_file()}
    if path.is_file():
        item.update(bytes=path.stat().st_size, sha256=digest(path))
    return item


def refresh():
    assets = [entry(*item) for item in EXPECTED]
    support = [entry(*item) for item in SUPPORT]
    missing = [item["path"] for item in assets + support if not item["present"]]
    data = {"schemaVersion": 1, "packageDate": "2026-11-12",
            "revision": "r2 static candidates / exact r5 logo",
            "status": "incomplete" if missing else "complete files; user visual review pending",
            "pathBase": ".", "expectedCoreAssetCount": 21,
            "expectedCurrentFrames": 14, "expectedOriginalReferences": 6,
            "currentFrameCount": sum(1 for x in assets if x["path"].startswith("keyframes-r2/") and x["present"]),
            "assets": assets, "supportAssets": support, "missing": missing,
            "note": "Hash checks verify file integrity only, not creative approval, video generation, or publication."}
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Refreshed assets-manifest.json")


def verify():
    if not MANIFEST.is_file():
        print("Missing assets-manifest.json; run with --refresh after assembling the files.")
        return 1
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    failed = []
    checked = 0
    items = data.get("assets", []) + data.get("supportAssets", [])
    recorded = {item["path"] for item in items}
    for rel, _ in EXPECTED + SUPPORT:
        if rel not in recorded:
            failed.append("UNRECORDED " + rel)
    for item in items:
        rel = item["path"]
        path = ROOT / rel
        if Path(rel).is_absolute() or ".." in Path(rel).parts:
            failed.append("UNSAFE PATH " + rel)
        elif not path.is_file():
            failed.append("MISSING " + rel)
        elif not item.get("sha256"):
            failed.append("UNHASHED " + rel + " (intentionally refresh manifest after adding file)")
        elif digest(path) != item["sha256"]:
            failed.append("HASH MISMATCH " + rel)
        else:
            checked += 1
    for message in failed:
        print(message)
    print(f"Verified {checked}/{len(EXPECTED) + len(SUPPORT)} expected core/support files.")
    print("Visual approval and video generation are separate from integrity verification.")
    return 1 if failed else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="Record intentional asset changes; does not approve them")
    args = parser.parse_args()
    if args.refresh:
        refresh()
    sys.exit(verify())
