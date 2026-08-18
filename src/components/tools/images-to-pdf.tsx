"use client";

import { useState } from "react";
import { RefreshCw, FileDown, Image as ImageIcon } from "lucide-react";
import FileUploader from "../upload/FileUploader";
import SortableList from "../upload/SortableList";
import { useImageFiles } from "@/lib/useImageFiles";
import { imagesToPdf } from "@/lib/pdf";
import { fileToDataUrl, stripExtension, downloadBlob, formatBytes, uid } from "@/lib/utils";
import { useToast } from "../ui/Toast";
import { Button, ProgressBar } from "../ui/feedback";
import { Field, Select, Slider } from "../ui/form";

function ImagesToPdf({ accept, formats, label }: { accept: string; formats: string[]; label: string }) {
  const { entries, addFiles, remove, reorder, clear } = useImageFiles(30);
  const { toast } = useToast();
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(24);
  const [quality, setQuality] = useState(85);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const convert = async () => {
    if (entries.length === 0) {
      toast(`Please add at least one ${label} image first.`, "error");
      return;
    }
    setProcessing(true);
    setProgress(10);
    try {
      const prepared = await Promise.all(
        entries.map(async (entry, i) => {
          setProgress(10 + Math.round((i / entries.length) * 60));
          return { dataUrl: entry.dataUrl, name: entry.name };
        })
      );
      setProgress(75);
      const blob = await imagesToPdf(prepared, {
        pageSize: pageSize as never,
        orientation,
        margin,
        quality: quality / 100,
      });
      setProgress(100);
      downloadBlob(blob, `${label.toLowerCase()}-to-pdf.pdf`);
      toast("PDF created and downloaded", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "We couldn't create the PDF. Please try again.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <FileUploader
        accept={accept}
        formats={formats}
        multiple
        maxFiles={30}
        onFiles={(files) => addFiles(files)}
        disabled={processing}
      />

      {entries.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Your images — drag to set page order
          </h3>
          <SortableList
            items={entries.map((e) => ({ id: e.id, name: e.name, thumbnail: e.dataUrl }))}
            onReorder={reorder}
            onRemove={remove}
            getMeta={(item) => formatBytes(entries.find((e) => e.id === item.id)?.size ?? 0)}
            renderThumbnail={(item) => (
              <img src={item.thumbnail} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
            )}
          />
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Page size" htmlFor="page-size">
              <Select id="page-size" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="a3">A3</option>
                <option value="a5">A5</option>
                <option value="legal">Legal</option>
              </Select>
            </Field>
            <Field label="Orientation" htmlFor="orientation">
              <Select id="orientation" value={orientation} onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")}>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
            </Field>
            <div className="w-44">
              <Slider label="Margins" value={margin} min={0} max={72} unit="pt" onChange={setMargin} />
            </div>
            <div className="w-44">
              <Slider label="Image quality" value={quality} min={50} max={100} unit="%" onChange={setQuality} display={`${quality}%`} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={convert} loading={processing} icon={<FileDown className="h-4 w-4" />}>
              Convert to PDF
            </Button>
            <Button variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={clear}>
              Reset
            </Button>
          </div>
          {processing && <ProgressBar value={progress} label="Building your PDF…" />}
        </div>
      )}
    </div>
  );
}

export function JpgToPdf() {
  return <ImagesToPdf accept=".jpg,.jpeg" formats={["JPG", "JPEG"]} label="JPG" />;
}

export function PngToPdf() {
  return <ImagesToPdf accept=".png" formats={["PNG"]} label="PNG" />;
}
