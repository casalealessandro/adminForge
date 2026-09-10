import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** Optional compatibility adapter for the historical service/api DataGrid mode. */
export interface LegacyGridDataAdapter {
  getElenco(api: any, queryString?: string): Observable<any>;
  actionDelete(api: any, id: any): Promise<any>;
  getValue(api: any, value: any, queryString?: string): Promise<any>;
}

export const LEGACY_GRID_DATA_ADAPTER =
  new InjectionToken<LegacyGridDataAdapter>('LEGACY_GRID_DATA_ADAPTER');
