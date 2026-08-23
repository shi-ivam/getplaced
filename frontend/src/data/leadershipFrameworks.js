// Comprehensive Directory of Tech Company Leadership Frameworks & Operating Principles

export const COMPANY_FRAMEWORKS = {
  amazon: {
    id: "amazon",
    name: "Amazon",
    tagline: "16 Leadership Principles (LPs) & Bar Raiser Standard",
    badge: "Leadership Principles",
    accentColor: "#FEDF6A",
    icon: "Building",
    description: "Amazon evaluates all candidates relentlessly against their 16 Leadership Principles. Every behavioral question is mapped to 1-2 specific LPs. The famous 'Bar Raiser' interviewer has veto power over hiring decisions.",
    barRaiserTip: "Always use 'I' instead of 'We' to describe actions. Provide exact metrics in Results (e.g., 'reduced latency by 42% from 380ms to 220ms').",
    principles: [
      {
        id: "customer-obsession",
        name: "Customer Obsession",
        summary: "Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust.",
        greenFlags: ["Working backwards from customer pain points", "Prioritizing long-term trust over short-term team convenience", "Gathering direct customer feedback or telemetry"],
        redFlags: ["Building tech for tech's sake", "Dismissing customer friction as user error", "Ignoring negative customer sentiment"],
        starTip: "Frame the Situation around a user or client friction point, and show how your Action directly improved their workflow.",
        sampleQuestions: [
          "Tell me about a time you went above and beyond to solve a customer issue.",
          "Describe a situation where you had to make a trade-off between team deadlines and customer experience."
        ]
      },
      {
        id: "ownership",
        name: "Ownership",
        summary: "Leaders are owners. They think long term and don't sacrifice long-term value for short-term results. They never say 'that's not my job'.",
        greenFlags: ["Stepping up outside formal job responsibilities", "Fixing unowned technical debt or broken pipelines", "Thinking about cross-team impact"],
        redFlags: ["Blaming other teams or past engineers", "Letting problems slide because they belong to another squad", "Short-sighted quick fixes"],
        starTip: "Explain why you chose to tackle an unassigned issue and how your initiative prevented future operational overhead.",
        sampleQuestions: [
          "Tell me about a time you took on a task or project that was outside your formal job scope.",
          "Describe a time you saw a problem in another team's service that affected the company and how you addressed it."
        ]
      },
      {
        id: "invent-and-simplify",
        name: "Invent and Simplify",
        summary: "Leaders expect and require innovation and invention from their teams and always find ways to simplify. They are externally aware and look for new ideas.",
        greenFlags: ["Simplifying complex architectural spaghetti", "Automating manual workflows", "Using creative algorithms to reduce resource costs"],
        redFlags: ["Over-engineering simple requirements", "Reluctance to adopt modern tools or patterns", "Complacency with manual toil"],
        starTip: "Highlight the contrast between the clunky legacy process and your elegant, simplified architecture.",
        sampleQuestions: [
          "Tell me about a time you simplified a complex process or system.",
          "Describe an innovative technical solution you devised when standard solutions were insufficient."
        ]
      },
      {
        id: "are-right-a-lot",
        name: "Are Right, A Lot",
        summary: "Leaders have strong judgment and good instincts. They seek diverse perspectives and work to disconfirm their beliefs.",
        greenFlags: ["Using empirical data and fast experiments to validate hypotheses", "Recognizing mistakes early and pivoting", "Listening to alternative technical viewpoints"],
        redFlags: ["Dogmatic adherence to opinions without benchmarks", "Inability to admit when an initial hypothesis was incorrect", "Dismissing peer inputs"],
        starTip: "Walk the interviewer through your decision tree: what hypotheses you formed, how you tested them with metrics, and why your judgment proved correct.",
        sampleQuestions: [
          "Tell me about a time you had to make a critical technical decision with incomplete information.",
          "Describe a scenario where your initial judgment was challenged by data and how you adapted."
        ]
      },
      {
        id: "learn-and-be-curious",
        name: "Learn and Be Curious",
        summary: "Leaders are never done learning and always seek to improve themselves. They are curious about new possibilities and act to explore them.",
        greenFlags: ["Proactively learning new frameworks or distributed paradigms", "Diving into unfamiliar parts of the tech stack", "Sharing newfound knowledge with the team"],
        redFlags: ["Resisting new languages or tooling", "Waiting to be assigned training", "Narrow specialization without broader system curiosity"],
        starTip: "Demonstrate self-directed learning that solved a concrete production or product bottleneck.",
        sampleQuestions: [
          "Tell me about a time you quickly mastered an unfamiliar technology or domain to deliver a project.",
          "Describe a side project or research topic you explored purely out of curiosity and what you learned."
        ]
      },
      {
        id: "hire-and-develop",
        name: "Hire and Develop the Best",
        summary: "Leaders raise the performance bar with every hire and promotion. They recognize exceptional talent and willingly move them throughout the organization.",
        greenFlags: ["Mentoring junior developers or interns", "Conducting thorough code reviews that teach best practices", "Authoring onboarding documentation"],
        redFlags: ["Hoarding knowledge to remain indispensable", "Dismissive or unconstructive PR comments", "Ignoring team skill gaps"],
        starTip: "Show how you elevated another engineer's autonomy and code quality through structured pairing and coaching.",
        sampleQuestions: [
          "Tell me about a time you mentored a teammate or intern who was struggling.",
          "How have you helped establish higher engineering standards or onboarding processes across your team?"
        ]
      },
      {
        id: "insist-on-highest-standards",
        name: "Insist on the Highest Standards",
        summary: "Leaders have relentlessly high standards—many people may think these standards are unreasonably high. Leaders continually raise the bar.",
        greenFlags: ["Implementing automated CI/CD test gates", "Refusing to ship code with known edge-case vulnerabilities", "Driving zero-regression releases"],
        redFlags: ["Cutting corners on testing to meet arbitrary deadlines", "Accepting flaky tests as normal", "Saying 'good enough' for critical paths"],
        starTip: "Detail the specific technical standard you enforced (e.g. 85% test coverage, P99 latency SLA) and how you won team buy-in.",
        sampleQuestions: [
          "Tell me about a time you refused to compromise on quality despite pressure to deliver fast.",
          "Describe a time you raised the bar on testing, monitoring, or code review in your team."
        ]
      },
      {
        id: "think-big",
        name: "Think Big",
        summary: "Thinking small is a self-fulfilling prophecy. Leaders create and communicate a bold direction that inspires results.",
        greenFlags: ["Architecting for 10x-100x scalability from day one", "Proposing multi-quarter platform initiatives", "Designing extensible API abstractions"],
        redFlags: ["Building bespoke one-off scripts", "Short-term patching without considering system growth", "Lacking architectural vision"],
        starTip: "Explain how you designed a system not just for today's 1,000 users, but for 1,000,000 users next year.",
        sampleQuestions: [
          "Tell me about a time you proposed a bold technical strategy that significantly expanded project scope or impact.",
          "Describe a system architecture you designed with long-term extensibility in mind."
        ]
      },
      {
        id: "bias-for-action",
        name: "Bias for Action",
        summary: "Speed matters in business. Many decisions and actions are reversible and do not need extensive study. We value calculated risk taking.",
        greenFlags: ["Rapid prototyping to unblock progress", "Distinguishing 1-way doors from 2-way doors", "Unblocking stalled discussions with proof-of-concepts"],
        redFlags: ["Analysis paralysis", "Waiting for 100% certainty before writing code", "Excessive committee meetings for reversible changes"],
        starTip: "Explicitly identify the decision as a 'two-way door' and explain how you moved fast while keeping a rollback safety net.",
        sampleQuestions: [
          "Tell me about a time you had to make a quick decision without having all the data.",
          "Describe a situation where taking a calculated risk allowed your team to ship ahead of schedule."
        ]
      },
      {
        id: "frugality",
        name: "Frugality",
        summary: "Accomplish more with less. Constraints breed resourcefulness, self-sufficiency, and invention. There are no extra points for growing headcount or budget.",
        greenFlags: ["Optimizing cloud compute/storage costs", "Reusing existing infrastructure rather than spinning up expensive services", "Memory and algorithmic efficiency"],
        redFlags: ["Defaulting to throwing expensive cloud hardware at unoptimized code", "Unchecked memory bloat", "Requesting unnecessary third-party licenses"],
        starTip: "Quantify the exact dollar or resource savings achieved through algorithmic or architectural optimization.",
        sampleQuestions: [
          "Tell me about a time you optimized cloud infrastructure or database queries to slash costs.",
          "Describe how you delivered a high-impact system under strict resource or server constraints."
        ]
      },
      {
        id: "earn-trust",
        name: "Earn Trust",
        summary: "Leaders listen attentively, speak candidly, and treat others respectfully. They are vocally self-critical, even when doing so is awkward or embarrassing.",
        greenFlags: ["Vocal self-criticism and blameless post-mortems", "Transparent communication during incidents", "Giving credit to peers and building psychological safety"],
        redFlags: ["Hiding mistakes or downplaying outages", "Passive-aggressive communication", "Claiming sole credit for collaborative wins"],
        starTip: "Highlight your transparency in admitting a blunder and how your rapid communication preserved stakeholder trust.",
        sampleQuestions: [
          "Tell me about a time you made a critical error and how you communicated it to your team and leadership.",
          "Describe a scenario where you built trust with a skeptical stakeholder or difficult colleague."
        ]
      },
      {
        id: "dive-deep",
        name: "Dive Deep",
        summary: "Leaders operate at all levels, stay connected to the details, audit frequently, and are skeptical when metrics and anecdote differ. No task is beneath them.",
        greenFlags: ["Profiling assembly/bytecode or kernel metrics to find root causes", "Auditing telemetry data instead of trusting surface claims", "Deep log analysis"],
        redFlags: ["Accepting mysterious intermittent bugs as 'glitches'", "Superficial debugging that restarts servers without fixing leaks", "Disconnection from code"],
        starTip: "Describe the rigorous step-by-step forensic investigation you executed to uncover a deep system bug.",
        sampleQuestions: [
          "Tell me about the most complex root-cause investigation you conducted in production.",
          "Describe a time when high-level metrics looked healthy but you dug deeper and found an underlying flaw."
        ]
      },
      {
        id: "have-backbone",
        name: "Have Backbone; Disagree and Commit",
        summary: "Leaders are obligated to respectfully challenge decisions when they disagree, even when doing so is uncomfortable. Once a decision is determined, they commit wholly.",
        greenFlags: ["Challenging senior engineers with benchmarks and data", "Disagreeing respectfully without being stubborn", "Committing 100% once consensus is reached"],
        redFlags: ["Passive compliance followed by private complaining", "Undermining a finalized project direction", "Avoiding conflict out of timidity"],
        starTip: "Show your data-driven pushback during debate, followed by full, enthusiastic execution once the final call was made.",
        sampleQuestions: [
          "Tell me about a time you strongly disagreed with your manager or team lead on a technical approach.",
          "Describe a scenario where your proposed solution was rejected, but you committed fully to the chosen direction."
        ]
      },
      {
        id: "deliver-results",
        name: "Deliver Results",
        summary: "Leaders focus on the key inputs for their business and deliver them with the right quality and in a timely fashion. Despite setbacks, they rise to the occasion.",
        greenFlags: ["Consistently meeting sprint milestones", "Overcoming unexpected blockers with creative workarounds", "Focusing on shipped value"],
        redFlags: ["Endless excuses about external dependencies", "90% done syndrome where tasks linger forever", "Shipping low quality just to check boxes"],
        starTip: "Detail the severe obstacle that threatened delivery and how your relentless focus ensured a successful launch.",
        sampleQuestions: [
          "Tell me about a high-stakes project with tight deadlines where you successfully delivered despite severe roadblocks.",
          "Describe how you prioritized competing high-urgency tasks to ensure core business deliverables were met."
        ]
      },
      {
        id: "earths-best-employer",
        name: "Strive to be Earth's Best Employer",
        summary: "Leaders work every day to create a safer, more productive, higher performing, more diverse, and more just work environment.",
        greenFlags: ["Promoting sustainable on-call rotations", "Advocating for team psychological safety", "Eliminating burnout-inducing processes"],
        redFlags: ["Encouraging unhealthy crunch culture", "Ignoring team morale warning signs", "Toxic competition"],
        starTip: "Show how you improved team working conditions or on-call sanity through automation and empathy.",
        sampleQuestions: [
          "Tell me about a time you advocated for team well-being or improved an on-call rotation that was causing burnout.",
          "How do you foster an inclusive and supportive engineering environment on your squad?"
        ]
      },
      {
        id: "scale-responsibility",
        name: "Success and Scale Bring Broad Responsibility",
        summary: "We must be humble and thoughtful about the secondary effects of our actions. Our local actions have global impact. We must create more than we consume.",
        greenFlags: ["Considering security, privacy, and accessibility at scale", "Evaluating downstream service dependencies", "Building ethical software"],
        redFlags: ["Indifference to user privacy or data leakage", "Ignoring accessibility needs", " reckless changes that ripple across the organization"],
        starTip: "Explain how you accounted for security, accessibility, or platform-wide stability before shipping.",
        sampleQuestions: [
          "Tell me about a time you considered the broader systemic or secondary consequences of an architectural rollout.",
          "How do you ensure your engineering decisions respect user privacy, accessibility, and ethical standards?"
        ]
      }
    ]
  },

  google: {
    id: "google",
    name: "Google",
    tagline: "Googliness, 10x Thinking & Emergent Leadership",
    badge: "Googliness & 4 Pillars",
    accentColor: "#D4FDF7",
    icon: "Sparkles",
    description: "Google's hiring framework evaluates 4 universal attributes: General Cognitive Ability (GCA), Role-Related Knowledge (RRK), Leadership, and Googliness. They seek engineers with intellectual humility, collaborative DNA, and comfort navigating ambiguous problems.",
    barRaiserTip: "Google interviewers love structured problem breakdowns, collaborative framing ('I consulted stakeholders and gathered telemetry'), and 10x scalability considerations.",
    principles: [
      {
        id: "googliness",
        name: "Googliness & Cultural DNA",
        summary: "Doing the right thing, intellectual humility, thriving in ambiguity, proactive collaboration, and putting the user first.",
        greenFlags: ["Admitting knowledge gaps and asking great questions", "Doing the right ethical thing even without supervision", "Supporting peer success"],
        redFlags: ["Arrogance or intellectual superiority", "Analysis paralysis in ambiguous environments", "Cutthroat individualistic behavior"],
        starTip: "Highlight your collaborative instinct and intellectual humility when navigating uncharted problems.",
        sampleQuestions: [
          "Tell me about a time you navigated an ambiguous engineering problem with no documentation or prior art.",
          "Describe a situation where doing the right thing for the user conflicted with short-term metrics."
        ]
      },
      {
        id: "emergent-leadership",
        name: "Emergent Leadership",
        summary: "Stepping into leadership when a vacuum exists to unblock the team, and stepping back graciously when someone else is better suited.",
        greenFlags: ["Taking charge of a rudderless crisis without being asked", "Facilitating consensus rather than dictating solutions", "Sharing leadership roles"],
        redFlags: ["Authoritarian command-and-control mindset", "Refusal to follow others", "Ignoring team sentiment"],
        starTip: "Show how you stepped in to organize a disjointed effort, created clarity, and empowered others.",
        sampleQuestions: [
          "Tell me about a time you naturally stepped into a leadership role to unblock a stalled project.",
          "Describe how you built consensus across multiple engineering squads with conflicting priorities."
        ]
      },
      {
        id: "10x-thinking",
        name: "10x Innovation & Scale",
        summary: "Rather than seeking 10% incremental improvements, thinking about revolutionary 10x architectures that solve the fundamental bottleneck.",
        greenFlags: ["Algorithmic and distributed breakthroughs", "Questioning foundational assumptions", "Designing for billions of daily operations"],
        redFlags: ["Incremental thinking on outdated paradigms", "Premature optimization without asymptotic gains", "Fear of ambitious changes"],
        starTip: "Explain how you rejected a band-aid solution in favor of a clean, highly scalable architectural paradigm.",
        sampleQuestions: [
          "Tell me about a time you redesigned a system to achieve a 10x improvement in throughput or latency.",
          "Describe an innovative technical solution you proposed that challenged conventional company wisdom."
        ]
      },
      {
        id: "intellectual-humility",
        name: "Intellectual Humility & Growth",
        summary: "Being open to new evidence, eagerly seeking feedback, and viewing failure as valuable data for the organization.",
        greenFlags: ["Embracing code review feedback gracefully", "Running blameless post-mortems", "Learning from production outages"],
        redFlags: ["Defensiveness in code reviews", "Blaming external factors for bugs", "Inability to acknowledge mistakes"],
        starTip: "Detail a learning experience where critical feedback directly enabled you to build a better system.",
        sampleQuestions: [
          "Tell me about a time you were wrong about a major technical direction and how you handled the realization.",
          "Describe a time you received constructive criticism and how you integrated it into your engineering habits."
        ]
      }
    ]
  },

  meta: {
    id: "meta",
    name: "Meta",
    tagline: "Move Fast, Focus on Impact & Live in the Future",
    badge: "6 Core Values",
    accentColor: "#E4CDFB",
    icon: "Zap",
    description: "Meta values engineers who move fast with high autonomy, focus relentlessly on massive long-term impact, communicate with radical directness, and build awesome things that connect billions.",
    barRaiserTip: "Highlight speed of execution, rapid prototyping, A/B testing with quantifiable business metrics, and direct, respectful feedback.",
    principles: [
      {
        id: "move-fast",
        name: "Move Fast",
        summary: "Build fast, iterate aggressively, and remove blockers. Moving fast enables us to learn faster and build better things.",
        greenFlags: ["Rapid MVP prototyping", "Automating testing to enable continuous deployment", "Removing friction from the developer feedback loop"],
        redFlags: ["Reckless deployment without automated rollback safeguards", "Slow analysis paralysis", "Hesitation to test live prototypes"],
        starTip: "Demonstrate how you built a working prototype within 48-72 hours to validate a concept with real users.",
        sampleQuestions: [
          "Tell me about a time you shipped a high-impact feature in an exceptionally short timeframe.",
          "Describe how you balanced moving fast with maintaining system reliability and automated test coverage."
        ]
      },
      {
        id: "focus-on-impact",
        name: "Focus on Long-Term Impact",
        summary: "Solve the most important problems. Don't waste time on trivial optimizations that don't move the core company needle.",
        greenFlags: ["Prioritizing high-leverage architectural changes", "Using data and telemetry to decide what NOT to build", "Measurable user growth or latency wins"],
        redFlags: ["Bikeshedding on trivial aesthetic details", "Working on vanity projects with zero adoption", "Ignoring ROI of engineering time"],
        starTip: "Quantify the direct business or user metric outcome (e.g. +12% user retention, 200ms faster feed load).",
        sampleQuestions: [
          "Tell me about the highest-impact project you delivered in your career and how you measured its success.",
          "Describe a time you deprecated or killed a feature/project because the data showed low leverage."
        ]
      },
      {
        id: "build-awesome-things",
        name: "Build Awesome Things",
        summary: "Push the boundaries of craft and delight. We create things that are not just functional, but genuinely transformative.",
        greenFlags: ["Obsession with UI smoothness and 60fps rendering", "Creative use of novel APIs and distributed primitives", "Delighting the user"],
        redFlags: ["Indifference to UX glitches", "Settling for mediocre performance", "Lack of craft in frontend/backend polish"],
        starTip: "Share your passion for craftsmanship, visual responsiveness, and technical excellence.",
        sampleQuestions: [
          "Tell me about a feature or system you built that you are most technically and aesthetically proud of.",
          "How do you ensure your engineering work delivers both rock-solid stability and delightful user experience?"
        ]
      },
      {
        id: "be-direct",
        name: "Be Direct and Respect Your Colleagues",
        summary: "Communicate with radical candor and transparency. Give and receive direct, constructive feedback with empathy.",
        greenFlags: ["Addressing issues directly rather than letting resentment fester", "Clear, respectful, and actionable PR reviews", "Speaking truth to leadership"],
        redFlags: ["Passive aggression", "Sugarcoating critical architectural risks", "Hostile or abrasive criticism"],
        starTip: "Explain a time you gave difficult, timely feedback to a peer or lead that prevented a major production failure.",
        sampleQuestions: [
          "Tell me about a time you had to deliver difficult, direct feedback to a peer or manager.",
          "Describe a high-stakes technical debate where direct communication prevented a costly architecture mistake."
        ]
      }
    ]
  },

  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    tagline: "Growth Mindset, One Microsoft & Customer Empathy",
    badge: "Growth Mindset Culture",
    accentColor: "#FEF9CF",
    icon: "Target",
    description: "Satya Nadella's Microsoft culture is rooted in Carol Dweck's Growth Mindset ('Learn-it-all beats Know-it-all'), breaking down organizational silos ('One Microsoft'), and deep customer empathy.",
    barRaiserTip: "Emphasize collaboration across divisions, turning setbacks into institutional learnings, and accessibility/inclusivity in your code.",
    principles: [
      {
        id: "growth-mindset",
        name: "Growth Mindset (Learn-It-All)",
        summary: "Believing that talent and skills can be developed through dedication and hard work. Moving from a 'Know-It-All' to a 'Learn-It-All'.",
        greenFlags: ["Curiosity to understand adjacent technologies", "Treating failure as essential data", "Constantly seeking constructive critiques"],
        redFlags: ["Defending outdated approaches due to pride", "Belief that abilities are fixed", "Reluctance to enter unfamiliar technical domains"],
        starTip: "Highlight a steep learning curve you conquered to solve a novel production challenge.",
        sampleQuestions: [
          "Tell me about a time you stepped into a completely unfamiliar tech stack and became proficient quickly.",
          "Describe a major failure in your career and the systemic changes it inspired in your engineering philosophy."
        ]
      },
      {
        id: "one-microsoft",
        name: "One Microsoft Collaboration",
        summary: "Breaking down silos. Actively collaborating across teams, sharing code libraries, and putting the enterprise's success ahead of squad territory.",
        greenFlags: ["Contributing to shared internal libraries", "Partnering with other engineering orgs on unified APIs", "Knowledge sharing"],
        redFlags: ["Not-Invented-Here (NIH) syndrome", "Protecting territorial squad boundaries", "Duplicating existing shared components"],
        starTip: "Show how you partnered with another department to build a shared, reusable platform service.",
        sampleQuestions: [
          "Tell me about a time you collaborated with another team or organization to deliver a shared platform.",
          "Describe how you resolved cross-team friction when integrating dependencies across organizational boundaries."
        ]
      },
      {
        id: "customer-empathy",
        name: "Customer Empathy & Inclusion",
        summary: "Deeply understanding diverse customer needs, accessibility requirements, and building products for everyone on the planet.",
        greenFlags: ["Incorporating WCAG accessibility standards", "Listening to user pain points", "Designing for diverse network and device conditions"],
        redFlags: ["Ignoring accessibility considerations", "Building only for high-end developer machines", "Disregarding customer support feedback"],
        starTip: "Explain how you optimized for low-bandwidth users or improved keyboard/screen-reader accessibility.",
        sampleQuestions: [
          "Tell me about a time you championed accessibility or inclusivity in a product you built.",
          "Describe how customer feedback changed your technical architecture or roadmap."
        ]
      }
    ]
  },

  netflix: {
    id: "netflix",
    name: "Netflix",
    tagline: "Freedom & Responsibility, Context Not Control & Radical Candor",
    badge: "Culture of Excellence",
    accentColor: "#FFC5B7",
    icon: "Award",
    description: "Netflix operates on high talent density, extreme freedom paired with immense responsibility, context rather than top-down control, and radical transparency.",
    barRaiserTip: "Demonstrate high autonomy, mature risk management, independent decision making, and candid, respectful feedback.",
    principles: [
      {
        id: "context-not-control",
        name: "Context, Not Control",
        summary: "Leaders set strategy, metrics, and context—then trust senior engineers to execute autonomously without micromanagement.",
        greenFlags: ["Making independent high-stakes architectural choices aligned with business context", "Documenting decision rationale transparently"],
        redFlags: ["Waiting for explicit instructions on every detail", "Micromanaging others", "Making decisions in a vacuum without context"],
        starTip: "Describe an autonomous decision you made based on business goals without needing managerial sign-off.",
        sampleQuestions: [
          "Tell me about a time you made an autonomous high-stakes engineering decision with minimal managerial supervision.",
          "How do you ensure your technical choices remain strictly aligned with broader company business goals?"
        ]
      },
      {
        id: "radical-candor",
        name: "Radical Candor & Feedback",
        summary: "Giving feedback directly, frequently, and with genuine care for peer improvement. Avoiding politics and hallway whispering.",
        greenFlags: ["Giving candid, constructive feedback in code reviews", "Encouraging peers to critique your designs openly"],
        redFlags: ["Passive-aggressive behavior", "Withholding critical feedback until performance reviews", "Hostility"],
        starTip: "Show how early, constructive peer feedback saved weeks of wasted engineering effort.",
        sampleQuestions: [
          "Tell me about a time you provided critical feedback to a senior colleague that improved a product outcome.",
          "How do you handle receiving direct, unfiltered feedback on your code in public design reviews?"
        ]
      }
    ]
  },

  apple: {
    id: "apple",
    name: "Apple",
    tagline: "Extreme Craftsmanship, Secrecy & Simplicity",
    badge: "Design & Excellence",
    accentColor: "#FEDF6A",
    icon: "Building",
    description: "Apple values perfectionism in user experience, rigorous cross-functional collaboration, uncompromising security/privacy, and deep attention to detail.",
    barRaiserTip: "Focus on UI micro-interactions, hardware/software integration, memory efficiency, and user privacy guarantees.",
    principles: [
      {
        id: "craftsmanship",
        name: "Extreme Craftsmanship & Detail",
        summary: "Every microsecond of animation, every pixel, and every milliwatt of power matters. Good enough is never good enough.",
        greenFlags: ["Zero-jank UI performance (60/120fps)", "Profiling battery and memory footprint", "Refining edge cases obsessively"],
        redFlags: ["Tolerating visible UI stutter", "Unchecked memory leaks", "Shoddy edge-case handling"],
        starTip: "Detail how you profiled memory allocations or frame render times to deliver buttery-smooth performance.",
        sampleQuestions: [
          "Tell me about a project where you obsessed over the micro-details to make the user experience exceptional.",
          "Describe how you identified and eliminated subtle performance or battery-drain bottlenecks in an application."
        ]
      },
      {
        id: "privacy-trust",
        name: "User Privacy & Security as a Fundamental Right",
        summary: "Designing systems with zero-knowledge architectures, on-device processing, and strict data minimization.",
        greenFlags: ["Minimizing telemetry data collection", "Implementing on-device ML/caching", "Zero-trust API design"],
        redFlags: ["Careless logging of PII data", "Transmitting unencrypted payloads", "Treating security as an afterthought"],
        starTip: "Explain how you engineered privacy-preserving data structures or on-device computation.",
        sampleQuestions: [
          "Tell me about a time you architected a system specifically around strict user privacy and security requirements.",
          "How do you balance data analytics needs with uncompromising user privacy guarantees?"
        ]
      }
    ]
  },

  stripe: {
    id: "stripe",
    name: "Stripe",
    tagline: "Users First, Rigor & Move Fast with Precision",
    badge: "Financial Infrastructure Bar",
    accentColor: "#896EE2",
    icon: "Layers",
    description: "Stripe powers global economic infrastructure where downtime means lost livelihood for merchants. They demand immense technical rigor, idempotency, beautiful API contracts, and intellectual honesty.",
    barRaiserTip: "Discuss idempotency keys, distributed transaction safety, zero-downtime database migrations, and clean API design.",
    principles: [
      {
        id: "users-first",
        name: "Users First & Developer Delight",
        summary: "Empathize deeply with merchants and developers. Every error message, API response, and SDK must be intuitive and reliable.",
        greenFlags: ["Designing self-explanatory, backward-compatible APIs", "Clear, actionable error messages", "SDK developer ergonomics"],
        redFlags: ["Cryptic error codes", "Breaking API changes without versioning", "Indifference to developer onboarding friction"],
        starTip: "Describe how you crafted developer-first documentation or intuitive API error payloads.",
        sampleQuestions: [
          "Tell me about an API or developer tool you designed and how you ensured it was intuitive and resilient.",
          "Describe a time you diagnosed a complex merchant integration bug and improved the developer experience."
        ]
      },
      {
        id: "rigor-precision",
        name: "Macro Ambition with Micro Rigor",
        summary: "Building financial-grade systems where 99.999% reliability, idempotency, and transactional consistency are table stakes.",
        greenFlags: ["Implementing distributed locks with TTL", "Idempotent payment webhooks", "Chaos engineering and fuzz testing"],
        redFlags: ["Sloppy race conditions in financial logic", "Skipping database constraints", "Untested edge states"],
        starTip: "Explain how you architected idempotency guarantees to prevent double-charging or race conditions.",
        sampleQuestions: [
          "Tell me about a time you designed a distributed system where data loss or duplicate processing was unacceptable.",
          "Describe how you engineered comprehensive regression and chaos testing for a critical financial flow."
        ]
      }
    ]
  },

  uber: {
    id: "uber",
    name: "Uber",
    tagline: "Go Get It, Trip Obsessed & Operational Resilience",
    badge: "Real-Time Scale",
    accentColor: "#D4FDF7",
    icon: "Zap",
    description: "Uber operates in the physical world where real-time matching, geospatial indexing (H3), and physical safety are critical. They value high bias for action and operational grit.",
    barRaiserTip: "Focus on real-time event streaming, circuit breakers, graceful degradation during network drops, and blameless post-mortems.",
    principles: [
      {
        id: "trip-obsessed",
        name: "Trip Obsessed & Real-Time Reliability",
        summary: "Connecting the physical and digital worlds in real time. Ensuring riders and drivers have reliable, safe trips 24/7.",
        greenFlags: ["Designing for network dropouts and offline sync", "Sub-second geospatial indexing", "High-throughput message queues"],
        redFlags: ["Assuming perfect mobile connectivity", "Unhandled geolocation edge cases", "Slow recovery from failures"],
        starTip: "Detail how you handled erratic mobile network connectivity or high-throughput real-time events.",
        sampleQuestions: [
          "Tell me about a real-time distributed system you built and how you handled latency spikes under sudden demand.",
          "Describe an operational incident you resolved in real time to restore availability to end users."
        ]
      },
      {
        id: "go-get-it",
        name: "Go Get It & Operational Grit",
        summary: "Bringing relentless energy to solve hard logistical and technical challenges. Turning roadblocks into breakthroughs.",
        greenFlags: ["Scrappy problem solving", "Taking full responsibility for outcomes", "Pushing through complex integrations"],
        redFlags: ["Giving up when first approach fails", "Blaming external APIs", "Lack of tenacity"],
        starTip: "Show your resilience when multiple unexpected hurdles threatened project delivery.",
        sampleQuestions: [
          "Tell me about the hardest engineering obstacle you encountered and how you persevered to overcome it.",
          "Describe a situation where standard procedures failed and you had to innovate on the fly."
        ]
      }
    ]
  },

  atlassian: {
    id: "atlassian",
    name: "Atlassian",
    tagline: "Open Company No Bullshit & Play as a Team",
    badge: "5 Core Values",
    accentColor: "#FEF9CF",
    icon: "BookOpen",
    description: "Atlassian builds teamwork software (Jira, Confluence, Bitbucket). Their values center on radical openness, authentic team harmony, and putting the customer first without corporate politics.",
    barRaiserTip: "Highlight transparency, open-source documentation, blameless culture, and cross-functional empathy.",
    principles: [
      {
        id: "open-company",
        name: "Open Company, No Bullshit",
        summary: "Being open, honest, and transparent. Sharing information broadly and building trust across the entire company.",
        greenFlags: ["Writing public post-mortems", "Transparent RFC architecture proposals", "Inviting open debate on technical roadmaps"],
        redFlags: ["Closed-door engineering politics", "Hiding architectural risks", "Information hoarding"],
        starTip: "Explain how you used open documentation and transparent RFCs to build org-wide consensus.",
        sampleQuestions: [
          "Tell me about a time you openly shared a major engineering mistake with your team and what happened.",
          "Describe how you documented and shared technical knowledge across your organization."
        ]
      },
      {
        id: "play-as-a-team",
        name: "Play as a Team",
        summary: "Putting the team's success ahead of individual accolades. Supporting teammates, celebrating wins, and sharing setbacks.",
        greenFlags: ["Helping unblock struggling teammates", "Shared ownership of releases", "Positive, empathetic team spirit"],
        redFlags: ["Lone wolf behavior", "Taking credit for others' work", "Refusing to assist peers"],
        starTip: "Show how you supported a peer under pressure to ensure the collective sprint was successful.",
        sampleQuestions: [
          "Tell me about a time you put your personal tasks on hold to help a teammate hit a critical deadline.",
          "How do you cultivate a supportive, highly collaborative engineering culture on your team?"
        ]
      }
    ]
  }
};
