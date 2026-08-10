# Skill: Status Calculation

## Overview
Guidance for calculating the status for each project of Timeline Studio.

## When to Use This Skill
1. Recommended status model
Use four project-level statuses:
Status   | Meaning  | Recommended rule
🟢      | On Track | Progress is consistent with plan	Schedule variance ≥ -10% and no critical issue
🟡 | At Risk	    | Some slippage or risk exists	Schedule variance -10% to -20% OR upcoming milestone risk
🔴 | Off Track	  | Material delay	Schedule variance < -20% OR critical milestone delayed
⚪ | Not Started	 | Project hasn't meaningfully started	Actual progress = 0%
I would not use "Complete" as a project status unless 100% of required work is complete.

2. First calculate task-level schedule progress
For each task, calculate: Planned Progress. Based on today's date: capped between 0% and 100%. Then compare it to Actual %.
Schedule Variance
For example:
IT Build & Unit Test
•	Start: 07/20/2026 
•	End: 09/18/2026 
•	Actual: 40% 
•	Today: 08/09/2026 
Approximately 33% of the calendar duration has elapsed.
So:
Planned = ~33%
Actual = 40%
Therefore:
Schedule variance ≈ +7%
That's actually ahead of schedule.

3. But there is a better calculation for the application
Because the timeline contains:
•	Tasks 
•	Milestones 
•	Different durations 
•	Different percentages 
•	Different owners 
Recommend calculating three separate dimensions.
A. Progress: How much work has actually been completed?
B. Schedule: Are we completing the work at the rate required to meet the planned dates?
C. Milestones: Are important dates being achieved?
Then calculate overall status from those three.

4. Overall Project Progress
Don't simply average the percentages. A simple average would be misleading. Instead, use duration-weighted progress.
For tasks: Ex: the task durations shown add up to approximately 65 weeks. Only the 9-week IT Build task currently has partial progress.
So duration-weighted completion is approximately: ≈ 67.4%
That is a much more meaningful project progress number. However, there's an important caveat:
I would NOT necessarily display 67% as your project's progress. Because project is moving through sequential phases, and some later work hasn't started yet.
A better dashboard would distinguish:
Overall completion: 67% from: Schedule health: On Track and: Next milestone: SIT 
This prevents users from interpreting 67% as "67% of the project is almost done" when significant implementation/testing remains.

4. Overall Project Progress
Don't simply average the percentages.
For example, you currently have:
Discovery                  100%
Requirements Gathering    100%
Requirements Documentation100%
IT Analysis & Design      100%
Requirement Freeze        100%
IT Build & Unit Test       40%
SIT                         0%
UAT                         0%
Go/No Go                    0%
Production Migration Prep  0%
Production Migration       0%
Production Validation      0%
Production Validation      0%
Go Live                     0%
A simple average would be misleading.
Instead, use duration-weighted progress.
For tasks:
For your timeline, the task durations shown add up to approximately 65 weeks.
Only the 9-week IT Build task currently has partial progress.
So duration-weighted completion is approximately:
≈ 67.4%
That is a much more meaningful project progress number.
However, there's an important caveat:
I would NOT necessarily display 67% as your project's progress.
Why?
Because your project is moving through sequential phases, and some later work hasn't started yet.
A better dashboard would distinguish:
Overall completion: 67%
from:
Schedule health: On Track
and:
Next milestone: SIT
This prevents users from interpreting 67% as "67% of the project is almost done" when significant implementation/testing remains.
________________________________________
5. Even better: use weighted task effort
Σ(Duration)
Level 2 — Better
Use estimated effort:
Progress =
Σ(Estimated Hours × % Complete)
──────────────────────────────
For Future enahacement:
Σ(Estimated Hours)
Level 3 — Enterprise
Use:
Work × Dependencies × Critical Path × Milestones
This is where Timeline Studio could become much more powerful.

6. Status should NOT equal Progress
This is an important design decision.
For example:
Project A
Progress = 40%
Schedule = Ahead
Status = 🟢 On Track
Project B
Progress = 80%
Schedule = 20% behind
Status = 🔴 Off Track
So:
Progress tells you how much is done.
Status tells you whether the project is healthy.
Those are different things.

7. Recommended calculation for your Status column
For each task:
🟢 Complete If: Actual % = 100% Then: Complete
________________________________________
⚪ Not Started If: Actual % = 0% AND Start Date > Today Then: Not Started
________________________________________
🟢 On Track If: Actual Progress >= Planned Progress - 10% Then: On Track
________________________________________ 
🟡 At Risk If: Actual Progress < Planned Progress - 10% but: Actual Progress >= Planned Progress - 20% Then: At Risk
________________________________________
🔴 Off Track If: Actual Progress < Planned Progress - 20% Then: Off Track 

8. But milestones need special treatment
This is extremely important 
You have:
•	Requirement Freeze 
•	Go/No Go 
•	Production Migration 
•	Go Live 
A milestone should not use the same percentage calculation as a task.
For example: Requirement Freeze 07/29/2026 It is already complete. Therefore: 🟢 Complete
Go/No Go 10/16/2026 Today = 08/09/2026. Therefore: ⚪ Not Started
But if the milestone date is approaching and its predecessor tasks aren't progressing, it could become: 🟡 At Risk

9. Add predecessor logic
This would make Timeline Studio considerably smarter.
For example:
IT Build & Unit Test
        ↓
       SIT
        ↓
       UAT
        ↓
    Go / No Go
        ↓
Production Migration
        ↓
Production Validation
        ↓
      Go Live
If IT Build is delayed, the application should examine whether that delay affects SIT.
For example:
IT Build
End: 09/18
SIT
Start: 09/14
There's actually an overlap.
That's important.
Your system should flag:
⚠️ SIT starts before IT Build & Unit Test is scheduled to finish.
That may be intentional, but the application should recognize it.
This is much more valuable than simply calculating %.

10. Critical Path should influence Status
I'd recommend a weighted status engine:
                 ┌─────────────────┐
                 │ Task Progress   │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Schedule Health │
                 └────────┬────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
       Milestones     Dependencies   Critical Path
           │              │              │
           └──────────────┼──────────────┘
                          ▼
                 ┌─────────────────┐
                 │ PROJECT STATUS  │
                 └─────────────────┘

11. My recommended scoring engine
For Timeline Studio, I'd actually calculate a Project Health Score.
Schedule
40%
Progress
25%
Milestones
20%
Dependencies
10%
Risks/Issues
5%
Then:
Score	Status
85–100	🟢 On Track
70–84	🟡 At Risk
<70	🔴 Off Track
This gives you a much more sophisticated system than simply looking at task percentages.

12. For your current timeline
Based strictly on the screenshot:
Completed
•	Discovery — 100% 
•	Requirements Gathering — 100% 
•	Requirements Documentation — 100% 
•	IT Analysis & Design — 100% 
•	Requirement Freeze — 100% 
Current
IT Build & Unit Test
40% complete
But it is only about one-third through its planned calendar duration.
Therefore:
🟢 On Track
Upcoming
SIT
Starts 09/14/2026.
I'd classify it:
⚪ Not Started
but monitor the dependency on IT Build.
UAT
⚪ Not Started
Go/No Go
⚪ Not Started
Production activities
⚪ Not Started
Go Live
⚪ Not Started
________________________________________
13. What I would show in Timeline Studio
Instead of only this:
STATUS
[Complete]
[Complete]
[Complete]
[Complete]
[Complete]
[In Progress]
[Not Started]
...
I'd eventually have:
STATUS              PROGRESS       SCHEDULE

🟢 Complete           100%          On Plan
🟢 Complete           100%          On Plan
🟢 Complete           100%          On Plan
🟢 Complete           100%          On Plan
🟢 Complete           100%          On Plan

🟢 On Track            40%          +7% Ahead

⚪ Not Started          0%          Future
⚪ Not Started          0%          Future
🟡 At Risk              0%          Dependency Risk
...
And at the top of the project:
┌─────────────────────────────────────────────────────────┐
│ PROJECT HEALTH                                          │
│                                                         │
│ 🟢 ON TRACK                         Health Score: 91     │
│                                                         │
│ Overall Progress       67%                              │
│ Schedule Performance   +7%                              │
│ Completed Tasks        5 / 14                           │
│ Next Milestone         SIT • Sep 14                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
One thing I would change in your current design
Don't allow users to manually select Complete, In Progress, and Not Started if you want Timeline Studio to be a smart planning application.
Instead, have:
Status = Auto Calculated
with an optional:
Override Status → Manual
That gives you both automation and project-manager control.
For your particular timeline, I'd implement the calculation as:
Actual % → Planned % → Schedule Variance → Milestone/Dependency Check → Status → Overall Project Health.
That is the approach I'd recommend building into Timeline Studio rather than a simple percentage-based status calculation.

14. Logic for Status calculation on the data tab of each project:
% = 0: Not Started
% = 100: Complete
if any % is greater than 0 but less than 100, it should be i