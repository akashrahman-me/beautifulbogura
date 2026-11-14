import { docControllers } from '@/modules/site/site.controller';
import * as siteV from '@/modules/site/site.validator';
import { registerContentRoutes } from '@/utils/content';
import { defineRoutes } from '@/utils/defineRoutes';
import * as c from './area.controller';
import * as v from './area.validator';

export const areaRoutes = defineRoutes('/area', 'Area');
areaRoutes.get('/profile', { summary: 'Upazila profile' }, c.profile);
areaRoutes.get('/unions', { summary: 'All unions, in order' }, c.unions);
areaRoutes.get('/administration', { summary: 'Upazila administration' }, c.administration);
areaRoutes.get('/municipality', { summary: 'Municipality' }, c.municipality);

export const adminAreaRoutes = defineRoutes('/admin/area', 'Admin · Area');
const permission = 'content.manage';
for (const [path, key, schema] of [
  ['/profile', 'area.profile', siteV.profileSchema],
  ['/administration', 'area.administration', siteV.administrationSchema],
  ['/municipality', 'area.municipality', siteV.municipalitySchema],
] as const) {
  const d = docControllers(key);
  adminAreaRoutes.get(path, { summary: `Get ${key}`, permission }, d.get);
  adminAreaRoutes.put(path, { summary: `Replace ${key}`, permission, schema }, d.put);
}

export const adminUnionRoutes = defineRoutes('/admin/area/unions', 'Admin · Area');
registerContentRoutes(adminUnionRoutes, c.adminUnions, { permission, noun: 'union', body: v.unionBody });
