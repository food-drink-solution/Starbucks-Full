import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from '../../lucide-angular-shim.module';
import { ContentService, ContentPage } from '../../services/content.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Content Manager</h1>
            <p class="text-gray-600 mt-1">Manage website pages and content</p>
          </div>
          <button 
            (click)="openNewPage()"
            class="flex items-center gap-2 bg-starbucks-green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            <i-lucide name="plus" size="20"></i-lucide>
            New Page
          </button>
        </div>

        <!-- Pages Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let page of pages" 
            class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            (click)="editPage(page)">
            <div class="p-6">
              <h3 class="font-bold text-lg text-gray-900">{{ page.title.en }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ page.slug }}</p>
              <p class="text-gray-600 text-sm mt-3 line-clamp-2">{{ page.description.en }}</p>
              <div class="flex items-center justify-between mt-4">
                <span [class]="page.published ? 'text-green-600 text-sm font-medium' : 'text-gray-500 text-sm font-medium'">
                  {{ page.published ? '✓ Published' : '○ Draft' }}
                </span>
                <span class="text-xs text-gray-500">{{ page.updatedAt | date:'short' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Modal -->
        <div *ngIf="showEditor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b">
              <h2 class="text-xl font-bold">{{ editingPage ? 'Edit Page' : 'New Page' }}</h2>
              <button (click)="closeEditor()" class="text-gray-500 hover:text-gray-700">
                <i-lucide name="x" size="24"></i-lucide>
              </button>
            </div>
            
            <form [formGroup]="pageForm" class="p-6 space-y-6">
              <!-- English Title & Description -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Title (English)</label>
                <input 
                  type="text"
                  formControlName="titleEn"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green focus:border-transparent"
                  placeholder="Page title"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Description (English)</label>
                <textarea 
                  formControlName="descriptionEn"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green focus:border-transparent"
                  placeholder="Page description"
                ></textarea>
              </div>

              <!-- Arabic Title & Description -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Title (Arabic)</label>
                <input 
                  type="text"
                  formControlName="titleAr"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green focus:border-transparent"
                  placeholder="عنوان الصفحة"
                  dir="rtl"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Description (Arabic)</label>
                <textarea 
                  formControlName="descriptionAr"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green focus:border-transparent"
                  placeholder="وصف الصفحة"
                  dir="rtl"
                ></textarea>
              </div>

              <!-- Content Editors -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Content (English)</label>
                <textarea 
                  formControlName="contentEn"
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green focus:border-transparent font-mono text-sm"
                  placeholder="Page content..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Content (Arabic)</label>
                <textarea 
                  formControlName="contentAr"
                  rows="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green focus:border-transparent font-mono text-sm"
                  placeholder="محتوى الصفحة..."
                  dir="rtl"
                ></textarea>
              </div>

              <!-- Slug -->
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">URL Slug</label>
                <input 
                  type="text"
                  formControlName="slug"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green focus:border-transparent"
                  placeholder="about-us"
                />
                <p class="text-xs text-gray-500 mt-1">Auto-generated from title</p>
              </div>

              <!-- Published Toggle -->
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-900">Publish this page</label>
                <input 
                  type="checkbox"
                  formControlName="published"
                  class="w-4 h-4 text-starbucks-green border-gray-300 rounded focus:ring-2 focus:ring-starbucks-green"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-6 border-t">
                <button 
                  (click)="deletePage()"
                  *ngIf="editingPage"
                  type="button"
                  class="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                >
                  Delete
                </button>
                <div class="flex-1"></div>
                <button 
                  (click)="closeEditor()"
                  type="button"
                  class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  (click)="savePage()"
                  type="button"
                  class="px-4 py-2 bg-starbucks-green text-white rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
                >
                  <i-lucide name="save" size="18"></i-lucide>
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ContentComponent implements OnInit {
  pages: ContentPage[] = [];
  showEditor = false;
  editingPage: ContentPage | null = null;
  pageForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private contentService: ContentService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadPages();
  }

  initForm() {
    this.pageForm = this.fb.group({
      titleEn: ['', Validators.required],
      titleAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      contentEn: ['', Validators.required],
      contentAr: ['', Validators.required],
      slug: [{ value: '', disabled: true }],
      published: [false]
    });
  }

  loadPages() {
    this.contentService.getPages().subscribe(pages => {
      this.pages = pages;
    });
  }

  openNewPage() {
    this.editingPage = null;
    this.initForm();
    this.showEditor = true;
  }

  editPage(page: ContentPage) {
    this.editingPage = page;
    this.pageForm.patchValue({
      titleEn: page.title.en,
      titleAr: page.title.ar,
      descriptionEn: page.description.en,
      descriptionAr: page.description.ar,
      contentEn: page.content.en,
      contentAr: page.content.ar,
      slug: page.slug,
      published: page.published
    });
    this.showEditor = true;
  }

  savePage() {
    if (!this.pageForm.valid) return;

    const data = {
      title: { en: this.pageForm.value.titleEn, ar: this.pageForm.value.titleAr },
      description: { en: this.pageForm.value.descriptionEn, ar: this.pageForm.value.descriptionAr },
      content: { en: this.pageForm.value.contentEn, ar: this.pageForm.value.contentAr },
      slug: this.editingPage?.slug || this.generateSlug(this.pageForm.value.titleEn),
      published: this.pageForm.value.published
    };

    if (this.editingPage) {
      this.contentService.updatePage(this.editingPage.id, data).subscribe(() => {
        this.loadPages();
        this.closeEditor();
      });
    } else {
      this.contentService.createPage(data).subscribe(() => {
        this.loadPages();
        this.closeEditor();
      });
    }
  }

  deletePage() {
    if (!this.editingPage || !confirm('Are you sure?')) return;
    
    this.contentService.deletePage(this.editingPage.id).subscribe(() => {
      this.loadPages();
      this.closeEditor();
    });
  }

  closeEditor() {
    this.showEditor = false;
    this.editingPage = null;
  }

  generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
}
