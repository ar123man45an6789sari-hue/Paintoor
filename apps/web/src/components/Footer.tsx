export function Footer() {
  return (
    <footer className="bg-raatri px-5 py-10 text-sm text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} GharSahayak · Made in Vadodara 🧡</p>
        <p>English · हिंदी · ગુજરાતી — more languages phased</p>
      </div>
    </footer>
  );
}