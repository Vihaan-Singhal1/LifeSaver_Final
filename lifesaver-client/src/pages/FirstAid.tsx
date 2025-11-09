import { Bandage, HeartPulse, LifeBuoy, Flame, Waves, AlertTriangle, Activity } from 'lucide-react';

const guides = [
  {
    title: 'Cardiopulmonary Resuscitation',
    icon: HeartPulse,
    steps: [
      'Check responsiveness and call emergency services.',
      'Deliver 30 compressions at a depth of 5-6 cm.',
      'Provide two rescue breaths and continue cycles until help arrives.'
    ]
  },
  {
    title: 'Severe Bleeding',
    icon: Bandage,
    steps: [
      'Apply direct pressure with clean cloth or dressing.',
      'Elevate the limb and maintain constant pressure.',
      'Use a tourniquet two inches above the wound if bleeding continues.'
    ]
  },
  {
    title: 'Preparedness Kit',
    icon: LifeBuoy,
    steps: [
      'Stock gloves, barrier masks, and sterile dressings.',
      'Keep a charged phone and emergency contact list accessible.',
      'Review local response protocols quarterly.'
    ]
  }
];

function FirstAidPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">First-Aid Playbook</h1>
        <p className="text-base-content/80">
          Quick-reference refreshers to keep responders confident in the field.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        {guides.map(guide => (
          <article key={guide.title} className="card border border-base-300 bg-base-100 shadow">
            <div className="card-body space-y-3">
              <guide.icon className="h-8 w-8 text-primary" />
              <h2 className="card-title text-xl">{guide.title}</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-base-content/80">
                {guide.steps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FirstAidPage;
