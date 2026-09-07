import { useState } from 'react';

const CATEGORIES = ['Vegetable', 'Fruit', 'Grain', 'Spice', 'Other'];
const GRADES = ['A', 'B', 'C'];

const DEFAULT_FILTERS = {
  crop_category: '',
  quality_grade: '',
  is_organic: false,
  min_price: '',
  max_price: '',
};

function CheckboxRow({ label, id, name, value, checked, onChange, count }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm ${
        checked ? 'bg-green-50 text-green-800' : 'text-gray-700'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-green-600 cursor-pointer"
        checked={checked}
        onChange={() => onChange(value, checked)}
      />
      <span>{name || label}</span>
      {typeof count === 'number' && (
        <span className="ml-auto text-xs text-gray-400">{count}</span>
      )}
    </label>
  );
}

export default function FilterSidebar({ filters, onFilterChange }) {
  const [open, setOpen] = useState(false);

  const cropCategories = (filters.crop_category || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const qualityGrades = (filters.quality_grade || '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  const toggleCategory = (category, isChecked) => {
    const next = isChecked
      ? cropCategories.filter((c) => c !== category)
      : [...cropCategories, category];
    onFilterChange({ ...filters, crop_category: next.join(',') });
  };

  const toggleGrade = (grade, isChecked) => {
    const next = isChecked
      ? qualityGrades.filter((g) => g !== grade)
      : [...qualityGrades, grade];
    onFilterChange({ ...filters, quality_grade: next.join(',') });
  };

  const clearFilters = () => {
    onFilterChange({ ...DEFAULT_FILTERS });
  };

  const showBody = open ? 'block' : 'hidden md:block';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="p-4 flex md:hidden items-center justify-between">
        <h2 className="font-semibold text-gray-800">Filters</h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`${showBody} p-4 space-y-6`}>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Category</h3>
          <div className="space-y-1">
            {CATEGORIES.map((category) => (
              <CheckboxRow
                key={category}
                id={`cat-${category}`}
                name={category}
                value={category}
                checked={cropCategories.includes(category)}
                onChange={toggleCategory}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Quality Grade</h3>
          <div className="space-y-1">
            {GRADES.map((grade) => (
              <CheckboxRow
                key={grade}
                id={`grade-${grade}`}
                label={`Grade ${grade}`}
                value={grade}
                checked={qualityGrades.includes(grade)}
                onChange={toggleGrade}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Organic Only</h3>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-700">Show organic produce</span>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(filters.is_organic)}
              onClick={() =>
                onFilterChange({
                  ...filters,
                  is_organic: !filters.is_organic,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                filters.is_organic ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  filters.is_organic ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Price (₹/kg)</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.min_price ?? ''}
              onChange={(e) =>
                onFilterChange({ ...filters, min_price: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.max_price ?? ''}
              onChange={(e) =>
                onFilterChange({ ...filters, max_price: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}