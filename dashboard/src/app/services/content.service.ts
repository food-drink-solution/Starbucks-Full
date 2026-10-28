import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContentPage {
  id: string;
  slug: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  content: { en: string; ar: string };
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Server-assigned fields (id, timestamps) are set by the API on create. */
export type CreatePagePayload = Pick<ContentPage, 'slug' | 'title' | 'description' | 'content' | 'published'>;

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private apiUrl = `${environment.apiUrl}/api/content/pages`;

  constructor(private http: HttpClient) { }

  getPages(): Observable<ContentPage[]> {
    return this.http.get<ContentPage[]>(this.apiUrl);
  }

  getPageBySlug(slug: string): Observable<ContentPage> {
    return this.http.get<ContentPage>(`${this.apiUrl}/${slug}`);
  }

  createPage(page: CreatePagePayload): Observable<ContentPage> {
    return this.http.post<ContentPage>(this.apiUrl, page);
  }

  updatePage(id: string, page: CreatePagePayload): Observable<ContentPage> {
    return this.http.put<ContentPage>(`${this.apiUrl}/${id}`, page);
  }

  deletePage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publishPage(id: string): Observable<ContentPage> {
    return this.http.patch<ContentPage>(`${this.apiUrl}/${id}/publish`, {});
  }

  unpublishPage(id: string): Observable<ContentPage> {
    return this.http.patch<ContentPage>(`${this.apiUrl}/${id}/unpublish`, {});
  }
}
