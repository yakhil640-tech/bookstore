export default function BookPreviewPanel({ book, preview }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Public Preview</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Preview access details</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {preview?.accessType || "PREVIEW"}
            </span>
            {preview?.pageCount && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {preview.pageCount} readable pages
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm leading-7 text-slate-600">
          {preview?.message || "Guests can view preview information only."}
        </p>

        <div className="mt-6 grid gap-4 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-500">Title</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{book?.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Author</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{book?.author}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Preview available</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{book?.previewAvailable ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Full content available</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{book?.fullContentAvailable ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
