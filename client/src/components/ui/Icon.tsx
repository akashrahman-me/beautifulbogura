/** The system's own outline icon set: 24px grid, 1.75 stroke, round caps, currentColor. */
const ICONS = {
  search: ['c:11,11,7', 'M20 20l-3.5-3.5'],
  x: ['M6 6l12 12M18 6L6 18'],
  menu: ['M4 7h16M4 12h16M4 17h10'],
  sun: ['c:12,12,4', 'M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  moon: ['M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'],
  phone: ['M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
  whatsapp: ['M4 20l1.3-3.9A8 8 0 1 1 8 19z', 'M9 9.5c.3 2.6 2.4 4.8 5 5.2l1.2-1.4-1.8-.9-.8.7a3.6 3.6 0 0 1-1.9-1.9l.7-.8-.9-1.8z'],
  copy: ['M9 9h11v11H9z', 'M15 9V4H4v11h5'],
  home: ['M4 11l8-7 8 7v9h-5v-6h-6v6H4z'],
  grid: ['M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  drop: ['M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z'],
  siren: ['M6 18v-6a6 6 0 0 1 12 0v6', 'M4 18h16v3H4zM12 3v-.5M4.5 6.5l-1-1M19.5 6.5l1-1M12 11v4'],
  cloud: ['M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7z'],
  'cloud-sun': ['M8.5 5.5a4 4 0 0 1 6.9 1.6', 'M5 4.5l-1-1M8.5 2.5V1.5M2.5 8.5h-1', 'M8 20h9a3.5 3.5 0 0 0 .5-7A5.5 5.5 0 0 0 7 14a3 3 0 0 0 1 6z'],
  rain: ['M7 15h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 8a3.5 3.5 0 0 0 1 7z', 'M8 18l-1 3M12 18l-1 3M16 18l-1 3'],
  bell: ['M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z', 'M10 21h4'],
  'bell-off': ['M6 16v-5a6 6 0 0 1 9-5.2M18 11v5l2 2H8', 'M10 21h4M3 3l18 18'],
  pin: ['M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z', 'c:12,9,2.5'],
  clock: ['c:12,12,9', 'M12 7v5l3 2'],
  calendar: ['M4 6h16v14H4zM4 10h16M8 3v4M16 3v4'],
  'chevron-right': ['M9 6l6 6-6 6'],
  'chevron-left': ['M15 6l-6 6 6 6'],
  'chevron-down': ['M6 9l6 6 6-6'],
  'arrow-right': ['M5 12h14M13 6l6 6-6 6'],
  'arrow-left': ['M19 12H5M11 6l-6 6 6 6'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  check: ['M5 12.5l4.5 4.5L19 7'],
  alert: ['M12 3.5l9.5 16.5h-19z', 'M12 10v4.5M12 17.2v.3'],
  info: ['c:12,12,9', 'M12 11v5.5M12 7.7v.3'],
  flag: ['M5 21V4M5 4h12l-2.5 4 2.5 4H5'],
  edit: ['M4 20h4L19 9l-4-4L4 16z', 'M13.5 6.5l4 4'],
  trash: ['M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'],
  lock: ['M6 11h12v9H6z', 'M8.5 11V8a3.5 3.5 0 0 1 7 0v3'],
  heart: ['M12 20s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.4 12 20 12 20z'],
  star: ['M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z'],
  verified: ['M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z', 'M9 12l2 2 4-4'],
  briefcase: ['M4 8h16v11H4z', 'M9 8V5h6v3M4 13h16'],
  book: ['M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5zM12 6v14.5'],
  car: ['M5 16v-4l2-5h10l2 5v4', 'M3 12h18v5H3zM6 17v2.5M18 17v2.5M7 14.5h1M16 14.5h1'],
  house: ['M3 11l9-7 9 7', 'M5 9.5V20h14V9.5M10 20v-5h4v5'],
  police: ['M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z', 'M12 8.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z'],
  flame: ['M12 21a6 6 0 0 0 6-6c0-4-3-6-3-9-2 1-3 3-3 5-1-1-1.5-2-1.5-3C8 10 6 12.5 6 15a6 6 0 0 0 6 6z'],
  ambulance: ['M3 7h11v10H3z', 'M14 10h4l3 3v4h-7M8.5 9.5v5M6 12h5', 'c:7,18,1.8', 'c:17,18,1.8'],
  stethoscope: ['M6 3v6a4 4 0 0 0 8 0V3', 'M10 13v2a5 5 0 0 0 10 0v-2', 'c:20,11,2'],
  hospital: ['M4 21V7h16v14M2 21h20', 'M12 10v6M9 13h6M9 3h6v4H9z'],
  office: ['M5 21V4h10v17M15 9h4v12M3 21h18', 'M8 8h4M8 12h4M8 16h4'],
  school: ['M2 9l10-5 10 5-10 5z', 'M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6'],
  tag: ['M3 12V4h8l10 10-8 8z', 'c:7.5,7.5,1.3'],
  wrench: ['M15 4a5 5 0 0 0-4.6 6.8L4 17.2V20h2.8l6.4-6.4A5 5 0 0 0 20 9l-3 1-2-2 1-3z'],
  rings: ['c:9,14,5', 'c:15,14,5', 'M10 4h4l-2 3z'],
  image: ['M4 5h16v14H4z', 'M4 16l5-5 4 4 2-2 5 5', 'c:15.5,9.5,1.5'],
  upload: ['M12 16V4M7 9l5-5 5 5M4 16v4h16v-4'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', 'c:12,12,3'],
  filter: ['M4 5h16l-6 8v6l-4-2v-4z'],
  list: ['M9 6h11M9 12h11M9 18h11M4.5 6h.5M4.5 12h.5M4.5 18h.5'],
  map: ['M9 4l6 2 5-2v14l-5 2-6-2-5 2V6z', 'M9 4v14M15 6v14'],
  humidity: ['M7 4s3.5 4 3.5 6.5a3.5 3.5 0 0 1-7 0C3.5 8 7 4 7 4z', 'M16 9s4 4.5 4 7.5a4 4 0 0 1-8 0c0-3 4-7.5 4-7.5z'],
  wind: ['M3 9h11a3 3 0 1 0-3-3', 'M3 15h15a3 3 0 1 1-3 3M3 12h8'],
  umbrella: ['M3 12a9 9 0 0 1 18 0z', 'M12 12v6a2 2 0 0 0 4 0'],
  share: ['c:6,12,2.5', 'c:18,6,2.5', 'c:18,18,2.5', 'M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6'],
  external: ['M14 4h6v6M20 4l-9 9', 'M18 14v6H4V6h6'],
  user: ['c:12,8,4', 'M4 21a8 8 0 0 1 16 0'],
  users: ['c:9,8,3.5', 'M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6'],
  bank: ['M3 9l9-5 9 5z', 'M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 21h18'],
  courier: ['M3 6h11v11H3z', 'M14 10h4l3 3v4h-7', 'c:7,18,2', 'c:17,18,2'],
  wifi: ['M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0', 'M12 19.5v.3'],
  gym: ['M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12'],
  scissors: ['c:6,7,2.5', 'c:6,17,2.5', 'M8 8.5L20 18M8 15.5L20 6'],
  scale: ['M12 4v16M7 20h10M5 8h14', 'M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z'],
  newspaper: ['M4 5h13v14H6a2 2 0 0 1-2-2z', 'M17 9h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5M8 16h3'],
  medal: ['c:12,15,5', 'M8 3l2.5 7.5M16 3l-2.5 7.5M8 3h8'],
  vote: ['M4 13h16v7H4z', 'M8 13V5h8v8', 'M10.5 8.5l1.5 1.5 3-3'],
  tree: ['M12 21v-5', 'M7 16h10l-3-4h2l-3-4h1.5L12 3 9.5 8H11l-3 4h2z'],
  restaurant: ['M7 3v18M4 3v5a3 3 0 0 0 6 0V3', 'M17 21V3c-2 1-3 4-3 7h3'],
  bed: ['M3 18V6M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6', 'c:7,11,2'],
  video: ['M3 6h12v12H3z', 'M15 10l6-3v10l-6-3z'],
  bolt: ['M13 2L5 14h6l-1 8 8-12h-6z'],
  bus: ['M5 4h14v13H5z', 'M5 11h14M8 20v-3M16 20v-3M8 14h.5M15.5 14h.5'],
  printer: ['M6 9V3h12v6', 'M6 17H4v-8h16v8h-2', 'M7 14h10v7H7z'],
  pot: ['M4 10h16v4a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z', 'M2 10h20M9 6.5c0-1 1-1 1-2.5M14 6.5c0-1 1-1 1-2.5'],
  music: ['M9 18V5l11-2v13', 'c:6,18,3', 'c:17,16,3'],
  broom: ['M14 3l-4 9', 'M6 12h8l2 9H4z', 'M8 16v5M12 16v5'],
  document: ['M6 3h9l4 4v14H6z', 'M14 3v5h5M9 12h7M9 16h7'],
  market: ['M3 9l2-5h14l2 5', 'M4 9v11h16V9M3 9h18M9 20v-6h6v6'],
  plane: ['M2.5 12.5L21 4l-6.5 17-3-6.5z', 'M11.5 14.5L21 4'],
  laptop: ['M5 5h14v10H5z', 'M2 19h20'],
  megaphone: ['M3 10v4h3l7 4V6l-7 4z', 'M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11'],
  qr: ['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z', 'M14 14h2v2h-2zM18 18h2v2h-2zM18 14h2M14 20h2'],
  landmark: ['M4 21h16M6 21V10M10 21V10M14 21V10M18 21V10', 'M3 10h18L12 3z'],
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Set when the icon carries meaning on its own; otherwise it is hidden from assistive tech. */
  label?: string;
  className?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.75, label, className }: IconProps) {
  const d = ICONS[name] ?? ICONS.info;
  return (
    <svg
      className={className ? `bb-icon ${className}` : 'bb-icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      {d.map((s, i) => {
        if (s.startsWith('c:')) {
          const [cx, cy, r] = s.slice(2).split(',');
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        }
        return <path key={i} d={s} />;
      })}
    </svg>
  );
}
