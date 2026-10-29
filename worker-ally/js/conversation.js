(function () {
  const option = (value, label) => ({ value, label });
  const questions = {
    worker_type: {
      id: "worker_type",
      title: "What kind of independent work do you do most?",
      prompt: "Choose the closest fit. You can add other kinds of work later.",
      type: "single",
      options: [
        option("food_delivery", "Food delivery"),
        option("rideshare", "Rideshare"),
        option("freelance", "Freelancing or creative work"),
        option("care", "Care, cleaning, or home services"),
        option("other", "Another kind of gig work")
      ],
      replies: {
        food_delivery: "Got it. Delivery work can come with a very particular mix of time pressure and out-of-pocket costs.",
        rideshare: "Understood. We’ll keep vehicle costs and platform work in view as we map your options.",
        freelance: "Thanks. We’ll make room for client payments, project work, and the less predictable parts of freelance income.",
        care: "Thanks for sharing. We’ll look at the practical supports that can fit care and home-service work.",
        other: "That helps. The next few questions work for different kinds of independent work."
      }
    },
    neighborhood: {
      id: "neighborhood",
      title: "Where are you usually working from?",
      prompt: "This helps us keep suggestions relevant to New York City.",
      type: "single",
      optional: true,
      options: [option("bronx", "The Bronx"), option("brooklyn", "Brooklyn"), option("manhattan", "Manhattan"), option("queens", "Queens"), option("staten_island", "Staten Island"), option("varies", "It varies / citywide")],
      replies: { varies: "Citywide makes sense. We’ll stick to resources available across the five boroughs." }
    },
    platforms: {
      id: "platforms",
      title: "Which platforms or channels bring you work?",
      prompt: "Select all that apply. If you work independently, choose direct clients.",
      type: "multiple",
      optionsFor: function (profile) {
        const type = profile.answers.worker_type;
        const platformsByType = {
          food_delivery: [option("doordash", "DoorDash"), option("uber_eats", "Uber Eats"), option("grubhub", "Grubhub"), option("other_delivery", "Other delivery app")],
          rideshare: [option("uber", "Uber"), option("lyft", "Lyft"), option("other_rideshare", "Another rideshare app")],
          freelance: [option("direct_clients", "Direct clients"), option("upwork", "Upwork or similar"), option("creative_platform", "Creative marketplace")],
          care: [option("care_platform", "Care or home-service app"), option("direct_clients", "Direct clients"), option("referrals", "Word of mouth / referrals")],
          other: [option("platform_apps", "One or more apps"), option("direct_clients", "Direct clients"), option("referrals", "Word of mouth / referrals")]
        };
        return (platformsByType[type] || platformsByType.other).concat(option("multiple_channels", "A mix of channels"));
      },
      replies: { direct_clients: "Direct client work noted. Keeping track of invoices and payment timing can make a real difference." }
    },
    rideshare_vehicle_costs: {
      id: "rideshare_vehicle_costs",
      title: "Which vehicle costs are part of your rideshare work?",
      prompt: "Select all that apply. This helps make the work-expense suggestions more relevant.",
      type: "multiple",
      optional: true,
      options: [option("fuel", "Fuel or charging"), option("vehicle_payment", "Lease or loan payments"), option("maintenance", "Repairs and maintenance"), option("insurance", "Vehicle insurance"), option("tolls_parking", "Tolls or parking"), option("no_vehicle_costs", "None of these")],
      replies: { fuel: "Vehicle costs noted. We’ll keep them in view when looking at rideshare take-home pay." }
    },
    rideshare_concerns: {
      id: "rideshare_concerns",
      title: "What rideshare concerns would you most like help with?",
      prompt: "Choose any that matter to you right now. You can skip this question.",
      type: "multiple",
      optional: true,
      options: [option("pay_changes", "Pay or rate changes"), option("account_access", "Account access or deactivation"), option("passenger_safety", "Passenger safety"), option("road_safety", "Routes or road safety"), option("benefits_access", "Finding benefits as a driver")],
      replies: { account_access: "Account access can be stressful. I’ll keep practical worker-support options in the mix." }
    },
    freelance_payments: {
      id: "freelance_payments",
      title: "How do client payments usually go?",
      prompt: "Choose the closest fit. We can tailor the work-support suggestions around it.",
      type: "single",
      options: [option("paid_on_time", "Usually on time"), option("sometimes_late", "Sometimes late"), option("often_late", "Often late"), option("project_disputes", "Projects change or get disputed")],
      replies: { often_late: "Late payments can make cash flow difficult. I’ll prioritize client-payment support." }
    },
    freelance_projects: {
      id: "freelance_projects",
      title: "What best describes your project work?",
      prompt: "This helps distinguish steady client relationships from one-off project cycles.",
      type: "single",
      options: [option("recurring_clients", "Mostly recurring clients"), option("one_off_projects", "Mostly one-off projects"), option("finding_projects", "I’m looking for more projects"), option("project_mix", "A mix of both")],
      replies: { finding_projects: "Thanks. We’ll include a practical business-support option for finding and managing client work." }
    },
    schedule: {
      id: "schedule",
      title: "What does your work week look like lately?",
      prompt: "Pick the rhythm that feels most typical right now.",
      type: "single",
      options: [option("full_time", "Most days, full-time"), option("part_time", "Part-time around other work"), option("on_demand", "I log on when I can"), option("seasonal", "Seasonal or project-based"), option("changing", "It changes week to week")],
      replies: { changing: "That unpredictability is important context. We’ll avoid assuming a steady paycheck." }
    },
    income: {
      id: "income",
      title: "How predictable is your gig income month to month?",
      titleFor: function (profile) {
        return profile.answers.worker_type === "freelance" ? "How predictable is your freelance income month to month?" : this.title;
      },
      prompt: "No exact amount needed. This is optional, and it stays on this device.",
      type: "single",
      optional: true,
      options: [option("steady", "Fairly steady"), option("some_swings", "Some ups and downs"), option("very_variable", "Very unpredictable"), option("prefer_not", "I’d rather not say")],
      replies: { very_variable: "Thanks. We’ll prioritize options that don’t assume a predictable monthly income.", prefer_not: "No problem. We can still make a useful snapshot without an income estimate." }
    },
    priorities: {
      id: "priorities",
      title: "What would make the biggest difference right now?",
      prompt: "Choose up to three. We’ll use these to prioritize your next steps.",
      type: "multiple",
      maxSelections: 3,
      options: [option("healthcare", "Health coverage"), option("pay", "Reliable pay or late payments"), option("expenses", "Work expenses"), option("taxes", "Taxes and recordkeeping"), option("safety", "Safety on the job"), option("time", "More control over my time"), option("support", "Finding someone to talk to")],
      replies: { expenses: "Work costs can eat into take-home pay. I’ll include practical expense guidance in your snapshot." }
    },
    healthcare_status: {
      id: "healthcare_status",
      title: "What best describes your health coverage today?",
      prompt: "There’s no wrong answer. This just changes which resources might be useful.",
      type: "single",
      options: [option("insured", "I have coverage"), option("uninsured", "I don’t have coverage"), option("medicaid", "I’m on Medicaid"), option("unsure", "I’m not sure / it may have changed")],
      replies: {
        insured: "Good to know. Let’s check whether your current coverage feels workable.",
        uninsured: "Thanks for being open. New York has options worth checking, even if your income moves around.",
        medicaid: "Got it. We’ll include a renewal and enrollment support option.",
        unsure: "That happens. We’ll point you toward a place that can help check your status."
      }
    },
    healthcare_insured: {
      id: "healthcare_insured",
      title: "How is your current coverage working for you?",
      prompt: "Choose the closest fit so your follow-up can be more specific.",
      type: "single",
      options: [option("works", "It works well for me"), option("costly", "Premiums or costs are hard"), option("access", "Finding care is difficult"), option("coverage_change", "I may lose or change coverage")],
      replies: { costly: "Understood. A Navigator can compare plan costs and available financial help with you." }
    },
    healthcare_medicaid: {
      id: "healthcare_medicaid",
      title: "Would help with Medicaid renewal be useful?",
      prompt: "A renewal helper can explain notices and what to do next.",
      type: "single",
      options: [option("renewal_yes", "Yes, I’d like help"), option("renewal_no", "No, I’m all set"), option("renewal_unsure", "I’m not sure")],
      replies: { renewal_yes: "I’ll flag renewal support as a useful next step." }
    },
    healthcare_uninsured: {
      id: "healthcare_uninsured",
      title: "What gets in the way of getting coverage?",
      prompt: "Pick what feels closest. You can skip this if you’d rather not answer.",
      type: "single",
      options: [option("cost_barrier", "I’m worried about the cost"), option("enrollment_barrier", "I’m not sure how to enroll"), option("eligibility_barrier", "I’m unsure what I qualify for"), option("coverage_not_needed", "I’m okay for now")],
      replies: { cost_barrier: "That’s a common concern. A trained Navigator can walk through costs before you enroll." }
    },
    healthcare_unsure: {
      id: "healthcare_unsure",
      title: "Would you like help checking your coverage status?",
      prompt: "A free enrollment assister can help check options and next steps.",
      type: "single",
      options: [option("check_yes", "Yes, that would help"), option("check_later", "Maybe later"), option("check_no", "No thanks")],
      replies: { check_yes: "I’ll put a coverage check near the top of your snapshot." }
    },
    organization_interest: {
      id: "organization_interest",
      title: "Would you like to hear about worker-led support?",
      prompt: "This is entirely optional. Your answer is private and will not appear in the benefits-agent view.",
      type: "single",
      options: [option("yes", "Yes, I’m interested"), option("maybe", "Maybe, I’d like to learn more"), option("no", "Not right now")],
      replies: { yes: "I hear you. I’ll show options you can explore on your own terms.", maybe: "That’s completely fine. I’ll include low-pressure ways to learn more." }
    },
    organization_followup: {
      id: "organization_followup",
      title: "What kind of worker-led support sounds useful?",
      prompt: "Select anything you might want to explore. Nothing will be shared or sent.",
      type: "multiple",
      optional: true,
      options: [option("know_rights", "Learn about workplace rights"), option("meet_workers", "Talk with workers like me"), option("collective_support", "Explore collective support"), option("just_information", "Just get information for now")],
      replies: { know_rights: "I’ll keep the focus on practical information you can review privately." }
    }
  };

  const labels = {
    worker_type: "Type of work",
    neighborhood: "Borough",
    platforms: "Platforms / channels",
    rideshare_vehicle_costs: "Rideshare vehicle costs",
    rideshare_concerns: "Rideshare concerns",
    freelance_payments: "Client payments",
    freelance_projects: "Project work",
    schedule: "Work rhythm",
    income: "Income pattern",
    priorities: "Top priorities",
    healthcare_status: "Health coverage",
    healthcare_insured: "Coverage experience",
    healthcare_medicaid: "Medicaid renewal",
    healthcare_uninsured: "Coverage barrier",
    healthcare_unsure: "Coverage check",
    organization_interest: "Worker-led support",
    organization_followup: "Support interests"
  };

  const humanLabels = {
    worker_type: { food_delivery: "Food delivery", rideshare: "Rideshare", freelance: "Freelancing / creative", care: "Care / home services", other: "Other gig work" },
    neighborhood: { bronx: "The Bronx", brooklyn: "Brooklyn", manhattan: "Manhattan", queens: "Queens", staten_island: "Staten Island", varies: "Citywide / varies" },
    schedule: { full_time: "Most days, full-time", part_time: "Part-time around other work", on_demand: "On demand", seasonal: "Seasonal / project-based", changing: "Changes week to week" },
    income: { steady: "Fairly steady", some_swings: "Some ups and downs", very_variable: "Very unpredictable", prefer_not: "Prefer not to say" },
    healthcare_status: { insured: "Has coverage", uninsured: "Uninsured", medicaid: "Medicaid", unsure: "Unsure / may have changed" },
    healthcare_insured: { works: "Coverage works well", costly: "Costs are difficult", access: "Accessing care is difficult", coverage_change: "Coverage may change" },
    healthcare_medicaid: { renewal_yes: "Would like renewal help", renewal_no: "All set", renewal_unsure: "Unsure" },
    healthcare_uninsured: { cost_barrier: "Cost concerns", enrollment_barrier: "Enrollment guidance", eligibility_barrier: "Eligibility questions", coverage_not_needed: "Okay for now" },
    healthcare_unsure: { check_yes: "Would like a status check", check_later: "Maybe later", check_no: "No thanks" },
    platforms: {
      doordash: "DoorDash", uber_eats: "Uber Eats", grubhub: "Grubhub", other_delivery: "Other delivery app",
      uber: "Uber", lyft: "Lyft", other_rideshare: "Another rideshare app", direct_clients: "Direct clients",
      upwork: "Upwork or similar", creative_platform: "Creative marketplace", care_platform: "Care / home-service app",
      referrals: "Word of mouth / referrals", platform_apps: "One or more apps", multiple_channels: "A mix of channels"
    },
    rideshare_vehicle_costs: {
      fuel: "Fuel / charging", vehicle_payment: "Lease / loan payments", maintenance: "Repairs / maintenance",
      insurance: "Vehicle insurance", tolls_parking: "Tolls / parking", no_vehicle_costs: "No listed vehicle costs"
    },
    rideshare_concerns: {
      pay_changes: "Pay / rate changes", account_access: "Account access", passenger_safety: "Passenger safety",
      road_safety: "Route / road safety", benefits_access: "Benefits access"
    },
    freelance_payments: {
      paid_on_time: "Usually on time", sometimes_late: "Sometimes late", often_late: "Often late", project_disputes: "Changes / disputes"
    },
    freelance_projects: {
      recurring_clients: "Recurring clients", one_off_projects: "One-off projects", finding_projects: "Looking for projects", project_mix: "A mix"
    },
    organization_interest: { yes: "Interested", maybe: "Would like to learn more", no: "Not right now" },
    priorities: { healthcare: "Health coverage", pay: "Reliable pay", expenses: "Work expenses", taxes: "Taxes / records", safety: "Job safety", time: "Time control", support: "Someone to talk to" },
    organization_followup: { know_rights: "Workplace rights", meet_workers: "Peer connection", collective_support: "Collective support", just_information: "Information" }
  };

  function optionsFor(questionId, profile) {
    const question = questions[questionId];
    if (!question) return [];
    return question.optionsFor ? question.optionsFor(profile) : question.options;
  }

  function labelFor(questionId, value) {
    const map = humanLabels[questionId] || {};
    if (Array.isArray(value)) return value.map((item) => map[item] || item).join(", ");
    return map[value] || value || "Not provided";
  }

  function replyFor(questionId, value, profile) {
    const question = questions[questionId];
    if (!question) return "Thanks, that gives me helpful context.";
    if (question.replies) {
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) {
        if (question.replies[item]) return question.replies[item];
      }
    }
    if (questionId === "platforms" && profile.answers.worker_type === "rideshare" && Array.isArray(value) && value.includes("uber")) {
      return "Uber noted. Vehicle costs are a big part of rideshare take-home pay, so we’ll keep those in mind.";
    }
    if (questionId === "priorities") return "Thanks. I’ll bring those priorities into the recommendations.";
    if (questionId === "platforms") return "Got it. I’ll use that to tailor the work-related resources.";
    if (questionId === "organization_interest" && value === "no") return "Absolutely. We’ll keep your snapshot focused on benefits and practical support.";
    return "Thanks, that gives me helpful context.";
  }

  window.WorkerConversation = { questions, labels, humanLabels, optionsFor, labelFor, replyFor };
})();