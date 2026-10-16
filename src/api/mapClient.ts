import type { MapDataStatus, Place, RouteLeg, TravelMode } from "../domain/route";

const REQUEST_TIMEOUT_MS = 8_000;

export class MapApiError extends Error {
  code: string;
  retryable: boolean;

  constructor(code: string, message: string, retryable: boolean) {
    super(message);
    this.name = "MapApiError";
    this.code = code;
    this.retryable = retryable;
  }
}

export interface CalculatedRoute {
  id: string;
  version: number;
  orderedPlaceIds: string[];
  preferredModes: TravelMode[];
  legs: RouteLeg[];
  transportDistanceMeters: number | null;
  transportDurationSeconds: number | null;
  dataStatus: MapDataStatus;
}

export interface RecalculateRequest {
  routeId: string;
  baseVersion: number;
  placeIds: string[];
  preferredModes: TravelMode[];
  idempotencyKey: string;
}

interface ApiErrorBody {
  error?: {
    code?: unknown;
    message?: unknown;
    retryable?: unknown;
  };
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new MapApiError("INVALID_RESPONSE", "地图接口返回了无效数据", false);
  }
}

function errorFromResponse(body: unknown): MapApiError {
  const error = (body as ApiErrorBody | null)?.error;
  return new MapApiError(
    typeof error?.code === "string" ? error.code : "HTTP_ERROR",
    typeof error?.message === "string" ? error.message : "地图接口请求失败",
    error?.retryable === true,
  );
}

export function createMapClient(fetchImpl: typeof fetch = fetch) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetchImpl(path, { ...init, signal: controller.signal });
      const body = await parseJson(response);
      if (!response.ok) throw errorFromResponse(body);
      return body as T;
    } catch (error) {
      if (error instanceof MapApiError) throw error;
      if (controller.signal.aborted) {
        throw new MapApiError("TIMEOUT", "地图接口请求超时", true);
      }
      throw new MapApiError("NETWORK_ERROR", "地图接口暂时无法连接", true);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const post = <T>(path: string, body: unknown) => request<T>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  return {
    searchPlaces(input: { keyword: string; city: string }): Promise<Place[]> {
      const params = new URLSearchParams({ keyword: input.keyword, city: input.city });
      return request<Place[]>(`/api/places/search?${params.toString()}`, { method: "GET" });
    },
    confirmPlace(input: { providerPoiId: string; city: string }): Promise<Place> {
      return post<Place>("/api/places/confirm", input);
    },
    calculateRoute(input: { placeIds: string[]; preferredModes: TravelMode[] }): Promise<CalculatedRoute> {
      return post<CalculatedRoute>("/api/routes/calculate", input);
    },
    recalculateRoute(input: RecalculateRequest): Promise<CalculatedRoute> {
      return post<CalculatedRoute>("/api/routes/recalculate", input);
    },
  };
}
