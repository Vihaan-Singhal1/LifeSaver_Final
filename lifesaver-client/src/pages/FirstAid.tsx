import {
  Bandage,
  HeartPulse,
  LifeBuoy,
  Flame,
  Waves,
  AlertTriangle,
  Activity,
  Droplet,
  Wind,
  Thermometer,
  Snowflake,
  Bone,
  Zap,
  Pill,
  Syringe,
  Phone,
} from 'lucide-react';

const guides = [
  // --- your originals ---
  {
    title: 'Cardiopulmonary Resuscitation',
    icon: HeartPulse,
    steps: [
      'Check responsiveness and call emergency services.',
      'Deliver 30 compressions at a depth of 5–6 cm.',
      'Provide two rescue breaths and continue cycles until help arrives.',
    ],
  },
  {
    title: 'Severe Bleeding',
    icon: Bandage,
    steps: [
      'Apply direct pressure with clean cloth or dressing.',
      'Elevate the limb and maintain constant pressure.',
      'Use a tourniquet two inches above the wound if bleeding continues.',
    ],
  },
  {
    title: 'Preparedness Kit',
    icon: LifeBuoy,
    steps: [
      'Stock gloves, barrier masks, and sterile dressings.',
      'Keep a charged phone and emergency contact list accessible.',
      'Review local response protocols quarterly.',
    ],
  },

  // --- added guides ---
  {
    title: 'Choking (Adult/Child)',
    icon: Wind,
    steps: [
      'Ask “Are you choking?”; if unable to speak/cough, stand behind.',
      'Perform 5 back blows between the shoulder blades.',
      'Perform 5 abdominal thrusts (Heimlich); alternate until object is expelled.',
    ],
  },
  {
    title: 'Burns (Thermal/Chemical)',
    icon: Flame,
    steps: [
      'Cool the burn with running cool water for 10–20 minutes.',
      'Remove jewelry/tight clothing; do NOT pop blisters.',
      'Cover loosely with sterile, non-stick dressing; seek care if severe or chemical.',
    ],
  },
  {
    title: 'Fracture or Sprain',
    icon: Bone,
    steps: [
      'Immobilize the area in the position found; avoid moving the limb.',
      'Apply cold pack wrapped in cloth for up to 20 minutes.',
      'Elevate if possible and seek medical evaluation.',
    ],
  },
  {
    title: 'Shock (Circulatory)',
    icon: AlertTriangle,
    steps: [
      'Lay the person flat; keep warm with a blanket.',
      'Control bleeding and avoid giving food or drink.',
      'Call emergency services; monitor breathing and responsiveness.',
    ],
  },
  {
    title: 'Allergic Reaction (Anaphylaxis)',
    icon: Syringe,
    steps: [
      'If available, assist with epinephrine auto-injector (EpiPen).',
      'Call emergency services immediately.',
      'Lay flat with legs raised unless breathing is difficult; monitor airway.',
    ],
  },
  {
    title: 'Asthma Attack',
    icon: Wind,
    steps: [
      'Help the person sit upright and stay calm.',
      'Use their reliever inhaler (2–6 puffs, as prescribed).',
      'If breathing worsens or no relief after 5–10 minutes, call emergency services.',
    ],
  },
  {
    title: 'Heat Exhaustion/Heatstroke',
    icon: Thermometer,
    steps: [
      'Move to a cool area; loosen clothing.',
      'Cool with water, fans, or ice packs at neck/armpits/groin.',
      'If confusion, seizure, or temp >40°C (104°F): call emergency services.',
    ],
  },
  {
    title: 'Hypothermia',
    icon: Snowflake,
    steps: [
      'Move to a warm, dry place; remove wet clothing.',
      'Warm gradually with blankets and warm (not hot) drinks if alert.',
      'If severe or shivering stops, call emergency services.',
    ],
  },
  {
    title: 'Drowning (Water Rescue)',
    icon: Waves,
    steps: [
      'Ensure scene safety; call for help and throw/extend a floatation aid.',
      'If trained and safe, remove from water and check breathing.',
      'Start CPR if not breathing; use AED if available.',
    ],
  },
  {
    title: 'Seizure',
    icon: Activity,
    steps: [
      'Protect the head; clear nearby objects; do not restrain.',
      'Time the seizure; place on their side once it stops.',
      'Call emergency services if >5 min, repeated seizures, or first occurrence.',
    ],
  },
  {
    title: 'Poisoning/Overdose',
    icon: Pill,
    steps: [
      'Call poison control or emergency services immediately.',
      'Do not induce vomiting unless instructed by a professional.',
      'If opioids suspected and trained, administer naloxone and start CPR if needed.',
    ],
  },
  {
    title: 'Electrical Injury',
    icon: Zap,
    steps: [
      'Do NOT touch the person until power is off or source is removed.',
      'Call emergency services; check breathing and start CPR if needed.',
      'Treat entry/exit burns with cool water and sterile dressings.',
    ],
  },
  {
    title: 'Emergency Calls',
    icon: Phone,
    steps: [
      'State location, nature of emergency, and number of people involved.',
      'Describe hazards (fire, gas, chemicals) and access points.',
      'Stay on the line until the operator says it’s okay to hang up.',
    ],
  },
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
        {guides.map((guide) => (
          <article
            key={guide.title}
            className="card border border-base-300 bg-base-100 shadow"
          >
            <div className="card-body space-y-3">
              <guide.icon className="h-8 w-8 text-primary" />
              <h2 className="card-title text-xl">{guide.title}</h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-base-content/80">
                {guide.steps.map((step) => (
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
