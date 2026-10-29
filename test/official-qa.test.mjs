import test from 'node:test';
import assert from 'node:assert/strict';
import { run_official_qa } from '../worker/official-qa.mjs';
const valid = { QA_RUN_ID: 'pr56-test-expiry', QA_EXPIRES_AT: String(Date.now() + 600000) };

test('QA privada requiere opt-in válido y vencimiento acotado antes de acceder a secretos o red', async () => {
    const services = { create_database() { throw new Error('must not run'); } };
    for (const env of [{}, { ...valid, QA_EXPIRES_AT: '1' }, { ...valid, QA_EXPIRES_AT: String(Date.now() + 3600000) }, { ...valid, QA_RUN_ID: 'invalid' }]) {
        assert.equal(await run_official_qa(env, () => assert.fail(), services), null);
    }
});

test('QA bloquea registro/escrituras si falla lectura directa o SDK del candidato', async () => {
    for (const [label, raw, sdk] of [['direct', 401, true], ['sdk', 200, false]]) {
        let calls = 0;
        const report = await run_official_qa({ ...valid, QA_RUN_ID: `pr56-test-${label}` }, () => { calls++; }, {
            create_database: () => ({}), log() {},
            diagnose: async () => ({ raw_apikey_only: { status: raw }, candidate_sdk: { succeeded: sdk }, project_key_pair: 'not_verified' })
        });
        assert.equal(calls, 0);
        assert.equal(report.status, 'FAIL');
        assert.equal(report.failed_check, 'candidate-direct-sdk-read');
    }
});

test('un error privado del proveedor nunca aparece en el reporte ni se repite el run', async () => {
    const env = { ...valid, QA_RUN_ID: 'pr56-test-redaction', SUPABASE_SECRET_KEY: 'fixture-private-value', DREAMS_QA_ADMIN_PASSWORD: 'fixture-password-value' };
    const services = { create_database: () => ({}), log() {}, diagnose: async () => { throw new Error(env.SUPABASE_SECRET_KEY + env.DREAMS_QA_ADMIN_PASSWORD); } };
    const report = await run_official_qa(env, () => assert.fail(), services);
    assert.equal(report.status, 'FAIL');
    assert.equal(report.failed_check, 'runtime_or_provider_failure');
    assert.ok(!JSON.stringify(report).includes(env.SUPABASE_SECRET_KEY));
    assert.ok(!JSON.stringify(report).includes(env.DREAMS_QA_ADMIN_PASSWORD));
    assert.equal(await run_official_qa(env, () => assert.fail(), services), null);
});

test('fallo al construir el cliente también se reporta sin volcar credenciales', async () => {
    const env = { ...valid, QA_RUN_ID: 'pr56-test-factory-error', SUPABASE_SECRET_KEY: 'fixture-private-constructor' };
    const report = await run_official_qa(env, () => assert.fail(), {
        create_database() { throw new Error(env.SUPABASE_SECRET_KEY); }, log() {}
    });
    assert.equal(report.status, 'FAIL');
    assert.ok(!JSON.stringify(report).includes(env.SUPABASE_SECRET_KEY));
});

test('una clave pública no habilita altas aunque pueda leer el catálogo público', async () => {
    let calls = 0;
    const report = await run_official_qa({ ...valid, QA_RUN_ID: 'pr56-test-public-key' }, () => { calls++; }, {
        create_database: () => ({}), log() {}, diagnose: async () => ({
            shape: { kind: 'publishable' }, raw_apikey_only: { status: 200 },
            candidate_sdk: { status: 200, succeeded: true }, project_key_pair: 'verified_by_read'
        })
    });
    assert.equal(calls, 0);
    assert.equal(report.status, 'FAIL');
    assert.equal(report.failed_check, 'server-key-type');
});
