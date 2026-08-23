/*
 * COALibrary.tsx — Vitum Lab
 * Displays all third-party Certificates of Analysis with PDF download links
 */

import { useMemo, useState } from "react";
import { FileText, ExternalLink, ShieldCheck, Search } from "lucide-react";
import { Link } from "wouter";
import SEO from "@/components/SEO";

const coas = [
  {
    product: "GLP-3 (R)",
    fullName: "GLP-3 (Retatrutide)",
    category: "Metabolic Research",
    batch: "9AXHAXN",
    reportNo: "IF-824-QSA-TR006-BTL26658-21",
    purity: "99.9%",
    purityNote: "*HPLC peptide purity (USP <621>)",
    date: "Jun. 09, 2026",
    lab: "BTLabs",
    test: "FTIR ID + HPLC Purity",
    matrix: "Powder",
    pdf: "/coa/Retatrutide_COA.pdf",
    slug: "glp3r",
    productSlug: "retatrutide",
    color: "bg-[#f5e8e0]",
    dot: "bg-red-400",
  },
  {
    product: "GHK-Cu",
    fullName: "GHK-Cu (Glycyl-L-histidyl-L-lysine Copper(II) Complex)",
    category: "Cosmetic / Tissue Research",
    batch: "2026001",
    reportNo: "VL 089-109A",
    purity: "99.02%",
    purityNote: null,
    date: "Mar. 27, 2026",
    lab: "Constitution Laboratories LLC",
    test: "HPLC Purity",
    matrix: "Powder",
    pdf: "/coa/GHKCU_COA.pdf",
    slug: "ghkcu",
    productSlug: "ghkcu",
    color: "bg-[#e0f0ec]",
    dot: "bg-emerald-400",
  },
  {
    product: "NAD+",
    fullName: "NAD+ (Nicotinamide Adenine Dinucleotide)",
    category: "Cellular Research",
    batch: "D006",
    reportNo: "2026-000042",
    purity: "99.2%",
    purityNote: "*purity calculated by area percent",
    date: "Jun. 04, 2026",
    lab: "Constitution Laboratories LLC",
    test: "HPLC Purity",
    matrix: "Lyophilized Powder",
    pdf: "/coa/NAD_COA.pdf",
    slug: "nad",
    productSlug: "nad",
    color: "bg-[#faeae0]",
    dot: "bg-orange-400",
  },
  {
    product: "BPC-157",
    fullName: "BPC-157 (Body Protection Compound-157, Pentadecapeptide)",
    category: "Tissue / Peptide Research",
    batch: "E014",
    reportNo: "2026-000042",
    purity: "99.5%",
    purityNote: "*purity calculated by area percent",
    date: "Jun. 04, 2026",
    lab: "Constitution Laboratories LLC",
    test: "HPLC Purity",
    matrix: "Lyophilized Powder",
    pdf: "/coa/BPC157_COA.pdf",
    slug: "bpc157",
    productSlug: "bpc157",
    color: "bg-[#e6ecf7]",
    dot: "bg-blue-400",
  },
  {
    product: "CJC-1295 + Ipamorelin",
    fullName: "CJC-1295 (No DAC / Mod GRF 1-29) + Ipamorelin Blend",
    category: "Metabolic / Endocrine Research",
    batch: "H007",
    reportNo: "2026-000042",
    purity: "99.4%",
    purityNote: "*purity calculated by area percent",
    date: "Jun. 04, 2026",
    lab: "Constitution Laboratories LLC",
    test: "HPLC Purity",
    matrix: "Lyophilized Powder",
    pdf: "/coa/CJCIPA_COA.pdf",
    slug: "cjc1295-ipamorelin",
    productSlug: "cjc1295-ipamorelin",
    color: "bg-[#e8ecdd]",
    dot: "bg-lime-500",
  },
  {
    product: "TB-500",
    fullName: "TB-500 (Thymosin Beta-4 Fragment)",
    category: "Tissue / Peptide Research",
    batch: "F008",
    reportNo: "2026-000042",
    purity: "99.2%",
    purityNote: "*purity calculated by area percent",
    date: "Jun. 04, 2026",
    lab: "Constitution Laboratories LLC",
    test: "HPLC Purity",
    matrix: "Lyophilized Powder",
    pdf: "/coa/TB500_COA.pdf",
    slug: "tb500",
    productSlug: "tb500",
    color: "bg-[#f5ecd6]",
    dot: "bg-amber-400",
  },
  {
    product: "MOTS-C",
    fullName: "MOTS-c (Mitochondrial-Derived Peptide)",
    category: "Cellular / Metabolic Research",
    batch: "J019",
    reportNo: "2026-000042",
    purity: "99.0%",
    purityNote: "*purity calculated by area percent",
    date: "Jun. 04, 2026",
    lab: "Constitution Laboratories LLC",
    test: "HPLC Purity",
    matrix: "Lyophilized Powder",
    pdf: "/coa/MOTSC_COA.pdf",
    slug: "motsc",
    productSlug: "motsc",
    color: "bg-[#e9e9ec]",
    dot: "bg-slate-400",
  },
  {
    product: "Tesamorelin",
    fullName: "Tesamorelin (GHRH(1-44) Analog, TH9507)",
    category: "Metabolic / Endocrine Research",
    batch: "G022",
    reportNo: "2026-000042",
    purity: "99.6%",
    purityNote: "*purity calculated by area percent",
    date: "Jun. 04, 2026",
    lab: "Constitution Laboratories LLC",
    test: "HPLC Purity",
    matrix: "Lyophilized Powder",
    pdf: "/coa/TESAMORELIN_COA.pdf",
    slug: "tesamorelin",
    productSlug: "tesamorelin",
    color: "bg-[#f6e3ef]",
    dot: "bg-pink-400",
  },
];

export default function COALibrary() {
  // The FAQ and About both tell customers they can search this library by
  // product, lot number and test date. Until now there was no search at all.
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coas;
    return coas.filter((c) =>
      [c.product, c.fullName, c.category, c.batch, c.reportNo, c.date, c.lab]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-page">
      <SEO
        title="COA Library"
        description="Third-party Certificates of Analysis for all Vitum Lab research peptides, issued by independent analytical laboratories."
      />

      {/* Header */}
      <div className="border-b border-[oklch(0.93_0.004_260)]">
        <div className="container py-10">
          <p className="section-label mb-2">Transparency</p>
          <h1 className="text-[2rem] font-bold text-[oklch(0.13_0.01_260)]">COA Library</h1>
          <p className="text-[oklch(0.52_0.01_260)] mt-2 text-[0.9375rem] max-w-xl">
            Every product is independently tested by a third-party analytical laboratory. Download the full Certificate of Analysis for each batch below.
          </p>

          {/* Lab badge */}
          <div className="mt-5 inline-flex items-center gap-2.5 bg-[oklch(0.97_0.003_260)] dark:bg-[oklch(0.19_0.02_260)] border border-[oklch(0.90_0.005_260)] dark:border-[oklch(0.26_0.02_260)] rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-[oklch(0.40_0.14_155)]" />
            <span className="text-[0.8125rem] font-semibold text-[oklch(0.30_0.01_260)] dark:text-[oklch(0.88_0.006_260)]">
              Independently third-party tested
            </span>
          </div>
        </div>
      </div>

      {/* COA Cards */}
      <div className="container py-12">
        {/* Search — by product, lot number or test date */}
        <div className="relative mb-6 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.58_0.01_260)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, lot number, or test date"
            aria-label="Search certificates by product, lot number, or test date"
            className="w-full min-h-11 rounded-full border border-[oklch(0.90_0.005_260)] dark:border-[oklch(0.28_0.02_260)] bg-white dark:bg-[oklch(0.17_0.02_260)] pl-10 pr-4 py-2.5 text-[0.875rem] text-[oklch(0.20_0.01_260)] dark:text-[oklch(0.90_0.006_260)] placeholder:text-[oklch(0.58_0.01_260)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.40_0.16_260)]"
          />
        </div>

        {shown.length === 0 && (
          <p className="text-[0.875rem] text-[oklch(0.52_0.01_260)] py-6">
            No certificates match “{query}”. Try a product name, a lot number, or a report date.
          </p>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <div
              key={c.slug}
              id={c.slug}
              className="scroll-mt-28 border border-[oklch(0.91_0.004_260)] rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
            >
              {/* Colored top strip */}
              <div className={`${c.color} px-6 py-5 flex items-center gap-3`}>
                <span className={`w-2.5 h-2.5 rounded-full ${c.dot} flex-shrink-0`} />
                <div>
                  <p className="font-bold text-[oklch(0.13_0.01_260)] text-[1rem]">{c.product}</p>
                  <p className="text-[0.75rem] text-[oklch(0.45_0.01_260)]">{c.category}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[1.25rem] font-bold text-[oklch(0.13_0.01_260)]">{c.purity}</p>
                  <p className="text-[0.7rem] text-[oklch(0.50_0.01_260)]">Purity</p>
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-5 flex-1 flex flex-col gap-3">
                <table className="w-full text-[0.8125rem]">
                  <tbody className="divide-y divide-[oklch(0.93_0.004_260)]">
                    {[
                      ["Batch #", c.batch],
                      ["Report No.", c.reportNo],
                      ["Report Date", c.date],
                      ["Laboratory", c.lab],
                      ["Test Method", c.test],
                      ["Matrix", c.matrix],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td className="py-2 text-[oklch(0.52_0.01_260)] font-medium w-[45%]">{label}</td>
                        <td className="py-2 text-[oklch(0.20_0.01_260)] font-semibold text-right">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {c.purityNote && (
                  <p className="text-[0.75rem] text-[oklch(0.55_0.01_260)] italic">{c.purityNote}</p>
                )}

                <div className="mt-auto pt-3 flex flex-col gap-2">
                  <a
                    href={c.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[oklch(0.13_0.01_260)] dark:bg-[oklch(0.40_0.16_260)] text-white text-[0.875rem] font-semibold hover:bg-[oklch(0.22_0.01_260)] dark:hover:bg-[oklch(0.35_0.16_260)] transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Download COA (PDF)
                  </a>
                  <Link
                    href={`/shop/${c.productSlug}`}
                    className="flex items-center justify-center gap-1.5 text-[0.8125rem] font-semibold text-[oklch(0.52_0.01_260)] hover:text-[oklch(0.13_0.01_260)] dark:hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Product
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 bg-[oklch(0.975_0.003_260)] rounded-2xl px-6 py-5 text-[0.8125rem] text-[oklch(0.50_0.01_260)] leading-relaxed max-w-3xl">
          <strong className="text-[oklch(0.30_0.01_260)]">Note:</strong> Every COA is issued by an independent third-party analytical laboratory — the issuing lab is named on each card above and on the certificate itself. Where a certificate was commissioned by a supplier rather than by us, the commissioning party is named on the document. Certificates relate only to the specific batch tested and may not be reproduced without written approval. All products are for in vitro / laboratory research use only — not for human or veterinary consumption.
        </div>
      </div>
    </div>
  );
}
