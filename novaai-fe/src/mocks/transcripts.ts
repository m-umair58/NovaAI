export interface SampleTranscript {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  content: string;
}

export const sampleTranscripts: SampleTranscript[] = [
  {
    id: "weekly-standup",
    title: "Weekly Product Standup",
    description: "Short team sync with clear owners and deadlines.",
    difficulty: "Easy",
    content: `Anna: Thanks everyone for joining. Let's go through the open items from last week.
  Ben: The login bug is fixed. I deployed the patch yesterday evening.
  Anna: Great. For the newsletter launch, we still need the landing page copy finalized.
  Clara: I can write the copy and send it to marketing by Wednesday, March 12th.
  Anna: Perfect. Ben, can you hook up the signup form on the website?
  Ben: Yes, I'll integrate the form by Thursday, March 13th.
  Anna: I'll schedule the announcement email with our CRM team for Friday, March 14th.
  Ben: Sounds good.
  Anna: Anything else? No? Then we're done. Thanks all.`,
  },
  {
    id: "sprint-planning",
    title: "Sprint Planning",
    description: "Planning meeting for Sprint 24 with mixed task clarity.",
    difficulty: "Medium",
    content: `Rachel: Welcome to Sprint 24 planning. We have a packed backlog this sprint.
  Tom: The payments API refactor is still in progress. I need two more days to finish it.
  Rachel: What's blocking you right now?
  Tom: We're still waiting on sandbox credentials from finance. Someone needs to chase that.
  Rachel: I'll ping finance today and get that moving.
  Lisa: For the mobile app, we should improve the onboarding flow. I'll mock up new screens.
  Mark: We also need to update the privacy policy before we ship push notifications.
  Lisa: I can draft something, but I'm not sure who approves legal content on our side.
  Rachel: Legal usually takes a week. Let's aim to send a draft early next week.
  Tom: The analytics dashboard is still showing stale data. That needs to be fixed before release.
  Rachel: Mark, can you prioritize that fix?
  Mark: I can look at it, but I don't have a firm date yet.
  Rachel: Okay. One more thing—we need QA to regression test the checkout flow.
  Tom: I'll coordinate with QA once the payments work is stable.
  Rachel: Alright, let's sync again on Thursday. Thanks everyone.`,
  },
  {
    id: "enterprise-rollout",
    title: "Enterprise Rollout War Room",
    description:
      "Complex multi-stakeholder meeting with implied and relative deadlines.",
    difficulty: "Hard",
    content: `James: Okay team, war room for the enterprise rollout. Lots to cover today.
  Priya: Sorry I'm late—had another call run over.
  James: No worries. First up, the SSO integration. Where are we?
  Priya: It's mostly done, but we hit an edge case with Okta token refresh. I'm fixing that before the client demo.
  James: When is the demo?
  Priya: Tuesday at 10 AM, so I need this wrapped up by end of day Monday.
  Marcus: Infrastructure-wise, we're scaling the worker pool, but we still need load test results.
  James: Can someone run load tests on staging?
  Marcus: I was going to, but I need the latest build from Priya's branch first.
  Priya: I'll merge after the token fix—probably tonight.
  James: Customer success flagged that our onboarding docs are outdated.
  Nina: Yeah, I started rewriting them, but we should also record a short walkthrough video.
  James: Good idea. Who has bandwidth for that?
  Nina: I can script it if someone else can handle the recording.
  Marcus: I can record early next week once staging is stable.
  James: What about the billing migration? Finance wants numbers reconciled before go-live.
  Priya: That's on my list, but honestly it's lower priority than SSO right now.
  James: We can't slip that—finance needs reconciliation by next Friday.
  Nina: I can help Priya with billing after the docs are done if needed.
  James: Security review is still open too. Someone from our team needs to respond to their questionnaire.
  Marcus: I saw the email. It's long. We should probably assign an owner—
  James: I'll take the first pass tonight and share a draft in the channel.
  James: Also, we need to confirm the rollback plan with DevOps before the production cutover.
  Priya: DevOps wanted that documented. I can add a section to the runbook before the sprint ends.
  James: Perfect. Last thing—the client asked for a status summary by EOD.
  Nina: I can send a high-level update if James shares the rollout risks.
  James: I'll send risks in Slack in an hour.
  James: Alright, let's execute. Thanks everyone.`,
  },
];
