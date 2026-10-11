import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import axios from "axios";
import ts from "typescript";

function load(url, dependencies) {
  const exports = {};
  const source = fs.readFileSync(url, "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, {
    exports, require: (id) => dependencies[id],
  });
  return exports;
}
const apiErrors = load(new URL("../../../shared/lib/api/errors.ts", import.meta.url), { axios });
const { merchandiserFormErrors } = load(new URL("./form-errors.ts", import.meta.url), { "@/shared/lib/api/errors": apiErrors });
const apiError = (status, errors) => ({ isAxiosError: true, message: `Request failed with status code ${status}`, response: { status, data: { errors }, headers: {} } });

for (const locale of ["en", "ar"]) {
  const messages = JSON.parse(fs.readFileSync(new URL(`../../../i18n/messages/${locale}.json`, import.meta.url), "utf8")).adminDashboard.merchandisers.form;
  const t = (key) => {
    const value = key.split(".").reduce((obj, part) => obj?.[part], messages);
    assert.equal(typeof value, "string", `Missing ${locale} translation: ${key}`);
    return value;
  };
  test(`${locale}: duplicate email and phone attach to fields`, () => {
    const result = merchandiserFormErrors(apiError(422, { "user.email": ["The email has already been taken."], phone: ["validation.unique"] }), t);
    assert.equal(result.fieldErrors.email, t("errors.emailExists"));
    assert.equal(result.fieldErrors.phone, t("errors.phoneExists"));
  });
  test(`${locale}: other field failures and unknown backend fields are handled`, () => {
    const result = merchandiserFormErrors(apiError(422, { name: ["required"], password: ["min"], password_confirmation: ["confirmed"], unexpected: ["SQL exception"] }), t);
    assert.equal(result.fieldErrors.fullName, t("errors.fullName"));
    assert.equal(result.fieldErrors.temporaryPassword, t("errors.temporaryPassword"));
    assert.equal(result.fieldErrors.confirmPassword, t("errors.confirmPassword"));
    assert.equal(result.message, t("errors.validation"));
  });
  test(`${locale}: HTTP and network failures never display transport or internal messages`, () => {
    for (const [status, key] of [[401,"session"],[403,"permission"],[404,"notFound"],[409,"conflict"],[422,"validation"],[429,"rateLimit"],[500,"server"],[503,"server"],[0,"network"]]) {
      assert.equal(merchandiserFormErrors(apiError(status), t).message, t(`errors.${key}`));
    }
    assert.equal(merchandiserFormErrors(apiError(400), t).message, t("saveError"));
  });
}
