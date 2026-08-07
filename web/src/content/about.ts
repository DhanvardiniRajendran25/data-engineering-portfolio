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
      "Supported a graduate course in Business Process Engineering spanning product management, supply chain strategy, and Agile, Lean, CI/CD, and DevOps delivery across 15 weeks of on-ground sessions.",
      "Guided student teams through product management deliverables: product vision, roadmaps, feature prioritization (MoSCoW, RICE, Kano), user story creation, and backlog ranking in Scrum simulations.",
      "Coached teams on supply chain and process-led analysis, mapping workflows, identifying inefficiencies, and evaluating IT logistics technologies (WMS, TMS, RFID, IoT, blockchain, AI).",
      "Graded quizzes, team projects, and exams against rubrics with written feedback, helping students translate goals into KPIs such as North Star, retention, churn, and engagement.",
      "Held office hours and collected attendance, resolving questions on Agile ceremonies, roadmaps, and metrics to keep the cohort on track.",
    ],
  },
  {
    org: "Optum, UnitedHealth Group",
    logo: "/logos/optum.webp",
    title: "Software Engineer, Health Plan Platforms",
    period: "Feb 2023 to Aug 2024",
    location: "Hyderabad, India",
    points: [
      "Delivered 10+ production ETL pipelines on Azure Databricks processing 4B+ pharmacy claims records, publishing Gold layer Delta tables consumed by 5+ downstream teams.",
      "Productionized a pharmaceutical supply chain intelligence platform, engineering 5+ production-grade PySpark pipelines from a proof of concept through to steady state operation.",
      "Reduced pipeline failure rate from 40% to 10% through root cause analysis, SQL rewrites, and multi-layered data quality gates across the platform.",
      "Built FastAPI and Django services and React interfaces that exposed curated datasets, metrics, and pipeline status to internal teams, replacing manual data pulls for teams supporting 5M+ health plan members.",
      "Mentored 70+ new joiners onto the data platform, onboarding them to Databricks, PySpark, and the team's data quality and code review standards.",
      "Wrote and tuned SQL for extraction and reporting, resolving recurring data gaps and unblocking analytics across member and claim level datasets.",
    ],
  },
  {
    org: "Optum, UnitedHealth Group",
    logo: "/logos/optum.webp",
    title: "Associate Software Engineer, Platform Reliability",
    period: "Jul 2022 to Feb 2023",
    location: "Hyderabad, India",
    points: [
      "Enhanced a multi-step execution framework in Python and PySpark with reconciliation, deduplication, and rerun-from-failed-step recovery, improving pipeline resilience.",
      "Cut post-release defects by 25% by authoring validation scenarios for pipeline and platform features across 10+ digital touchpoints.",
      "Deployed data assets across Azure Databricks workspaces through Unity Catalog with fine-grained access control and cross-workspace lineage tracking.",
      "Implemented SQL performance optimizations including predicate pushdown and selective aggregation on billion row Delta Lake datasets, cutting query runtime.",
      "Built Gold layer data products on Azure Databricks from member level and claim level pharmacy data using PySpark and SQL.",
      "Authored reusable PySpark components and pipeline templates that standardized ingestion across the team, reducing boilerplate for onboarding new data sources.",
    ],
  },
  {
    org: "National Institute of Technology, Tiruchirappalli",
    logo: "/logos/nit.webp",
    title: "Machine Learning Engineer",
    period: "Dec 2021 to Jul 2022",
    location: "Tiruchirappalli, India",
    points: [
      "Designed and trained NLP and ML models for two research systems, both published in Springer LNNS.",
      "Built KnowSOntoWSR, a QoS ontology-driven web service recommender using XGBoost and Twitter-based semantic similarity, reaching 95.94% accuracy and 95.93% F-measure.",
      "Developed QG-SKI, an NLP pipeline for question classification and MCQ generation using dynamic ontology construction over LOD Cloud and WikiData, TF-IDF, and semantic similarity measures (Shannon entropy, Jaccard, Normalized Google Distance), reaching 98.15% accuracy.",
      "Engineered end-to-end ML workflows spanning data collection, feature engineering, model training, and evaluation, benchmarking each against baseline models.",
      "Co-authored two peer-reviewed papers accepted at international conferences (ICIoTCT 2023, HIS 2023).",
    ],
  },
  {
    org: "SASTRA University",
    logo: "/logos/sastra.webp",
    title: "Undergraduate Research Assistant",
    period: "May 2020 to Jul 2022",
    location: "Thanjavur, India",
    points: [
      "Built a blockchain-enabled smart grid energy trading system implementing a dynamic auction mechanism with cryptographic authentication for secure, transparent electricity trading.",
      "Developed and tested Ethereum smart contracts using Solidity, Truffle, and Web3.js, integrating MetaMask for authenticated transactions.",
      "Conducted literature review and experimentation in applied ML and semantic web, contributing to research later published in Springer LNNS.",
      "Prepared datasets, ran experiments, and documented results to support peer-reviewed submissions and conference presentations.",
      "Collaborated with faculty and graduate researchers, iterating on methodology and presenting findings across the research cycle.",
    ],
  },
  {
    org: "Cognizant",
    logo: "/logos/cognizant.webp",
    title: "Software Engineer Intern, Full Stack Java",
    period: "Mar 2021 to Aug 2021",
    location: "Chennai, India",
    points: [
      "Built full stack Java features end to end, developing Spring Boot services and the React front end screens that consumed them, alongside senior engineers across multiple sprint releases.",
      "Designed and consumed REST APIs, wiring service and repository layers to relational databases with JPA and SQL.",
      "Built responsive UI in React with JavaScript, HTML, and CSS, integrating components with backend endpoints.",
      "Wrote unit and integration tests and resolved defects from QA and production tickets through root cause analysis.",
      "Worked in an Agile team with code reviews and Git version control, following the team's engineering and delivery standards.",
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
];

export const SKILL_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Languages and fundamentals",
    items: ["Python", "SQL", "PySpark", "Scala", "Java", "DSA"],
  },
  {
    label: "Data engineering",
    items: [
      "Spark",
      "Databricks",
      "Airflow",
      "Data Factory",
      "dbt",
      "Kafka",
      "Delta Lake",
      "Iceberg",
      "Medallion",
      "Dimensional modeling",
      "SCD Type 2",
      "Data quality gates",
    ],
  },
  {
    label: "Cloud and platforms",
    items: [
      "AWS",
      "S3",
      "Glue",
      "Redshift",
      "EMR",
      "Azure",
      "ADLS Gen2",
      "Synapse",
      "GCP",
      "BigQuery",
      "Snowflake",
      "PostgreSQL",
      "MongoDB",
    ],
  },
  {
    label: "AI and LLM systems",
    items: [
      "LangGraph",
      "LangChain",
      "RAG design",
      "Pinecone",
      "ChromaDB",
      "Multi-agent",
      "Evals and guardrails",
    ],
  },
  {
    label: "Analytics and visualization",
    items: ["Power BI", "Tableau", "QuickSight", "Streamlit", "Looker", "KPI design"],
  },
  {
    label: "DevOps and delivery",
    items: [
      "GitHub Actions",
      "Docker",
      "Terraform",
      "Azure DevOps",
      "CI/CD",
      "Unity Catalog",
    ],
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
    year: "2023",
    url: "https://link.springer.com/chapter/10.1007/978-981-19-9719-8_19",
  },
  {
    title:
      "QG-SKI: Question Classification and MCQ Question Generation Using Sequential Knowledge Induction",
    venue: "International Conference on Hybrid Intelligent Systems",
    publisher: "Springer",
    logo: "/logos/springer.webp",
    year: "2023",
    url: "https://link.springer.com/chapter/10.1007/978-3-031-27409-1_11",
  },
  {
    title: "Design, Development and Execution of Smart Contract: An Overview",
    venue: "International Conference on Computer Communication and Informatics",
    publisher: "IEEE",
    logo: "/logos/ieee.webp",
    year: "2023",
    url: "https://ieeexplore.ieee.org/abstract/document/10128536",
  },
  {
    title:
      "Development and Integration of dApp with Blockchain Smart Contract Truffle Framework for User Interactive Applications",
    venue: "International Conference on Computer Communication and Informatics",
    publisher: "IEEE",
    logo: "/logos/ieee.webp",
    year: "2023",
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
