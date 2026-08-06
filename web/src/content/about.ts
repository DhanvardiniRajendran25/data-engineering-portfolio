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
    title: "Graduate Teaching Assistant, Advanced Business Process Engineering",
    period: "Jan 2026 to May 2026",
    location: "Boston, MA",
    points: [
      "Taught and mentored 70+ graduate students under Prof. Shannon Pettiford, Director of Product Management at BCG.",
      "Led sessions on current-state process analysis, workflow automation, and future-state system design.",
      "Coached student teams through problem framing, feasibility analysis, and presenting recommendations to technical and business audiences.",
    ],
  },
  {
    org: "Optum, UnitedHealth Group",
    logo: "/logos/optum.webp",
    title: "Software Engineer",
    period: "Feb 2023 to Aug 2024",
    location: "Hyderabad, India",
    points: [
      "Designed and delivered 10+ ETL pipelines on Azure Databricks processing 4B+ records, publishing enriched data products consumed by 5+ downstream teams.",
      "Reduced pipeline failure rate from 40% to 10% through root cause analysis, SQL query optimization, and embedded data quality gates covering reconciliation, deduplication, and null validation.",
      "Productionized an enterprise analytics platform, engineering 5+ production-grade PySpark pipelines with window functions, deduplication, and multi-table joins from a POC handoff.",
      "Built recurring KPI dashboards in Power BI and Tableau, surfacing performance trends and anomalies for leadership.",
    ],
  },
  {
    org: "Optum, UnitedHealth Group",
    logo: "/logos/optum.webp",
    title: "Associate Software Engineer",
    period: "May 2022 to Feb 2023",
    location: "Hyderabad, India",
    points: [
      "Enhanced the internal execution framework with step sequencing, reconciliation, and automated recovery, enabling deterministic pipeline restarts.",
      "Deployed data assets across multiple Azure Databricks workspaces using Unity Catalog, with fine-grained access control and three-tier namespace governance.",
    ],
  },
  {
    org: "National Institute of Technology, Tiruchirappalli",
    logo: "/logos/nit.webp",
    title: "Machine Learning Engineer",
    period: "Dec 2021 to Jul 2022",
    location: "Tiruchirappalli, India",
    points: [
      "Scoped open-ended research questions into defined ML problems with clear success criteria.",
      "Built and evaluated models end to end, then translated results into plain language for non-technical audiences.",
    ],
  },
  {
    org: "SASTRA University",
    logo: "/logos/sastra.webp",
    title: "Undergraduate Research Assistant",
    period: "May 2020 to Jul 2022",
    location: "Thanjavur, India",
    points: [
      "Drove research projects from problem definition to published results, contributing to four IEEE and Springer papers.",
      "Turned literature and data into sharp problem statements and testable hypotheses.",
    ],
  },
  {
    org: "Cognizant",
    logo: "/logos/cognizant.webp",
    title: "Software Engineer Intern",
    period: "Mar 2021 to Aug 2021",
    location: "Chennai, India",
    points: [
      "Built backend features in Java and Spring Boot alongside senior engineers, delivering against sprint commitments across multiple release cycles.",
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
      "Led strategy and operations for a community of 1,500+ builders and technologists.",
      "Headlined the flagship annual conference with 2,000+ attendees and directed a 20-person team running hackathons engaging 400+ teams.",
      "Scaled the community with 45+ events and brought in 70+ industry leaders from Microsoft, Google, and Amazon as mentors and speakers.",
    ],
  },
  {
    org: "Startup Boston",
    logo: "/logos/startup-boston.webp",
    title: "Program Management",
    period: "Sep 2024 to Dec 2024",
    location: "Boston, MA",
    points: [
      "Volunteered in program management for Startup Boston Week within 10 days of arriving in the US, hosting and emceeing 20+ sessions.",
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
