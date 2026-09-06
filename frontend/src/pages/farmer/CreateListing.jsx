import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const COMMON_CROPS = [
  'Tomato',
  'Onion',
  'Potato',
  'Carrot',
  'Cabbage',
  'Cauliflower',
  'Spinach',
  'Brinjal',
  'Ladyfinger (Okra)',
  'Green Chilli',
  'Capsicum',
  'Cucumber',
  'Bottle Gourd',
  'Bitter Gourd',
  'Mango',
  'Banana',
  'Apple',
  'Orange',
  'Wheat',
  'Rice',
];

const CATEGORIES = ['Vegetable', 'Fruit', 'Grain', 'Spice', 'Other'];
const QUALITY_GRADES = ['A', 'B', 'C'];

const step1Schema = z.object({
  crop_name: z.string().min(2, 'Crop name must be at least 2 characters'),
  crop_category: z.string().min(1, 'Please select a category'),
  variety: z.string().optional().or(z.literal('')),
  quality_grade: z.string().min(1, 'Please select a grade'),
  is_organic: z.boolean().default(false),
  quantity_kg: z.coerce
    .number({ invalid_type_error: 'Enter a valid number' })
    .positive('Quantity must be positive'),
  min_order_kg: z.coerce.number().default(1),
  price_per_kg: z.coerce
    .number({ invalid_type_error: 'Enter a valid number' })
    .positive('Price must be positive'),
  harvest_date: z.string().min(1, 'Harvest date is required'),
  description: z.string().optional().or(z.literal('')),
});

const STEPS = ['Crop Details', 'Quality & Pricing', 'Review & Publish'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const stepNo = i + 1;
        const isDone = stepNo < current;
        const isCurrent = stepNo === current;
        return (
          <div key={stepNo} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                  isDone
                    ? 'bg-green-700 border-green-700 text-white'
                    : isCurrent
                    ? 'border-green-700 text-green-700'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {isDone ? <Check className="h-5 w-5" /> : stepNo}
              </div>
              <span
                className={`mt-1 text-xs ${
                  isCurrent ? 'text-green-700 font-medium' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            {stepNo < STEPS.length && (
              <div
                className={`h-0.5 w-10 mb-5 ${
                  stepNo < current ? 'bg-green-700' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CreateListing() {
  const [step, setStep] = useState(1);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      crop_name: '',
      crop_category: '',
      variety: '',
      quality_grade: '',
      is_organic: false,
      quantity_kg: '',
      min_order_kg: 1,
      price_per_kg: '',
      harvest_date: '',
      description: '',
      expiry_date: '',
      images: [],
    },
  });

  const STEP_FIELDS = {
  1: ['crop_name', 'crop_category', 'variety', 'quantity_kg', 'harvest_date', 'description'],
  2: ['quality_grade', 'is_organic', 'price_per_kg', 'min_order_kg', 'expiry_date'],
};

const nextStep = async () => {
  const valid = await trigger(STEP_FIELDS[step]);
  if (valid) setStep((s) => Math.min(3, s + 1));
};
  const backStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const onSubmit = (data) => {
    toast.success('Listing submitted');
    // eslint-disable-next-line no-console
    console.log(data);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <StepIndicator current={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-green-800">
            {STEPS[step - 1]}
          </h1>

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Crop Name *</label>
                <Input
                  list="common-crops"
                  placeholder="e.g. Tomato"
                  {...register('crop_name')}
                  aria-invalid={!!errors.crop_name}
                />
                <datalist id="common-crops">
                  {COMMON_CROPS.map((crop) => (
                    <option key={crop} value={crop} />
                  ))}
                </datalist>
                <FieldError message={errors.crop_name?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category *</label>
                <Controller
                  control={control}
                  name="crop_category"
                  render={({ field }) => (
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.crop_category?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Variety (optional)</label>
                <Input placeholder="e.g. Hybrid, Desi" {...register('variety')} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Quantity (kg) *</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 500"
                  {...register('quantity_kg')}
                  aria-invalid={!!errors.quantity_kg}
                />
                <FieldError message={errors.quantity_kg?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Harvest Date *</label>
                <Input
                  type="date"
                  {...register('harvest_date')}
                  aria-invalid={!!errors.harvest_date}
                />
                <FieldError message={errors.harvest_date?.message} />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your produce..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  {...register('description')}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Quality Grade *</label>
                <div className="flex gap-3">
                  {QUALITY_GRADES.map((grade) => (
                    <label
                      key={grade}
                      className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        value={grade}
                        className="accent-green-700"
                        {...register('quality_grade')}
                      />
                      {grade}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.quality_grade?.message} />
              </div>

              <div className="flex items-end gap-3 pb-1">
                <input
                  type="checkbox"
                  id="is_organic"
                  className="h-4 w-4 rounded border-gray-300 text-green-700"
                  {...register('is_organic')}
                />
                <label htmlFor="is_organic" className="text-sm font-medium text-gray-700">
                  Organic produce
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Price (₹/kg) *</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 35"
                  {...register('price_per_kg')}
                  aria-invalid={!!errors.price_per_kg}
                />
                <FieldError message={errors.price_per_kg?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Min Order (kg)</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  {...register('min_order_kg')}
                  aria-invalid={!!errors.min_order_kg}
                />
                <FieldError message={errors.min_order_kg?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                <Input type="date" {...register('expiry_date')} />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Photos</label>
                <input type="file" multiple accept="image/*" className="text-sm text-gray-600" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 text-sm">
              <h2 className="font-semibold text-gray-800">Review your listing</h2>
              <p className="text-gray-600">
                Step 3 will show a full summary before publishing. The form keeps all entered
                values in react-hook-form state across steps.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={backStep}
            disabled={step === 1}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button type="button" className="bg-green-700 hover:bg-green-800" onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button type="submit" className="bg-green-700 hover:bg-green-800">
              Publish Listing
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}