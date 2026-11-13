import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './api-client';

/** Map an API failure onto a react-hook-form form: field errors by path, everything else on `root`. */
export function applyApiErrors<T extends FieldValues>(form: { setError: UseFormSetError<T> }, error: Error) {
  if (!(error instanceof ApiError)) {
    form.setError('root', { message: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' });
    return;
  }
  if (error.errors?.length) {
    error.errors.forEach((e) => form.setError(e.path as Path<T>, { message: e.message }));
  } else {
    form.setError('root', { message: error.message });
  }
}
