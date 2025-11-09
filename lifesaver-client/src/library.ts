import type { LucideIcon } from 'lucide-react';
import {
  Bandage,
  HeartPulse,
  LifeBuoy,
  ShieldAlert,
  Siren,
  Waves
} from 'lucide-react';

export interface LibraryScenario {
  id: string;
  title: string;
  icon: LucideIcon;
  bullets: string[];
  more: string[];
}

export const scenarios: LibraryScenario[] = [
  {
    id: 'severe-bleeding',
    title: 'Severe Bleeding',
    icon: Bandage,
    bullets: [
      'Glove up or use a barrier before contact.',
      'Expose the wound and remove loose debris.',
      'Apply firm, direct pressure with sterile dressing.',
      'Layer additional dressings without removing soaked ones.',
      'Elevate the limb above the heart if no fracture is suspected.',
      'Prepare a tourniquet 2–3 inches above the wound if bleeding persists.'
    ],
    more: [
      'Note the time a tourniquet is applied and communicate it to incoming teams.',
      'Keep the patient warm and monitor for shock while awaiting transport.'
    ]
  },
  {
    id: 'breathing-difficulty',
    title: 'Breathing Difficulty',
    icon: LifeBuoy,
    bullets: [
      'Approach calmly and introduce yourself to reduce anxiety.',
      'Position the patient seated upright with shoulders relaxed.',
      'Loosen restrictive clothing around the neck and chest.',
      'Assist with prescribed inhalers or spacers when available.',
      'Monitor respiratory rate, depth, and coloration continuously.',
      'Be prepared to initiate rescue breaths if breathing stops.'
    ],
    more: [
      'Collect a quick history: triggers, medications, allergies, and prior events.',
      'Request advanced airway support early if symptoms escalate.'
    ]
  },
  {
    id: 'trapped',
    title: 'Trapped',
    icon: ShieldAlert,
    bullets: [
      'Establish scene safety—do not become a secondary casualty.',
      'Make voice contact to gauge responsiveness and injuries.',
      'Stabilize the area with wedges or cribbing if trained.',
      'Control major bleeding without moving the patient unnecessarily.',
      'Provide reassurance and explain each step to reduce panic.',
      'Coordinate with specialized rescue teams for extrication.'
    ],
    more: [
      'Gather details about the mechanism (vehicle, structure, machinery) for incoming units.',
      'Continuously reassess airways and circulation while awaiting extrication.'
    ]
  },
  {
    id: 'flood',
    title: 'Flood',
    icon: Waves,
    bullets: [
      'Move to the highest accessible point away from fast currents.',
      'Avoid entering water that obscures hazards or debris.',
      'Shut off electricity and gas only if it is safe to do so.',
      'Provide flotation aids or throw lines instead of swimming.',
      'Account for all personnel and maintain buddy checks every 10 minutes.',
      'Prepare hypothermia blankets and dry clothing for evacuees.'
    ],
    more: [
      'Report water depth changes and potential chemical smells to command immediately.',
      'Identify alternate evacuation routes in case primary paths flood.'
    ]
  },
  {
    id: 'fire-nearby',
    title: 'Fire Nearby',
    icon: Siren,
    bullets: [
      'Sound alarms and initiate evacuation protocols without delay.',
      'Close doors behind you to slow smoke spread.',
      'Keep low to avoid superheated, toxic smoke layers.',
      'Account for all responders at the designated safe zone.',
      'Do not reenter without firefighting PPE and a charged line.',
      'Assign a lookout to track wind direction and ember travel.'
    ],
    more: [
      'Coordinate with fire units on hydrant locations and access routes.',
      'Stage medical supplies for smoke inhalation support at the safe zone.'
    ]
  },
  {
    id: 'basic-cpr',
    title: 'Basic CPR',
    icon: HeartPulse,
    bullets: [
      'Verify unresponsiveness and call for advanced help immediately.',
      'Place the heel of your hand at the sternum center and interlock fingers.',
      'Compress at 100–120 per minute to a depth of 2 inches (5 cm).',
      'Allow full chest recoil between compressions.',
      'After 30 compressions deliver 2 rescue breaths with a barrier.',
      'Swap rescuers every two minutes to maintain quality compressions.'
    ],
    more: [
      'Attach and follow AED prompts the moment it arrives.',
      'Document time of collapse, CPR start, and rhythm changes for EMS handoff.'
    ]
  }
];
