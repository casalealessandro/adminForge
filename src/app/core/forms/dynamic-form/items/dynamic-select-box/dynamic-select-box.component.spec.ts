import { NgZone } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { FORM_OPTIONS_PROVIDER } from '../../../contracts/form-options-provider';
import { DynamicSelectBoxComponent } from './dynamic-select-box.component';

describe('DynamicSelectBoxComponent remote options refresh', () => {
  let fixture: ComponentFixture<DynamicSelectBoxComponent>;
  let component: DynamicSelectBoxComponent;
  let getData: jasmine.Spy;

  beforeEach(async () => {
    getData = jasmine.createSpy('getData');
    await TestBed.configureTestingModule({
      imports: [DynamicSelectBoxComponent],
      providers: [{ provide: FORM_OPTIONS_PROVIDER, useValue: { getData } }],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicSelectBoxComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({ category: new FormControl(null) });
    component.config = {
      name: 'category', label: 'Categoria', type: 'selectBox', typeInput: 'selectBox',
      selectOptions: {
        api: 'outfitCategories', displayExp: 'categoryName', valueExp: 'id',
        remote: true, multiple: false, parent: null, options: []
      }
    };
  });

  it('updates the DOM after remote options resolve outside Angular zone', fakeAsync(() => {
    let resolve!: (value: any[]) => void;
    getData.and.returnValue(new Promise(r => resolve = r));
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    const labels = () => Array.from(select.options).map(option => option.textContent?.trim());
    expect(labels()).toContain('Caricamento in corso...');

    TestBed.inject(NgZone).runOutsideAngular(() => resolve([
      { id: 'A_Accessori', categoryName: 'Accessori' },
      { id: 'B_Blazer', categoryName: 'Blazer' },
    ]));
    flushMicrotasks();

    expect(component.isLoading).toBeFalse();
    expect(component.formGroup.get('category')?.enabled).toBeTrue();
    expect(labels()).toContain('Accessori');
    expect(labels()).toContain('Blazer');
    expect(labels()).not.toContain('Caricamento in corso...');
  }));
});
