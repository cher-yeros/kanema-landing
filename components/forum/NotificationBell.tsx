"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import {
  MY_NOTIFICATIONS_QUERY,
  MARK_NOTIFICATION_READ,
  NOTIFICATION_SUBSCRIPTION,
} from "@/lib/forum-graphql";
import { useAppSelector } from "@/lib/store/hooks";

export function NotificationBell() {
  const token = useAppSelector((s) => s.auth.token);
  const [open, setOpen] = useState(false);
  const { data, refetch } = useQuery(MY_NOTIFICATIONS_QUERY, {
    variables: { unreadOnly: true, limit: 10 },
    skip: !token,
  });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ);

  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    skip: !token,
    onData: () => refetch(),
  });

  const notifications =
    (
      data as
        | {
            myNotifications?: Array<{
              id: string;
              title: string;
              body?: string | null;
              link_path?: string | null;
              read_at?: string | null;
            }>;
          }
        | undefined
    )?.myNotifications ?? [];

  if (!token) return null;

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-link p-1 forum-subnav-bell"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <i className="bi bi-bell fs-5" />
        {notifications.length > 0 ? (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.6rem" }}
          >
            {notifications.length}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="position-absolute end-0 mt-2 forum-notifications-dropdown">
          <div className="forum-notifications-dropdown__header">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <p className="small text-muted p-3 mb-0">No new notifications</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link_path ?? "/forum/notifications"}
                    className="forum-notifications-dropdown__item"
                    onClick={async () => {
                      await markRead({ variables: { id: n.id } });
                      setOpen(false);
                      refetch();
                    }}
                  >
                    <strong>{n.title}</strong>
                    {n.body ? <div className="text-muted">{n.body}</div> : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/forum/notifications"
            className="forum-notifications-dropdown__footer"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function NotificationsPageClient() {
  const token = useAppSelector((s) => s.auth.token);
  const { data, refetch } = useQuery(MY_NOTIFICATIONS_QUERY, {
    variables: { limit: 50 },
    skip: !token,
  });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ);

  useSubscription(NOTIFICATION_SUBSCRIPTION, {
    skip: !token,
    onData: () => refetch(),
  });

  if (!token) {
    return (
      <p className="text-muted">
        <Link href="/community?next=/forum/notifications">Sign in</Link> to view
        notifications.
      </p>
    );
  }

  const notifications =
    (
      data as
        | {
            myNotifications?: Array<{
              id: string;
              type: string;
              title: string;
              body?: string | null;
              link_path?: string | null;
              read_at?: string | null;
              createdAt: string;
            }>;
          }
        | undefined
    )?.myNotifications ?? [];

  return (
    <div>
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`offering-block p-3 mb-2 ${!n.read_at ? "border-start border-4 border-primary" : ""}`}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <strong>{n.title}</strong>
              {n.body ? (
                <p className="small text-muted mb-1">{n.body}</p>
              ) : null}
              {n.link_path ? (
                <Link href={n.link_path} className="small">
                  View
                </Link>
              ) : null}
            </div>
            {!n.read_at ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary flex-shrink-0"
                onClick={() =>
                  markRead({ variables: { id: n.id } }).then(() => refetch())
                }
              >
                <i className="bi bi-check2" />
                Mark read
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
