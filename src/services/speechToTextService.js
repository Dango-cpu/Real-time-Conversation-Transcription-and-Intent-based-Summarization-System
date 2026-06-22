const transcript = [
  { speaker:'Sarah', timestamp:'00:03', text:'Good morning! Shall we review the launch plan for the mobile app?' },
  { speaker:'Minh', timestamp:'00:09', text:'Absolutely. The design is ready, and the development team can begin on Monday.' },
  { speaker:'Sarah', timestamp:'00:17', text:'Great. Let’s prioritize onboarding and aim for a beta release next month.' }
]
/**
 * Mock STT adapter. `modelId` is already part of the contract so a real model
 * router can be integrated here without changing the controller or UI.
 */
export async function transcribeAudio(audio, modelId) {
  void audio
  return { provider:'mock', isMock:true, modelId, transcript:structuredClone(transcript) }
}
