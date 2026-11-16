import React from "react";
import type { Waiver } from "../data/rsvpWaivers";

// How close (in px) to the bottom counts as "scrolled to the end", to allow
// for sub-pixel rounding and zoom levels.
const SCROLL_END_TOLERANCE = 8;

type PdfState = "loading" | "ready" | "error";

// Renders every page of a PDF as a canvas inside `container`. pdf.js is
// loaded on demand so it isn't part of the dashboard bundle.
const renderPdf = async (
  url: string,
  container: HTMLDivElement,
  isCancelled: () => boolean,
) => {
  // Importing the worker module registers it on globalThis, so pdf.js parses
  // on the main thread. The waivers are a few pages, so this is fast enough
  // and avoids having to serve a separate worker file.
  const [pdfjs] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs"),
  ]);

  const loadingTask = pdfjs.getDocument({ url });
  try {
    const pdf = await loadingTask.promise;
    const pixelRatio = window.devicePixelRatio || 1;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      if (isCancelled()) return;
      const page = await pdf.getPage(pageNumber);
      // Scale the page to the container width, rendering at device
      // resolution so the text stays sharp.
      const cssScale =
        container.clientWidth / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale: cssScale * pixelRatio });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.className = "block w-full h-auto bg-white";
      canvas.setAttribute(
        "aria-label",
        `Page ${pageNumber} of ${pdf.numPages}`,
      );
      await page.render({ canvas, viewport }).promise;
      if (isCancelled()) return;
      container.appendChild(canvas);
    }
  } finally {
    await loadingTask.destroy();
  }
};

type WaiverDialogProps = {
  waiver: Waiver | null;
  onAccept: (waiverId: string) => void;
  onClose: () => void;
};

// Shows a waiver PDF in a modal. Accept stays disabled until the hacker has
// scrolled to the bottom of the document.
const WaiverDialog = ({ waiver, onAccept, onClose }: WaiverDialogProps) => {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const pagesRef = React.useRef<HTMLDivElement | null>(null);
  const [pdfState, setPdfState] = React.useState<PdfState>("loading");
  const [reachedEnd, setReachedEnd] = React.useState(false);
  // Tracks whether the current PDF has finished rendering. A ref rather than
  // state, so a scroll event that fires while the previous waiver is being
  // cleared can't read a stale "ready" value and count an empty box as read.
  const pdfRenderedRef = React.useRef(false);

  const checkReachedEnd = React.useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || !pdfRenderedRef.current) return;
    if (
      scroller.scrollTop + scroller.clientHeight >=
      scroller.scrollHeight - SCROLL_END_TOLERANCE
    ) {
      setReachedEnd(true);
    }
  }, []);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    const pages = pagesRef.current;
    if (!dialog || !pages) return;

    if (!waiver) {
      if (dialog.open) dialog.close();
      return;
    }

    let cancelled = false;
    pdfRenderedRef.current = false;
    setReachedEnd(false);
    setPdfState("loading");
    pages.replaceChildren();
    if (!dialog.open) dialog.showModal();
    if (scrollRef.current) scrollRef.current.scrollTop = 0;

    renderPdf(waiver.pdfUrl, pages, () => cancelled)
      .then(() => {
        if (cancelled) return;
        pdfRenderedRef.current = true;
        setPdfState("ready");
        // A document short enough to fit without scrolling has been seen.
        requestAnimationFrame(checkReachedEnd);
      })
      .catch(() => {
        if (!cancelled) setPdfState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [waiver, checkReachedEnd]);

  const canAccept = pdfState === "ready" && reachedEnd;

  return (
    <dialog
      className="modal modal-bottom sm:modal-middle"
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="waiverDialogTitle"
    >
      <div className="modal-box sm:max-w-2xl dark:bg-[#1F1F1F]">
        <h3
          id="waiverDialogTitle"
          className="text-lg font-bold dark:text-white"
        >
          {waiver?.title}
        </h3>
        <div
          ref={scrollRef}
          onScroll={checkReachedEnd}
          tabIndex={0}
          className="mt-4 h-[55vh] overflow-y-auto rounded-lg border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {pdfState === "loading" && (
            <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
              Loading waiver...
            </p>
          )}
          {pdfState === "error" && waiver && (
            <p className="p-4 text-sm text-error" role="alert">
              We couldn{"'"}t display this waiver.{" "}
              <a
                href={waiver.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Open the PDF
              </a>{" "}
              and try again later.
            </p>
          )}
          <div ref={pagesRef} className="flex flex-col gap-2" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 text-sm">
          <p
            className="text-neutral-500 dark:text-neutral-400"
            aria-live="polite"
          >
            {canAccept
              ? "Thanks for reading. You can now accept this waiver."
              : "Scroll to the bottom of the waiver to accept it."}
          </p>
          {waiver && (
            <a
              href={waiver.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 underline"
            >
              Open PDF in new tab
            </a>
          )}
        </div>
        <div className="modal-action">
          <div className="flex gap-5">
            <button
              type="button"
              className="btn btn-primary dark:bg-primary dark:text-white border-none text-base font-medium capitalize disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-600 dark:disabled:text-zinc-400"
              disabled={!canAccept}
              onClick={() => {
                if (!waiver || !canAccept) return;
                onAccept(waiver.id);
                dialogRef.current?.close();
              }}
            >
              Accept
            </button>
            <button
              type="button"
              className="btn bg-zinc-700 dark:text-white border-none text-base font-medium capitalize hover:bg-zinc-800"
              onClick={() => dialogRef.current?.close()}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default WaiverDialog;
