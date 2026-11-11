# Navbar

The sticky top bar on every page: logo, main sections, the landlord CTA and the account area.

- Props: `links` (`{label, href, active}`), `user` (`{name, avatar, unreadMessages, unreadNotifications}`; omit for logged-out “Log in / Sign up”), `ctaLabel`, `ctaHref`, `homeHref`, `defaultOpen`.
- Below lg (1024px) it shows only the logo and a menu button that opens an inline drawer; from lg the links, CTA and account icons appear.
- 64px tall on mobile, 72px from lg; content aligns with `container-max`.
