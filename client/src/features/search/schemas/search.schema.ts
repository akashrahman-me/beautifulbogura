export interface SearchHit {
  kind: 'doctor' | 'directory' | 'institution' | 'job';
  id: string;
  title: string;
  subtitle: string;
  href: string;
}
