import { useState } from 'react';

interface ApplyFormProps {
  jobTitle: string;
  employerName: string;
  onSubmit: (data: { name: string; age: string; availability: string; girthSize: string }) => void;
  onClose: () => void;
}

export function ApplyForm({ jobTitle, employerName, onSubmit, onClose }: ApplyFormProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [availability, setAvailability] = useState('');
  const [girthSize, setGirthSize] = useState('');

  const canSubmit = name.trim() && age.trim() && availability.trim() && girthSize.trim();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-cream rounded-2xl p-6 w-full max-w-md shadow-2xl border border-cream-border" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-text-primary mb-1">Almost there!</h2>
        <p className="text-sm text-text-secondary mb-6">
          Applying to <span className="font-semibold">{jobTitle}</span> at {employerName}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your alias"
              className="w-full px-3 py-2 rounded-lg border border-cream-border bg-cream-dark text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Age</label>
            <input type="text" value={age} onChange={e => setAge(e.target.value)} placeholder="How old?"
              className="w-full px-3 py-2 rounded-lg border border-cream-border bg-cream-dark text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Availability</label>
            <select value={availability} onChange={e => setAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-cream-border bg-cream-dark text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select availability</option>
              <option value="full-time">Full time</option>
              <option value="part-time">Part time</option>
              <option value="weekends">Weekends only</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Girth Size</label>
            <select value={girthSize} onChange={e => setGirthSize(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-cream-border bg-cream-dark text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select girth</option>
              <option value="smol">Smol (but mighty)</option>
              <option value="average">Average (like my portfolio)</option>
              <option value="large">Large (whale energy)</option>
              <option value="gigachad">Gigachad (trust me bro)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-cream-border text-text-secondary hover:bg-cream-dark transition-colors">Cancel</button>
          <button onClick={() => canSubmit && onSubmit({ name, age, availability, girthSize })} disabled={!canSubmit}
            className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Submit & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
