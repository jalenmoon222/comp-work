(function () {
  const messageList = document.getElementById("messageList");
  const chatScroll = document.getElementById("chatScroll");
  const choiceDock = document.getElementById("choiceDock");
  const choiceList = document.getElementById("choiceList");
  const choiceFooter = document.getElementById("choiceFooter");
  const resultsView = document.getElementById("resultsView");
  let profile = window.WorkerProfile.load();
  let selectedValues = [];
  let pending = false;

  function makeBotMessage(text, reply) {
    const message = document.createElement("div");
    message.className = "message bot";
    const avatar = document.createElement("span");
    avatar.className = "bot-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "wa";
    const content = document.createElement("div");
    content.className = "message-content";
    const label = document.createElement("span");
    label.className = "message-label";
    label.textContent = "Worker Ally";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    bubble.append(paragraph);
    content.append(label, bubble);
    if (reply) {
      const replyLine = document.createElement("div");
      replyLine.className = "message-reply";
      replyLine.textContent = reply;
      content.append(replyLine);
    }
    message.append(avatar, content);
    return message;
  }

  function makeUserMessage(text) {
    const message = document.createElement("div");
    message.className = "message user";
    const content = document.createElement("div");
    content.className = "message-content";
    const label = document.createElement("span");
    label.className = "message-label";
    label.textContent = "You";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    bubble.append(paragraph);
    content.append(label, bubble);
    message.append(content);
    return message;
  }

  function renderAnswerList(path) {
    const list = document.getElementById("answerList");
    const count = document.getElementById("answerCount");
    list.replaceChildren();
    const answered = path.filter((id) => Object.prototype.hasOwnProperty.call(profile.answers, id) || profile.skipped[id]);
    count.textContent = String(answered.length);
    if (!answered.length) {
      const empty = document.createElement("p");
      empty.className = "empty-notes";
      empty.textContent = "Your answers will collect here as we go.";
      list.append(empty);
      return;
    }
    answered.forEach((questionId) => {
      const row = document.createElement("div");
      row.className = "answer-item";
      const copy = document.createElement("div");
      copy.className = "answer-item-copy";
      const label = document.createElement("span");
      label.className = "answer-item-label";
      label.textContent = window.WorkerConversation.labels[questionId];
      const value = document.createElement("span");
      value.className = "answer-item-value";
      value.textContent = profile.skipped[questionId] ? "Skipped" : window.WorkerConversation.labelFor(questionId, profile.answers[questionId]);
      const edit = document.createElement("button");
      edit.className = "answer-edit";
      edit.type = "button";
      edit.dataset.editQuestion = questionId;
      edit.setAttribute("aria-label", "Change " + window.WorkerConversation.labels[questionId]);
      edit.title = "Change answer";
      edit.textContent = "↗";
      copy.append(label, value);
      row.append(copy, edit);
      list.append(row);
    });
  }

  function updateProgress() {
    const progress = window.WorkerBranching.getProgress(profile.answers, profile.skipped, profile.currentQuestion);
    const percent = profile.completed ? 100 : progress.percent;
    document.getElementById("progressFill").style.width = percent + "%";
    document.getElementById("progressText").textContent = percent + "%";
    const progressBar = document.getElementById("progressBar");
    progressBar.setAttribute("aria-valuenow", String(percent));
    document.getElementById("stepText").textContent = profile.completed ? "Snapshot ready" : "Step " + progress.step + " of " + progress.total;
    document.getElementById("conversationIndex").innerHTML = String(progress.step).padStart(2, "0") + " <span>/ " + String(progress.total).padStart(2, "0") + "</span>";
  }

  function renderConversation() {
    const currentProfile = window.WorkerProfile.get();
    profile = currentProfile;
    const path = window.WorkerBranching.getQuestionPath(profile.answers, profile.skipped);
    renderAnswerList(path);
    updateProgress();
    messageList.replaceChildren();
    messageList.append(makeBotMessage("Hi, I’m Worker Ally. I can help you sort through benefits and support options for gig work in NYC. This is a private demo: no AI service, referrals, or messages are sent."));

    let activeQuestion = null;
    for (const questionId of path) {
      const question = window.WorkerConversation.questions[questionId];
      const questionTitle = question.titleFor ? question.titleFor(profile) : question.title;
      messageList.append(makeBotMessage(questionTitle));
      if (!profile.completed && profile.currentQuestion === questionId) {
        activeQuestion = question;
        break;
      }
      if (Object.prototype.hasOwnProperty.call(profile.answers, questionId)) {
        const response = window.WorkerConversation.labelFor(questionId, profile.answers[questionId]);
        messageList.append(makeUserMessage(response));
        messageList.append(makeBotMessage(window.WorkerConversation.replyFor(questionId, profile.answers[questionId], profile)));
      } else if (profile.skipped[questionId]) {
        messageList.append(makeUserMessage("Skipped"));
      } else {
        activeQuestion = question;
        break;
      }
    }

    if (profile.completed || !activeQuestion) {
      if (!profile.completed) {
        window.WorkerProfile.markComplete();
        profile = window.WorkerProfile.get();
      }
      choiceDock.hidden = true;
      chatScroll.hidden = true;
      document.querySelector(".conversation-heading").hidden = true;
      resultsView.hidden = false;
      window.WorkerResults.render(profile);
      renderAnswerList(path);
      updateProgress();
      return;
    }

    profile.currentQuestion = activeQuestion.id;
    choiceDock.hidden = false;
    chatScroll.hidden = false;
    document.querySelector(".conversation-heading").hidden = false;
    resultsView.hidden = true;
    document.getElementById("conversationTitle").textContent = activeQuestion.titleFor ? activeQuestion.titleFor(profile) : activeQuestion.title;
    document.getElementById("choicePrompt").textContent = activeQuestion.promptFor ? activeQuestion.promptFor(profile) : activeQuestion.prompt;
    renderChoices(activeQuestion);
    window.WorkerProfile.setCurrentQuestion(activeQuestion.id);
    updateProgress();
    requestAnimationFrame(() => { chatScroll.scrollTop = chatScroll.scrollHeight; });
  }

  function renderChoices(question) {
    choiceList.replaceChildren();
    choiceFooter.replaceChildren();
    selectedValues = Array.isArray(profile.answers[question.id])
      ? profile.answers[question.id].slice()
      : (profile.answers[question.id] ? [profile.answers[question.id]] : []);
    const options = window.WorkerConversation.optionsFor(question.id, profile);
    options.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-chip";
      button.dataset.value = item.value;
      button.setAttribute("aria-pressed", String(selectedValues.includes(item.value)));
      if (question.type === "multiple") {
        const mark = document.createElement("span");
        mark.className = "chip-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.textContent = "✓";
        button.append(mark, document.createTextNode(item.label));
      } else {
        button.textContent = item.label;
      }
      button.addEventListener("click", () => chooseOption(question, item, button));
      choiceList.append(button);
    });

    if (question.type === "multiple") {
      const hint = document.createElement("span");
      hint.className = "multi-hint";
      hint.textContent = question.maxSelections ? "Choose up to " + question.maxSelections : "Choose all that apply";
      choiceFooter.append(hint);
      const actions = document.createElement("div");
      actions.className = "choice-actions";
      if (question.optional) actions.append(makeSkipButton(question.id));
      const continueButton = document.createElement("button");
      continueButton.type = "button";
      continueButton.className = "continue-button";
      continueButton.dataset.action = "continue";
      continueButton.textContent = "Continue →";
      continueButton.disabled = selectedValues.length === 0;
      continueButton.addEventListener("click", () => commitAnswer(question.id, selectedValues));
      actions.append(continueButton);
      choiceFooter.append(actions);
    } else {
      if (question.optional) {
        const hint = document.createElement("span");
        hint.className = "optional-hint";
        hint.textContent = "Optional";
        choiceFooter.append(hint, makeSkipButton(question.id));
      } else {
        const hint = document.createElement("span");
        hint.className = "optional-hint";
        hint.textContent = "Choose one to continue";
        choiceFooter.append(hint);
      }
    }
  }

  function makeSkipButton(questionId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "skip-button";
    button.textContent = "Skip this";
    button.addEventListener("click", () => {
      const downstream = window.WorkerBranching.getDownstreamQuestionIds(questionId, profile.answers, profile.skipped);
      window.WorkerProfile.skip(questionId, downstream);
      const next = window.WorkerBranching.getNextQuestionId(questionId, profile.answers);
      if (next) window.WorkerProfile.setCurrentQuestion(next);
      renderConversation();
    });
    return button;
  }

  function chooseOption(question, option, button) {
    if (pending) return;
    if (question.type === "multiple") {
      const selected = selectedValues.includes(option.value);
      if (selected) {
        selectedValues = selectedValues.filter((value) => value !== option.value);
      } else {
        if (question.maxSelections && selectedValues.length >= question.maxSelections) return;
        selectedValues.push(option.value);
      }
      button.setAttribute("aria-pressed", String(!selected));
      const continueButton = choiceFooter.querySelector("[data-action='continue']");
      if (continueButton) continueButton.disabled = selectedValues.length === 0;
      return;
    }
    button.setAttribute("aria-pressed", "true");
    button.classList.add("is-committing");
    choiceList.querySelectorAll("button").forEach((chip) => { chip.disabled = true; });
    pending = true;
    window.setTimeout(() => {
      pending = false;
      commitAnswer(question.id, option.value);
    }, 220);
  }

  function commitAnswer(questionId, answer) {
    const downstream = window.WorkerBranching.getDownstreamQuestionIds(questionId, profile.answers, profile.skipped);
    window.WorkerProfile.setAnswer(questionId, answer, downstream);
    const updated = window.WorkerProfile.get();
    const next = window.WorkerBranching.getNextQuestionId(questionId, updated.answers);
    if (next) {
      window.WorkerProfile.setCurrentQuestion(next);
    } else {
      window.WorkerProfile.markComplete();
    }
    renderConversation();
  }

  document.getElementById("answerList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-question]");
    if (!button) return;
    window.WorkerProfile.setCurrentQuestion(button.dataset.editQuestion);
    profile = window.WorkerProfile.get();
    renderConversation();
  });

  document.getElementById("resetButton").addEventListener("click", () => {
    if (!window.confirm("Clear this intake and start over?")) return;
    profile = window.WorkerProfile.clear();
    pending = false;
    renderConversation();
  });

  resultsView.addEventListener("click", (event) => {
    if (!event.target.closest("[data-action='edit-intake']")) return;
    const lastQuestion = window.WorkerBranching.getQuestionPath(profile.answers, profile.skipped).slice(-1)[0];
    if (lastQuestion) window.WorkerProfile.setCurrentQuestion(lastQuestion);
    renderConversation();
  });

  renderConversation();
})();