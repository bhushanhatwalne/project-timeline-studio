# SBPP4 Commission Transition - Project Setup Guide

This guide provides step-by-step instructions to create the **SBPP4 Commission Transition** project in Timeline Studio based on the wireframe data.

## Project Overview

- **Project Name:** SBPP4 Commission Transition
- **Total Actions:** 17 items
- **Duration:** August 16, 2026 → November 14, 2026
- **Key Milestone:** September 16, 2026 (Cutover date)
- **7 Work Phases/Swimlanes**

---

## Quick Setup Instructions

### Step 1: Create New Project

1. Go to Dashboard
2. Click **+ New Project**
3. Enter project name: `SBPP4 Commission Transition`
4. Click Create

### Step 2: Create Swimlanes (Phases)

In the Data tab, create these 7 swimlanes in order:

1. **Foundations** 
2. **Design & Build**
3. **Validate & Ready**
4. **Cutover Window**
5. **Parallel Track (Ongoing)**
6. **Reporting & Partner Comms**
7. **First Payout**

---

## Detailed Task Data

Below is the complete data for all 17 action items. For each item, follow this process:

1. Click **+ Task** under the relevant swimlane
2. Fill in the fields according to the data below
3. The system will auto-calculate status based on dates and progress

---

## SWIMLANE 1: Foundations (Aug 16 – Aug 29, 2026)

### Item #1: Share processing files / required fields
- **Type:** Task
- **Owner:** Darryl Estes
- **Start:** 2026-08-16
- **End:** 2026-08-16
- **Duration:** Immediate
- **Assigned to:** Darryl Estes
- **% Complete:** 0%
- **Status:** Ready to start
- **Dependencies:** None
- **Notes:** Darryl confirmed multiple files; small business partitioning needed.
- **Accountable:** Stefan / Commission leadership
- **Consulted:** Gaby Martinez, Daniel, Tanzil
- **Informed:** Marcus, John, Moya

### Item #2: Create field definitions / mapping dictionary
- **Type:** Task
- **Owner:** Gaby Martinez
- **Start:** 2026-08-16
- **End:** 2026-08-29
- **Assigned to:** Gaby Martinez
- **% Complete:** 0%
- **Dependencies:** #1
- **Notes:** Need to define sub-agent ID, referral ID, affiliate ID, and similar fields.
- **Accountable:** Gaby Martinez
- **Consulted:** Darryl Estes, Daniel Forester, Tanzil Manawar
- **Informed:** John Muscarella, Marcus Thomas

### Item #3: Reconcile BI feed vs Charter requirements
- **Type:** Task
- **Owner:** Daniel / Tanzil
- **Start:** 2026-08-16
- **End:** 2026-08-29
- **Assigned to:** Daniel Forester
- **% Complete:** 0%
- **Dependencies:** #1
- **Notes:** Daniel's team to quickly review what is in the file / BI feed.
- **Accountable:** Tanzil Manawar
- **Consulted:** Darryl Estes, Gaby Martinez
- **Informed:** Marcus, Moya, John

---

## SWIMLANE 2: Design & Build (Aug 29 – Sep 12, 2026)

### Item #4: Confirm missing fields / CR needs
- **Type:** Task
- **Owner:** Daniel / BI
- **Start:** 2026-08-29
- **End:** 2026-09-05
- **Assigned to:** Tanzil Manawar
- **% Complete:** 0%
- **Dependencies:** #3
- **Notes:** Confirm whether change requests for the BI feed are necessary.
- **Accountable:** Tanzil Manawar
- **Consulted:** Darryl Estes, Gaby Martinez
- **Informed:** Marcus, John

### Item #5: Confirm calendar vs physical/fiscal month
- **Type:** Task
- **Owner:** Gaby / BI / PI
- **Start:** 2026-08-29
- **End:** 2026-09-05
- **Assigned to:** Gaby Martinez
- **% Complete:** 0%
- **Dependencies:** #3
- **Notes:** Calendars differ; impacts payment timing and manual adjustments.
- **Accountable:** Gaby Martinez
- **Consulted:** Marcus Thomas, Tanzil Manawar
- **Informed:** Darryl Estes, John Muscarella

### Item #6: Finalize September split-payment design
- **Type:** Task
- **Owner:** Gaby, Marcus, Tanzil, Darryl
- **Start:** 2026-08-29
- **End:** 2026-09-12
- **Assigned to:** Marcus Thomas
- **% Complete:** 0%
- **Dependencies:** #4, #5
- **Notes:** Split-month approach: legacy continues; SBPP4 paid via new treatment.
- **Accountable:** Marcus Thomas
- **Consulted:** John Muscarella, Daniel Forester
- **Informed:** Moya Neville

### Item #7: Define product-routing and double-pay prevention
- **Type:** Task
- **Owner:** Tanzil, Daniel
- **Start:** 2026-08-29
- **End:** 2026-09-12
- **Assigned to:** Tanzil Manawar
- **% Complete:** 0%
- **Dependencies:** #3, #6
- **Notes:** Separate SBPP4 and non-SBPP4 routing to avoid double payment.
- **Accountable:** Tanzil Manawar
- **Consulted:** Gaby Martinez, Darryl Estes, Marcus Thomas
- **Informed:** Moya Neville, John Muscarella

---

## SWIMLANE 3: Validate & Ready (Sep 5 – Sep 19, 2026)

### Item #8: Update filters, queries, logs
- **Type:** Task
- **Owner:** Tanzil, Daniel, Darryl
- **Start:** 2026-09-05
- **End:** 2026-09-12
- **Assigned to:** Tanzil Manawar
- **% Complete:** 0%
- **Dependencies:** #7
- **Notes:** Technical updates required for bifurcation.
- **Accountable:** Tanzil Manawar, Darryl Estes
- **Consulted:** Gaby Martinez
- **Informed:** Marcus Thomas, John Muscarella

### Item #9: Prepare Charter-side data receiving
- **Type:** Task
- **Owner:** Darryl
- **Start:** 2026-09-05
- **End:** 2026-09-12
- **Assigned to:** Darryl Estes
- **% Complete:** 0%
- **Dependencies:** #3, #6
- **Notes:** Semi-automated Redshift-based processing; integration needed.
- **Accountable:** Darryl Estes
- **Consulted:** Daniel Forester, Tanzil Manawar, Gaby Martinez
- **Informed:** Stefan Isidore, Marcus Thomas

### Item #10: Validate BI/data-layer solution readiness
- **Type:** Task
- **Owner:** Tanzil, Darryl, Daniel
- **Start:** 2026-09-12
- **End:** 2026-09-19
- **Assigned to:** Tanzil Manawar
- **% Complete:** 0%
- **Dependencies:** #8, #9
- **Notes:** Preferred to stay a data/BI-reporting fix rather than a major tech build.
- **Accountable:** Tanzil Manawar
- **Consulted:** Gaby Martinez, Darryl Estes
- **Informed:** Moya Neville, Marcus Thomas

### Item #11: Go-live readiness for September selling
- **Type:** Major Milestone
- **Owner:** Cross-functional
- **Start:** 2026-09-12
- **End:** 2026-09-19
- **Assigned to:** Marcus Thomas
- **% Complete:** 0%
- **Dependencies:** #10
- **Notes:** Must be prepared for Spectrum Day product availability.
- **Accountable:** Marcus Thomas
- **Consulted:** Gaby Martinez, Tanzil Manawar, Darryl Estes, John Muscarella
- **Informed:** Broader stakeholders

---

## SWIMLANE 4: Cutover Window (Sep 16 – Sep 28, 2026)

### Item #12: Transition processing for SBPP4 sales
- **Type:** Milestone
- **Owner:** Cross-functional
- **Start:** 2026-09-16
- **End:** 2026-09-28
- **Assigned to:** Marcus Thomas
- **% Complete:** 0%
- **Dependencies:** #11
- **Notes:** Prorated transition treatment with separate handling, 16–28 Sept.
- **Accountable:** Marcus Thomas
- **Consulted:** Gaby Martinez, Tanzil Manawar, Darryl Estes, Daniel Forester
- **Informed:** Moya Neville, John Muscarella

---

## SWIMLANE 5: Parallel Track (Ongoing)

### Item #13: Continue legacy Cox compensation
- **Type:** Task
- **Owner:** Cox legacy owners
- **Start:** 2026-08-16
- **End:** 2026-11-14
- **Assigned to:** Marcus Thomas
- **% Complete:** 0%
- **Dependencies:** None
- **Notes:** Legacy process remains in place for non-SBPP4 and residuals throughout.
- **Accountable:** Marcus Thomas / Cox leadership
- **Consulted:** John Muscarella, Tanzil Manawar, Daniel Forester
- **Informed:** Moya Neville, Gaby Martinez

---

## SWIMLANE 6: Reporting & Partner Comms (Sep 19 – Oct 3, 2026)

### Item #14: Reporting design for distributors
- **Type:** Task
- **Owner:** Darryl / reporting
- **Start:** 2026-09-19
- **End:** 2026-10-03
- **Assigned to:** Darryl Estes
- **% Complete:** 0%
- **Dependencies:** #12
- **Notes:** Darryl's team to own reporting design for the new payments.
- **Accountable:** Darryl Estes
- **Consulted:** Gaby Martinez, John Muscarella
- **Informed:** Marcus Thomas, Brad Colonna

### Item #15: Reporting labels for legacy vs new treatment
- **Type:** Task
- **Owner:** Reporting team
- **Start:** 2026-09-19
- **End:** 2026-10-03
- **Assigned to:** Darryl Estes
- **% Complete:** 0%
- **Dependencies:** #14
- **Notes:** Clarify mixed treatment in distributor-facing reporting.
- **Accountable:** Darryl Estes
- **Consulted:** Gaby Martinez, John Muscarella
- **Informed:** Distributors / partners

### Item #16: Draft partner communication / contract addendum
- **Type:** Task
- **Owner:** Gaby / John / Legal
- **Start:** 2026-09-19
- **End:** 2026-10-31
- **Assigned to:** John Muscarella
- **% Complete:** 0%
- **Dependencies:** #6
- **Notes:** Clarify this is an addition, not a full Spectrum plan migration.
- **Accountable:** John Muscarella
- **Consulted:** Gaby Martinez, Legal, Marcus Thomas
- **Informed:** Moya Neville, Darryl Estes

---

## SWIMLANE 7: First Payout (Nov 1 – Nov 14, 2026)

### Item #17: First payout for September sales
- **Type:** Milestone
- **Owner:** Payment teams
- **Start:** 2026-11-01
- **End:** 2026-11-14
- **Assigned to:** Marcus Thomas
- **% Complete:** 0%
- **Dependencies:** #12, #14, #15
- **Notes:** Payments expected to land for September sales.
- **Accountable:** Marcus Thomas
- **Consulted:** Darryl Estes, Gaby Martinez, Tanzil Manawar
- **Informed:** John Muscarella, Moya Neville

---

## Dashboard Expected Status

Once all items are entered with start dates in August 2026:

- **Total Projects:** 1
- **On Track:** Expected (most items start in future)
- **At Risk:** 0
- **Off Track:** 0
- **Not Started:** 1 (all items not yet begun)

---

## Tips for Data Entry

1. **Use Copy/Paste for Dates:** You can now paste dates in multiple formats:
   - `2026-08-16`
   - `08/16/2026`
   - `8/16/2026`

2. **Sidebar Navigation:** Use the **←** button at bottom-right to collapse sidebar and maximize table space while entering data

3. **Table Resizing:** Columns auto-adjust based on content; no need to manually resize

4. **Status Auto-Calculation:** Once dates are set, status will automatically update:
   - Items with start > today = "Not Started"
   - Items in progress = "On Track" (or other based on variance)
   - Items 100% complete = "Complete"

---

## Timeline View (After Data Entry)

Once items are added, switch to **Timeline** tab to see:
- Gantt bars spanning Aug 16 → Nov 14
- Cutover dates (Sep 16-28) highlighted
- Milestone markers (items #11, #12, #17)
- Status colors: Green (complete), Blue (on track), Amber (ready), etc.

---

## Saving the Project

Click **💾 Save version** to save a snapshot:
- **Name:** `SBPP4 - Initial Setup`
- **Group:** `Commission Systems`

This creates a versioned snapshot you can restore later.

---

## Notes

- All dates assume 2026 calendar
- Weeks are converted to date ranges (Mon-Fri)
- "Ongoing" items span the full project duration
- Dependencies ensure proper sequencing in status calculation
