/*
  Copilot at Work: course content.

  Everything the course shows lives in this one file. index.html only draws it, and
  prompts.html and cheat-sheet.html draw the prompts array below.

  To edit a question: find its lesson below, find the block with type "knowledge" or "quiz",
  and change the text. Each option has `correct: true` or nothing, and a `feedback` sentence
  that explains why. Keep the commas and quotes as they are; a missing one blanks the page,
  and the page will tell you so.

  To edit a prompt: find it in the prompts array near the top. Every lesson card, the
  desk card, and the prompt library read from that one list. The desk card shows the
  entries marked star: true, ten of them, grouped by app; star a different one to swap it in.

  Block types the page can draw: heading, text, statement, list, twocol, accordion, tabs,
  flashcards, process, mockup, beforeafter, labeled, sorting, scenario, knowledge, quiz,
  continue, divider, image, demo, prompts, links, reveal, audio.

  An image block is always a real screen capture (a drawn screen is a mockup block). It needs
  the file under img/, an alt sentence, real: true, and the source app, such as "Copilot in Word".
  The caption always names the source. A demo block is a list of such steps.

  Inline marks inside any text: **bold** and `code`.
*/
window.COURSE = {
  title: "Copilot at Work",
  kicker: "A short course",
  description: "The everyday tasks people do with Microsoft Copilot in Outlook, Teams, Word, Excel, and PowerPoint, and how to do them well.",
  author: "Clay Elmore",
  madeWithTool: "The lesson text was drafted with Copilot Chat on a personal Microsoft account.",
  madeWithShort: "Lesson text drafted with Copilot Chat. See the last lesson.",
  madeLine: "The lesson text was drafted with Copilot Chat on a personal Microsoft account. The last lesson shows the prompts and what changed.",
  welcome: { src: "audio/welcome.mp3", title: "Listen: welcome from Clay", length: "30 sec", transcript: "Hi, I'm Clay. Thanks for giving this course a few minutes. It is about Microsoft Copilot - not the big promises, just the everyday tasks. Catching up on a thread you missed, a meeting you could not attend, a first draft when the page is blank, a formula you do not want to write. Eleven short lessons, a quiz, and at the end I show you how I built this, including what Copilot wrote and what I changed. Let's get started." },

  /* ---------- Prompts: one list, used by the lesson cards, the desk card, and the library ---------- */
  prompts: [
    { id: "ask-email", app: "Outlook", task: "Draft a status email", prompt: "Draft an email to the team about the project status. The project is on schedule, but one task will finish three days late. Use the project plan and the notes from the weekly team meeting. Keep it under 150 words, use a professional tone, and include clear next steps.", note: "All four ingredients: goal, context, source, expectations." },
    { id: "ask-summary", app: "Word", task: "Summarize a document for managers", prompt: "Create an executive summary of this document. The audience is department managers who need a quick update before a review meeting. Use the attached document as the source. Limit the summary to five bullet points and highlight risks, progress, and decisions.", note: "Name the audience and the length, or you get a generic summary." },
    { id: "ask-trends", app: "Excel", task: "Find trends in a table", prompt: "Review this spreadsheet and identify trends in project costs. The data covers the last six months and is for a planning discussion. Use this spreadsheet only. Present the top three trends, note any unusual changes, and explain the findings in plain language.", note: "\"Use this spreadsheet only\" keeps it from guessing." },
    { id: "ask-shorter", app: "Copilot Chat", task: "Tighten an answer", prompt: "Shorten that to three bullet points.", note: "A follow-up builds on the answer above it. You do not start over." },
    { id: "ask-audience", app: "Copilot Chat", task: "Change the audience", prompt: "Rewrite it for a customer audience.", note: "Say who will read it and the tone follows." },
    { id: "ask-focus", app: "Copilot Chat", task: "Narrow the focus", prompt: "Use the same source, but focus only on risks and next steps.", note: "Keeps the source, changes the question." },
    { id: "catch-thread", star: true, app: "Outlook", task: "Summarize a long email thread", prompt: "Summarize this thread. What was decided, what is still open, and what do I need to do?", note: "Ask for decisions and actions, not just a summary." },
    { id: "catch-chat", app: "Teams", task: "Catch up on a chat you missed", prompt: "Summarize this conversation. What decisions were made, what questions are still open, and what actions should I be aware of?", note: "Works in a chat or a channel." },
    { id: "catch-away", star: true, app: "Copilot Chat", task: "Catch up after time away", prompt: "I was away for the past week. Summarize what happened in this chat. List key decisions, open questions, and action items. Include the owner for each action item if it is mentioned.", note: "Name the span of time and ask for owners." },
    { id: "meet-recap", star: true, app: "Teams", task: "Recap a meeting you missed", prompt: "Summarize this meeting. List the decisions that were made, the action items with owners, and any open questions that still need answers.", note: "Needs a meeting that was recorded or transcribed." },
    { id: "meet-prepare", star: true, app: "Copilot Chat", task: "Prepare for tomorrow's meeting", prompt: "Prepare me for tomorrow's meeting. Use the meeting invite, the related email thread, and the notes from the last meeting. Summarize the background, key topics, unresolved issues, and questions I may want to ask.", note: "Name the three sources so it does not pick its own." },
    { id: "meet-during", app: "Teams", task: "Ask during a meeting", prompt: "What has been decided so far, and what risks have been mentioned?", note: "Only when transcription is on. Nobody hears you ask." },
    { id: "write-reply", star: true, app: "Outlook", task: "Draft a reply to a customer", prompt: "Draft a reply to the customer. Thank them for the update, confirm our team is reviewing the project, and let them know we will share the next steps by Friday. Use a professional tone and keep it to about 150 words.", note: "State the tone and the length every time." },
    { id: "write-firmer", app: "Outlook", task: "Make a reply shorter and firmer", prompt: "Make this shorter and firmer. Keep it under 75 words and clearly state the Friday deadline.", note: "A follow-up on the draft above." },
    { id: "write-draft", star: true, app: "Word", task: "Draft a document from notes", prompt: "Create a first draft of a project update based on these notes. Include a short summary, progress so far, current risks, and next steps for the team and the customer.", note: "Paste or point at the notes first." },
    { id: "write-plainer", app: "Word", task: "Rewrite in plain language", prompt: "Rewrite this in plainer language for a general audience.", note: "Good for anything technical going to people outside the team." },
    { id: "write-senior", app: "Word", task: "Rewrite for a senior audience", prompt: "Rewrite this for a senior audience. Focus on outcomes, risks, and decisions needed.", note: "Leaders want the decision, not the history." },
    { id: "write-bullets", app: "Word", task: "Turn text into action items", prompt: "Turn this into bullet points with clear action items and owners where possible.", note: "Ask for owners and you get a list people can act on." },
    { id: "find-detail", star: true, app: "Copilot Chat", task: "Find a detail across your work", prompt: "When did someone first propose the current project timeline? Show me where you found it.", note: "Ask for the source and open it before you repeat the detail." },
    { id: "find-file", app: "Copilot Chat", task: "Find the latest version of a file", prompt: "Where is the latest version of the project plan file, and who changed it last?", note: "Copilot only finds files you can already open." },
    { id: "find-customer", app: "Copilot Chat", task: "Find what a customer asked for", prompt: "What did the customer ask for last month about this project? List each request with the email or meeting it came from.", note: "One request per line, each with its source." },
    { id: "num-trends", star: true, app: "Excel", task: "Show insights in a table", prompt: "Analyze this table and tell me the main trends, outliers, and changes over time.", note: "Format the data as a table with headers first." },
    { id: "num-column", star: true, app: "Excel", task: "Add a formula column", prompt: "Add a new column called Total Cost that multiplies Hours by Hourly Rate for each row.", note: "Check a few rows by hand before you trust the column." },
    { id: "num-explain", app: "Excel", task: "Explain a formula", prompt: "Explain what the formula in column G does in plain language.", note: "Useful on a workbook someone else built." },
    { id: "num-chart", app: "Excel", task: "Make a chart", prompt: "Create a chart that shows total Amount by month.", note: "Name the measure and the grouping." },
    { id: "present-deck", star: true, app: "PowerPoint", task: "Make a first-draft deck from a document", prompt: "Create a 10-slide presentation from this document for a team of project stakeholders. Use a professional, clear tone.", note: "Name the audience, the slide count, and the tone." },
    { id: "present-risks", app: "PowerPoint", task: "Add a slide", prompt: "Add a slide that summarizes risks and next steps.", note: "A follow-up on the draft deck." },
    { id: "present-notes", app: "PowerPoint", task: "Add speaker notes", prompt: "Add speaker notes for each slide with talking points for the presenter.", note: "Then read them once out loud." },
    { id: "check-source", app: "Copilot Chat", task: "Ask where a claim came from", prompt: "Where did that figure come from? Show me the source.", note: "Ask whenever a number or date surprises you." },
    { id: "check-draft", app: "Outlook", task: "Check a draft against its sources", prompt: "Check this draft against the source emails. Verify customer names, project names, dates, and commitments. Flag anything that may be incorrect.", note: "Then open the sources yourself. This is a second pair of eyes, not the last word." },
    { id: "hand-interview", app: "Copilot Chat", task: "Have Copilot interview you first", prompt: "Interview me first. Ask one question at a time until you have enough information to complete the task.", note: "Use it before any draft when you are not sure what to ask for." },
    { id: "hand-recipient", app: "Copilot Chat", task: "Read it as the recipient", prompt: "Read this as the recipient. What would be confusing, unclear, or easy to miss?", note: "Paste the draft, or ask it inside Word or Outlook." },
    { id: "hand-missing", app: "Copilot Chat", task: "Ask what is missing", prompt: "Review this and tell me what information is missing, assumed, or unsupported.", note: "Good on plans, proposals, and status updates." },
    { id: "hand-two", app: "Copilot Chat", task: "Get two versions", prompt: "Create two versions of this. Make the differences clear and explain when to use each.", note: "Picking between two is easier than judging one." },
    { id: "hand-handout", app: "PowerPoint", task: "Turn a deck into a handout", prompt: "Turn this presentation into a one-page handout. Keep the key decisions, schedule, and action items.", note: "A handoff that goes backwards, from slides to a page." },
    { id: "hand-sentences", app: "Excel", task: "Turn a table into sentences", prompt: "Summarize this budget table in three sentences for an email update. Highlight the total cost and any major assumptions.", note: "Copy the answer into the email." },
    { id: "together-status", app: "Word", task: "Draft a weekly status update", prompt: "Draft a weekly status update for the project. Include accomplishments, current work, risks, decisions, and next steps. Use a professional business tone.", note: "Catch up on messages and the meeting recap first, then draft." },
    { id: "together-actions", app: "Excel", task: "Turn action items into a table", prompt: "Put these action items into a table with columns for Action Item, Owner, Status, and Due Date.", note: "Paste the action items from the meeting recap." },
    { id: "together-send", app: "Teams", task: "Send the summary to attendees", prompt: "Draft a message to the attendees with the meeting summary and action items. Ask owners to confirm their assignments.", note: "Read it once as an attendee before you send." }
  ],

  lessons: [
    /* ---------- 1 ---------- */
    { id: "start-here", title: "Start here", minutes: 3, madeWith: "copilot",
      intro: "Microsoft Copilot is an assistant that helps you work with information, write, and get answers. You meet it in two places: Copilot Chat on its own, and inside Outlook, Teams, Word, Excel, and PowerPoint.",
      blocks: [
        { type: "audio", src: "audio/start-here.mp3", title: "Listen: a word from Clay", length: "27 sec", transcript: "Before you ask Copilot to do anything, it helps to know where it lives and what it can see. You will meet it in two places - Copilot Chat on its own, and a button inside Outlook, Teams, Word, Excel, and PowerPoint. Here is the one thing I would carry out of this lesson. Copilot can only use what you can already open. If you cannot see a file, neither can Copilot on your behalf. Everything else in this lesson builds on that." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 1, \"Start here\". Sections: INTRO (2 sentences on what Copilot is and where it shows up: Copilot Chat, and inside Outlook, Teams, Word, Excel, PowerPoint). WHERE (a short list, one line per app, of what the Copilot button does there). CAN SEE (3 bullets on what Copilot can and cannot see: only what you already have access to; it does not train on company data; your screen may differ by license and rollout). MYTHS (3 pairs of \"People think / What is true\"). CHECK (3 multiple choice questions, 3 options each, mark the right one, and give one sentence of feedback that explains why for each option). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/start-here-chat.png", alt: "Copilot Chat showing the prompt that asked for this lesson and the answer it gave, with the headings Intro, Where, Can see, and Myths.", real: true, source: "Copilot Chat",
          caption: "This lesson started as this Copilot Chat answer. The last lesson shows what was kept and what was changed." }
        ] },
        { type: "labeled", heading: "What you see in Copilot Chat", intro: "Tap each number to see what that part does.",
          mockup: { app: "Copilot Chat", alt: "A drawing of a Copilot chat window", messages: [
            { from: "you", text: "Summarize what my team decided last week about the spring launch, and list the open questions." },
            { from: "bot", text: "Here is what I found across your chats, meetings, and files.", bullets: ["Decision: launch moves to the first week of April.", "Decision: the pilot group grows from 20 to 50 customers.", "Open: who owns the training video, and when the price sheet is final."] }
          ], placeholder: "Message Copilot" },
          spots: [
            { x: 92, y: 20, title: "Your prompt", body: "What you ask. The next lesson shows how to ask so you get a useful answer the first time." },
            { x: 4, y: 52, title: "The answer", body: "Copilot answers from what it can see. In a work account that can include your emails, chats, meetings, and files. On a personal account it uses the web and what you paste or attach." },
            { x: 4, y: 92, title: "The message box", body: "Type here. In a work account you can type a slash to point Copilot at a specific file or meeting. Follow-up questions go in the same box and build on the answer above." }
          ] },
        { type: "list", heading: "Where Copilot shows up", items: [
          "**Copilot Chat:** ask questions, think through ideas, summarize, and draft.",
          "**Outlook:** draft and rewrite emails, and summarize long threads.",
          "**Teams:** catch up on chats you missed, and recap meetings.",
          "**Word:** draft from notes, rewrite, and summarize a document.",
          "**Excel:** look for patterns, suggest formulas, and explain the ones already there.",
          "**PowerPoint:** build a first draft deck and tidy slides.",
          "**Agents:** newer features hand a whole task to Copilot to finish on its own. Microsoft's Cowork is available in Copilot Chat; its Autopilot is in preview as of fall 2026. This course sticks to the everyday tasks above."
        ] },
        { type: "statement", label: "The one rule to remember", text: "Copilot can only use what you can already open. If you cannot see a file, neither can Copilot on your behalf." },
        { type: "list", heading: "What it can and cannot see", items: [
          "It works only with content you already have permission to open.",
          "Your prompts and your company's data are not used to train the models behind Copilot.",
          "Your screen may not match a coworker's. Features vary by license, company settings, app version, and rollout timing. This course describes what is common; if a button is missing for you, ask your IT team."
        ] },
        { type: "flashcards", heading: "Three things people get wrong", intro: "Read the front, decide what you think is true, then turn the card.", frontLabel: "People think", backLabel: "What is true", cards: [
          { front: "Copilot knows everything in the company.", back: "It is limited by your own permissions and access. It sees what you can see, and nothing more." },
          { front: "Copilot does the thinking and the review for you.", back: "You still check the facts, make the decisions, and approve the work. Lesson 9 is about that." },
          { front: "Everyone gets the same Copilot features.", back: "Features vary by license, settings, and rollout. Two people in the same team can see different buttons." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "What is the best way to think about Microsoft Copilot?", options: [
            { text: "A tool that takes actions without any review from me.", feedback: "No. You are still responsible for reviewing and approving the work it helps with." },
            { text: "An assistant that helps with tasks, content, and information.", correct: true, feedback: "Yes. Copilot assists; you decide." },
            { text: "A replacement for the software I already use.", feedback: "No. Copilot works inside the tools you already have." }
          ] },
          { q: "Which files can Copilot use when it answers a question about your organization?", options: [
            { text: "Any file stored anywhere in the company.", feedback: "No. Copilot does not get access to every company file." },
            { text: "Files and information you already have permission to open.", correct: true, feedback: "Yes. Copilot works inside your existing permissions." },
            { text: "Only files you created yourself.", feedback: "No. It can also use information others have shared with you, as long as you can open it." }
          ] },
          { q: "Why might your Copilot look different from a coworker's?", options: [
            { text: "Copilot changes its features at random.", feedback: "No. The differences come from how it is set up, not chance." },
            { text: "Licenses, settings, app versions, and rollout timing can differ.", correct: true, feedback: "Yes. Those four things decide which features you see." },
            { text: "Each person installs a separate version of Copilot.", feedback: "No. It is one product; what differs is licensing and rollout." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", intro: "Nothing to copy yet. Lesson 2 starts the collection, and the prompt library holds all of them.", ids: ["ask-shorter"] }
      ] },

    /* ---------- 2 ---------- */
    { id: "ask-well", title: "Ask well", minutes: 5, madeWith: "copilot",
      intro: "A good prompt gets a useful first answer. It tells Copilot what you want, why, where to look, and what the result should look like.",
      blocks: [
        { type: "audio", src: "audio/ask-well.mp3", title: "Listen: a word from Clay", length: "40 sec", transcript: "Most disappointing answers start with a short question. Alright, let's be honest - we have all typed \"summarize this\" and then been annoyed by the summary. The fix is four ingredients. The goal, what you want done. The context, what is going on. The source, where to look. And the expectations, what the answer should look like. You will see weak prompts and better prompts side by side in this lesson. The better ones are longer, and that is the point. A few extra words up front save you three follow-up questions." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 2, \"Ask well\". Sections: INTRO (2 sentences). INGREDIENTS (the four parts of a good prompt: Goal, Context, Source, Expectations, each with a one-line definition and a one-line example from a generic workplace). SLASH (2 sentences on typing \"/\" to point Copilot at a file or a meeting). BEFORE AFTER (3 pairs: a weak prompt and the same prompt rewritten with all four ingredients, for an email, a document, and a spreadsheet). FOLLOW UP (3 example follow-up prompts that refine a first answer). CHECK (one sorting activity: 8 short prompt fragments, each labeled Goal, Context, Source, or Expectations; and 2 multiple choice questions with explanatory feedback). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/ask-well-chat.png", alt: "Copilot Chat showing the lesson 2 prompt and its answer, with the four ingredients Goal, Context, Source, and Expectations each defined with an example.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "tabs", heading: "The four ingredients", items: [
          { title: "Goal", body: ["What you want Copilot to do.", "Example: \"Draft an update email about the project status.\""] },
          { title: "Context", body: ["Background that helps Copilot understand the situation.", "Example: \"The project is on schedule, one task is delayed, and the customer wants weekly updates.\""] },
          { title: "Source", body: ["The file, meeting, email, or information Copilot should use.", "Example: \"Use the notes from the project review meeting and the project plan document.\""] },
          { title: "Expectations", body: ["How the answer should be written or organized.", "Example: \"Keep it under 150 words, use a professional tone, and end with next steps.\""] }
        ] },
        { type: "statement", label: "Point at the source", text: "In a work account, type a slash in Copilot Chat to pick a specific file or meeting. Copilot then uses that source instead of guessing which one you meant." },
        { type: "beforeafter", heading: "Weak prompt, better prompt", pairs: [
          { before: "Write an email about the project.", after: "Draft an email to the team about the project status. The project is on schedule, but one task will finish three days late. Use the project plan and the notes from the weekly team meeting. Keep it under 150 words, use a professional tone, and include clear next steps.", note: "Email: the better one names the goal, the situation, the two sources, and the length and tone." },
          { before: "Summarize this document.", after: "Create an executive summary of this document. The audience is department managers who need a quick update before a review meeting. Use the attached document as the source. Limit the summary to five bullet points and highlight risks, progress, and decisions.", note: "Document: the audience and the five-bullet limit do most of the work." },
          { before: "Analyze this spreadsheet.", after: "Review this spreadsheet and identify trends in project costs. The data covers the last six months and is for a planning discussion. Use this spreadsheet only. Present the top three trends, note any unusual changes, and explain the findings in plain language.", note: "Spreadsheet: \"use this spreadsheet only\" stops it from pulling in other files." }
        ] },
        { type: "list", heading: "Keep the conversation going", items: [
          "\"Shorten that to three bullet points.\"",
          "\"Rewrite it for a customer audience.\"",
          "\"Use the same source, but focus only on risks and next steps.\"",
          "Each follow-up builds on the answer above it. You rarely need to start a new chat."
        ] },
        { type: "sorting", heading: "Sort the fragments", intro: "Each fragment is one ingredient of a prompt. Put it in the right group.", categories: ["Goal", "Context", "Source", "Expectations"], cards: [
          { text: "Create a status update for the team.", category: "Goal" },
          { text: "The project launches next month.", category: "Context" },
          { text: "Use notes from the project kickoff meeting.", category: "Source" },
          { text: "Keep it under 100 words.", category: "Expectations" },
          { text: "Compare the budget and the actual results.", category: "Goal" },
          { text: "The customer asked for a summary for leadership.", category: "Context" },
          { text: "Use the spreadsheet named Project Budget.", category: "Source" },
          { text: "Present the answer as a table.", category: "Expectations" }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "Which part of a prompt tells Copilot where to get the information?", options: [
            { text: "Goal", feedback: "No. The goal says what you want done." },
            { text: "Context", feedback: "No. Context is the background of the situation." },
            { text: "Source", correct: true, feedback: "Yes. The source names the file, meeting, email, or data to use." },
            { text: "Expectations", feedback: "No. Expectations describe the shape of the answer." }
          ] },
          { q: "Which prompt has all four ingredients?", options: [
            { text: "\"Summarize this.\"", feedback: "No. That is a goal with nothing else." },
            { text: "\"Summarize the project document.\"", feedback: "No. Goal and source, no context or expectations." },
            { text: "\"Summarize the project document for managers.\"", feedback: "Close. It has a goal, a source, and an audience, but no limit or format." },
            { text: "\"Summarize the project document for managers. The project launches next month. Use the attached document. Limit the summary to five bullet points.\"", correct: true, feedback: "Yes. Goal, context (launches next month), source (the attached document), and expectations (five bullets)." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["ask-email", "ask-summary", "ask-trends", "ask-shorter", "ask-audience", "ask-focus"] }
      ] },

    /* ---------- 3 ---------- */
    { id: "catch-up", title: "Catch up", minutes: 4, madeWith: "copilot",
      intro: "Catching up is the easiest win. Instead of reading a 40-message thread, ask Copilot what was decided and what you need to do.",
      blocks: [
        { type: "audio", src: "audio/catch-up.mp3", title: "Listen: a word from Clay", length: "25 sec", transcript: "This is the easiest win in the whole course. A forty-message thread lands while you were out. You could read it top to bottom. Or you could ask Copilot what was decided, what is still open, and what has your name on it. That last part matters. Do not just ask for a summary - ask for the decisions and the actions. You get a list you can act on, instead of a paragraph you have to read twice." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 3, \"Catch up\". Sections: INTRO (2 sentences). EMAIL (how to summarize a long email thread in Outlook with Copilot, 3 steps, and one example prompt for \"what do I need to do\"). CHAT (how to catch up on a Teams chat or channel you missed, 3 steps, one example prompt). AWAY (one example prompt for catching up after a week off, asking for decisions, open questions, and action items with owners). MISTAKES (3 common mistakes and the fix for each). CHECK (3 questions with explanatory feedback: 2 multiple choice, 1 multiple response). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/catch-up-chat.png", alt: "Copilot Chat showing the lesson 3 prompt and its answer, with steps for summarizing an email thread in Outlook and a Teams chat, and example prompts.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "tabs", heading: "Three places to catch up", items: [
          { title: "An email thread", body: ["1. Open the conversation in Outlook.", "2. Choose Copilot and ask for a summary of the thread.", "3. Read the summary, then ask a follow-up about decisions, risks, or next steps.", "Try: \"What do I need to do from this email thread?\""] },
          { title: "A Teams chat", body: ["1. Open the chat or channel in Teams.", "2. Open Copilot from the conversation.", "3. Ask for a summary and for anything that affects you or your team.", "Try: \"Summarize this conversation. What decisions were made, what questions are still open, and what actions should I be aware of?\""] },
          { title: "After a week away", body: ["Ask once, in Copilot Chat, for the whole span:", "\"I was away for the past week. Summarize what happened in this chat. List key decisions, open questions, and action items. Include the owner for each action item if it is mentioned.\"", "Name the span of time and ask for owners, and you get a list you can act on."] }
        ] },
        { type: "mockup", heading: "What a good catch-up answer looks like", app: "Copilot in Teams", alt: "A drawing of a Teams chat with a Copilot summary", messages: [
          { from: "you", text: "Summarize what I missed in this channel since Monday. Decisions, open questions, and anything with my name on it." },
          { from: "bot", text: "Since Monday:", bullets: ["Decided: the vendor demo moves to Thursday at 2.", "Open: whether the pilot includes the night shift. Nobody has answered.", "For you: Sam asked you to confirm the training room booking by Wednesday."] }
        ], caption: "The ask names the span, the three things wanted, and \"anything with my name on it\". The answer sorts itself the same way." },
        { type: "accordion", heading: "Common mistakes", intro: "Open the ones you recognize.", items: [
          { title: "Asking for a summary with no goal", body: "Ask for the specific things you need: decisions, risks, deadlines, or actions. \"Summarize this\" gets you a paragraph; \"what do I need to do\" gets you a list." },
          { title: "Assuming the summary has everything", body: "When a topic is important or sensitive, read the original messages too. A summary is a map, not the territory." },
          { title: "Asking a very broad question", body: "Narrow it. Ask for the action items, the customer feedback, or the project updates, one at a time." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "Which prompt is most useful when you want to catch up on a Teams conversation?", options: [
            { text: "\"Summarize this conversation. What decisions were made and what actions should I be aware of?\"", correct: true, feedback: "Yes. It asks for the two things that matter to your work." },
            { text: "\"Rewrite this conversation in a different tone.\"", feedback: "No. That changes the text; it does not tell you what happened." },
            { text: "\"Translate this conversation into another language.\"", feedback: "No. Useful sometimes, but it is not catching up." }
          ] },
          { q: "What is a good first step with a long email thread?", options: [
            { text: "Reply to everyone right away.", feedback: "No. You do not know yet what was asked." },
            { text: "Open the thread and ask Copilot for a summary.", correct: true, feedback: "Yes. Understand the discussion first, then decide whether to read every message." },
            { text: "Delete the older messages.", feedback: "No. The older messages are often where the decision was made." }
          ] },
          { q: "Which questions are useful when catching up after being away? Pick all that apply.", type: "multi", options: [
            { text: "What decisions were made?", correct: true, feedback: "Yes." },
            { text: "What questions are still open?", correct: true, feedback: "Yes." },
            { text: "What action items exist, and who owns them?", correct: true, feedback: "Yes. Owners tell you who to follow up with." },
            { text: "Can you make the conversation longer?", feedback: "No. Longer is the opposite of what you need." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["catch-thread", "catch-chat", "catch-away"] }
      ] },

    /* ---------- 4 ---------- */
    { id: "meetings", title: "Meetings", minutes: 4, madeWith: "copilot",
      intro: "Meetings move fast and details slip. Copilot can recap one you missed, prepare you for the next one, and answer questions while a meeting is still going.",
      blocks: [
        { type: "audio", src: "audio/meetings.mp3", title: "Listen: a word from Clay", length: "31 sec", transcript: "I have missed my share of meetings, and the catch-up afterward used to cost more than the meeting itself. If a meeting was recorded or transcribed, Copilot can recap it. Ask for the decisions, the action items with owners, and the open questions. That is the part you need before your next meeting starts. You can also ask Copilot to prepare you before a meeting, from the invite, the thread, and last time's notes. Try the scenario in this lesson - ten minutes, three choices." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 4, \"Meetings\". Sections: INTRO (2 sentences). MISSED (how to get a recap of a meeting you missed, 3 steps, and one example prompt that asks for decisions, action items with owners, and open questions). PREPARE (one example prompt that prepares you for tomorrow's meeting from the invite, the thread, and the last meeting). DURING (2 sentences on asking Copilot questions during a meeting that has transcription on). SCENARIO (a short branching scenario: you missed a project meeting and have 10 minutes before the next one; 3 choices of what to ask Copilot, each with the consequence in 2 sentences, and say which is best and why). CHECK (2 multiple choice questions with explanatory feedback). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/meetings-chat.png", alt: "Copilot Chat showing the lesson 4 prompt and its answer, with steps for a meeting recap, a prepare-me prompt, and a note on asking questions during a meeting.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "process", heading: "Recap a meeting you missed", steps: [
          { title: "Open the meeting in Teams", body: "Find it in the calendar or the chat. It needs to have been recorded or transcribed; if it was not, there is nothing for Copilot to read." },
          { title: "Open Copilot from the recap", body: "The recap page carries the recording, the transcript, and a Copilot pane." },
          { title: "Ask for the outcomes, not the whole meeting", body: "\"Summarize this meeting. List the decisions that were made, the action items with owners, and any open questions that still need answers.\"" }
        ] },
        { type: "statement", label: "Before the next one", text: "\"Prepare me for tomorrow's meeting. Use the meeting invite, the related email thread, and the notes from the last meeting. Summarize the background, key topics, unresolved issues, and questions I may want to ask.\"" },
        { type: "text", heading: "During a meeting", body: ["If transcription is on, you can ask Copilot questions during the meeting without interrupting anyone. Ask what has been decided so far, what risks have come up, or whether a topic was already covered.", "Nobody else sees your question."] },
        { type: "scenario", heading: "Ten minutes between meetings", setup: "You missed the project meeting and have ten minutes before your next one. What do you ask Copilot first?", choices: [
          { text: "\"Summarize the entire meeting.\"", outcome: "You get a general overview. You understand the topics, but you still have to hunt for the decisions and who owes what." },
          { text: "\"What happened in the meeting?\"", outcome: "A broad answer. It helps, but the decisions and the follow-ups are mixed in with everything else." },
          { text: "\"List the decisions, the action items with owners, the deadlines that were mentioned, and the open questions.\"", best: true, outcome: "You get the actionable part first: what was decided, who owns what, and what is still open. That is what you need before the next meeting." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "You missed a meeting and need to catch up fast. What is the best first prompt?", options: [
            { text: "\"Who attended?\"", feedback: "No. Attendance is not what you need to act." },
            { text: "\"Summarize this meeting. List the decisions, action items with owners, and open questions.\"", correct: true, feedback: "Yes. It asks for outcomes, which is what you act on." },
            { text: "\"Write a thank-you message.\"", feedback: "No. You do not know yet what to thank anyone for." }
          ] },
          { q: "What is a useful way to use Copilot during a meeting with transcription on?", options: [
            { text: "Ask what decisions have been made so far.", correct: true, feedback: "Yes. You stay aligned without interrupting the flow." },
            { text: "Turn off note taking for everyone.", feedback: "No. Transcription is what Copilot reads." },
            { text: "Skip the discussion and wait for the recording.", feedback: "No. Copilot can help you follow it now." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["meet-recap", "meet-prepare", "meet-during"] }
      ] },

    /* ---------- 5 ---------- */
    { id: "write", title: "Write", minutes: 5, madeWith: "copilot",
      intro: "Copilot gets you off the blank page. You decide what to keep, change, or cut, and every change it makes in Word can be reviewed and undone.",
      blocks: [
        { type: "audio", src: "audio/write.mp3", title: "Listen: a word from Clay", length: "32 sec", transcript: "The blank page is where Copilot earns its keep. In Outlook, tell it what the reply should say, the tone, and the length, and you get a draft to edit instead of a cursor to stare at. In Word, point it at your notes and ask for a first draft. Then the part I care about most - you read it. Every change Copilot makes can be reviewed and undone. Nothing is final until you say so. The demo in this lesson is real. Watch what Copilot did with four sentences of notes." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 5, \"Write\". Sections: INTRO (2 sentences). EMAIL (drafting a reply in Outlook: 3 steps, one example prompt with tone and length stated, and one example of asking for a shorter and firmer version). DOCUMENT (drafting a first version in Word from notes: 3 steps, one example prompt, and 2 sentences on reviewing and undoing each change Copilot makes). REWRITE (4 example rewrite requests: shorter, plainer, for a senior audience, as bullet points). FLASHCARDS (6 cards: front is a writing situation, back is the prompt you would use). CHECK (2 multiple choice questions with explanatory feedback). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/write-chat.png", alt: "Copilot Chat showing the lesson 5 prompt and its answer, with steps for drafting an email reply in Outlook and a document in Word, and example prompts.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "demo", heading: "Demo: a first draft in Word", intro: "Three steps in desktop Word with Copilot. Tap through them.", steps: [
          { title: "Open a blank document", body: "A new document in Word opens with a Copilot prompt box in the page: \"Describe what you'd like to draft with Copilot\".", src: "img/write-word-1.png", audio: "audio/demo-write-1.mp3", length: "6 sec", transcript: "A new document in Word opens with a Copilot box right in the page. That is where the draft starts.", alt: "A blank Word document with the Copilot draft prompt box at the top of the page.", source: "Copilot in Word" },
          { title: "Describe the draft", body: "Type the goal, the audience, and the shape. Here: a project update from notes with a summary, progress, risks, and next steps.", src: "img/write-word-2.png", audio: "audio/demo-write-2.mp3", length: "7 sec", transcript: "I typed the goal, the audience, and the shape - a project update from four sentences of notes. Nothing fancy.", alt: "The Copilot prompt box in Word with a request for a project update typed in.", source: "Copilot in Word" },
          { title: "Read it, then keep or undo", body: "Copilot writes the draft into the page and, in its pane, says what it did and where it held back (here, it did not invent a launch date). Read the draft; use Undo or ask for a change. Nothing is final until you say so.", src: "img/write-word-3.png", audio: "audio/demo-write-3.mp3", length: "10 sec", transcript: "Copilot wrote the draft into the page and, in its pane, told me what it did and what it held back. It did not invent a launch date. I like that.", alt: "The Word page with a Copilot draft titled Project Update, and the Copilot pane describing what it wrote with Allow editing and Edit with Copilot controls.", source: "Copilot in Word" }
        ] },
        { type: "tabs", heading: "Email or document", items: [
          { title: "A reply in Outlook", body: ["1. Open the email and choose Copilot.", "2. Say what the reply should say, with the tone and the length.", "3. Read the draft, change what you want, and send when you are ready.", "Try: \"Draft a reply to the customer. Thank them for the update, confirm our team is reviewing the project, and let them know we will share the next steps by Friday. Use a professional tone and keep it to about 150 words.\"", "Then: \"Make this shorter and firmer. Keep it under 75 words and clearly state the Friday deadline.\""] },
          { title: "A document in Word", body: ["1. Open a document and gather your notes, bullets, or key facts.", "2. Ask Copilot for a first draft from them.", "3. Edit the draft until it matches your goal and your reader.", "Try: \"Create a first draft of a project update based on these notes. Include a short summary, progress so far, current risks, and next steps for the team and the customer.\"", "Review each change before you keep it. If Copilot changes something you did not want, use Undo or reject the change and carry on yourself."] }
        ] },
        { type: "list", heading: "Four rewrites you will use every week", items: [
          "\"Make this shorter while keeping the key points.\"",
          "\"Rewrite this in plainer language for a general audience.\"",
          "\"Rewrite this for a senior audience. Focus on outcomes, risks, and decisions.\"",
          "\"Turn this into bullet points with clear action items.\""
        ] },
        { type: "flashcards", heading: "Situation to prompt", intro: "Read the situation, say the prompt you would use, then turn the card.", frontLabel: "Situation", backLabel: "Prompt", cards: [
          { front: "A customer asked for a status update.", back: "Draft a reply to the customer. Thank them for checking in, summarize the current status, and explain the next steps. Use a professional tone and keep it under 150 words." },
          { front: "I have meeting notes and need a project update document.", back: "Create a first draft of a project update from these notes. Include a summary, progress, risks, and next steps." },
          { front: "My email is too long.", back: "Rewrite this email to be shorter. Keep the key message and limit it to 100 words." },
          { front: "My message sounds too technical.", back: "Rewrite this in plain language for a general audience." },
          { front: "I need a summary for leaders.", back: "Rewrite this for a senior audience. Focus on business impact, risks, and decisions needed." },
          { front: "I want to turn a paragraph into action items.", back: "Convert this text into bullet points with clear action items and owners where possible." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "What is a good first step when using Copilot to draft an email reply?", options: [
            { text: "Send the email without reading it.", feedback: "No. You are responsible for what goes out." },
            { text: "Give Copilot clear instructions about the message, the tone, and the length.", correct: true, feedback: "Yes. Clear instructions get a draft close to what you need. You still read it before sending." },
            { text: "Ask Copilot to write anything and hope it is right.", feedback: "No. A vague ask gets a vague draft." },
            { text: "Delete the original email.", feedback: "No. The original is the context Copilot needs." }
          ] },
          { q: "What should you do after Copilot creates a draft in Word?", options: [
            { text: "Publish it immediately.", feedback: "No. A draft is a starting point." },
            { text: "Ignore any errors because Copilot wrote it.", feedback: "No. Copilot makes mistakes, and they are yours once you send them." },
            { text: "Read the draft, edit it, and remove anything that does not fit.", correct: true, feedback: "Yes. You decide what stays." },
            { text: "Start over without reading it.", feedback: "No. Read it first; most drafts are worth keeping in part." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["write-reply", "write-firmer", "write-draft", "write-plainer", "write-senior", "write-bullets"] }
      ] },

    /* ---------- 6 ---------- */
    { id: "find", title: "Find", minutes: 3, madeWith: "copilot",
      intro: "Instead of searching your emails, chats, meetings, and files one at a time, ask Copilot to find the detail. It looks across what you can already open and shows where it found the answer.",
      blocks: [
        { type: "audio", src: "audio/find.mp3", title: "Listen: a word from Clay", length: "25 sec", transcript: "When did someone first propose that date? Where is the latest version of the plan? What did the customer ask for last month? Instead of searching emails, then chats, then files, ask Copilot once. It looks across what you can open and shows you where it found the answer. Then open the source. The references are there so you can check - and in the demo you will see exactly what that looks like." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 6, \"Find\". Sections: INTRO (2 sentences on asking Copilot to find a detail across your emails, chats, meetings, and files instead of searching each one). EXAMPLES (5 example questions, such as what was the date someone proposed, where is the latest version of a file, what did a customer ask for last month). HOW IT ANSWERS (3 bullets: it cites the sources, you open the source to confirm, it only finds what you can already open). PROCESS (4 steps: ask, read the answer, open a cited source, confirm or ask again). CHECK (2 multiple choice questions with explanatory feedback, 1 fill in the blank). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/find-chat.png", alt: "Copilot Chat showing the lesson 6 prompt and its answer, with five example questions and a four-step process for finding a detail.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "list", heading: "Questions it answers well", items: [
          "When did someone first propose the current project timeline?",
          "Where is the latest version of the project plan file?",
          "What did the customer ask for last month about this project?",
          "What decisions were made in recent meetings about this project?",
          "Have I received any messages about changes to the project budget?"
        ] },
        { type: "demo", heading: "Demo: ask, then open the source", intro: "Two steps in Copilot Chat. On a personal account the sources are web pages; in a work account they are your emails, chats, meetings, and files.", steps: [
          { title: "Ask a specific question", body: "Name the detail you want and ask Copilot to show where it found it.", src: "img/find-chat-1.png", audio: "audio/demo-find-1.mp3", length: "4 sec", transcript: "One specific question, and I asked Copilot to show me where it found the answer.", alt: "A sent question in Copilot Chat asking when a product was renamed, what its new address is, and where that was found.", source: "Copilot Chat" },
          { title: "Open a cited source and confirm", body: "The answer carries numbered references. Open one and check the detail before you repeat it to anyone.", src: "img/find-chat-2.png", audio: "audio/demo-find-2.mp3", length: "5 sec", transcript: "The answer came back with numbered sources. Open one before you repeat the detail to anyone.", alt: "A Copilot Chat answer with numbered source references under it.", source: "Copilot Chat" }
        ] },
        { type: "process", heading: "The four-step habit", steps: [
          { title: "Ask a clear question", body: "One detail per question. Say what you want and ask for the source." },
          { title: "Read the answer", body: "Check that it answers the question you asked and not a nearby one." },
          { title: "Open a cited source", body: "Every answer names where it came from. Open the email, meeting, chat, or file." },
          { title: "Confirm, or ask again", body: "If the source agrees, you are done. If not, narrow the question and try again." }
        ] },
        { type: "list", heading: "How it answers", items: [
          "It shows the sources it used: emails, meetings, chats, or files.",
          "You open the source and confirm the detail yourself.",
          "It only finds information you already have permission to open."
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "Which question is a good use of Copilot for finding things?", options: [
            { text: "Create a new logo for our project.", feedback: "No. That is making something, not finding it." },
            { text: "What did the customer ask for last month?", correct: true, feedback: "Yes. A detail that lives somewhere in your emails, chats, meetings, or files." },
            { text: "Design a website homepage.", feedback: "No. Not a search." },
            { text: "Write a company policy.", feedback: "No. That is drafting." }
          ] },
          { q: "What should you do after Copilot gives you an answer?", options: [
            { text: "Assume it is always correct.", feedback: "No. It can misread a source or pick the wrong one." },
            { text: "Delete the original source.", feedback: "No. The source is your proof." },
            { text: "Open a cited source and confirm the detail.", correct: true, feedback: "Yes. The references are there so you can check." },
            { text: "Share the answer immediately.", feedback: "No. Confirm first; once you share it, it is your claim." }
          ] },
          { q: "Copilot only finds information that you already have permission to ________.", type: "fill", answer: "open", answers: ["open", "access", "see", "view", "read"], feedback: "If you cannot open it, neither can Copilot on your behalf." }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["find-detail", "find-file", "find-customer"] }
      ] },

    /* ---------- 7 ---------- */
    { id: "numbers", title: "Numbers", minutes: 4, madeWith: "copilot",
      intro: "Copilot in Excel can find patterns, write formulas, explain the ones already there, and make a chart. It works best when the data is a clean table with headers.",
      blocks: [
        { type: "audio", src: "audio/numbers.mp3", title: "Listen: a word from Clay", length: "32 sec", transcript: "Copilot in Excel can find patterns, write formulas, explain the ones someone else wrote, and make a chart. It is good at it, with one condition. The data has to be a clean table - one header row, one record per row, one kind of thing per column. Half of the trouble people have with Copilot in Excel is really trouble with the table. In the demo, Copilot builds a small table and then adds a formula column. Watch for the step where I check one row by hand. Always do that step." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 7, \"Numbers\". Sections: INTRO (2 sentences). SETUP (2 sentences: data in a table with headers, one row per record). TASKS (4 tasks in Excel with Copilot, each with one example prompt: show insights or trends, add a column with a formula, explain an existing formula, make a chart). TABS (3 short tabs: \"Good table\", \"Bad table\", \"Fix it\", each 2 to 3 sentences). MISTAKES (3 mistakes and fixes, including checking a formula Copilot wrote). CHECK (3 multiple choice questions with explanatory feedback). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/numbers-chat.png", alt: "Copilot Chat showing the lesson 7 prompt and its answer, with four Excel tasks and example prompts, and advice on good and bad tables.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "statement", label: "Set up first", text: "Put the data in a table with clear headers such as Date, Project, Customer, Amount, and Status. One row per record, one kind of information per column." },
        { type: "demo", heading: "Demo: a formula column in Excel", intro: "Three steps in desktop Excel with Copilot.", steps: [
          { title: "Ask Copilot for a sample table", body: "On a blank sheet, the Copilot pane in Excel can build the table itself. Typed here: \"Clear cells A1 to C4, then create a table starting at A1 with the columns Name, Hours, and Hourly Rate, and three rows of sample data.\"", src: "img/numbers-excel-1.png", audio: "audio/demo-numbers-1.mp3", length: "6 sec", transcript: "A blank sheet. I asked the Copilot pane to build a small table - name, hours, hourly rate, three rows.", alt: "The Copilot pane in Excel with a request for a small sample table typed in.", source: "Copilot in Excel" },
          { title: "Ask for the column", body: "\"Add a new column called Total Cost that multiplies Hours by Hourly Rate for each row.\"", src: "img/numbers-excel-2.png", audio: "audio/demo-numbers-2.mp3", length: "6 sec", transcript: "Copilot built it and formatted it. Now the real ask - a Total Cost column that multiplies hours by rate.", alt: "The Copilot pane in Excel with the request for a Total Cost column typed in.", source: "Copilot in Excel" },
          { title: "Check a row by hand, then keep it", body: "Copilot adds the column, shows the formula it used, and waits for Done or Undo. Multiply one row yourself: 40 hours at 25 dollars is 1,000. It matches, so keep it.", src: "img/numbers-excel-3.png", audio: "audio/demo-numbers-3.mp3", length: "7 sec", transcript: "There is the column and the formula it used. Forty hours at twenty-five dollars is a thousand. It matches, so I keep it.", alt: "Excel showing the new Total Cost column with currency values, and the Copilot pane showing the formula it used with Done and Undo buttons.", source: "Copilot in Excel" }
        ] },
        { type: "list", heading: "Four things to ask for", items: [
          "**Insights:** \"Analyze this table and tell me the main trends, outliers, and changes over time.\"",
          "**A formula column:** \"Add a new column called Total Cost that multiplies Hours by Hourly Rate for each row.\"",
          "**An explanation:** \"Explain what the formula in column G does in plain language.\"",
          "**A chart:** \"Create a chart that shows total Amount by month.\""
        ] },
        { type: "tabs", heading: "Good table, bad table", items: [
          { title: "Good table", body: "One header row, and each column holds one kind of thing. Dates are stored as dates, numbers as numbers, and there are no blank rows inside the table." },
          { title: "Bad table", body: "Different kinds of data in the same column. Merged cells, an extra title row, or notes placed between the records." },
          { title: "Fix it", body: "Clean the data before you ask. Give every column a clear header and make every row one record. Then select the range and format it as a table." }
        ] },
        { type: "accordion", heading: "Mistakes to avoid", items: [
          { title: "Asking about a range that is not a table", body: "Convert the range to a table with headers first. Copilot reads the headers to understand the columns." },
          { title: "Column names like \"Info\" or \"Data\"", body: "Rename them so the purpose is obvious: Customer, Status, Amount." },
          { title: "Trusting a formula you did not check", body: "Read the formula, test a few rows by hand, and make sure the results make sense before you share them." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "What is the best structure for data you want Copilot to analyze?", options: [
            { text: "One table with headers and one row per record.", correct: true, feedback: "Yes. Headers and one row per record are what Copilot reads." },
            { text: "Blank rows between the records.", feedback: "No. Blank rows break the table." },
            { text: "Notes mixed into the data.", feedback: "No. Notes in the data column confuse the analysis." }
          ] },
          { q: "Which prompt would help Copilot explain a calculation?", options: [
            { text: "\"Create a chart.\"", feedback: "No. A chart shows; it does not explain." },
            { text: "\"Explain what the formula in column G does in plain language.\"", correct: true, feedback: "Yes. It asks for the purpose and the logic of a formula that already exists." },
            { text: "\"Sort this table.\"", feedback: "No. Sorting changes the order, not your understanding." }
          ] },
          { q: "What should you do after Copilot writes a formula?", options: [
            { text: "Assume it is correct and move on.", feedback: "No. A formula can be plausible and wrong." },
            { text: "Delete the formula immediately.", feedback: "No. Check it first; it is often right." },
            { text: "Check the formula and verify a few results by hand.", correct: true, feedback: "Yes. Confirm with sample rows before you rely on it." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["num-trends", "num-column", "num-explain", "num-chart"] }
      ] },

    /* ---------- 8 ---------- */
    { id: "present", title: "Present", minutes: 3, madeWith: "copilot",
      intro: "Copilot can turn a document into a first-draft deck. You then refine the slides, fix the message, and add notes for the person presenting.",
      blocks: [
        { type: "audio", src: "audio/present.mp3", title: "Listen: a word from Clay", length: "28 sec", transcript: "A first-draft deck from a document is one of the most useful things Copilot does, and one of the easiest to misuse. Name the audience, the number of slides, and the tone, and you get a deck to refine. Add a slide, shorten it, change the tone, add speaker notes. In the demo, watch the note Copilot writes about its own work. It tells you which slides it checked and which it did not. That is your review list." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 8, \"Present\". Sections: INTRO (2 sentences). FROM A DOCUMENT (3 steps to make a first-draft deck from a document, one example prompt that names the audience, the number of slides, and the tone). REFINE (4 example follow-up prompts: add a slide, shorten, change tone, add speaker notes). ACCORDION (5 short sections a learner can open as needed: titles, images, notes, layout, what to check before you present; 2 sentences each). CHECK (2 multiple choice questions with explanatory feedback). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/present-chat.png", alt: "Copilot Chat showing the lesson 8 prompt and its answer, with three steps for making a deck from a document and four refinement prompts.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "demo", heading: "Demo: a first-draft deck", intro: "Three steps in desktop PowerPoint with Copilot.", steps: [
          { title: "Start with the Copilot box", body: "PowerPoint opens with \"What would you like to create today?\" and a box that takes a description or a file.", src: "img/present-ppt-1.png", audio: "audio/demo-present-1.mp3", length: "7 sec", transcript: "PowerPoint opens with a question - what would you like to create today? That box takes a description or a file.", alt: "The PowerPoint start screen with the Copilot box asking what you would like to create today.", source: "Copilot in PowerPoint" },
          { title: "Describe the deck", body: "Name the audience, the slide count, and the tone. Typed here: \"Create a 10-slide presentation about a project update for a team of project stakeholders. Cover the summary, progress, risks, and next steps. Use a professional, clear tone.\" With a document attached, you would say \"from this document\" instead.", src: "img/present-ppt-2.png", audio: "audio/demo-present-2.mp3", length: "7 sec", transcript: "I named the audience, the slide count, and the tone. Those three decide most of what comes back.", alt: "The Copilot box in PowerPoint with a request for a ten-slide presentation typed in.", source: "Copilot in PowerPoint" },
          { title: "Read the deck and what Copilot says about it", body: "Copilot builds the ten slides and, in the pane, lists the slide order and says which slides it checked visually and which it did not. That note is your review list. Then refine: add a slide, shorten, change the tone, add notes.", src: "img/present-ppt-3.png", audio: "audio/demo-present-3.mp3", length: "9 sec", transcript: "Ten slides, built. And in the pane, Copilot says which slides it checked visually and which it did not. Start your review there.", alt: "PowerPoint showing the ten-slide Project Update deck Copilot built, with the Copilot pane listing the slide order and noting which slides it checked.", source: "Copilot in PowerPoint" }
        ] },
        { type: "process", heading: "From a document to a deck", steps: [
          { title: "Open the document", body: "The one that holds the content you want to present. A document with headings makes a better outline." },
          { title: "Ask for the presentation", body: "\"Create a 10-slide presentation from this document for a team of project stakeholders. Use a professional, clear tone.\"" },
          { title: "Review and refine", body: "Read every slide. Fix the message first, then the visuals, then the notes." }
        ] },
        { type: "list", heading: "Four refinements", items: [
          "**Add a slide:** \"Add a slide that summarizes risks and next steps.\"",
          "**Shorten:** \"Reduce this presentation to 6 slides and keep only the key points.\"",
          "**Change the tone:** \"Rewrite the presentation in a more conversational tone for a general business audience.\"",
          "**Add notes:** \"Add speaker notes for each slide with talking points for the presenter.\""
        ] },
        { type: "accordion", heading: "Before you present, check these", intro: "Open the ones you need.", items: [
          { title: "Titles", body: "A title should carry the point of the slide. Ask Copilot to make titles shorter, clearer, or more action oriented." },
          { title: "Images", body: "Make sure each image supports the message. Replace any that are off topic or unclear for this audience." },
          { title: "Notes", body: "Speaker notes keep you on track. Ask Copilot for notes that explain the key points and the transitions." },
          { title: "Layout", body: "If a slide feels crowded, ask Copilot to split it into two." },
          { title: "Facts", body: "Verify every number, name, and date against the source document. Make sure the deck fits the audience and the purpose of the meeting." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "What is a good first step when creating a presentation with Copilot?", options: [
            { text: "Start with a blank slide and build everything by hand.", feedback: "No. You give up the first draft." },
            { text: "Open a document that already holds the information you want to present.", correct: true, feedback: "Yes. The document is the source material for the draft." },
            { text: "Skip reviewing the slides after they are made.", feedback: "No. The review is where the deck becomes yours." },
            { text: "Delete all the speaker notes.", feedback: "No. Notes help the presenter." }
          ] },
          { q: "Which prompt refines a presentation draft?", options: [
            { text: "\"Close the presentation.\"", feedback: "No." },
            { text: "\"Print all slides.\"", feedback: "No." },
            { text: "\"Add a slide that summarizes risks and next steps.\"", correct: true, feedback: "Yes. It improves the content of an existing draft." },
            { text: "\"Change the screen brightness.\"", feedback: "No." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["present-deck", "present-risks", "present-notes"] }
      ] },

    /* ---------- 9 ---------- */
    { id: "check", title: "Check before you trust it", minutes: 4, madeWith: "copilot",
      intro: "Every Copilot answer needs a human check before you use it. Copilot helps you move faster; you are still responsible for the result.",
      blocks: [
        { type: "audio", src: "audio/check.mp3", title: "Listen: a word from Clay", length: "41 sec", transcript: "This is the lesson I would not skip. Copilot helps you move faster. It does not take the responsibility off your desk. Every answer gets a human check before you use it - open the sources, check the names and the numbers, check the dates, and read it once as the person who will receive it. There is also a short list of things not to paste into any chat tool unless your company policy says you can. Passwords, customer data, unreleased numbers, anything marked confidential. Your policy wins over anything I say here. The scenario is a wrong delivery date. See what thirty seconds of checking is worth." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 9, \"Check before you trust it\". Sections: INTRO (2 sentences on why every output needs a human check). HABITS (5 habits: open the sources, check names and numbers, check dates, ask for the source of a claim, read it once as the recipient). WORK IQ (3 sentences: Copilot can answer from your work content or from the web; the Work IQ setting controls that; know which one you are in). DO NOT PASTE (a short list of things not to paste into any chat tool unless your company policy allows it: passwords, customer personal data, unreleased financials, anything marked confidential; say that company policy wins). SCENARIO (a short scenario: Copilot drafts a customer email with a wrong delivery date; 3 choices with consequences; say which is best). CHECK (3 questions with explanatory feedback: 2 multiple choice, 1 multiple response). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/check-chat.png", alt: "Copilot Chat showing the lesson 9 prompt and its answer, with five checking habits, a note on Work IQ, and a list of things not to paste.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "list", heading: "Five habits", style: "check", items: [
          "Open the sources. If Copilot cites files, emails, or web pages, open them and make sure they support the answer.",
          "Check names and numbers. People, customers, project names, budgets, and quantities.",
          "Check dates. Deadlines, delivery dates, meeting dates, and timelines.",
          "Ask for the source of a claim. If something is important or surprising, ask Copilot where it came from.",
          "Read it once as the recipient. Before you send anything, read it from the other person's side to catch errors, confusion, or the wrong tone."
        ] },
        { type: "statement", label: "Work content or the web", text: "In a work account, Copilot can answer from your work content or from the web. The Work IQ button controls which. Know which one you are in before you trust an answer or share it. The lesson text in this course was drafted on a personal account, where only the web and what you paste are available." },
        { type: "list", heading: "Do not paste these into any chat tool unless your company policy allows it", items: [
          "Passwords and access codes.",
          "Customer personal data.",
          "Unreleased financial results.",
          "Anything marked confidential.",
          "If your company's policy says something different from this list, the policy wins."
        ] },
        { type: "scenario", heading: "The wrong delivery date", setup: "You asked Copilot to draft an email to a customer about a delivery. The draft says June 15. The approved project plan says June 30. What do you do?", choices: [
          { text: "Send the email without checking the date.", outcome: "The customer plans around June 15. Now you have a second email to write, and some trust to rebuild." },
          { text: "Change the date because it looks wrong, without checking.", outcome: "You might still send the wrong date. A guess is not a check." },
          { text: "Open the approved project plan, confirm the date, then fix the email.", best: true, outcome: "The customer gets the right date and expectations stay aligned. Thirty seconds of checking." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "What is the best first step when Copilot gives you an important answer?", options: [
            { text: "Trust it because it came from Copilot.", feedback: "No. Copilot can be wrong, and the answer is yours once you use it." },
            { text: "Open the sources and verify the information.", correct: true, feedback: "Yes. Important answers get checked against their sources." },
            { text: "Forward it to others immediately.", feedback: "No. Forwarding makes its mistakes yours." }
          ] },
          { q: "Why check dates in Copilot's output?", options: [
            { text: "Dates affect plans, deadlines, and commitments.", correct: true, feedback: "Yes. One wrong date can mean a missed deadline or a confused customer." },
            { text: "Dates are never in Copilot's answers.", feedback: "No. They are, and they are easy to get wrong." },
            { text: "Dates do not matter if the rest is right.", feedback: "No. The date is often the part people act on." }
          ] },
          { q: "Which items should stay out of a chat tool unless company policy allows them? Pick all that apply.", type: "multi", options: [
            { text: "Passwords", correct: true, feedback: "Yes." },
            { text: "Customer personal data", correct: true, feedback: "Yes." },
            { text: "Unreleased financial results", correct: true, feedback: "Yes." },
            { text: "Anything marked confidential", correct: true, feedback: "Yes." },
            { text: "The published company holiday schedule", feedback: "No. It is public already." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["check-source", "check-draft"] }
      ] },

    /* ---------- 10 ---------- */
    { id: "together", title: "Put it together", minutes: 5, madeWith: "copilot",
      intro: "Real work does not stay in one app. Three everyday activities, each chaining the earlier lessons: a status update, a customer reply, and a meeting turned into an action list.",
      blocks: [
        { type: "audio", src: "audio/together.mp3", title: "Listen: a word from Clay", length: "33 sec", transcript: "Real work does not stay in one app, so this lesson chains the earlier ones. A weekly status update - catch up, pull the decisions, draft, check. A reply to a customer who wants a change - find what was promised, draft, check against the source, shorten. A meeting turned into an action list - recap, owners, table, send. Each step names the app and the prompt. Then the scenario puts you at four o'clock on a Friday and asks what you do first." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 10, \"Put it together\". It chains the earlier lessons into three everyday business activities that cross apps. Sections: INTRO (2 sentences). ACTIVITY 1, a weekly status update: 4 steps, each naming the app and the exact prompt to use (catch up in Teams and Outlook, pull decisions from a meeting recap, draft the update in Word or an email, check it before sending). ACTIVITY 2, a reply to a customer who asked for a change: 4 steps the same way (find what was promised before, draft the reply in Outlook with the tone stated, check the dates and names against the source, shorten). ACTIVITY 3, a meeting into an action list: 4 steps the same way (recap the meeting, list action items with owners, put them into a table in Excel or a list in a message, send to the attendees). SCENARIO (a short branching scenario: it is Friday at 4, the status update is due, you have three unread threads and one missed meeting; 3 choices of what to do first with Copilot, each with its consequence in 2 sentences, and say which is best and why). CHECK (3 multiple choice questions with explanatory feedback, one per activity). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/together-chat.png", alt: "Copilot Chat showing the lesson 10 prompt and its answer, with three activities of four steps each, every step naming the app and the prompt.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "process", heading: "Activity 1: a weekly status update", steps: [
          { title: "Catch up (Teams and Outlook)", body: "\"Catch me up on the important messages, emails, and discussions about the project from this week. Group them by topic and highlight anything that needs attention.\"" },
          { title: "Pull the decisions (meeting recap)", body: "\"From this meeting recap, list the key decisions, risks, and next steps.\"" },
          { title: "Draft the update (Word or Outlook)", body: "\"Draft a weekly status update for the project. Include accomplishments, current work, risks, decisions, and next steps. Use a professional business tone.\"" },
          { title: "Check it before you send", body: "\"Check this update for unclear statements, missing context, and unsupported claims.\" Then open the sources for any number or date." }
        ] },
        { type: "process", heading: "Activity 2: a reply to a customer who asked for a change", steps: [
          { title: "Find what was promised (Outlook)", body: "\"Find previous emails with this customer about the requested change. Summarize what was promised, any agreed dates, and open questions.\"" },
          { title: "Draft the reply (Outlook)", body: "\"Draft a reply to the customer. Thank them for the request, explain the current status, and use a friendly and professional tone.\"" },
          { title: "Check it against the source (Outlook)", body: "\"Check this draft against the source emails. Verify customer names, project names, dates, and commitments. Flag anything that may be incorrect.\"" },
          { title: "Shorten", body: "\"Shorten this message while keeping the key information and a professional tone.\"" }
        ] },
        { type: "process", heading: "Activity 3: a meeting into an action list", steps: [
          { title: "Recap (meeting recap)", body: "\"Summarize this meeting in five bullet points.\"" },
          { title: "List the actions with owners", body: "\"List all action items from this meeting and include the owner if one was assigned.\"" },
          { title: "Put them in a table (Excel) or a message", body: "\"Put these action items into a table with columns for Action Item, Owner, Status, and Due Date.\" Or: \"Turn these action items into a clear message I can send to the team.\"" },
          { title: "Send to the attendees (Outlook or Teams)", body: "\"Draft a message to the attendees with the meeting summary and action items. Ask owners to confirm their assignments.\"" }
        ] },
        { type: "scenario", heading: "Friday at four", setup: "It is Friday at 4:00. Your status update is due. You have three unread email threads and one missed meeting. What do you ask Copilot first?", choices: [
          { text: "Draft the status update right now.", outcome: "A fast draft that may miss the decisions and updates sitting in the unread threads and the missed meeting." },
          { text: "Catch me up on the unread threads first.", outcome: "You know the latest discussions. You may still miss the decisions made in the meeting." },
          { text: "Summarize the unread threads and the missed meeting, then draft.", best: true, outcome: "The most complete picture of the week. The update is accurate because it covers both the written discussions and the meeting outcomes." }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "For a weekly status update, what should you do before drafting?", options: [
            { text: "Start writing from memory.", feedback: "No. Memory misses things; the point of Copilot is to gather them." },
            { text: "Catch up on messages, emails, and meeting outcomes first.", correct: true, feedback: "Yes. Copilot drafts better when it has the week's context." },
            { text: "Copy last week's update.", feedback: "No. Last week is not this week." }
          ] },
          { q: "Before sending a reply to a customer, what is the best final check?", options: [
            { text: "Verify dates, names, and commitments against the source messages.", correct: true, feedback: "Yes. The draft is Copilot's; the facts are yours to confirm." },
            { text: "Make the message longer.", feedback: "No. Length is not accuracy." },
            { text: "Remove all details.", feedback: "No. The details are why the customer wrote." }
          ] },
          { q: "After a meeting, what is the most useful thing to produce?", options: [
            { text: "A list of action items with owners.", correct: true, feedback: "Yes. Owners and actions are what move the work." },
            { text: "A copy of the meeting invitation.", feedback: "No. Everyone has that already." },
            { text: "A new meeting with no agenda.", feedback: "No." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["together-status", "together-actions", "together-send"] }
      ] },

    /* ---------- 11 ---------- */
    { id: "handoff", title: "Hand it off", minutes: 5, madeWith: "copilot",
      intro: "One fun job, carried across every app: organize a one-day team offsite for 20 people. The skill is the handoff. Start in one place, then give the result to the next app instead of starting over.",
      blocks: [
        { type: "audio", src: "audio/handoff.mp3", title: "Listen: a word from Clay", length: "35 sec", transcript: "This one is my favorite, because it is the part people do not think to try. You have one job - organize a one-day offsite for twenty people. Instead of starting over in every app, you hand the work along. Chat interviews you. Word turns the answers into a plan. Excel turns the plan into a budget. PowerPoint shows it, and Outlook sends it. Then go backwards. A table becomes three sentences. A deck becomes a handout. The demo is real, and so is the moment where the budget lands exactly on the number." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write lesson 11, \"Hand it off\". The learner has one fun job: organize a one-day team offsite for 20 people. The lesson teaches moving work between apps with Copilot. Sections: INTRO (2 sentences). RELAY (5 steps, each naming the app, what you hand it from the step before, and the exact prompt: start in Copilot Chat with an interview, draft the plan in Word, build the budget in Excel, make a kickoff deck in PowerPoint from the plan, write the invitation in Outlook from the plan and the budget). BACKWARDS (3 moves that go the other way, each with a prompt: deck to one-page handout, budget table to three sentences for an email, meeting recap to an FAQ). FLASHCARDS (5 cards: front is the name of an unusual move, back is the prompt: interview me first, read this as the recipient, what is missing, give me two versions, explain it to someone new). SCENARIO (the venue cancels two days before; 3 choices of what to do first with Copilot, each with its consequence in 2 sentences, and say which is best). CHECK (one matching exercise: 6 tasks, each matched to the app you would start in; and 2 multiple choice questions with explanatory feedback). Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/handoff-chat.png", alt: "Copilot Chat showing the lesson 11 prompt and its answer, a five-step relay with the app, the handoff, and the prompt for each step.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted this lesson." }
        ] },
        { type: "statement", label: "The idea", text: "Each app is good at one shape of work. Chat thinks it through, Word writes it down, Excel adds it up, PowerPoint shows it, Outlook sends it. Your job is to carry the result from one to the next." },
        { type: "demo", heading: "Demo: the relay, for real", intro: "Four handoffs run on a real machine. The interview answers are made up for the demo, and the prompts typed were a little longer than the short versions quoted here because they carried those answers. Everything Copilot produced is as it came.", steps: [
          { title: "Chat: interview me first", body: "Start by asking Copilot to ask you. \"I need to organize a one-day team offsite for 20 people. Interview me first. Ask one question at a time until you have enough information to create a complete plan.\" It opens with the goal.", src: "img/handoff-relay-1.png", audio: "audio/demo-handoff-1.mp3", length: "5 sec", transcript: "I did not ask for a plan. I asked Copilot to interview me first, one question at a time.", alt: "Copilot Chat with the interview-me-first prompt and Copilot's first question, What is the primary goal of the offsite, with a list of example goals.", source: "Copilot Chat" },
          { title: "Word: the answers become a plan", body: "Hand Word the interview answers: \"Use this interview to create a one-day team offsite plan. Include objectives, agenda, activities, logistics, risks, owners, and a timeline.\" Copilot kept the date and venue marked as unconfirmed, because the answers did not settle them.", src: "img/handoff-relay-2.png", audio: "audio/demo-handoff-2.mp3", length: "7 sec", transcript: "I gave Word the interview answers and it wrote the plan. Notice it left the date and the venue as unconfirmed.", alt: "Word showing the drafted One-Day Team Offsite plan with attendees, budget, and venue across the top, and the Copilot pane describing its plan.", source: "Copilot in Word" },
          { title: "Excel: the plan becomes a budget", body: "Hand Excel the plan's facts: \"Create a budget table from this offsite plan. Include categories, estimated costs, quantities, totals, and a grand total. Add a column for notes and assumptions.\" Eight lines including a contingency, and a total that lands on the 3,000 dollar target. Check the unit costs yourself; they are estimates, and the sheet says so.", src: "img/handoff-relay-3.png", audio: "audio/demo-handoff-3.mp3", length: "8 sec", transcript: "Excel took the same facts and built the budget, with a notes column for every assumption. Check those unit costs yourself.", alt: "Excel showing the One-Day Offsite Budget table Copilot built, with categories from venue rental to contingency, a notes column, and a grand total of 3,000 dollars.", source: "Copilot in Excel" },
          { title: "PowerPoint: the plan becomes a kickoff deck", body: "Hand PowerPoint the plan's facts. A project-update deck was already open, so the request was to replace it: \"Replace this deck with a 6-slide kickoff presentation for a one-day team offsite, from this plan. Include a title slide, goals, agenda, logistics, roles, and next steps.\" Six slides came back. Copilot's note says it checked how slide 2 rendered and did not check the others again, so look at those yourself.", src: "img/handoff-relay-ppt.png", alt: "PowerPoint showing a six-slide Team Offsite Kickoff deck with the title slide open, thumbnails for goals, agenda, logistics, roles, and next steps, and the Copilot pane describing what it replaced and which slide it checked.", source: "Copilot in PowerPoint" },
          { title: "Excel, backwards: the table becomes three sentences", body: "Now go the other way. \"Summarize this budget table in three sentences for an email update. Highlight the total cost and any major assumptions.\" Copy the answer into the invitation.", src: "img/handoff-relay-4.png", audio: "audio/demo-handoff-4.mp3", length: "5 sec", transcript: "And backwards - the whole table in three sentences, ready to paste into the invitation.", alt: "The Copilot pane in Excel with a three-sentence summary of the offsite budget for an email.", source: "Copilot in Excel" }
        ] },
        { type: "process", heading: "The full relay", steps: [
          { title: "Copilot Chat: interview", body: "You bring the idea. \"Interview me first. Ask one question at a time until you have enough information to create a complete plan.\"" },
          { title: "Word: draft the plan", body: "You hand it the interview. \"Use this interview to create a one-day team offsite plan. Include objectives, agenda, activities, logistics, risks, owners, and a timeline.\"" },
          { title: "Excel: build the budget", body: "You hand it the plan. \"Create a budget table from this offsite plan. Include categories, estimated costs, quantities, totals, and a grand total. Add a column for notes and assumptions.\"" },
          { title: "PowerPoint: make the kickoff deck", body: "You hand it the plan. \"Create a kickoff presentation from this offsite plan. Include a title slide, goals, agenda, logistics, roles, timeline, risks, and next steps.\" The demo above ran a version of this step." },
          { title: "Outlook: write the invitation", body: "You hand it the plan and the budget. \"Draft an invitation email for this team offsite using the plan and budget. Explain the purpose, key details, expectations, timing, and next steps. Keep the message clear and friendly.\"" }
        ] },
        { type: "statement", label: "How the handoff happens", text: "In this demo the handoff was a paste: the facts from one step typed into the next prompt. That works on any account. In a work account with files saved to OneDrive or SharePoint, you can point at the file itself instead, and Copilot reads it. Either way, say what you are handing over." },
        { type: "list", heading: "Go backwards too", items: [
          "**Deck to handout:** \"Turn this presentation into a one-page handout. Keep the key decisions, schedule, and action items.\"",
          "**Table to sentences:** \"Summarize this budget table in three sentences for an email update. Highlight the total cost and any major assumptions.\"",
          "**Recap to FAQ:** \"Turn this meeting recap into an FAQ. Group similar questions together and provide short answers.\""
        ] },
        { type: "flashcards", heading: "Five moves people do not think to try", intro: "Read the name, guess the prompt, then turn the card.", frontLabel: "The move", backLabel: "The prompt", cards: [
          { front: "Interview me first", back: "Interview me first. Ask questions until you have enough information to complete the task." },
          { front: "Read this as the recipient", back: "Read this as the recipient. What would be confusing, unclear, or easy to miss?" },
          { front: "What is missing", back: "Review this and tell me what information is missing, assumed, or unsupported." },
          { front: "Give me two versions", back: "Create two versions of this. Make the differences clear and explain when to use each." },
          { front: "Explain it to someone new", back: "Explain this to someone who is new to the topic. Use simple language and practical examples." }
        ] },
        { type: "scenario", heading: "The venue cancels", setup: "Two days before the offsite, the venue cancels. What do you ask Copilot first?", choices: [
          { text: "Write the cancellation email.", outcome: "People hear quickly. You still have no replacement plan, so the questions start arriving right away." },
          { text: "Find the gaps in the current plan and make a replacement venue checklist.", best: true, outcome: "You get a clear list of what a new venue must have before you decide anything. The team can compare options fast and with fewer mistakes." },
          { text: "Make new slides about the problem.", outcome: "The issue is documented. There is still no action plan and no venue." }
        ] },
        { type: "sorting", heading: "Where would you start?", intro: "Put each task in the app you would start in.", categories: ["Copilot Chat", "Word", "Excel", "PowerPoint", "Outlook"], cards: [
          { text: "Interview stakeholders about the offsite", category: "Copilot Chat" },
          { text: "Create the event plan", category: "Word" },
          { text: "Build a cost estimate", category: "Excel" },
          { text: "Create a presentation for the team", category: "PowerPoint" },
          { text: "Draft the invitation email", category: "Outlook" },
          { text: "Turn meeting notes into questions and answers", category: "Word" }
        ] },
        { type: "knowledge", heading: "Check", questions: [
          { q: "You have a finished plan and need a budget. Where do you start?", options: [
            { text: "Outlook", feedback: "No. Outlook sends the result; it does not add it up." },
            { text: "Excel", correct: true, feedback: "Yes. Excel is where totals, quantities, and assumptions belong." },
            { text: "PowerPoint", feedback: "No. Slides come after the numbers." },
            { text: "Copilot Chat", feedback: "It could draft a table, but the budget will live and change in Excel, so start there." }
          ] },
          { q: "You have a finished plan and need slides for the kickoff. Where do you start?", options: [
            { text: "Word", feedback: "No. The plan is already written; now it needs to be shown." },
            { text: "Outlook", feedback: "No. Outlook sends the invitation; it does not build slides." },
            { text: "PowerPoint", correct: true, feedback: "Yes. Hand PowerPoint the plan and ask for the deck." },
            { text: "Excel", feedback: "No. Excel holds the budget, not the story." }
          ] }
        ] },
        { type: "prompts", heading: "Prompts from this lesson", ids: ["hand-interview", "hand-recipient", "hand-missing", "hand-two", "hand-handout", "hand-sentences"] }
      ] },

    /* ---------- 12 ---------- */
    { id: "quiz", title: "Final quiz", kind: "quiz", minutes: 5, madeWith: "copilot", madeLine: "Questions drafted with Copilot Chat. See the last lesson.",
      intro: "Eleven questions, at least one per lesson. Answer them all; you get feedback on each one and a score at the end.",
      blocks: [
        { type: "audio", src: "audio/quiz.mp3", title: "Listen: a word from Clay", length: "23 sec", transcript: "Eleven questions, at least one from each lesson. You get feedback on every answer, right or wrong, because the feedback is where the learning happens. If you miss a few, that is fine. The feedback names the lesson to go back to. Take it again when you are ready - the order shuffles each time." },
        { type: "reveal", label: "Show me the prompt used", intro: "Every prompt in this course began with the same preamble, shown once in the last lesson. This is the part that asked for this lesson. Below it is the real Copilot Chat run.", prompt: "Write the final quiz for the course. 10 questions covering all nine lessons (at least one per lesson): 7 multiple choice with 4 options, 2 multiple response, 1 fill in the blank. For each, mark the correct answer and give one sentence of feedback that explains why. Keep every question general to any industry. Return only the sections asked for, with the headings given.", blocks: [
          { type: "image", src: "img/quiz-chat.png", alt: "Copilot Chat showing the quiz prompt and the first questions it drafted, each with its options, the correct answer, and a feedback sentence.", real: true, source: "Copilot Chat", caption: "The Copilot Chat run that drafted these questions." }
        ] },
        { type: "quiz", pass: 80, questions: [
          { q: "What is the best description of Microsoft Copilot in Microsoft 365?", options: [
            { text: "A tool that only searches the internet.", feedback: "No. In a work account it also uses your emails, chats, meetings, and files." },
            { text: "An assistant that helps with work tasks using information you already have access to.", correct: true, feedback: "Yes. It works inside your permissions." },
            { text: "A tool that replaces all business software.", feedback: "No. It works inside the apps you already use." },
            { text: "A tool that works without any input from you.", feedback: "No. You ask, it answers, you check." }
          ] },
          { q: "Which prompt follows the Goal, Context, Source, Expectations pattern most closely?", options: [
            { text: "\"Help me.\"", feedback: "No. No goal, context, source, or expectations." },
            { text: "\"Summarize this.\"", feedback: "No. A goal and nothing else." },
            { text: "\"Create a project update for the team using the attached document, in five bullet points.\"", correct: true, feedback: "Yes. Goal, audience, source, and the shape of the answer." },
            { text: "\"Write something good.\"", feedback: "No." }
          ] },
          { q: "When you return from time away, how can Copilot help?", options: [
            { text: "By guessing what happened.", feedback: "No. It reads what is there." },
            { text: "By summarizing the messages and discussions you can access.", correct: true, feedback: "Yes. Ask for decisions, open questions, and action items with owners." },
            { text: "By deleting old conversations.", feedback: "No." },
            { text: "By changing project plans on its own.", feedback: "No." }
          ] },
          { q: "Before a meeting, what is a useful way to use Copilot?", options: [
            { text: "Have it attend in your place.", feedback: "No." },
            { text: "Have it gather the background: the invite, the thread, and the last meeting's notes.", correct: true, feedback: "Yes. That is the prepare-me prompt from lesson 4." },
            { text: "Have it approve decisions.", feedback: "No. Decisions are yours." },
            { text: "Have it decide the meeting's outcome.", feedback: "No." }
          ] },
          { q: "After Copilot drafts an email or a document, what do you do?", options: [
            { text: "Send or publish it immediately.", feedback: "No." },
            { text: "Read and edit it.", correct: true, feedback: "Yes. You are responsible for what goes out." },
            { text: "Assume every detail is correct.", feedback: "No." },
            { text: "Remove all the specific information.", feedback: "No. Check the specifics; do not delete them." }
          ] },
          { q: "Which are good uses of Copilot for finding information across your work? Pick all that apply.", type: "multi", options: [
            { text: "Finding a decision about a project.", correct: true, feedback: "Yes." },
            { text: "Locating a detail about a customer.", correct: true, feedback: "Yes." },
            { text: "Finding where a topic was discussed.", correct: true, feedback: "Yes." },
            { text: "Finding information you do not have permission to open.", feedback: "No. Copilot does not grant new permissions." },
            { text: "Bringing together information from several sources you can open.", correct: true, feedback: "Yes." }
          ] },
          { q: "In Excel, Copilot can help you:", options: [
            { text: "Replace the company's data rules.", feedback: "No." },
            { text: "Analyze and explore the data in a table.", correct: true, feedback: "Yes. Trends, formulas, explanations, and charts. You still check the results." },
            { text: "Guarantee a correct conclusion.", feedback: "No. It can be wrong; check a few rows by hand." },
            { text: "Open data you cannot open yourself.", feedback: "No." }
          ] },
          { q: "In PowerPoint, Copilot helps with:", options: [
            { text: "Creating and refining a presentation.", correct: true, feedback: "Yes. A first draft from a document, then slides, tone, and notes." },
            { text: "Making the business decision for you.", feedback: "No." },
            { text: "Sharing confidential information automatically.", feedback: "No." },
            { text: "Replacing the presenter.", feedback: "No." }
          ] },
          { q: "Which actions belong to \"check before you trust it\"? Pick all that apply.", type: "multi", options: [
            { text: "Verify the important facts.", correct: true, feedback: "Yes." },
            { text: "Open the sources when they are given.", correct: true, feedback: "Yes." },
            { text: "Use your own judgment before acting on a result.", correct: true, feedback: "Yes." },
            { text: "Paste sensitive information without a thought for policy or risk.", feedback: "No. That is the opposite of checking." },
            { text: "Check that the answer matches what you asked.", correct: true, feedback: "Yes." }
          ] },
          { q: "You have a finished plan and need a budget for it. Which app do you hand the plan to?", options: [
            { text: "Outlook", feedback: "No. Outlook sends the result." },
            { text: "Excel", correct: true, feedback: "Yes. That is the handoff from lesson 11: the plan goes to Excel and comes back as a table." },
            { text: "PowerPoint", feedback: "No. Slides come after the numbers." },
            { text: "Teams", feedback: "No." }
          ] },
          { q: "Putting it together means using Copilot across several apps to finish one ________.", type: "fill", answer: "task", answers: ["task", "activity", "job", "piece of work", "result"], feedback: "The apps change; the task is the thread that runs through them." }
        ] }
      ] },

    /* ---------- 13 ---------- */
    { id: "built", title: "How this course was built", kind: "closing", minutes: 3,
      intro: "This course is a work sample. It shows how I use Copilot, and it shows how I build training. Here is what happened, in order.",
      blocks: [
        { type: "audio", src: "audio/built.mp3", title: "Listen: a word from Clay", length: "36 sec", transcript: "A quick word about how this was made, because it is part of the point. The text of every lesson was drafted with Copilot Chat on my personal Microsoft account, one prompt per lesson. Each lesson carries the real capture of that run, and the demos are real captures from Copilot in Word, Excel, and PowerPoint. The page itself is hand-written, no course tool. Every lesson and question lives in one file, so changing a question is changing a few lines. And every block you clicked was chosen for a reason. This lesson lists them." },
        { type: "statement", label: "What Copilot did and did not do", text: "The lesson text was drafted with Copilot Chat on a personal Microsoft account. Copilot Chat drafted the text of every lesson and the quiz from one prompt each. It did not build the page, pick the block types, or take the screen captures. The drawn chat panels are illustrations written here, and say so under each one." },
        { type: "accordion", heading: "The preamble every prompt began with", items: [ { title: "Show the preamble", body: "You are helping write a short workplace training course called \"Copilot at Work\". The audience is any office worker in any industry who has Microsoft Copilot in their Microsoft 365 apps and has not used it much. Write in plain, speakable US English, short sentences, no hype words, no em dashes. Use the current product names (Microsoft Copilot, Copilot Chat). Do not invent features; if you are unsure a feature exists, say so. Examples must work for any industry: use a generic team, a generic project, a generic customer. Format exactly as asked." } ] },
        { type: "accordion", heading: "The prompt behind each lesson, and what changed", intro: "One prompt per lesson, run in Copilot Chat on 2026-11-11. Every teaching lesson, and the quiz, carries the real capture of its run behind \"Show me the prompt used\". Open any lesson to see what was kept, fixed, or cut.", items: [
          { title: "Start here", body: ["Asked for: an intro, a line per app, what Copilot can see, three myths, and three questions with feedback.", "Kept nearly all of it. Fixed the product name to today's name, Microsoft Copilot, and shortened the feedback. Added the labeled drawing, the one-rule callout, and a line about asking IT when a button is missing."] },
          { title: "Ask well", body: ["Asked for: the four ingredients with examples, the slash tip, three weak-and-better pairs, follow-ups, and a sorting activity.", "Kept the ingredients and the pairs nearly word for word. Turned the ingredients into tabs and the sorting list into a real drag-and-sort block. Made the slash tip say it needs a work account."] },
          { title: "Catch up", body: ["Asked for: steps for an email thread and a Teams chat, an after-a-week prompt, three mistakes, and three questions.", "Kept the steps and prompts. Put the three places into tabs and the mistakes into an accordion, since they are reference, not reading. Added a drawn example of a good catch-up answer."] },
          { title: "Meetings", body: ["Asked for: recap steps, a prepare-me prompt, a note on asking during a meeting, a branching scenario, and two questions.", "Kept the prompts and the scenario. Added that a meeting must be recorded or transcribed, which Copilot's draft assumed."] },
          { title: "Write", body: ["Asked for: email and document steps, four rewrites, six flashcards, and two questions.", "Kept all of it. Added the Word demo with real captures, and made the flashcards a recall exercise with the prompt on the back."] },
          { title: "Find", body: ["Asked for: five example questions, how it answers, a four-step process, and three questions including a fill in the blank.", "Kept it. Added the Copilot Chat demo and accepted more than one right word for the blank."] },
          { title: "Numbers", body: ["Asked for: a setup note, four tasks with prompts, good-and-bad-table tabs, three mistakes, and three questions.", "Kept it. Added the Excel demo with real captures and the instruction to format the range as a table."] },
          { title: "Present", body: ["Asked for: three steps from a document, four refinements, a five-part accordion, and two questions.", "Kept it. Added the PowerPoint demo. Renamed the last accordion item from a long title to \"Facts\"."] },
          { title: "Check before you trust it", body: ["Asked for: five habits, a Work IQ note, a do-not-paste list, a scenario, and three questions.", "Kept it. Made the habits a checklist. Added that this course itself was drafted on a personal account, so the Work IQ button did not apply."] },
          { title: "Put it together", body: ["Asked for: three cross-app activities of four steps each, a Friday scenario, and three questions.", "Kept the steps. Replaced the invented name \"Project Alpha\" with \"the project\" so it stays generic. Added a check step that opens the sources."] },
          { title: "Hand it off", body: ["Asked for: a five-step relay around one job, three backwards moves, five flashcards of unusual moves, a scenario, a matching exercise, and two questions.", "Kept the relay, the moves, the flashcards, and the scenario nearly word for word. Turned the matching list into a sorting block. Added the real demo, and the note that the handoffs in it were done by pasting, since file references need a work account. Copilot also drew its own flashcard and quiz widgets inside the answer; this page uses its own blocks instead."] },
          { title: "Final quiz", body: ["Asked for: ten questions covering all nine task lessons, seven multiple choice, two multiple response, one fill in the blank.", "Added an eleventh question from the Hand it off lesson, which Copilot drafted in that lesson's run. Kept the questions. Rewrote a few options that were too easy to rule out, and wrote feedback for every option, not only the right one."] }
        ] },
        { type: "list", heading: "Design decisions, and the evidence behind them", items: [
          "**Text before interaction.** Every lesson explains first, then asks. An interaction only works once the learner knows enough to make a real choice.",
          "**Every interaction has a job.** Accordions hold optional reference, so required content never hides. Tabs hold a few parallel categories. Flashcards and knowledge checks are recall practice, because testing yourself beats rereading after a week. Scenarios show consequences instead of saying \"try again\".",
          "**Practice is spread through the course,** not saved for the end. Each lesson closes with a check, then its prompts, and the quiz covers all eleven lessons again.",
          "**Feedback explains why,** for right and wrong answers alike. That is what makes a check a lesson rather than a test.",
          "**Everything is editable in one file.** Every lesson, question, and prompt lives in content.js. Changing a question is changing a few lines of text.",
          "**Real captures where they matter, drawings where they do not.** Every teaching lesson, and the quiz, carries the real Copilot Chat run that drafted it, one tap away. The Word, Excel, and PowerPoint demos, and the relay in Hand it off, are real captures. The chat panels in the text are drawings, and are labeled as such."
        ] },
        { type: "text", heading: "Take the prompts with you", body: ["The prompt library at prompts.html holds every prompt in this course with a Copy button and a filter by app. The desk card at cheat-sheet.html is ten everyday prompts, grouped by app on two printable pages. Both links are below.", "The course page, the library, and the desk card are hand-built HTML. No course tool was used."] },
        { type: "links", items: [ { href: "prompts.html", label: "Open the prompt library" }, { href: "cheat-sheet.html", label: "Open the desk card" } ] }
      ] }
  ]
};
