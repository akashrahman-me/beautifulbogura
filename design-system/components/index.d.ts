import type * as React from 'react';

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type Period = 'month' | 'week' | 'night' | 'year' | (string & {}) | null;
type Option = string | { value: string; label: React.ReactNode; description?: React.ReactNode; disabled?: boolean; icon?: string };

/* Foundations */
export interface IconProps { name: string; size?: number; label?: string; strokeWidth?: number; className?: string; style?: React.CSSProperties }
export declare function Icon(props: IconProps): React.ReactElement;
export interface LogoProps { size?: 'sm' | 'md' | 'lg'; href?: string; className?: string }
export declare function Logo(props: LogoProps): React.ReactElement;

/* Actions */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'link'; size?: 'sm' | 'md' | 'lg'; iconLeft?: string; iconRight?: string; block?: boolean; loading?: boolean; href?: string }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { icon: string; label: string; variant?: 'ghost' | 'secondary' | 'primary' | 'overlay'; size?: 'sm' | 'md'; pressed?: boolean; dot?: boolean }
export declare function IconButton(props: IconButtonProps): React.ReactElement;
export interface FavoriteButtonProps { saved?: boolean; defaultSaved?: boolean; onChange?: (saved: boolean) => void; size?: 'sm' | 'md'; className?: string }
export declare function FavoriteButton(props: FavoriteButtonProps): React.ReactElement;

/* Data display */
export interface BadgeProps { tone?: Tone; variant?: 'soft' | 'solid'; size?: 'md' | 'lg'; icon?: string; children?: React.ReactNode; className?: string }
export declare function Badge(props: BadgeProps): React.ReactElement;
export interface ChipProps { selected?: boolean; defaultSelected?: boolean; onChange?: (selected: boolean) => void; icon?: string; count?: number; onRemove?: () => void; children?: React.ReactNode; className?: string }
export declare function Chip(props: ChipProps): React.ReactElement;
export interface AvatarProps { name?: string; src?: string; size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; verified?: boolean; className?: string }
export declare function Avatar(props: AvatarProps): React.ReactElement;
export interface RatingProps { value: number; count?: number; variant?: 'compact' | 'stars'; showValue?: boolean; size?: 'sm' | 'md'; className?: string }
export declare function Rating(props: RatingProps): React.ReactElement;
export interface PriceProps { amount: number | string; currency?: string; locale?: string; period?: Period; size?: 'sm' | 'md' | 'lg'; original?: number; note?: string; className?: string }
export declare function Price(props: PriceProps): React.ReactElement;
export interface AccordionProps { items: { title: React.ReactNode; content: React.ReactNode }[]; defaultOpen?: number; className?: string }
export declare function Accordion(props: AccordionProps): React.ReactElement;

/* Forms */
interface FieldBase { label?: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; optional?: boolean; className?: string }
export interface TextFieldProps extends FieldBase, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> { iconLeft?: string; suffix?: React.ReactNode }
export declare function TextField(props: TextFieldProps): React.ReactElement;
export interface SelectProps extends FieldBase, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> { options: Option[]; placeholderOption?: string; iconLeft?: string }
export declare function Select(props: SelectProps): React.ReactElement;
export interface TextareaProps extends FieldBase, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}
export declare function Textarea(props: TextareaProps): React.ReactElement;
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> { label: React.ReactNode; description?: React.ReactNode }
export declare function Checkbox(props: CheckboxProps): React.ReactElement;
export interface RadioGroupProps { label?: React.ReactNode; name?: string; options: Option[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; variant?: 'list' | 'cards'; className?: string }
export declare function RadioGroup(props: RadioGroupProps): React.ReactElement;
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> { label: React.ReactNode; description?: React.ReactNode }
export declare function Switch(props: SwitchProps): React.ReactElement;
export interface StepperProps { label: string; description?: React.ReactNode; value?: number; defaultValue?: number; min?: number; max?: number; maxLabel?: string; onChange?: (value: number) => void; className?: string }
export declare function Stepper(props: StepperProps): React.ReactElement;
export interface SegmentedControlProps { options: Option[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; label?: string; block?: boolean; className?: string }
export declare function SegmentedControl(props: SegmentedControlProps): React.ReactElement;
export interface RangeSliderProps { label?: string; min?: number; max?: number; step?: number; value?: [number, number]; defaultValue?: [number, number]; onChange?: (value: [number, number]) => void; currency?: string; format?: (n: number) => string; maxPlus?: boolean; className?: string }
export declare function RangeSlider(props: RangeSliderProps): React.ReactElement;
export interface SearchBarProps { variant?: 'hero' | 'compact'; defaultLocation?: string; defaultMoveIn?: string; types?: string[]; ctaLabel?: string; onSearch?: (q: { location: string; moveIn: string; type: string }) => void; summary?: string; onOpen?: () => void; onFilters?: () => void; className?: string }
export declare function SearchBar(props: SearchBarProps): React.ReactElement;
export interface UploadFile { name: string; size?: number; progress?: number; status?: 'uploading' | 'done' | 'error'; error?: string }
export interface FileDropProps { label?: React.ReactNode; hint?: React.ReactNode; accept?: string; multiple?: boolean; icon?: string; onFiles?: (files: File[]) => void; files?: UploadFile[]; onRemove?: (index: number) => void; className?: string }
export declare function FileDrop(props: FileDropProps): React.ReactElement;

/* Navigation */
export interface TabsProps { items: { value: string; label: React.ReactNode; icon?: string; count?: number }[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; variant?: 'underline' | 'pill'; label?: string; className?: string }
export declare function Tabs(props: TabsProps): React.ReactElement;
export interface BreadcrumbsProps { items: { label: React.ReactNode; href?: string }[]; className?: string }
export declare function Breadcrumbs(props: BreadcrumbsProps): React.ReactElement;
export interface PaginationProps { pageCount: number; page?: number; defaultPage?: number; onChange?: (page: number) => void; className?: string }
export declare function Pagination(props: PaginationProps): React.ReactElement;
export interface NavbarProps { links?: { label: string; href: string; active?: boolean }[]; user?: { name: string; avatar?: string; unreadMessages?: boolean; unreadNotifications?: boolean }; ctaLabel?: string; ctaHref?: string; homeHref?: string; defaultOpen?: boolean; className?: string }
export declare function Navbar(props: NavbarProps): React.ReactElement;
export interface BottomNavProps { items?: { icon: string; label: string; href?: string; active?: boolean; badge?: number; onClick?: () => void }[]; position?: 'fixed' | 'static'; hideOnDesktop?: boolean; className?: string }
export declare function BottomNav(props: BottomNavProps): React.ReactElement;
export interface FooterProps { columns?: { title: string; links: (string | { label: string; href: string })[] }[]; tagline?: React.ReactNode; year?: number; className?: string }
export declare function Footer(props: FooterProps): React.ReactElement;

/* Layout */
export interface ContainerProps { size?: 'default' | 'narrow'; as?: keyof JSX.IntrinsicElements; children?: React.ReactNode; className?: string; style?: React.CSSProperties }
export declare function Container(props: ContainerProps): React.ReactElement;
export interface ListingGridProps { columns?: 3 | 4; min?: number; as?: keyof JSX.IntrinsicElements; children?: React.ReactNode; className?: string; style?: React.CSSProperties }
export declare function ListingGrid(props: ListingGridProps): React.ReactElement;
export interface SectionHeaderProps { title: React.ReactNode; overline?: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; align?: 'start' | 'center'; as?: 'h1' | 'h2' | 'h3'; className?: string }
export declare function SectionHeader(props: SectionHeaderProps): React.ReactElement;
export interface CardProps extends React.HTMLAttributes<HTMLElement> { padding?: 'sm' | 'md' | 'lg'; elevated?: boolean; interactive?: boolean; title?: React.ReactNode; as?: keyof JSX.IntrinsicElements }
export declare function Card(props: CardProps): React.ReactElement;

/* Listings */
export interface ImagePlaceholderProps { kind?: 'house' | 'apartment' | 'townhouse' | 'cabin'; label?: string; className?: string }
export declare function ImagePlaceholder(props: ImagePlaceholderProps): React.ReactElement;
export interface PropertyCardProps { title: string; location?: string; price: number; currency?: string; period?: Period; originalPrice?: number; beds?: number; baths?: number; area?: number; areaUnit?: string; rating?: number; reviews?: number; badges?: (string | { label: string; tone?: Tone; icon?: string })[]; image?: string; imageAlt?: string; kind?: ImagePlaceholderProps['kind']; photoCount?: number; availableFrom?: string; saved?: boolean; defaultSaved?: boolean; onSaveChange?: ((saved: boolean) => void) | null; href?: string; layout?: 'vertical' | 'horizontal' | 'boxed'; footer?: React.ReactNode; className?: string }
export declare function PropertyCard(props: PropertyCardProps): React.ReactElement;
export interface GalleryProps { images: { src?: string; alt?: string; kind?: ImagePlaceholderProps['kind'] }[]; total?: number; onOpen?: (index: number) => void; className?: string }
export declare function Gallery(props: GalleryProps): React.ReactElement;
export interface KeyFactsProps { items: { icon: string; label: React.ReactNode; value: React.ReactNode }[]; className?: string }
export declare function KeyFacts(props: KeyFactsProps): React.ReactElement;
export interface AmenityListProps { items: { icon?: string; label: React.ReactNode; available?: boolean }[]; columns?: 1 | 2 | 3; limit?: number; onShowAll?: () => void; className?: string }
export declare function AmenityList(props: AmenityListProps): React.ReactElement;
export interface MapPinProps { price?: number; currency?: string; active?: boolean; visited?: boolean; saved?: boolean; count?: number; onClick?: () => void; style?: React.CSSProperties; className?: string }
export declare function MapPin(props: MapPinProps): React.ReactElement;

/* Booking */
export interface CalendarProps { month?: string; value?: string; defaultValue?: string; onChange?: (isoDate: string) => void; unavailable?: string[]; minDate?: string; today?: string; locale?: string; legend?: boolean; className?: string }
export declare function Calendar(props: CalendarProps): React.ReactElement;
export interface BookingPanelProps { price: number; currency?: string; period?: Period; rating?: number; reviews?: number; availability?: React.ReactNode; moveIn?: string; leaseOptions?: Option[]; defaultLease?: string; deposit?: number; fees?: { label: string; amount: number }[]; totalLabel?: string; ctaLabel?: string; secondaryLabel?: string; note?: React.ReactNode; onRequest?: () => void; onMessage?: () => void; sticky?: boolean; className?: string }
export declare function BookingPanel(props: BookingPanelProps): React.ReactElement;
export interface StickyActionBarProps { price: number; currency?: string; period?: Period; sub?: React.ReactNode; actionLabel?: string; variant?: ButtonProps['variant']; onAction?: () => void; position?: 'fixed' | 'static'; hideOnDesktop?: boolean; className?: string }
export declare function StickyActionBar(props: StickyActionBarProps): React.ReactElement;
export interface HostCardProps { name: string; avatar?: string; verified?: boolean; role?: string; joined?: string; responseRate?: string; responseTime?: string; listings?: number; children?: React.ReactNode; onContact?: () => void; onCall?: (() => void) | null; className?: string }
export declare function HostCard(props: HostCardProps): React.ReactElement;
export interface ReviewCardProps { author: string; avatar?: string; date?: string; stay?: string; rating?: number; children: React.ReactNode; reply?: React.ReactNode; replyFrom?: string; className?: string }
export declare function ReviewCard(props: ReviewCardProps): React.ReactElement;

/* Messaging */
export interface MessageThreadProps { contact: { name: string; avatar?: string; subtitle?: string; verified?: boolean }; messages: ({ from: 'me' | 'them'; text: React.ReactNode; time?: string } | { day: string })[]; onSend?: (text: string) => void; onBack?: () => void; placeholder?: string; className?: string; style?: React.CSSProperties }
export declare function MessageThread(props: MessageThreadProps): React.ReactElement;

/* Feedback & overlays */
export interface AlertProps { tone?: 'info' | 'success' | 'warning' | 'danger' | 'brand'; title?: React.ReactNode; children?: React.ReactNode; icon?: string; action?: React.ReactNode; onDismiss?: () => void; className?: string }
export declare function Alert(props: AlertProps): React.ReactElement;
export interface ToastProps { tone?: 'neutral' | 'success' | 'danger' | 'brand'; title?: React.ReactNode; children?: React.ReactNode; icon?: string; actionLabel?: string; onAction?: () => void; onDismiss?: () => void; className?: string }
export declare function Toast(props: ToastProps): React.ReactElement;
export interface ModalProps { open: boolean; onClose?: () => void; title: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; className?: string }
export declare function Modal(props: ModalProps): React.ReactElement | null;
export interface MenuItem { label?: React.ReactNode; icon?: string; onSelect?: () => void; danger?: boolean; checked?: boolean; divider?: boolean }
export interface MenuProps { items: MenuItem[]; label?: React.ReactNode; trigger?: React.ReactElement; align?: 'end' | 'start'; defaultOpen?: boolean; className?: string }
export declare function Menu(props: MenuProps): React.ReactElement;
export interface TooltipProps { content: React.ReactNode; children: React.ReactElement; className?: string }
export declare function Tooltip(props: TooltipProps): React.ReactElement;
export interface ProgressProps { value?: number; max?: number; label?: React.ReactNode; showValue?: boolean; valueLabel?: string; tone?: 'brand' | 'success' | 'warning'; size?: 'sm' | 'md'; indeterminate?: boolean; className?: string }
export declare function Progress(props: ProgressProps): React.ReactElement;
export interface SpinnerProps { size?: 'md' | 'lg'; label?: React.ReactNode; className?: string }
export declare function Spinner(props: SpinnerProps): React.ReactElement;
export interface StepsProps { steps: (string | { label: React.ReactNode; description?: React.ReactNode })[]; current?: number; orientation?: 'auto' | 'vertical'; className?: string }
export declare function Steps(props: StepsProps): React.ReactElement;
export interface SkeletonProps { variant?: 'text' | 'rect' | 'circle'; width?: number | string; height?: number | string; lines?: number; className?: string; style?: React.CSSProperties }
export declare function Skeleton(props: SkeletonProps): React.ReactElement;
export interface EmptyStateProps { icon?: string; title: React.ReactNode; children?: React.ReactNode; actions?: React.ReactNode; className?: string }
export declare function EmptyState(props: EmptyStateProps): React.ReactElement;

/* Dashboard */
export interface StatCardProps { label: React.ReactNode; value: React.ReactNode; delta?: string; trend?: 'up' | 'down' | 'flat'; positive?: 'up' | 'down'; hint?: React.ReactNode; icon?: string; className?: string }
export declare function StatCard(props: StatCardProps): React.ReactElement;
export interface DataTableColumn<R> { key: string; label: string; align?: 'left' | 'right'; render?: (row: R) => React.ReactNode }
export interface DataTableProps<R = Record<string, any>> { columns: DataTableColumn<R>[]; rows: R[]; rowKey?: string; caption?: React.ReactNode; footer?: React.ReactNode; className?: string }
export declare function DataTable<R>(props: DataTableProps<R>): React.ReactElement;

export declare function formatMoney(amount: number, currency?: string, locale?: string): string;

declare global { interface Window { ERS: {
  Icon: typeof Icon & { names: string[] }; Logo: typeof Logo; Button: typeof Button; IconButton: typeof IconButton; FavoriteButton: typeof FavoriteButton;
  Badge: typeof Badge; Chip: typeof Chip; Avatar: typeof Avatar; Rating: typeof Rating; Price: typeof Price; TextField: typeof TextField; Select: typeof Select;
  Textarea: typeof Textarea; Checkbox: typeof Checkbox; RadioGroup: typeof RadioGroup; Switch: typeof Switch; Stepper: typeof Stepper; SegmentedControl: typeof SegmentedControl;
  RangeSlider: typeof RangeSlider; SearchBar: typeof SearchBar; FileDrop: typeof FileDrop; Tabs: typeof Tabs; Breadcrumbs: typeof Breadcrumbs; Pagination: typeof Pagination;
  Navbar: typeof Navbar; BottomNav: typeof BottomNav; Footer: typeof Footer; Container: typeof Container; ListingGrid: typeof ListingGrid; SectionHeader: typeof SectionHeader;
  Card: typeof Card; ImagePlaceholder: typeof ImagePlaceholder; PropertyCard: typeof PropertyCard; Gallery: typeof Gallery; KeyFacts: typeof KeyFacts; AmenityList: typeof AmenityList;
  MapPin: typeof MapPin; Calendar: typeof Calendar; BookingPanel: typeof BookingPanel; StickyActionBar: typeof StickyActionBar; HostCard: typeof HostCard; ReviewCard: typeof ReviewCard;
  MessageThread: typeof MessageThread; Alert: typeof Alert; Toast: typeof Toast; Modal: typeof Modal; Menu: typeof Menu; Tooltip: typeof Tooltip; Progress: typeof Progress;
  Spinner: typeof Spinner; Steps: typeof Steps; Skeleton: typeof Skeleton; EmptyState: typeof EmptyState; Accordion: typeof Accordion; StatCard: typeof StatCard; DataTable: typeof DataTable;
  formatMoney: typeof formatMoney;
} } }
