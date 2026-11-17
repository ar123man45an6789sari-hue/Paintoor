/* Post box — composer and worker requests merged into one view.

   The composer expands into the full PostJobWizard (reused as-is); after
   posting, the request lands in the list below (RequestsList, also reused —
   its groups, accept -> chat, OTP chip, cancel and review all stay). This
   replaces the old standalone "My requests" nav item. */
"use client";

import { useEffect,useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { PostJobWizard } from "@/components/customer/PostJobWizard";
import { RequestsList } from "@/components/customer/RequestsList";
import { initialsOf, useProfile } from "@/lib/profile";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

export function PostBox() {
  const { t } = useI18n();
  const [profile] = useProfile();
  const [composing, setComposing] = useState(false);
  const [posted, setPosted] = useState(false);

    /* Arriving from "Hire" on the find-partner grid: PostJobWizard pre-fills
     the partner from pt_post_provider, so open the composer straight away. */
  useEffect(() => {
    if (sessionStorage.getItem("pt_post_provider")) setComposing(true);
  }, []);
  const openComposer = () => {
    setPosted(false);
    setComposing(true);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("dash.tab.post")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.post.sub")}</p>
      </div>

      {/* Composer — closed state looks like a social post box */}
      {composing ? (
        <section className="rounded-card border border-line bg-white p-4 shadow-card">
          <PostJobWizard
            onDone={() => {
              setComposing(false);
              setPosted(true);
            }}
          />
        </section>
      ) : (
        <section className="rounded-card border border-line bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            {profile.photo ? (
              /* eslint-disable-next-line @next/next/no-img-element -- user upload, data URL */
              <img
                src={profile.photo}
                alt=""
                className="h-10 w-10 shrink-0 rounded-pill object-cover"
              />
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-xs font-black text-snow"
                style={{ background: GRAD }}
                aria-hidden="true"
              >
                {initialsOf(profile.name)}
              </span>
            )}
            <button
              type="button"
              onClick={openComposer}
              className="min-w-0 flex-1 rounded-pill border border-line bg-chuna px-4 py-2.5 text-left text-sm font-bold text-muted transition-colors hover:border-saffron"
            >
              {t("cd.post.ph")}
            </button>
            <button
              type="button"
              onClick={openComposer}
              className="hidden shrink-0 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-snow transition-opacity hover:opacity-90 sm:block"
            >
              {t("dash.tab.post")}
            </button>
          </div>
          {posted && (
            <p className="mt-3 flex items-center gap-2 rounded-control bg-neem/15 px-3 py-2 text-xs font-extrabold text-neem">
              <Icon name="checkCircle" className="h-4 w-4" />
              {t("cd.post.done")}
            </p>
          )}
        </section>
      )}

      {/* Worker requests — accept -> chat lives inside these cards */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("cd.post.reqs")}</h2>
        <RequestsList onPost={openComposer} />
      </section>
    </div>
  );
}