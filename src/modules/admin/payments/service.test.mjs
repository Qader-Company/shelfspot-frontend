import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadService(response) {
  const requests = [];
  const client = Object.fromEntries(["get", "post"].map((method) => [method, async (url, options) => {
    requests.push({ method, url, options });
    return { data: response };
  }]));
  const source = fs.readFileSync(new URL("./service.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (id) => {
      assert.equal(id, "@/shared/lib/api/client");
      return { apiClient: client };
    },
  });
  return { service: exports, requests };
}

const record = {
  id: 7,
  worker_id: 2,
  worker: { id: 2, name: "Test Worker", email: "worker@example.test" },
  amount: 50,
  payout_details: { iban: "SA1234567890123456789012" },
  created_at: "2026-10-06 12:00:00",
  status: "paid",
};

test("withdrawal tab receives renderable worker rows and correct summary and filter", async () => {
  const { service, requests } = loadService({
    success: true,
    data: {
      summary: { total_requests_count: 3, pending_requests_count: 1, paid_amount: 50 },
      withdrawals: { data: [record], meta: { current_page: 2, last_page: 3, per_page: 8, total: 20 } },
    },
  });
  const result = await service.getWithdrawals({ page: 2, status: "approved" });
  assert.equal(requests[0].url, "/api/admin/withdrawals");
  assert.equal(requests[0].options.params.status, "paid");
  assert.equal(result.data[0].merchandiser.name, "Test Worker");
  assert.equal(result.data[0].iban, record.payout_details.iban);
  assert.equal(result.data[0].date, record.created_at);
  assert.equal(result.data[0].status, "approved");
  assert.equal(result.summary.total_withdraw_requests, 3);
  assert.equal(result.summary.pending_withdraw_requests, 1);
  assert.equal(result.summary.total_withdraw, 50);
  assert.equal(result.meta.last_page, 3);
});

test("missing worker does not crash the tab; legacy rows still render", async () => {
  const legacy = { id: 8, merchandiser: record.worker, amount: 10, date: "2026-10-01", status: "pending" };
  const { service } = loadService({ success: true, data: {
    withdrawals: { data: [{ ...record, worker: null }, legacy], current_page: 1, last_page: 1 },
  } });
  const result = await service.getWithdrawals();
  assert.equal(result.data[0].merchandiser.name, "—");
  assert.equal(result.data[1].merchandiser.name, "Test Worker");
  assert.equal(result.data[1].date, legacy.date);
  assert.equal(result.data[1].status, "pending");
});

test("single and approved withdrawal responses use the same adapter", async () => {
  const { service } = loadService({ success: true, data: record });
  for (const result of [await service.getWithdrawal("7"), await service.approveWithdrawal("7")]) {
    assert.equal(result.merchandiser.name, "Test Worker");
    assert.equal(result.status, "approved");
  }
});
