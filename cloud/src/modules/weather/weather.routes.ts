import type { Request, Response } from 'express';
import { defineRoutes } from '@/utils/defineRoutes';
import { sendResponse } from '@/utils/sendResponse';
import * as weatherService from './weather.service';

const getWeather = async (_req: Request, res: Response) => sendResponse(res, { message: 'Weather', data: await weatherService.getWeather() });

export const weatherRoutes = defineRoutes('/weather', 'Site');
weatherRoutes.get('/', { summary: 'Current weather and 3-day forecast for Bogura' }, getWeather);
