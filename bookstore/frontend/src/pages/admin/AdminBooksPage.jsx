import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../api/adminApi";
import ApiMessage from "../../components/common/ApiMessage";
import Loader from "../../components/common/Loader";
import { getApiErrorDetails, getApiErrorMessage } from "../../utils/apiError";
import { formatCount, formatCurrency, toNumber } from "../../utils/adminFormat";

const initialForm = {
  title: "",
  author: "",
  description: "",
  price: "",
  previewPageCount: "0",
  fullPageCount: "0",
  active: true,
};

const initialFieldErrors = {
  title: "",
  author: "",
  description: "",
  price: "",
  previewPageCount: "",
  fullPageCount: "",
  active: "",
};

function getInputClass(hasError) {
  return `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
    hasError
      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 bg-slate-50 focus:border-slate-400 focus:ring-slate-200/70"
  }`;
}

function BookFormModal({ open, editingBook, form, fieldErrors, submitting, onChange, onClose, onSubmit }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              {editingBook ? "Edit Book" : "Add Book"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {editingBook ? `Update ${editingBook.title}` : "Create a new book"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Manage book metadata from the admin dashboard. File upload stays unchanged and out of scope for this form.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">Title</label>
            <input id="title" name="title" value={form.title} onChange={onChange} className={getInputClass(Boolean(fieldErrors.title))} />
            {fieldErrors.title && <p className="mt-2 text-sm text-red-600">{fieldErrors.title}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="author" className="mb-2 block text-sm font-medium text-slate-700">Author</label>
            <input id="author" name="author" value={form.author} onChange={onChange} className={getInputClass(Boolean(fieldErrors.author))} />
            {fieldErrors.author && <p className="mt-2 text-sm text-red-600">{fieldErrors.author}</p>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={onChange}
              className={getInputClass(Boolean(fieldErrors.description))}
              placeholder="Book summary"
            />
            {fieldErrors.description && <p className="mt-2 text-sm text-red-600">{fieldErrors.description}</p>}
          </div>

          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-medium text-slate-700">Price</label>
            <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} className={getInputClass(Boolean(fieldErrors.price))} />
            {fieldErrors.price && <p className="mt-2 text-sm text-red-600">{fieldErrors.price}</p>}
          </div>

          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={onChange}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <label htmlFor="active" className="ml-3 text-sm font-medium text-slate-700">
              Active in catalog
            </label>
          </div>

          <div>
            <label htmlFor="previewPageCount" className="mb-2 block text-sm font-medium text-slate-700">Preview pages</label>
            <input
              id="previewPageCount"
              name="previewPageCount"
              type="number"
              min="0"
              value={form.previewPageCount}
              onChange={onChange}
              className={getInputClass(Boolean(fieldErrors.previewPageCount))}
            />
            {fieldErrors.previewPageCount && <p className="mt-2 text-sm text-red-600">{fieldErrors.previewPageCount}</p>}
          </div>

          <div>
            <label htmlFor="fullPageCount" className="mb-2 block text-sm font-medium text-slate-700">Full pages</label>
            <input
              id="fullPageCount"
              name="fullPageCount"
              type="number"
              min="0"
              value={form.fullPageCount}
              onChange={onChange}
              className={getInputClass(Boolean(fieldErrors.fullPageCount))}
            />
            {fieldErrors.fullPageCount && <p className="mt-2 text-sm text-red-600">{fieldErrors.fullPageCount}</p>}
          </div>

          <div className="sm:col-span-2 flex flex-wrap justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (editingBook ? "Saving..." : "Creating...") : editingBook ? "Save Changes" : "Create Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState(initialFieldErrors);
  const [submitting, setSubmitting] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState(null);
  const [togglingBookId, setTogglingBookId] = useState(null);

  const loadBooks = async () => {
    try {
      const response = await adminApi.getBooks();
      setBooks(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load books"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const summary = useMemo(() => {
    const activeBooks = books.filter((book) => book.active).length;
    const inactiveBooks = books.filter((book) => !book.active).length;

    return {
      totalBooks: books.length,
      activeBooks,
      inactiveBooks,
    };
  }, [books]);

  const resetFormState = () => {
    setForm(initialForm);
    setFieldErrors(initialFieldErrors);
    setEditingBook(null);
  };

  const openCreateModal = () => {
    setSuccess("");
    setError("");
    resetFormState();
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setSuccess("");
    setError("");
    setEditingBook(book);
    setFieldErrors(initialFieldErrors);
    setForm({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      price: String(book.price ?? ""),
      previewPageCount: String(book.previewPageCount ?? 0),
      fullPageCount: String(book.fullPageCount ?? 0),
      active: Boolean(book.active),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    resetFormState();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setError("");
  };

  const buildPayload = () => ({
    title: form.title,
    author: form.author,
    description: form.description,
    price: form.price === "" ? null : Number(form.price),
    previewPageCount: form.previewPageCount === "" ? 0 : Number(form.previewPageCount),
    fullPageCount: form.fullPageCount === "" ? 0 : Number(form.fullPageCount),
    active: Boolean(form.active),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    setFieldErrors(initialFieldErrors);

    try {
      const payload = buildPayload();
      if (editingBook) {
        await adminApi.updateBook(editingBook.id, payload);
        setSuccess("Book updated successfully.");
      } else {
        await adminApi.createBook(payload);
        setSuccess("Book created successfully.");
      }

      setIsModalOpen(false);
      resetFormState();
      setLoading(true);
      await loadBooks();
    } catch (err) {
      const details = getApiErrorDetails(err, editingBook ? "Unable to update book" : "Unable to create book");
      setError(details.message);
      setFieldErrors((current) => ({
        ...current,
        ...details.fieldErrors,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (book) => {
    const shouldDelete = window.confirm(
      `Delete "${book.title}" permanently? This removes the book fully when it is not linked to existing orders, progress, or reviews.`
    );
    if (!shouldDelete) {
      return;
    }

    setDeletingBookId(book.id);
    setError("");
    setSuccess("");

    try {
      await adminApi.deleteBook(book.id);
      setSuccess("Book deleted permanently.");
      setLoading(true);
      await loadBooks();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to delete book"));
    } finally {
      setDeletingBookId(null);
    }
  };

  const handleToggleActive = async (book) => {
    setTogglingBookId(book.id);
    setError("");
    setSuccess("");

    try {
      await adminApi.updateBook(book.id, {
        title: book.title,
        author: book.author,
        description: book.description,
        price: Number(book.price),
        previewPageCount: Number(book.previewPageCount ?? 0),
        fullPageCount: Number(book.fullPageCount ?? 0),
        active: !book.active,
      });
      setSuccess(`Book marked as ${book.active ? "inactive" : "active"} successfully.`);
      setLoading(true);
      await loadBooks();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update book status"));
    } finally {
      setTogglingBookId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading books..." />;
  }

  return (
    <div className="space-y-6">
      <ApiMessage type="error" text={error} />
      <ApiMessage type="success" text={success} />

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Total books</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.totalBooks)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Active books</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.activeBooks)}</p>
        </article>
        <article className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-5 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Inactive books</p>
          <p className="mt-4 text-3xl font-semibold text-[var(--soft-text)]">{formatCount(summary.inactiveBooks)}</p>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--soft-border)] bg-white p-6 shadow-[0_20px_40px_rgba(80,67,52,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--soft-muted)]">Catalog Manager</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--soft-text)]">Book management</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--soft-muted)]">
              Add, update, activate, deactivate, and permanently delete books using the secured admin endpoints. Ratings remain review-driven and read-only.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-2xl bg-[#352f2a] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
          >
            Add Book
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-[var(--soft-border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--soft-border)] text-sm">
              <thead className="bg-[var(--soft-page)] text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--soft-muted)]">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--soft-border)] bg-white">
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-[var(--soft-muted)]">
                      No books found in the current catalog.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-[var(--soft-text)]">{book.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--soft-muted)]">{book.description || "No description added yet."}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">{book.author}</td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">{formatCurrency(book.price)}</td>
                      <td className="px-4 py-4 text-[var(--soft-muted)]">
                        <span className="rounded-full bg-[var(--soft-page)] px-3 py-1 text-xs font-semibold text-[var(--soft-text)]">
                          {toNumber(book.averageRating).toFixed(1)} / 5
                        </span>
                        <p className="mt-2 text-xs text-[var(--soft-muted)]">{formatCount(book.reviewCount)} reviews</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${book.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {book.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(book)}
                            disabled={togglingBookId === book.id}
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                              book.active
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {togglingBookId === book.id ? "Saving..." : book.active ? "Set Inactive" : "Set Active"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(book)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(book)}
                            disabled={deletingBookId === book.id}
                            className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingBookId === book.id ? "Deleting..." : "Delete Permanently"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <BookFormModal
        open={isModalOpen}
        editingBook={editingBook}
        form={form}
        fieldErrors={fieldErrors}
        submitting={submitting}
        onChange={handleChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
