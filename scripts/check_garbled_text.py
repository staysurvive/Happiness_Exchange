from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "frontend" / "src",
    ROOT / "backend" / "app",
    ROOT / "docs",
]
SUFFIXES = {".ts", ".tsx", ".py", ".md"}
PATTERN = re.compile(r"\?{3,}")


def main() -> int:
    hits: list[str] = []
    for target in TARGETS:
        if not target.exists():
            continue
        for path in target.rglob("*"):
            if not path.is_file() or path.suffix not in SUFFIXES:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            for lineno, line in enumerate(text.splitlines(), 1):
                if PATTERN.search(line):
                    hits.append(f"{path}:{lineno}: {line.strip()}")

    if hits:
        print("发现疑似乱码问号文本：")
        for item in hits:
            print(item)
        return 1

    print("未发现疑似乱码问号文本。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
