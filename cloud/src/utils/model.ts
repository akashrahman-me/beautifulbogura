import { Schema, type SchemaDefinition } from 'mongoose';

const softDelete = { deletedAt: { type: Date, default: null } } as const;

/**
 * Schema for a staff-managed collection: timestamps plus `deletedAt` for soft delete (the console's undo).
 * Public queries always add `deletedAt: null`. Generic so Mongoose still infers each model's fields.
 */
export const contentSchema = <T extends SchemaDefinition>(def: T) => {
  const s = new Schema({ ...def, ...softDelete } as T & typeof softDelete, { timestamps: true });
  s.index({ deletedAt: 1, updatedAt: -1 });
  return s;
};
