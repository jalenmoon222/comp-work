(function () {
  const storageKey = "worker-ally-demo-profile-v1";
  const blankProfile = () => ({
    answers: {},
    skipped: {},
    currentQuestion: "worker_type",
    completed: false,
    updatedAt: null
  });

  let profile = blankProfile();

  function persist() {
    profile.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch (error) {
      // The intake still works when browser storage is unavailable.
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      profile = saved && saved.answers && saved.skipped
        ? Object.assign(blankProfile(), saved)
        : blankProfile();
    } catch (error) {
      profile = blankProfile();
    }
    return get();
  }

  function setAnswer(questionId, value, clearQuestionIds) {
    (clearQuestionIds || []).forEach((id) => {
      delete profile.answers[id];
      delete profile.skipped[id];
    });
    profile.answers[questionId] = Array.isArray(value) ? value.slice() : value;
    delete profile.skipped[questionId];
    profile.completed = false;
    persist();
  }

  function skip(questionId, clearQuestionIds) {
    (clearQuestionIds || []).forEach((id) => {
      delete profile.answers[id];
      delete profile.skipped[id];
    });
    delete profile.answers[questionId];
    profile.skipped[questionId] = true;
    profile.completed = false;
    persist();
  }

  function setCurrentQuestion(questionId) {
    profile.currentQuestion = questionId;
    profile.completed = false;
    persist();
  }

  function markComplete() {
    profile.completed = true;
    profile.currentQuestion = null;
    persist();
  }

  function clear() {
    profile = blankProfile();
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      // Keep the in-memory reset even if browser storage is unavailable.
    }
    return get();
  }

  function get() {
    return JSON.parse(JSON.stringify(profile));
  }

  window.WorkerProfile = { load, get, setAnswer, skip, setCurrentQuestion, markComplete, clear };
})();