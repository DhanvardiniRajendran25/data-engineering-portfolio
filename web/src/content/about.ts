/**
 * About page content, migrated from the previous site's about, story,
 * experience, education, skills, and awards pages.
 *
 * Copy is rewritten to remove em dashes per the site-wide copy rule.
 */

export type Role = {
  org: string;
  /** Company or institution mark, shown beside the role. */
  logo: string;
  title: string;
  period: string;
  location: string;
  points: string[];
};

export const PROFESSIONAL: Role[] = [
  {
    org: "Northeastern University",
    logo: "/logos/northeastern.webp",
    title: "Graduate Teaching Assistant, Business Process Engineering",
    period: "Jan 2026 to May 2026",
    location: "Boston, MA",
    points: [
      "Teaching assistant for a graduate Business Process Engineering course spanning product management, supply-chain strategy, and modern delivery across 15 weeks of live sessions.",
      "Mentored student teams through **Agile**, **Scrum**, **Kanban**, **Lean**, **CI/CD**, and **DevOps** practice, reviewing sprint artifacts, workflows, and delivery decisions.",
      "Guided product-management deliverables: product vision, roadmaps, prioritization with **RICE**, **MoSCoW**, and **Kano**, user stories, and backlog ranking in Scrum simulations.",
      "Coached process-led analysis, mapping workflows and evaluating logistics technologies including **WMS**, **TMS**, **RFID**, and **IoT**, and translating goals into KPIs such as North Star, retention, and churn.",
      "Graded quizzes, team projects, and exams against detailed rubrics with written feedback, pushing work from description to evidence-based analysis.",
      "Ran office hours and course operations with the instructor and TA supervisors, keeping the cohort unblocked on ceremonies, roadmaps, and metrics.",
    ],
  },
  {
    org: "Optum, UnitedHealth Group",
    logo: "/logos/optum.webp",
    title: "Software Engineer",
    period: "Feb 2023 to Aug 2024",
    location: "Hyderabad, India",
    points: [
      "Designed, built, and owned **Java** and **Spring Boot** microservices behind **service discovery** and an **API gateway**, taking 25+ production features from API contract through implementation, testing, release, and production verification on UnitedHealth Group health-plan platforms.",
      "Delivered full-stack features end to end, pairing **FastAPI** and **Django** REST APIs with **React** interfaces that turned complex healthcare requirements into responsive internal applications used by teams serving 5M+ members.",
      "Architected event-driven **Apache Kafka** workflows with retries, dead-letter topics, and idempotent consumers, keeping high-volume message processing reliable and duplicate-free through failures and redeliveries.",
      "Containerized services with **Docker**, deployed to **Kubernetes**, and automated build, test, and deploy stages in **Jenkins** CI/CD, cutting release time by 30%.",
      "Drove engineering quality through **TDD**, pair programming, and **Extreme Programming**, holding 90%+ coverage and reviewing pull requests for correctness, readability, and design.",
      "Modeled data and tuned **SQL** across relational stores, closing recurring data gaps and performance bottlenecks in claim- and member-level datasets.",
      "Verified releases on multi-team deployment calls, diagnosing and fixing live defects and coordinating changes across dependent services.",
      "Mentored 70+ new university hires in **Java** and **Docker** through the Technology Development Program, and earned three Optum Bravo Awards for Performance, Quality, and Relationships.",
    ],
  },
  {
    org: "Optum, UnitedHealth Group",
    logo: "/logos/optum.webp",
    title: "Associate Software Engineer",
    period: "Jul 2022 to Feb 2023",
    location: "Hyderabad, India",
    points: [
      "Re-engineered 40+ features onto the **NextGen** architecture in **Java**, converting legacy business logic into modular, maintainable services validated against legacy output for a zero-surprise cutover.",
      "Implemented core eligibility and **Medicare Part D** accumulator logic, encoding the rules that determine member eligibility and track benefit accumulations across plan periods.",
      "Instrumented services with **Prometheus** metrics and alerting and built **Grafana** dashboards, cutting incident-detection time by 40% with real-time visibility into failures and performance.",
      "Shipped every feature with 100% coverage across unit, **mutation**, regression, and feature tests, owning deployments through release verification and hotfixes.",
      "Hardened reliability with reconciliation, deduplication, and rerun-from-failed-step recovery across multi-step execution flows.",
      "Tuned **SQL** and query paths on billion-row datasets, applying predicate pushdown and selective aggregation to cut runtime.",
      "Earned Bronze **Subject Matter Expert** recognition across NextGen Eligibility, HFB, and Part D Accumulators, and was promoted to Software Engineer in under a year.",
    ],
  },
  {
    org: "National Institute of Technology, Tiruchirappalli",
    logo: "/logos/nit.webp",
    title: "Machine Learning Engineer",
    period: "Dec 2021 to Jul 2022",
    location: "Tiruchirappalli, India",
    points: [
      "Designed and trained **NLP** and machine-learning models for two research systems, both published in **Springer** LNNS.",
      "Built **KnowSOntoWSR**, a QoS-ontology-driven web-service recommender using an **XGBoost** classifier with semantic-similarity features, reaching 95.94% accuracy and 95.93% F-measure.",
      "Developed **QG-SKI**, an NLP pipeline for question classification and MCQ generation, inducing dynamic ontologies over the **LOD Cloud** and **WikiData** with **TF-IDF** and semantic measures (Shannon entropy, Jaccard, Normalized Google Distance), reaching 98.15% accuracy.",
      "Engineered end-to-end ML workflows across data collection, feature engineering, training, and evaluation, benchmarking every model against baselines.",
      "Co-authored and presented two peer-reviewed papers at international conferences (ICIoTCT, HIS).",
    ],
  },
  {
    org: "SASTRA University",
    logo: "/logos/sastra.webp",
    title: "Undergraduate Research Assistant",
    period: "May 2020 to Jul 2022",
    location: "Thanjavur, India",
    points: [
      "Researched blockchain and Web3 systems, producing two **IEEE** publications on decentralized applications and smart contracts.",
      "Built a decentralized smart-grid energy-trading platform with an authenticated dynamic-auction mechanism and a market-clearing-price algorithm for secure, transparent electricity trading.",
      "Developed and deployed **Ethereum** smart contracts in **Solidity** with the **Truffle** framework, wiring them to a **React** front end via **Web3.js** with **MetaMask** for authenticated transactions, tested on **Ganache**.",
      "Prototyped a decentralized e-commerce dApp on Ethereum that removed intermediary listing fees and centralized control.",
      "Prepared datasets, ran experiments, and documented results with faculty and graduate researchers across the full research cycle.",
    ],
  },
  {
    org: "Cognizant",
    logo: "/logos/cognizant.webp",
    title: "Software Engineer Intern, Full Stack Java",
    period: "Mar 2021 to Aug 2021",
    location: "Chennai, India",
    points: [
      "Built full-stack **Java** features end to end, developing **Spring Boot** services and the **React** screens that consumed them alongside senior engineers across multiple sprint releases.",
      "Designed and consumed **REST APIs**, wiring service and repository layers to relational databases with **JPA** and **SQL**.",
      "Built responsive UI in **React** with **JavaScript**, HTML, and CSS, integrating components with backend endpoints.",
      "Wrote unit and integration tests and resolved QA and production defects through root-cause analysis.",
      "Worked in an **Agile** team with code reviews and **Git**, following the team's engineering and delivery standards; recognized with Sparkling Stars and Learning Paladins awards.",
    ],
  },
];

export const LEADERSHIP: Role[] = [
  {
    org: "Aspiring Product Managers Club, Northeastern",
    logo: "/logos/apm.webp",
    title: "Executive Vice President",
    period: "2024 to 2026",
    location: "Boston, MA",
    points: [
      "Led strategy and operations for a community of 1,500+ builders and technologists as second in command of the organization.",
      "Headlined the flagship annual conference with 2,000+ attendees, owning programming, logistics, and speaker curation end to end.",
      "Directed a 20-person team running hackathons that engaged 400+ teams, setting structure, timelines, and judging.",
      "Scaled the community through 45+ events, growing participation and deepening the member pipeline across the year.",
      "Recruited 70+ industry leaders from Microsoft, Google, and Amazon as mentors and speakers, building lasting partner relationships.",
    ],
  },
  {
    org: "Startup Boston",
    logo: "/logos/startup-boston.webp",
    title: "Program Coordinator, Startup Boston Week",
    period: "Sep 2024 to Dec 2024",
    location: "Boston, MA",
    points: [
      "Volunteered in program management for Startup Boston Week within 10 days of arriving in the US, hosting and emceeing 20+ sessions.",
      "Coordinated session logistics and speaker handoffs across a multi-day, multi-track schedule, keeping sessions on time.",
      "Served as on-stage host, introducing speakers and moderating events and Q&A to keep audiences engaged across back-to-back sessions.",
      "Partnered with organizers and volunteers to manage attendee flow and last minute schedule changes during a high volume event week.",
    ],
  },
  {
    org: "Husky Systers Code, Northeastern",
    logo: "/logos/husky-systers-code.jpg",
    title: "Member",
    period: "2024 to 2026",
    location: "Boston, MA",
    points: [
      "Active member of Northeastern's women-in-tech community, joining technical workshops, talks, and peer mentorship throughout the year.",
      "Collaborated with women engineers and students to support learning, representation, and community in computing.",
      "Took part in coding sessions and events that build technical skills and a supportive network across the program.",
    ],
  },
];

export const SKILL_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Languages and fundamentals",
    items: ["Java", "Python", "TypeScript", "JavaScript", "Go", "SQL", "Scala", "DSA"],
  },
  {
    label: "Backend and APIs",
    items: [
      "Spring Boot",
      "Microservices",
      "REST APIs",
      "API Gateway",
      "Service Discovery",
      "JPA and Hibernate",
      "FastAPI",
      "Django",
      "Node.js",
      "Express.js",
      "Kafka",
      "Redis",
    ],
  },
  {
    label: "Frontend",
    items: ["React", "Next.js", "Angular", "React Native", "Tailwind CSS", "HTML and CSS"],
  },
  {
    label: "AI and LLM systems",
    items: [
      "LangGraph",
      "LangChain",
      "CrewAI",
      "RAG design",
      "Multi-agent",
      "Pinecone",
      "ChromaDB",
      "Neo4j GraphRAG",
      "Snowflake Cortex",
      "Evals and guardrails",
      "GPT-4o",
      "Gemini",
    ],
  },
  {
    label: "Testing and quality",
    items: [
      "TDD",
      "Pair programming",
      "JUnit",
      "pytest",
      "Mutation testing",
      "Regression testing",
      "Code review",
    ],
  },
  {
    label: "Data and streaming",
    items: [
      "Spark",
      "Databricks",
      "PySpark",
      "Airflow",
      "dbt",
      "Delta Lake",
      "Iceberg",
      "Medallion",
      "Dimensional modeling",
      "SCD Type 2",
      "Data quality gates",
      "Snowflake",
      "PostgreSQL",
      "MongoDB",
      "SQL Server",
    ],
  },
  {
    label: "Cloud and DevOps",
    items: [
      "AWS",
      "S3",
      "Glue",
      "Redshift",
      "EMR",
      "Azure",
      "ADLS Gen2",
      "Synapse",
      "Data Factory",
      "GCP",
      "BigQuery",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "GitHub Actions",
      "Terraform",
      "Azure DevOps",
      "Unity Catalog",
      "CI/CD",
      "Prometheus",
      "Grafana",
    ],
  },
  {
    label: "Analytics and visualization",
    items: ["Power BI", "Tableau", "QuickSight", "Looker", "Streamlit", "KPI design"],
  },
];

export type Education = {
  org: string;
  logo: string;
  title: string;
  period: string;
  location: string;
  grade?: string;
  coursework: string[];
};

export const EDUCATION: Education[] = [
  {
    org: "Northeastern University",
    logo: "/logos/northeastern.webp",
    title: "Master of Science, Information Systems",
    period: "Sep 2024 to May 2026",
    location: "Boston, MA",
    grade: "3.75 / 4.0",
    coursework: [
      "Generative AI with LLMs in Data Engineering",
      "Big-Data Systems and Intelligence Analytics",
      "Data Architecture for Business Intelligence",
      "Advanced Business Process Engineering",
      "Data Science Methods and Tools",
      "Agile Software Development",
      "Data Management and Database Design",
      "Advanced User Experience Design and Testing",
    ],
  },
  {
    org: "Shanmugha Arts, Science, Technology and Research Academy",
    logo: "/logos/sastra.webp",
    title: "Bachelor of Technology, Computer Engineering",
    period: "Jun 2018 to Jun 2022",
    location: "Thanjavur, India",
    coursework: [
      "Data Structures and Algorithms",
      "Database Management Systems",
      "Operating Systems",
      "Computer Networks",
      "Object-Oriented Programming",
      "Computer Architecture",
      "Software Engineering",
      "Systems and Compiler Design",
      "Artificial Intelligence and Machine Learning",
      "Natural Language Processing",
    ],
  },
];

export type Publication = {
  title: string;
  venue: string;
  publisher: string;
  logo: string;
  year: string;
  url: string;
};

export const PUBLICATIONS: Publication[] = [
  {
    title:
      "KnowSOntoWSR: Web Service Recommendation System Using a Semantically Driven QoS Ontology Based Knowledge Centered Paradigm",
    venue: "International Conference on Internet of Things and Connected Technologies",
    publisher: "Springer",
    logo: "/logos/springer.webp",
    year: "July 23, 2023",
    url: "https://link.springer.com/chapter/10.1007/978-981-19-9719-8_19",
  },
  {
    title:
      "QG-SKI: Question Classification and MCQ Question Generation Using Sequential Knowledge Induction",
    venue: "International Conference on Hybrid Intelligent Systems",
    publisher: "Springer",
    logo: "/logos/springer.webp",
    year: "May 25, 2023",
    url: "https://link.springer.com/chapter/10.1007/978-3-031-27409-1_11",
  },
  {
    title: "Design, Development and Execution of Smart Contract: An Overview",
    venue: "International Conference on Computer Communication and Informatics",
    publisher: "IEEE",
    logo: "/logos/ieee.webp",
    year: "January 23, 2023",
    url: "https://ieeexplore.ieee.org/abstract/document/10128536",
  },
  {
    title:
      "Development and Integration of dApp with Blockchain Smart Contract Truffle Framework for User Interactive Applications",
    venue: "International Conference on Computer Communication and Informatics",
    publisher: "IEEE",
    logo: "/logos/ieee.webp",
    year: "January 23, 2023",
    url: "https://ieeexplore.ieee.org/abstract/document/10128406",
  },
];

export type Award = {
  title: string;
  logo: string;
  /** Certificate or feature photo. */
  image: string;
  detail: string;
  /** Public announcement, where one exists. */
  url?: string;
};

export const AWARDS: { group: string; items: Award[] }[] = [
  {
    group: "Academic honors",
    items: [
      {
        title: "Laurel and Scroll 100",
        image: "/awards/laurel-scroll.webp",
        logo: "/logos/northeastern.webp",
        url: "https://news.northeastern.edu/2026/04/15/laurel-and-scroll-100-2026-inductees/",
        detail:
          "Named to Northeastern's top 100 graduating students out of 24,078, for embodying the university's mission.",
      },
      {
        title: "College of Engineering Outstanding Graduate Student Award",
        image: "/awards/coe-award.webp",
        logo: "/logos/northeastern.webp",
        url: "https://coe.northeastern.edu/news/2026-coe-outstanding-graduate-student-awards/",
        detail: "Selected from 6,826 College of Engineering students.",
      },
      {
        title: "MGEN Award",
        image: "/awards/mgen-award.webp",
        logo: "/logos/northeastern.webp",
        url: "https://www.linkedin.com/posts/northeastern-university-seis_mgenawards-northeasternuniversity-mgen-activity-7452071701410082816-QqSA",
        detail:
          "Multidisciplinary Graduate Engineering Award, recognizing standout graduate students for academic excellence.",
      },
    ],
  },
  {
    group: "Professional and community",
    items: [
      {
        title: "AWS All Builders Welcome Grant",
        image: "/awards/aws-grant.webp",
        logo: "/logos/aws.webp",
        detail: "One of 100 recipients globally, fully sponsored to AWS re:Invent 2025.",
      },
      {
        title: "Optum Bravo: Performance",
        image: "/awards/optum-bravo-performance.webp",
        logo: "/logos/optum.webp",
        detail: "Recognized for outstanding performance on the engineering team.",
      },
      {
        title: "Optum Bravo: Quality",
        image: "/awards/optum-bravo-quality.webp",
        logo: "/logos/optum.webp",
        detail: "Recognized for the quality of data engineering work delivered.",
      },
      {
        title: "Optum Bravo: Relationships",
        image: "/awards/optum-bravo-relationships.webp",
        logo: "/logos/optum.webp",
        detail: "Recognized for training and mentoring 50+ new hires in the Talent Development Program.",
      },
    ],
  },
];

export type Certification = {
  title: string;
  /** Exam code, where the credential has one. */
  code?: string;
  /** Issuer mark. Carried per record so certifications from different
   *  issuers cannot end up sharing one hardcoded logo. */
  logo: string;
};

export const CERTIFICATIONS: Certification[] = [
  {
    title: "AWS Certified Data Engineer, Associate",
    logo: "/logos/aws.webp",
  },
  {
    title: "AWS Certified Solutions Architect, Associate",
    logo: "/logos/aws.webp",
  },
  {
    title: "Microsoft Certified: Azure Data Fundamentals",
    code: "DP-900",
    logo: "/logos/azure.png",
  },
  {
    title: "Microsoft Certified: Azure Fundamentals",
    code: "AZ-900",
    logo: "/logos/azure.png",
  },
];
