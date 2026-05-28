/** Shared step counts for pre–waiting-room setup (start → create/join → identity/link). */
export const SETUP_FLOW_TOTAL_STEPS = 3;

export const setupFlowSteps = {
  start: 1,
  createTitle: 2,
  createIdentity: 3,
  createLinkReady: 3,
  join: 2,
  inviteJoin: 2,
} as const;
