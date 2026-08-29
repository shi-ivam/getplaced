import assert from "node:assert/strict";
import { runGeminiCoachTurn } from "./services/geminiCoachEngine.js";

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log("RUNNING AI COACH RESILIENCE TESTS");

const originalWarn = console.warn;
console.warn = () => {};

try {
  await test("cascades once per model and uses deterministic onboarding fallback", async () => {
    const requests = [];
    const injectedClient = {
      models: {
        generateContent: async (request) => {
          requests.push(request);
          throw new Error("503 UNAVAILABLE");
        },
      },
    };

    const result = await runGeminiCoachTurn({
      userMessage: "Google — SDE",
      user: { name: "Candidate" },
      injectedClient,
      isOnboarding: true,
      onboardingStep: 1,
      modelAttemptTimeoutMs: 50,
      responseBudgetMs: 500,
    });

    assert.equal(requests.length, 4);
    for (const request of requests) {
      assert.equal(request.config.httpOptions.retryOptions.attempts, 1);
      assert.ok(request.config.httpOptions.timeout <= 50);
      assert.ok(request.config.abortSignal instanceof AbortSignal);
    }
    assert.equal(result.modelUsed, "getPlacedAI-fallback");
    assert.equal(result.mutations.targetUpdated, true);
    assert.match(result.replyText, /Step 2: Academic Baseline/);
  });

  await test("enforces the overall response budget even when the client hangs", async () => {
    const injectedClient = {
      models: {
        generateContent: () => new Promise(() => {}),
      },
    };

    const startedAt = Date.now();
    const result = await runGeminiCoachTurn({
      userMessage: "skip",
      user: { name: "Candidate" },
      injectedClient,
      isOnboarding: true,
      onboardingStep: 2,
      modelAttemptTimeoutMs: 20,
      responseBudgetMs: 55,
    });
    const elapsedMs = Date.now() - startedAt;

    assert.ok(elapsedMs < 200, `Expected a bounded response, took ${elapsedMs}ms`);
    assert.equal(result.modelUsed, "getPlacedAI-fallback");
    assert.match(result.replyText, /Step 3: GitHub Proof of Work/);
  });

  await test("uses the next model immediately after a transient primary failure", async () => {
    const models = [];
    const injectedClient = {
      models: {
        generateContent: async (request) => {
          models.push(request.model);
          if (models.length === 1) throw new Error("503 UNAVAILABLE");
          return { text: "Fallback model response", functionCalls: [] };
        },
      },
    };

    const result = await runGeminiCoachTurn({
      userMessage: "Hello",
      user: { name: "Candidate" },
      injectedClient,
      modelAttemptTimeoutMs: 50,
      responseBudgetMs: 500,
    });

    assert.deepEqual(models, ["gemini-3.7-flash", "gemini-3.5-flash"]);
    assert.equal(result.modelUsed, "gemini-3.5-flash");
    assert.equal(result.replyText, "Fallback model response");
  });
} finally {
  console.warn = originalWarn;
}

console.log("AI COACH RESILIENCE TESTS PASSED");
