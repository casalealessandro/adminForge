import { TestBed } from '@angular/core/testing';
import { FORM_DEFINITION_REPOSITORY } from '../contracts/form-definition-repository';
import { DynamicFormComponent } from './dynamic-form.component';

describe('DynamicFormComponent cascading parents', () => {
  it('tracks the parent FormControl even without a custom select event', async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormComponent],
      providers: [{ provide: FORM_DEFINITION_REPOSITORY, useValue: {} }]
    }).compileComponents();
    const fixture = TestBed.createComponent(DynamicFormComponent);
    const form = fixture.componentInstance;
    form.fields = [
      {
        name: 'category', label: 'Categoria', type: 'selectBox', typeInput: 'selectBox',
        selectOptions: {
          displayExp: 'label', valueExp: 'id', multiple: false, remote: false, parent: null,
          options: [{ id: 'A', label: 'Abbigliamento' }]
        }
      },
      {
        name: 'subcategory', label: 'Sottocategoria', type: 'selectBox', typeInput: 'selectBox',
        selectOptions: {
          displayExp: 'label', valueExp: 'id', multiple: false, remote: true,
          api: 'outfitCategories', parent: 'category'
        }
      }
    ];
    form.editData = {};
    form.initializeForm();
    expect(form.parentValues().category).toBe('');
    form.form.get('category')?.setValue('A');
    expect(form.parentValues().category).toBe('A');
    form.form.get('category')?.setValue(null);
    expect(form.parentValues().category).toBeNull();
    fixture.destroy();
  });
});
