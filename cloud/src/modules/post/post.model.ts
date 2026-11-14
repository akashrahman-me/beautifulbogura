import { Schema, model, type InferSchemaType } from 'mongoose';
import { LISTING_CATEGORIES, LISTING_CONDITIONS, MARITAL_STATUSES, MATRIMONY_GENDERS, RELIGIONS, RENTAL_TYPES, TUITION_KINDS, VEHICLE_TYPES } from '@/config/catalog';

/**
 * Every community post in one collection: the shared fields here, each kind's own fields in a
 * discriminator (`postType`). One collection keeps reports, “my posts”, bans and the console simple.
 *
 * status: active → done (sold / rented / filled) by the owner; hidden by reports; removed by staff;
 * deleted by the owner. “Expired” is not stored: it is `active` with `expiresAt` in the past.
 */
const postSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'done', 'hidden', 'removed', 'deleted'], default: 'active' },
    featured: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    phone: { type: String, required: true },
    whatsapp: { type: Boolean, default: false },
    address: { type: String, default: '' },
    images: { type: [String], default: [] },
    expiresAt: { type: Date, required: true },
    removedReason: { type: String, default: null },
    reports: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true, discriminatorKey: 'postType' },
);
postSchema.index({ postType: 1, status: 1, expiresAt: 1, featured: -1, createdAt: -1 });
postSchema.index({ owner: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });

export const PostModel = model('Post', postSchema);

export const JobPost = PostModel.discriminator(
  'job',
  new Schema({ company: { type: String, required: true }, title: { type: String, required: true }, vacancies: { type: Number, default: 1 }, salary: { type: String, default: '' }, education: { type: String, default: '' }, details: { type: String, required: true }, deadline: { type: Date, required: true } }),
);
export const ListingPost = PostModel.discriminator(
  'listing',
  new Schema({ category: { type: String, enum: LISTING_CATEGORIES, required: true }, title: { type: String, required: true }, condition: { type: String, enum: LISTING_CONDITIONS, required: true }, price: { type: Number, required: true }, description: { type: String, default: '' }, sellerName: { type: String, required: true } }),
);
export const RentalPost = PostModel.discriminator(
  'rental',
  new Schema({ type: { type: String, enum: RENTAL_TYPES, required: true }, title: { type: String, required: true }, rent: { type: Number, required: true }, rooms: { type: Number, default: 1 }, gas: { type: Boolean, default: false }, attachedBath: { type: Boolean, default: false }, description: { type: String, default: '' }, ownerName: { type: String, required: true }, mapUrl: { type: String, default: '' } }),
);
export const VehiclePost = PostModel.discriminator('vehicle', new Schema({ type: { type: String, enum: VEHICLE_TYPES, required: true }, ownerName: { type: String, required: true }, description: { type: String, required: true } }));
export const TuitionPost = PostModel.discriminator(
  'tuition',
  new Schema({ kind: { type: String, enum: TUITION_KINDS, required: true }, name: { type: String, required: true }, classLevel: { type: String, required: true }, subject: { type: String, required: true }, qualification: { type: String, default: '' }, experience: { type: String, default: '' }, note: { type: String, default: '' } }),
);
export const MatrimonyPost = PostModel.discriminator(
  'matrimony',
  new Schema({ gender: { type: String, enum: MATRIMONY_GENDERS, required: true }, name: { type: String, required: true }, birthYear: { type: Number, required: true }, religion: { type: String, enum: RELIGIONS, required: true }, maritalStatus: { type: String, enum: MARITAL_STATUSES, required: true }, education: { type: String, required: true }, profession: { type: String, required: true }, familyMembers: { type: String, required: true }, preference: { type: String, required: true } }),
);

export const KIND_MODELS = { job: JobPost, listing: ListingPost, rental: RentalPost, vehicle: VehiclePost, tuition: TuitionPost, matrimony: MatrimonyPost } as const;
export type Post = InferSchemaType<typeof postSchema>;
