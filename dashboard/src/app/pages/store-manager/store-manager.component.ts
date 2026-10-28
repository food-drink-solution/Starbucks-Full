import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from '../../lucide-angular-shim.module';
import { StoreManagerService, Store } from '../../services/store-manager.service';

@Component({
  selector: 'app-store-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Store Manager</h1>
            <p class="text-gray-600 mt-1">Manage multiple store locations</p>
          </div>
          <button 
            (click)="openNewStore()"
            class="flex items-center gap-2 bg-starbucks-green text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
          >
            <i-lucide name="plus" size="20"></i-lucide>
            Add Store
          </button>
        </div>

        <!-- Stores Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let store of stores" 
            class="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            (click)="editStore(store)">
            <div class="p-6">
              <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-lg text-gray-900">{{ store.name }}</h3>
                <span [class]="store.isOpen ? 'text-green-600 text-xs' : 'text-red-600 text-xs'">
                  {{ store.isOpen ? '🟢 Open' : '🔴 Closed' }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">
                <i-lucide name="map-pin" size="16" class="inline"></i-lucide>
                {{ store.address }}
              </p>
              <p class="text-sm text-gray-600 mb-3">
                <i-lucide name="phone" size="16" class="inline"></i-lucide>
                {{ store.phone }}
              </p>
              <div class="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                <strong>Hours:</strong> 
                <span *ngIf="store.operatingHours">
                  {{ store.operatingHours['Monday']?.open }} - {{ store.operatingHours['Monday']?.close }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Store Editor Modal -->
        <div *ngIf="showEditor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 class="text-xl font-bold">{{ editingStore ? 'Edit Store' : 'New Store' }}</h2>
              <button (click)="closeEditor()" class="text-gray-500 hover:text-gray-700">
                <i-lucide name="x" size="24"></i-lucide>
              </button>
            </div>
            
            <form [formGroup]="storeForm" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Store Name</label>
                <input 
                  type="text"
                  formControlName="name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="Store name"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Address</label>
                <input 
                  type="text"
                  formControlName="address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                  placeholder="Street address"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">City</label>
                  <input 
                    type="text"
                    formControlName="city"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input 
                    type="tel"
                    formControlName="phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                    placeholder="+20-123456789"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">Latitude</label>
                  <input 
                    type="number"
                    formControlName="latitude"
                    step="0.000001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                    placeholder="30.0444"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">Longitude</label>
                  <input 
                    type="number"
                    formControlName="longitude"
                    step="0.000001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-starbucks-green"
                    placeholder="31.2357"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-900">Currently Open</label>
                <input 
                  type="checkbox"
                  formControlName="isOpen"
                  class="w-4 h-4 text-starbucks-green border-gray-300 rounded"
                />
              </div>

              <div class="flex gap-3 pt-6 border-t">
                <button 
                  (click)="deleteStore()"
                  *ngIf="editingStore"
                  type="button"
                  class="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
                <div class="flex-1"></div>
                <button 
                  (click)="closeEditor()"
                  type="button"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  (click)="saveStore()"
                  type="button"
                  class="px-4 py-2 bg-starbucks-green text-white rounded-lg hover:bg-opacity-90 flex items-center gap-2"
                >
                  <i-lucide name="save" size="18"></i-lucide>
                  Save Store
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
export class StoreManagerComponent implements OnInit {
  stores: Store[] = [];
  showEditor = false;
  editingStore: Store | null = null;
  storeForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreManagerService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadStores();
  }

  initForm() {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', Validators.required],
      latitude: [0, Validators.required],
      longitude: [0, Validators.required],
      isOpen: [true]
    });
  }

  loadStores() {
    this.storeService.getStores().subscribe(stores => {
      this.stores = stores;
    });
  }

  openNewStore() {
    this.editingStore = null;
    this.initForm();
    this.showEditor = true;
  }

  editStore(store: Store) {
    this.editingStore = store;
    this.storeForm.patchValue({
      name: store.name,
      address: store.address,
      city: store.city,
      phone: store.phone,
      latitude: store.latitude,
      longitude: store.longitude,
      isOpen: store.isOpen
    });
    this.showEditor = true;
  }

  saveStore() {
    if (!this.storeForm.valid) return;

    const data = this.storeForm.value;

    if (this.editingStore) {
      this.storeService.updateStore(this.editingStore.id!, data).subscribe(() => {
        this.loadStores();
        this.closeEditor();
      });
    } else {
      this.storeService.createStore(data).subscribe(() => {
        this.loadStores();
        this.closeEditor();
      });
    }
  }

  deleteStore() {
    if (!this.editingStore || !confirm('Delete this store?')) return;

    this.storeService.deleteStore(this.editingStore.id!).subscribe(() => {
      this.loadStores();
      this.closeEditor();
    });
  }

  closeEditor() {
    this.showEditor = false;
    this.editingStore = null;
  }
}
