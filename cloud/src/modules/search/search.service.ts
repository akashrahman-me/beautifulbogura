import { can, type StaffRole } from '@/config/permissions';
import * as directoryService from '@/modules/directory/directory.service';
import * as doctorService from '@/modules/doctor/doctor.service';
import * as donorService from '@/modules/donor/donor.service';
import * as institutionService from '@/modules/institution/institution.service';
import * as postService from '@/modules/post/post.service';
import * as userService from '@/modules/user/user.service';

/** The site's search box: doctors, directory entries, institutions and live jobs. */
export const searchPublic = async (q: string) => {
  const [doctors, entries, institutions, jobs] = await Promise.all([doctorService.searchPublic(q, 8), directoryService.searchPublic(q, 10), institutionService.searchPublic(q, 6), postService.searchPublicJobs(q, 6)]);
  return [
    ...doctors.map((d) => ({ kind: 'doctor', id: String(d._id), title: d.name, subtitle: `${d.specialty} বিশেষজ্ঞ`, href: `/doctors/${d._id}` })),
    ...entries.map((e) => ({ kind: 'directory', id: String(e._id), title: e.name, subtitle: e.role ?? '', href: `/directory/${e.type}` })),
    ...institutions.map((i) => ({ kind: 'institution', id: String(i._id), title: i.name, subtitle: i.address ?? '', href: `/education/${i._id}` })),
    ...jobs.map((j) => ({ kind: 'job', id: String(j._id), title: j.title, subtitle: j.company, href: `/jobs/${j._id}` })),
  ].slice(0, 30);
};

/** The console's ⌘K: only what the caller's role may open. */
export const searchAdmin = async (q: string, role: StaffRole | null) => {
  const hits: { kind: string; id: string; label: string; sub: string; href: string }[] = [];
  const jobs: Promise<void>[] = [];
  if (can(role, 'posts.manage')) jobs.push(postService.searchAdmin(q, 5).then((ps) => ps.forEach((p) => hits.push({ kind: 'post', id: p.id, label: p.title, sub: 'পোস্ট', href: `/posts?open=${p.id}` }))));
  if (can(role, 'users.manage')) jobs.push(userService.searchAdmin(q, 5).then((us) => us.forEach((u) => hits.push({ kind: 'user', id: String(u._id), label: u.name, sub: 'ব্যবহারকারী', href: `/users?open=${u._id}` }))));
  if (can(role, 'content.manage')) {
    jobs.push(doctorService.searchAdmin(q, 5).then((ds) => ds.forEach((d) => hits.push({ kind: 'doctor', id: String(d._id), label: d.name, sub: d.specialty, href: `/doctors?edit=${d._id}` }))));
    jobs.push(directoryService.searchAdmin(q, 5).then((es) => es.forEach((e) => hits.push({ kind: 'directory', id: String(e._id), label: e.name, sub: e.role || 'তালিকা', href: `/directory?edit=${e._id}` }))));
    jobs.push(institutionService.searchAdmin(q, 3).then((is) => is.forEach((i) => hits.push({ kind: 'institution', id: String(i._id), label: i.name, sub: 'শিক্ষা প্রতিষ্ঠান', href: `/institutions?edit=${i._id}` }))));
    jobs.push(donorService.searchAdmin(q, 3).then((ds) => ds.forEach((d) => hits.push({ kind: 'donor', id: String(d._id), label: d.name, sub: `রক্তদাতা · ${d.group}`, href: `/donors?edit=${d._id}` }))));
  }
  await Promise.all(jobs);
  return hits;
};
