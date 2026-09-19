import Button from "./Button";

type Props = {
  page: number;
  size: number;
  total: number;
  onPage: (page: number) => void;
};

export default function Pagination({ page, size, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
      <span>
        Page {page} of {pages} · {total} result{total === 1 ? "" : "s"}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
