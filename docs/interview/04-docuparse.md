# DocuParse

**SEC document intelligence pipeline: Detectron2, LayoutLMv3, Docling, DVC.**
The project to lead with for ML-on-unstructured-data roles, and the one with the
cleanest build-versus-buy argument in the set, because the alternative was priced
rather than hand-waved.

---

## Pitch ladder

### 20 seconds
> A document intelligence pipeline for SEC filings. Detectron2 finds table
> regions, LayoutLMv3 reads structure, and 676 pages process in about three
> minutes at $1.05 per thousand pages against a cloud floor of $1.50. I priced
> the build-versus-buy rather than asserting it.

### 2 minutes
> Six DVC-orchestrated stages. It pulls 10-K, 10-Q and 8-K filings from EDGAR,
> content-hashes them so re-runs are no-ops, then extracts text natively first
> and only falls back to OCR where there is no text layer. 99.56% needed no OCR
> at all, which matters because running OCR over a clean text layer *introduces*
> errors rather than removing them.
>
> Table handling is the interesting part. Camelot handles ruled tables, pdfplumber
> handles whitespace-aligned ones, and financial filings contain both in the same
> document. Then two models in sequence: Detectron2 finds where tables are but
> knows nothing about cell content, LayoutLMv3 understands structure but needs
> spatial coordinates as input. Neither alone parses a merged-cell table
> correctly.
>
> Output is validated against 2,954 XBRL concepts from the authoritative filings,
> so correctness is checked against ground truth rather than asserted.

### 10 minutes
Walk the six stages, then the cost model, then the validation strategy.

---

## The problem

SEC filings are a genuinely hard document class:

| Property | Why it hurts |
|---|---|
| Merged cells, row and column spans | naive extraction produces misaligned rows |
| Multi-column layouts | reading order is not top-to-bottom |
| Nested tables | a table inside a table cell |
| Mixed ruled and whitespace-aligned tables | no single library handles both |
| Financial precision matters | a shifted decimal is a material error |
| Hundreds of pages per filing | manual review does not scale |

**The framing:** the output feeds financial analysis, so a table parsed with one
column misaligned is worse than no table at all, because it looks correct.

---

## Architecture

```
01 DOWNLOAD      SEC EDGAR API        10-K / 10-Q / 8-K, content-hashed
02 TEXT          native -> OCR        99.56% native, WER tracked
03 TABLES        Camelot + pdfplumber hybrid detection, 187 tables
04 LAYOUT        Detectron2 -> LayoutLMv3   regions, then structure
05 UNDERSTAND    Docling (IBM)        benchmarked head to head
06 EXPORT        JSON / MD / CSV      + XBRL cross-validation
                                       ^
                        all six orchestrated by DVC with params.yaml
```

---

## Decisions

### D1. Content-hash the source

**Chose** DVC content hash gates re-download. **Over** re-downloading every run.
**Because** filings are immutable once published, so a hash check turns a network
fetch into a no-op. **Cost:** a stale hash would silently skip a genuinely changed
filing.

> **Follow-up: "Filings get amended though."**
> Correct, and that is precisely the stated cost. Amendments arrive as separate
> accession numbers (10-K/A), so in practice a new filing is a new hash. The
> failure case would be an in-place republication under the same accession, which
> EDGAR does not normally do but which the design assumes away.

### D2. Native text first, OCR as fallback

**Chose** read the PDF text layer, OCR only where none exists. **Over** OCR
everything for consistency.
**Because** SEC filings are mostly born-digital so a text layer already exists,
and **OCR on a clean text layer introduces errors rather than removing them.**
99.56% needed no OCR at all.
**Cost:** two code paths to maintain instead of one.

**This is the counter-intuitive decision worth leading with.** The naive
assumption is that OCR is more thorough. It is the opposite: OCR is a lossy
re-derivation of information you already have exactly.

### D3. Two table libraries, not one

**Chose** Camelot and pdfplumber in combination. **Over** either alone.
**Because** Camelot handles ruled tables, pdfplumber handles whitespace-aligned
ones, and financial filings contain both in the same document.
**Cost:** duplicate candidates to reconcile before export.

> **Follow-up: "How do you reconcile duplicates?"**
> Be honest about the level of detail you can defend: candidates are matched on
> page and bounding-box overlap, and the parse with the more coherent structure
> wins. If you cannot recall the exact rule, say so and describe the shape rather
> than inventing a threshold.

### D4. Detectron2 and LayoutLMv3 in sequence

**Chose** both models chained. **Over** Detectron2 alone, LayoutLMv3 alone, or a
pure text extractor.
**Because** Detectron2 finds *where* tables are but knows nothing about cell
content; LayoutLMv3 understands structure but needs spatial coordinates as input;
neither alone produces an accurate parse of a merged-cell table.
**Cost:** two models to load, version and run per page.

Detectron2 also classifies title, section header, body, figure and caption, so the
layout stage produces document structure, not just table boxes.

> **Follow-up: "What is LayoutLMv3 actually doing that a text model cannot?"**
> It is multimodal: it embeds text tokens together with their 2D bounding-box
> positions and, in v3, image patches. So it can learn that a number sitting in a
> column under a header belongs to that header even when there is no delimiter.
> A pure text model sees a flat token stream and loses the spatial relationship
> that defines the table.

### D5. Benchmark against Docling rather than trusting the custom path

**Chose** run IBM's Docling alongside and compare. **Over** trusting one approach.
**Because** a benchmark against an enterprise tool is the only way to know whether
custom work was justified, and the comparison is a deliverable rather than an
internal note.
**Cost:** two pipelines producing overlapping output.

Written up in `reports/docling_vs_custom_comparison.md`.

**This is a maturity signal.** Most projects justify their own existence.
Benchmarking against the thing that might replace you is the opposite instinct.

### D6. Three export formats at write time

**Chose** JSON, Markdown and CSV. **Over** JSON only with later conversion.
**Because** downstream Python wants JSON, LLM summarisation wants Markdown where
pipe-delimited tables are the norm, and analysts want CSV. Conversion cost is
negligible next to detection and parsing.
**Cost:** three artefacts per table to keep consistent.

Each file tagged with filing ID and page number for traceability.

---

## The cost argument

| Service | $ per 1,000 pages |
|---|---|
| Azure Form Recognizer | 10.00 to 50.00 |
| Google Document AI | 1.50 to 50.00 |
| AWS Textract | 1.50 to 50.00 |
| **DocuParse** | **1.05** |

30 to 98% saving. And three things the saving is not about:

1. **Complete data privacy** — nothing leaves the environment
2. **No API rate limits**
3. **Optimised for financial documents specifically**

> **Follow-up: "Your $1.05 does not include your time. Cloud APIs would have
> taken a day."**
> Fair, and the honest answer is a threshold: at low volume the managed service
> wins on total cost including engineering time, and the crossover is somewhere in
> the tens of thousands of pages. What does not have a crossover is privacy. If
> the documents cannot leave the environment, the managed service is not an option
> at any price, and that is the argument that actually holds for regulated
> financial data.

**Notice this is the opposite call from SAGE**, where you sent queries to GPT-4o.
Being able to explain why the two differ, document volume and data sensitivity,
is stronger than either decision alone.

---

## Quality assurance

| Mechanism | What it catches |
|---|---|
| XBRL validation | extracted values cross-checked against authoritative filings |
| Accuracy metrics | Word Error Rate, table precision and recall |
| Regression testing | automated quality thresholds on every run |
| Distribution monitoring | drift and anomalies between runs |

**2,954 XBRL concepts validated.** This is the strongest quality claim in the
project: XBRL is the machine-readable version of the same financial data, filed
by the company itself, so it is genuine ground truth rather than a proxy.

> **Follow-up: "If XBRL already has the numbers, why parse the PDF at all?"**
> Excellent question and you should welcome it. XBRL covers tagged financial
> concepts, not the full document: narrative sections, footnotes, tables that are
> not part of the tagged statements, and older filings with partial tagging are
> all outside it. XBRL is the right *validator* precisely because it overlaps
> without being a superset. Using it to check the parse is the correct use; using
> it as the source would lose most of the document.

---

## Numbers

| | |
|---|---|
| Pages processed | 676 |
| End to end | ~3 minutes **(VERIFY: on what hardware?)** |
| Native text extraction | 99.56% |
| Tables extracted | 187 |
| XBRL concepts validated | 2,954 |
| Cost per 1,000 pages | $1.05 |
| Pipeline stages | 6 |
| Filing types | 3 |

---

## DVC, and why it matters here

DVC gives content-addressed data versioning plus a declarative stage graph in
`params.yaml`. Change a parameter, and only the stages downstream of it re-run.

> **Follow-up: "Why DVC and not Airflow?"**
> Different jobs. Airflow schedules and orchestrates across systems on a clock.
> DVC versions data and models and reproduces a pipeline deterministically from a
> content hash. This is a reproducibility problem, not a scheduling problem: there
> is no recurring trigger, and what matters is that a given input always yields
> the same output and that changing one parameter does not re-run the whole graph.
> If it needed to run nightly against new filings, Airflow would sit *above* DVC
> rather than replace it.

**This is a strong answer** because it distinguishes two tools people conflate.

---

## Anticipated questions

**"How do you know 99.56% is good? Compared to what?"**
It is a coverage figure, not an accuracy figure, and worth saying so plainly: it
means 99.56% of pages had a usable text layer, so OCR error was avoided rather
than corrected. The accuracy claim rests on WER and XBRL validation, not on that
number.

**"What happens on a scanned filing?"**
It falls to OCR and WER rises. That path exists but is exercised on 0.44% of
pages, so it is the least-tested code in the pipeline, which is the honest risk.

**"Detectron2 is heavy. Is that justified for table detection?"**
At 676 pages in three minutes, yes. At a million pages you would distil to a
lighter detector or crop to candidate regions first. The model choice is a
function of volume, and this volume did not force the optimisation.

**"How would you productionise this?"**
Airflow above DVC for scheduling, a queue between download and processing so one
slow filing does not block the batch, model versions pinned and served rather than
loaded per run, and the regression thresholds promoted from warnings to gates.

**"What is the weakest part?"**
The OCR fallback path, because it is barely exercised, and duplicate table
reconciliation, because it is heuristic rather than measured.

---

## Adjacent theory

- Layout analysis: object detection applied to documents
- Multimodal transformers: text plus 2D position plus image patches
- OCR error characteristics and why WER matters
- Table structure recognition: merged cells, spans, nested tables
- Build vs buy, and the role of data sensitivity (fundamentals §10)
- DVC vs Airflow vs Make: reproducibility against scheduling
- XBRL and structured financial reporting

---

## Gaps to concede

- OCR path lightly exercised
- Duplicate table reconciliation is heuristic
- Timing figure lacks a stated hardware baseline **(VERIFY)**
- Two overlapping pipelines to maintain
- Cost model excludes engineering time
