import json

# Load generated emails
with open("e:/polaris/scratch/emails_array.json", "r", encoding="utf-8") as f:
    emails = json.load(f)

# Read App.tsx
with open("e:/polaris/src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Generate replacement string for INITIAL_EMAILS
# We need it formatted nicely as a JS array definition
js_lines = []
js_lines.append("const INITIAL_EMAILS: Email[] = [")
for email in emails:
    js_lines.append("  {")
    js_lines.append(f"    id: '{email['id']}',")
    js_lines.append(f"    from: {json.dumps(email['from'], ensure_ascii=False)},")
    js_lines.append(f"    subject: {json.dumps(email['subject'], ensure_ascii=False)},")
    js_lines.append(f"    time: {json.dumps(email['time'], ensure_ascii=False)},")
    js_lines.append(f"    unread: {'true' if email['unread'] else 'false'},")
    js_lines.append(f"    avatarLetter: {json.dumps(email['avatarLetter'], ensure_ascii=False)},")
    js_lines.append(f"    avatarColor: '{email['avatarColor']}',")
    js_lines.append(f"    starred: {'true' if email['starred'] else 'false'},")
    js_lines.append(f"    important: {'true' if email['important'] else 'false'},")
    js_lines.append(f"    body: {json.dumps(email['body'], ensure_ascii=False)},")
    js_lines.append("  },")
js_lines.append("];")

replacement = "\n".join(js_lines)

# Find start and end of INITIAL_EMAILS in App.tsx
start_idx = content.find("const INITIAL_EMAILS: Email[] = [")
if start_idx == -1:
    raise ValueError("Could not find INITIAL_EMAILS start in App.tsx")

# Find the ending of INITIAL_EMAILS, which is before "export default function App()"
end_search_idx = content.find("export default function App()", start_idx)
if end_search_idx == -1:
    raise ValueError("Could not find export default function App() in App.tsx")

# Find the last "];" before "export default function App()"
last_close = content.rfind("];", start_idx, end_search_idx)
if last_close == -1:
    raise ValueError("Could not find ending of INITIAL_EMAILS")

# Reconstruct content
new_content = content[:start_idx] + replacement + content[last_close + 2:]

# Replace "1–25 of 299" with "1–50 of 847"
new_content = new_content.replace("1–25 of 299", "1–50 of 847")

# Replace "{emails.map(" with "{emails.slice(0, 50).map("
new_content = new_content.replace("{emails.map((email) => {", "{emails.slice(0, 50).map((email) => {")

# Write back to App.tsx
with open("e:/polaris/src/App.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully patched App.tsx!")
