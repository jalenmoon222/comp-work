(function () {
  function getNextQuestionId(questionId, answers) {
    switch (questionId) {
      case "worker_type": return "neighborhood";
      case "neighborhood": return "platforms";
      case "platforms": {
        if (answers.worker_type === "rideshare") return "rideshare_vehicle_costs";
        if (answers.worker_type === "freelance") return "freelance_payments";
        return "schedule";
      }
      case "rideshare_vehicle_costs": return "rideshare_concerns";
      case "rideshare_concerns": return "schedule";
      case "freelance_payments": return "freelance_projects";
      case "freelance_projects": return "schedule";
      case "schedule": return "income";
      case "income": return "priorities";
      case "priorities": return "healthcare_status";
      case "healthcare_status": {
        const status = answers.healthcare_status;
        if (status === "insured") return "healthcare_insured";
        if (status === "medicaid") return "healthcare_medicaid";
        if (status === "uninsured") return "healthcare_uninsured";
        if (status === "unsure") return "healthcare_unsure";
        return null;
      }
      case "healthcare_insured":
      case "healthcare_medicaid":
      case "healthcare_uninsured":
      case "healthcare_unsure": return "organization_interest";
      case "organization_interest":
        return answers.organization_interest === "yes" || answers.organization_interest === "maybe"
          ? "organization_followup"
          : null;
      case "organization_followup": return null;
      default: return null;
    }
  }

  function getQuestionPath(answers, skipped) {
    const path = [];
    let questionId = "worker_type";
    let guard = 0;
    while (questionId && guard < 20) {
      path.push(questionId);
      const answered = Object.prototype.hasOwnProperty.call(answers, questionId);
      if (!answered && !(skipped && skipped[questionId])) break;
      questionId = getNextQuestionId(questionId, answers);
      guard += 1;
    }
    return path;
  }

  function getDownstreamQuestionIds(questionId, answers, skipped) {
    const path = getQuestionPath(answers, skipped);
    const index = path.indexOf(questionId);
    return index < 0 ? [] : path.slice(index + 1);
  }

  function getProgress(answers, skipped, currentQuestion) {
    const path = getQuestionPath(answers, skipped);
    const count = path.filter((id) => Object.prototype.hasOwnProperty.call(answers, id) || (skipped && skipped[id])).length;
    const workFollowups = answers.worker_type === "rideshare" || answers.worker_type === "freelance" ? 2 : 0;
    const organizationFollowup = answers.organization_interest === "yes" || answers.organization_interest === "maybe" ? 1 : 0;
    const total = 9 + workFollowups + organizationFollowup;
    const activeIndex = currentQuestion ? Math.max(0, path.indexOf(currentQuestion)) : count;
    const percent = currentQuestion ? Math.round((activeIndex / total) * 100) : Math.round((count / total) * 100);
    return { count, total, percent: Math.min(percent, 100), step: Math.min(activeIndex + 1, total) };
  }

  window.WorkerBranching = { getNextQuestionId, getQuestionPath, getDownstreamQuestionIds, getProgress };
})();