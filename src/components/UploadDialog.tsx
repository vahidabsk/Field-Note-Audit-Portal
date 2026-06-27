import { FileText, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import type { ParsedCertificate } from "../lib/audit-storage";
import { toast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

type EditableField = Exclude<keyof ParsedCertificate, "fileName" | "uploadedAt" | "deviceCounts">;

const EDITABLE_FIELDS: EditableField[] = [
  "certificateNumber",
  "certificateType",
  "fileNo",
  "ccn",
  "issuedDate",
  "revisedDate",
  "propertyName",
  "propertyAddress",
  "ascName",
  "ascAddress",
  "areaCovered",
  "ahj",
  "respondingFD",
  "standardReferenced",
  "coverageType",
  "systemDeviations",
  "controlUnitMfr",
  "controlUnitModel",
  "signalTransmitterMfr",
  "signalTransmitterModel",
  "primaryTransmission",
  "retransmission",
  "centralStation",
  "centralStationAddress",
  "centralStationFile",
  "testingContractDate",
];

export function UploadDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Upload Certificate",
  initialFiles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (certs: ParsedCertificate[]) => void;
  title?: string;
  initialFiles?: File[] | null;
}) {
  const [certs, setCerts] = useState<ParsedCertificate[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const processFiles = (files: FileList | File[]) => {
    const docxFiles = Array.from(files).filter((file) =>
      file.name.toLowerCase().endsWith(".docx"),
    );

    if (!docxFiles.length) {
      toast({
        title: "Unsupported files",
        description: "Upload .docx files only.",
        variant: "destructive",
      });
      return;
    }

    const next: ParsedCertificate[] = docxFiles.map((file) => ({
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    }));

    setCerts(next);

    toast({
      title: "Manual review ready",
      description:
        "Automatic field detection is temporarily disabled for reliability. Fill the review form manually, then confirm.",
    });
  };

  // If files were drag-dropped before opening the dialog
  if (open && initialFiles && initialFiles.length > 0 && certs.length === 0) {
    processFiles(initialFiles);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setCerts([]);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div
            className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              processFiles(e.dataTransfer.files);
            }}
          >
            <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
            <div className="mt-3 text-base font-semibold text-slate-800">
              Drag &amp; drop .docx
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Upload a DOCX certificate and review/edit fields before creating the audit.
            </div>

            <Button
              className="mt-4"
              variant="outline"
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </Button>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".docx"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  processFiles(e.target.files);
                }
              }}
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Automatic field extraction is temporarily disabled so the review dialog does not hang.
            You can still create audits by entering the fields manually below.
          </div>

          {certs.length > 0 ? (
            <div className="space-y-4">
              {certs.map((cert, index) => (
                <div key={index} className="rounded-xl border p-4">
                  <div className="mb-4 flex items-center gap-2 font-medium text-slate-900">
                    <FileText className="h-4 w-4" />
                    {cert.fileName}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {EDITABLE_FIELDS.map((field) => (
                      <div key={field}>
                        <Label>{field}</Label>
                        <Input
                          value={cert[field] ?? ""}
                          onChange={(e) =>
                            setCerts((prev) =>
                              prev.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, [field]: e.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid gap-3 md:grid-cols-4">
                    {Object.entries(cert.deviceCounts ?? {}).map(([k, v]) => (
                      <div key={k}>
                        <Label>{k}</Label>
                        <Input
                          type="number"
                          value={v ?? ""}
                          onChange={(e) =>
                            setCerts((prev) =>
                              prev.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      deviceCounts: {
                                        ...(item.deviceCounts ?? {}),
                                        [k]: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      },
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              setCerts([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="accent"
            type="button"
            disabled={certs.length === 0}
            onClick={() => {
              onConfirm(certs);
              setCerts([]);
              onOpenChange(false);
            }}
          >
            Confirm review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
