"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { MarketplacePageShell } from "@/components/marketplace/MarketplacePageShell";
import { ME_QUERY } from "@/lib/election-graphql";
import type { MeQuery } from "@/types/election-apollo";
import {
  CONFIRM_MARKETPLACE_INQUIRY_MUTATION,
  MY_MARKETPLACE_INQUIRIES_QUERY,
  REPLY_MARKETPLACE_INQUIRY_MUTATION,
} from "@/lib/marketplace-graphql";

export default function InquiriesPage() {
  const router = useRouter();
  const { data: meData, loading: meLoading } = useQuery<MeQuery>(ME_QUERY);
  const me = meData?.me;

  const { data, loading, refetch } = useQuery<{
    myMarketplaceInquiries: {
      id: string;
      subject: string | null;
      status: string;
      digital_delivery_url: string | null;
      listing: {
        id: string;
        slug: string;
        title: string;
        seller_user_id: string;
      };
      buyer: { id: string; full_name: string };
      messages: {
        id: string;
        body: string;
        sender_user_id: string;
        createdAt: string;
        sender: { full_name: string };
      }[];
    }[];
  }>(MY_MARKETPLACE_INQUIRIES_QUERY, { skip: !me });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replyInquiry, { loading: replying }] = useMutation(
    REPLY_MARKETPLACE_INQUIRY_MUTATION,
  );
  const [confirmInquiry, { loading: confirming }] = useMutation(
    CONFIRM_MARKETPLACE_INQUIRY_MUTATION,
  );

  useEffect(() => {
    if (!meLoading && !me) {
      router.replace(
        `/election/login?next=${encodeURIComponent("/marketplace/inquiries")}`,
      );
    }
  }, [me, meLoading, router]);

  if (meLoading || loading) {
    return (
      <MarketplacePageShell title="Inquiries">
        <p className="py-3">Loading…</p>
      </MarketplacePageShell>
    );
  }
  if (!me) return null;

  const inquiries = data?.myMarketplaceInquiries ?? [];
  const selected = inquiries.find((i) => i.id === selectedId) ?? inquiries[0];
  const isSeller = selected && selected.listing.seller_user_id === me.id;

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    await replyInquiry({
      variables: {
        input: { inquiry_id: selected.id, message: reply.trim() },
      },
    });
    setReply("");
    refetch();
  }

  async function confirmDeal() {
    if (!selected) return;
    await confirmInquiry({ variables: { inquiry_id: selected.id } });
    refetch();
  }

  return (
    <MarketplacePageShell
      title="Inquiries"
      description="Buyer and seller messages for your marketplace listings."
    >
      {inquiries.length === 0 ? (
        <p className="text-muted">No inquiries yet.</p>
      ) : (
        <div className="row gy-4">
          <div className="col-md-4">
            <ul className="list-group">
              {inquiries.map((inq) => (
                <li key={inq.id} className="list-group-item p-0">
                  <button
                    type="button"
                    className={`btn w-100 text-start p-3 border-0 rounded-0${
                      selected?.id === inq.id ? " active" : ""
                    }`}
                    onClick={() => setSelectedId(inq.id)}
                  >
                    <div className="fw-semibold small">{inq.listing.title}</div>
                    <div className="text-muted small">{inq.status}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-8">
            {selected && (
              <>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="h5 mb-1">
                      <Link href={`/marketplace/l/${selected.listing.slug}`}>
                        {selected.listing.title}
                      </Link>
                    </h2>
                    <p className="small text-muted mb-0">
                      With {selected.buyer.full_name} · {selected.status}
                    </p>
                  </div>
                  {isSeller && selected.status !== "CONFIRMED" && (
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      disabled={confirming}
                      onClick={confirmDeal}
                    >
                      Confirm deal
                    </button>
                  )}
                </div>

                {selected.digital_delivery_url && (
                  <div className="alert alert-success small">
                    Digital delivery:{" "}
                    <a
                      href={selected.digital_delivery_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </div>
                )}

                <div className="inquiry-thread border rounded p-3 mb-3">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`inquiry-bubble${
                        m.sender_user_id === me.id ? " is-mine" : " is-theirs"
                      }`}
                    >
                      <div className="small fw-semibold">
                        {m.sender.full_name}
                      </div>
                      <div>{m.body}</div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {selected.status !== "CLOSED" && (
                  <div className="d-flex gap-2 form-panel form-panel--compact php-email-form">
                    <textarea
                      className="form-control"
                      rows={2}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Reply…"
                    />
                    <button
                      type="button"
                      className="btn btn-accent"
                      disabled={replying || !reply.trim()}
                      onClick={sendReply}
                    >
                      Send
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </MarketplacePageShell>
  );
}
