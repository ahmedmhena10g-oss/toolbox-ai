import { downloadBlob, loadJszip } from "./utils";

export const downloadTxt = (text: string, filename: string): void => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, filename.endsWith(".txt") ? filename : `${filename}.txt`);
};

/** Build a minimal, valid .docx (WordprocessingML) from plain text. */
export const downloadDocx = async (text: string, filename: string): Promise<void> => {
  const JSZip = await loadJszip();
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );
  const paragraphs = text
    .split("\n")
    .map(
      (line) =>
        `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`
    )
    .join("");
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${paragraphs}<w:sectPr/></w:body>
</w:document>`
  );
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, filename.endsWith(".docx") ? filename : `${filename}.docx`);
};

const escapeXml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const downloadTextPdf = async (text: string, filename: string): Promise<void> => {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  const margin = 16;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const lines = text.split("\n");
  pdf.setFontSize(11);
  for (const line of lines) {
    if (line.trim() === "") {
      y += 6;
      continue;
    }
    const wrapped = pdf.splitTextToSize(line, maxWidth) as string[];
    for (const piece of wrapped) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(piece, margin, y);
      y += 6.5;
    }
  }
  const blob = pdf.output("blob");
  downloadBlob(blob, filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
};
