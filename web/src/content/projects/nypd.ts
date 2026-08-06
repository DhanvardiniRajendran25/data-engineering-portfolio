/**
 * NYPD Crime Analytics deep-dive content.
 *
 * SOURCE: transcribed from the project README. Insight figures, dimension names,
 * SCD choices and the tool list are as documented there.
 */

export type Stat = { value: string; label: string };

export const SCALE: Stat[] = [
  { value: "7", label: "Dimensions" },
  { value: "1", label: "Fact grain" },
  { value: "SCD2", label: "History tracked" },
  { value: "2018", label: "Data since" },
  { value: "6", label: "Pipeline stages" },
  { value: "2024", label: "Delivered" },
];

/** Real figures from the dashboard, as documented. */
export const INSIGHTS = [
  { value: "152,034", label: "Arrests, ages 25 to 44", note: "largest age group" },
  { value: "122,049", label: "Largest race category", note: "of the recorded distribution" },
  { value: "72,325", label: "Brooklyn arrests", note: "highest borough" },
  { value: "22,957", label: "Peak month", note: "August 2024" },
  { value: "9,887", label: "Precinct 14", note: "highest single precinct" },
];

export const TOP_OFFENCES = [
  "Assault 3 and related",
  "Petit larceny",
  "Felony assault",
  "Dangerous drugs",
];

/** The star schema, as modelled in ER/Studio. */
export const DIMENSIONS = [
  { name: "DIM_DATE", detail: "Calendar attributes: day, week, month, year", scd: null },
  { name: "DIM_BOROUGH", detail: "Borough lookup, codes standardised in Alteryx", scd: null },
  { name: "DIM_PRECINCT", detail: "Precinct lookup for hotspot analysis", scd: null },
  { name: "DIM_LOCATION", detail: "Geography, with validity date ranges", scd: "Type 2" },
  { name: "DIM_OFFENSE", detail: "Offense description and level", scd: null },
  { name: "DIM_LAW", detail: "Law category code", scd: null },
  { name: "DIM_PERPETRATOR", detail: "Age group, race, sex, tracked historically", scd: "Type 2" },
];

export const FACT = {
  name: "FACT_ARRESTS",
  grain: "One row per arrest event, keyed on ARREST_KEY",
};

export type Stage = {
  id: string;
  step: string;
  title: string;
  tool: string;
  facts: string[];
  decision: { chose: string; over: string[]; because: string[]; cost: string };
  output: { value: string; label: string }[];
};

export const STAGES: Stage[] = [
  {
    id: "profile",
    step: "01",
    title: "Profile",
    tool: "Python · ydata-profiling",
    facts: [
      "Missing LAW_CAT_CD values found",
      "Inconsistent age group formats",
      "Geolocation gaps",
      "Automated HTML profile report",
    ],
    decision: {
      chose: "Profile before modelling",
      over: ["Model from the published column list"],
      because: [
        "Open data documentation and actual values disagree",
        "Missing law category decides whether DIM_LAW can be NOT NULL",
        "Geolocation gaps decide whether location can be a conformed key",
      ],
      cost: "A pass that produces no user-facing output.",
    },
    output: [{ value: "1", label: "profile report" }],
  },
  {
    id: "model",
    step: "02",
    title: "Model",
    tool: "ER/Studio · star schema",
    facts: [
      "FACT_ARRESTS at arrest-event grain",
      "7 dimensions",
      "Surrogate keys with natural keys retained",
      "SCD Type 2 on location and perpetrator",
    ],
    decision: {
      chose: "SCD Type 2 on location and perpetrator",
      over: ["Type 1 overwrite everywhere"],
      because: [
        "Precinct boundaries and demographic coding change over time",
        "Type 1 would silently rewrite history and break year-over-year comparisons",
        "Validity date ranges keep an arrest attributed to the geography it happened in",
      ],
      cost: "Every dimension read needs a validity predicate, and rows multiply per change.",
    },
    output: [
      { value: "7", label: "dimensions" },
      { value: "2", label: "SCD2 dimensions" },
    ],
  },
  {
    id: "clean",
    step: "03",
    title: "Clean",
    tool: "Alteryx",
    facts: [
      "Borough codes standardised",
      "Age, race and gender normalised",
      "Dates parsed to day, week, month, year",
      "Missing values handled by rule",
    ],
    decision: {
      chose: "Deterministic rules in Alteryx",
      over: ["Ad-hoc cleaning in notebooks"],
      because: [
        "The same input must always produce the same output",
        "Rules are inspectable by someone who does not read Python",
        "A reload reproduces the identical result",
      ],
      cost: "Logic lives in a visual tool rather than in version-controlled code.",
    },
    output: [{ value: "4", label: "standardisation rules" }],
  },
  {
    id: "orchestrate",
    step: "04",
    title: "Orchestrate",
    tool: "Azure Data Factory",
    facts: [
      "Parameterised pipelines",
      "Incremental loads, not full refresh",
      "Error handling and monitoring",
      "Landing and staging in Azure Data Lake",
    ],
    decision: {
      chose: "Incremental and parameterised",
      over: ["Full reload on every run"],
      because: [
        "The source is year-to-date and grows continuously",
        "One parameterised pipeline serves every dimension instead of one each",
        "A failed run resumes rather than restarting",
      ],
      cost: "Watermark state to manage, and a subtle watermark bug can skip rows silently.",
    },
    output: [{ value: "Incremental", label: "load pattern" }],
  },
  {
    id: "warehouse",
    step: "05",
    title: "Warehouse",
    tool: "Snowflake · MERGE",
    facts: [
      "Fact and dimension tables",
      "MERGE for SCD Type 1 and Type 2",
      "Referential integrity checks in DBeaver",
      "Null and conformance validation",
    ],
    decision: {
      chose: "MERGE rather than delete and insert",
      over: ["Truncate and reload the dimension"],
      because: [
        "Truncating destroys the surrogate keys the fact table points at",
        "MERGE expires the old row and inserts the new one atomically",
        "It is the only pattern that makes Type 2 correct",
      ],
      cost: "MERGE statements are long and easy to get subtly wrong; they need their own tests.",
    },
    output: [
      { value: "MERGE", label: "SCD load" },
      { value: "3", label: "validation classes" },
    ],
  },
  {
    id: "bi",
    step: "06",
    title: "Serve",
    tool: "Power BI and Tableau",
    facts: [
      "Time patterns: daily, weekly, monthly, yearly",
      "Borough and precinct hotspot heatmaps",
      "Offense and law category distribution",
      "Demographics by age group, race, sex",
    ],
    decision: {
      chose: "Build in both Power BI and Tableau",
      over: ["Pick one and standardise"],
      because: [
        "The same star schema had to prove it serves either tool",
        "A model that only works in one BI tool is coupled to that tool",
      ],
      cost: "Two dashboards to keep in sync when the model changes.",
    },
    output: [{ value: "4", label: "analysis themes" }],
  },
];

export const TECH_STACK: { group: string; items: string[] }[] = [
  { group: "Orchestration", items: ["Azure Data Factory", "Azure Data Lake", "Incremental loads"] },
  { group: "Warehouse", items: ["Snowflake", "SnowSQL", "MERGE", "SCD Type 1 and 2"] },
  { group: "Modelling", items: ["ER/Studio", "Star schema", "Surrogate keys"] },
  { group: "Transformation", items: ["Alteryx", "Python", "ydata-profiling"] },
  { group: "Validation", items: ["DBeaver", "Referential integrity checks"] },
  { group: "Serving", items: ["Power BI", "Tableau"] },
];
