(function () {
  const priorityLabels = window.WorkerConversation.humanLabels.priorities;

  function recommendations(answers) {
    const items = [];
    const status = answers.healthcare_status;
    if (status === "uninsured" || status === "unsure" || status === "medicaid" || answers.priorities && answers.priorities.includes("healthcare")) {
      items.push({
        title: status === "medicaid" ? "Get Medicaid renewal help" : "Talk with a health coverage Navigator",
        text: status === "medicaid"
          ? "A New York State of Health enrollment assister can help explain renewal notices and next steps. No enrollment is submitted by this demo."
          : "A free, trained assister can review Marketplace plans, Medicaid eligibility, and financial help based on your situation.",
        kind: "HEALTH COVERAGE"
      });
    }
    if (answers.priorities && answers.priorities.includes("taxes") || answers.income === "very_variable") {
      items.push({
        title: "Make gig income easier to track",
        text: "NYC Free Tax Prep offers eligible New Yorkers free tax preparation. Keep a simple record of payouts and work expenses between appointments.",
        kind: "TAXES & RECORDS"
      });
    }
    if (answers.priorities && (answers.priorities.includes("expenses") || answers.priorities.includes("pay"))) {
      items.push({
        title: answers.worker_type === "freelance" ? "Get help with client and business questions" : "Review work costs and payment options",
        text: "NYC Small Business Services offers free one-on-one business support. Ask about cash flow, client payments, and keeping work expenses organized.",
        kind: "WORK & INCOME"
      });
    }
    if (answers.priorities && (answers.priorities.includes("safety") || answers.priorities.includes("support"))) {
      items.push({
        title: "Find a worker support organization",
        text: "NYC 311 can help locate nearby community-based worker and legal-support organizations. Ask what services are available before sharing personal details.",
        kind: "LOCAL SUPPORT"
      });
    }
    if ((answers.worker_type === "food_delivery" || answers.worker_type === "rideshare") && !items.some((item) => item.kind === "WORK & INCOME")) {
      items.push({
        title: "Check NYC worker protections for app-based work",
        text: "NYC Department of Consumer and Worker Protection shares current guidance for app-based delivery and rideshare workers. Confirm which rules apply to your platform.",
        kind: "WORKER RIGHTS"
      });
    }
    if ((answers.organization_interest === "yes" || answers.organization_interest === "maybe") && items.length < 4) {
      items.push({
        title: "Explore worker-led support at your pace",
        text: "Worker-led organizations can offer peer connection, rights education, and collective support. This is an optional path; no information is shared or sent.",
        kind: "OPTIONAL COMMUNITY SUPPORT"
      });
    }
    if (items.length < 2) {
      items.push({
        title: "Get a personal benefits screening",
        text: "NYC Benefits Screening tools can help identify public programs to explore. Eligibility depends on your full situation, so use the result as a starting point.",
        kind: "BENEFITS"
      });
    }
    return items.slice(0, 4);
  }

  function createCell(label, value) {
    const cell = document.createElement("div");
    cell.className = "snapshot-cell";
    const heading = document.createElement("span");
    heading.className = "snapshot-cell-label";
    heading.textContent = label;
    const content = document.createElement("span");
    content.className = "snapshot-cell-value";
    content.textContent = value || "Not provided";
    cell.append(heading, content);
    return cell;
  }

  function render(profile) {
    const answers = profile.answers;
    const view = document.getElementById("resultsView");
    const priorities = (answers.priorities || []).map((value) => priorityLabels[value] || value);
    const platformNames = window.WorkerConversation.labelFor("platforms", answers.platforms);
    view.replaceChildren();

    const kicker = document.createElement("div");
    kicker.className = "results-kicker";
    kicker.textContent = "YOUR WORKER BENEFITS SNAPSHOT";
    const titleRow = document.createElement("div");
    titleRow.className = "results-title-row";
    const title = document.createElement("h2");
    title.textContent = "A few useful next steps.";
    const stamp = document.createElement("span");
    stamp.className = "snapshot-stamp";
    stamp.textContent = "Made for you · saved on this device";
    titleRow.append(title, stamp);
    const lede = document.createElement("p");
    lede.className = "results-lede";
    const workLabel = window.WorkerConversation.labelFor("worker_type", answers.worker_type).toLowerCase();
    lede.textContent = "Based on your " + workLabel + " work" + (answers.neighborhood ? " in " + window.WorkerConversation.labelFor("neighborhood", answers.neighborhood) : "") + ", here’s a short list to explore. These are starting points, not referrals or eligibility decisions.";

    const grid = document.createElement("div");
    grid.className = "snapshot-grid";
    grid.append(
      createCell("Work type", window.WorkerConversation.labelFor("worker_type", answers.worker_type)),
      createCell("Platforms / channels", platformNames),
      createCell("Work rhythm", window.WorkerConversation.labelFor("schedule", answers.schedule)),
      createCell("Health coverage", window.WorkerConversation.labelFor("healthcare_status", answers.healthcare_status)),
      createCell("Top priorities", priorities.join(" · ") || "General support"),
      createCell("Income pattern", answers.income ? window.WorkerConversation.labelFor("income", answers.income) : "Not shared")
    );
    if (answers.rideshare_vehicle_costs) grid.append(createCell("Vehicle costs", window.WorkerConversation.labelFor("rideshare_vehicle_costs", answers.rideshare_vehicle_costs)));
    if (answers.rideshare_concerns) grid.append(createCell("Rideshare concerns", window.WorkerConversation.labelFor("rideshare_concerns", answers.rideshare_concerns)));
    if (answers.freelance_payments) grid.append(createCell("Client payments", window.WorkerConversation.labelFor("freelance_payments", answers.freelance_payments)));
    if (answers.freelance_projects) grid.append(createCell("Project work", window.WorkerConversation.labelFor("freelance_projects", answers.freelance_projects)));

    const heading = document.createElement("div");
    heading.className = "recommendation-heading";
    const headingTitle = document.createElement("h3");
    headingTitle.textContent = "Places to start";
    const headingNote = document.createElement("span");
    headingNote.textContent = "Illustrative service recommendations · verify current details";
    heading.append(headingTitle, headingNote);
    const list = document.createElement("div");
    list.className = "recommendation-list";
    recommendations(answers).forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "recommendation";
      const number = document.createElement("span");
      number.className = "recommendation-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const copy = document.createElement("div");
      const name = document.createElement("h4");
      name.textContent = item.title;
      const text = document.createElement("p");
      text.textContent = item.text;
      const kind = document.createElement("span");
      kind.className = "mock-label";
      kind.textContent = item.kind + " · MOCK RECOMMENDATION";
      copy.append(name, text, kind);
      const arrow = document.createElement("span");
      arrow.className = "rec-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "↗";
      card.append(number, copy, arrow);
      list.append(card);
    });

    const bottom = document.createElement("div");
    bottom.className = "results-bottom";
    const note = document.createElement("p");
    note.className = "results-note";
    note.textContent = "This demo provides general information only. It does not confirm eligibility, make a referral, or contact any organization. Your answers remain in local browser storage until you clear them.";
    const actions = document.createElement("div");
    actions.className = "results-actions";
    const edit = document.createElement("button");
    edit.className = "secondary-button";
    edit.type = "button";
    edit.dataset.action = "edit-intake";
    edit.textContent = "Review my answers";
    const agent = document.createElement("a");
    agent.className = "secondary-button";
    agent.href = "agent.html";
    agent.textContent = "Open mock agent view ↗";
    actions.append(edit, agent);
    bottom.append(note, actions);

    view.append(kicker, titleRow, lede, grid, heading, list, bottom);
    return view;
  }

  window.WorkerResults = { recommendations, render };
})();