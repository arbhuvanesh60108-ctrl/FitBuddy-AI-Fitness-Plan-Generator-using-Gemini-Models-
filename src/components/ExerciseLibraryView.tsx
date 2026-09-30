import React, { useState } from 'react';
import { BookOpen, CheckCircle, AlertTriangle, Dumbbell, Search, Filter } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: 'Upper Body' | 'Lower Body' | 'Core' | 'Cardio';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryMuscles: string;
  instructions: string[];
  keyFormCues: string[];
  commonMistakes: string[];
}

const EXERCISES: Exercise[] = [
  {
    id: 'squat',
    name: 'Goblet / Barbell Squat',
    category: 'Lower Body',
    difficulty: 'Beginner',
    primaryMuscles: 'Quadriceps, Glutes, Adductors',
    instructions: [
      'Stand with feet slightly wider than shoulder-width, toes turned outward 15–30 degrees.',
      'Hold a dumbbell/kettlebell at chest height (or place barbell across upper traps).',
      'Inhale, brace your core, and initiate by pushing hips back while bending knees.',
      'Descend until thighs are parallel to the floor, keeping knees in line with toes.',
      'Drive powerfully through your midfoot to stand back up, exhaling at the top.'
    ],
    keyFormCues: [
      'Keep chest tall and proud throughout.',
      'Do not allow knees to collapse inward (screw feet into the floor).',
      'Maintain neutral spine—avoid rounding lower back at the bottom.'
    ],
    commonMistakes: [
      'Rising on toes instead of driving through midfoot.',
      'Shifting weight excessively forward.'
    ]
  },
  {
    id: 'bench-press',
    name: 'Dumbbell / Barbell Bench Press',
    category: 'Upper Body',
    difficulty: 'Beginner',
    primaryMuscles: 'Pectoralis Major, Anterior Deltoids, Triceps',
    instructions: [
      'Lie flat on the bench with eyes under the bar or holding dumbbells above your chest.',
      'Plant feet flat on the floor and pinch shoulder blades down and back into the bench.',
      'Lower the weights in a controlled 2–3 second eccentric until touching mid-chest.',
      'Press upward in a slight diagonal arc, locking out elbows softly without shrugging.'
    ],
    keyFormCues: [
      'Keep wrists stacked straight over elbows.',
      'Tuck elbows roughly 45–75 degrees from torso (avoid 90-degree flaring).'
    ],
    commonMistakes: [
      'Bouncing weight off the chest.',
      'Lifting feet or buttocks off the bench.'
    ]
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift (RDL)',
    category: 'Lower Body',
    difficulty: 'Intermediate',
    primaryMuscles: 'Hamstrings, Gluteus Maximus, Lower Back',
    instructions: [
      'Hold dumbbells or a barbell at hip height with an overhand grip.',
      'Unlock knees slightly (soft bend) and keep them fixed in that position.',
      'Hinge backward at hips as if trying to touch the wall behind you with your glutes.',
      'Lower bar along your shins until you feel a deep hamstring stretch (just below knees).',
      'Drive hips forward to return to standing, contracting glutes at the top.'
    ],
    keyFormCues: [
      'Keep the bar glued close to your legs at all times.',
      'This is a pure hip hinge, NOT a squat—do not bend knees further as you descend.'
    ],
    commonMistakes: [
      'Rounding the lower spine.',
      'Looking up excessively straining the neck.'
    ]
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown / Pull-ups',
    category: 'Upper Body',
    difficulty: 'Beginner',
    primaryMuscles: 'Latissimus Dorsi, Biceps, Rhomboids',
    instructions: [
      'Sit facing the cable machine with thighs firmly under pads.',
      'Grip bar slightly wider than shoulder width.',
      'Lean back slightly (10–15 degrees), pull shoulder blades down, and pull bar toward upper chest.',
      'Squeeze lats firmly at the bottom, then control the release upwards for 3 seconds.'
    ],
    keyFormCues: [
      'Think of pulling with your elbows rather than your hands.',
      'Keep chest elevated towards the ceiling.'
    ],
    commonMistakes: [
      'Swinging backward with momentum to yank the weight.',
      'Pulling the bar behind the neck (strains cervical spine).'
    ]
  },
  {
    id: 'plank',
    name: 'Forearm Plank & Anti-Extension',
    category: 'Core',
    difficulty: 'Beginner',
    primaryMuscles: 'Rectus Abdominis, Transverse Abdominis, Obliques',
    instructions: [
      'Place forearms on the floor with elbows directly below shoulders.',
      'Extend legs back with toes on floor, feet hip-width apart.',
      'Squeeze glutes, pull belly button towards spine, and create a straight line from heels to head.',
      'Breathe steadily into your diaphragm while holding isometric tension.'
    ],
    keyFormCues: [
      'Imagine dragging your elbows towards your toes without moving them.',
      'Do not allow hips to sag or hike into a mountain.'
    ],
    commonMistakes: [
      'Holding breath.',
      'Sagging lower back which compresses lumbar spine.'
    ]
  }
];

export const ExerciseLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = EXERCISES.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.primaryMuscles.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>Beginner-Friendly Exercise Library</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Crystal-clear form instructions, anatomical targets, and safety cues for core fitness movements.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises or target muscles..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {['All', 'Upper Body', 'Lower Body', 'Core'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards */}
      <div className="space-y-6">
        {filtered.map((ex) => (
          <div
            key={ex.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{ex.name}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  Primary Muscles: <strong className="text-slate-800">{ex.primaryMuscles}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {ex.category}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {ex.difficulty}
                </span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Step-by-Step Execution:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                {ex.instructions.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Form Cues & Common Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Key Form Cues</span>
                </div>
                <ul className="list-disc list-inside text-xs text-emerald-900 space-y-1">
                  {ex.keyFormCues.map((cue, i) => (
                    <li key={i}>{cue}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Common Mistakes to Avoid</span>
                </div>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {ex.commonMistakes.map((mis, i) => (
                    <li key={i}>{mis}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
