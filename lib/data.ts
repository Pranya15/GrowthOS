import {
  DomainBlueprint,
  DomainKey,
  MentorReply,
  ProgressSnapshot,
  ResourceItem,
  ScheduleItem,
  WeeklyPlanTemplate,
  WeeklyResourceLink
} from "@/lib/types";

function resource(title: string, type: ResourceItem["type"], link: string, price: ResourceItem["price"] = "Free"): ResourceItem {
  return { title, type, link, price };
}

function link(title: string, platform: string, kind: WeeklyResourceLink["kind"], href: string): WeeklyResourceLink {
  return { title, platform, kind, link: href };
}

function weeklyPlanTemplate(weeks: Array<{
  title: string;
  objective: string;
  notes: string[];
  project: string;
  links: WeeklyResourceLink[];
}>): WeeklyPlanTemplate[] {
  return weeks.map((week, index) => ({
    week: index + 1,
    ...week
  }));
}

export const domainBlueprints: DomainBlueprint[] = [
  {
    key: "engineering",
    label: "Software Engineering",
    tagline: "Go from fundamentals to shipping production-ready systems.",
    roadmap: [
      { title: "Foundations", duration: "Weeks 1-4", outcomes: ["Programming basics", "DSA habits", "Git and CLI setup"] },
      { title: "Build Real Apps", duration: "Weeks 5-10", outcomes: ["Frontend or backend specialization", "API building", "Deployments"] },
      { title: "Career Layer", duration: "Weeks 11-16", outcomes: ["System design basics", "Portfolio projects", "Interview prep"] }
    ],
    resources: [
      resource("CS50", "Course", "https://cs50.harvard.edu/"),
      resource("GeeksforGeeks DSA", "Practice", "https://www.geeksforgeeks.org/dsa-tutorial-learn-data-structures-and-algorithms/"),
      resource("NeetCode", "Practice", "https://neetcode.io/"),
      resource("Traversy Media", "YouTube", "https://www.youtube.com/@TraversyMedia"),
      resource("System Design Primer", "PDF", "https://github.com/donnemartin/system-design-primer")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Programming and problem-solving base",
        objective: "Build comfort with one language, arrays, strings, loops, and debugging.",
        notes: ["Choose one primary language for roadmap work.", "Write notes in your own words after each concept block.", "Solve at least 10 basic logic problems."],
        project: "Build a CLI calculator or task tracker with clean input handling.",
        links: [
          link("GeeksforGeeks DSA Tutorial", "GeeksforGeeks", "Practice", "https://www.geeksforgeeks.org/dsa-tutorial-learn-data-structures-and-algorithms/"),
          link("CS50 Intro Lectures", "Harvard CS50", "Video", "https://cs50.harvard.edu/x/2026/"),
          link("freeCodeCamp DSA for Beginners", "YouTube", "Video", "https://www.youtube.com/results?search_query=freecodecamp+dsa+for+beginners")
        ]
      },
      {
        title: "Core DSA practice",
        objective: "Cover arrays, hashing, recursion, linked lists, stacks, and queues.",
        notes: ["Track time complexity for every solution.", "Revise patterns, not just answers.", "Maintain an error notebook for repeated mistakes."],
        project: "Create a mini pattern sheet with solved examples for 20 problems.",
        links: [
          link("NeetCode Roadmap", "NeetCode", "Practice", "https://neetcode.io/roadmap"),
          link("Abdul Bari DSA Playlist", "YouTube", "Video", "https://www.youtube.com/results?search_query=abdul+bari+dsa+playlist"),
          link("GeeksforGeeks Arrays and Strings", "GeeksforGeeks", "Notes", "https://www.geeksforgeeks.org/array-data-structure-guide/")
        ]
      },
      {
        title: "Application build sprint",
        objective: "Connect learning to frontend, backend, APIs, and deployment flow.",
        notes: ["Spend at least one block reading code from a real project.", "Pair each concept session with a build session.", "Publish work weekly."],
        project: "Build and deploy a CRUD app with auth or dashboard features.",
        links: [
          link("Traversy Media Crash Courses", "YouTube", "Video", "https://www.youtube.com/@TraversyMedia"),
          link("Roadmap.sh Backend", "roadmap.sh", "Reference", "https://roadmap.sh/backend"),
          link("Frontend Mentor", "Frontend Mentor", "Project", "https://www.frontendmentor.io/")
        ]
      },
      {
        title: "Interview and system design layer",
        objective: "Prepare for job-ready output with projects, revision, and design basics.",
        notes: ["Refine resume bullets from your actual projects.", "Write design notes for scale, caching, and APIs.", "Use timed mock practice twice this week."],
        project: "Publish one polished portfolio case study and one interview-ready project walkthrough.",
        links: [
          link("System Design Primer", "GitHub", "Reference", "https://github.com/donnemartin/system-design-primer"),
          link("Tech Dummies System Design", "YouTube", "Video", "https://www.youtube.com/results?search_query=tech+dummies+system+design"),
          link("LeetCode Top Interview Questions", "LeetCode", "Practice", "https://leetcode.com/problem-list/top-interview-questions/")
        ]
      }
    ]),
    portfolioIdeas: ["SaaS dashboard", "AI project assistant", "Interview tracker"],
    careerTracks: ["Frontend developer", "Backend engineer", "Full-stack engineer", "DevOps engineer"]
  },
  {
    key: "chartered-accountancy",
    label: "Chartered Accountancy (CA)",
    tagline: "Structure CA prep around concepts, revision loops, and exam discipline.",
    roadmap: [
      { title: "Concept Foundation", duration: "Weeks 1-4", outcomes: ["Accounts basics", "Law reading rhythm", "Tax fundamentals"] },
      { title: "Problem Solving", duration: "Weeks 5-10", outcomes: ["Question-bank solving", "Working notes", "Amendment tracking"] },
      { title: "Exam Readiness", duration: "Weeks 11-16", outcomes: ["RTP/MTP practice", "Revision charts", "Mock papers"] }
    ],
    resources: [
      resource("ICAI BOS", "Notes", "https://www.icai.org/post/study-material-nset"),
      resource("CA Wallah", "YouTube", "https://www.youtube.com/results?search_query=ca+wallah+classes"),
      resource("ICAI Mock Test Papers", "PDF", "https://resource.cdn.icai.org/"),
      resource("SuperProfs CA", "Course", "https://www.superprofs.com/ca/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Accounts and law setup",
        objective: "Stabilize daily reading plus working-note habits.",
        notes: ["Use short law summaries after each chapter.", "Redo accounting formats without looking at solutions.", "Tag weak chapters for Sunday revision."],
        project: "Prepare a chapter-wise formula and section notebook.",
        links: [
          link("ICAI Study Material", "ICAI", "Notes", "https://www.icai.org/post/study-material-nset"),
          link("CA Foundation Accounts", "YouTube", "Video", "https://www.youtube.com/results?search_query=ca+foundation+accounts+playlist"),
          link("ICAI BOS Knowledge Portal", "ICAI", "Reference", "https://boslive.icai.org/")
        ]
      },
      {
        title: "Tax and practical problems",
        objective: "Build numerical speed and amendment awareness.",
        notes: ["Write amendments separately from base concepts.", "Time yourself on practical questions.", "Review working notes for presentation quality."],
        project: "Complete one timed mixed-topic practice set.",
        links: [
          link("CA Taxation Playlist", "YouTube", "Video", "https://www.youtube.com/results?search_query=ca+taxation+playlist"),
          link("ICAI RTP", "ICAI", "Practice", "https://www.icai.org/post/revisionary-test-papers"),
          link("CA Wallah Revision Sessions", "YouTube", "Video", "https://www.youtube.com/results?search_query=ca+wallah+revision")
        ]
      },
      {
        title: "Revision system",
        objective: "Convert the syllabus into quick-recall sheets and mock rhythm.",
        notes: ["Keep one-page chapter summaries.", "Use mistake logs after each mock.", "Revise difficult sections within 48 hours."],
        project: "Build a final revision dashboard for all subjects.",
        links: [
          link("ICAI Mock Test Papers", "ICAI", "Practice", "https://www.icai.org/post/mock-test-papers"),
          link("CA Exam Strategy Videos", "YouTube", "Video", "https://www.youtube.com/results?search_query=ca+exam+strategy"),
          link("ICAI Announcements", "ICAI", "Reference", "https://www.icai.org/")
        ]
      }
    ]),
    portfolioIdeas: ["Revision dashboard", "Subject formula book", "Mock analysis sheet"],
    careerTracks: ["CA student", "Audit associate", "Tax consultant", "Finance controller"]
  },
  {
    key: "company-secretary",
    label: "Company Secretary (CS)",
    tagline: "Prepare with legal reading systems, writing precision, and revision recall.",
    roadmap: [
      { title: "Law Foundations", duration: "Weeks 1-4", outcomes: ["Company law basics", "Terminology recall", "Bare act reading"] },
      { title: "Applied Writing", duration: "Weeks 5-9", outcomes: ["Answer framing", "Case analysis", "Secretarial standards"] },
      { title: "Exam Execution", duration: "Weeks 10-14", outcomes: ["Mock answers", "Revision maps", "Recent amendments"] }
    ],
    resources: [
      resource("ICSI Study Material", "Notes", "https://www.icsi.edu/student/studymaterial/"),
      resource("CS Executive Classes", "YouTube", "https://www.youtube.com/results?search_query=cs+executive+classes"),
      resource("ICSI Training Portal", "Notes", "https://www.icsi.edu/"),
      resource("LawSikho Corporate Law", "Course", "https://lawsikho.com/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Core legal language",
        objective: "Make long legal chapters readable and memorable.",
        notes: ["Read one section, then rewrite it in plain English.", "Use flashcards for definitions and sections.", "Practice answer introductions and conclusions."],
        project: "Create a section-summary handbook for the first module.",
        links: [
          link("ICSI Study Material", "ICSI", "Notes", "https://www.icsi.edu/student/studymaterial/"),
          link("CS Foundation Law Playlist", "YouTube", "Video", "https://www.youtube.com/results?search_query=cs+foundation+law+playlist"),
          link("Bare Act Search", "Indian Kanoon", "Reference", "https://indiankanoon.org/")
        ]
      },
      {
        title: "Answer writing and case application",
        objective: "Improve structured legal answers with section support.",
        notes: ["Quote section ideas precisely, not vaguely.", "Time answers to match exam constraints.", "Review one model answer daily."],
        project: "Write 5 case-based answers and self-review structure quality.",
        links: [
          link("CS Executive Answer Writing", "YouTube", "Video", "https://www.youtube.com/results?search_query=cs+executive+answer+writing"),
          link("ICSI Suggested Answers", "ICSI", "Practice", "https://www.icsi.edu/student/"),
          link("Secretarial Standards", "ICSI", "Notes", "https://www.icsi.edu/home/secretarialstandards/")
        ]
      }
    ]),
    portfolioIdeas: ["Section summary handbook", "Answer writing tracker", "Revision charts"],
    careerTracks: ["Company secretary", "Compliance analyst", "Corporate governance associate"]
  },
  {
    key: "ai-ml",
    label: "AI / Machine Learning",
    tagline: "Move from math and Python basics into models, evaluation, and deployment.",
    roadmap: [
      { title: "Math + Python Base", duration: "Weeks 1-4", outcomes: ["Python fluency", "Linear algebra basics", "Data handling"] },
      { title: "ML Core", duration: "Weeks 5-9", outcomes: ["Supervised learning", "Evaluation metrics", "Feature engineering"] },
      { title: "Projects and MLOps", duration: "Weeks 10-16", outcomes: ["End-to-end ML project", "Model deployment", "Portfolio case study"] }
    ],
    resources: [
      resource("Kaggle Learn", "Course", "https://www.kaggle.com/learn"),
      resource("Andrew Ng ML Specialization", "Course", "https://www.coursera.org/specializations/machine-learning-introduction"),
      resource("StatQuest", "YouTube", "https://www.youtube.com/@statquest"),
      resource("fast.ai", "Course", "https://course.fast.ai/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Python, NumPy, pandas, and math essentials",
        objective: "Prepare your base for reading and building ML code confidently.",
        notes: ["Practice arrays, matrices, and dataframe operations.", "Write why each metric matters, not just formulas.", "Recreate examples from scratch."],
        project: "Clean and analyze a dataset in a Jupyter notebook.",
        links: [
          link("Kaggle Intro to Machine Learning", "Kaggle", "Course", "https://www.kaggle.com/learn/intro-to-machine-learning"),
          link("StatQuest Linear Regression", "YouTube", "Video", "https://www.youtube.com/results?search_query=statquest+linear+regression"),
          link("NumPy Quickstart", "NumPy", "Reference", "https://numpy.org/doc/stable/user/quickstart.html")
        ]
      },
      {
        title: "Model training and evaluation",
        objective: "Learn regression, classification, cross-validation, and basic tuning.",
        notes: ["Compare metrics on the same dataset.", "Document overfitting signs.", "Keep one notebook per algorithm family."],
        project: "Build a classifier with evaluation report and confusion matrix.",
        links: [
          link("Andrew Ng ML Specialization", "Coursera", "Video", "https://www.coursera.org/specializations/machine-learning-introduction"),
          link("Scikit-learn User Guide", "scikit-learn", "Reference", "https://scikit-learn.org/stable/user_guide.html"),
          link("Kaggle Intermediate ML", "Kaggle", "Practice", "https://www.kaggle.com/learn/intermediate-machine-learning")
        ]
      },
      {
        title: "Deployment and portfolio proof",
        objective: "Turn notebooks into reusable projects and publish results.",
        notes: ["Explain your feature choices clearly.", "Package inference flow, not just training.", "Track model limitations in notes."],
        project: "Deploy an ML prediction app with a clean README and demo.",
        links: [
          link("fast.ai Course", "fast.ai", "Course", "https://course.fast.ai/"),
          link("MLOps Playlist", "YouTube", "Video", "https://www.youtube.com/results?search_query=mlops+playlist"),
          link("Hugging Face Course", "Hugging Face", "Reference", "https://huggingface.co/learn")
        ]
      }
    ]),
    portfolioIdeas: ["Churn prediction app", "Resume screening model", "Forecasting dashboard"],
    careerTracks: ["ML engineer", "Data scientist", "AI engineer", "MLOps associate"]
  },
  {
    key: "iot",
    label: "Internet of Things (IoT)",
    tagline: "Learn devices, sensors, networking, and cloud-connected systems.",
    roadmap: [
      { title: "Electronics Base", duration: "Weeks 1-3", outcomes: ["Sensors", "Microcontrollers", "Basic circuits"] },
      { title: "Connectivity", duration: "Weeks 4-8", outcomes: ["MQTT/HTTP", "Device communication", "Cloud dashboards"] },
      { title: "System Projects", duration: "Weeks 9-14", outcomes: ["Automation project", "Data logging", "Demo-ready prototype"] }
    ],
    resources: [
      resource("Arduino Tutorials", "Notes", "https://docs.arduino.cc/"),
      resource("Raspberry Pi Documentation", "Notes", "https://www.raspberrypi.com/documentation/"),
      resource("IoT Playlist", "YouTube", "https://www.youtube.com/results?search_query=iot+full+course"),
      resource("HiveMQ MQTT Essentials", "Notes", "https://www.hivemq.com/mqtt-essentials/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Board setup and sensor basics",
        objective: "Learn breadboarding, digital/analog reads, and simple output control.",
        notes: ["Document wiring carefully.", "Keep a sensor reading log.", "Understand pin mapping before coding."],
        project: "Build a sensor-based monitoring mini prototype.",
        links: [
          link("Arduino Docs", "Arduino", "Notes", "https://docs.arduino.cc/"),
          link("IoT Full Course", "YouTube", "Video", "https://www.youtube.com/results?search_query=iot+full+course"),
          link("Tinkercad Circuits", "Tinkercad", "Project", "https://www.tinkercad.com/circuits")
        ]
      },
      {
        title: "Device communication and dashboards",
        objective: "Connect devices to cloud endpoints and visualize data.",
        notes: ["Separate hardware and network bugs in notes.", "Test one protocol at a time.", "Log failed payloads."],
        project: "Create a live IoT dashboard with alerts.",
        links: [
          link("MQTT Essentials", "HiveMQ", "Reference", "https://www.hivemq.com/mqtt-essentials/"),
          link("Raspberry Pi Docs", "Raspberry Pi", "Notes", "https://www.raspberrypi.com/documentation/"),
          link("Node-RED Docs", "Node-RED", "Reference", "https://nodered.org/docs/")
        ]
      }
    ]),
    portfolioIdeas: ["Smart room monitor", "Attendance device", "IoT energy tracker"],
    careerTracks: ["IoT developer", "Embedded systems engineer", "Automation engineer"]
  },
  {
    key: "data-security",
    label: "Data Security",
    tagline: "Study data protection, governance, encryption, and secure handling systems.",
    roadmap: [
      { title: "Security Foundations", duration: "Weeks 1-3", outcomes: ["CIA triad", "Data lifecycle", "Threat basics"] },
      { title: "Protection Controls", duration: "Weeks 4-8", outcomes: ["Encryption", "Access control", "Backup strategy"] },
      { title: "Governance and Audits", duration: "Weeks 9-12", outcomes: ["Compliance basics", "Risk reviews", "Documentation"] }
    ],
    resources: [
      resource("OWASP", "Notes", "https://owasp.org/"),
      resource("IBM Data Security", "Course", "https://www.coursera.org/search?query=data%20security"),
      resource("Simply Cyber", "YouTube", "https://www.youtube.com/@SimplyCyber"),
      resource("NIST Cybersecurity Resources", "PDF", "https://www.nist.gov/cyberframework")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Data classification and threats",
        objective: "Understand what needs protection and why.",
        notes: ["Map public, internal, confidential, and restricted data.", "Write examples for each security control.", "Review threat scenarios with real cases."],
        project: "Create a data classification policy for a sample company.",
        links: [
          link("OWASP Top 10", "OWASP", "Notes", "https://owasp.org/www-project-top-ten/"),
          link("Simply Cyber Security Basics", "YouTube", "Video", "https://www.youtube.com/results?search_query=simply+cyber+security+basics"),
          link("NIST CSF", "NIST", "Reference", "https://www.nist.gov/cyberframework")
        ]
      },
      {
        title: "Encryption, access, and compliance",
        objective: "Learn secure storage, authorization, and governance checks.",
        notes: ["Keep examples for symmetric vs asymmetric encryption.", "Understand audit evidence types.", "Relate controls to business risk."],
        project: "Draft a secure data handling checklist for an app team.",
        links: [
          link("Google Cloud Security Foundations", "Google Cloud", "Course", "https://www.cloudskillsboost.google/paths/15"),
          link("Data Security Course Search", "Coursera", "Video", "https://www.coursera.org/search?query=data%20security"),
          link("OWASP Cheat Sheets", "OWASP", "Reference", "https://cheatsheetseries.owasp.org/")
        ]
      }
    ]),
    portfolioIdeas: ["Data security checklist", "Risk register", "Compliance review memo"],
    careerTracks: ["Data security analyst", "GRC analyst", "Security consultant"]
  },
  {
    key: "cyber-security",
    label: "Cyber Security",
    tagline: "Learn defensive security, attacks, labs, and incident response thinking.",
    roadmap: [
      { title: "Networking and Threats", duration: "Weeks 1-4", outcomes: ["TCP/IP basics", "Attack surfaces", "Linux and CLI basics"] },
      { title: "Defensive Skills", duration: "Weeks 5-9", outcomes: ["SIEM basics", "Vulnerability scanning", "Web security"] },
      { title: "Hands-on Labs", duration: "Weeks 10-16", outcomes: ["CTFs", "Incident response notes", "Portfolio reports"] }
    ],
    resources: [
      resource("TryHackMe", "Practice", "https://tryhackme.com/"),
      resource("Hack The Box Academy", "Practice", "https://academy.hackthebox.com/"),
      resource("OWASP", "Notes", "https://owasp.org/"),
      resource("John Hammond", "YouTube", "https://www.youtube.com/@_JohnHammond")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Networking, Linux, and recon base",
        objective: "Build the technical foundation before jumping into tools.",
        notes: ["Do not skip networking fundamentals.", "Write one-page notes for ports and protocols.", "Practice Linux commands daily."],
        project: "Document a basic home lab setup and command cheat sheet.",
        links: [
          link("TryHackMe Pre Security", "TryHackMe", "Practice", "https://tryhackme.com/path/outline/presecurity"),
          link("John Hammond Networking Basics", "YouTube", "Video", "https://www.youtube.com/results?search_query=john+hammond+networking+basics"),
          link("OverTheWire Bandit", "OverTheWire", "Practice", "https://overthewire.org/wargames/bandit/")
        ]
      },
      {
        title: "Web and defensive security",
        objective: "Understand vulnerabilities, alerts, and blue-team workflows.",
        notes: ["Relate each vulnerability to a fix.", "Save screenshots of lab findings.", "Keep incident notes concise and factual."],
        project: "Write a short vulnerability assessment report from a lab.",
        links: [
          link("OWASP Top 10", "OWASP", "Notes", "https://owasp.org/www-project-top-ten/"),
          link("TryHackMe OWASP Rooms", "TryHackMe", "Practice", "https://tryhackme.com/hacktivities"),
          link("Hack The Box Academy", "Hack The Box", "Practice", "https://academy.hackthebox.com/")
        ]
      }
    ]),
    portfolioIdeas: ["Home lab report", "Web vulnerability write-up", "Incident triage notes"],
    careerTracks: ["Security analyst", "SOC analyst", "Penetration tester", "Blue team associate"]
  },
  {
    key: "accounting",
    label: "Accounting",
    tagline: "Build accounting fundamentals, reporting accuracy, and software fluency.",
    roadmap: [
      { title: "Accounting Base", duration: "Weeks 1-3", outcomes: ["Journal entries", "Ledgers", "Trial balance"] },
      { title: "Reporting Flow", duration: "Weeks 4-7", outcomes: ["P&L", "Balance sheet", "Cash flow basics"] },
      { title: "Tools and Practice", duration: "Weeks 8-11", outcomes: ["Excel modeling", "Tally or ERP basics", "Reconciliation"] }
    ],
    resources: [
      resource("Accounting Stuff", "YouTube", "https://www.youtube.com/@AccountingStuff"),
      resource("Tally Education", "Notes", "https://tallysolutions.com/learning-hub/"),
      resource("CFI Accounting Basics", "Course", "https://corporatefinanceinstitute.com/resources/accounting/"),
      resource("Excel Practice", "Practice", "https://excelpracticeonline.com/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Journal entries and statements",
        objective: "Understand the accounting flow from transaction to reporting.",
        notes: ["Practice double-entry logic repeatedly.", "Write one rule example for each transaction type.", "Link every entry to a statement effect."],
        project: "Prepare books for a simple fictional business for one month.",
        links: [
          link("Accounting Stuff Basics", "YouTube", "Video", "https://www.youtube.com/results?search_query=accounting+stuff+basics"),
          link("CFI Accounting Resources", "CFI", "Notes", "https://corporatefinanceinstitute.com/resources/accounting/"),
          link("Excel Practice Online", "Excel Practice", "Practice", "https://excelpracticeonline.com/")
        ]
      },
      {
        title: "Excel and software workflow",
        objective: "Move from theory into spreadsheet and accounting software practice.",
        notes: ["Build templates for repeated calculations.", "Use reconciliation as a weekly habit.", "Document common formula patterns."],
        project: "Create an expense tracker and monthly reporting workbook.",
        links: [
          link("Tally Learning Hub", "Tally", "Reference", "https://tallysolutions.com/learning-hub/"),
          link("Excel Accounting Tutorials", "YouTube", "Video", "https://www.youtube.com/results?search_query=excel+for+accounting+tutorial"),
          link("CFI Financial Statements", "CFI", "Notes", "https://corporatefinanceinstitute.com/resources/accounting/three-financial-statements/")
        ]
      }
    ]),
    portfolioIdeas: ["Monthly close workbook", "Expense tracker", "Reconciliation template"],
    careerTracks: ["Accountant", "Accounts executive", "Financial analyst"]
  },
  {
    key: "data-science",
    label: "Data Science",
    tagline: "Combine analysis, statistics, visualization, and communication into project-ready work.",
    roadmap: [
      { title: "Data Analysis Base", duration: "Weeks 1-4", outcomes: ["Python data stack", "EDA", "Statistics basics"] },
      { title: "Modeling and Storytelling", duration: "Weeks 5-9", outcomes: ["Prediction tasks", "Dashboards", "Insight communication"] },
      { title: "Portfolio Case Studies", duration: "Weeks 10-14", outcomes: ["Business case framing", "Notebook polish", "Presentation artifacts"] }
    ],
    resources: [
      resource("Kaggle Learn", "Course", "https://www.kaggle.com/learn"),
      resource("StatQuest", "YouTube", "https://www.youtube.com/@statquest"),
      resource("Pandas Docs", "Notes", "https://pandas.pydata.org/docs/"),
      resource("Tableau Public", "Practice", "https://public.tableau.com/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "EDA and stats fundamentals",
        objective: "Develop the habit of exploring data before modeling it.",
        notes: ["Write questions before touching charts.", "Summarize findings in plain language.", "Track nulls, outliers, and assumptions."],
        project: "Publish an exploratory notebook with 5 business insights.",
        links: [
          link("Kaggle Data Visualization", "Kaggle", "Course", "https://www.kaggle.com/learn/data-visualization"),
          link("StatQuest Statistics", "YouTube", "Video", "https://www.youtube.com/results?search_query=statquest+statistics"),
          link("pandas Documentation", "pandas", "Reference", "https://pandas.pydata.org/docs/")
        ]
      },
      {
        title: "Dashboards and communication",
        objective: "Turn analysis into stakeholder-friendly outputs.",
        notes: ["Focus on decision-making, not chart volume.", "State recommendations clearly.", "Keep one-page summaries for each case study."],
        project: "Create a dashboard and presentation from a public dataset.",
        links: [
          link("Tableau Public", "Tableau", "Project", "https://public.tableau.com/"),
          link("Kaggle Intermediate ML", "Kaggle", "Practice", "https://www.kaggle.com/learn/intermediate-machine-learning"),
          link("Data Storytelling Videos", "YouTube", "Video", "https://www.youtube.com/results?search_query=data+storytelling+dashboard")
        ]
      }
    ]),
    portfolioIdeas: ["EDA notebook", "Business dashboard", "Forecasting case study"],
    careerTracks: ["Data analyst", "Data scientist", "BI analyst"]
  },
  {
    key: "cloud-computing",
    label: "Cloud Computing",
    tagline: "Understand cloud services, deployment, reliability, and infrastructure workflows.",
    roadmap: [
      { title: "Cloud Fundamentals", duration: "Weeks 1-3", outcomes: ["Core services", "Networking basics", "IAM basics"] },
      { title: "Deployment and Monitoring", duration: "Weeks 4-8", outcomes: ["Containers", "Deployments", "Observability"] },
      { title: "Architecture Practice", duration: "Weeks 9-13", outcomes: ["Scalable designs", "Cost awareness", "Portfolio labs"] }
    ],
    resources: [
      resource("AWS Skill Builder", "Course", "https://explore.skillbuilder.aws/learn"),
      resource("Google Cloud Skills Boost", "Course", "https://www.cloudskillsboost.google/"),
      resource("TechWorld with Nana", "YouTube", "https://www.youtube.com/@TechWorldwithNana"),
      resource("Microsoft Learn Azure", "Notes", "https://learn.microsoft.com/azure/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Cloud and IAM base",
        objective: "Understand compute, storage, networking, and identity.",
        notes: ["Map each service to a business need.", "Keep a glossary of cloud terms.", "Use free-tier labs deliberately."],
        project: "Deploy a static site or API using one cloud provider.",
        links: [
          link("AWS Cloud Essentials", "AWS", "Course", "https://explore.skillbuilder.aws/learn"),
          link("Azure Fundamentals", "Microsoft Learn", "Notes", "https://learn.microsoft.com/training/azure/"),
          link("Cloud Computing Basics", "YouTube", "Video", "https://www.youtube.com/results?search_query=cloud+computing+basics")
        ]
      },
      {
        title: "Containers and deployment flow",
        objective: "Ship apps with better environment control and observability.",
        notes: ["Understand logs before scaling topics.", "Practice deployment rollback steps.", "Track cost-impacting decisions."],
        project: "Containerize and deploy an app with basic monitoring.",
        links: [
          link("TechWorld with Nana Docker", "YouTube", "Video", "https://www.youtube.com/results?search_query=techworld+with+nana+docker"),
          link("Google Cloud Skills Boost", "Google Cloud", "Practice", "https://www.cloudskillsboost.google/"),
          link("Kubernetes Basics", "Kubernetes", "Reference", "https://kubernetes.io/docs/tutorials/kubernetes-basics/")
        ]
      }
    ]),
    portfolioIdeas: ["Cloud deployment lab", "Cost-optimized architecture note", "Monitoring setup guide"],
    careerTracks: ["Cloud engineer", "DevOps engineer", "Site reliability associate"]
  },
  {
    key: "video-editing",
    label: "Video Editing",
    tagline: "Learn cuts, pacing, storytelling, and client-ready delivery.",
    roadmap: [
      { title: "Editing Basics", duration: "Weeks 1-3", outcomes: ["Timeline workflow", "Cuts and transitions", "Audio cleanup"] },
      { title: "Story & Motion", duration: "Weeks 4-7", outcomes: ["Narrative pacing", "Motion graphics", "Color correction"] },
      { title: "Monetize Skills", duration: "Weeks 8-12", outcomes: ["Client briefs", "Portfolio reel", "Delivery workflow"] }
    ],
    resources: [
      resource("Premiere Pro Basics", "YouTube", "https://www.youtube.com/results?search_query=premiere+pro+basics"),
      resource("Motion Design School", "Course", "https://motiondesign.school/", "Paid"),
      resource("Mixkit Assets", "Practice", "https://mixkit.co/"),
      resource("Frame.io Workflow Guides", "Notes", "https://blog.frame.io/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Timeline confidence",
        objective: "Build speed with cuts, audio, and simple sequences.",
        notes: ["Practice keyboard shortcuts daily.", "Compare rough and polished timelines.", "Export and review mistakes."],
        project: "Edit a 60-second talking-head or montage video.",
        links: [
          link("Premiere Pro Basics", "YouTube", "Video", "https://www.youtube.com/results?search_query=premiere+pro+basics"),
          link("Mixkit", "Mixkit", "Project", "https://mixkit.co/"),
          link("Frame.io Editing Workflow", "Frame.io", "Notes", "https://blog.frame.io/")
        ]
      },
      {
        title: "Story and client-ready polish",
        objective: "Move beyond cuts into pacing, motion, and presentation.",
        notes: ["Edit for story beats, not only effects.", "Create reusable project templates.", "Collect before/after comparisons."],
        project: "Produce a short promo reel for a mock client.",
        links: [
          link("Motion Design School", "Motion Design School", "Course", "https://motiondesign.school/"),
          link("Color Grading Tutorials", "YouTube", "Video", "https://www.youtube.com/results?search_query=color+grading+tutorial"),
          link("Frame.io Client Review", "Frame.io", "Reference", "https://blog.frame.io/")
        ]
      }
    ]),
    portfolioIdeas: ["Short-form reel pack", "YouTube documentary edit", "Brand promo ad"],
    careerTracks: ["Freelance editor", "YouTube editor", "Agency video producer"]
  },
  {
    key: "government-exams",
    label: "Government Exams",
    tagline: "Prepare with topic sequencing, revision loops, and mock discipline.",
    roadmap: [
      { title: "Coverage Planning", duration: "Weeks 1-2", outcomes: ["Syllabus mapping", "Baseline mock", "Weak-area detection"] },
      { title: "Concept + Practice", duration: "Weeks 3-10", outcomes: ["Daily subject blocks", "PYQ solving", "Timed sections"] },
      { title: "Revision Engine", duration: "Weeks 11-16", outcomes: ["Mock analysis", "Error notebook", "Exam temperament"] }
    ],
    resources: [
      resource("Unacademy Channels", "YouTube", "https://www.youtube.com/results?search_query=government+exam+preparation"),
      resource("Testbook", "Practice", "https://testbook.com/", "Paid"),
      resource("Gradeup Notes", "Notes", "https://byjusexamprep.com/"),
      resource("Previous Year Papers", "PDF", "https://www.ssc.nic.in/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Syllabus map and core subjects",
        objective: "Break the exam into blocks and detect weak areas fast.",
        notes: ["Take an early mock even if your score is low.", "Separate static and dynamic topics.", "Use PYQs to guide depth."],
        project: "Prepare a chapter-priority matrix for your target exam.",
        links: [
          link("Government Exam Preparation", "YouTube", "Video", "https://www.youtube.com/results?search_query=government+exam+preparation"),
          link("Testbook", "Testbook", "Practice", "https://testbook.com/"),
          link("SSC Papers", "SSC", "Reference", "https://www.ssc.nic.in/")
        ]
      },
      {
        title: "Mocks and review engine",
        objective: "Strengthen speed, accuracy, and error correction.",
        notes: ["Review every wrong answer by cause.", "Track time loss by section.", "Revise weak topics inside 48 hours."],
        project: "Create a mock analysis sheet with error categories.",
        links: [
          link("ExamPrep Notes", "BYJU'S Exam Prep", "Notes", "https://byjusexamprep.com/"),
          link("Timed Mock Sessions", "YouTube", "Video", "https://www.youtube.com/results?search_query=government+exam+mock+strategy"),
          link("Testbook Mock Tests", "Testbook", "Practice", "https://testbook.com/")
        ]
      }
    ]),
    portfolioIdeas: ["Score improvement journal", "Revision tracker", "Mock error book"],
    careerTracks: ["SSC", "Banking", "UPSC", "State public service"]
  },
  {
    key: "teaching",
    label: "Teaching",
    tagline: "Design better lessons, classroom systems, and learning outcomes.",
    roadmap: [
      { title: "Instruction Basics", duration: "Weeks 1-3", outcomes: ["Lesson structure", "Outcome mapping", "Student engagement"] },
      { title: "Assessment Design", duration: "Weeks 4-6", outcomes: ["Rubrics", "Feedback loops", "Differentiated instruction"] },
      { title: "Professional Growth", duration: "Weeks 7-10", outcomes: ["Teaching portfolio", "Classroom systems", "Interview prep"] }
    ],
    resources: [
      resource("Crash Course", "YouTube", "https://www.youtube.com/@crashcourse"),
      resource("Coursera Teaching Courses", "Course", "https://www.coursera.org/"),
      resource("Edutopia", "Notes", "https://www.edutopia.org/"),
      resource("CommonLit", "Practice", "https://www.commonlit.org/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Lesson design and student engagement",
        objective: "Plan lessons with clear outcomes and better flow.",
        notes: ["Define evidence of learning before activities.", "Use one engagement technique each session.", "Reflect on pacing after delivery."],
        project: "Design and teach one model lesson with assessment.",
        links: [
          link("Crash Course", "YouTube", "Video", "https://www.youtube.com/@crashcourse"),
          link("Edutopia", "Edutopia", "Notes", "https://www.edutopia.org/"),
          link("CommonLit", "CommonLit", "Practice", "https://www.commonlit.org/")
        ]
      }
    ]),
    portfolioIdeas: ["Lesson plan bank", "Assessment kit", "Student progress dashboard"],
    careerTracks: ["School teacher", "Online educator", "Instructional designer"]
  },
  {
    key: "digital-marketing",
    label: "Digital Marketing",
    tagline: "Build campaign strategy, execution habits, and measurable growth.",
    roadmap: [
      { title: "Marketing Foundations", duration: "Weeks 1-3", outcomes: ["Audience research", "Messaging", "Funnel basics"] },
      { title: "Channels & Analytics", duration: "Weeks 4-8", outcomes: ["SEO", "Paid ads", "Email workflows", "Analytics"] },
      { title: "Portfolio & Clients", duration: "Weeks 9-12", outcomes: ["Case studies", "Campaign dashboards", "Client proposals"] }
    ],
    resources: [
      resource("Google Skillshop", "Course", "https://skillshop.withgoogle.com/"),
      resource("Ahrefs Blog", "Notes", "https://ahrefs.com/blog/"),
      resource("HubSpot Academy", "Course", "https://academy.hubspot.com/"),
      resource("Surfside PPC", "YouTube", "https://www.youtube.com/@Surfsideppc")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Audience, funnel, and SEO base",
        objective: "Understand positioning before ad spend or tooling.",
        notes: ["Use real audience language from research.", "Map every content piece to a funnel stage.", "Track one SEO improvement each week."],
        project: "Prepare a one-page campaign strategy for a sample brand.",
        links: [
          link("Google Skillshop", "Google", "Course", "https://skillshop.withgoogle.com/"),
          link("Ahrefs Blog", "Ahrefs", "Notes", "https://ahrefs.com/blog/"),
          link("Surfside PPC", "YouTube", "Video", "https://www.youtube.com/@Surfsideppc")
        ]
      }
    ]),
    portfolioIdeas: ["SEO audit", "Paid ads funnel", "Email nurture sequence"],
    careerTracks: ["Performance marketer", "SEO specialist", "Growth marketer"]
  },
  {
    key: "design",
    label: "Design",
    tagline: "Grow from visual fundamentals to portfolio-ready product work.",
    roadmap: [
      { title: "Visual Language", duration: "Weeks 1-3", outcomes: ["Typography", "Spacing", "Color systems"] },
      { title: "UX & Product Thinking", duration: "Weeks 4-7", outcomes: ["User flows", "Wireframes", "Prototyping"] },
      { title: "Portfolio Layer", duration: "Weeks 8-12", outcomes: ["Case studies", "Design critique loops", "Portfolio site"] }
    ],
    resources: [
      resource("Figma YouTube", "YouTube", "https://www.youtube.com/@Figma"),
      resource("Refactoring UI", "PDF", "https://www.refactoringui.com/", "Paid"),
      resource("Laws of UX", "Notes", "https://lawsofux.com/"),
      resource("Frontend Mentor", "Practice", "https://www.frontendmentor.io/")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Visual fundamentals and product flow",
        objective: "Strengthen taste and product reasoning together.",
        notes: ["Collect references intentionally.", "Justify spacing and hierarchy decisions.", "Run simple critique sessions on your own work."],
        project: "Design one mobile flow and one portfolio case-study page.",
        links: [
          link("Figma Channel", "YouTube", "Video", "https://www.youtube.com/@Figma"),
          link("Laws of UX", "Laws of UX", "Notes", "https://lawsofux.com/"),
          link("Frontend Mentor", "Frontend Mentor", "Project", "https://www.frontendmentor.io/")
        ]
      }
    ]),
    portfolioIdeas: ["Mobile banking app", "Creator dashboard", "Brand identity system"],
    careerTracks: ["UI designer", "UX designer", "Product designer"]
  },
  {
    key: "business",
    label: "Business",
    tagline: "Develop execution systems for strategy, operations, and growth.",
    roadmap: [
      { title: "Business Core", duration: "Weeks 1-3", outcomes: ["Market research", "Unit economics", "Business models"] },
      { title: "Operations & Sales", duration: "Weeks 4-7", outcomes: ["Sales process", "Ops dashboards", "Team workflow"] },
      { title: "Scale & Narrative", duration: "Weeks 8-11", outcomes: ["Pitch decks", "Financial planning", "Leadership systems"] }
    ],
    resources: [
      resource("Y Combinator Library", "YouTube", "https://www.youtube.com/@ycombinator"),
      resource("Strategyzer", "Notes", "https://www.strategyzer.com/library"),
      resource("MBA Crystal Ball", "Course", "https://www.mbacrystalball.com/", "Paid"),
      resource("Notion Business Templates", "Practice", "https://www.notion.so/templates")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Business model and operations flow",
        objective: "Connect strategy decisions with execution systems.",
        notes: ["Always tie strategy to numbers.", "Keep a hypothesis log for experiments.", "Use simple dashboards before complex ones."],
        project: "Draft a business plan and KPI dashboard for a sample venture.",
        links: [
          link("Y Combinator Library", "YouTube", "Video", "https://www.youtube.com/@ycombinator"),
          link("Strategyzer", "Strategyzer", "Notes", "https://www.strategyzer.com/library"),
          link("Notion Templates", "Notion", "Project", "https://www.notion.so/templates")
        ]
      }
    ]),
    portfolioIdeas: ["Business plan", "Go-to-market memo", "Financial model"],
    careerTracks: ["Business analyst", "Founder", "Operations manager"]
  },
  {
    key: "content-creation",
    label: "Content Creation",
    tagline: "Turn ideas into repeatable content systems with audience growth.",
    roadmap: [
      { title: "Content Basics", duration: "Weeks 1-2", outcomes: ["Positioning", "Audience research", "Content pillars"] },
      { title: "Production Engine", duration: "Weeks 3-6", outcomes: ["Scripting", "Editing", "Publishing cadence"] },
      { title: "Distribution & Revenue", duration: "Weeks 7-10", outcomes: ["Analytics", "Brand deals", "Monetization models"] }
    ],
    resources: [
      resource("Colin and Samir", "YouTube", "https://www.youtube.com/@ColinandSamir"),
      resource("Creator Wizard", "Notes", "https://creatorwizard.com/"),
      resource("Notion Creator OS", "Practice", "https://www.notion.so/templates", "Paid"),
      resource("Creator Hooks Database", "PDF", "https://www.justinwelsh.me/", "Paid")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Positioning and content system",
        objective: "Build a repeatable idea-to-publish workflow.",
        notes: ["Choose 2-3 repeatable content pillars.", "Measure hooks and retention, not only views.", "Batch create drafts when possible."],
        project: "Plan and ship a 7-day content mini-series.",
        links: [
          link("Colin and Samir", "YouTube", "Video", "https://www.youtube.com/@ColinandSamir"),
          link("Creator Wizard", "Creator Wizard", "Notes", "https://creatorwizard.com/"),
          link("Notion Templates", "Notion", "Project", "https://www.notion.so/templates")
        ]
      }
    ]),
    portfolioIdeas: ["30-day content sprint", "Newsletter issue pack", "Creator media kit"],
    careerTracks: ["YouTuber", "LinkedIn creator", "Newsletter writer"]
  },
  {
    key: "freelancing",
    label: "Freelancing",
    tagline: "Learn service delivery, outreach, positioning, and repeatable income.",
    roadmap: [
      { title: "Offer Setup", duration: "Weeks 1-2", outcomes: ["Skill packaging", "Niche selection", "Offer statement"] },
      { title: "Client Acquisition", duration: "Weeks 3-5", outcomes: ["Cold outreach", "Proposal systems", "Discovery calls"] },
      { title: "Delivery & Retention", duration: "Weeks 6-9", outcomes: ["Scope management", "Testimonials", "Retainers"] }
    ],
    resources: [
      resource("The Futur", "YouTube", "https://www.youtube.com/@thefutur"),
      resource("Contra Resources", "Notes", "https://contra.com/resources"),
      resource("Upwork Academy", "Course", "https://community.upwork.com/"),
      resource("Proposal Templates", "PDF", "https://www.hubspot.com/business-templates/proposal")
    ],
    weeklyPlanTemplate: weeklyPlanTemplate([
      {
        title: "Offer and outreach engine",
        objective: "Turn a skill into a service with a clear buyer story.",
        notes: ["Define one offer before multiple packages.", "Write outreach around client pain, not your features.", "Track reply rates weekly."],
        project: "Build a service page, proposal template, and outreach tracker.",
        links: [
          link("The Futur", "YouTube", "Video", "https://www.youtube.com/@thefutur"),
          link("Contra Resources", "Contra", "Notes", "https://contra.com/resources"),
          link("HubSpot Proposal Templates", "HubSpot", "Reference", "https://www.hubspot.com/business-templates/proposal")
        ]
      }
    ]),
    portfolioIdeas: ["Service one-pager", "Client case study", "Outreach CRM"],
    careerTracks: ["Solo freelancer", "Consultant", "Micro-agency owner"]
  }
];

export const defaultProgress: ProgressSnapshot = {
  consistency: 84,
  productivity: 76,
  completedTopics: 18,
  weakAreas: ["Deep work consistency", "Revision follow-through", "Portfolio publishing"],
  streak: 21,
  level: 7
};

export const weeklySchedule: ScheduleItem[] = [
  { day: "Mon", focus: "Foundation concepts", duration: "90 min", taskType: "Learn", week: 1, milestone: "Concept clarity" },
  { day: "Tue", focus: "Guided practice", duration: "75 min", taskType: "Practice", week: 1, milestone: "Pattern repetition" },
  { day: "Wed", focus: "Project sprint", duration: "120 min", taskType: "Build", week: 1, milestone: "Visible output" },
  { day: "Thu", focus: "Revision + notes", duration: "60 min", taskType: "Revise", week: 1, milestone: "Memory consolidation" },
  { day: "Fri", focus: "Mock challenge", duration: "75 min", taskType: "Practice", week: 1, milestone: "Speed and accuracy" },
  { day: "Sat", focus: "Portfolio artifact", duration: "120 min", taskType: "Build", week: 1, milestone: "Proof of work" },
  { day: "Sun", focus: "Weekly review", duration: "30 min", taskType: "Reflect", week: 1, milestone: "Next-week reset" }
];

export const reminderFeed = [
  "Revise yesterday's topic before starting new material.",
  "Upload one project proof or certificate this week.",
  "Complete one practice session before 8 PM today.",
  "Review weak areas during your Sunday reflection block."
];

export const achievements = [
  { title: "21-Day Streak", detail: "Consistency badge unlocked", tone: "bg-emerald-50 text-emerald-700" },
  { title: "Builder Level 7", detail: "Two portfolio artifacts published", tone: "bg-sky-50 text-sky-700" },
  { title: "Recovery Loop", detail: "Weak-area revision completed twice", tone: "bg-cyan-50 text-cyan-700" }
];

export function getBlueprint(domain: DomainKey) {
  return domainBlueprints.find((item) => item.key === domain) ?? domainBlueprints[0];
}

export function buildAdaptivePlan(domain: DomainKey, hoursPerDay: number, performanceScore: number) {
  const blueprint = getBlueprint(domain);
  const intensity = hoursPerDay >= 3 ? "accelerated" : hoursPerDay >= 1.5 ? "steady" : "light";
  const supportMode = performanceScore < 60 ? "recovery" : performanceScore < 80 ? "balanced" : "advance";

  return {
    domain: blueprint.label,
    intensity,
    supportMode,
    roadmap: blueprint.roadmap.map((phase, index) => ({
      ...phase,
      checkpoint: `Checkpoint ${index + 1}: ${supportMode === "recovery" ? "extra revision and mentor review" : "project milestone and skill assessment"}`
    })),
    recommendations: [
      performanceScore < 60 ? "Increase revision frequency to 3x per week." : "Keep project-first learning flow.",
      hoursPerDay < 1.5 ? "Use shorter focused sessions with one clear daily win." : "Bundle deep work into longer build blocks.",
      `Prioritize ${blueprint.portfolioIdeas[0]} as the first visible proof of work.`
    ]
  };
}

export function buildPlanner(domain: DomainKey, hoursPerDay: number, availableDays: string[]) {
  const blueprint = getBlueprint(domain);
  const activeTemplate = blueprint.weeklyPlanTemplate;
  const duration = `${Math.max(30, Math.round(hoursPerDay * 60))} min`;
  const focusLoop = [
    { focus: "Core learning", taskType: "Learn" as const, milestone: "Concept clarity" },
    { focus: "Practice drills", taskType: "Practice" as const, milestone: "Skill retention" },
    { focus: "Project output", taskType: "Build" as const, milestone: "Visible progress" },
    { focus: "Revision and notes", taskType: "Revise" as const, milestone: "Recall strength" },
    { focus: "Mock or challenge", taskType: "Practice" as const, milestone: "Accuracy under pressure" },
    { focus: "Portfolio work", taskType: "Build" as const, milestone: "Proof of work" },
    { focus: "Review and planning", taskType: "Reflect" as const, milestone: "Reset for next week" }
  ];

  const schedule = availableDays.map((day, index) => {
    const currentWeek = activeTemplate[index % activeTemplate.length];
    const focusItem = focusLoop[index % focusLoop.length];
    return {
      day,
      focus: `${currentWeek.title} | ${focusItem.focus}`,
      duration,
      taskType: focusItem.taskType,
      week: currentWeek.week,
      milestone: `${currentWeek.objective} | ${focusItem.milestone}`
    };
  });

  return {
    schedule,
    reminders: [
      `Spend one revision block revisiting ${blueprint.weeklyPlanTemplate[0]?.title ?? "your weak area"}.`,
      `Ship one ${blueprint.portfolioIdeas[0]} artifact or progress note this week.`,
      `Use Sunday to review whether ${blueprint.careerTracks[0]} still matches your active goal.`
    ],
    weeklyBreakdown: activeTemplate
  };
}

export function buildStaticResourceRecommendations(domain: DomainKey, goal: string) {
  const blueprint = getBlueprint(domain);
  return {
    summary: `These resources are prioritized for ${goal} in ${blueprint.label}. Start with one structured source, one practice loop, and one build or revision output every week.`,
    recommendedResources: blueprint.resources.slice(0, 4).map((item) => ({
      title: item.title,
      reason: `Useful for ${blueprint.label} learners working toward ${goal}.`,
      link: item.link
    }))
  };
}

export function buildMentorReply(prompt: string, domain: DomainKey): MentorReply {
  const blueprint = getBlueprint(domain);
  const normalized = prompt.toLowerCase();

  if (normalized.includes("job") || normalized.includes("career")) {
    return {
      answer: `Focus on one target track first: ${blueprint.careerTracks[0]}. Build proof of work, publish it publicly, and pair learning with weekly output.`,
      nextSteps: [
        `Complete the ${blueprint.roadmap[0].title} phase before adding advanced topics.`,
        `Publish one ${blueprint.portfolioIdeas[0]} artifact within 14 days.`,
        "Use the dashboard weak-area list to decide what to revise next."
      ],
      warnings: ["Do not over-collect courses without shipping visible work."]
    };
  }

  return {
    answer: `Break the topic into concept, practice, and review. In ${blueprint.label}, momentum improves when each study block ends with a tangible output.`,
    nextSteps: [
      `Watch one focused resource from ${blueprint.resources[0].title}.`,
      "Turn your notes into a checklist or flashcards.",
      "Schedule a practice block within 24 hours."
    ],
    warnings: ["If you miss two planned sessions in a row, reduce the roadmap scope for the week."]
  };
}
