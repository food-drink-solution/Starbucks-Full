import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from '../../lucide-angular-shim.module';
import { MenuBuilderService, MenuItem, MenuCategory } from '../../services/menu-builder.service';

@Component({
  selector: 'app-menu-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Menu Builder</h1>
            <p class="text-gray-600 mt-1">Manage categories and menu items</p>
          </div>
          <button 
            (click)="openNewCategory()"
            class="flex items-center gap-2 bg-starbucks-green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            <i-lucide name="plus" size="20"></i-lucide>
            New Category
          </button>
        </div>

        <!-- Categories List -->
        <div class="space-y-6">
          <div *ngFor="let category of categories" class="bg-white rounded-lg shadow">
            <!-- Category Header -->
            <div class="p-6 border-b flex justify-between items-center">
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ category.name.en }}</h2>
                <p class="text-sm text-gray-500">{{ category.items.length }} items</p>
              </div>
              <div class="flex gap-2">
                <button 
                  (click)="editCategory(category)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <i-lucide name="pencil" size="20"></i-lucide>
                </button>
                <button 
                  (click)="openNewItem(category.id)"
                  class="px-3 py-2 text-sm bg-starbucks-green text-white rounded hover:bg-opacity-90 transition"
                >
                  Add Item
                </button>
              </div>
            </div>

            <!-- Items Grid -->
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let item of category.items" 
                class="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                (click)="editItem(item)">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-bold text-gray-900">{{ item.name.en }}</h3>
                  <span [class]="item.available ? 'text-green-600 text-xs' : 'text-gray-400 text-xs'">
                    {{ item.available ? '✓ Available' : '○ Unavailable' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{{ item.description.en }}</p>
                <div class="flex justify-between items-center">
                  <span class="font-bold text-lg text-starbucks-green">{{ item.price | currency }}</span>
                  <button 
                    (click)="deleteItem($event, item.id)"
                    class="p-1 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <i-lucide name="trash2" size="18"></i-lucide>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Editor Modal -->
        <div *ngIf="showCategoryEditor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-2xl w-full">
            <div class="flex justify-between items-center p-6 border-b">
              <h2 class="text-xl font-bold">{{ editingCategory ? 'Edit Category' : 'New Category' }}</h2>
              <button (click)="closeCategoryEditor()" class="text-gray-500 hover:text-gray-700">
                <i-lucide name="x" size="24"></i-lucide>
              </button>
            </div>
            
            <form [formGroup]="categoryForm" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Name (English)</label>
                <input 
                  type="text"
                  formControlName="nameEn"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Name (Arabic)</label>
                <input 
                  type="text"
                  formControlName="nameAr"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="اسم الفئة"
                  dir="rtl"
                />
              </div>

              <div class="flex gap-3 pt-6 border-t">
                <button 
                  (click)="deleteCategory()"
                  *ngIf="editingCategory"
                  type="button"
                  class="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
                <div class="flex-1"></div>
                <button 
                  (click)="closeCategoryEditor()"
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  (click)="saveCategory()"
                  type="button"
                  class="px-4 py-2 bg-starbucks-green text-white rounded-lg hover:bg-opacity-90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Item Editor Modal -->
        <div *ngIf="showItemEditor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 class="text-xl font-bold">{{ editingItem ? 'Edit Item' : 'New Item' }}</h2>
              <button (click)="closeItemEditor()" class="text-gray-500 hover:text-gray-700">
                <i-lucide name="x" size="24"></i-lucide>
              </button>
            </div>
            
            <form [formGroup]="itemForm" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Name (English)</label>
                <input 
                  type="text"
                  formControlName="nameEn"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="Item name"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Name (Arabic)</label>
                <input 
                  type="text"
                  formControlName="nameAr"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="اسم المنتج"
                  dir="rtl"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Description (English)</label>
                <textarea 
                  formControlName="descriptionEn"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="Item description"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Description (Arabic)</label>
                <textarea 
                  formControlName="descriptionAr"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="وصف المنتج"
                  dir="rtl"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Price</label>
                <input 
                  type="number"
                  formControlName="price"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="0.00"
                />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-900">Available</label>
                <input 
                  type="checkbox"
                  formControlName="available"
                  class="w-4 h-4 text-starbucks-green border-gray-300 rounded"
                />
              </div>

              <div class="flex gap-3 pt-6 border-t">
                <button 
                  (click)="deleteItemConfirm()"
                  *ngIf="editingItem"
                  type="button"
                  class="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
                <div class="flex-1"></div>
                <button 
                  (click)="closeItemEditor()"
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  (click)="saveItem()"
                  type="button"
                  class="px-4 py-2 bg-starbucks-green text-white rounded-lg hover:bg-opacity-90"
                >
                  Save
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
  `]
})
export class MenuBuilderComponent implements OnInit {
  categories: MenuCategory[] = [];
  showCategoryEditor = false;
  showItemEditor = false;
  editingCategory: MenuCategory | null = null;
  editingItem: MenuItem | null = null;
  categoryForm!: FormGroup;
  itemForm!: FormGroup;
  selectedCategoryId = '';

  constructor(
    private fb: FormBuilder,
    private menuService: MenuBuilderService
  ) {
    this.initForms();
  }

  ngOnInit() {
    this.loadCategories();
  }

  initForms() {
    this.categoryForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required]
    });

    this.itemForm = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: [''],
      descriptionAr: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      available: [true]
    });
  }

  loadCategories() {
    this.menuService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  openNewCategory() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryEditor = true;
  }

  editCategory(category: MenuCategory) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      nameEn: category.name.en,
      nameAr: category.name.ar
    });
    this.showCategoryEditor = true;
  }

  saveCategory() {
    if (!this.categoryForm.valid) return;

    const data = {
      name: {
        en: this.categoryForm.value.nameEn,
        ar: this.categoryForm.value.nameAr
      }
    };

    if (this.editingCategory) {
      this.menuService.updateCategory(this.editingCategory.id, data).subscribe(() => {
        this.loadCategories();
        this.closeCategoryEditor();
      });
    } else {
      this.menuService.createCategory(data).subscribe(() => {
        this.loadCategories();
        this.closeCategoryEditor();
      });
    }
  }

  deleteCategory() {
    if (!this.editingCategory || !confirm('Delete this category?')) return;

    this.menuService.deleteCategory(this.editingCategory.id).subscribe(() => {
      this.loadCategories();
      this.closeCategoryEditor();
    });
  }

  closeCategoryEditor() {
    this.showCategoryEditor = false;
    this.editingCategory = null;
  }

  openNewItem(categoryId: string) {
    this.selectedCategoryId = categoryId;
    this.editingItem = null;
    this.itemForm.reset({ available: true });
    this.showItemEditor = true;
  }

  editItem(item: MenuItem) {
    this.selectedCategoryId = item.categoryId;
    this.editingItem = item;
    this.itemForm.patchValue({
      nameEn: item.name.en,
      nameAr: item.name.ar,
      descriptionEn: item.description.en,
      descriptionAr: item.description.ar,
      price: item.price,
      available: item.available
    });
    this.showItemEditor = true;
  }

  saveItem() {
    if (!this.itemForm.valid) return;

    const data = {
      name: { en: this.itemForm.value.nameEn, ar: this.itemForm.value.nameAr },
      description: { en: this.itemForm.value.descriptionEn, ar: this.itemForm.value.descriptionAr },
      price: this.itemForm.value.price,
      available: this.itemForm.value.available,
      categoryId: this.selectedCategoryId
    };

    if (this.editingItem) {
      this.menuService.updateItem(this.editingItem.id, data).subscribe(() => {
        this.loadCategories();
        this.closeItemEditor();
      });
    } else {
      this.menuService.createItem(data).subscribe(() => {
        this.loadCategories();
        this.closeItemEditor();
      });
    }
  }

  deleteItem(e: Event, itemId: string) {
    e.stopPropagation();
    if (!confirm('Delete this item?')) return;

    this.menuService.deleteItem(itemId).subscribe(() => {
      this.loadCategories();
    });
  }

  deleteItemConfirm() {
    if (!this.editingItem || !confirm('Delete this item?')) return;

    this.menuService.deleteItem(this.editingItem.id).subscribe(() => {
      this.loadCategories();
      this.closeItemEditor();
    });
  }

  closeItemEditor() {
    this.showItemEditor = false;
    this.editingItem = null;
  }
}
