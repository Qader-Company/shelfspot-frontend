import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import ts from "typescript";

function loadService(response) {
  const requests = [];
  const client = Object.fromEntries(["get", "post", "patch"].map((method) => [method, async (...args) => {
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
    assert.equal(request.method, "patch");
    assert.equal(request.args[0], "/api/admin/tasks/11/reassign");
    assert.equal(request.args[1].worker_id, Number(workerId));
    assert.equal(request.args[2].headers["Content-Type"], "application/json");
  }
});

test("both worker pickers read nested available workers for the current task and radius", async () => {
  const { service, requests } = loadService({ data: { radius_km: 100, workers: { data: [
    { id: 7, full_name: "Available Worker", is_available: "1", distance_km: 2.3 },
    { id: 8, name: "Busy Worker", is_available: "0" },
  ], last_page: 3 } } });
  const result = await service.getReassignmentWorkers("160", 100, 2, "Worker");
  assert.equal(requests[0].args[0], "/api/admin/tasks/160/available-workers");
  assert.equal(requests[0].args[1].params.radius_km, 100);
  assert.equal(requests[0].args[1].params.page, 2);
  assert.equal(requests[0].args[1].params.search, "Worker");
  assert.equal(result.lastPage, 3);
  assert.equal(result.data[0].name, "Available Worker");
  assert.equal(result.data[0].distanceKm, 2.3);
  assert.equal(result.data[0].available, true);
  assert.equal(result.data[1].available, false);
  await service.getReassignmentWorkers("161", 10, 1, "");
  assert.equal(requests[1].args[0], "/api/admin/tasks/161/available-workers");
  assert.equal(requests[1].args[1].params.radius_km, 10);
});

test("available worker search filters names and phones when the server returns unfiltered rows", async () => {
  const { service } = loadService({ data: { workers: { data: [{ id: 1, name: "Ahmed", phone: "123" }, { id: 2, name: "Sara", phone: "456" }] } } });
  const byName = await service.getReassignmentWorkers("160", 5, 1, "ahmed");
  assert.equal(byName.data.length, 1);
  assert.equal(byName.data[0].id, "1");
  const byPhone = await service.getReassignmentWorkers("160", 5, 1, "456");
  assert.equal(byPhone.data[0].id, "2");
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
  await service.reopenAdminRequest({ requestId: "11", workerId: "14", reason: "  Check the missing products  " });
  assert.equal(requests.at(-1).method, "post");
  assert.equal(requests.at(-1).args[0], "/api/admin/tasks/11/reopen");
  assert.equal(requests.at(-1).args[1].get("worker_id"), "14");
  assert.equal(requests.at(-1).args[1].get("reason"), "Check the missing products");
  assert.equal(requests.at(-1).args[2].headers["Content-Type"], "application/x-www-form-urlencoded");
});

test("reopening supports an empty optional reason and rejects a missing worker ID before sending", async () => {
  const { service, requests } = loadService({ success: true, data: { status: "in_progress" } });
  const result = await service.reopenAdminRequest({ requestId: "11", workerId: "14" });
  assert.equal(requests[0].args[1].get("reason"), "");
  assert.equal(requests[0].args[1].get("worker_id"), "14");
  assert.equal(result.data.status, "in_progress");
  await assert.rejects(service.reopenAdminRequest({ requestId: "11", workerId: "" }), /worker id field is required/);
  assert.equal(requests.length, 1);
});


test("invalid reassignment worker IDs do not send a request", async () => {
  const { service, requests } = loadService({ success: true });
  for (const workerId of ["", "not-an-id", "0", "-1", "1.5"]) {
    await assert.rejects(service.assignAdminRequest({ requestId: "161", merchandiserId: workerId }), /valid worker id/);
  }
  assert.equal(requests.length, 0);
});

test("admin task proxy forwards PATCH reassignment and preserves existing methods", async () => {
  const calls = [];
  const source = fs.readFileSync(new URL("../../../app/api/admin/tasks/[...segments]/route.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: (id) => {
    assert.equal(id, "@/shared/lib/api/proxy");
    return { proxyAdminRequest: async (request, path) => { calls.push({ request, path }); return "forwarded"; } };
  } });
  const request = { method: "PATCH", body: JSON.stringify({ worker_id: 14 }) };
  assert.equal(await exports.PATCH(request, { params: Promise.resolve({ segments: ["161", "reassign"] }) }), "forwarded");
  assert.equal(calls[0].request, request);
  assert.equal(calls[0].path, "/admin/tasks/161/reassign");
  for (const method of ["GET", "POST", "DELETE"]) assert.equal(typeof exports[method], "function");
});
