import { contentService } from '@/utils/content';
import { omit, withIds } from '@/utils/serialize';
import * as siteService from '@/modules/site/site.service';
import { UnionModel } from './union.model';

const strip = <T extends Record<string, unknown>>(d: T) => omit(d, ['updatedAt', 'updatedBy'] as const);

export const profile = async () => strip(await siteService.getDoc('area.profile'));
export const administration = async () => strip(await siteService.getDoc('area.administration'));
export const municipality = async () => strip(await siteService.getDoc('area.municipality'));
/** All unions in order — a short, bounded list, so not paginated. */
export const listUnions = async () => withIds(await UnionModel.find({ deletedAt: null }).sort({ number: 1 }).lean()).map((u) => omit(u, ['deletedAt', 'createdAt', 'updatedAt'] as const));

export const admin = contentService({
  model: UnionModel,
  noun: 'ইউনিয়নের তথ্য',
  label: (d) => String(d.name),
  searchFields: ['name', 'villages', 'contacts.name'],
  sortable: ['number', 'name', 'updatedAt'],
  defaultSort: { number: 1 },
});
