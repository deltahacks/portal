import React from "react";
import type { Waiver } from "../data/rsvpWaivers";

// How close (in px) to the bottom counts as "scrolled to the end", to allow
// for sub-pixel rounding and zoom levels.
const SCROLL_END_TOLERANCE = 8;

// Width (in CSS px) pages are rendered at. The canvases are scaled down to
// fit the popup, so this only needs to be at least as wide as the popup.
const PAGE_RENDER_WIDTH = 720;

type PdfState = "loading" | "ready" | "error";

// Rendered pages for each PDF URL. Waivers are rendered once, in the
// background, so opening the popup shows them straight away.
const renderedPages = new Map<string, HTMLElement[]>();
const pendingRenders = new Map<string, Promise<HTMLElement[]>>();

const renderPdfPages = async (url: string) => {
  // The legacy build supports older browsers (e.g. Safari before 18.2); the
  // modern build relies on Promise.try and fails there, which would block the
  // RSVP. Importing the worker module registers it on globalThis, so pdf.js
  // parses on the main thread. The waivers are a few pages, so this is fast
  // enough and avoids having to serve a separate worker file.
  const [pdfjs] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs"),
  ]);

  const loadingTask = pdfjs.getDocument({ url });
  try {
    const pdf = await loadingTask.promise;
    // Capped at 2x to keep the cached canvases' memory reasonable on phones.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pages: HTMLElement[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      // Render at device resolution so the text stays sharp.
      const cssScale = PAGE_RENDER_WIDTH / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale: cssScale * pixelRatio });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.className = "block w-full h-auto bg-white";
      // A canvas has no role by default, so without role="img" screen readers
      // would ignore its label.
      canvas.setAttribute("role", "img");
      canvas.setAttribute(
        "aria-label",
        `Page ${pageNumber} of ${pdf.numPages}`,
      );
      await page.render({ canvas, viewport }).promise;
      pages.push(canvas);
    }
    return pages;
  } finally {
    await loadingTask.destroy();
  }
};

const loadWaiverPages = (url: string) => {
  let pending = pendingRenders.get(url);
  if (!pending) {
    pending = renderPdfPages(url).then(
      (pages) => {
        renderedPages.set(url, pages);
        return pages;
      },
      (error: unknown) => {
        // Let a later attempt try again.
        pendingRenders.delete(url);
        throw error;
      },
    );
    pendingRenders.set(url, pending);
  }
  return pending;
};

// Starts rendering the waivers in the background (call when the RSVP modal
// opens), so each waiver shows as soon as its popup opens.
export const preloadWaivers = (waivers: Waiver[]) => {
  for (const { pdfUrl } of waivers) {
    loadWaiverPages(pdfUrl).catch(() => {
      // Shown as an error if the hacker opens this waiver.
    });
  }
};

type WaiverDialogProps = {
  waivers: Waiver[];
  openWaiverId: string | null;
  onAccept: (waiverId: string) => void;
  onClose: () => void;
};

// Shows a waiver PDF in a modal. Accept stays disabled until the hacker has
// scrolled to the bottom of the document.
const WaiverDialog = ({
  waivers,
  openWaiverId,
  onAccept,
  onClose,
}: WaiverDialogProps) => {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const pagesRef = React.useRef<HTMLDivElement | null>(null);
  const [pdfState, setPdfState] = React.useState<PdfState>("loading");
  const [reachedEnd, setReachedEnd] = React.useState(false);
  // Tracks whether the current PDF is showing. A ref rather than state, so a
  // scroll event that fires while the previous waiver is being cleared can't
  // read a stale "ready" value and count an empty box as read.
  const pdfShownRef = React.useRef(false);
  // Bumped by the Retry button to load the open waiver again.
  const [loadAttempt, setLoadAttempt] = React.useState(0);
  const waiver = waivers.find(({ id }) => id === openWaiverId) ?? null;

  const checkReachedEnd = React.useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || !pdfShownRef.current) return;
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
    const showPages = (renderedPdfPages: HTMLElement[]) => {
      pages.replaceChildren(...renderedPdfPages);
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      pdfShownRef.current = true;
      setPdfState("ready");
      // A document short enough to fit without scrolling has been seen.
      requestAnimationFrame(checkReachedEnd);
    };

    pdfShownRef.current = false;
    setReachedEnd(false);
    pages.replaceChildren();
    if (!dialog.open) dialog.showModal();

    const rendered = renderedPages.get(waiver.pdfUrl);
    if (rendered) {
      showPages(rendered);
    } else {
      setPdfState("loading");
      loadWaiverPages(waiver.pdfUrl)
        .then((renderedPdfPages) => {
          if (!cancelled) showPages(renderedPdfPages);
        })
        .catch(() => {
          if (!cancelled) setPdfState("error");
        });
    }

    return () => {
      cancelled = true;
    };
  }, [waiver, loadAttempt, checkReachedEnd]);

  // Resizing or zooming can make the waiver fit without scrolling, which
  // fires no scroll event, so check again whenever the box changes size.
  React.useEffect(() => {
    const scroller = scrollRef.current;
    const pages = pagesRef.current;
    if (!scroller || !pages || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(checkReachedEnd);
    observer.observe(scroller);
    observer.observe(pages);
    return () => observer.disconnect();
  }, [checkReachedEnd]);

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
          role="region"
          aria-label="Waiver. Scroll to the end, for example with the End key, to enable Accept."
          className="mt-4 h-[55vh] overflow-y-auto rounded-lg border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {pdfState === "loading" && (
            <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
              Loading waiver...
            </p>
          )}
          {pdfState === "error" && (
            <p className="p-4 text-sm text-error" role="alert">
              We couldn{"'"}t load this waiver.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  setLoadAttempt((attempt) => attempt + 1);
                  // This button disappears while retrying, so keep keyboard
                  // focus in the popup instead of losing it.
                  scrollRef.current?.focus();
                }}
              >
                Try again
              </button>
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
          {/* The pages are drawn on canvases, so this link is the readable
              version of the waiver for screen readers. */}
          {waiver && (
            <a
              href={waiver.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-700 underline dark:text-sky-400"
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
