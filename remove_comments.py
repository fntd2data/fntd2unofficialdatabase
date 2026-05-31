from pathlib import Path

INPUT_FILES = ['config.js', 'data.js', 'index.html', 'script.js', 'styles.css']

for fname in INPUT_FILES:
    path = Path(fname)
    text = path.read_text(encoding='utf-8')
    ext = path.suffix.lower()
    out_chars = []
    i = 0
    n = len(text)
    in_str = None
    in_escape = False
    in_comment = False
    comment_type = None

    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ''

        if in_comment:
            if comment_type == 'line':
                if c == '\n':
                    in_comment = False
                    out_chars.append(c)
                i += 1
                continue
            if comment_type == 'block':
                if c == '*' and nxt == '/':
                    in_comment = False
                    i += 2
                    continue
                if c == '\n':
                    out_chars.append(c)
                i += 1
                continue
            if comment_type == 'html':
                if text[i:i+3] == '-->':
                    in_comment = False
                    i += 3
                    continue
                i += 1
                continue

        if in_str:
            out_chars.append(c)
            if in_escape:
                in_escape = False
            elif c == '\\':
                in_escape = True
            elif c == in_str:
                in_str = None
            i += 1
            continue

        if c in ('"', "'", '`'):
            in_str = c
            out_chars.append(c)
            i += 1
            continue

        if ext in ('.js', '.css') and c == '/' and nxt == '*':
            in_comment = True
            comment_type = 'block'
            i += 2
            continue

        if ext == '.js' and c == '/' and nxt == '/':
            in_comment = True
            comment_type = 'line'
            i += 2
            continue

        if ext == '.html' and text[i:i+4] == '<!--':
            in_comment = True
            comment_type = 'html'
            i += 4
            continue

        out_chars.append(c)
        i += 1

    new_text = ''.join(out_chars)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        print(f'Cleaned {fname}')
    else:
        print(f'No comments found in {fname}')
