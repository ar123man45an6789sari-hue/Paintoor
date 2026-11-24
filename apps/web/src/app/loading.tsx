/* Root loading fallback — client-side route changes paint this branded
   spinner instead of a blank white flash while the next route loads. */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="h-10 w-10 animate-spin rounded-pill border-4 border-line border-t-saffron" />
    </div>
  );
}