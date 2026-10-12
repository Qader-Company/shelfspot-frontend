import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import ts from "typescript";

function loadService(response) {
  const requests = [];
  const client = Object.fromEntries(["get", "post"].map((method) => [method, async (...args) => {
    requests.push({ method, args });
    return { data: response };
  }]));
  const source = fs.readFileSync(new URL("./service.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, URLSearchParams, crypto: webcrypto,
    require: (id) => {
      assert.equal(id, "@/shared/lib/api/client");
      return { apiClient: client };
    },
  });
  return { service: exports, requests };
}

test("cancel variants expose reassignment and retain the current worker ID", async () => {
  for (const status of ["cancel", "canceled", "cancelled", "worker_cancelled", "company_cancelled"]) {
    const { service } = loadService({ data: { id: 11, status, assigned_worker_id: 7, assigned_worker: { name: "Worker" } } });
    const task = await service.getAdminRequest("11");
    assert.equal(task.status, "canceled", status);
    assert.equal(task.workerId, "7");
    assert.equal(task.worker, "Worker");
  }
  const { service } = loadService({ data: { id: 11, status: "cancel", worker: { id: 8, name: "Worker" } } });
  assert.equal((await service.getAdminRequest("11")).workerId, "8");
});

test("same-worker and new-worker reassignments both send worker_id to the task endpoint", async () => {
  const { service, requests } = loadService({ success: true });
  for (const workerId of ["7", "12"]) {
    await service.assignAdminRequest({ requestId: "11", merchandiserId: workerId });
    const request = requests.at(-1);
    assert.equal(request.method, "post");
    assert.equal(request.args[0], "/api/admin/tasks/11/reassign");
    assert.equal(request.args[1].get("worker_id"), workerId);
  }
});

test("worker selection reads the paginated workers list and handles availability flags", async () => {
  const { service, requests } = loadService({ data: { data: [
    { id: 7, full_name: "Available", is_available: "1" },
    { id: 8, name: "Busy", is_available: "0" },
  ], last_page: 3 } });
  const result = await service.getReassignmentWorkers(2, "Worker");
  assert.equal(requests[0].args[0], "/api/admin/workers/index");
  assert.equal(requests[0].args[1].params.page, 2);
  assert.equal(requests[0].args[1].params.search, "Worker");
  assert.equal(result.lastPage, 3);
  assert.equal(result.data[0].name, "Available");
  assert.equal(result.data[0].available, true);
  assert.equal(result.data[1].available, false);
});

test("rejected request execution preserves submitted fields, photos and product proof", async () => {
  const attachment = { id: 4, mime_type: "image/png", url: "https://example.test/proof.png", name: "Before", field: "before", collection: "proof" };
  const { service } = loadService({ data: {
    id: 11, status: "rejected", rejection_reason: "Missing items", started_at: "2026-10-12 09:00:00",
    services: [{ id: 2, service: { name: "Shelf check" }, products: [{ id: 3, product: { id: 9, name: "Product", sku: "SKU-9" }, product_details: { quantity: 5 } }],
      submission: { id: 1, form_data: { notes: "Checked shelves", shelf_count: 3 }, attachments: [attachment], completed_at: "2026-10-12 10:00:00" } }],
  } });
  const task = await service.getAdminRequest("11");
  assert.equal(task.status, "rejected");
  assert.equal(task.rejectionReason, "Missing items");
  assert.equal(task.services[0].execution.submission.form_data.notes, "Checked shelves");
  assert.equal(task.services[0].execution.submission.attachments[0].url, attachment.url);
  assert.equal(task.services[0].execution.products[0].product_details.quantity, 5);
  assert.equal(task.services[0].execution.service.name, "Shelf check");
});

test("reopening uses the admin task action and empty execution evidence remains renderable", async () => {
  const { service, requests } = loadService({ data: { id: 11, services: [{ id: 1, service: { name: "Check" } }] } });
  const task = await service.getAdminRequest("11");
  assert.equal(task.services[0].execution.submission, null);
  assert.equal(task.services[0].execution.attachments.length, 0);
  assert.equal(task.services[0].execution.products.length, 0);
  await service.reopenAdminRequest("11");
  assert.equal(requests.at(-1).method, "post");
  assert.equal(requests.at(-1).args[0], "/api/admin/tasks/11/reopen");
});
