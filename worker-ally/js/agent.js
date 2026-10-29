(function () {
  const sampleProfile = {
    answers: {
      worker_type: "food_delivery",
      neighborhood: "queens",
      platforms: ["doordash", "uber_eats"],
      schedule: "full_time",
      income: "some_swings",
      priorities: ["healthcare", "expenses", "taxes"],
      healthcare_status: "uninsured",
      healthcare_uninsured: "enrollment_barrier"
    },
    completed: true
  };

  function valueLabel(questionId, value) {
    if (!value) return "Not provided";
    return window.WorkerConversation.labelFor(questionId, value);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function detail(label, value, fullWidth) {
    const wrapper = createElement("div", "detail-item" + (fullWidth ? " full-width" : ""));
    wrapper.append(createElement("span", "", label), createElement("strong", "", value));
    return wrapper;
  }

  function action(title, description) {
    const wrapper = createElement("div", "agent-action");
    wrapper.append(createElement("span", "action-check", "✓"));
    const copy = createElement("div");
    copy.append(createElement("h3", "", title), createElement("p", "", description));
    wrapper.append(copy);
    return wrapper;
  }

  function render() {
    const stored = window.WorkerProfile.load();
    const hasProfile = stored.completed && Object.keys(stored.answers).length > 0;
    const profile = hasProfile ? stored : sampleProfile;
    const answers = profile.answers;
    const priorities = (answers.priorities || []).map((value) => window.WorkerConversation.humanLabels.priorities[value] || value);
    const main = document.getElementById("agentMain");
    main.replaceChildren();

    const heading = createElement("div", "agent-heading");
    const headingCopy = createElement("div");
    headingCopy.append(createElement("span", "eyebrow", "BENEFITS SUPPORT · NYC"), createElement("h1", "", "Intake at a glance"), createElement("p", "", "A read-only summary to help plan a useful follow-up."));
    const headingActions = createElement("div", "agent-heading-actions");
    const caseBadge = createElement("span", "agent-case-badge", "Intake received · demo");
    const printButton = createElement("button", "secondary-button", "Print summary");
    printButton.type = "button";
    printButton.addEventListener("click", () => window.print());
    headingActions.append(caseBadge, printButton);
    heading.append(headingCopy, headingActions);

    const layout = createElement("div", "agent-layout");
    const leftColumn = createElement("div", "agent-column");
    const intake = createElement("section", "agent-section");
    const intakeHeader = createElement("header", "agent-section-header");
    intakeHeader.append(createElement("h2", "", "Completed intake"), createElement("span", "", "Worker profile · local demo data"));
    const intakeBody = createElement("div", "agent-section-body");
    const meta = createElement("div", "case-meta");
    [
      ["Case reference", "WA-NYC-1048"],
      ["Received", hasProfile && stored.updatedAt ? new Date(stored.updatedAt).toLocaleDateString() : "Sample profile"],
      ["Review status", "Ready for triage"]
    ].forEach(([label, value]) => {
      const item = createElement("div", "case-meta-item");
      item.append(createElement("span", "", label), createElement("strong", "", value));
      meta.append(item);
    });
    const details = createElement("div", "intake-summary");
    details.append(
      detail("Type of work", valueLabel("worker_type", answers.worker_type)),
      detail("Borough", valueLabel("neighborhood", answers.neighborhood)),
      detail("Platforms / channels", valueLabel("platforms", answers.platforms)),
      detail("Work rhythm", valueLabel("schedule", answers.schedule)),
      detail("Income pattern", valueLabel("income", answers.income)),
      detail("Health coverage", valueLabel("healthcare_status", answers.healthcare_status))
    );
    if (answers.rideshare_vehicle_costs) details.append(detail("Rideshare vehicle costs", valueLabel("rideshare_vehicle_costs", answers.rideshare_vehicle_costs)));
    if (answers.rideshare_concerns) details.append(detail("Rideshare concerns", valueLabel("rideshare_concerns", answers.rideshare_concerns)));
    if (answers.freelance_payments) details.append(detail("Client payments", valueLabel("freelance_payments", answers.freelance_payments)));
    if (answers.freelance_projects) details.append(detail("Project work", valueLabel("freelance_projects", answers.freelance_projects)));
    const priority = createElement("div", "detail-item full-width");
    priority.append(createElement("span", "", "Worker-identified priorities"));
    const tags = createElement("div", "priority-tags");
    (priorities.length ? priorities : ["General benefits information"]).forEach((label) => tags.append(createElement("span", "priority-tag", label)));
    priority.append(tags);
    details.append(priority);
    intakeBody.append(meta, details);
    intake.append(intakeHeader, intakeBody);

    const guard = createElement("div", "privacy-guard");
    guard.append(createElement("span", "privacy-guard-mark", "●"));
    const guardCopy = createElement("span");
    guardCopy.append(createElement("strong", "", "Benefits view only. "), document.createTextNode("Worker-led organizing responses and other sensitive details are intentionally excluded from this dashboard."));
    guard.append(guardCopy);
    leftColumn.append(intake, guard);

    const rightColumn = createElement("div", "agent-column");
    const followup = createElement("section", "agent-section");
    const followupHeader = createElement("header", "agent-section-header");
    followupHeader.append(createElement("h2", "", "Suggested follow-up"), createElement("span", "", "Mock actions"));
    const followupBody = createElement("div", "agent-section-body");
    const actionList = createElement("div", "action-list");
    actionList.append(action("Offer a coverage screening", answers.healthcare_status === "uninsured" || answers.healthcare_status === "unsure" ? "Share a New York State of Health Navigator option; ask before making any referral." : "Confirm whether the worker wants help comparing coverage or reviewing plan changes."));
    actionList.append(action("Discuss work costs and income records", answers.worker_type === "rideshare" ? "Ask whether vehicle costs or platform pay questions are the most useful starting point." : "Offer practical guidance on tracking payouts, invoices, and work expenses."));
    actionList.append(action("Confirm a preferred next step", "Let the worker choose whether to continue, receive information, or close the case. No action has been sent."));
    followupBody.append(actionList);
    followup.append(followupHeader, followupBody);

    const status = createElement("section", "agent-section");
    const statusHeader = createElement("header", "agent-section-header");
    statusHeader.append(createElement("h2", "", "Case activity"), createElement("span", "", "Simulated"));
    const statusBody = createElement("div", "agent-section-body");
    const timeline = createElement("div", "status-timeline");
    [
      ["Intake completed", "Worker Ally local prototype"],
      ["Needs summarized", "Based on worker-selected priorities"],
      ["Follow-up pending", "No contact or referral has been made"]
    ].forEach(([title, description]) => {
      const item = createElement("div", "timeline-item");
      item.append(createElement("span", "timeline-mark"));
      const copy = createElement("div");
      copy.append(createElement("strong", "", title), createElement("p", "", description));
      item.append(copy);
      timeline.append(item);
    });
    statusBody.append(timeline);
    status.append(statusHeader, statusBody);
    rightColumn.append(followup, status);
    layout.append(leftColumn, rightColumn);

    main.append(heading, layout);
    if (!hasProfile) main.append(createElement("div", "sample-notice", "Showing a clearly labeled sample case. Complete the worker intake in this browser to see its locally stored profile here."));
  }

  render();
})();