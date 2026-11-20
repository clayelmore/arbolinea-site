// Friday practice: every word the page shows that is content. Classic script, read by friday-app.js.
// The weeks keep the wording of .ultron/copilot-course/friday-practice-draft.md (prompt, reveal, clue, writing).
// Options and their feedback lines were written for this page.
window.FRIDAY = {
  weeks: [
    {
      id: "w1", n: 1, kind: "Spot the flaw", title: "Spot the flaw", level: "Easy",
      parts: [{ label: "The answer to check", text: "Meeting summary: The team agreed to move the launch from March 14 to March 7, giving everyone one more week to finish testing." }],
      ask: "Find the mistake.",
      options: [
        { text: "The team did not agree to anything.", feedback: "Nothing in the summary points to that. The flaw is inside the sentence itself." },
        { text: "March 14 to March 7 is two weeks, not one.", feedback: "It is seven days, so one week is right. The direction is what is wrong." },
        { text: "Moving the launch earlier gives less time, not more.", correct: true, feedback: "Right. March 7 comes a week before March 14, so there is less time for testing." },
        { text: "Nothing. The summary is right.", feedback: "Read the reason again. Does an earlier date give more time to test?" }
      ],
      reveal: "Moving from March 14 to March 7 gives one week less, not one more.",
      clueLabel: "The clue",
      clue: "When a summary gives a reason, check the reason against the facts in the same sentence.",
      write: "Introduce yourself to a new teammate. What would you want them to know about working with you?"
    },
    {
      id: "w2", n: 2, kind: "What's missing", title: "What's missing", level: "Easy",
      parts: [{ label: "The request", text: "Copilot, write an email telling the team the meeting moved." }],
      ask: "What does Copilot need that it does not have?",
      options: [
        { text: "A friendlier tone.", feedback: "Copilot can handle tone on its own. It cannot know facts you did not give it." },
        { text: "Which meeting, and the new day and time.", correct: true, feedback: "Right. Only you know those, so Copilot would have to guess." },
        { text: "The name of everyone on the team.", feedback: "Handy if Copilot sends it for you, but the email is no use without the new time." },
        { text: "A subject line.", feedback: "Copilot will write one. It will not know when the meeting is." }
      ],
      reveal: "The new day and time, and which meeting. Only you know them.",
      clueLabel: "The clue",
      clue: "If a fact lives only in your head, Copilot will either guess it or leave a blank. Both cost you a fix later.",
      write: "Explain what you do all day to someone outside your field."
    },
    {
      id: "w3", n: 3, kind: "Which sounds like a person?", title: "Which sounds like a person?", level: "Medium",
      parts: [
        { id: "a", label: "A", text: "I wanted to take a moment to express my sincere gratitude for your invaluable contributions to the project. Your dedication and attention to detail truly made a difference." },
        { id: "b", label: "B", text: "Thanks for staying late Tuesday to fix the pricing table. I would have sent the client the wrong numbers without you. Coffee is on me Friday." }
      ],
      ask: "Which one sounds like a person, and how can you tell?",
      options: [
        { text: "A", feedback: "A is polite, but no day, no task, and nothing that happened. Big praise with nothing behind it." },
        { text: "B", correct: true, feedback: "Right. B says what the person did, when, and what it saved." },
        { text: "Both sound the same", feedback: "Both say thanks, but only B says what for. That is the difference you hear." }
      ],
      reveal: "B.",
      clueLabel: "The clues",
      clue: "B names a day, a task, and what would have gone wrong. A uses big praise words with nothing specific behind them. Specifics are what make thanks feel real.",
      write: "Walk through a decision you made this week and why you made it."
    },
    {
      id: "w4", n: 4, kind: "Logic", title: "Logic", level: "Easy", tuneUp: true,
      parts: [{ label: "The puzzle", text: "Ana, Ben, and Cy each brought one thing to the team lunch: salad, bread, or dessert. Ana did not bring dessert. Ben brought the bread." }],
      ask: "What did Cy bring?",
      options: [
        { text: "Salad", feedback: "Ana has to have the salad: Ben has the bread, and Ana did not bring dessert." },
        { text: "Bread", feedback: "Ben brought the bread, so Cy could not have." },
        { text: "Dessert", correct: true, feedback: "Right. Ben has the bread, Ana has the salad, so Cy has dessert." }
      ],
      reveal: "Dessert. Ben has the bread, so Ana, who did not bring dessert, brought the salad. That leaves dessert for Cy.",
      clueLabel: "The clue",
      clue: "Start with the one fact that is certain, and the rest falls into place.",
      write: "Give someone news they will not like. Real or made up.",
      tuneUpNote: "Last Friday of the month. After you write, run the tune-up prompt with this month's pieces."
    },
    {
      id: "w5", n: 5, kind: "Guess first", title: "Guess first", level: "Medium", guessFirst: true,
      parts: [{ label: "The question", text: "A team of 8 meets for 30 minutes every workday. Before you work it out, guess: about how many hours of people's time is that each week? Write your guess down." }],
      ask: "Now pick the answer closest to the real number.",
      options: [
        { text: "About 2 hours", feedback: "Too low. One meeting already takes 4 hours of people's time." },
        { text: "About 4 hours", feedback: "That is one day. The question asks about the whole week." },
        { text: "About 20 hours", correct: true, feedback: "Right. 4 hours a day, five days a week." },
        { text: "About 200 hours", feedback: "Too high by about ten times. Eight people do not have 200 hours in a week." }
      ],
      check: { people: 8, minutes: 30, days: 5, hours: 20 },
      reveal: "20 hours. 8 people times 30 minutes is 4 hours a day, times 5 days.",
      clueLabel: "The clue",
      clue: "A guess first gives you a sense of size. If Copilot ever told you 2 hours or 200, you would know right away that something was off.",
      write: "Thank someone for something specific they did."
    },
    {
      id: "w6", n: 6, kind: "Spot the flaw", title: "Spot the flaw", level: "Tricky",
      parts: [{ label: "The answer to check", text: "Sales by region: North $42,000, South $38,000, West $51,000, for a total of $131,000. West led the regions, and South came in second." }],
      ask: "Find the mistake.",
      options: [
        { text: "The total is wrong.", feedback: "42,000 plus 38,000 plus 51,000 is 131,000. The total is right." },
        { text: "West did not lead.", feedback: "West has the most, at $51,000, so that part is right." },
        { text: "The ranking is wrong.", correct: true, feedback: "Right. North is second at $42,000. South is last." },
        { text: "A region is missing.", feedback: "The summary lists three regions and adds all three. Nothing points to a fourth." }
      ],
      check: { sales: { North: 42000, South: 38000, West: 51000 } },
      reveal: "North came in second, not South. South was last.",
      clueLabel: "The clue",
      clue: "The total is right, and that makes the rest easy to trust. When a summary ranks things, check the ranking too, not only the math.",
      write: "Talk someone out of a bad idea, kindly."
    },
    {
      id: "w7", n: 7, kind: "What's missing", title: "What's missing", level: "Easy",
      parts: [{ label: "The request", text: "Copilot, make a budget for the team lunch." }],
      ask: "What does Copilot need that it does not have?",
      options: [
        { text: "How many people are coming, and how much you can spend.", correct: true, feedback: "Right. Without those two numbers Copilot makes them up." },
        { text: "A list of places to eat nearby.", feedback: "Useful later. A budget starts with the headcount and the limit." },
        { text: "The date of the lunch.", feedback: "The date matters for booking, less for the budget." },
        { text: "A format, like a table.", feedback: "Copilot will pick a format. It will have to guess the numbers." }
      ],
      reveal: "How many people are coming, and how much you can spend.",
      clueLabel: "The clue",
      clue: "Numbers you know but did not say are the first thing Copilot will make up.",
      write: "Teach a task you know well, step by step."
    },
    {
      id: "w8", n: 8, kind: "Which sounds like a person?", title: "Which sounds like a person?", level: "Easy", tuneUp: true,
      parts: [
        { id: "a", label: "A", text: "I hope this message finds you well. I am writing to provide an update regarding the current status of the project." },
        { id: "b", label: "B", text: "Good news: we finished testing, two days early." }
      ],
      ask: "Which one sounds like a person, and how can you tell?",
      options: [
        { text: "A", feedback: "A takes two sentences and still has not said what happened." },
        { text: "B", correct: true, feedback: "Right. B gives the news in the first three words." },
        { text: "Both sound the same", feedback: "Only one of them tells you anything. Look for the news in A." }
      ],
      reveal: "B.",
      clueLabel: "The clue",
      clue: "B starts with the point. A spends two sentences saying it is about to say something.",
      write: "Tell a short story about something that went wrong and what you took from it.",
      tuneUpNote: "Last Friday of the month. After you write, run the tune-up prompt with this month's pieces."
    },
    {
      id: "w9", n: 9, kind: "Logic", title: "Logic", level: "Tricky",
      parts: [{
        label: "The puzzle",
        text: "Four meetings need the one conference room on Monday, at 9:00, 10:00, 11:00, and 1:00. They are a client call, a training session, a hiring meeting, and a budget review.",
        list: [
          "The client call is not first and not last.",
          "Training is right before the client call.",
          "The hiring meeting is in the morning, but not at 9:00."
        ]
      }],
      ask: "Which meeting is at each time?",
      options: [
        { text: "9:00 hiring, 10:00 training, 11:00 client call, 1:00 budget review.", order: ["hiring", "training", "client", "budget"], feedback: "Hiring cannot be at 9:00." },
        { text: "9:00 training, 10:00 client call, 11:00 hiring, 1:00 budget review.", order: ["training", "client", "hiring", "budget"], correct: true, feedback: "Right. Every rule holds, and no other order works." },
        { text: "9:00 budget review, 10:00 training, 11:00 client call, 1:00 hiring.", order: ["budget", "training", "client", "hiring"], feedback: "Hiring has to be in the morning, and 1:00 is not." },
        { text: "9:00 training, 10:00 client call, 11:00 budget review, 1:00 hiring.", order: ["training", "client", "budget", "hiring"], feedback: "Close. Hiring has to be in the morning, so it cannot be at 1:00." }
      ],
      check: { slots: ["9:00", "10:00", "11:00", "1:00"], meetings: { training: "training", client: "client call", hiring: "hiring", budget: "budget review" } },
      reveal: "9:00 training, 10:00 client call, 11:00 hiring, 1:00 budget review.",
      clueLabel: "The clue",
      clue: "Start with the rule that leaves the fewest choices. The client call can only be at 10:00 or 11:00. Try 11:00 and training lands at 10:00, which leaves no morning slot for hiring except 9:00, and that is not allowed. So the client call is at 10:00, and the rest follows.",
      write: "Make the case for something you want: a tool, a change, more time."
    },
    {
      id: "w10", n: 10, kind: "Guess first", title: "Guess first", level: "Easy", guessFirst: true,
      parts: [{ label: "The question", text: "A report says a two-page memo, about 1,000 words, takes 45 minutes to read. Guess first: does that sound right?" }],
      ask: "Now pick the answer closest to your guess.",
      options: [
        { text: "Yes, that sounds about right.", feedback: "45 minutes is a long time for two pages. Think about how long a page takes you." },
        { text: "No, it is far too long.", correct: true, feedback: "Right. Two pages take a few minutes, not most of an hour." },
        { text: "No, it is too short.", feedback: "Two pages in 45 minutes would be very slow reading, so it is not too short." }
      ],
      reveal: "No. Most people read 1,000 words in about 4 or 5 minutes. 45 minutes is off by about ten times.",
      clueLabel: "The clue",
      clue: "You do not need the exact number to catch a wrong one. A rough sense of size is enough.",
      write: "Describe something you think is well made, at work or anywhere, and say what makes it good."
    },
    {
      id: "w11", n: 11, kind: "Spot the flaw", title: "Spot the flaw", level: "Tricky",
      parts: [
        { label: "Your notes", text: "Dana will approve the contract Friday, after legal reviews it. Start date is the 15th. First invoice goes out at the end of the month.", plain: true },
        { label: "The draft to check", text: "Hi Dana, Thanks for approving the contract on Monday. As we discussed, the team will start on the 15th, and the first invoice will go out at the end of the month. Let me know if anything changes." }
      ],
      ask: "Find the mistake.",
      options: [
        { text: "The start date is wrong.", feedback: "Your notes say the 15th, and so does the draft." },
        { text: "The invoice timing is wrong.", feedback: "End of the month in both places. That part matches." },
        { text: "It thanks Dana for something she has not done.", correct: true, feedback: "Right. Dana has not approved anything yet. That is planned for Friday." },
        { text: "It is too short.", feedback: "Short is fine for a note like this. Check each fact against your notes." }
      ],
      reveal: "Dana has not approved it. The approval is expected Friday, after legal review. Sending this could read as pressure, or as a record that she approved something she has not.",
      clueLabel: "The clue",
      clue: "Check every claim about what someone did against what actually happened. Thank-you lines are the easiest to skim past.",
      write: "Say no to a request and keep the relationship."
    },
    {
      id: "w12", n: 12, kind: "What's missing", title: "What's missing", level: "Medium", tuneUp: true,
      parts: [{ label: "The request", text: "Copilot, summarize the feedback and tell me what to do next." }],
      ask: "What does Copilot need that it does not have? There are two things.",
      options: [
        { text: "The length and the tone.", feedback: "Copilot can pick a length and a tone. It cannot guess which feedback you mean." },
        { text: "The source and a deadline.", feedback: "The source, yes. A deadline helps less than knowing what decision this is for." },
        { text: "The source and the goal.", correct: true, feedback: "Right. Which feedback to read, and what decision it is for." },
        { text: "The goal and a format.", feedback: "The goal, yes. Copilot also needs to know which feedback to read." }
      ],
      reveal: "The source (which feedback: the survey file, the email thread, the Teams chat) and the goal (what decision this is for).",
      clueLabel: "The clue",
      clue: "Remember Ask well: goal, context, source, expectations. This request is missing the source and the goal, so Copilot has to guess both.",
      write: "Write to someone starting your job. What do you wish you had known?",
      tuneUpNote: "Last Friday of the month. After you write, run the tune-up prompt. Then start again at week 1, and put your two week 1 pieces side by side."
    }
  ],

  badges: [
    { id: "first", name: "First Friday", how: "Finish your first week." },
    { id: "three", name: "Three in a row", how: "Finish three weeks in a row." },
    { id: "sharp", name: "Sharp eye", how: "Get a Tricky warm-up right." },
    { id: "halfway", name: "Halfway", how: "Finish 6 different weeks." },
    { id: "twelve", name: "Twelve weeks", how: "Finish all 12 weeks." },
    { id: "circle", name: "Full circle", how: "Finish week 1 a second time." },
    { id: "tuneup", name: "Tune-up", how: "Run a monthly tune-up on week 4, 8, or 12." },
    { id: "thousand", name: "A thousand words", how: "Write 1,000 words in all." }
  ],

  rules: [
    "Set the timer for 10 minutes. No Copilot, no AI of any kind.",
    "Do not worry about getting it right. Write the way you would say it. Typos are fine.",
    "When you finish, add one line: what you like about what you wrote.",
    "Press Save. Your writing stays in this browser, and Download my writing gives you one file to keep."
  ],

  tuneUpPrompt: "Here is what I wrote this month without AI, and here is my voice list. What has changed or is missing? Suggest updates to the list, and quote the lines from my writing that show each one.",

  text: {
    title: "Friday practice",
    eyebrow: "Copilot at Work, once a week",
    intro: "Each Friday: a 2-minute warm-up, then 10 minutes of writing with no AI. About 12 minutes.",
    privacy: "Your answers and your writing stay in this browser. Nothing is sent anywhere.",
    honesty: "Every example here was written for this exercise. They are not real Copilot screens.",
    warmup: "Warm-up, 2 minutes",
    guessPrompt: "Make your guess before you see the choices.",
    guessButton: "I have my guess",
    check: "Check my answer",
    pickFirst: "Pick an answer first.",
    right: "Right",
    notQuite: "Not quite",
    tricky: "That was a tricky one.",
    reveal: "The answer",
    writing: "Writing, 10 minutes",
    rulesHead: "The rules",
    timerStart: "Start the 10-minute timer",
    timerReset: "Reset the timer",
    timerStarted: "Timer started. 10 minutes.",
    timerOneMinute: "One minute left.",
    timerDone: "Ten minutes are up. Finish your thought, or keep going. The box stays open.",
    boxLabel: "Your writing",
    likeLabel: "What do you like about what you wrote?",
    save: "Save my writing",
    needWords: "Write at least one word before you save.",
    needAnswer: "Answer the warm-up first, then save.",
    draftSaved: "Draft kept in this browser.",
    saved: "Saved. This week is done.",
    doneThisWeek: "Done for this week. See you Friday.",
    doAnother: "Do another",
    streak: "Weeks in a row",
    streakNote: "Any day of the week counts. Miss a week and it starts again from zero.",
    best: "Best",
    badgesHead: "Badges",
    newBadge: "New badge",
    yourWriting: "Your writing",
    noWriting: "Nothing saved yet. Your pieces show up here, newest first.",
    download: "Download my writing",
    reminder: "Add a Friday reminder",
    reminderTitle: "Write something (no AI)",
    reminderDescription: "Ten minutes of writing with no AI. Open the page:",
    print: "Print all twelve weeks",
    startOver: "Start over",
    startOverWarn: "This deletes every answer, badge, and piece of writing in this browser. Download your writing first if you want to keep it.",
    startOverYes: "Delete everything",
    startOverNo: "Keep my work",
    cleared: "Everything was deleted. Week 1 is ready.",
    tuneUpHead: "Tune-up",
    tuneUpIntro: "Copy this into Copilot or any AI tool, with your voice list. It holds the prompt and your last four pieces.",
    tuneUpCopy: "Copy prompt with my writing",
    tuneUpCopied: "Copied. Paste it into Copilot with your voice list.",
    tuneUpCopyFailed: "Could not copy here. Select the text in the box and copy it.",
    tuneUpListNote: "My voice list: (paste it here, or attach the file)",
    pickWeek: "Open a week",
    backupNote: "Saved data in this browser could not be read, so the page started fresh. The old data is kept under a backup key.",
    printAnswers: "Answers"
  }
};
