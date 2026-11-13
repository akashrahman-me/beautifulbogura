import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { videoApi, videoKeys } from '../api/video.api';
import type { VideoListParams } from '../schemas/video.schema';

export const useVideos = (params: VideoListParams) =>
  useInfiniteQuery({
    queryKey: videoKeys.list(params),
    queryFn: ({ pageParam, signal }) => videoApi.list({ ...params, page: pageParam }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
  });
