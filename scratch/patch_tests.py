import json

# Load emails
with open("e:/polaris/scratch/emails_array.json", "r", encoding="utf-8") as f:
    emails = json.load(f)

# Get first 50 subjects
first_50_subjects = [email["subject"] for email in emails[:50]]
subjects_js_array = json.dumps(first_50_subjects, indent=6, ensure_ascii=False)

# 1. Patch module4.test.tsx
with open("e:/polaris/tests/module4.test.tsx", "r", encoding="utf-8") as f:
    m4 = f.read()

# Replace senders list
old_senders = """    const sendersToCheck = [
      'Blaine, me',
      'Mom',
      'Google',
      'Vercel',
      'Rahul Mehta',
      'Prof. Anjali Sharma',
      'City Power & Utilities',
    ];"""

new_senders = """    const sendersToCheck = [
      'City Power & Utilities',
      'Prof. Anjali Sharma',
      'Scholarship Office',
      'Rahul Mehta',
      'HDFC Bank',
      'Medium Daily',
      'Microsoft Azure',
      'GitHub',
    ];"""

m4 = m4.replace(old_senders, new_senders)

# Replace expected length from 25 to 50
m4 = m4.replace("expect(emailRows.length).toBe(25);", "expect(emailRows.length).toBe(50);")

# Replace bold/normal unread checks
m4 = m4.replace("const blaineSender = screen.getByText('Blaine, me');", "const blaineSender = screen.getByText('City Power & Utilities');")
m4 = m4.replace("const hiltonSender = screen.getByText('Hilton Honors');", "const hiltonSender = screen.getByText('Rahul Mehta');")

# Replace toolbar count checks
m4 = m4.replace("1–25 of 299", "1–50 of 847")

# Replace clicking email row
m4 = m4.replace("const blaineRow = screen.getByText('Recent project updates');", "const blaineRow = screen.getByText('Your electricity bill is due soon');")
m4 = m4.replace("expect(screen.getByRole('heading', { name: 'Recent project updates' })).toBeInTheDocument();", "expect(screen.getByRole('heading', { name: 'Your electricity bill is due soon' })).toBeInTheDocument();")

# Replace all 25 emails clickable
old_clickable_section = """  test('All 25 emails clickable without crash', () => {
    render(<App />);
    const inboxTab = screen.getByRole('button', { name: /Inbox/i });
    fireEvent.click(inboxTab);

    const subjects = [
      'Recent project updates',
      'RSVP for team lunch and bike ride!',
      'Tickets: Ticket request #610007 has been approved!',
      'Thank you for your inquiry',
      'Your Upcoming Reservation #20983746',
      'Confirmation for Flight VA2345 SFO to NYC',
      "FW: What 'the future of innovation' Looks Like",
      'Photos from my road trip',
      'Product Strategy classes',
      'Business trip',
      'Book you recommended',
      'Security alert: New sign-in on Chrome',
      'Pull request merged: feat/dashboard-v2',
      'Project sync — Thursday 4 PM',
      'Following up on the recommendation letter',
      'Your electricity bill is due soon',
      'Welcome packet and a few next steps',
      'You appeared in 14 searches this week',
      'Your order has been delivered!',
      "Long time! How've you been?",
      'This week in web development 🚀',
      'Your order has shipped',
      'Weekly digest: 3 updates in your workspace',
      'Deployment successful: polaris-app',
      "Call me when you're free ❤️",
    ];

    for (const subject of subjects) {"""

new_clickable_section = f"""  test('All 50 emails clickable without crash', () => {{
    render(<App />);
    const inboxTab = screen.getByRole('button', {{ name: /Inbox/i }});
    fireEvent.click(inboxTab);

    const subjects = {subjects_js_array};

    for (const subject of subjects) {{"""

m4 = m4.replace(old_clickable_section, new_clickable_section)

# Replace story emails list
old_stories = """    const stories = [
      { subject: 'Your electricity bill is due soon', expected: '₹2,340' },
      { subject: 'Following up on the recommendation letter', expected: 'recommendation letter' },
      { subject: 'Project sync — Thursday 4 PM', expected: 'Thursday at 4:00 PM' },
      { subject: 'Welcome packet and a few next steps', expected: 'enrollment confirmation form' },
      { subject: 'This week in web development 🚀', expected: 'DevWeekly' },
      { subject: "Long time! How've you been?", expected: 'Hey stranger' },
    ];"""

new_stories = """    const stories = [
      { subject: 'Your electricity bill is due soon', expected: '₹2,340' },
      { subject: 'Following up on the recommendation letter', expected: 'recommendation letter' },
      { subject: 'Project sync — Thursday 4 PM', expected: 'Thursday at 4:00 PM' },
      { subject: 'Enrollment confirmation required', expected: 'enrollment confirmation form' },
      { subject: '5 design principles for clean user interfaces', expected: 'whitespace' },
      { subject: 'The future of autonomous flight startup raises $50M', expected: 'Silicon valley' },
    ];"""

m4 = m4.replace(old_stories, new_stories)

# Replace other occurrences of Recent project updates
m4 = m4.replace("Recent project updates", "Your electricity bill is due soon")

with open("e:/polaris/tests/module4.test.tsx", "w", encoding="utf-8") as f:
    f.write(m4)

print("module4.test.tsx patched.")

# 2. Patch module5.test.tsx
with open("e:/polaris/tests/module5.test.tsx", "r", encoding="utf-8") as f:
    m5 = f.read()

m5 = m5.replace("Recent project updates", "Your electricity bill is due soon")
m5 = m5.replace("Found in your inbox — Blaine, me", "Found in your inbox — City Power & Utilities")

with open("e:/polaris/tests/module5.test.tsx", "w", encoding="utf-8") as f:
    f.write(m5)

print("module5.test.tsx patched.")

# 3. Patch stress.test.tsx
with open("e:/polaris/tests/stress.test.tsx", "r", encoding="utf-8") as f:
    stress = f.read()

stress = stress.replace("Recent project updates", "Your electricity bill is due soon")

with open("e:/polaris/tests/stress.test.tsx", "w", encoding="utf-8") as f:
    f.write(stress)

print("stress.test.tsx patched.")
