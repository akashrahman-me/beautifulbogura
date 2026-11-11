/* @ds-bundle: {"format":4,"namespace":"ERS","components":[{"name":"Icon"},{"name":"Logo"},{"name":"Button"},{"name":"IconButton"},{"name":"FavoriteButton"},{"name":"Badge"},{"name":"Chip"},{"name":"Avatar"},{"name":"Rating"},{"name":"Price"},{"name":"TextField"},{"name":"Select"},{"name":"Textarea"},{"name":"Checkbox"},{"name":"RadioGroup"},{"name":"Switch"},{"name":"Stepper"},{"name":"SegmentedControl"},{"name":"RangeSlider"},{"name":"SearchBar"},{"name":"FileDrop"},{"name":"Tabs"},{"name":"Breadcrumbs"},{"name":"Pagination"},{"name":"Navbar"},{"name":"BottomNav"},{"name":"Footer"},{"name":"Container"},{"name":"ListingGrid"},{"name":"SectionHeader"},{"name":"Card"},{"name":"ImagePlaceholder"},{"name":"PropertyCard"},{"name":"Gallery"},{"name":"KeyFacts"},{"name":"AmenityList"},{"name":"MapPin"},{"name":"Calendar"},{"name":"BookingPanel"},{"name":"StickyActionBar"},{"name":"HostCard"},{"name":"ReviewCard"},{"name":"MessageThread"},{"name":"Alert"},{"name":"Toast"},{"name":"Modal"},{"name":"Menu"},{"name":"Tooltip"},{"name":"Progress"},{"name":"Spinner"},{"name":"Steps"},{"name":"Skeleton"},{"name":"EmptyState"},{"name":"Accordion"},{"name":"StatCard"},{"name":"DataTable"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement, Fragment = React.Fragment;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useId = React.useId;

  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) { if (arguments[i]) o.push(arguments[i]); } return o.join(" "); }
  function useControlled(value, defaultValue) {
    var s = useState(defaultValue); var isCtl = value !== undefined;
    return [isCtl ? value : s[0], function (v) { if (!isCtl) s[1](v); }];
  }
  function money(amount, currency, locale) {
    if (amount == null || amount === "") return "";
    if (typeof amount === "string") return amount;
    try { return new Intl.NumberFormat(locale || "en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(amount); }
    catch (e) { return String(amount); }
  }
  function initials(name) { return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join(""); }

  /* ---------------- Icon ---------------- */
  var P = {
    search: "M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14z M20 20l-4-4",
    "map-pin": "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5a2.5 2.5 0 1 0 0 5z",
    home: "M3 10.5 12 3l9 7.5 M5 9v11h14V9 M10 20v-6h4v6",
    building: "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16 M15 10h4a1 1 0 0 1 1 1v10 M3 21h18 M8 8h3 M8 12h3 M8 16h3",
    heart: "M12 20s-7.5-4.6-9-9.3C2 7.4 4.2 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.8c1.1-1.7 2.7-2.8 4.7-2.8c3.1 0 5.3 2.9 4.3 6.2c-1.5 4.7-9 9.3-9 9.3z",
    star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z",
    bed: "M3 19V6 M3 11h18v8 M3 16h18 M7 11V9.5A1.5 1.5 0 0 1 8.5 8h3A1.5 1.5 0 0 1 13 9.5V11",
    bath: "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z M6 12V5.5A1.5 1.5 0 0 1 7.5 4A1.5 1.5 0 0 1 9 5.5 M7 19l-1 2 M17 19l1 2",
    area: "M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5",
    car: "M5 17h14 M4 17v-5l2.2-5.2A1.5 1.5 0 0 1 7.6 6h8.8a1.5 1.5 0 0 1 1.4.8L20 12v5 M4 12h16 M7 17v2 M17 17v2",
    wifi: "M2.5 9a14 14 0 0 1 19 0 M5.5 12.5a9.5 9.5 0 0 1 13 0 M8.8 16a4.5 4.5 0 0 1 6.4 0 M12 19.5h.01",
    washer: "M5 3h14v18H5z M5 7h14 M12 17.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7z M8 5h.01",
    snowflake: "M12 2v20 M3.5 7l17 10 M20.5 7l-17 10 M9.5 3.5 12 6l2.5-2.5 M9.5 20.5 12 18l2.5 2.5",
    paw: "M12 13.5c-3 0-5.5 2.8-5.5 4.8c0 1.4 1.3 1.9 2.6 1.6c1-.2 1.9-.6 2.9-.6s1.9.4 2.9.6c1.3.3 2.6-.2 2.6-1.6c0-2-2.5-4.8-5.5-4.8z M5.5 8.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z M9.5 4.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z M14.5 4.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z M18.5 8.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0-3.6z",
    sofa: "M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3 M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z M5 18v2 M19 18v2",
    calendar: "M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4",
    user: "M12 12a4 4 0 1 0 0-8a4 4 0 1 0 0 8z M4 20a8 8 0 0 1 16 0",
    users: "M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7z M2.5 20a6.5 6.5 0 0 1 13 0 M16 4.3a3.5 3.5 0 0 1 0 6.4 M18 14a6.5 6.5 0 0 1 3.5 6",
    chat: "M4 5h16v11H9l-5 4z",
    bell: "M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z M10 20.5a2 2 0 0 0 4 0",
    menu: "M4 7h16 M4 12h16 M4 17h16",
    close: "M6 6l12 12 M18 6L6 18",
    "chevron-left": "M15 5l-7 7 7 7",
    "chevron-right": "M9 5l7 7-7 7",
    "chevron-down": "M5 9l7 7 7-7",
    "chevron-up": "M5 15l7-7 7 7",
    "arrow-right": "M4 12h16 M14 6l6 6-6 6",
    send: "M4 12 20 4l-4 16-4-7z M12 13l8-9",
    check: "M5 12.5l4.5 4.5L19 7",
    "check-circle": "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M8 12.5l3 3 5-6",
    alert: "M12 3.5 2.5 20h19z M12 10v4.5 M12 17.5h.01",
    info: "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M12 11v6 M12 7.5h.01",
    "x-circle": "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M9 9l6 6 M15 9l-6 6",
    plus: "M12 5v14 M5 12h14",
    minus: "M5 12h14",
    sliders: "M4 7h10 M18 7h2 M4 17h4 M12 17h8 M16 5v4 M10 15v4",
    share: "M12 3v12 M7.5 7.5 12 3l4.5 4.5 M5 12v8h14v-8",
    "shield-check": "M12 3l8 3v6c0 4.5-3.4 8-8 9c-4.6-1-8-4.5-8-9V6z M8.5 12l2.5 2.5 4.5-5",
    key: "M8 15a4 4 0 1 0 0-8a4 4 0 1 0 0 8z M11.5 11H21 M18 11v3 M15 11v2",
    upload: "M12 16V4 M7 9l5-5 5 5 M4 16v4h16v-4",
    file: "M6 3h8l5 5v13H6z M14 3v5h5 M9 13h6 M9 17h6",
    grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
    list: "M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01",
    map: "M9 4 3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5z M9 4v13.5 M15 6.5V20",
    logout: "M10 4H5v16h5 M15 8l4 4-4 4 M19 12H9",
    settings: "M12 15a3 3 0 1 0 0-6a3 3 0 1 0 0 6z M19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7.5 7.5 0 0 1-2.1 1.2L14.6 21h-4l-.4-2.4a7.5 7.5 0 0 1-2.1-1.2l-1.9.7-2-3.4 1.6-1.2a7.6 7.6 0 0 1 0-2.6L3.6 9.7l2-3.4 1.9.7a7.5 7.5 0 0 1 2.1-1.2l.4-2.4h4l.4 2.4a7.5 7.5 0 0 1 2.1 1.2l1.9-.7 2 3.4-1.6 1.2a7.6 7.6 0 0 1 0 2.6z",
    dollar: "M12 3v18 M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3s1.5 2.6 4.5 3.2s4.5 1.6 4.5 3.3s-2 3-4.5 3s-4.5-1.3-4.5-3",
    "trend-up": "M3 17l6-6 4 4 8-8 M15 7h6v6",
    "trend-down": "M3 7l6 6 4-4 8 8 M15 17h6v-6",
    eye: "M2 12s3.6-7 10-7s10 7 10 7s-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6a3 3 0 1 0 0 6z",
    phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
    mail: "M3 6h18v12H3z M3 7l9 6 9-6",
    clock: "M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M12 7v5l3 2",
    camera: "M4 8h3l2-3h6l2 3h3v11H4z M12 16.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7z",
    image: "M4 5h16v14H4z M4 16l5-5 4 4 2-2 5 5 M15.5 9.5h.01",
    sun: "M12 16a4 4 0 1 0 0-8a4 4 0 1 0 0 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
    moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
    lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",
    trash: "M4 7h16 M9 7V4h6v3 M6 7l1 14h10l1-14",
    edit: "M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4",
    more: "M5 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z M12 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z M19 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z",
    document: "M7 3h10v18H7z M10 7h4 M10 11h4 M10 15h2",
    tree: "M12 3 6 11h3l-4 6h14l-4-6h3z M12 17v4",
    elevator: "M5 3h14v18H5z M12 3v18 M8 9l1.5-2L11 9 M13 7l1.5 2L16 7"
  };
  P["heart-fill"] = P.heart; P["star-fill"] = P.star;
  var iconNames = Object.keys(P);

  function Icon(props) {
    var name = props.name, size = props.size || 20, label = props.label;
    var filled = /-fill$/.test(name || "");
    return h("svg", {
      className: cx("ers-icon", props.className), width: size, height: size, viewBox: "0 0 24 24",
      fill: filled ? "currentColor" : "none", stroke: "currentColor", strokeWidth: props.strokeWidth || 1.75,
      strokeLinecap: "round", strokeLinejoin: "round", style: props.style,
      role: label ? "img" : undefined, "aria-label": label || undefined, "aria-hidden": label ? undefined : true, focusable: "false"
    }, h("path", { d: P[name] || P.info }));
  }
  Icon.names = iconNames;

  /* ---------------- Logo ---------------- */
  function Logo(props) {
    var size = props.size || "md";
    var inner = [h(Fragment, { key: "a" }, "EasyRent"), h("b", { key: "b" }, "Spot"), h("i", { key: "c", "aria-hidden": true }, ".")];
    var cls = cx("ers-logo", "ers-logo--" + size, props.className);
    return props.href ? h("a", { className: cls, href: props.href, "aria-label": "EasyRentSpot home" }, inner) : h("span", { className: cls }, inner);
  }

  /* ---------------- Actions ---------------- */
  function Button(props) {
    var variant = props.variant || "primary", size = props.size || "md";
    var p = Object.assign({}, props);
    ["variant", "size", "iconLeft", "iconRight", "block", "loading", "children", "className"].forEach(function (k) { delete p[k]; });
    var isz = size === "sm" ? 16 : 18;
    var kids = [
      props.loading ? h("span", { key: "s", className: "ers-spinner", "aria-hidden": true }) : props.iconLeft ? h(Icon, { key: "l", name: props.iconLeft, size: isz }) : null,
      props.children != null ? h("span", { key: "t" }, props.children) : null,
      props.iconRight ? h(Icon, { key: "r", name: props.iconRight, size: isz }) : null
    ];
    var cls = cx("ers-btn", "ers-btn--" + variant, "ers-btn--" + size, props.block && "ers-btn--block", props.loading && "is-loading", props.className);
    if (p.href) return h("a", Object.assign(p, { className: cls }), kids);
    return h("button", Object.assign({ type: "button" }, p, { className: cls, disabled: p.disabled || props.loading, "aria-busy": props.loading || undefined }), kids);
  }

  function IconButton(props) {
    var p = Object.assign({}, props);
    ["icon", "label", "variant", "size", "pressed", "dot", "className"].forEach(function (k) { delete p[k]; });
    return h("button", Object.assign({ type: "button" }, p, {
      className: cx("ers-iconbtn", "ers-iconbtn--" + (props.variant || "ghost"), props.size === "sm" && "ers-iconbtn--sm", props.className),
      "aria-label": props.label, title: props.label, "aria-pressed": props.pressed === undefined ? undefined : !!props.pressed
    }), h(Icon, { name: props.icon, size: props.size === "sm" ? 18 : 20 }), props.dot ? h("span", { className: "ers-iconbtn__dot", "aria-hidden": true }) : null);
  }

  function FavoriteButton(props) {
    var st = useControlled(props.saved, !!props.defaultSaved), on = st[0];
    return h("button", {
      type: "button", className: cx("ers-fav", on && "is-on", props.size === "sm" && "ers-fav--sm", props.className),
      "aria-pressed": on, "aria-label": on ? "Remove from saved" : "Save listing",
      onClick: function (e) { e.preventDefault(); e.stopPropagation(); st[1](!on); if (props.onChange) props.onChange(!on); }
    }, h(Icon, { name: on ? "heart-fill" : "heart", size: props.size === "sm" ? 18 : 20 }));
  }

  /* ---------------- Display atoms ---------------- */
  function Badge(props) {
    return h("span", { className: cx("ers-badge", "ers-badge--" + (props.tone || "neutral"), props.variant === "solid" && "ers-badge--solid", props.size === "lg" && "ers-badge--lg", props.className) },
      props.icon ? h(Icon, { name: props.icon, size: props.size === "lg" ? 16 : 14 }) : null, props.children);
  }

  function Chip(props) {
    var st = useControlled(props.selected, !!props.defaultSelected), on = st[0];
    return h("button", {
      type: "button", className: cx("ers-chip", props.className), "aria-pressed": props.onRemove ? undefined : on,
      onClick: function () { if (props.onRemove) return; st[1](!on); if (props.onChange) props.onChange(!on); }
    },
      props.icon ? h(Icon, { name: props.icon, size: 18 }) : null,
      props.children,
      props.count ? h("span", { className: "ers-chip__count" }, props.count) : null,
      props.onRemove ? h("span", { className: "ers-chip__x", role: "button", tabIndex: 0, "aria-label": "Remove filter", onClick: function (e) { e.stopPropagation(); props.onRemove(); }, onKeyDown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); props.onRemove(); } } }, h(Icon, { name: "close", size: 16 })) : null
    );
  }

  function Avatar(props) {
    var size = props.size || "md";
    return h("span", { className: cx("ers-avatar", "ers-avatar--" + size, props.className), title: props.name },
      props.src ? h("img", { src: props.src, alt: props.name || "" }) : h("span", { "aria-hidden": !!props.name }, initials(props.name)),
      !props.src && props.name ? h("span", { className: "ers-sr" }, props.name) : null,
      props.verified ? h("span", { className: "ers-avatar__badge", title: "Verified" }, h(Icon, { name: "check", size: size === "xl" || size === "lg" ? 14 : 10, strokeWidth: 3, label: "Verified" })) : null);
  }

  function Rating(props) {
    var v = Number(props.value) || 0, sz = props.size === "sm" ? 14 : 16;
    var count = props.count != null ? h("span", { className: "ers-rating__count" }, "(" + props.count + (props.countLabel ? " " + props.countLabel : "") + ")") : null;
    if (props.compact !== false && props.variant !== "stars") {
      return h("span", { className: cx("ers-rating", props.size === "sm" && "ers-rating--sm", props.className), "aria-label": v.toFixed(1) + " out of 5" + (props.count != null ? ", " + props.count + " reviews" : "") },
        h("span", { className: "ers-rating__stars", "aria-hidden": true }, h(Icon, { name: "star-fill", size: sz })),
        h("span", { className: "ers-rating__value", "aria-hidden": true }, v.toFixed(1)),
        props.count != null ? h("span", { className: "ers-rating__count", "aria-hidden": true }, "(" + props.count + ")") : null);
    }
    var stars = [];
    for (var i = 1; i <= 5; i++) stars.push(h(Icon, { key: i, name: "star-fill", size: sz, className: i <= Math.round(v) ? "" : "is-off" }));
    return h("span", { className: cx("ers-rating", props.className), role: "img", "aria-label": v.toFixed(1) + " out of 5" },
      h("span", { className: "ers-rating__stars" }, stars),
      props.showValue !== false ? h("span", { className: "ers-rating__value" }, v.toFixed(1)) : null, count);
  }

  var PERIOD = { month: "/ month", week: "/ week", night: "/ night", year: "/ year" };
  function Price(props) {
    return h("span", { className: cx("ers-price", "ers-price--" + (props.size || "md"), props.className) },
      props.original != null ? h("span", { className: "ers-price__orig" }, h("span", { className: "ers-sr" }, "was "), money(props.original, props.currency, props.locale)) : null,
      h("span", { className: "ers-price__amount" }, money(props.amount, props.currency, props.locale)),
      props.period ? h("span", { className: "ers-price__period" }, PERIOD[props.period] || props.period) : null,
      props.note ? h("span", { className: "ers-price__note" }, "· " + props.note) : null);
  }

  /* ---------------- Forms ---------------- */
  function FieldShell(props, control) {
    var hintId = props.id + "-hint";
    var msg = props.error || props.hint;
    return h("div", { className: cx("ers-field", props.className) },
      props.label ? h("label", { className: "ers-field__label", htmlFor: props.id }, h("span", null, props.label), props.optional ? h("span", { className: "ers-field__opt" }, "Optional") : null) : null,
      control(msg ? hintId : undefined),
      msg ? h("p", { id: hintId, className: cx("ers-field__hint", props.error && "ers-field__hint--error") }, props.error ? h(Icon, { name: "alert", size: 16 }) : null, h("span", null, msg)) : null,
      props.extra || null);
  }
  function inputProps(props, omit) {
    var p = Object.assign({}, props);
    ["label", "hint", "error", "iconLeft", "suffix", "optional", "className", "options", "placeholderOption", "extra"].concat(omit || []).forEach(function (k) { delete p[k]; });
    return p;
  }

  function TextField(props) {
    var auto = useId(); var id = props.id || auto;
    return FieldShell(Object.assign({}, props, { id: id }), function (desc) {
      return h("div", { className: cx("ers-control", props.error && "is-invalid", props.disabled && "is-disabled") },
        props.iconLeft ? h(Icon, { name: props.iconLeft, size: 20 }) : null,
        h("input", Object.assign({ type: "text" }, inputProps(props), { id: id, "aria-invalid": props.error ? true : undefined, "aria-describedby": desc })),
        props.suffix ? h("span", { className: "ers-control__suffix" }, props.suffix) : null);
    });
  }

  function Select(props) {
    var auto = useId(); var id = props.id || auto;
    var opts = (props.options || []).map(function (o) { o = typeof o === "string" ? { value: o, label: o } : o; return h("option", { key: o.value, value: o.value, disabled: o.disabled }, o.label); });
    if (props.placeholderOption) opts.unshift(h("option", { key: "__ph", value: "" }, props.placeholderOption));
    return FieldShell(Object.assign({}, props, { id: id }), function (desc) {
      return h("div", { className: cx("ers-control", props.error && "is-invalid", props.disabled && "is-disabled") },
        props.iconLeft ? h(Icon, { name: props.iconLeft, size: 20 }) : null,
        h("select", Object.assign({}, inputProps(props), { id: id, "aria-invalid": props.error ? true : undefined, "aria-describedby": desc }), opts),
        h(Icon, { name: "chevron-down", size: 18, className: "ers-control__chev" }));
    });
  }

  function Textarea(props) {
    var auto = useId(); var id = props.id || auto;
    var st = useState((props.value != null ? props.value : props.defaultValue) || "");
    var len = (props.value != null ? String(props.value) : st[0]).length;
    var extra = props.maxLength ? h("div", { className: "ers-field__count", "aria-live": "polite" }, len + " / " + props.maxLength) : null;
    return FieldShell(Object.assign({}, props, { id: id, extra: extra }), function (desc) {
      return h("div", { className: cx("ers-control", "ers-control--textarea", props.error && "is-invalid") },
        h("textarea", Object.assign({ rows: 4 }, inputProps(props), {
          id: id, "aria-invalid": props.error ? true : undefined, "aria-describedby": desc,
          onChange: function (e) { st[1](e.target.value); if (props.onChange) props.onChange(e); }
        })));
    });
  }

  function Checkbox(props) {
    var p = inputProps(props, ["description"]);
    return h("label", { className: cx("ers-check", props.className) },
      h("input", Object.assign({}, p, { type: "checkbox", className: "ers-check__input" })),
      h("span", { className: "ers-check__box", "aria-hidden": true }, h(Icon, { name: "check", size: 16, strokeWidth: 2.5 })),
      h("span", { className: "ers-check__text" }, props.label, props.description ? h("span", { className: "ers-check__desc" }, props.description) : null));
  }

  function RadioGroup(props) {
    var auto = useId(); var name = props.name || auto;
    var st = useControlled(props.value, props.defaultValue);
    var cards = props.variant === "cards";
    var items = (props.options || []).map(function (o) {
      o = typeof o === "string" ? { value: o, label: o } : o;
      var lab = h("label", { key: o.value, className: cx("ers-check", cards && "ers-radiocard") },
        h("input", { type: "radio", className: "ers-check__input", name: name, value: o.value, checked: st[0] === o.value, disabled: o.disabled,
          onChange: function () { st[1](o.value); if (props.onChange) props.onChange(o.value); } }),
        h("span", { className: "ers-check__box ers-check__box--radio", "aria-hidden": true }),
        h("span", { className: "ers-check__text" }, h("span", { style: cards ? { fontWeight: 600 } : null }, o.label), o.description ? h("span", { className: "ers-check__desc" }, o.description) : null));
      return lab;
    });
    return h("fieldset", { className: cx("ers-fieldset", props.className) },
      props.label ? h("legend", null, props.label) : null,
      cards ? h("div", { className: "ers-radiocards" }, items) : items);
  }

  function Switch(props) {
    var p = inputProps(props, ["description"]);
    return h("label", { className: cx("ers-switch", props.className) },
      h("span", { className: "ers-check__text" }, props.label, props.description ? h("span", { className: "ers-check__desc" }, props.description) : null),
      h("input", Object.assign({}, p, { type: "checkbox", role: "switch", className: "ers-switch__input" })),
      h("span", { className: "ers-switch__track", "aria-hidden": true }));
  }

  function Stepper(props) {
    var min = props.min != null ? props.min : 0, max = props.max != null ? props.max : 10;
    var st = useControlled(props.value, props.defaultValue != null ? props.defaultValue : min), v = st[0];
    function set(n) { n = Math.max(min, Math.min(max, n)); st[1](n); if (props.onChange) props.onChange(n); }
    return h("div", { className: cx("ers-stepper", props.className) },
      h("span", { className: "ers-check__text" }, props.label, props.description ? h("span", { className: "ers-check__desc" }, props.description) : null),
      h("div", { className: "ers-stepper__ctrl", role: "group", "aria-label": props.label },
        h(IconButton, { icon: "minus", label: "Decrease " + (props.label || ""), variant: "secondary", size: "sm", disabled: v <= min, onClick: function () { set(v - 1); } }),
        h("span", { className: "ers-stepper__value", "aria-live": "polite" }, v === max && props.maxLabel ? props.maxLabel : v),
        h(IconButton, { icon: "plus", label: "Increase " + (props.label || ""), variant: "secondary", size: "sm", disabled: v >= max, onClick: function () { set(v + 1); } })));
  }

  function SegmentedControl(props) {
    var opts = (props.options || []).map(function (o) { return typeof o === "string" ? { value: o, label: o } : o; });
    var st = useControlled(props.value, props.defaultValue != null ? props.defaultValue : (opts[0] && opts[0].value));
    return h("div", { className: cx("ers-seg", props.block && "ers-seg--block", props.className), role: "radiogroup", "aria-label": props.label },
      opts.map(function (o) {
        return h("button", { key: o.value, type: "button", role: "radio", "aria-checked": st[0] === o.value, className: "ers-seg__opt",
          onClick: function () { st[1](o.value); if (props.onChange) props.onChange(o.value); } },
          o.icon ? h(Icon, { name: o.icon, size: 18 }) : null, o.label);
      }));
  }

  function RangeSlider(props) {
    var min = props.min != null ? props.min : 0, max = props.max != null ? props.max : 100, step = props.step || 1;
    var st = useControlled(props.value, props.defaultValue || [min, max]), v = st[0];
    var fmt = props.format || function (n) { return money(n, props.currency); };
    function set(i, n) { var nv = v.slice(); nv[i] = Number(n); if (nv[0] > nv[1] - step) { if (i === 0) nv[0] = nv[1] - step; else nv[1] = nv[0] + step; } st[1](nv); if (props.onChange) props.onChange(nv); }
    var pct = function (n) { return ((n - min) / (max - min)) * 100; };
    return h("div", { className: cx("ers-range", props.className) },
      props.label ? h("span", { className: "ers-field__label" }, props.label) : null,
      h("div", { className: "ers-range__values", "aria-hidden": true }, h("span", null, fmt(v[0])), h("span", null, fmt(v[1]) + (v[1] >= max && props.maxPlus ? "+" : ""))),
      h("div", { className: "ers-range__rail" },
        h("div", { className: "ers-range__track" }),
        h("div", { className: "ers-range__fill", style: { left: pct(v[0]) + "%", right: (100 - pct(v[1])) + "%" } }),
        h("input", { type: "range", min: min, max: max, step: step, value: v[0], "aria-label": "Minimum " + (props.label || ""), "aria-valuetext": fmt(v[0]), onChange: function (e) { set(0, e.target.value); } }),
        h("input", { type: "range", min: min, max: max, step: step, value: v[1], "aria-label": "Maximum " + (props.label || ""), "aria-valuetext": fmt(v[1]), onChange: function (e) { set(1, e.target.value); } })));
  }

  function SearchBar(props) {
    var types = props.types || ["Any type", "Apartment", "House", "Studio", "Room", "Townhouse"];
    var loc = useState(props.defaultLocation || ""), mv = useState(props.defaultMoveIn || ""), ty = useState(types[0]);
    var uid = useId();
    if (props.variant === "compact") {
      return h("button", { type: "button", className: cx("ers-search", "ers-search--compact", props.className), onClick: props.onOpen },
        h(Icon, { name: "search", size: 20 }),
        h("span", { className: "ers-search__sum" }, h("b", null, props.defaultLocation || "Where do you want to live?"), h("span", null, props.summary || "Any time · Any type · Any budget")),
        h(IconButton, { icon: "sliders", label: "Filters", variant: "secondary", size: "sm", onClick: function (e) { e.stopPropagation(); if (props.onFilters) props.onFilters(); } }));
    }
    return h("form", { role: "search", className: cx("ers-search", props.className), onSubmit: function (e) { e.preventDefault(); if (props.onSearch) props.onSearch({ location: loc[0], moveIn: mv[0], type: ty[0] }); } },
      h("label", { className: "ers-search__seg", htmlFor: uid + "l" }, h("span", { className: "ers-search__lbl" }, "Location"),
        h("input", { id: uid + "l", value: loc[0], placeholder: "City, neighbourhood or address", onChange: function (e) { loc[1](e.target.value); }, autoComplete: "off" })),
      h("label", { className: "ers-search__seg", htmlFor: uid + "m" }, h("span", { className: "ers-search__lbl" }, "Move-in"),
        h("input", { id: uid + "m", value: mv[0], placeholder: "Any time", onChange: function (e) { mv[1](e.target.value); } })),
      h("label", { className: "ers-search__seg", htmlFor: uid + "t" }, h("span", { className: "ers-search__lbl" }, "Property type"),
        h("select", { id: uid + "t", value: ty[0], onChange: function (e) { ty[1](e.target.value); } }, types.map(function (t) { return h("option", { key: t }, t); }))),
      h(Button, { type: "submit", variant: "primary", size: "lg", iconLeft: "search", className: "ers-search__go" }, props.ctaLabel || "Search"));
  }

  function fmtBytes(n) { if (n == null) return ""; if (n < 1024) return n + " B"; if (n < 1048576) return Math.round(n / 1024) + " KB"; return (n / 1048576).toFixed(1) + " MB"; }
  function FileDrop(props) {
    var over = useState(false);
    var files = props.files || [];
    return h("div", { className: props.className },
      props.label ? h("div", { className: "ers-field__label", style: { marginBottom: 8 } }, props.label) : null,
      h("label", { className: cx("ers-drop", over[0] && "is-over"),
        onDragOver: function (e) { e.preventDefault(); over[1](true); }, onDragLeave: function () { over[1](false); },
        onDrop: function (e) { e.preventDefault(); over[1](false); if (props.onFiles) props.onFiles(Array.prototype.slice.call(e.dataTransfer.files)); } },
        h("input", { type: "file", accept: props.accept, multiple: props.multiple, onChange: function (e) { if (props.onFiles) props.onFiles(Array.prototype.slice.call(e.target.files)); } }),
        h("span", { className: "ers-drop__icon" }, h(Icon, { name: props.icon || "upload", size: 22 })),
        h("span", { className: "ers-drop__title" }, h("u", null, "Choose files"), " or drag them here"),
        h("span", { style: { fontSize: 13 } }, props.hint || "JPG, PNG or PDF up to 10 MB")),
      files.length ? h("ul", { className: "ers-files" }, files.map(function (f, i) {
        var tone = f.status === "error" ? "danger" : f.status === "done" ? "success" : null;
        return h("li", { key: i, className: "ers-file" },
          h("span", { className: "ers-fact__icon", style: { width: 36, height: 36 } }, h(Icon, { name: /\.(jpe?g|png|webp|heic)$/i.test(f.name) ? "image" : "file", size: 18 })),
          h("span", { className: "ers-file__body" },
            h("span", { className: "ers-file__name" }, f.name),
            f.progress != null && f.status !== "done" && f.status !== "error" ? h(Progress, { value: f.progress, size: "sm" }) : h("span", { className: "ers-file__meta" }, f.status === "error" ? (f.error || "Upload failed") : fmtBytes(f.size))),
          tone ? h(Icon, { name: tone === "success" ? "check-circle" : "alert", size: 20, style: { color: "var(--" + tone + ")" }, label: tone === "success" ? "Uploaded" : "Failed" }) : null,
          props.onRemove ? h(IconButton, { icon: "close", label: "Remove " + f.name, size: "sm", onClick: function () { props.onRemove(i); } }) : null);
      })) : null);
  }

  /* ---------------- Navigation ---------------- */
  function Tabs(props) {
    var items = props.items || [];
    var st = useControlled(props.value, props.defaultValue != null ? props.defaultValue : (items[0] && items[0].value));
    return h("div", { className: cx("ers-tabs", props.variant === "pill" && "ers-tabs--pill", props.className), role: "tablist", "aria-label": props.label },
      items.map(function (t) {
        return h("button", { key: t.value, type: "button", role: "tab", className: "ers-tab", "aria-selected": st[0] === t.value, tabIndex: st[0] === t.value ? 0 : -1,
          onClick: function () { st[1](t.value); if (props.onChange) props.onChange(t.value); } },
          t.icon ? h(Icon, { name: t.icon, size: 18 }) : null, t.label, t.count != null ? h("span", { className: "ers-tab__count" }, t.count) : null);
      }));
  }

  function Breadcrumbs(props) {
    var items = props.items || [];
    return h("nav", { "aria-label": "Breadcrumb", className: cx("ers-crumbs", props.className) },
      h("ol", null, items.map(function (it, i) {
        var last = i === items.length - 1, back = i === items.length - 2;
        return h("li", { key: i, className: back ? "is-back" : null },
          i > 0 ? h(Icon, { name: "chevron-right", size: 14, className: "ers-crumbs__sep" }) : null,
          last ? h("span", { "aria-current": "page" }, it.label)
            : h("a", { href: it.href || "#" }, back ? h(Icon, { name: "chevron-left", size: 16, className: "ers-crumbs__backicon" }) : null, it.label));
      })));
  }

  function pageList(cur, total) {
    var out = [], i;
    if (total <= 7) { for (i = 1; i <= total; i++) out.push(i); return out; }
    out.push(1);
    var s = Math.max(2, cur - 1), e = Math.min(total - 1, cur + 1);
    if (cur <= 3) { s = 2; e = 4; } if (cur >= total - 2) { s = total - 3; e = total - 1; }
    if (s > 2) out.push("…");
    for (i = s; i <= e; i++) out.push(i);
    if (e < total - 1) out.push("…");
    out.push(total); return out;
  }
  function Pagination(props) {
    var total = props.pageCount || 1;
    var st = useControlled(props.page, props.defaultPage || 1), cur = st[0];
    function go(n) { n = Math.max(1, Math.min(total, n)); st[1](n); if (props.onChange) props.onChange(n); }
    return h("nav", { className: cx("ers-pager", props.className), "aria-label": "Pagination" },
      h(Button, { variant: "secondary", size: "sm", iconLeft: "chevron-left", disabled: cur <= 1, onClick: function () { go(cur - 1); } }, "Previous"),
      h("span", { className: "ers-pager__status" }, "Page " + cur + " of " + total),
      h("div", { className: "ers-pager__pages" }, pageList(cur, total).map(function (n, i) {
        return n === "…" ? h("span", { key: "g" + i, className: "ers-pager__gap" }, "…")
          : h("button", { key: n, type: "button", className: "ers-pager__num", "aria-current": n === cur ? "page" : undefined, onClick: function () { go(n); } }, n);
      })),
      h(Button, { variant: "secondary", size: "sm", iconRight: "chevron-right", disabled: cur >= total, onClick: function () { go(cur + 1); } }, "Next"));
  }

  function Navbar(props) {
    var open = useState(!!props.defaultOpen);
    var links = props.links || [{ label: "Rent", href: "#", active: true }, { label: "Short stays", href: "#" }, { label: "For landlords", href: "#" }, { label: "Help", href: "#" }];
    var user = props.user;
    return h("header", { className: cx("ers-nav", props.className) },
      h("div", { className: "ers-nav__bar" },
        h(Logo, { href: props.homeHref || "#", size: "md" }),
        h("nav", { className: "ers-nav__links", "aria-label": "Main" }, links.map(function (l) { return h("a", { key: l.label, href: l.href, className: "ers-nav__link", "aria-current": l.active ? "page" : undefined }, l.label); })),
        h("div", { className: "ers-nav__right" },
          h("div", { className: "ers-nav__desk", style: { alignItems: "center", gap: 8 } },
            h(Button, { variant: "ghost", size: "sm", iconLeft: "plus", href: props.ctaHref || "#" }, props.ctaLabel || "List your property"),
            user ? h(Fragment, null,
              h(IconButton, { icon: "chat", label: "Messages", dot: user.unreadMessages }),
              h(IconButton, { icon: "bell", label: "Notifications", dot: user.unreadNotifications }),
              h(Avatar, { name: user.name, src: user.avatar, size: "sm" }))
              : h(Fragment, null, h(Button, { variant: "secondary", size: "sm", href: "#" }, "Log in"), h(Button, { variant: "primary", size: "sm", href: "#" }, "Sign up"))),
          h(IconButton, { icon: open[0] ? "close" : "menu", label: open[0] ? "Close menu" : "Open menu", className: "ers-nav__menu", "aria-expanded": open[0], onClick: function () { open[1](!open[0]); } }))),
      open[0] ? h("nav", { className: "ers-nav__drawer", "aria-label": "Mobile" },
        links.map(function (l) { return h("a", { key: l.label, href: l.href, "aria-current": l.active ? "page" : undefined }, l.label); }),
        user ? h("a", { href: "#" }, "Messages") : null,
        h(Button, { variant: "primary", block: true, iconLeft: "plus", href: props.ctaHref || "#" }, props.ctaLabel || "List your property")) : null);
  }

  function BottomNav(props) {
    var items = props.items || [
      { icon: "search", label: "Explore", active: true }, { icon: "heart", label: "Saved" }, { icon: "chat", label: "Inbox", badge: 2 }, { icon: "key", label: "Rentals" }, { icon: "user", label: "Profile" }];
    return h("nav", { className: cx("ers-bnav", props.position !== "static" && "ers-bnav--fixed", props.hideOnDesktop !== false && "ers-bnav--auto", props.className), "aria-label": "Primary" },
      items.map(function (it) {
        return h("a", { key: it.label, href: it.href || "#", className: "ers-bnav__item", "aria-current": it.active ? "page" : undefined, onClick: it.onClick },
          h(Icon, { name: it.active && it.icon === "heart" ? "heart-fill" : it.icon, size: 24 }), it.label,
          it.badge ? h("span", { className: "ers-bnav__badge" }, it.badge, h("span", { className: "ers-sr" }, " unread")) : null);
      }));
  }

  function Footer(props) {
    var cols = props.columns || [
      { title: "Renters", links: ["Search rentals", "Saved homes", "Rental guides", "Renter protection"] },
      { title: "Landlords", links: ["List a property", "Screen tenants", "Collect rent", "Pricing"] },
      { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
      { title: "Support", links: ["Help centre", "Safety", "Report a listing", "Accessibility"] }];
    return h("footer", { className: cx("ers-footer", props.className) },
      h("div", { className: "ers-footer__in" },
        h("div", { className: "ers-footer__brand" }, h(Logo, { size: "md" }), h("p", { style: { margin: 0 } }, props.tagline || "Verified homes, transparent prices and landlords who reply.")),
        cols.map(function (c) {
          return h("div", { key: c.title }, h("h4", null, c.title), h("ul", null, c.links.map(function (l) { var o = typeof l === "string" ? { label: l, href: "#" } : l; return h("li", { key: o.label }, h("a", { href: o.href }, o.label)); })));
        }),
        h("div", { className: "ers-footer__legal" }, h("span", null, "© " + (props.year || new Date().getFullYear()) + " EasyRentSpot"),
          h("span", { style: { display: "flex", gap: 16, flexWrap: "wrap" } }, ["Terms", "Privacy", "Cookies", "Sitemap"].map(function (t) { return h("a", { key: t, href: "#" }, t); })))));
  }

  /* ---------------- Layout ---------------- */
  function Container(props) {
    return h(props.as || "div", { className: cx("ers-container", props.size === "narrow" && "ers-container--narrow", props.className), style: props.style }, props.children);
  }
  function ListingGrid(props) {
    var style = Object.assign({}, props.style, props.min ? { "--min": props.min + "px" } : null);
    return h(props.as || "div", { className: cx("ers-grid", props.columns === 4 && "ers-grid--4", props.min && "ers-grid--auto", props.className), style: style }, props.children);
  }
  function SectionHeader(props) {
    var T = props.as || "h2";
    return h("div", { className: cx("ers-sechead", props.align === "center" && "ers-sechead--center", props.className) },
      h("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
        props.overline ? h("span", { className: "ers-sechead__over" }, props.overline) : null,
        h(T, { className: "ers-sechead__title" }, props.title),
        props.description ? h("p", { className: "ers-sechead__desc" }, props.description) : null),
      props.action || null);
  }
  function Card(props) {
    var p = Object.assign({}, props);
    ["as", "padding", "elevated", "interactive", "title", "className", "children"].forEach(function (k) { delete p[k]; });
    return h(props.as || "div", Object.assign(p, { className: cx("ers-card", "ers-card--pad-" + (props.padding || "md"), props.elevated && "ers-card--elevated", props.interactive && "ers-card--interactive", props.className) }),
      props.title ? h("h3", { className: "ers-card__title" }, props.title) : null, props.children);
  }

  /* ---------------- Listings ---------------- */
  function ImagePlaceholder(props) {
    var kind = props.kind || "house";
    var s = [h("rect", { key: "sky", className: "sky", x: 0, y: 0, width: 320, height: 240 }), h("circle", { key: "sun", className: "sun", cx: 262, cy: 58, r: 26 }), h("rect", { key: "g", className: "ground", x: 0, y: 190, width: 320, height: 50 })];
    if (kind === "apartment") {
      s.push(h("rect", { key: "b", className: "wall", x: 92, y: 36, width: 104, height: 154 }), h("rect", { key: "b2", className: "roof", x: 196, y: 86, width: 64, height: 104 }));
      for (var r = 0; r < 5; r++) for (var c = 0; c < 3; c++) s.push(h("rect", { key: "w" + r + c, className: "win", x: 104 + c * 30, y: 50 + r * 26, width: 20, height: 16, rx: 2 }));
      for (var r2 = 0; r2 < 3; r2++) s.push(h("rect", { key: "v" + r2, className: "wall2", x: 210, y: 100 + r2 * 28, width: 36, height: 14, rx: 2 }));
      s.push(h("rect", { key: "d", className: "door", x: 132, y: 166, width: 24, height: 24 }));
    } else if (kind === "townhouse") {
      [["roof", 40], ["roof2", 120], ["door", 200]].forEach(function (t, i) {
        var x = t[1];
        s.push(h("rect", { key: "w" + i, className: i === 1 ? "wall2" : "wall", x: x, y: 96, width: 80, height: 94 }));
        s.push(h("polygon", { key: "r" + i, className: t[0] === "door" ? "roof" : t[0], points: (x - 4) + ",98 " + (x + 40) + ",58 " + (x + 84) + ",98" }));
        s.push(h("rect", { key: "a" + i, className: "win", x: x + 14, y: 112, width: 20, height: 22, rx: 2 }), h("rect", { key: "b" + i, className: "win", x: x + 46, y: 112, width: 20, height: 22, rx: 2 }));
        s.push(h("rect", { key: "d" + i, className: i === 2 ? "roof2" : "door", x: x + 30, y: 152, width: 20, height: 38 }));
      });
    } else if (kind === "cabin") {
      s.push(h("polygon", { key: "a", className: "roof", points: "160,52 76,190 244,190" }), h("polygon", { key: "b", className: "wall", points: "160,92 108,190 212,190" }),
        h("rect", { key: "d", className: "door", x: 148, y: 150, width: 24, height: 40 }), h("rect", { key: "w", className: "win", x: 146, y: 112, width: 28, height: 22, rx: 2 }),
        h("polygon", { key: "t1", className: "tree", points: "46,190 30,190 38,120 64,190" }), h("polygon", { key: "t2", className: "tree", points: "282,190 262,190 274,128 294,190" }));
    } else {
      s.push(h("rect", { key: "b", className: "wall", x: 96, y: 112, width: 128, height: 78 }), h("polygon", { key: "r", className: "roof", points: "84,116 160,62 236,116" }),
        h("rect", { key: "d", className: "door", x: 148, y: 146, width: 24, height: 44 }), h("rect", { key: "w1", className: "win", x: 110, y: 128, width: 26, height: 22, rx: 2 }),
        h("rect", { key: "w2", className: "win", x: 184, y: 128, width: 26, height: 22, rx: 2 }), h("circle", { key: "t", className: "tree", cx: 266, cy: 158, r: 22 }), h("rect", { key: "tt", className: "roof2", x: 263, y: 170, width: 6, height: 20 }));
    }
    return h("svg", { className: cx("ers-ph", props.className), viewBox: "0 0 320 240", preserveAspectRatio: "xMidYMid slice", role: "img", "aria-label": props.label || "Photo coming soon" }, s);
  }

  function Media(props) { return props.image ? h("img", { src: props.image, alt: props.alt || "", loading: "lazy" }) : h(ImagePlaceholder, { kind: props.kind, label: props.alt }); }

  function PropertyCard(props) {
    var layout = props.layout || "vertical";
    var unit = props.areaUnit || "m²";
    var specs = [];
    if (props.beds != null) specs.push(h("span", { key: "b" }, h(Icon, { name: "bed", size: 16 }), props.beds === 0 ? "Studio" : props.beds + " bed" + (props.beds > 1 ? "s" : "")));
    if (props.baths != null) specs.push(h("span", { key: "ba" }, h(Icon, { name: "bath", size: 16 }), props.baths + " bath" + (props.baths > 1 ? "s" : "")));
    if (props.area != null) specs.push(h("span", { key: "a" }, h(Icon, { name: "area", size: 16 }), props.area + " " + unit));
    return h("article", { className: cx("ers-pcard", "ers-pcard--" + layout, props.className) },
      h("div", { className: "ers-pcard__media" },
        h(Media, { image: props.image, alt: props.imageAlt || props.title, kind: props.kind }),
        props.badges && props.badges.length ? h("div", { className: "ers-pcard__tags" }, props.badges.map(function (b, i) { b = typeof b === "string" ? { label: b } : b; return h(Badge, { key: i, tone: b.tone || "neutral", variant: "solid", icon: b.icon }, b.label); })) : null,
        props.onSaveChange !== null ? h("div", { className: "ers-pcard__fav" }, h(FavoriteButton, { saved: props.saved, defaultSaved: props.defaultSaved, onChange: props.onSaveChange, size: "sm" })) : null,
        props.photoCount ? h("span", { className: "ers-pcard__count" }, h(Icon, { name: "camera", size: 14 }), props.photoCount) : null),
      h("div", { className: "ers-pcard__body" },
        h("div", { className: "ers-pcard__row" },
          h("h3", { className: "ers-pcard__title" }, h("a", { href: props.href || "#" }, props.title)),
          props.rating != null ? h(Rating, { value: props.rating, count: props.reviews, size: "sm" }) : null),
        props.location ? h("span", { className: "ers-pcard__loc" }, h(Icon, { name: "map-pin", size: 16 }), props.location) : null,
        specs.length ? h("div", { className: "ers-pcard__specs" }, specs) : null,
        h("div", { className: "ers-pcard__foot" },
          h(Price, { amount: props.price, currency: props.currency, period: props.period === undefined ? "month" : props.period, original: props.originalPrice }),
          props.availableFrom ? h("span", { className: "ers-pcard__avail" }, props.availableFrom) : null),
        props.footer || null));
  }

  function Gallery(props) {
    var imgs = props.images || [];
    var idx = useState(0), track = useRef(null);
    return h("div", { className: cx("ers-gallery", props.className) },
      h("div", { className: "ers-gallery__track", ref: track, onScroll: function (e) { var el = e.currentTarget; idx[1](Math.round(el.scrollLeft / Math.max(1, el.clientWidth))); } },
        imgs.map(function (im, i) { return h("button", { key: i, type: "button", className: "ers-gallery__item", "aria-label": "Open photo " + (i + 1) + " of " + imgs.length, onClick: function () { if (props.onOpen) props.onOpen(i); } }, h(Media, { image: im.src, alt: im.alt, kind: im.kind })); })),
      h("span", { className: "ers-gallery__counter", "aria-hidden": true }, (idx[0] + 1) + " / " + imgs.length),
      h(Button, { variant: "secondary", size: "sm", iconLeft: "grid", className: "ers-gallery__all", onClick: function () { if (props.onOpen) props.onOpen(0); } }, "Show all " + (props.total || imgs.length) + " photos"));
  }

  function KeyFacts(props) {
    return h("dl", { className: cx("ers-facts", props.className) }, (props.items || []).map(function (it, i) {
      return h("div", { key: i, className: "ers-fact" }, h("span", { className: "ers-fact__icon" }, h(Icon, { name: it.icon, size: 20 })), h("div", null, h("dt", null, it.label), h("dd", null, it.value)));
    }));
  }

  function AmenityList(props) {
    var items = props.items || [], lim = props.limit;
    var shown = lim ? items.slice(0, lim) : items;
    return h("div", { className: cx("ers-amen-wrap", props.className) },
      h("ul", { className: cx("ers-amen", "ers-amen--" + (props.columns || 2)) }, shown.map(function (it, i) {
        var off = it.available === false;
        return h("li", { key: i, className: off ? "is-off" : null }, h(Icon, { name: it.icon || "check", size: 22 }), h("span", null, off ? h("span", { className: "ers-sr" }, "Not included: ") : null, it.label));
      })),
      lim && items.length > lim ? h(Button, { variant: "secondary", onClick: props.onShowAll }, "Show all " + items.length + " amenities") : null);
  }

  function MapPin(props) {
    if (props.count) return h("button", { type: "button", className: cx("ers-pin", "ers-pin--cluster", props.className), "aria-label": props.count + " homes here", onClick: props.onClick, style: props.style }, props.count);
    return h("button", { type: "button", className: cx("ers-pin", props.active && "is-active", props.visited && "is-visited", props.className), "aria-pressed": !!props.active, onClick: props.onClick, style: props.style },
      props.saved ? h(Icon, { name: "heart-fill", size: 14, label: "Saved" }) : null, money(props.price, props.currency));
  }

  /* ---------------- Calendar ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }
  function Calendar(props) {
    var start = props.month ? new Date(props.month + (String(props.month).length === 7 ? "-01T00:00" : "")) : new Date();
    var view = useState({ y: start.getFullYear(), m: start.getMonth() });
    var st = useControlled(props.value, props.defaultValue);
    var y = view[0].y, m = view[0].m;
    var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
    var lead = (first.getDay() + 6) % 7; // Monday first
    var off = {}; (props.unavailable || []).forEach(function (d) { off[d] = 1; });
    var today = props.today || (function () { var t = new Date(); return iso(t.getFullYear(), t.getMonth(), t.getDate()); })();
    var min = props.minDate;
    var cells = [];
    ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(function (d) { cells.push(h("span", { key: d, className: "ers-cal__dow", "aria-hidden": true }, d)); });
    for (var i = 0; i < lead; i++) cells.push(h("span", { key: "e" + i }));
    for (var d = 1; d <= days; d++) {
      (function (d) {
        var k = iso(y, m, d), disabled = !!off[k] || (min && k < min);
        cells.push(h("button", { key: k, type: "button", className: cx("ers-cal__day", k === today && "is-today"), disabled: disabled, "aria-pressed": st[0] === k,
          "aria-label": new Date(y, m, d).toLocaleDateString(props.locale || "en-US", { weekday: "long", month: "long", day: "numeric" }) + (disabled ? ", unavailable" : ""),
          onClick: function () { st[1](k); if (props.onChange) props.onChange(k); } }, d));
      })(d);
    }
    function shift(n) { var nm = m + n, ny = y; if (nm < 0) { nm = 11; ny--; } if (nm > 11) { nm = 0; ny++; } view[1]({ y: ny, m: nm }); }
    return h("div", { className: cx("ers-cal", props.className) },
      h("div", { className: "ers-cal__head" },
        h(IconButton, { icon: "chevron-left", label: "Previous month", size: "sm", onClick: function () { shift(-1); } }),
        h("span", { className: "ers-cal__title", "aria-live": "polite" }, first.toLocaleDateString(props.locale || "en-US", { month: "long", year: "numeric" })),
        h(IconButton, { icon: "chevron-right", label: "Next month", size: "sm", onClick: function () { shift(1); } })),
      h("div", { className: "ers-cal__grid" }, cells),
      props.legend !== false ? h("div", { className: "ers-cal__legend" }, h("span", null, h("i", { className: "ers-cal__sw" }), "Selected"), h("span", null, h("i", { className: "ers-cal__sw ers-cal__sw--off" }), "Unavailable")) : null);
  }

  /* ---------------- Booking ---------------- */
  function BookingPanel(props) {
    var cur = props.currency;
    var leases = props.leaseOptions || ["12 months", "6 months", "Month-to-month"];
    var fees = props.fees || [];
    var lines = [{ label: "First month's rent", amount: props.price }];
    if (props.deposit) lines.push({ label: "Security deposit (refundable)", amount: props.deposit });
    fees.forEach(function (f) { lines.push(f); });
    var total = lines.reduce(function (s, l) { return s + (Number(l.amount) || 0); }, 0);
    return h("aside", { className: cx("ers-book", props.sticky && "ers-book--sticky", props.className), "aria-label": "Rent this home" },
      h("div", { className: "ers-book__head" },
        h(Price, { amount: props.price, currency: cur, period: props.period || "month", size: "lg" }),
        props.rating != null ? h(Rating, { value: props.rating, count: props.reviews }) : null),
      props.availability ? h(Badge, { tone: "success", icon: "calendar", size: "lg" }, props.availability) : null,
      h("div", { className: "ers-book__fields" },
        h(TextField, { label: "Move-in", type: "date", defaultValue: props.moveIn }),
        h(Select, { label: "Lease length", options: leases, defaultValue: props.defaultLease })),
      h("ul", { className: "ers-book__lines" }, lines.map(function (l, i) { return h("li", { key: i }, h("span", null, l.label), h("span", null, money(l.amount, cur))); })),
      h("div", { className: "ers-book__total" }, h("span", null, props.totalLabel || "Due at signing"), h("span", null, money(total, cur))),
      h("div", { className: "ers-book__actions" },
        h(Button, { variant: "primary", size: "lg", block: true, onClick: props.onRequest }, props.ctaLabel || "Request to rent"),
        h(Button, { variant: "secondary", size: "lg", block: true, iconLeft: "chat", onClick: props.onMessage }, props.secondaryLabel || "Message landlord")),
      h("p", { className: "ers-book__note" }, h(Icon, { name: "shield-check", size: 16 }), props.note || "You won't be charged until the landlord accepts"));
  }

  function StickyActionBar(props) {
    return h("div", { className: cx("ers-sab", props.position !== "static" && "ers-sab--fixed", props.hideOnDesktop !== false && "ers-sab--auto", props.className) },
      h("div", { className: "ers-sab__info" },
        h(Price, { amount: props.price, currency: props.currency, period: props.period || "month", size: "md" }),
        props.sub ? h("span", { className: "ers-sab__sub" }, props.sub) : null),
      h(Button, { variant: props.variant || "primary", size: "lg", onClick: props.onAction }, props.actionLabel || "Request to rent"));
  }

  function HostCard(props) {
    return h(Card, { padding: "lg", className: cx("ers-host", props.className) },
      h("div", { className: "ers-host__top" },
        h(Avatar, { name: props.name, src: props.avatar, size: "lg", verified: props.verified }),
        h("div", null,
          h("h3", { className: "ers-host__name" }, props.name, props.verified ? h(Badge, { tone: "success", icon: "shield-check" }, "ID verified") : null),
          h("span", { className: "ers-host__role" }, (props.role || "Landlord") + (props.joined ? " · Joined " + props.joined : "")))),
      h("dl", { className: "ers-host__stats" },
        h("div", null, h("dt", null, "Response rate"), h("dd", null, props.responseRate || "—")),
        h("div", null, h("dt", null, "Replies in"), h("dd", null, props.responseTime || "—")),
        h("div", null, h("dt", null, "Listings"), h("dd", null, props.listings != null ? props.listings : "—"))),
      props.children ? h("p", { style: { margin: 0, color: "var(--ink-muted)" } }, props.children) : null,
      h("div", { className: "ers-host__actions" },
        h(Button, { variant: "primary", iconLeft: "chat", onClick: props.onContact }, "Message"),
        props.onCall !== null ? h(Button, { variant: "secondary", iconLeft: "phone", onClick: props.onCall }, "Call") : null));
  }

  function ReviewCard(props) {
    return h("article", { className: cx("ers-review", props.className) },
      h("div", { className: "ers-review__head" },
        h(Avatar, { name: props.author, src: props.avatar, size: "md" }),
        h("div", { className: "ers-review__who" },
          h("span", { className: "ers-review__name" }, props.author),
          h("span", { className: "ers-review__meta" }, [props.date, props.stay].filter(Boolean).join(" · ")))),
      props.rating != null ? h(Rating, { value: props.rating, variant: "stars", showValue: false }) : null,
      h("p", { className: "ers-review__text" }, props.children),
      props.reply ? h("p", { className: "ers-review__reply" }, h("b", null, "Response from " + (props.replyFrom || "landlord") + ": "), props.reply) : null);
  }

  function MessageThread(props) {
    var msgs = useState(props.messages || []), draft = useState("");
    var body = useRef(null);
    useEffect(function () { if (body.current) body.current.scrollTop = body.current.scrollHeight; }, [msgs[0].length]);
    var c = props.contact || {};
    function send(e) {
      e.preventDefault(); var t = draft[0].trim(); if (!t) return;
      msgs[1](msgs[0].concat([{ from: "me", text: t, time: "Now" }])); draft[1]("");
      if (props.onSend) props.onSend(t);
    }
    return h("section", { className: cx("ers-thread", props.className), style: props.style, "aria-label": "Conversation with " + (c.name || "contact") },
      h("div", { className: "ers-thread__head" },
        props.onBack ? h(IconButton, { icon: "chevron-left", label: "Back to inbox", onClick: props.onBack }) : null,
        h(Avatar, { name: c.name, src: c.avatar, size: "sm", verified: c.verified }),
        h("div", { className: "ers-thread__who" }, h("b", null, c.name), c.subtitle ? h("span", null, c.subtitle) : null),
        h(IconButton, { icon: "more", label: "Conversation options" })),
      h("div", { className: "ers-thread__body", ref: body, "aria-live": "polite" }, msgs[0].map(function (m, i) {
        if (m.day) return h("span", { key: i, className: "ers-thread__day" }, m.day);
        return h("div", { key: i, className: cx("ers-msg", m.from === "me" && "ers-msg--me") }, h("div", { className: "ers-msg__bubble" }, m.text), m.time ? h("span", { className: "ers-msg__time" }, m.time) : null);
      })),
      h("form", { className: "ers-thread__compose", onSubmit: send },
        h(IconButton, { icon: "plus", label: "Attach file" }),
        h("input", { value: draft[0], onChange: function (e) { draft[1](e.target.value); }, placeholder: props.placeholder || "Write a message…", "aria-label": "Message" }),
        h(IconButton, { type: "submit", icon: "send", label: "Send", variant: "primary" })));
  }

  /* ---------------- Feedback ---------------- */
  var TONE_ICON = { info: "info", success: "check-circle", warning: "alert", danger: "x-circle", brand: "info", neutral: "info" };
  function Alert(props) {
    var tone = props.tone || "info";
    return h("div", { className: cx("ers-alert", "ers-alert--" + tone, props.className), role: tone === "danger" ? "alert" : "status" },
      h(Icon, { name: props.icon || TONE_ICON[tone], size: 20, className: "ers-alert__icon" }),
      h("div", { className: "ers-alert__body" }, props.title ? h("span", { className: "ers-alert__title" }, props.title) : null, props.children ? h("span", null, props.children) : null,
        props.action ? h("div", { className: "ers-alert__action" }, props.action) : null),
      props.onDismiss ? h(IconButton, { icon: "close", label: "Dismiss", size: "sm", className: "ers-alert__x", onClick: props.onDismiss }) : null);
  }
  function Toast(props) {
    var tone = props.tone || "neutral";
    return h("div", { className: cx("ers-toast", "ers-toast--" + tone, props.className), role: "status", "aria-live": "polite" },
      h(Icon, { name: props.icon || TONE_ICON[tone], size: 20, className: "ers-toast__icon" }),
      h("div", { className: "ers-toast__body" }, props.title ? h("b", null, props.title) : null, props.children ? h("span", null, props.children) : null),
      props.actionLabel ? h(Button, { variant: "link", onClick: props.onAction }, props.actionLabel) : null,
      props.onDismiss ? h(IconButton, { icon: "close", label: "Dismiss", size: "sm", onClick: props.onDismiss }) : null);
  }

  function Modal(props) {
    var tid = useId();
    useEffect(function () {
      if (!props.open) return;
      function k(e) { if (e.key === "Escape" && props.onClose) props.onClose(); }
      document.addEventListener("keydown", k); return function () { document.removeEventListener("keydown", k); };
    }, [props.open]);
    if (!props.open) return null;
    return h("div", { className: "ers-overlay", onMouseDown: function (e) { if (e.target === e.currentTarget && props.onClose) props.onClose(); } },
      h("div", { className: cx("ers-modal", props.size && "ers-modal--" + props.size, props.className), role: "dialog", "aria-modal": true, "aria-labelledby": tid },
        h("div", { className: "ers-modal__grab", "aria-hidden": true }),
        h("div", { className: "ers-modal__head" }, h("h2", { className: "ers-modal__title", id: tid }, props.title), h(IconButton, { icon: "close", label: "Close", onClick: props.onClose })),
        h("div", { className: "ers-modal__body" }, props.children),
        props.footer ? h("div", { className: "ers-modal__foot" }, props.footer) : null));
  }

  function Menu(props) {
    var open = useState(!!props.defaultOpen), ref = useRef(null);
    useEffect(function () {
      if (!open[0]) return;
      function d(e) { if (ref.current && !ref.current.contains(e.target)) open[1](false); }
      function k(e) { if (e.key === "Escape") open[1](false); }
      document.addEventListener("mousedown", d); document.addEventListener("keydown", k);
      return function () { document.removeEventListener("mousedown", d); document.removeEventListener("keydown", k); };
    }, [open[0]]);
    var trig = props.trigger
      ? React.cloneElement(props.trigger, { onClick: function () { open[1](!open[0]); }, "aria-haspopup": "menu", "aria-expanded": open[0] })
      : h(Button, { variant: "secondary", iconRight: "chevron-down", onClick: function () { open[1](!open[0]); }, "aria-haspopup": "menu", "aria-expanded": open[0] }, props.label || "Options");
    return h("div", { className: cx("ers-menu", props.className), ref: ref }, trig,
      open[0] ? h("ul", { className: cx("ers-menu__list", props.align === "start" && "ers-menu__list--start"), role: "menu" }, (props.items || []).map(function (it, i) {
        if (it.divider) return h("li", { key: i, className: "ers-menu__sep", role: "separator" });
        return h("li", { key: i, role: "none" }, h("button", { type: "button", role: it.checked != null ? "menuitemradio" : "menuitem", "aria-checked": it.checked != null ? !!it.checked : undefined,
          className: cx("ers-menu__item", it.danger && "ers-menu__item--danger"), onClick: function () { open[1](false); if (it.onSelect) it.onSelect(); } },
          it.icon ? h(Icon, { name: it.icon, size: 18 }) : null, it.label, it.checked ? h(Icon, { name: "check", size: 18, className: "ers-menu__check" }) : null));
      })) : null);
  }

  function Tooltip(props) {
    var id = useId();
    var child = React.isValidElement(props.children) ? React.cloneElement(props.children, { "aria-describedby": id }) : props.children;
    return h("span", { className: cx("ers-tip", props.className) }, child, h("span", { role: "tooltip", id: id, className: "ers-tip__bubble" }, props.content));
  }

  function Progress(props) {
    var max = props.max || 100, v = Math.max(0, Math.min(max, props.value || 0)), pct = Math.round((v / max) * 100);
    return h("div", { className: cx("ers-progress", props.tone && "ers-progress--" + props.tone, props.size === "sm" && "ers-progress--sm", props.indeterminate && "is-indeterminate", props.className) },
      props.label ? h("div", { className: "ers-progress__top" }, h("span", null, props.label), props.showValue !== false && !props.indeterminate ? h("span", null, props.valueLabel || pct + "%") : null) : null,
      h("div", { className: "ers-progress__bar", role: "progressbar", "aria-label": props.label || "Progress", "aria-valuemin": 0, "aria-valuemax": max, "aria-valuenow": props.indeterminate ? undefined : v },
        h("div", { className: "ers-progress__fill", style: { width: pct + "%" } })));
  }

  function Spinner(props) {
    return h("span", { className: cx("ers-spinner-wrap", props.className), role: "status" },
      h("span", { className: cx("ers-spinner", props.size === "lg" && "ers-spinner--lg"), "aria-hidden": true }),
      props.label ? h("span", null, props.label) : h("span", { className: "ers-sr" }, "Loading"));
  }

  function Steps(props) {
    var cur = props.current || 0;
    return h("ol", { className: cx("ers-steps", props.orientation !== "vertical" && "ers-steps--auto", props.className) }, (props.steps || []).map(function (s, i) {
      s = typeof s === "string" ? { label: s } : s;
      var state = i < cur ? "is-done" : i === cur ? "is-current" : "";
      return h("li", { key: i, className: cx("ers-step", state), "aria-current": i === cur ? "step" : undefined },
        h("span", { className: "ers-step__dot" }, i < cur ? h(Icon, { name: "check", size: 16, strokeWidth: 2.5, label: "Completed" }) : i + 1),
        h("span", { className: "ers-step__text" }, h("span", { className: "ers-step__label" }, s.label), s.description ? h("span", { className: "ers-step__desc" }, s.description) : null));
    }));
  }

  function Skeleton(props) {
    var v = props.variant || "text";
    if (v === "text" && props.lines > 1) {
      var ls = []; for (var i = 0; i < props.lines; i++) ls.push(h("span", { key: i, className: "ers-skel ers-skel--text", style: { width: i === props.lines - 1 ? "60%" : "100%" } }));
      return h("span", { className: props.className, style: { display: "block" }, "aria-hidden": true }, ls);
    }
    var st = { width: props.width != null ? props.width : (v === "circle" ? 44 : "100%"), height: props.height != null ? props.height : (v === "circle" ? (props.width || 44) : v === "rect" ? 160 : undefined) };
    return h("span", { className: cx("ers-skel", "ers-skel--" + v, props.className), style: Object.assign(st, props.style), "aria-hidden": true });
  }

  function EmptyState(props) {
    return h("div", { className: cx("ers-empty", props.className) },
      h("span", { className: "ers-empty__icon" }, h(Icon, { name: props.icon || "search", size: 28 })),
      h("h3", { className: "ers-empty__title" }, props.title),
      props.children ? h("p", { className: "ers-empty__text" }, props.children) : null,
      props.actions ? h("div", { className: "ers-empty__actions" }, props.actions) : null);
  }

  function Accordion(props) {
    return h("div", { className: cx("ers-acc", props.className) }, (props.items || []).map(function (it, i) {
      return h("details", { key: i, open: props.defaultOpen === i || undefined }, h("summary", null, it.title, h(Icon, { name: "chevron-down", size: 20 })), h("div", { className: "ers-acc__body" }, it.content));
    }));
  }

  /* ---------------- Dashboard ---------------- */
  function StatCard(props) {
    var trend = props.trend || (props.delta ? (String(props.delta).trim()[0] === "-" ? "down" : "up") : "flat");
    return h("div", { className: cx("ers-stat", props.className) },
      h("div", { className: "ers-stat__top" }, h("span", null, props.label), props.icon ? h("span", { className: "ers-stat__icon" }, h(Icon, { name: props.icon, size: 18 })) : null),
      h("div", { className: "ers-stat__value" }, props.value),
      props.delta || props.hint ? h("div", { className: "ers-stat__foot" },
        props.delta ? h("span", { className: "ers-delta ers-delta--" + (trend === "flat" ? "flat" : trend === (props.positive || "up") ? "good" : "bad") }, trend !== "flat" ? h(Icon, { name: trend === "up" ? "trend-up" : "trend-down", size: 14, label: trend === "up" ? "Up" : "Down" }) : null, props.delta) : null,
        props.hint ? h("span", null, props.hint) : null) : null);
  }

  function DataTable(props) {
    var cols = props.columns || [], rows = props.rows || [];
    return h("div", { className: cx("ers-table-wrap", props.className) },
      h("table", { className: "ers-table" },
        props.caption ? h("caption", null, props.caption) : null,
        h("thead", null, h("tr", null, cols.map(function (c) { return h("th", { key: c.key, scope: "col", className: c.align === "right" ? "is-right" : null }, c.label); }))),
        h("tbody", null, rows.map(function (r, i) {
          return h("tr", { key: props.rowKey ? r[props.rowKey] : i }, cols.map(function (c, j) {
            return h("td", { key: c.key, "data-label": c.label, className: cx(j === 0 && "is-primary", c.align === "right" && "is-right") }, c.render ? c.render(r) : r[c.key]);
          }));
        }))),
      props.footer ? h("div", { style: { padding: "12px 16px", borderTop: "1px solid var(--line)" } }, props.footer) : null);
  }

  var api = {
    Icon: Icon, Logo: Logo, Button: Button, IconButton: IconButton, FavoriteButton: FavoriteButton, Badge: Badge, Chip: Chip, Avatar: Avatar, Rating: Rating, Price: Price,
    TextField: TextField, Select: Select, Textarea: Textarea, Checkbox: Checkbox, RadioGroup: RadioGroup, Switch: Switch, Stepper: Stepper, SegmentedControl: SegmentedControl,
    RangeSlider: RangeSlider, SearchBar: SearchBar, FileDrop: FileDrop, Tabs: Tabs, Breadcrumbs: Breadcrumbs, Pagination: Pagination, Navbar: Navbar, BottomNav: BottomNav,
    Footer: Footer, Container: Container, ListingGrid: ListingGrid, SectionHeader: SectionHeader, Card: Card, ImagePlaceholder: ImagePlaceholder, PropertyCard: PropertyCard,
    Gallery: Gallery, KeyFacts: KeyFacts, AmenityList: AmenityList, MapPin: MapPin, Calendar: Calendar, BookingPanel: BookingPanel, StickyActionBar: StickyActionBar,
    HostCard: HostCard, ReviewCard: ReviewCard, MessageThread: MessageThread, Alert: Alert, Toast: Toast, Modal: Modal, Menu: Menu, Tooltip: Tooltip, Progress: Progress,
    Spinner: Spinner, Steps: Steps, Skeleton: Skeleton, EmptyState: EmptyState, Accordion: Accordion, StatCard: StatCard, DataTable: DataTable,
    formatMoney: money
  };
  window.ERS = Object.assign(window.ERS || {}, api);
})();
