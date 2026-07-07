"use client";

import { useApolloClient } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { HEADER_USER_QUERY } from "@/lib/graphql/community-join";
import { memberImageSrc } from "@/lib/member-image";
import {
  selectAuthToken,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/lib/store/auth-selectors";
import {
  clearLocalAuthSession,
  runDeferredAuthLogoutCleanup,
} from "@/lib/store/imperative-auth";
import { setAuthUser } from "@/lib/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

type HeaderUserQuery = {
  me: { id: string; full_name: string } | null;
  myCommunityJoin: { avatar_url: string | null } | null;
};

export function HeaderUserMenu() {
  const menuId = useId();
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectAuthToken);
  const sessionUser = useAppSelector(selectAuthUser);

  const { data } = useQuery<HeaderUserQuery>(HEADER_USER_QUERY, {
    skip: !token,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!token || !data?.me) return;

    const nextAvatar = data.myCommunityJoin?.avatar_url ?? null;
    if (
      sessionUser?.id === data.me.id &&
      sessionUser.full_name === data.me.full_name &&
      sessionUser.avatar_url === nextAvatar
    ) {
      return;
    }

    dispatch(
      setAuthUser({
        id: data.me.id,
        full_name: data.me.full_name,
        avatar_url: nextAvatar,
      }),
    );
  }, [token, data, dispatch, sessionUser]);

  const closeMenu = useCallback(() => setOpen(false), []);

  const toggleMenu = useCallback(() => {
    setOpen((value) => !value);
  }, []);

  const onLogout = useCallback(() => {
    closeMenu();
    clearLocalAuthSession();
    runDeferredAuthLogoutCleanup(() => {
      client.cache.reset();
    });
  }, [client, closeMenu]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      closeMenu();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeMenu, open]);

  if (!isAuthenticated) {
    return (
      <Link className="btn-getstarted" href="/community#join">
        Join the community
      </Link>
    );
  }

  if (!sessionUser) {
    return (
      <div className="header-user-menu">
        <span
          className="header-user header-user--loading"
          aria-label="Loading your profile"
        >
          <span className="header-user__avatar" />
          <span className="header-user__name" />
        </span>
      </div>
    );
  }

  const avatarSrc = memberImageSrc(
    sessionUser.avatar_url,
    "person/person-m-1.webp",
  );

  return (
    <div
      ref={menuRef}
      className={`header-user-menu${open ? " header-user-menu--open" : ""}`}
    >
      <button
        type="button"
        className="header-user"
        aria-label={`Account menu for ${sessionUser.full_name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggleMenu}
      >
        <img
          src={avatarSrc}
          alt=""
          width={32}
          height={32}
          className="header-user__avatar"
        />
        <span className="header-user__name">{sessionUser.full_name}</span>
        <i className="bi bi-chevron-down header-user__chevron" aria-hidden />
      </button>

      <div
        id={menuId}
        className="header-user-menu__dropdown"
        role="menu"
        hidden={!open}
      >
        <Link
          href="/profile"
          className="header-user-menu__item"
          role="menuitem"
          onClick={closeMenu}
        >
          <i className="bi bi-person" aria-hidden />
          My profile
        </Link>
        <button
          type="button"
          className="header-user-menu__item header-user-menu__item--danger"
          role="menuitem"
          onClick={onLogout}
        >
          <i className="bi bi-box-arrow-right" aria-hidden />
          Log out
        </button>
      </div>
    </div>
  );
}
